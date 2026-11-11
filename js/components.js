/* ===================================================================
   components.js  —  SHARED PARTS OF THE WEBSITE (edit ONLY here)
   Navbar, footer, loader (drone) and robot guide are built from this
   one file, so any change shows on ALL pages automatically.
   TO CHANGE SOCIAL LINKS: edit the `social` list in SITE below.
   =================================================================== */
const SITE = {
  name: 'ORUS', full: 'OCEANRISE UNICUS', logo: 'assets/images/Logo.jpeg',
  mail: 'oceanrise.unicus@gmail.com', phone: '+91-8349243485', wa: '918349243485',
  about: "Education re-imagined; excellence redefined. We build AI & Robotics labs and skilling programs for institutes.",
  pages: [['index.html', 'Home'], ['about.html', 'About'], ['services.html', 'Services'], ['contact.html', 'Contact']],
  /* name, link (replace '#' with your real profile URL), icon */
  social: [
    ['Instagram', 'https://www.instagram.com/oceanriseunicus/', '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'],
    ['YouTube', '#', '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>'],
    ['GitHub', 'https://github.com/oceanriseunicus', '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'],
    ['LinkedIn', '#', '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'],
    ['Facebook', '#', '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'],
    ['WhatsApp', 'https://wa.me/918349243485', '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>']
  ]
};
(function () {
  let t = 'dark';
  try { t = localStorage.getItem('orus-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); } catch (e) {}
  document.documentElement.dataset.theme = t;
  const cur = location.pathname.split('/').pop() || 'index.html';
  const links = SITE.pages.map(([h, n]) => `<a href="${h}" class="${h === cur ? 'on' : ''}">${n}</a>`).join('');
  const social = SITE.social.map(([n, u, p]) => `<a href="${u}" target="_blank" rel="noopener noreferrer" aria-label="${n}" title="${n}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></a>`).join('');
  const drone = `<svg id="drone" viewBox="0 0 200 110"><g fill="#8cc63f"><rect x="40" y="20" width="120" height="6" rx="3" fill="#6b7"/><ellipse class="rot" cx="40" cy="18" rx="30" ry="5"/><ellipse class="rot" cx="160" cy="18" rx="30" ry="5"/></g><path d="M45 24 L85 55M155 24 L115 55" stroke="#ddd" stroke-width="5"/><rect x="70" y="48" width="60" height="30" rx="14" fill="#fff"/><circle cx="100" cy="63" r="9" fill="#111"/><circle cx="100" cy="63" r="4" fill="#8cc63f"/><path d="M80 90h40M85 78v12M115 78v12" stroke="#8cc63f" stroke-width="4"/></svg>`;
  const robot = `<svg viewBox="0 0 100 120" id="rbt"><line x1="50" y1="6" x2="50" y2="20" stroke="#8cc63f" stroke-width="4"/><circle cx="50" cy="6" r="5" fill="#8cc63f"/><rect x="18" y="20" width="64" height="48" rx="16" fill="#fff" stroke="#8cc63f" stroke-width="4"/><rect x="26" y="30" width="48" height="28" rx="12" fill="#101410"/><circle cx="40" cy="44" r="6" fill="#8cc63f"/><circle cx="60" cy="44" r="6" fill="#8cc63f"/><rect x="28" y="74" width="44" height="36" rx="12" fill="#8cc63f"/><circle cx="50" cy="92" r="7" fill="#fff"/><rect x="10" y="76" width="14" height="26" rx="7" fill="#fff" stroke="#8cc63f" stroke-width="3"/><rect x="76" y="76" width="14" height="26" rx="7" fill="#fff" stroke="#8cc63f" stroke-width="3"/></svg>`;
  document.body.insertAdjacentHTML('afterbegin', `<div id="bar"></div><div id="glow"></div>
<div id="loader"><div class="door"></div><div class="door"></div>${drone}<div class="lt"><b>${SITE.name}</b>BOOTING SYSTEM…<s></s></div></div>
<header><div class="nav"><a class="brand" href="index.html"><img src="${SITE.logo}" alt="${SITE.name} logo"><span>${SITE.name}<small>${SITE.full}</small></span></a>
<nav class="links" id="links">${links}</nav><div class="tools"><button class="ib" id="th" aria-label="Dark / light mode"></button><button class="ib burger" id="bg" aria-label="Menu">☰</button></div></div></header>`);
  document.body.insertAdjacentHTML('beforeend', `<footer><div class="wrap"><div class="grid">
<div><div class="fb"><img src="${SITE.logo}" alt=""><h3 style="margin:0">${SITE.full}</h3></div><p>${SITE.about}</p><div class="soc">${social}</div></div>
<div><h3>Quick links</h3><ul>${SITE.pages.map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></div>
<div><h3>Contact</h3><ul><li>📧 <a href="mailto:${SITE.mail}">${SITE.mail}</a></li><li>📞 <a href="tel:${SITE.phone}">${SITE.phone}</a></li><li>💬 <a href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></li></ul></div></div>
<p class="copy">© ${new Date().getFullYear()} Oceanrise Unicus (ORUS) – Partum Solutions. All rights reserved.</p></div></footer>
<button class="ib" id="top" aria-label="Back to top">↑</button><div id="robot"><div id="bub" class="hide"></div>${robot}</div>`);
})();