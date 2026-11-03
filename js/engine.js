'use strict';
/* =========================================================
   Engine — tile world, input, dialogue, lighting, FX, UI
   ========================================================= */
const TILE = 32, VW = 640, VH = 360;
const $ = s => document.querySelector(s);
const cvs = $('#game');
const ctx = cvs.getContext('2d');
ctx.imageSmoothingEnabled = false;
const lightCvs = document.createElement('canvas'); lightCvs.width = VW; lightCvs.height = VH;
const lctx = lightCvs.getContext('2d');

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function seeded(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; }; }

const G = {
  t: 0, gen: 0, busy: 0, allowMove: false, lockMove: false, running: false,
  map: null, player: null, sanity: 100,
  inv: [], flags: {}, memories: [], notes: {}, broken: {},
  chapter: 1, checkpoint: null,
  fx: { shake: 0, shakeT: 0, flash: 0, flashColor: '200,0,0', glitch: 0, white: 0, red: 0, invert: 0 },
  cam: { x: 0, y: 0 }, stepTime: 0.165, hidePlayer: false, playerPose: null,
};

/* ---------------- Input ---------------- */
const Input = { held: {}, queue: [], layers: [] };
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyE: 'ok', Space: 'ok', Enter: 'ok', NumpadEnter: 'ok', KeyZ: 'ok',
  KeyJ: 'journal', Tab: 'journal', KeyI: 'inv', Escape: 'pause', KeyP: 'pause', KeyX: 'cancel', Backspace: 'cancel', KeyQ: 'cancel',
};
const topLayer = () => Input.layers[Input.layers.length - 1];
function pressAction(a) {
  const L = topLayer();
  if (L) { if (L.key) L.key(a); return; }
  Input.queue.push(a);
}
addEventListener('keydown', e => {
  const a = KEYMAP[e.code]; if (!a) return;
  e.preventDefault();
  Sound.init();
  if (e.repeat) {
    if (['up', 'down', 'left', 'right'].includes(a) && Input.layers.length) pressAction(a);
    return;
  }
  Input.held[a] = true;
  pressAction(a);
});
addEventListener('keyup', e => {
  const a = KEYMAP[e.code]; if (!a) return;
  Input.held[a] = false;
  const L = topLayer(); if (L && L.keyup) L.keyup(a);
});
addEventListener('blur', () => { Input.held = {}; });
function pushLayer(L) { Input.layers.push(L); return L; }
function popLayer(L) { const i = Input.layers.indexOf(L); if (i >= 0) Input.layers.splice(i, 1); }
function clearLayers() { Input.layers.length = 0; Input.queue.length = 0; }

// touch controls
document.querySelectorAll('#touch button').forEach(b => {
  const a = b.dataset.a;
  const down = e => { e.preventDefault(); Sound.init(); Input.held[a] = true; b.classList.add('on'); pressAction(a); };
  const up = e => { e.preventDefault(); Input.held[a] = false; b.classList.remove('on'); const L = topLayer(); if (L && L.keyup) L.keyup(a); };
  b.addEventListener('touchstart', down, { passive: false });
  b.addEventListener('touchend', up, { passive: false });
  b.addEventListener('touchcancel', up, { passive: false });
  b.addEventListener('mousedown', down); b.addEventListener('mouseup', up); b.addEventListener('mouseleave', e => { if (Input.held[a]) up(e); });
});

/* ---------------- Layout ---------------- */
function resize() {
  const W = innerWidth, H = innerHeight;
  let w = W, h = W * 9 / 16;
  if (h > H) { h = H; w = H * 16 / 9; }
  const st = $('#stage');
  st.style.width = w + 'px'; st.style.height = h + 'px';
  st.style.setProperty('--u', (w / 640) + 'px');
}
addEventListener('resize', resize); resize();

/* ---------------- Async helpers (generation-guarded) ---------------- */
function wait(ms) { const g = G.gen; return new Promise(r => setTimeout(() => { if (g === G.gen) r(); }, ms)); }
async function run(fn) {
  const g = G.gen; G.busy++;
  try { await fn(); } catch (e) { console.error(e); }
  finally { if (g === G.gen) G.busy = Math.max(0, G.busy - 1); }
}
const graphemes = text => (window.Intl && Intl.Segmenter) ? [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text)].map(s => s.segment) : [...text];

function nameClass(name) {
  if (!name) return 'narr';
  if (name === 'ปฐพี') return 'me';
  if (name.includes('ทนาย')) return 'lawyer';
  if (name.includes('มิ้น')) return 'mint';
  if (name.includes('เงา') || name === '???') return 'shadow';
  return 'other';
}

