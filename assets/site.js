/* BooBoard site. Runs only on this page, loads nothing from anywhere else. */
/* =========================================================================
   Boo: exact port of BooShape / BooMotion / BooPainter (booboard_mascot.dart)
   ========================================================================= */
const B = 116;
function bodyPath(w, lean) {
  const sway = 2.2 * lean, ph = (k) => w * 2.4 - k * 1.25;
  const lx = 6 + sway, rx = 94 + sway;
  const [x1, x2, x3] = [21, 50, 79].map((x, k) => x + sway + 1.6 * Math.sin(ph(k)));
  const [t1, t2, t3] = [0, 1, 2].map((k) => B + 9 + 3.6 * Math.sin(ph(k)));
  const [vx1, vx2] = [35.5, 64.5].map((x, k) => x + sway + 1.0 * Math.sin(ph(k + 0.5) - 0.4));
  const [v1, v2] = [0, 1].map((k) => B - 2 + 1.6 * Math.sin(ph(k + 0.5) - 0.6));
  const f = (n) => +n.toFixed(2);
  return `M${f(lx)} ${B}C${f(lx + 2)} ${B - 24} ${f(13 + sway * .3)} 73 14 50C14 22 30 4 50 4C70 4 86 22 86 50C${f(87 + sway * .3)} 73 ${f(rx - 2)} ${B - 24} ${f(rx)} ${B}`
    + `C${f(rx)} ${B + 5} ${f(x3 + 9)} ${f(t3)} ${f(x3)} ${f(t3)}C${f(x3 - 7)} ${f(t3)} ${f(vx2 + 7)} ${f(v2)} ${f(vx2)} ${f(v2)}`
    + `C${f(vx2 - 7)} ${f(v2)} ${f(x2 + 7)} ${f(t2)} ${f(x2)} ${f(t2)}C${f(x2 - 7)} ${f(t2)} ${f(vx1 + 7)} ${f(v1)} ${f(vx1)} ${f(v1)}`
    + `C${f(vx1 - 7)} ${f(v1)} ${f(x1 + 7)} ${f(t1)} ${f(x1)} ${f(t1)}C${f(x1 - 9)} ${f(t1)} ${f(lx)} ${B + 5} ${f(lx)} ${B}Z`;
}

const mq = matchMedia('(prefers-reduced-motion: reduce)');
const RM = () => mq.matches;   // only the phone or computer's own reduce-motion setting
const vis = new WeakMap();
const waiters = new Map();
const io = new IntersectionObserver((es) => {
  for (const e of es) {
    vis.set(e.target, e.isIntersecting);
    if (e.isIntersecting && waiters.has(e.target)) { waiters.get(e.target).forEach((f) => f()); waiters.delete(e.target); }
  }
}, { rootMargin: '120px' });
function whenVisible(el) {
  if (vis.get(el)) return Promise.resolve();
  return new Promise((r) => { const a = waiters.get(el) || []; a.push(r); waiters.set(el, a); });
}

