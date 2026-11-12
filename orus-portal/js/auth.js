(function () {
  const $ = id => document.getElementById(id);
  let emailUsed = "";

  // Already logged in? go to dashboard
  (async function () {
    if (localStorage.getItem("orus_token")) {
      const r = await api("check");
      if (r.ok) location.replace("dashboard.html");
      else if (r.error === "unauthorized") localStorage.removeItem("orus_token");
    }
  })();

  // Show / hide password
  $("togglePass").addEventListener("click", () => {
    const input = $("password");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    $("togglePass").querySelector(".eye-on").classList.toggle("hidden", show);
    $("togglePass").querySelector(".eye-off").classList.toggle("hidden", !show);
    $("togglePass").setAttribute("aria-label", show ? "Hide password" : "Show password");
    input.focus();
  });

  // Step 1: email + password
  $("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("err1").textContent = "";
    const btn = $("loginBtn");
    btn.disabled = true; btn.textContent = "Checking…";
    emailUsed = $("email").value.trim();
    const r = await api("login", { email: emailUsed, password: $("password").value });
    btn.disabled = false; btn.textContent = "Login";
    if (!r.ok) { $("err1").textContent = r.error || "Login failed"; return; }
    $("sentTo").textContent = emailUsed;
    $("loginForm").classList.add("hidden");
    $("codeForm").classList.remove("hidden");
    $("code").focus();
  });

  // Step 2: OTP
  $("codeForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("err2").textContent = "";
    const code = $("code").value.trim();
    if (!code) { $("err2").textContent = "Please enter the code."; return; }
    const btn = $("verifyBtn");
    btn.disabled = true; btn.textContent = "Verifying…";
    const r = await api("verify", { email: emailUsed, code });
    btn.disabled = false; btn.textContent = "Verify & Continue";
    if (!r.ok) { $("err2").textContent = r.error || "Invalid code"; return; }
    localStorage.setItem("orus_token", r.token);
    location.replace("dashboard.html");
  });

  // Back
  $("backBtn").addEventListener("click", () => {
    $("codeForm").classList.add("hidden");
    $("loginForm").classList.remove("hidden");
    $("code").value = "";
    $("password").value = "";
    $("password").type = "password";
    $("togglePass").querySelector(".eye-on").classList.remove("hidden");
    $("togglePass").querySelector(".eye-off").classList.add("hidden");
  });
})();
