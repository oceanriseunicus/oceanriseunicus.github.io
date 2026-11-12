/* Theme toggle (dark / light) + app name + logo. Load AFTER config.js */
(function () {
  const KEY = "orus-theme"; // same key as the main website
  const SUN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  const initial = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", initial);

  function paint() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(b => {
      b.innerHTML = dark ? SUN : MOON;
      b.title = dark ? "Switch to light mode" : "Switch to dark mode";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    paint();
    document.querySelectorAll("[data-theme-toggle]").forEach(b =>
      b.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        paint();
      })
    );

    // app name + logo from config.js
    document.querySelectorAll("[data-app-name]").forEach(el => (el.textContent = CONFIG.APP_NAME));
    document.querySelectorAll("[data-tagline]").forEach(el => (el.textContent = CONFIG.TAGLINE));
    document.querySelectorAll("img[data-logo]").forEach(img => {
      img.onerror = () => { img.style.display = "none"; };
      img.src = CONFIG.LOGO;
    });
    document.title = document.title.replace("{app}", CONFIG.APP_NAME);
    const ic = document.querySelector('link[rel="icon"]');
    if (ic) ic.href = CONFIG.LOGO;
  });
})();