const boos = [];
function mountBoo(host, { size = 150, look = 0, label = '' } = {}) {
  const id = 'boo' + boos.length;
  host.innerHTML = `<svg viewBox="-10 -6 120 153" width="${Math.round(size * 1.2)}" height="${Math.round(size * 1.53)}" style="overflow:visible" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
    <defs>
      <radialGradient id="${id}s" cx="34%" cy="22%" r="80%"><stop offset="0" stop-color="#4A4247"/><stop offset=".45" stop-color="#211B20"/><stop offset="1" stop-color="#0E0A0D"/></radialGradient>
      <radialGradient id="${id}r" cx="85%" cy="60%" r="45%"><stop offset="0" stop-color="#E3F794" stop-opacity=".22"/><stop offset="1" stop-color="#E3F794" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse class="sh" cx="50" cy="142" rx="30" ry="4.5" fill="rgba(22,16,21,.24)"/>
    <g class="g"><path class="bp" fill="url(#${id}s)"/><path class="br" fill="url(#${id}r)"/>
      <g class="e">
        <ellipse cx="36" cy="50" rx="9" ry="12.5" fill="#E3F794"/><ellipse cx="33" cy="45" rx="2.6" ry="3.4" fill="#fff" opacity=".7"/>
        <ellipse cx="64" cy="50" rx="9" ry="12.5" fill="#E3F794"/><ellipse cx="61" cy="45" rx="2.6" ry="3.4" fill="#fff" opacity=".7"/>
      </g></g></svg>`;
  const q = (s) => host.querySelector(s);
  const b = { host, look, phase: boos.length * 1.7, g: q('.g'), p: q('.bp'), r: q('.br'), e: q('.e'), sh: q('.sh'), still: false };
  boos.push(b); io.observe(host); paintBoo(b, 0, true);
  return b;
}
function paintBoo(b, t, still) {
  const w = still ? 0 : t + b.phase;
  const bob = still ? 1 : Math.sin(w * 1.85), lean = still ? 0 : Math.sin(w * 0.9);   // still = BooMotion.still (bob 1 = resting low)
  const d = bodyPath(w, lean);
  b.p.setAttribute('d', d); b.r.setAttribute('d', d);
  const sx = 1 - 0.035 * Math.abs(lean) + 0.02 * bob, sy = 1 - 0.02 * bob;
  b.g.setAttribute('transform', `translate(0 ${(-6 * (1 - bob)).toFixed(2)}) translate(50 66) rotate(${(4 * lean).toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(-50 -66)`);
  b.e.setAttribute('transform', `translate(${(5 * lean + 4 * b.look).toFixed(2)} ${(-1.2 * bob + 4 * (b.lookY || 0)).toFixed(2)})`);
  const up = (1 - bob) / 2;
  b.sh.setAttribute('rx', (30 - 6 * up).toFixed(2));
  b.sh.setAttribute('fill', `rgba(22,16,21,${(0.24 - 0.09 * up).toFixed(3)})`);
}
function booTick(now) {
  const t = now / 1000, rm = RM();
  for (const b of boos) {
    if (rm) { if (!b.still) { paintBoo(b, 0, true); b.still = true; } continue; }
    b.still = false;
    if (vis.get(b.host)) paintBoo(b, t, false);
  }
  requestAnimationFrame(booTick);
}
requestAnimationFrame(booTick);

const booGlyph = `<svg viewBox="0 0 100 134" aria-hidden="true"><path d="${bodyPath(0, 0)}" fill="#E3F794"/><ellipse cx="36" cy="50" rx="9" ry="12.5" fill="#161015"/><ellipse cx="64" cy="50" rx="9" ry="12.5" fill="#161015"/></svg>`;

/* =========================================================================
   Phone + placeholder keyboard
   ========================================================================= */
const ROWS = ['qwertyuiop', 'asdfghjkl', '⇧zxcvbnm⌫'];
function kbHTML(lang = 'English') {
  const row = (s, pad) => `<div class="row" ${pad ? 'style="padding:0 calc((100% - 36px) / 20)"' : ''}>${[...s].map((c) =>
    c === '⇧' ? `<b class="k fn" data-k="shift"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 4l8 8h-5v7H9v-7H4z"/></svg></b>`
    : c === '⌫' ? `<b class="k fn" data-k="back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 5h12v14H8l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/></svg></b>`
    : `<b class="k" data-k="${c}">${c}</b>`).join('')}</div>`;
  const micSvg = (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>`;
  return `<div class="kb"><div class="strip"><span></span><span></span><span></span><i class="micb">${micSvg(18, 'currentColor')}</i></div>
    <div class="vo"><div class="mic sm">${micSvg(26, '#E3F794')}</div><div class="wave">${Array.from({ length: 14 }, (_, i) => `<i style="animation-delay:${(i * 83) % 600}ms;animation-duration:${700 + (i * 137) % 500}ms"></i>`).join('')}</div><div><b>Listening</b> · offline · English</div></div>
    <div class="rows">${row(ROWS[0])}${row(ROWS[1], true)}${row(ROWS[2])}
      <div class="row"><b class="k fn">?123</b><b class="k" data-k=",">,</b><b class="k sp" data-k=" "><span class="spl">${lang}</span></b><b class="k" data-k=".">.</b><b class="k act" data-k="enter"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 5v6a3 3 0 0 1-3 3H5m0 0l4-4m-4 4l4 4"/></svg></b></div>
    </div>
    <svg class="trail"></svg><div class="popkey"></div><div class="lang-chip"></div>
    <div class="gesture"><i></i></div></div>`;
}
function phoneHTML(inner) {
  return `<div class="screen"><div class="sbar"><span>9:41</span><span>● ● ▮</span></div>${inner}</div>`;
}

