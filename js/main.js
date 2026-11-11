/* main.js – page behaviour (needs components.js loaded first) */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* theme toggle */
const th = $('#th'), icon = () => th.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
icon();
th.onclick = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('orus-theme', t); } catch (e) {} icon(); };
$('#bg').onclick = () => $('#links').classList.toggle('open');
$$('#links a').forEach(a => a.onclick = () => $('#links').classList.remove('open'));
$('#top').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
addEventListener('scroll', () => { const h = document.documentElement; $('#bar').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; $('#top').classList.toggle('show', h.scrollTop > 500); }, { passive: true });

/* cursor glow + 3D tilt on cards */
const glow = $('#glow');
addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });
if (matchMedia('(hover:hover)').matches) $$('.card').forEach(c => {
  c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`; });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});

/* image placeholders: label stays until a real image loads */
$$('.imgbox img').forEach(i => { i.onerror = () => i.remove(); if (i.complete && !i.naturalWidth) i.remove(); });

/* typing animation */
let tk = 0;
function typeText(el, txt, speed = 28) { const id = ++tk; el.textContent = ''; let i = 0; (function s() { if (id !== tk) return; el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(s, speed); })(); }
const tl = $('[data-typing]');
if (tl) { const w = tl.dataset.typing.split('|'); let wi = 0, ci = 0, del = false; tl.classList.add('cur');
  (function loop() { const word = w[wi]; ci += del ? -1 : 1; tl.textContent = word.slice(0, ci); let d = del ? 40 : 90;
    if (!del && ci === word.length) { del = true; d = 1500; } else if (del && ci === 0) { del = false; wi = (wi + 1) % w.length; d = 400; } setTimeout(loop, d); })(); }

/* scroll reveal, pop, counters */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; const el = e.target; el.classList.add('in'); io.unobserve(el);
  if (el.dataset.count) { const n = +el.dataset.count; let c = 0; const t = setInterval(() => { c += Math.ceil(n / 40); if (c >= n) { c = n; clearInterval(t); } el.textContent = c + (el.dataset.suf || ''); }, 40); }
}), { threshold: .15 });
$$('.reveal,.pop,[data-count]').forEach((el, i) => { if (el.classList.contains('pop')) el.style.animationDelay = (i % 6) * .08 + 's'; io.observe(el); });

/* robot guide: types a message about the section on screen */
const bub = $('#bub'); let muted = false, last = null;
function say(t) { if (muted || !t || t === last) return; last = t; bub.classList.remove('hide'); typeText(bub, '🤖 ' + t, 22); }
$('#rbt').onclick = () => { muted = !muted; bub.classList.toggle('hide', muted); if (!muted) { last = null; say('I am back! Keep scrolling and I will guide you.'); } };
const rio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.intersectionRatio > .35 && say(e.target.dataset.say)), { threshold: [.35, .6] });
$$('[data-say]').forEach(s => rio.observe(s));

/* loader: drone arrives, then opens the doors (once per session) */
const L = $('#loader'); let seen = false;
try { seen = sessionStorage.getItem('orus-seen') === '1'; sessionStorage.setItem('orus-seen', '1'); } catch (e) {}
const hello = document.body.dataset.hello || 'Hi! I am the ORUS robot. Scroll down and I will show you around.';
if (seen) { L.remove(); setTimeout(() => say(hello), 600); }
else setTimeout(() => { L.classList.add('open'); setTimeout(() => { L.remove(); say(hello); }, 1100); }, 2800);

/* contact form -> WhatsApp */
const f = $('#cf');
if (f) f.onsubmit = e => { e.preventDefault(); const d = new FormData(f), v = k => encodeURIComponent(d.get(k));
  window.open(`https://wa.me/${SITE.wa}?text=Hello Oceanrise Unicus!%0A*Name:* ${v('name')}%0A*Email:* ${v('email')}%0A*Phone:* ${v('phone')}%0A*Message:* ${v('message')}`, '_blank');
  $('#ok').textContent = '✅ Opening WhatsApp… press send there to deliver your message.'; f.reset(); };
