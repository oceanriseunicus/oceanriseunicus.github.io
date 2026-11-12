(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- field definitions ---------- */
  const PAY_MODES = ["Cash", "UPI", "Cheque", "Bank Transfer", "NEFT / RTGS", "Card", "Online"];
  const STATUSES = ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"];
  const CONDITIONS = ["New", "Good", "Used", "Damaged"];

  const F = {
    order:        { l: "Order" },
    quotation:    { l: "Quotation" },
    po:           { l: "PO" },
    material:     { l: "Material", list: [] },
    condition:    { l: "Condition", list: CONDITIONS },
    deliveryDate: { l: "Delivery Date", t: "date" },
    paymentDate:  { l: "Payment Date", t: "date" },
    paymentMode:  { l: "Payment Mode", list: PAY_MODES },
    status:       { l: "Status", list: STATUSES },
    trainingDate: { l: "Training Date", t: "date" },
    trainer:      { l: "Trainer Name", list: [] },
    school:       { l: "School Name", list: [] },
    amount:       { l: "Amount (₹)", t: "num" },
    otherAmount:  { l: "Other Amount (₹)", t: "num" },
    notes:        { l: "Other / Notes", t: "area" }
  };
  const ADMIN_SECTIONS = [
    ["Order details", ["order", "quotation", "po", "material", "condition"]],
    ["Delivery & payment", ["deliveryDate", "paymentDate", "paymentMode", "status"]],
    ["Training", ["trainingDate", "trainer", "school"]],
    ["Amount", ["amount", "otherAmount"]],
    ["Other", ["notes"]]
  ];
  const ADMIN_COLS = [
    ["order", "Order"], ["quotation", "Quotation"], ["po", "PO"], ["material", "Material"], ["condition", "Condition"],
    ["deliveryDate", "Delivery", "d"], ["paymentDate", "Payment Date", "d"], ["paymentMode", "Pay Mode"], ["status", "Status", "s"],
    ["trainingDate", "Training Date", "d"], ["trainer", "Trainer"], ["school", "School"],
    ["amount", "Amount", "n"], ["otherAmount", "Other Amt", "n"], ["total", "Total", "n"], ["notes", "Notes"]
  ];
  const TRAINER_COLS = [["trainingDate", "Date", "d"], ["school", "School"], ["trainer", "Trainer"], ["notes", "Other"]];

  /* ---------- state ---------- */
  let user = null, isAdmin = false;
  let records = [], trainers = [];
  let editing = null;      // record being edited (admin) or null
  let editingTrainer = null;
  const S = {
    tab: "records", view: "cards", mode: "all", day: "", month: "", year: "", recent: 7,
    from: "", to: "", q: "", status: "", trainer: "", sort: "desc"
  };
  try { S.view = localStorage.getItem("orus_view") || "cards"; } catch (e) {}

  /* ---------- helpers ---------- */
  const pad = n => String(n).padStart(2, "0");
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmt = s => {
    if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return s || "";
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const money = n => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const total = r => num(r.amount) + num(r.otherAmount);
  const pdate = r => r.trainingDate || r.deliveryDate || r.paymentDate || (r.created || "").slice(0, 10);
  const dates = r => {
    const a = [r.trainingDate, r.deliveryDate, r.paymentDate].filter(Boolean);
    return a.length ? a : [(r.created || "").slice(0, 10)];
  };
  const uniq = arr => [...new Set(arr.map(x => String(x || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  function toast(msg, err) {
    const t = $("#toast"); t.textContent = msg; t.classList.toggle("err", !!err); t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 3000);
  }
  function statusClass(s) {
    s = String(s || "").toLowerCase();
    if (/complete|paid|deliver|done|success/.test(s)) return "ok";
    if (/cancel|reject|fail/.test(s)) return "bad";
    if (/pend|hold|wait/.test(s)) return "warn";
    return "info";
  }
  const statusPill = s => s ? `<span class="pill ${statusClass(s)}">${esc(s)}</span>` : "";

  /* ---------- init ---------- */
  (async function init() {
    if (!localStorage.getItem("orus_token")) return location.replace("index.html");
    const now = new Date();
    S.day = ymd(now);
    S.month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    S.year = String(now.getFullYear());
    $("#fDay").value = S.day; $("#fMonth").value = S.month; $("#fYear").value = S.year;
    $("#fRecent").value = S.recent;

    $("#list").innerHTML = '<div class="empty-state">Loading…</div>';
    const c = await api("check");
    if (!c.ok) {
      $("#list").innerHTML = `<div class="empty-state">${esc(c.error || "Could not connect")}</div>`;
      return;
    }
    user = c; isAdmin = c.role === "admin";
    setupUI();
    await loadAll();
  })();

  function setupUI() {
    $("#roleBadge").textContent = isAdmin ? "Admin" : "Trainer";
    $("#uName").textContent = user.name;
    $("#uEmail").textContent = user.email;
    $$("[data-admin]").forEach(el => el.classList.toggle("hidden", !isAdmin));
    $("#pageTitle").textContent = isAdmin ? "Admin Dashboard" : "Trainer Dashboard";
    $("#addLabel").textContent = isAdmin ? "Add Record" : "Add Training";
    $("#pageSub").textContent = isAdmin
      ? "All orders, payments and trainings in one place."
      : `Welcome, ${user.name}. Your training entries are sent to the admin instantly.`;
    $$("#views button").forEach(b => b.classList.toggle("active", b.dataset.view === S.view));
  }

  async function loadAll() {
    const r = await api("list");
    if (!r.ok) { $("#list").innerHTML = `<div class="empty-state">${esc(r.error || "Could not load data")}</div>`; return; }
    records = r.records;
    if (isAdmin) {
      const t = await api("trainers");
      if (t.ok) trainers = t.trainers;
    }
    fillFilters();
    render();
  }

  /* ---------- filtering ---------- */
  function getFiltered() {
    let list = records.slice();
    const today = ymd(new Date());
    const any = fn => r => dates(r).some(fn);
    switch (S.mode) {
      case "day": if (S.day) list = list.filter(any(d => d === S.day)); break;
      case "month": if (S.month) list = list.filter(any(d => d.startsWith(S.month))); break;
      case "year": if (S.year) list = list.filter(any(d => d.startsWith(S.year + "-"))); break;
      case "recent": {
        const n = Math.max(1, parseInt(S.recent) || 1);
        const d = new Date(); d.setDate(d.getDate() - (n - 1));
        const from = ymd(d);
        list = list.filter(any(x => x >= from && x <= today));
        break;
      }
      case "range":
        if (S.from) list = list.filter(any(d => d >= S.from));
        if (S.to) list = list.filter(any(d => d <= S.to));
        break;
    }
    if (S.status) list = list.filter(r => r.status === S.status);
    if (S.trainer) list = list.filter(r => r.trainer === S.trainer);
    const q = S.q.trim().toLowerCase();
    if (q) list = list.filter(r => Object.values(r).join(" ").toLowerCase().includes(q));
    const dir = S.sort === "asc" ? 1 : -1;
    list.sort((a, b) => dir * (pdate(a).localeCompare(pdate(b)) || String(a.created).localeCompare(String(b.created))));
    return list;
  }

  function label() {
    switch (S.mode) {
      case "day": return S.day ? fmt(S.day) : "Day";
      case "month": {
        if (!S.month) return "Month";
        const [y, m] = S.month.split("-").map(Number);
        return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      }
      case "year": return `Year ${S.year}`;
      case "recent": return `Last ${S.recent || 1} day(s)`;
      case "range": return `${S.from ? fmt(S.from) : "Start"} to ${S.to ? fmt(S.to) : "Today"}`;
      default: return "All records";
    }
  }

  function fillFilters() {
    if (!isAdmin) return;
    const fill = (sel, vals, key) => {
      const el = $(sel), cur = S[key];
      el.innerHTML = '<option value="">All</option>' + vals.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
      el.value = vals.includes(cur) ? cur : "";
      S[key] = el.value;
    };
    fill("#fStatus", uniq(records.map(r => r.status)), "status");
    fill("#fTrainer", uniq(records.map(r => r.trainer)), "trainer");
  }

  /* ---------- rendering ---------- */
  function render() {
    const trainersTab = S.tab === "trainers";
    $("#recordsView").classList.toggle("hidden", trainersTab);
    $("#trainersView").classList.toggle("hidden", !trainersTab);
    $("#pdfBtn").classList.toggle("hidden", trainersTab);
    $("#addLabel").textContent = trainersTab ? "Add Trainer" : (isAdmin ? "Add Record" : "Add Training");
    if (trainersTab) return renderTrainers();

    const list = getFiltered();
    $("#resultsTitle").textContent = label();
    $("#resultsCount").textContent = `${list.length} ${list.length === 1 ? "entry" : "entries"}`;
    $$("#views button").forEach(b => b.classList.toggle("active", b.dataset.view === S.view));
    renderStats(list);

    const box = $("#list");
    if (!list.length) { box.innerHTML = '<div class="empty-state">No records found for this filter.</div>'; return; }
    box.innerHTML = S.view === "ledger" ? ledgerHTML(list) : list.map(cardHTML).join("");
  }

  function renderStats(list) {
    const schools = new Set(list.map(r => r.school.trim().toLowerCase()).filter(Boolean)).size;
    let items;
    if (isAdmin) {
      items = [
        [list.length, "Records"], [schools, "Schools"],
        ["₹ " + money(list.reduce((n, r) => n + num(r.amount), 0)), "Total Amount"],
        ["₹ " + money(list.reduce((n, r) => n + num(r.otherAmount), 0)), "Other Amount"]
      ];
    } else {
      const mon = S.month || ymd(new Date()).slice(0, 7);
      items = [
        [list.length, "Trainings"], [schools, "Schools"],
        [records.filter(r => (r.trainingDate || "").startsWith(ymd(new Date()).slice(0, 7))).length, "This month"]
      ];
    }
    $("#stats").innerHTML = items.map(([n, l]) => `<div class="stat"><span class="stat-n">${esc(n)}</span><span class="stat-l">${l}</span></div>`).join("");
  }

  function kv(l, v, full) {
    return v ? `<div class="${full ? "full" : ""}"><label>${l}</label><p>${esc(v)}</p></div>` : "";
  }

  function cardHTML(r) {
    if (!isAdmin) {
      return `<article class="rec card">
        <div class="rec-head"><h3>${esc(r.school)}</h3><span class="chip">${fmt(r.trainingDate)}</span></div>
        <div class="kv">${kv("Trainer", r.trainer)}${kv("Other", r.notes, true)}</div>
      </article>`;
    }
    const title = r.order ? "Order: " + r.order : (r.school || r.material || "Entry");
    const t = total(r);
    return `<article class="rec card">
      <div class="rec-head">
        <h3>${esc(title)}</h3>
        <div class="chips">${statusPill(r.status)}${r.source === "trainer" ? '<span class="chip">Trainer entry</span>' : ""}<span class="chip">${fmt(pdate(r))}</span></div>
      </div>
      <div class="kv">
        ${kv("Quotation", r.quotation)}${kv("PO", r.po)}${kv("Material", r.material)}${kv("Condition", r.condition)}
        ${kv("Delivery Date", fmt(r.deliveryDate))}${kv("Payment Date", fmt(r.paymentDate))}${kv("Payment Mode", r.paymentMode)}
        ${kv("Training Date", fmt(r.trainingDate))}${kv("Trainer", r.trainer)}${kv("School", r.school)}
        ${r.amount ? kv("Amount", "₹ " + money(num(r.amount))) : ""}${r.otherAmount ? kv("Other Amount", "₹ " + money(num(r.otherAmount))) : ""}
        ${t ? kv("Total", "₹ " + money(t)) : ""}
        ${kv("Other / Notes", r.notes, true)}
      </div>
      <div class="rec-foot">
        <span class="muted small" style="margin:0">${r.source === "trainer" ? "Added by trainer: " + esc(r.addedBy) : "Added by admin"}</span>
        <button class="btn sm o" data-edit="${esc(r.id)}">✎ Edit</button>
      </div>
    </article>`;
  }

  function cell(r, c) {
    const [k, , t] = c;
    if (k === "total") { const v = total(r); return `<td class="num">${v ? money(v) : ""}</td>`; }
    const v = r[k];
    if (t === "n") return `<td class="num">${v !== "" ? money(num(v)) : ""}</td>`;
    if (t === "d") return `<td class="nw">${fmt(v)}</td>`;
    if (t === "s") return `<td>${statusPill(v)}</td>`;
    return `<td>${esc(v)}</td>`;
  }

  function ledgerHTML(list) {
    const cols = isAdmin ? ADMIN_COLS : TRAINER_COLS;
    const head = `<th class="sn">#</th>` + cols.map(c => `<th${c[2] === "n" ? ' class="num"' : ""}>${c[1]}</th>`).join("") + (isAdmin ? "<th></th>" : "");
    const rows = list.map((r, i) =>
      `<tr><td class="sn">${i + 1}</td>${cols.map(c => cell(r, c)).join("")}${isAdmin ? `<td class="nw"><button class="btn sm o" data-edit="${esc(r.id)}">Edit</button></td>` : ""}</tr>`).join("");
    let foot = "";
    if (isAdmin) {
      const ai = cols.findIndex(c => c[0] === "amount");
      const a = list.reduce((n, r) => n + num(r.amount), 0), o = list.reduce((n, r) => n + num(r.otherAmount), 0);
      foot = `<tfoot><tr><td colspan="${ai + 1}" style="text-align:right">TOTAL</td><td class="num">${money(a)}</td><td class="num">${money(o)}</td><td class="num">${money(a + o)}</td><td colspan="${cols.length - ai - 3 + 1}"></td></tr></tfoot>`;
    }
    return `<div class="tw"><table class="ledger"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody>${foot}</table></div>`;
  }

  /* ---------- trainers tab ---------- */
  function renderTrainers() {
    $("#tCount").textContent = `${trainers.length} trainer${trainers.length === 1 ? "" : "s"}`;
    const box = $("#tlist");
    if (!trainers.length) { box.innerHTML = '<div class="empty-state">No trainers yet. Click “Add Trainer”.</div>'; return; }
    const cnt = e => records.filter(r => r.source === "trainer" && (r.addedBy || "").toLowerCase() === e).length;
    box.innerHTML = `<div class="tw"><table class="ledger"><thead><tr><th class="sn">#</th><th>Name</th><th>Email</th><th class="num">Entries</th><th>Added</th><th></th></tr></thead><tbody>` +
      trainers.map((t, i) => `<tr><td class="sn">${i + 1}</td><td>${esc(t.name)}</td><td>${esc(t.email)}</td><td class="num">${cnt(t.email)}</td><td class="nw">${fmt((t.created || "").slice(0, 10))}</td>
        <td class="nw"><button class="btn sm o" data-tedit="${esc(t.email)}">Edit</button> <button class="btn sm danger" data-tdel="${esc(t.email)}">Delete</button></td></tr>`).join("") +
      `</tbody></table></div>`;
  }

  /* ---------- filter UI ---------- */
  $("#modes").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    S.mode = b.dataset.mode;
    $$("#modes button").forEach(x => x.classList.toggle("active", x === b));
    $$(".f-group[data-for]").forEach(g => g.classList.toggle("hidden", g.dataset.for !== S.mode));
    render();
  });
  const bind = (id, key) => $(id).addEventListener("input", e => { S[key] = e.target.value; render(); });
  bind("#fDay", "day"); bind("#fMonth", "month"); bind("#fYear", "year"); bind("#fRecent", "recent");
  bind("#fFrom", "from"); bind("#fTo", "to"); bind("#fSearch", "q");
  bind("#fStatus", "status"); bind("#fTrainer", "trainer"); bind("#fSort", "sort");

  $("#views").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    S.view = b.dataset.view;
    try { localStorage.setItem("orus_view", S.view); } catch (err) {}
    render();
  });

  $("#tabs").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    S.tab = b.dataset.tab;
    $$("#tabs button").forEach(x => x.classList.toggle("active", x === b));
    render();
  });

  /* ---------- profile / logout ---------- */
  $("#profileBtn").addEventListener("click", e => { e.stopPropagation(); $("#profileMenu").classList.toggle("hidden"); });
  document.addEventListener("click", e => { if (!e.target.closest("#profileMenu")) $("#profileMenu").classList.add("hidden"); });
  $("#logoutBtn").addEventListener("click", async () => {
    await api("logout");
    localStorage.removeItem("orus_token");
    location.replace("index.html");
  });

  /* ---------- entry modal (add / edit) ---------- */
  const openModal = () => $("#modal").classList.remove("hidden");
  const closeModal = () => $("#modal").classList.add("hidden");
  $("#closeModal").addEventListener("click", closeModal);
  $("#cancelModal").addEventListener("click", closeModal);
  $("#modal").addEventListener("mousedown", e => { if (e.target.id === "modal") closeModal(); });

  function suggestions(k) {
    const base = (F[k].list || []).slice();
    if (k === "trainer") return uniq([...base, ...trainers.map(t => t.name), ...records.map(r => r.trainer)]);
    return uniq([...base, ...records.map(r => r[k])]);
  }

  function fieldHTML(k, val, o = {}) {
    const f = F[k], id = "f_" + k, l = o.label || f.l, req = o.required ? "required" : "";
    const full = f.t === "area" ? " full" : "";
    let inp;
    if (f.t === "area") inp = `<textarea class="input" id="${id}" name="${k}" maxlength="1000" ${req}>${esc(val)}</textarea>`;
    else if (f.t === "date") inp = `<input class="input" type="date" id="${id}" name="${k}" value="${esc(val)}" ${req}>`;
    else if (f.t === "num") inp = `<input class="input" type="number" id="${id}" name="${k}" value="${esc(val)}" min="0" step="0.01" inputmode="decimal" placeholder="0.00">`;
    else if (f.list) inp = `<input class="input" id="${id}" name="${k}" value="${esc(val)}" list="dl_${k}" maxlength="200" autocomplete="off" ${req}><datalist id="dl_${k}">${suggestions(k).map(v => `<option value="${esc(v)}">`).join("")}</datalist>`;
    else inp = `<input class="input" id="${id}" name="${k}" value="${esc(val)}" maxlength="200" autocomplete="off" ${req}>`;
    return `<div class="${full.trim()}"><label class="lbl" for="${id}">${l}</label>${inp}</div>`;
  }

  function openEntry(rec) {
    editing = rec || null;
    $("#formErr").textContent = "";
    const body = $("#formBody");
    if (isAdmin) {
      $("#modalTitle").textContent = rec ? "Edit Record" : "Add Record";
      body.innerHTML = ADMIN_SECTIONS.map(([t, keys]) =>
        `<div class="fsec">${t}</div><div class="fgrid">${keys.map(k => fieldHTML(k, rec ? rec[k] : "")).join("")}</div>`).join("");
      if (!rec) { /* nothing prefilled for admin */ }
    } else {
      $("#modalTitle").textContent = "Add Training Entry";
      body.innerHTML = `<div class="fgrid">
        ${fieldHTML("trainingDate", ymd(new Date()), { label: "Date", required: true })}
        ${fieldHTML("school", "", { required: true })}
        ${fieldHTML("trainer", user.name, { required: true })}
        ${fieldHTML("notes", "", { label: "Other" })}
      </div>`;
    }
    $("#saveBtn").textContent = rec ? "Update" : "Save";
    openModal();
  }

  $("#addBtn").addEventListener("click", () => { S.tab === "trainers" ? openTrainer(null) : openEntry(null); });

  $("#list").addEventListener("click", e => {
    const b = e.target.closest("[data-edit]"); if (!b || !isAdmin) return;
    const rec = records.find(r => r.id === b.dataset.edit);
    if (rec) openEntry(rec);
  });

  $("#entryForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("#formErr").textContent = "";
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (isAdmin && !(data.order || "").trim() && !(data.school || "").trim() && !(data.material || "").trim()) {
      $("#formErr").textContent = "Enter at least Order, Material or School name."; return;
    }
    const btn = $("#saveBtn"), txt = btn.textContent;
    btn.disabled = true; btn.textContent = "Saving…";
    const r = await api(editing ? "update" : "add", editing ? { id: editing.id, ...data } : data);
    btn.disabled = false; btn.textContent = txt;
    if (!r.ok) { $("#formErr").textContent = r.error || "Could not save"; return; }
    if (editing) records = records.map(x => x.id === r.record.id ? r.record : x);
    else records.push(r.record);
    closeModal(); fillFilters(); render();
    toast(editing ? "Record updated ✓" : "Saved ✓ – visible to admin");
  });

  /* ---------- trainer modal (admin) ---------- */
  const closeT = () => $("#tmodal").classList.add("hidden");
  $("#closeT").addEventListener("click", closeT);
  $("#cancelT").addEventListener("click", closeT);
  $("#tmodal").addEventListener("mousedown", e => { if (e.target.id === "tmodal") closeT(); });

  function openTrainer(t) {
    editingTrainer = t || null;
    $("#tErr").textContent = "";
    $("#tTitle").textContent = t ? "Edit Trainer" : "Add Trainer";
    $("#tName").value = t ? t.name : "";
    $("#tEmail").value = t ? t.email : "";
    $("#tPass").value = "";
    $("#tPass").required = !t;
    $("#tPassHint").textContent = t ? "Leave password empty to keep the current one." : "Share this email and password with the trainer. Login also needs an OTP sent to this email.";
    $("#tmodal").classList.remove("hidden");
  }

  $("#tlist").addEventListener("click", async e => {
    const ed = e.target.closest("[data-tedit]"), del = e.target.closest("[data-tdel]");
    if (ed) { const t = trainers.find(x => x.email === ed.dataset.tedit); if (t) openTrainer(t); }
    if (del) {
      const t = trainers.find(x => x.email === del.dataset.tdel); if (!t) return;
      if (!confirm(`Delete trainer "${t.name}"?\nTheir old entries will stay in the records.`)) return;
      del.disabled = true;
      const r = await api("trainerDelete", { email: t.email });
      if (!r.ok) { del.disabled = false; return toast(r.error || "Could not delete", true); }
      trainers = trainers.filter(x => x.email !== t.email);
      render(); toast("Trainer deleted");
    }
  });

  $("#trainerForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("#tErr").textContent = "";
    const btn = $("#saveT"); btn.disabled = true; btn.textContent = "Saving…";
    const body = { name: $("#tName").value.trim(), email: $("#tEmail").value.trim(), password: $("#tPass").value };
    const r = await api(editingTrainer ? "trainerUpdate" : "trainerAdd", editingTrainer ? { id: editingTrainer.email, ...body } : body);
    btn.disabled = false; btn.textContent = "Save Trainer";
    if (!r.ok) { $("#tErr").textContent = r.error || "Could not save"; return; }
    closeT();
    const t = await api("trainers"); if (t.ok) trainers = t.trainers;
    if (editingTrainer && editingTrainer.email !== body.email.toLowerCase()) await loadAll(); else render();
    toast(editingTrainer ? "Trainer updated ✓" : "Trainer added ✓");
  });

  /* ---------- PDF (ledger format) ---------- */
  function loadLogo() {
    return new Promise(res => {
      const i = new Image();
      i.onload = () => {
        try {
          const c = document.createElement("canvas"); c.width = i.width; c.height = i.height;
          c.getContext("2d").drawImage(i, 0, 0);
          res(c.toDataURL("image/jpeg", 0.9));
        } catch (e) { res(null); }
      };
      i.onerror = () => res(null);
      i.src = CONFIG.LOGO;
    });
  }

  $("#pdfBtn").addEventListener("click", async () => {
    const list = getFiltered();
    if (!list.length) return toast("No data to download", true);
    if (!window.jspdf) return toast("PDF library not loaded. Check internet.", true);
    const btn = $("#pdfBtn"), span = $("span", btn);
    btn.disabled = true; span.textContent = "Preparing…";
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: isAdmin ? "landscape" : "portrait", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
      const cols = (isAdmin ? ADMIN_COLS.filter(c => c[0] !== "notes") : TRAINER_COLS);
      const rs = v => "Rs " + money(v);

      doc.setFillColor(140, 198, 63); doc.rect(0, 0, W, 22, "F");
      const logo = await loadLogo();
      let tx = 10;
      if (logo) { doc.addImage(logo, "JPEG", 8, 3, 16, 16); tx = 28; }
      doc.setTextColor(7, 16, 10); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
      doc.text(CONFIG.APP_NAME, tx, 11);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
      doc.text(`${label()}  |  ${list.length} entr${list.length === 1 ? "y" : "ies"}  |  ${isAdmin ? "Admin ledger" : "Trainer: " + user.name}`, tx, 17.5);

      const head = [["#", ...cols.map(c => c[1])]];
      const body = list.map((r, i) => [i + 1, ...cols.map(c => {
        const [k, , t] = c;
        if (k === "total") return total(r) ? money(total(r)) : "";
        if (t === "d") return fmt(r[k]);
        if (t === "n") return r[k] !== "" ? money(num(r[k])) : "";
        return r[k] || "";
      })]);
      const colStyles = {};
      cols.forEach((c, i) => { if (c[2] === "n") colStyles[i + 1] = { halign: "right" }; });

      let foot;
      if (isAdmin) {
        const ai = cols.findIndex(c => c[0] === "amount") + 1;
        const a = list.reduce((n, r) => n + num(r.amount), 0), o = list.reduce((n, r) => n + num(r.otherAmount), 0);
        foot = [[{ content: "TOTAL", colSpan: ai, styles: { halign: "right" } }, rs(a), rs(o), rs(a + o)]];
      }

      doc.autoTable({
        startY: 28, head, body, foot, theme: "grid", showFoot: "lastPage",
        styles: { fontSize: isAdmin ? 6.6 : 9, cellPadding: isAdmin ? 1.5 : 2.2, textColor: [30, 40, 30], lineColor: [200, 215, 190], lineWidth: 0.1, overflow: "linebreak" },
        headStyles: { fillColor: [79, 138, 16], textColor: 255, fontStyle: "bold" },
        footStyles: { fillColor: [232, 242, 220], textColor: [40, 80, 10], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [246, 250, 241] },
        columnStyles: colStyles,
        margin: { left: 8, right: 8, bottom: 14 }
      });

      const pages = doc.getNumberOfPages();
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p); doc.setFontSize(8); doc.setTextColor(130);
        doc.text(`${CONFIG.APP_NAME}  -  Page ${p} of ${pages}`, W / 2, H - 6, { align: "center" });
      }
      doc.save(`${CONFIG.APP_NAME.replace(/\s+/g, "_")}_${label().replace(/[^a-z0-9]+/gi, "_")}.pdf`);
      toast("PDF downloaded ✓");
    } catch (err) {
      console.error(err); toast("Could not create PDF", true);
    }
    btn.disabled = false; span.textContent = "Download PDF";
  });
})();