/* ---------- hero: island scene. Boo (real BooMotion) keeps the internet cloud away from the girl ---------- */
const island = document.getElementById('island');
const islBoo = (() => {
  const q = (s) => island.querySelector(s);
  // look/lookY steer the eyes: down-left = watching the girl, up-right = watching the cloud
  const b = { host: island, look: -1.6, lookY: 0.8, phase: 0.9, g: q('.boo .g'), p: q('.bp'), r: q('.br'), e: q('.boo .e'), sh: q('.sh'), still: false };
  boos.push(b); io.observe(island); paintBoo(b, 0, true);
  return b;
})();
const islGuard = document.getElementById('islGuard'), islCloud = document.getElementById('islCloud'), islBurst = document.getElementById('islBurst');
// keyframes over one 8 s loop: [time 0..1, values...], eased between neighbours
const KF = {
  cloud: [[0, 220, -24, 0, 1, 1, 0], [.1, 196, -16, 0, 1, 1, 1], [.46, -18, 52, 0, 1, 1, 1], [.51, -10, 48, 0, .9, 1.1, 1], [.63, 50, 18, 12, 1, 1, 1], [.82, 240, -30, 16, 1, 1, 0], [1, 240, -30, 16, 1, 1, 0]],
  guard: [[0, 0, 0, 0], [.36, 0, 0, 0], [.47, 26, -46, 9], [.56, 26, -46, 9], [.7, 0, 0, 0], [1, 0, 0, 0]],
  look: [[0, -1.6, .8], [.08, -1.6, .8], [.16, 2.2, -1.4], [.62, 2.2, -1.4], [.74, -1.6, .8], [1, -1.6, .8]],
  burst: [[0, 0, .4], [.44, 0, .4], [.48, 1, 1], [.58, 0, 1.25], [1, 0, 1.25]],
};
const ease = (x) => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
function at(kf, p) {
  let i = 0; while (i < kf.length - 2 && p > kf[i + 1][0]) i++;
  const a = kf[i], b = kf[i + 1], k = ease(Math.min(1, Math.max(0, (p - a[0]) / (b[0] - a[0]))));
  return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k);
}
function islPose(p) {
  const [cx, cy, cr, csx, csy, co] = at(KF.cloud, p), [gx, gy, gr] = at(KF.guard, p), [lx, ly] = at(KF.look, p), [bo, bs] = at(KF.burst, p);
  islCloud.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) translate(545 97) rotate(${cr.toFixed(2)}) scale(${csx.toFixed(3)} ${csy.toFixed(3)}) translate(-545 -97)`);
  islCloud.setAttribute('opacity', co.toFixed(3));
  islGuard.setAttribute('transform', `translate(${gx.toFixed(1)} ${gy.toFixed(1)}) translate(438 228) rotate(${gr.toFixed(2)}) translate(-438 -228)`);
  islBurst.setAttribute('transform', `translate(14 4) translate(474 138) scale(${bs.toFixed(3)}) translate(-474 -138)`);
  islBurst.setAttribute('opacity', bo.toFixed(3));
  islBoo.look = lx; islBoo.lookY = ly;
}
const ISL_START = performance.now() + 2600;           // after the drawing has drawn itself in
function islTick(now) {
  if (RM()) { islPose(0.3); islBoo.look = 2.2; islBoo.lookY = -1.4; paintBoo(islBoo, 0, true); }   // still: cloud held off, Boo watching it
  else if (vis.get(island)) islPose(Math.max(0, (now - ISL_START) / 8000) % 1);
  requestAnimationFrame(islTick);
}
requestAnimationFrame(islTick);
// phones: crop to the middle of the drawing so the girl, tree, Boo and cloud come out bigger
const islNarrow = matchMedia('(max-width: 600px)');
const islFit = () => island.setAttribute('viewBox', islNarrow.matches ? '128 30 456 396' : '40 30 600 400');
islNarrow.addEventListener('change', islFit); islFit();

let GEN = 0;
const CANCEL = Symbol('cancel');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function wait(gen, ms, el) { await sleep(ms); if (gen !== GEN) throw CANCEL; if (el && !vis.get(el)) { await whenVisible(el); if (gen !== GEN) throw CANCEL; } }

function keyEl(kb, ch) { return kb.querySelector(`[data-k="${CSS.escape(ch)}"]`); }
function center(kb, el) { const a = kb.getBoundingClientRect(), r = el.getBoundingClientRect(), s = a.width / kb.offsetWidth; return { x: (r.left - a.left + r.width / 2) / s, y: (r.top - a.top + r.height / 2) / s, top: (r.top - a.top) / s }; }
function press(kb, pop, ch) {
  const el = keyEl(kb, ch); if (!el) return;
  el.classList.add('down'); setTimeout(() => el.classList.remove('down'), 120);
  if (/^[a-z]$/.test(ch)) {
    const c = center(kb, el); pop.textContent = ch; pop.style.left = c.x + 'px'; pop.style.top = (c.top - 58) + 'px';
    pop.classList.add('on'); clearTimeout(pop._t); pop._t = setTimeout(() => pop.classList.remove('on'), 140);
  }
}
function setStrip(strip, a, b, c, hl) { [a, b, c].forEach((t, i) => { strip[i].textContent = t || ''; strip[i].className = i === 1 ? (hl ? 'hl' : 'best') : ''; }); }
function trailPath(kb, word) {
  const pts = [...word].map((ch) => keyEl(kb, ch)).filter(Boolean).map((el) => center(kb, el));
  if (pts.length < 2) return '';
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {           // Catmull-Rom to cubic
    const p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p2 = pts[i], p3 = pts[i + 1] || p2;
    d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
  }
  return d;
}
async function swipeWord(gen, kb, trail, word, ms = 900) {
  const d = trailPath(kb, word);
  trail.innerHTML = `<path d="${d}" fill="none" stroke="var(--kb-trail)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
  const p = trail.querySelector('path'), len = p.getTotalLength();
  p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
  p.getBoundingClientRect();
  p.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(.4,0,.3,1)`; p.style.strokeDashoffset = 0;
  await wait(gen, ms + 120);
  p.style.transition = 'opacity .35s'; p.style.opacity = 0;
}
/* ---------- story phone (features) ---------- */
const storyPhone = document.getElementById('storyPhone');
storyPhone.innerHTML = phoneHTML(`<div class="story-screen">
  <div class="pane on" data-pane="swipe"><div style="flex:1;padding:16px 14px;display:flex;flex-direction:column;justify-content:flex-end"><div class="field" id="sField"><span>keep it&nbsp;</span><span class="caret"></span></div></div>${kbHTML()}</div>
  <div class="pane" data-pane="voice"><div style="flex:1;padding:16px 14px;display:flex;flex-direction:column;justify-content:flex-end"><div class="field" id="vField"><span></span><span class="caret"></span></div></div>
    <div class="voice-panel"><div class="mic"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E3F794" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></div>
    <div class="wave">${Array.from({ length: 14 }, (_, i) => `<i style="animation-delay:${(i * 83) % 600}ms;animation-duration:${700 + (i * 137) % 500}ms"></i>`).join('')}</div>
    <div><b style="color:#161015">Listening</b> · on this phone · English</div></div></div>
  <div class="pane" data-pane="translate"><div class="panel-card"><div class="lbl"><span>English → Spanish</span><span>offline</span></div><div id="tOut" style="font-size:17px;min-height:48px;font-weight:500"></div></div>
    <div style="flex:1;padding:0 14px 10px;display:flex;flex-direction:column;justify-content:flex-end"><div class="field" id="tField"><span></span><span class="caret"></span></div></div>${kbHTML()}</div>
  <div class="pane" data-pane="clip"><div style="flex:1"></div><div class="panel-card" style="margin-bottom:10px"><div class="lbl"><span>Clipboard</span><span>3 items</span></div>
    <div class="clip"><span class="pin">📌</span>Wi-Fi: Garden-5G</div><div class="clip"><span class="pin">📌</span>12 Hill Road, flat 4</div><div class="clip"><span class="pin" style="background:#EFEDE6">⎘</span>see you at 7</div></div>
    <div class="lockline"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Encrypted on this phone</div><div style="height:16px"></div>${kbHTML()}</div>
  <div class="pane" data-pane="incog"><div style="flex:1;padding:16px 14px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px"><div style="font-size:12px;color:var(--muted);padding-left:6px">Password</div><div class="field" id="pField"><span>••••••••</span><span class="caret"></span></div></div>${kbHTML()}</div>