function say(name, text, opt = {}) {
  const g = G.gen;
  return new Promise(res => {
    const box = $('#dialog'), nm = $('#dlg-name'), tx = $('#dlg-text'), nx = $('#dlg-next');
    const cls = opt.cls || nameClass(name);
    box.className = cls; box.hidden = false;
    nm.textContent = name || '';
    tx.textContent = ''; nx.style.visibility = 'hidden';
    const chars = graphemes(text);
    let i = 0, done = false, closed = false;
    const speed = opt.speed || 26;
    const timer = setInterval(() => {
      if (i >= chars.length) { finish(); return; }
      i++; tx.textContent = chars.slice(0, i).join('');
      if (i % 3 === 0) Sound.blip(cls);
    }, speed);
    function finish() { clearInterval(timer); tx.textContent = text; done = true; nx.style.visibility = 'visible'; if (opt.auto) setTimeout(close, opt.auto); }
    function close() { if (closed) return; closed = true; clearInterval(timer); popLayer(L); box.hidden = true; box.onclick = null; if (g === G.gen) res(); }
    const L = pushLayer({ key(a) { if (a === 'ok' || a === 'cancel') { if (!done) finish(); else close(); } } });
    box.onclick = () => L.key('ok');
  });
}
async function talk(lines) {
  for (const l of lines) {
    if (typeof l === 'string') await say('', l);
    else if (typeof l === 'function') await l();
    else await say(l[0], l[1], l[2] || {});
  }
}

function choose(options, opt = {}) {
  const g = G.gen;
  return new Promise(res => {
    const el = $('#choices'); el.innerHTML = ''; el.hidden = false;
    if (opt.prompt) { const p = document.createElement('div'); p.className = 'c-prompt'; p.textContent = opt.prompt; el.appendChild(p); }
    let idx = opt.default || 0, closed = false, tm = null;
    const items = options.map((o, i) => {
      const d = document.createElement('div');
      d.className = 'c-item' + (o.danger ? ' danger' : '');
      d.textContent = typeof o === 'string' ? o : o.text;
      d.onclick = () => { idx = i; pick(); };
      d.onmouseenter = () => { idx = i; upd(); };
      el.appendChild(d); return d;
    });
    if (opt.timeout) {
      const bar = document.createElement('div'); bar.className = 'c-timer'; const fill = document.createElement('i'); bar.appendChild(fill); el.appendChild(bar);
      fill.style.transition = `width ${opt.timeout}ms linear`;
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = '0%'; }));
      tm = setTimeout(() => close(opt.timeoutValue ?? -1), opt.timeout);
    }
    function upd() { items.forEach((d, i) => d.classList.toggle('sel', i === idx)); }
    function close(v) { if (closed) return; closed = true; clearTimeout(tm); popLayer(L); el.hidden = true; if (g === G.gen) res(v); }
    function pick() { Sound.click(); close(idx); }
    const L = pushLayer({
      key(a) {
        if (a === 'up') { idx = (idx + items.length - 1) % items.length; upd(); Sound.tick(); }
        else if (a === 'down') { idx = (idx + 1) % items.length; upd(); Sound.tick(); }
        else if (a === 'ok') pick();
        else if (a === 'cancel' && opt.cancel !== undefined) { close(opt.cancel); }
      }
    });
    upd();
  });
}

/* modal */
function openModal(content, opt = {}) {
  const m = $('#modal'); m.innerHTML = ''; m.hidden = false;
  if (typeof content === 'string') m.innerHTML = content; else m.appendChild(content);
  const L = pushLayer({ freeze: opt.freeze !== false, key: opt.key, keyup: opt.keyup });
  const h = {
    el: m, layer: L,
    close() { popLayer(L); m.hidden = true; m.innerHTML = ''; },
  };
  if (opt.closeOnClick) m.onclick = e => { if (e.target === m) opt.closeOnClick(); }; else m.onclick = null;
  return h;
}
function readNote(title, body, opt = {}) {
  const g = G.gen;
  return new Promise(res => {
    Sound.creak && Sound.click();
    const d = document.createElement('div'); d.className = opt.cls || 'paper';
    d.innerHTML = (title ? `<h3>${title}</h3>` : '') + body + `<span class="close-hint">[E] ปิด</span>`;
    let h;
    const close = () => { h.close(); if (g === G.gen) res(); };
    h = openModal(d, { key(a) { if (a === 'ok' || a === 'cancel') close(); }, closeOnClick: close });
    d.onclick = close;
  });
}
function showHTML(html, opt = {}) {
  const g = G.gen;
  return new Promise(res => {
    const wrap = document.createElement('div'); wrap.innerHTML = html;
    const el = wrap.firstElementChild || wrap;
    let h;
    const close = () => { h.close(); if (g === G.gen) res(); };
    h = openModal(el, { key(a) { if (a === 'ok' || a === 'cancel') close(); }, closeOnClick: close });
    el.addEventListener('click', close);
  });
}

/* toast / subtitle */
let toastQ = [], toastBusy = false;
function toast(text, cls = '', ms = 2400) { toastQ.push([text, cls, ms]); if (!toastBusy) nextToast(); }
function nextToast() {
  const it = toastQ.shift(); if (!it) { toastBusy = false; return; }
  toastBusy = true; const el = $('#toast'); el.textContent = it[0]; el.className = 'show ' + it[1];
  setTimeout(() => { el.className = it[1]; setTimeout(nextToast, 320); }, it[2]);
}
let subTimer = null;
function subtitle(text, ms = 2600, cls = '') {
  const el = $('#subtitle'); el.textContent = text; el.className = 'show ' + cls;
  clearTimeout(subTimer); subTimer = setTimeout(() => { el.className = cls; }, ms);
}
function clearSubtitle() { clearTimeout(subTimer); $('#subtitle').className = ''; }

