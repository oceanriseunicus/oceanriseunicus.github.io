/* layout.js – shared NAV LINKS + FOOTER for the ORUS Portal (edit ONLY here).
   Needs config.js loaded first. Load it at the end of <body>, before api.js.
   Pages must contain:  <nav class="links" id="links"></nav>  and  <button id="bg"> (burger). */
(function () {
  // FIX: "const CONFIG" in config.js is NOT available as window.CONFIG,
  // so read it directly, and keep safe fallbacks for contact details.
  const C = Object.assign(
    {
      SITE_ROOT: "../",
      LOGO: "../assets/images/Logo.jpeg",
      COMPANY: "OCEANRISE UNICUS",
      MAIL: "oceanrise.unicus@gmail.com",
      PHONE: "+91-8349243485",
      WA: "918349243485"
    },
    typeof CONFIG !== "undefined" ? CONFIG : {}
  );
  const R = C.SITE_ROOT || "../";

  const pages = [
    [R + "index.html", "Home"],
    [R + "about.html", "About"],
    [R + "services.html", "Services"],
    [R + "contact.html", "Contact"],
    ["index.html", "ORUS Portal", true] // current section
  ];

  const social = [
    ["Instagram", "https://www.instagram.com/oceanriseunicus/", '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'],
    ["GitHub", "https://github.com/oceanriseunicus", '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'],
    ["WhatsApp", "https://wa.me/" + C.WA, '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'],
    ["YouTube", "#", '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>'],
    ["LinkedIn", "#", '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'],
    ["Facebook", "#", '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>']
  ];

  /* ---------- navbar links ---------- */
  const links = document.getElementById("links");
  if (links) {
    links.innerHTML = pages
      .map(([h, n, on]) => `<a href="${h}"${on ? ' class="on" aria-current="page"' : ""}>${n}</a>`)
      .join("");
    const burger = document.getElementById("bg");
    if (burger) {
      burger.addEventListener("click", e => {
        e.stopPropagation();
        const open = links.classList.toggle("open");
        burger.setAttribute("aria-expanded", open);
        burger.textContent = open ? "✕" : "☰";
      });
      document.addEventListener("click", e => {
        if (!links.contains(e.target) && links.classList.contains("open")) {
          links.classList.remove("open");
          burger.textContent = "☰";
          burger.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  /* ---------- footer ---------- */
  const socialHtml = social
    .map(([n, u, p]) => `<a href="${u}" target="_blank" rel="noopener noreferrer" aria-label="${n}" title="${n}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></a>`)
    .join("");

  const quick = pages.map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join("");
  const telHref = String(C.PHONE).replace(/[^\d+]/g, "");

  document.body.insertAdjacentHTML("beforeend", `
<footer class="site-footer">
  <div class="wrap">
    <div class="fgrid-f">
      <div>
        <div class="fb"><img src="${C.LOGO}" alt="" onerror="this.style.display='none'"><h3>${C.COMPANY}</h3></div>
        <p>Education re-imagined; excellence redefined. We build AI &amp; Robotics labs and skilling programs for institutes.</p>
        <div class="soc">${socialHtml}</div>
      </div>
      <div>
        <h3>Quick links</h3>
        <ul>${quick}</ul>
      </div>
      <div>
        <h3>Contact</h3>
        <ul>
          <li>📧 <a href="mailto:${C.MAIL}">${C.MAIL}</a></li>
          <li>📞 <a href="tel:${telHref}">${C.PHONE}</a></li>
          <li>💬 <a href="https://wa.me/${C.WA}" target="_blank" rel="noopener">Chat on WhatsApp</a></li>
        </ul>
      </div>
    </div>
    <p class="copy">© ${new Date().getFullYear()} Oceanrise Unicus (ORUS) – Partum Solutions. All rights reserved.</p>
  </div>
</footer>`);
})();