</div>`);
io.observe(storyPhone);
const S = { panes: storyPhone.querySelectorAll('.pane'), cur: 'swipe' };
storyPhone.querySelector('[data-pane="incog"] .strip').innerHTML = '<span></span><span style="font-weight:600">Incognito: nothing is learned here</span><span></span>';
storyPhone.querySelector('[data-pane="incog"] .strip').style.gridTemplateColumns = '0 1fr 0';

const steps = [...document.querySelectorAll('#steps .step')], stepsEl = document.getElementById('steps'), sdots = document.getElementById('sdots');
const narrow = matchMedia('(max-width: 900px)');
sdots.innerHTML = steps.map((s, i) => `<button role="tab" aria-label="${s.querySelector('h3').textContent}"></button>`).join('');
const dotBtns = [...sdots.children];
function setStep(el) {
  steps.forEach((s, i) => { s.classList.toggle('cur', s === el); dotBtns[i].classList.toggle('on', s === el); dotBtns[i].setAttribute('aria-selected', s === el); });
  const p = el.dataset.pane; S.cur = p;
  S.panes.forEach((x) => x.classList.toggle('on', x.dataset.pane === p));
}
let stepIO;
function watchSteps() {
  stepIO?.disconnect();
  stepIO = narrow.matches
    ? new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setStep(e.target)), { root: stepsEl, threshold: 0.6 })
    : new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setStep(e.target)), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => stepIO.observe(s));
}
function goStep(i) { const s = steps[(i + steps.length) % steps.length]; stepsEl.scrollTo({ left: s.offsetLeft - (stepsEl.clientWidth - s.clientWidth) / 2, behavior: RM() ? 'auto' : 'smooth' }); }
dotBtns.forEach((b, i) => b.addEventListener('click', () => { touched = Date.now(); goStep(i); }));
let touched = 0;
stepsEl.addEventListener('pointerdown', () => (touched = Date.now()), { passive: true });
stepsEl.addEventListener('touchstart', () => (touched = Date.now()), { passive: true });
setInterval(() => {                                   // phones: cards advance by themselves until you touch them
  if (!narrow.matches || RM() || !vis.get(storyPhone) || Date.now() - touched < 9000) return;
  goStep(steps.findIndex((s) => s.classList.contains('cur')) + 1);
}, 6500);
function fitStory() {                                 // desktop: the pinned phone always fits the screen height
  const stick = storyPhone.parentElement;
  if (narrow.matches) { storyPhone.style.scale = ''; stick.style.height = ''; return; }
  const k = Math.min(1, (innerHeight - 130) / 656);
  storyPhone.style.scale = k; stick.style.height = Math.round(656 * k) + 'px';
}
narrow.addEventListener('change', () => { watchSteps(); fitStory(); });
addEventListener('resize', fitStory);
watchSteps(); fitStory(); setStep(steps[0]);

async function typeInto(gen, el, text, d = 70) { const span = el.querySelector('span'); span.textContent = ''; for (const ch of text) { span.textContent += ch; await wait(gen, d + Math.random() * 40, storyPhone); } }
async function storyLoop(gen) {
  const pane = (n) => storyPhone.querySelector(`[data-pane="${n}"]`);
  try {
    for (;;) {
      await wait(gen, 300, storyPhone);
      const p = S.cur, el = pane(p);
      if (p === 'swipe') {
        const kb = el.querySelector('.kb'), st = el.querySelectorAll('.strip span');
        el.querySelector('#sField span').textContent = 'keep it ';
        setStrip(st, '', '', '');
        await swipeWord(gen, kb, el.querySelector('.trail'), 'private', 1100);
        el.querySelector('#sField span').innerHTML = 'keep it <u>private</u>'; setStrip(st, 'privacy', 'private', 'privately');
        await wait(gen, 1800);
      } else if (p === 'voice') {
        await typeInto(gen, el.querySelector('#vField'), 'pick up oat milk on the way home', 55); await wait(gen, 1600);
      } else if (p === 'translate') {
        const out = el.querySelector('#tOut'); out.textContent = '';
        const kb = el.querySelector('.kb'), pop = el.querySelector('.popkey'), span = el.querySelector('#tField span'); span.textContent = '';
        const src = 'where is the station', dst = ['¿dónde', '¿dónde está', '¿dónde está la', '¿dónde está la estación?'];
        let wi = 0;
        for (const ch of src) { press(kb, pop, ch === ' ' ? ' ' : ch); span.textContent += ch; if (ch === ' ') out.textContent = dst[Math.min(wi++, 3)]; await wait(gen, 110, storyPhone); }
        out.textContent = dst[3]; await wait(gen, 2000);
      } else {
        await wait(gen, 600);
      }
    }
  } catch (e) { if (e !== CANCEL) throw e; }
}
function storyStatic() {
  storyPhone.querySelector('#sField span').innerHTML = 'keep it <u>private</u>';
  storyPhone.querySelector('#vField span').textContent = 'pick up oat milk on the way home';
  storyPhone.querySelector('#tField span').textContent = 'where is the station';
  storyPhone.querySelector('#tOut').textContent = '¿dónde está la estación?';
}

/* ---------- languages ---------- */
document.querySelectorAll('.boo-glyph').forEach((el) => (el.outerHTML = booGlyph));
const HELLO = [['Hello', 'English'], ['Hola', 'Español'], ['Bonjour', 'Français'], ['Hallo', 'Deutsch'], ['Olá', 'Português'], ['Halo', 'Bahasa Indonesia'], ['Kumusta', 'Filipino'], ['नमस्ते', 'हिन्दी'], ['नमस्कार', 'मराठी'],
  ['নমস্কার', 'বাংলা'], ['வணக்கம்', 'தமிழ்'], ['నమస్కారం', 'తెలుగు'], ['مرحبا', 'العربية'], ['آداب', 'اردو'], ['Привет', 'Русский'], ['Привіт', 'Українська'], ['你好', '中文'], ['こんにちは', '日本語']];
const pill = ([h, n], i) => `<span class="hello ${i % 5 === 2 ? 'dark' : ''}"><b lang="">${h}</b><small>${n}</small></span>`;
const half = Math.ceil(HELLO.length / 2);
document.getElementById('mq1').innerHTML = [0, 1].map(() => HELLO.slice(0, half).map(pill).join('')).join('');
document.getElementById('mq2').innerHTML = [0, 1].map(() => HELLO.slice(half).map((x, i) => pill(x, i + 1)).join('')).join('');
/* ---------- coming: "denoise" canvas (an animation of the idea) ---------- */
const gen = document.getElementById('gen'), gctx = gen.getContext('2d'), genStep = document.getElementById('genStep');
const N = 192, target = (() => {
  const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d');
  const bg = x.createRadialGradient(N * .5, N * .4, 10, N * .5, N * .5, N * .75); bg.addColorStop(0, '#EEFBB8'); bg.addColorStop(1, '#D3EA74'); x.fillStyle = bg; x.fillRect(0, 0, N, N);
  x.save(); x.translate(N * .5 - 50 * 1.15, 22); x.scale(1.15, 1.15);
  x.fillStyle = 'rgba(22,16,21,.2)'; x.beginPath(); x.ellipse(50, 140, 30, 5, 0, 0, 7); x.fill();
  const g = x.createRadialGradient(36, 30, 2, 40, 45, 90); g.addColorStop(0, '#4A4247'); g.addColorStop(.45, '#211B20'); g.addColorStop(1, '#0E0A0D');
  x.fillStyle = g; x.fill(new Path2D(bodyPath(0, 0)));
  x.fillStyle = '#E3F794'; for (const ex of [36, 64]) { x.beginPath(); x.ellipse(ex, 50, 9, 12.5, 0, 0, 7); x.fill(); }
  x.fillStyle = 'rgba(255,255,255,.7)'; for (const ex of [33, 61]) { x.beginPath(); x.ellipse(ex, 45, 2.6, 3.4, 0, 0, 7); x.fill(); }
  x.restore(); return x.getImageData(0, 0, N, N).data;
})();
const noise = new Float32Array(N * N * 3).map(() => Math.random() * 255);
const img = gctx.createImageData(N, N);
function drawGen(a) {
  const d = img.data;
  for (let i = 0, j = 0; i < d.length; i += 4, j += 3) {
    const jit = (Math.random() - .5) * 60 * (1 - a);
    d[i] = target[i] * a + (noise[j] + jit) * (1 - a); d[i + 1] = target[i + 1] * a + (noise[j + 1] + jit) * (1 - a); d[i + 2] = target[i + 2] * a + (noise[j + 2] + jit) * (1 - a); d[i + 3] = 255;
  }
  gctx.putImageData(img, 0, 0);
}
io.observe(gen);
async function genLoop(g) {
  try {
    for (;;) {
      for (let s = 0; s <= 24; s++) { const a = 1 - Math.pow(1 - s / 24, 2.2); drawGen(a); genStep.textContent = `Step ${s} / 24`; await wait(g, 160, gen); }
      await wait(g, 2600, gen);
      for (let k = 0; k < 12; k++) { noise.forEach((_, i) => { if (Math.random() < .3) noise[i] = Math.random() * 255; }); }
    }
  } catch (e) { if (e !== CANCEL) throw e; }
}

/* ---------- kinetic type: split headlines into masked words (and letters for one word) ---------- */
function kinetic(h) {
  h.classList.add('kinetic');
  const letters = h.dataset.letters, label = h.textContent.replace(/\s+/g, ' ').trim();
  let i = 0;
  const word = (inner) => `<span class="w"><span style="--i:${i++}">${inner}</span></span>`;
  const out = [];
  for (const n of [...h.childNodes]) {
    if (n.nodeType === 3) n.textContent.split(/[ \t\r\n]+/).filter(Boolean).forEach((t) => out.push(word(t)));   // &nbsp; keeps a phrase in one piece
    else if (n.nodeName === 'EM') {
      const t = n.textContent;
      if (letters && t.startsWith(letters)) out.push(word(`<em>${[...t].map((c, j) => `<span class="l" style="--j:${j}">${c}</span>`).join('')}</em>`));
      else out.push(word(`<em>${t}</em>`));
    } else if (n.nodeName === 'BR') out.push('<br>');
  }
  h.innerHTML = out.join(' ').replace(/ <br> /g, '<br>');
  h.setAttribute('aria-label', label);
  [...h.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
}
const heroTitle = document.getElementById('heroTitle');
kinetic(heroTitle);
document.querySelectorAll('.h2').forEach(kinetic);
requestAnimationFrame(() => heroTitle.classList.add('go'));
const kio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('go'); kio.unobserve(e.target); } }), { rootMargin: '0px 0px -15% 0px' });
document.querySelectorAll('.h2.kinetic').forEach((h) => kio.observe(h));
setInterval(() => {                                   // "nothing" fades out like a ghost now and then
  if (RM() || !vis.get(heroTitle)) return;
  heroTitle.classList.remove('ghost'); void heroTitle.offsetWidth; heroTitle.classList.add('ghost');
}, 7000);
io.observe(heroTitle);

/* ---------- scroll reveals, nav ---------- */
const rv = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); rv.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.in-view').forEach((el) => rv.observe(el));
/* ---------- comparison card: a lime Boo drifts down it as you scroll ----------
   Boo roams the full width on a gentle, never-repeating curve (two blended waves), hem lobes rippling all the
   time (the real bodyPath), leaning and looking the way it drifts. It sits about 60% down the screen, so it
   travels down the card as the card scrolls past; each row lights up and its tick grows as Boo passes, and Boo
   leaves below the card. Scrolling back up runs it backwards. Reduce motion = the lit card, no Boo. */
const perm = document.getElementById('perm');
const flyBoo = (() => {
  const el = document.createElement('div');
  el.className = 'flyboo'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<svg viewBox="-8 -4 116 140"><path class="bp" fill="#E3F794"/><g class="ey"><ellipse cx="36" cy="50" rx="9" ry="12.5" fill="#161015"/><ellipse cx="64" cy="50" rx="9" ry="12.5" fill="#161015"/></g></svg>`;
  perm.parentElement.appendChild(el);
  return { el, bp: el.querySelector('.bp'), ey: el.querySelector('.ey'), rows: [...perm.querySelectorAll('.vs-row')] };
})();
io.observe(perm);
const flyRaw = (t) => 0.62 * Math.sin(t * Math.PI * 2 * 0.95 + 0.4) + 0.38 * Math.sin(t * Math.PI * 2 * 1.7 + 2.12);
const [flyMin, flyMax] = (() => { let a = 9, b = -9; for (let i = 0; i <= 400; i++) { const v = flyRaw(i / 400); a = Math.min(a, v); b = Math.max(b, v); } return [a, b]; })();
// stretched so its widest swings touch both edges, and mirrored so Boo heads to the LEFT edge first
// (it stays clear of where a right thumb scrolls)
const flyWave = (t) => 1 - ((flyRaw(t) - flyMin) / (flyMax - flyMin)) * 2;
function flyTick(now) {
  requestAnimationFrame(flyTick);
  const F = flyBoo;
  if (RM()) {
    if (!F.still) { F.still = true; perm.classList.remove('fly'); F.el.style.opacity = 0; F.rows.forEach((r) => { r.style.opacity = ''; r.style.removeProperty('--k'); }); }
    return;
  }
  F.still = false;
  if (!vis.get(perm)) return;
  perm.classList.add('fly');
  const bw = F.el.offsetWidth, cl = perm.offsetLeft, cw = perm.offsetWidth, ct = perm.offsetTop, ch = perm.offsetHeight;
  const L = cl + bw * 0.55, R = cl + cw - bw * 0.55, Y0 = ct - bw * 1.4, Y1 = ct + ch + bw * 0.4;
  const top = perm.getBoundingClientRect().top;
  const p = (innerHeight * 0.6 - top + ct - Y0) / (Y1 - Y0);       // Boo rides about 60% down the screen
  const t = Math.min(1, Math.max(0, p));
  const pos = (u) => [(L + R) / 2 + (R - L) / 2 * flyWave(u), Y0 + (Y1 - Y0) * (u + 0.025 * Math.sin(u * Math.PI * 4))];
  const [x, y] = pos(t), [x2] = pos(Math.min(1, t + 0.01));
  const lean = Math.max(-1, Math.min(1, (x2 - x) / 7)), w = now / 1000;
  F.bp.setAttribute('d', bodyPath(w, lean));
  F.el.style.transform = `translate(${(x - bw / 2).toFixed(1)}px,${(y - bw * 0.65 + Math.sin(w * 1.85) * 3).toFixed(1)}px) rotate(${(lean * 7).toFixed(1)}deg)`;
  F.el.style.opacity = p <= 0 || p >= 1 ? 0 : Math.min(1, t * 12, (1 - t) * 12).toFixed(3);
  F.ey.setAttribute('transform', `translate(${(lean * 6).toFixed(1)} 3)`);
  for (const r of F.rows) {
    const k = Math.min(1, Math.max(0, (y - (ct + r.offsetTop + r.offsetHeight / 2) + 30) / 60));
    r.style.opacity = (0.22 + 0.78 * k).toFixed(3); r.style.setProperty('--k', k.toFixed(3));
  }
}
requestAnimationFrame(flyTick);

const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

/* ---------- start / restart all demos (reduced motion = static) ---------- */
const dlBoo = mountBoo(document.getElementById('dlBoo'), { size: 170 });
function start() {
  GEN++;
  document.documentElement.classList.toggle('rm', RM());
  if (RM()) { storyStatic(); drawGen(1); genStep.textContent = 'Step 24 / 24'; return; }
  storyLoop(GEN); genLoop(GEN);
}
mq.addEventListener('change', start);
start();