/* fade */
function fade(to, ms = 800, color = '#000') {
  const f = $('#fade'); f.style.background = color; f.style.transition = `opacity ${ms}ms`;
  void f.offsetWidth; f.style.opacity = to;
  return wait(ms);
}
function fadeInstant(to, color = '#000') { const f = $('#fade'); f.style.transition = 'none'; f.style.background = color; f.style.opacity = to; void f.offsetWidth; }

async function chapterCard(num, th, en, when) {
  const el = $('#card-screen');
  el.innerHTML = `<div class="cs-num">${num}</div><div class="cs-title">${th}</div><div class="cs-en">${en}</div><div class="cs-time">${when || ''}</div>`;
  el.hidden = false; el.style.opacity = 1; el.style.transition = 'opacity 1s';
  Sound.stinger();
  const g = G.gen;
  await new Promise(res => {
    let can = false, done = false;
    setTimeout(() => can = true, 1400);
    const L = pushLayer({ freeze: true, key(a) { if (a === 'ok' && can) fin(); } });
    const tm = setTimeout(fin, 4200);
    function fin() { if (done) return; done = true; clearTimeout(tm); popLayer(L); res(); }
  });
  if (g !== G.gen) return;
  el.style.opacity = 0;
  await wait(900);
  el.hidden = true;
}

/* HUD */
function setObjective(t) { $('#hud-obj').textContent = t || ''; }
function setChapterLabel(t) { $('#hud-chapter').textContent = t || ''; }
function setClock(t) { $('#hud-clock').textContent = t || ''; }
function updateSanityHUD() {
  $('#sanity-fill').style.width = clamp(G.sanity, 0, 100) + '%';
  $('.sanity').classList.toggle('low', G.sanity < 35);
}
function hurt(n, why) {
  if (G.dead) return;
  G.sanity = clamp(G.sanity - n, 0, 100); updateSanityHUD();
  G.fx.flash = Math.min(0.85, 0.35 + n / 30); G.fx.flashColor = '170,0,0';
  shake(4 + n / 3, 350); G.fx.glitch = Math.max(G.fx.glitch, 0.25 + n / 60);
  if (why) subtitle(why, 2000, 'loud');
  if (G.sanity <= 0) { G.dead = true; setTimeout(() => window.gameOver && gameOver(), 600); }
}
function heal(n) { G.sanity = clamp(G.sanity + n, 0, 100); updateSanityHUD(); }
function shake(power, ms) { G.fx.shake = Math.max(G.fx.shake, power); G.fx.shakeT = Math.max(G.fx.shakeT, ms / 1000); }
function flash(color = '255,255,255', a = 0.8) { G.fx.flash = a; G.fx.flashColor = color; }

/* inventory */
function addItem(id, name, desc, silent) {
  if (hasItem(id)) return;
  G.inv.push({ id, name, desc });
  if (!silent) { Sound.item(); toast('ได้รับ: ' + name); }
}
function hasItem(id) { return G.inv.some(i => i.id === id); }
function removeItem(id) { G.inv = G.inv.filter(i => i.id !== id); }

/* ---------------- Maps ---------------- */
const WALKABLE = new Set(['.', ',', '~', 'g', 'p', 's', 'c', 't', '=', 'h', 'r', 'k', 'x']);
function tileAt(x, y) { const m = G.map; if (!m || y < 0 || y >= m.h || x < 0 || x >= m.w) return ' '; return m.tiles[y][x]; }
function objsAt(x, y) { return G.map.objs.filter(o => !o.hidden && x >= o.x && x < o.x + (o.w || 1) && y >= o.y && y < o.y + (o.h || 1)); }
function getObj(id) { return G.map && G.map.objs.find(o => o.id === id); }
function passable(x, y) {
  const m = G.map;
  if (!WALKABLE.has(tileAt(x, y))) return false;
  if (objsAt(x, y).some(o => o.solid !== false)) return false;
  if (m.blocked && m.blocked(x, y)) return false;
  if (m.ents && m.ents.some(e => e.solid && Math.round(e.x) === x && Math.round(e.y) === y)) return false;
  return true;
}
function addObj(o) { const m = G.map; const ob = Object.assign({ w: 1, h: 1 }, o); m.objs.push(ob); return ob; }

function loadMap(def, px, py, dir = 'down') {
  const m = Object.assign({ objs: [], ents: [], dark: 0, playerLight: 0, legend: {} }, def);
  m.h = m.grid.length; m.w = Math.max(...m.grid.map(r => r.length));
  m.tiles = [];
  const objs = [];
  for (let y = 0; y < m.h; y++) {
    const row = [];
    for (let x = 0; x < m.w; x++) {
      const ch = m.grid[y][x] || ' ';
      const L = m.legend[ch];
      if (L) {
        const def2 = typeof L === 'function' ? L(x, y) : L;
        if (def2) objs.push(Object.assign({ w: 1, h: 1 }, def2, { x, y }));
        row.push((def2 && def2.tile) || (def2 && def2.layer === 'wall' ? '#' : '.'));
      } else row.push(ch);
    }
    m.tiles.push(row);
  }
  m.objs = objs.concat((def.objects || []).map(o => Object.assign({ w: 1, h: 1 }, o)));
  buildTileCanvas(m);
  G.map = m;
  G.player = { x: px, y: py, tx: px, ty: py, fx: px, fy: py, dir, moving: false, mt: 0, step: 0, slow: 1 };
  G.hidePlayer = false; G.playerPose = null;
  if (m.onLoad) m.onLoad(m);
  return m;
}

/* tile painter */
const PAL = {
  wood: ['#2b1d16', '#23170f', '#33241b'],
  tile: ['#4d514c', '#3d413c', '#575b55'],
  concrete: ['#343436', '#2a2a2c', '#3c3b3d'],
  carpet: ['#3a1013', '#2c0b0d', '#46161a'],
  grass: ['#18210f', '#121a0b', '#1f2914'],
  dark: ['#1a1414', '#140f0f', '#211919'],
};
function buildTileCanvas(m) {
  const c = document.createElement('canvas'); c.width = m.w * TILE; c.height = m.h * TILE;
  const g = c.getContext('2d');
  const R = seeded(m.seed || 7);
  const wall = Object.assign({ face: '#3a2b26', stripe: '#31231f', top: '#0b0809', base: '#160e0c', win: '#5a1010' }, m.wall || {});
  const isWallT = t => t === '#' || t === 'w' || t === ' ';
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = m.tiles[y][x], X = x * TILE, Y = y * TILE;
    if (t === ' ') { g.fillStyle = '#000'; g.fillRect(X, Y, TILE, TILE); continue; }
    if (t === '#' || t === 'w') {
      const below = y + 1 < m.h ? m.tiles[y + 1][x] : '#';
      if (!isWallT(below)) {
        // wallpaper face
        g.fillStyle = wall.face; g.fillRect(X, Y, TILE, TILE);
        g.fillStyle = wall.stripe; for (let i = 2; i < TILE; i += 8) g.fillRect(X + i, Y, 2, TILE);
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(X, Y, TILE, 3);
        g.fillStyle = wall.base; g.fillRect(X, Y + TILE - 5, TILE, 5);
        if (R() < 0.35) { g.fillStyle = 'rgba(20,8,6,.45)'; g.fillRect(X + R() * 26, Y + 6 + R() * 10, 2 + R() * 3, 6 + R() * 14); }
        if (t === 'w') {
          g.fillStyle = '#120c0b'; g.fillRect(X + 5, Y + 4, 22, 20);
          g.fillStyle = wall.win; g.fillRect(X + 7, Y + 6, 18, 16);
          g.fillStyle = '#120c0b'; g.fillRect(X + 15, Y + 6, 2, 16); g.fillRect(X + 7, Y + 13, 18, 2);
        }
      } else {
        g.fillStyle = wall.top; g.fillRect(X, Y, TILE, TILE);
        g.fillStyle = 'rgba(255,255,255,.025)'; g.fillRect(X, Y, TILE, 1);
      }
      continue;
    }
    let ft = t;
    if (t === '.' || t === '~' || t === 'x') ft = m.floor || 'wood';
    if (t === ',' || t === '=') ft = m.floor2 || 'carpet';
    paintFloor(g, ft, X, Y, R, x, y, m);
    if (t === '~') {
      g.fillStyle = 'rgba(90,6,6,.75)'; g.beginPath(); g.ellipse(X + 16 + R() * 6 - 3, Y + 16, 8 + R() * 6, 5 + R() * 4, R() * 3, 0, 7); g.fill();
      g.fillStyle = 'rgba(40,0,0,.6)'; g.fillRect(X + 6 + R() * 18, Y + 6 + R() * 18, 3, 3);
    }
    // contact shadow under walls
    if (y > 0 && isWallT(m.tiles[y - 1][x])) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(X, Y, TILE, 6); }
  }
  m.tileCanvas = c;
}
function paintFloor(g, ft, X, Y, R, x, y, m) {
  if (ft === 'wood') {
    g.fillStyle = PAL.wood[0]; g.fillRect(X, Y, TILE, TILE);
    g.fillStyle = PAL.wood[1]; for (let i = 0; i < 4; i++) g.fillRect(X, Y + i * 8 + 7, TILE, 1);
    g.fillStyle = PAL.wood[2]; g.fillRect(X + ((y * 13) % 28), Y + 2, 1, 5); g.fillRect(X + ((x * 7 + y) % 30), Y + 18, 8, 1);
    if (R() < 0.12) { g.fillStyle = 'rgba(70,10,8,.35)'; g.beginPath(); g.ellipse(X + R() * 32, Y + R() * 32, 3 + R() * 5, 2 + R() * 3, 0, 0, 7); g.fill(); }
  } else if (ft === 'tile') {
    g.fillStyle = PAL.tile[0]; g.fillRect(X, Y, TILE, TILE);
    g.fillStyle = PAL.tile[1]; g.fillRect(X, Y, TILE, 1); g.fillRect(X, Y, 1, TILE); g.fillRect(X + 16, Y, 1, TILE); g.fillRect(X, Y + 16, TILE, 1);
    if ((x + y) % 2) { g.fillStyle = 'rgba(255,255,255,.03)'; g.fillRect(X, Y, TILE, TILE); }
    if (R() < 0.18) { g.fillStyle = 'rgba(150,130,40,.22)'; g.beginPath(); g.ellipse(X + R() * 32, Y + R() * 32, 4 + R() * 7, 3 + R() * 4, R(), 0, 7); g.fill(); }
  } else if (ft === 'concrete') {
    g.fillStyle = PAL.concrete[0]; g.fillRect(X, Y, TILE, TILE);
    for (let i = 0; i < 6; i++) { g.fillStyle = R() < 0.5 ? PAL.concrete[1] : PAL.concrete[2]; g.fillRect(X + R() * 30, Y + R() * 30, 2, 2); }
    if (R() < 0.15) { g.strokeStyle = '#1c1c1e'; g.lineWidth = 1; g.beginPath(); g.moveTo(X + R() * 32, Y); g.lineTo(X + R() * 32, Y + 16); g.lineTo(X + R() * 32, Y + 32); g.stroke(); }
    if (R() < 0.08) { g.fillStyle = 'rgba(60,0,0,.4)'; g.fillRect(X + R() * 20, Y + R() * 20, 6 + R() * 8, 3 + R() * 5); }
  } else if (ft === 'carpet') {
    g.fillStyle = PAL.carpet[0]; g.fillRect(X, Y, TILE, TILE);
    g.fillStyle = PAL.carpet[1]; g.fillRect(X + 2, Y + 2, 28, 1); g.fillRect(X + 2, Y + 29, 28, 1);
    g.fillStyle = PAL.carpet[2]; g.fillRect(X + 14, Y + 14, 4, 4);
  } else if (ft === 'grass' || ft === 'g') {
    g.fillStyle = PAL.grass[0]; g.fillRect(X, Y, TILE, TILE);
    for (let i = 0; i < 9; i++) { g.fillStyle = R() < 0.5 ? PAL.grass[1] : PAL.grass[2]; g.fillRect(X + R() * 30, Y + R() * 28, 1, 3 + R() * 3); }
  } else if (ft === 'p') {
    g.fillStyle = '#16120f'; g.fillRect(X, Y, TILE, TILE);
    g.fillStyle = '#3a332c'; g.fillRect(X + 3, Y + 3, 12, 10); g.fillRect(X + 17, Y + 5, 12, 11); g.fillRect(X + 6, Y + 17, 13, 11); g.fillRect(X + 21, Y + 20, 8, 8);
    g.fillStyle = '#4a4239'; g.fillRect(X + 3, Y + 3, 12, 2); g.fillRect(X + 17, Y + 5, 12, 2);
  } else if (ft === 's') {
    g.fillStyle = '#0e0807'; g.fillRect(X, Y, TILE, TILE);
    for (let i = 0; i < 7; i++) { g.fillStyle = R() < 0.5 ? '#1a0e0b' : '#2a1210'; g.fillRect(X + R() * 30, Y + R() * 30, 2 + R() * 3, 1 + R() * 2); }
    g.fillStyle = 'rgba(120,20,20,.12)'; g.fillRect(X + 4, Y + 10, 20, 2);
  } else if (ft === 'c') { paintFloor(g, 'concrete', X, Y, R, x, y, m); }
  else if (ft === 't') { paintFloor(g, 'tile', X, Y, R, x, y, m); }
  else if (ft === 'dark') { g.fillStyle = PAL.dark[0]; g.fillRect(X, Y, TILE, TILE); g.fillStyle = PAL.dark[1]; g.fillRect(X, Y + 31, TILE, 1); }
  else if (ft === 'h' || ft === 'r' || ft === 'k') { paintFloor(g, m.floor || 'wood', X, Y, R, x, y, m); }
  else { g.fillStyle = '#222'; g.fillRect(X, Y, TILE, TILE); }
}

/* ---------------- Game loop ---------------- */
let lastTs = 0;
function frozen() { return Input.layers.some(l => l.freeze); }
function canMove() { return G.running && !G.dead && !Input.layers.length && (G.busy === 0 || G.allowMove) && !G.lockMove; }
function canAct() { return G.running && !G.dead && !Input.layers.length && G.busy === 0; }

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0); lastTs = ts;
  if (!frozen()) G.t += dt;
  try { update(dt); render(); } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}

function update(dt) {
  const fx = G.fx;
  if (frozen()) { Input.queue.length = 0; return; }
  fx.flash = Math.max(0, fx.flash - dt * 1.6);
  fx.glitch = Math.max(0, fx.glitch - dt);
  if (fx.shakeT > 0) fx.shakeT -= dt; else fx.shake = 0;
  if (!G.running || !G.map) { Input.queue.length = 0; return; }
  updatePlayer(dt);
  while (Input.queue.length) handleAction(Input.queue.shift());
  const m = G.map;
  if (m.update) m.update(dt);
  if (G.sanity < 40 && Math.random() < dt * 0.12) { fx.glitch = Math.max(fx.glitch, 0.15); if (Math.random() < 0.5) Sound.whisper(); }
}

function updatePlayer(dt) {
  const p = G.player, m = G.map; if (!p) return;
  if (p.moving) {
    p.mt += dt / (G.stepTime * (p.slow || 1));
    if (p.mt >= 1) {
      p.moving = false; p.x = p.tx; p.y = p.ty; p.mt = 0; p.fx = p.x; p.fy = p.y;
      onStep();
    } else { p.fx = p.x + (p.tx - p.x) * p.mt; p.fy = p.y + (p.ty - p.y) * p.mt; }
  }
  if (!p.moving && canMove()) {
    const h = Input.held;
    const d = h.up ? 'up' : h.down ? 'down' : h.left ? 'left' : h.right ? 'right' : null;
    if (d) {
      const [dx, dy] = DIRS[d]; const nx = p.x + dx, ny = p.y + dy;
      if (m.beforeMove && m.beforeMove(nx, ny, d) === false) return;
      p.dir = d;
      if (passable(nx, ny)) {
        p.moving = true; p.tx = nx; p.ty = ny; p.mt = 0; p.step = (p.step + 1) % 4;
        p.slow = (m.slowAt && m.slowAt(nx, ny)) || 1;
        if (m.wetFloor) Sound.stepWet(); else Sound.step();
      }
    }
  }
}
function onStep() {
  const p = G.player, m = G.map;
  if (m.onStep) m.onStep(p.x, p.y);
  objsAt(p.x, p.y).forEach(o => { if (o.onStep) run(() => o.onStep(o)); });
}
function facingTile() { const p = G.player; const [dx, dy] = DIRS[p.dir]; return [p.x + dx, p.y + dy]; }
function interactTarget() {
  const p = G.player; if (!p || p.moving) return null;
  const [fx, fy] = facingTile();
  let o = objsAt(fx, fy).find(o => o.on);
  if (!o) o = objsAt(p.x, p.y).find(o => o.on && o.solid === false);
  return o || null;
}
function handleAction(a) {
  const m = G.map;
  if (a === 'pause') { if (canAct() || G.allowMove) window.openPause && openPause(); return; }
  if (a === 'journal' || a === 'inv') { if (canAct() || G.allowMove) window.openJournal && openJournal(a === 'inv' ? 'items' : 'rules'); return; }
  if (a === 'ok') {
    if (m && m.interceptOk && m.interceptOk()) return;
    if (!canAct()) return;
    const o = interactTarget();
    if (o) run(() => o.on(o));
  }
}

/* ---------------- Rendering ---------------- */
const grainFrames = [];
for (let k = 0; k < 4; k++) {
  const c = document.createElement('canvas'); c.width = 160; c.height = 90; const g = c.getContext('2d');
  const id = g.createImageData(160, 90);
  for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); grainFrames.push(c);
}
const vignette = (() => {
  const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d');
  const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.85)');
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH); return c;
})();

function playerPx() { const p = G.player; return [p.fx * TILE, p.fy * TILE]; }

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const m = G.map;
  if (m && G.player) {
    const [ppx, ppy] = playerPx();
    const mw = m.w * TILE, mh = m.h * TILE;
    let cx = m.camX !== undefined ? m.camX : ppx + 16 - VW / 2;
    let cy = m.camY !== undefined ? m.camY : ppy + 16 - VH / 2;
    cx = mw <= VW ? (mw - VW) / 2 : clamp(cx, 0, mw - VW);
    cy = mh <= VH ? (mh - VH) / 2 : clamp(cy, 0, mh - VH);
    G.cam.x = Math.round(cx); G.cam.y = Math.round(cy);
    let sx = 0, sy = 0;
    if (G.fx.shake > 0) { sx = rnd(-1, 1) * G.fx.shake; sy = rnd(-1, 1) * G.fx.shake; }
    ctx.save();
    ctx.translate(-G.cam.x + Math.round(sx), -G.cam.y + Math.round(sy));
    ctx.drawImage(m.tileCanvas, 0, 0);
    if (m.drawFloor) m.drawFloor(ctx, G.t);
    // floor & wall-layer objects
    const vis = m.objs.filter(o => !o.hidden && o.draw);
    vis.filter(o => o.layer === 'floor' || o.layer === 'wall').forEach(o => drawObj(o));
    // y-sorted
    const list = vis.filter(o => o.layer !== 'floor' && o.layer !== 'wall' && o.layer !== 'top').map(o => ({ y: (o.y + (o.h || 1)) * TILE - 1 + (o.z || 0), d: () => drawObj(o) }));
    (m.ents || []).forEach(e => { if (!e.hidden) list.push({ y: (e.y + 1) * TILE + (e.z || 0), d: () => drawEnt(e) }); });
    if (!G.hidePlayer) list.push({ y: (ppy + TILE), d: () => SPR.player(ctx, Math.round(ppx), Math.round(ppy), G.player, G.t) });
    list.sort((a, b) => a.y - b.y).forEach(i => i.d());
    vis.filter(o => o.layer === 'top').forEach(o => drawObj(o));
    if (m.drawAbove) m.drawAbove(ctx, G.t);
    ctx.restore();
    renderLighting(m);
    if (m.drawOverlay) m.drawOverlay(ctx, G.t);
    // interaction prompt
    if (canAct()) {
      const o = interactTarget();
      if (o && !o.noPrompt) {
        const bx = (o.x + (o.w || 1) / 2) * TILE - G.cam.x, by = o.y * TILE - G.cam.y - (o.promptY || 12) + Math.sin(G.t * 5) * 2;
        ctx.fillStyle = 'rgba(10,2,3,.85)'; ctx.fillRect(bx - 7, by - 7, 14, 13);
        ctx.strokeStyle = '#b33'; ctx.lineWidth = 1; ctx.strokeRect(bx - 6.5, by - 6.5, 13, 12);
        ctx.fillStyle = '#f2d9c4'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('E', bx, by);
      }
    }
  }
  postFX();
}
function drawObj(o) {
  const x = o.x * TILE, y = o.y * TILE;
  if (typeof o.draw === 'function') o.draw(ctx, x, y, o, G.t);
  else if (SPR[o.draw]) SPR[o.draw](ctx, x, y, o, G.t);
  if (o.mem && !G.memories.includes(o.mem)) SPR.memory(ctx, x, y, o, G.t);
}
function drawEnt(e) {
  const x = Math.round(e.x * TILE), y = Math.round(e.y * TILE);
  ctx.save(); if (e.alpha !== undefined) ctx.globalAlpha = clamp(e.alpha, 0, 1);
  if (typeof e.draw === 'function') e.draw(ctx, x, y, e, G.t); else if (SPR[e.draw]) SPR[e.draw](ctx, x, y, e, G.t);
  ctx.restore();
}

function renderLighting(m) {
  const d = typeof m.dark === 'function' ? m.dark() : m.dark;
  const cam = G.cam;
  const lights = [];
  const [ppx, ppy] = playerPx();
  if (m.playerLight) lights.push({ x: ppx + 16, y: ppy + 12, r: m.playerLight * (1 + Math.sin(G.t * 9) * 0.015), a: 1 });
  m.objs.forEach(o => { if (!o.hidden && o.light) { const L = typeof o.light === 'function' ? o.light(o, G.t) : o.light; if (L) lights.push(Object.assign({ x: (o.x + (o.w || 1) / 2) * TILE, y: (o.y + (o.h || 1) / 2) * TILE }, L)); } });
  if (m.lights) lights.push(...m.lights(G.t));
  if (d > 0) {
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, VW, VH);
    lctx.fillStyle = `rgba(${m.darkColor || '0,0,0'},${d})`; lctx.fillRect(0, 0, VW, VH);
    lctx.globalCompositeOperation = 'destination-out';
    lights.forEach(L => {
      const x = L.x - cam.x, y = L.y - cam.y, r = L.r * (L.flicker ? (0.85 + Math.random() * 0.15) : 1);
      if (r <= 0) return;
      const gr = lctx.createRadialGradient(x, y, 0, x, y, r);
      const a = L.a === undefined ? 1 : L.a;
      gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.55, `rgba(0,0,0,${a * 0.7})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = gr; lctx.beginPath(); lctx.arc(x, y, r, 0, 7); lctx.fill();
    });
    if (m.cutLight) m.cutLight(lctx, cam, G.t);
    lctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lightCvs, 0, 0);
  }
  // colored glows
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  lights.forEach(L => {
    if (!L.color) return;
    const x = L.x - cam.x, y = L.y - cam.y, r = L.r * 0.8;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${L.color},${L.ga || 0.25})`); gr.addColorStop(1, `rgba(${L.color},0)`);
    ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });
  if (m.drawLight) m.drawLight(ctx, cam, G.t);
  ctx.restore();
}

const HALLU = ['14:17', 'ขับช้าๆ', 'มองถนนสิ', 'ปฐพี', 'ทำไมไม่ตอบ', 'ข้างขวา', 'หนาว', 'ช่วยด้วย'];
let halluText = null, halluT = 0;
function postFX() {
  const fx = G.fx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = G.sanity;
  if (G.running && s < 55) { ctx.fillStyle = `rgba(70,0,0,${(55 - s) / 55 * 0.28})`; ctx.fillRect(0, 0, VW, VH); }
  if (fx.red > 0) { ctx.fillStyle = `rgba(120,0,0,${fx.red})`; ctx.fillRect(0, 0, VW, VH); }
  // glitch slices
  const gl = fx.glitch + (G.running && s < 25 ? 0.08 : 0);
  if (gl > 0 && Math.random() < gl * 1.6) {
    const n = 2 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
      const y = Math.random() * VH, h = 2 + Math.random() * 18, off = (Math.random() - 0.5) * 40 * Math.min(1, gl * 2);
      ctx.drawImage(cvs, 0, y, VW, h, off, y, VW, h);
    }
    if (Math.random() < 0.3) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25; ctx.drawImage(cvs, 3, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  }
  // hallucination text
  if (G.running && s < 35 && !halluText && Math.random() < 0.006) { halluText = { t: HALLU[Math.floor(Math.random() * HALLU.length)], x: rnd(60, VW - 160), y: rnd(60, VH - 60) }; halluT = 0.5; }
  if (halluText) {
    halluT -= 1 / 60; ctx.font = '22px Taviraj, serif'; ctx.fillStyle = `rgba(170,20,20,${Math.max(0, halluT) * 0.8})`; ctx.textAlign = 'left'; ctx.fillText(halluText.t, halluText.x, halluText.y);
    if (halluT <= 0) halluText = null;
  }
  if (fx.flash > 0) { ctx.fillStyle = `rgba(${fx.flashColor},${fx.flash})`; ctx.fillRect(0, 0, VW, VH); }
  if (fx.white > 0) { ctx.fillStyle = `rgba(255,250,245,${fx.white})`; ctx.fillRect(0, 0, VW, VH); }
  ctx.drawImage(vignette, 0, 0);
  ctx.globalAlpha = 0.07 + (G.running ? (100 - s) / 100 * 0.06 : 0);
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainFrames[Math.floor(G.t * 24) % 4], 0, 0, VW, VH);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}

/* ---------------- Simple helpers for chapters ---------------- */
function bfsStep(sx, sy, tx, ty, passFn, maxN = 900) {
  if (sx === tx && sy === ty) return null;
  const key = (x, y) => x + ',' + y;
  const prev = new Map(); prev.set(key(sx, sy), null);
  const q = [[sx, sy]]; let n = 0;
  while (q.length && n++ < maxN) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = key(nx, ny);
      if (prev.has(k)) continue;
      if (!(nx === tx && ny === ty) && !passFn(nx, ny)) continue;
      prev.set(k, [x, y]); q.push([nx, ny]);
    }
  }
  let cur = [tx, ty]; if (!prev.has(key(tx, ty))) return null;
  while (true) { const p = prev.get(key(cur[0], cur[1])); if (!p) return null; if (p[0] === sx && p[1] === sy) return cur; cur = p; }
}
function walkablePlain(x, y) { return WALKABLE.has(tileAt(x, y)) && !objsAt(x, y).some(o => o.solid !== false); }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

async function walkPlayer(path) {
  // path: array of dirs e.g. ['up','up']
  G.allowMove = false; G.lockMove = true;
  for (const d of path) {
    const p = G.player; const [dx, dy] = DIRS[d]; p.dir = d;
    p.moving = true; p.tx = p.x + dx; p.ty = p.y + dy; p.mt = 0; p.step = (p.step + 1) % 4; Sound.step();
    await wait(G.stepTime * 1000 + 20);
    if (p.moving) { p.moving = false; p.x = p.tx; p.y = p.ty; p.fx = p.x; p.fy = p.y; }
  }
  G.lockMove = false;
}
async function moveEnt(e, tx, ty, ms) {
  const sx = e.x, sy = e.y, t0 = performance.now();
  await new Promise(res => {
    const g = G.gen;
    const f = () => { if (g !== G.gen) return; const k = Math.min(1, (performance.now() - t0) / ms); e.x = sx + (tx - sx) * k; e.y = sy + (ty - sy) * k; if (k < 1) requestAnimationFrame(f); else res(); };
    f();
  });
}

/* QTE: mash or press within window */
function qteMash(label, need = 12, ms = 4000) {
  const g = G.gen;
  return new Promise(res => {
    const el = $('#qte'); el.hidden = false; el.querySelector('.qte-label').textContent = label;
    const bar = el.querySelector('.qte-bar i'); let v = 0, done = false; const t0 = performance.now();
    const L = pushLayer({ key(a) { if (a === 'ok') { v += 1; Sound.tick(); shake(2, 80); } } });
    const iv = setInterval(() => {
      v = Math.max(0, v - 0.06);
      bar.style.width = clamp(v / need * 100, 0, 100) + '%';
      if (v >= need) end(true); else if (performance.now() - t0 > ms) end(false);
    }, 30);
    function end(ok) { if (done) return; done = true; clearInterval(iv); popLayer(L); el.hidden = true; if (g === G.gen) res(ok); }
  });
}
function qtePress(label, ms = 2200) {
  const g = G.gen;
  return new Promise(res => {
    const el = $('#qte'); el.hidden = false; el.querySelector('.qte-label').textContent = label;
    const bar = el.querySelector('.qte-bar i'); bar.style.transition = 'none'; bar.style.width = '100%';
    void bar.offsetWidth; bar.style.transition = `width ${ms}ms linear`; bar.style.width = '0%';
    let done = false;
    const L = pushLayer({ key(a) { if (a === 'ok') end(true); } });
    const tm = setTimeout(() => end(false), ms);
    function end(ok) { if (done) return; done = true; clearTimeout(tm); popLayer(L); el.hidden = true; bar.style.transition = 'none'; if (g === G.gen) res(ok); }
  });
}
function qteHold(label, ms = 3500) {
  const g = G.gen;
  return new Promise(res => {
    const el = $('#qte'); el.hidden = false; el.querySelector('.qte-label').textContent = label;
    const bar = el.querySelector('.qte-bar i'); bar.style.transition = 'none';
    let v = 0, done = false;
    const L = pushLayer({ key() { } });
    const iv = setInterval(() => {
      if (Input.held.ok) v += 30; else v = Math.max(0, v - 45);
      bar.style.width = clamp(v / ms * 100, 0, 100) + '%';
      G.fx.white = clamp(v / ms, 0, 1) * 0.35;
      if (Input.held.ok && Math.random() < 0.2) Sound.thump(0.25);
      if (v >= ms) end();
    }, 30);
    function end() { if (done) return; done = true; clearInterval(iv); popLayer(L); el.hidden = true; if (g === G.gen) res(true); }
  });
}

requestAnimationFrame(loop);
