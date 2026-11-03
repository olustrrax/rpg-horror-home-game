'use strict';
/* =========================================================
   Main — flow, save, menus, journal, endings
   ========================================================= */
const SAVE_KEY = 'danchamra_save_v1';
const END_KEY = 'danchamra_endings_v1';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } },
};

function snapshot() {
  return {
    chapter: G.chapter, sanity: G.sanity, mode: G.mode,
    inv: G.inv.map(i => Object.assign({}, i)), flags: JSON.parse(JSON.stringify(G.flags)),
    memories: G.memories.slice(), notes: Object.assign({}, G.notes), broken: Object.assign({}, G.broken),
  };
}
function restore(s) {
  G.chapter = s.chapter; G.sanity = s.sanity; G.mode = s.mode || 'easy';
  G.inv = s.inv.map(i => Object.assign({}, i)); G.flags = JSON.parse(JSON.stringify(s.flags));
  G.memories = s.memories.slice(); G.notes = Object.assign({}, s.notes); G.broken = Object.assign({}, s.broken || {});
}

function resetUI() {
  clearLayers();
  ['#dialog', '#choices', '#modal', '#ring-ui', '#qte', '#gameover', '#card-screen'].forEach(s => { const e = $(s); e.hidden = true; });
  $('#modal').innerHTML = '';
  document.querySelectorAll('.end-screen').forEach(e => e.remove());
  clearSubtitle();
  G.fx.red = 0; G.fx.white = 0; G.fx.glitch = 0; G.fx.flash = 0;
}

function startChapter(n, opts = {}) {
  G.gen++;
  G.busy = 0; G.allowMove = false; G.lockMove = false; G.dead = false;
  resetUI();
  Sound.heart(0);
  G.chapter = n;
  if (!opts.keepSanity) G.sanity = clamp(Math.max(G.sanity, 60) + 15, 0, 100);
  updateSanityHUD();
  // per-chapter transient flags are kept in G.flags; checkpoint snapshot at chapter start
  G.checkpoint = snapshot();
  store.set(SAVE_KEY, G.checkpoint);
  G.running = true;
  $('#hud').hidden = false; $('#title-screen').hidden = true;
  setObjective('');
  fadeInstant(1);
  CHAPTERS[n].start();
}
async function nextChapter() {
  const g = G.gen;
  await fade(1, 1300);
  if (g !== G.gen) return;
  startChapter(G.chapter + 1);
}

function newGame(mode) {
  if (mode) G.mode = mode;
  G.inv = []; G.flags = {}; G.memories = []; G.notes = {}; G.broken = {}; G.sanity = 100;
  startChapter(1, { keepSanity: true });
}
function continueGame() {
  const s = store.get(SAVE_KEY); if (!s) return newGame();
  restore(s);
  startChapter(s.chapter, { keepSanity: true });
}

/* ---------------- Game over ---------------- */
function gameOver(msg, title) {
  if (!G.running) return;
  G.gen++; G.running = false; G.busy = 0; G.dead = true;
  resetUI();
  Sound.stopAmbient(0.5); Sound.heart(0);
  Sound.scream(1.3); Sound.flatline(2.5);
  const el = $('#gameover');
  el.innerHTML = `<div class="go-title">${title || 'สติแตกสลาย'}</div>
    <div class="go-msg">${msg || 'จิตใจของปฐพีแตกเป็นเสี่ยงๆ ในแดนชำระ... ความจริงยังรออยู่ที่เดิม'}</div>
    <div class="t-menu"></div>`;
  el.hidden = false;
  $('#hud').hidden = true;
  menuList(el.querySelector('.t-menu'), [
    ['ลองบทนี้อีกครั้ง', () => { el.hidden = true; restore(G.checkpoint); G.sanity = Math.max(G.sanity, 70); startChapter(G.checkpoint.chapter, { keepSanity: true }); }],
    ['กลับหน้าหลัก', () => { el.hidden = true; showTitle(); }],
  ]);
}
window.gameOver = gameOver;

/* generic menu list with its own input layer */
function menuList(container, items, opt = {}) {
  container.innerHTML = '';
  let idx = 0;
  const els = items.map((it, i) => {
    const d = document.createElement('div'); d.className = 'c-item'; d.textContent = it[0];
    d.onclick = () => { idx = i; pick(); }; d.onmouseenter = () => { idx = i; upd(); };
    container.appendChild(d); return d;
  });
  function upd() { els.forEach((d, i) => d.classList.toggle('sel', i === idx)); }
  let done = false;
  function pick() { if (done) return; done = true; Sound.init(); Sound.click(); popLayer(L); items[idx][1](); }
  const L = pushLayer({
    freeze: true,
    key(a) {
      if (a === 'up') { idx = (idx + els.length - 1) % els.length; upd(); Sound.tick(); }
      else if (a === 'down') { idx = (idx + 1) % els.length; upd(); Sound.tick(); }
      else if (a === 'ok') pick();
      else if (a === 'cancel' && opt.onCancel) { done = true; popLayer(L); opt.onCancel(); }
    }
  });
  upd();
  return { close() { if (!done) { done = true; popLayer(L); } } };
}

/* ---------------- Title ---------------- */
function showTitle() {
  G.gen++; G.running = false; G.map = null; G.busy = 0;
  resetUI();
  Sound.stopAmbient(1); Sound.heart(0);
  $('#hud').hidden = true;
  fadeInstant(0);
  const t = $('#title-screen'); t.hidden = false;
  const save = store.get(SAVE_KEY);
  const ends = store.get(END_KEY) || [];
  const items = [];
  if (save && save.chapter > 1) items.push([`เล่นต่อ — บทที่ ${save.chapter} (${MODE_NAME[save.mode || 'easy']})`, () => { Sound.init(); continueGame(); }]);
  items.push(['เริ่มเกมใหม่', () => { Sound.init(); pickMode(m => { if (save) store.del(SAVE_KEY); newGame(m); }); }]);
  if (ends.length) items.push(['เลือกบท', () => pickMode(m => { G.mode = m; chapterSelect(); })]);
  items.push([`เสียง: ${Sound.isEnabled() ? 'เปิด' : 'ปิด'}`, () => { Sound.setEnabled(!Sound.isEnabled()); showTitle(); }]);
  if (ends.length) items.push([`ตอนจบที่พบแล้ว: ${ends.map(e => e === 'true' ? 'Acceptance' : 'Denial').join(' · ')}`, () => showTitle()]);
  menuList($('#title-menu'), items);
}
const MODE_NAME = { easy: 'ง่าย', hard: 'ยาก' };
function pickMode(cb) {
  const t = $('#title-menu');
  menuList(t, [
    ['ง่าย — บอกกฎที่ต้องระวังก่อนเริ่มแต่ละบท', () => cb('easy')],
    ['ยาก — ไม่บอกกฎ ต้องจำหรือเปิดสมุดทบทวนเอง', () => cb('hard')],
    ['← กลับ', () => showTitle()],
  ], { onCancel: showTitle });
}
function chapterSelect() {
  const t = $('#title-menu');
  const items = CHAPTERS.slice(1).map((c, i) => [`${i + 1}. ${c.title}`, () => {
    G.inv = []; G.flags = {}; G.memories = []; G.notes = {}; G.broken = {}; G.sanity = 100;
    // give sensible items for skipped chapters
    const n = i + 1;
    if (n >= 2) { addItem('card', 'นามบัตรทนาย', 'ชื่อบนนามบัตรเลือนจนอ่านไม่ออก', true); addItem('rules', 'สมุดกฎ ๙ ข้อ', 'สมุดปกหนังสีดำ', true); G.flags.shoes = true; }
    if (n >= 3) addItem('recipe', 'การ์ดสูตรอาหาร', 'การ์ดสูตร "ข้าวผัดของมิ้น"', true);
    if (n >= 4) addItem('hand', 'เข็มนาฬิกาสั้น', 'เข็มชั่วโมงสีทอง', true);
    if (n >= 5) { G.flags.sawWound = true; G.flags.woundVisible = true; }
    for (let k = 1; k < n; k++) { const map = { 2: 2, 3: 3, 4: 5, 5: 6, 6: 4, 7: 1, 8: 8 }; if (map[k]) G.notes[map[k]] = true; }
    startChapter(n, { keepSanity: true });
  }]);
  items.push(['← กลับ', () => showTitle()]);
  menuList(t, items, { onCancel: showTitle });
}

/* ---------------- Pause & Journal ---------------- */
function openPause() {
  const panel = document.createElement('div'); panel.className = 'panel menu-list'; panel.style.minWidth = '40%';
  panel.innerHTML = '<h2>หยุดชั่วคราว</h2><div class="list"></div><div class="hint">เกมบันทึกอัตโนมัติเมื่อเริ่มแต่ละบท</div>';
  const m = $('#modal'); m.innerHTML = ''; m.appendChild(panel); m.hidden = false;
  const close = () => { m.hidden = true; m.innerHTML = ''; };
  menuList(panel.querySelector('.list'), [
    ['กลับไปเล่น', close],
    ['สมุดกฎ / ของ / ความทรงจำ', () => { close(); openJournal('rules'); }],
    [`เสียง: ${Sound.isEnabled() ? 'เปิด' : 'ปิด'}`, () => { Sound.setEnabled(!Sound.isEnabled()); close(); openPause(); }],
    [`ระดับความยาก: ${MODE_NAME[G.mode]} (แตะเพื่อสลับ)`, () => { G.mode = G.mode === 'hard' ? 'easy' : 'hard'; if (G.checkpoint) { G.checkpoint.mode = G.mode; store.set(SAVE_KEY, G.checkpoint); } close(); openPause(); }],
    ['เริ่มบทนี้ใหม่', () => { close(); restore(G.checkpoint); startChapter(G.checkpoint.chapter, { keepSanity: true }); }],
    ['กลับหน้าหลัก', () => { close(); showTitle(); }],
  ], { onCancel: close });
}
window.openPause = openPause;

const READABLE = {
  recipe: () => CH2.readRecipe(),
  schedule: () => CH5.readSchedule(),
  card: () => showHTML(`<div class="bizcard"><div class="bc-role">ทนายความ · ผู้จัดการมรดก</div><div class="bc-name">นาย ████ ███████</div><div class="bc-line">ติดต่อ: บ้านเลขที่ ๗ ซอยไม่มีชื่อ<br>เวลาทำการ: หลังเที่ยงคืน — ก่อนรุ่งสาง</div><div class="bc-stamp">รับรอง<br>๗ วัน</div><div class="bc-brand">Thorani Techno<br>https://thorani.co/</div></div>`),
};
function openJournal(tab = 'rules') {
  const tabs = ['rules', 'items', 'mem'];
  let ti = Math.max(0, tabs.indexOf(tab)), sel = 0;
  const panel = document.createElement('div'); panel.className = 'panel journal';
  panel.innerHTML = `<div class="j-tabs"><div class="j-tab" data-t="0">กฎ ๙ ข้อ</div><div class="j-tab" data-t="1">ของที่ถือ</div><div class="j-tab" data-t="2">ความทรงจำ</div><div class="j-tab j-close">✕ ปิด</div></div><div class="j-body"></div><div class="hint kbd">← → เปลี่ยนหน้า · ↑ ↓ เลือก · E อ่าน · X / J ปิด</div>`;
  const body = panel.querySelector('.j-body');
  function draw() {
    panel.querySelectorAll('.j-tab').forEach((t, i) => t.classList.toggle('sel', i === ti));
    if (ti === 0) {
      body.innerHTML = RULES.map((r, i) => `<div class="rule${G.broken[i + 1] ? ' broken' : ''}"><b>${i + 1}. ${r}</b>${G.notes[i + 1] ? `<span class="rn">— ${RULE_TRUTH[i]}</span>` : ''}</div>`).join('') +
        `<div class="hint">ลงชื่อ: ผู้จัดการมรดก — "ทำตามกฎ แล้วทุกอย่างจะเป็นของท่าน"</div>`;
    } else if (ti === 1) {
      if (!G.inv.length) { body.innerHTML = '<div class="item-row">— ไม่มีอะไรติดตัว —</div>'; return; }
      sel = clamp(sel, 0, G.inv.length - 1);
      body.innerHTML = G.inv.map((it, i) => `<div class="item-row" style="${i === sel ? 'background:rgba(120,20,20,.3)' : ''}" data-i="${i}"><b>${it.name}</b>${READABLE[it.id] ? ` <span style="display:inline;color:#c66">${IS_TOUCH ? '(แตะเพื่ออ่าน)' : '[E] อ่าน'}</span>` : ''}<span>${it.desc || ''}</span></div>`).join('');
      body.querySelectorAll('.item-row').forEach(r => r.onclick = () => { sel = +r.dataset.i; read(); });
    } else {
      body.innerHTML = MEMS.map((m, i) => G.memories.includes(i + 1) ? `<div class="mem-row">${i + 1}. ${m.mem}</div>` : `<div class="mem-row lock">${i + 1}. ░░░░░░░░ (ยังหาไม่พบ)</div>`).join('') +
        `<div class="hint">เศษความทรงจำ ${G.memories.length}/8 — ซ่อนอยู่บทละชิ้น สังเกตประกายเล็กๆ ตามข้าวของ</div>`;
    }
  }
  let h;
  async function read() {
    const it = G.inv[sel]; if (!it || !READABLE[it.id]) return;
    h.close(); await READABLE[it.id](); openJournal('items');
  }
  h = openModal(panel, {
    key(a) {
      if (a === 'left') { ti = (ti + 2) % 3; draw(); Sound.tick(); }
      else if (a === 'right') { ti = (ti + 1) % 3; draw(); Sound.tick(); }
      else if (a === 'up' && ti === 1) { sel = Math.max(0, sel - 1); draw(); }
      else if (a === 'down' && ti === 1) { sel = Math.min(G.inv.length - 1, sel + 1); draw(); }
      else if (a === 'ok' && ti === 1) read();
      else if (a === 'cancel' || a === 'journal' || a === 'pause' || a === 'inv' || a === 'ok') h.close();
    }, closeOnClick: () => h.close()
  });
  panel.querySelectorAll('.j-tab').forEach(t => t.onclick = e => { e.stopPropagation(); ti = +t.dataset.t; draw(); });
  panel.querySelector('.j-close').onclick = e => { e.stopPropagation(); h.close(); };
  draw();
}
window.openJournal = openJournal;

/* ---------------- Endings ---------------- */
function limboMap() {
  return {
    name: 'limbo', floor: 'wood', floor2: 'carpet', seed: 5, wall: { face: '#4a3c36', stripe: '#433530', base: '#211612' },
    grid: ['###########', '###########', '#...===...#', '#...===...#', '#...===...#', '#...===...#', '#...===...#', '#...===...#', '#####F#####'],
    dark: 0.35, playerLight: 140,
    legend: { F: { id: 'front', draw: 'doorBottom', layer: 'wall' } },
  };
}
function recordEnding(kind) {
  const e = store.get(END_KEY) || []; if (!e.includes(kind)) e.push(kind); store.set(END_KEY, e);
  store.del(SAVE_KEY);
}

function startEnding(kind) {
  if (kind === 'true') { recordEnding('true'); return endScreen('true'); }
  // Denial
  G.gen++; G.busy = 0; resetUI();
  Sound.heart(0);
  G.chapter = 10;
  setChapterLabel('บทที่ 10 — ครบเจ็ดวัน');
  setClock('07:00');
  Sound.ambient('limbo');
  loadMap(limboMap(), 5, 7, 'up');
  const law = { id: 'lawyer', x: 5, y: 3, draw: 'lawyer', dir: 'down', solid: true, case: true };
  G.map.ents.push(law);
  G.running = true; $('#hud').hidden = false;
  run(async () => {
    fadeInstant(1);
    await chapterCard(CH10.num, CH10.title, CH10.en, 'วันที่ 7 · รุ่งเช้า');
    await fade(0, 1800);
    await say('', 'แสงแดดอุ่นๆ ส่องเข้ามาในโถงบ้าน ไม่มีคราบเลือด ไม่มีเสียงกรีดร้อง ทุกอย่างสะอาดเอี่ยม');
    await talk([
      ['ทนาย', 'ครบเจ็ดวันแล้วครับ คุณปฐพี ท่านทำได้ดีมาก'],
      ['ทนาย', 'ตามสัญญา... บ้านหลังนี้ และเงินสดสามล้านบาท เป็นของท่านแล้ว'],
    ]);
    law.case = false;
    const bc = addObj({ id: 'case', x: 5, y: 5, draw: 'briefcase' });
    Sound.knock();
    await say('', 'ทนายวางกระเป๋าหนังใบหนึ่งลงตรงหน้าฉัน');
    await choose(['เปิดกระเป๋า']);
    bc.open = true; Sound.stinger(); G.fx.glitch = 0.8;
    await say('', 'ไม่มีเงิน... มีแต่เศษกระดูกชิ้นเล็กชิ้นน้อย กับเถ้าสีเทาที่ยังอุ่นอยู่');
    await say('', 'ปะปนอยู่ในกองเถ้า... ต่างหูมุกข้างเดียว');
    await talk([
      ['ทนาย', 'นี่คือทุกอย่างที่ท่านเลือกจะเก็บไว้ครับ'],
      ['ทนาย', 'ความทรงจำที่ท่านไม่ยอมมอง ก็เป็นได้แค่เถ้าถ่านที่ไม่มีวันได้ฝังครับ'],
    ]);
    G.map.dark = 0.8; Sound.stopAmbient(1);
    await wait(800);
    Sound.flatline(6);
    await say('', 'ตี๊ด——————————————————', { speed: 60 });
    for (let i = 0; i < 25; i++) { G.fx.white = i / 25; await wait(60); }
    await wait(800);
    G.running = false; G.map = null; G.fx.white = 0;
    $('#hud').hidden = true;
    fadeInstant(1);
    Sound.ambient('hospital');
    await say('', 'ปฐพีลืมตาขึ้นบนเตียงโรงพยาบาล...');
    await say('', 'บนโต๊ะข้างเตียง มีนามบัตรใบหนึ่งวางไว้ตรงกลางพอดี เหมือนมีคนจงใจวางให้เห็น');
    await say('', '...ตี๊ด ...ตี๊ด ...ตี๊ด');
    recordEnding('denial');
    endScreen('denial');
  });
}

function endScreen(kind) {
  G.gen++; G.running = false; G.busy = 0;
  const g0 = G.gen;
  resetUI();
  Sound.heart(0);
  $('#hud').hidden = true;
  fadeInstant(0);
  G.fx.white = 0;
  if (kind === 'true') Sound.ambient('limbo'); else Sound.stopAmbient(2);
  const scr = document.createElement('div'); scr.className = 'end-screen';
  const c = document.createElement('canvas'); c.width = 640; c.height = 360; scr.appendChild(c);
  const brand = document.createElement('div'); brand.className = 'end-brand'; brand.textContent = 'Thorani Techno — https://thorani.co/'; scr.appendChild(brand);
  $('#stage').appendChild(scr);
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  // pre-render floor
  const floor = document.createElement('canvas'); floor.width = 1100; floor.height = 360; const f = floor.getContext('2d');
  const Rn = seeded(42);
  f.fillStyle = '#2b2a2a'; f.fillRect(0, 0, 1100, 360);
  for (let i = 0; i < 3000; i++) { f.fillStyle = Rn() < 0.5 ? '#232222' : '#333131'; f.fillRect(Rn() * 1100, Rn() * 360, 2, 2); }
  f.strokeStyle = '#121111'; f.lineWidth = 2;
  for (let k = 0; k < 14; k++) { f.beginPath(); let x = Rn() * 1100, y = Rn() * 360; f.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (Rn() - 0.5) * 120; y += (Rn() - 0.5) * 90; f.lineTo(x, y); } f.stroke(); }
  if (kind === 'true') { f.fillStyle = 'rgba(70,0,0,.35)'; f.beginPath(); f.ellipse(300, 260, 120, 30, 0.1, 0, 7); f.fill(); }
  // key ring
  const kx = 760, ky = 190;
  f.strokeStyle = '#9a9a9a'; f.lineWidth = 3; f.beginPath(); f.arc(kx, ky, 14, 0, 7); f.stroke();
  if (kind === 'true') {
    f.fillStyle = '#8a8a8a'; f.save(); f.translate(kx + 10, ky + 10); f.rotate(0.5); f.fillRect(0, -6, 26, 12); f.fillStyle = '#222'; f.fillRect(3, -4, 10, 8); f.fillStyle = '#9a9a9a'; f.fillRect(26, -2, 30, 4); f.fillRect(40, 2, 4, 4); f.fillRect(48, 2, 3, 3); f.restore();
    f.fillStyle = '#6a4a30'; f.beginPath(); f.arc(kx - 18, ky + 22, 9, 0, 7); f.fill(); f.beginPath(); f.arc(kx - 24, ky + 14, 4, 0, 7); f.arc(kx - 12, ky + 14, 4, 0, 7); f.fill();
  } else {
    f.fillStyle = '#b39a5a'; f.save(); f.translate(kx + 10, ky + 10); f.rotate(0.4); f.beginPath(); f.arc(0, 0, 8, 0, 7); f.fill(); f.fillRect(6, -2, 34, 5); f.fillRect(30, 3, 4, 6); f.fillRect(36, 3, 3, 4); f.restore();
  }
  // business card
  f.save(); f.translate(kx - 130, ky + 10); f.rotate(-0.15);
  f.fillStyle = 'rgba(0,0,0,.4)'; f.fillRect(4, 6, 120, 68);
  f.fillStyle = '#e8e2d4'; f.fillRect(0, 0, 120, 68);
  f.fillStyle = '#555'; f.fillRect(10, 12, 60, 3); f.fillRect(10, 20, 40, 2); f.fillRect(10, 34, 70, 2); f.fillRect(10, 40, 55, 2);
  f.strokeStyle = 'rgba(140,20,20,.5)'; f.lineWidth = 2; f.beginPath(); f.arc(70, 48, 11, 0, 7); f.stroke();
  f.fillStyle = 'rgba(30,30,30,.4)'; f.font = '6px sans-serif'; f.textAlign = 'right'; f.fillText('Thorani Techno', 114, 58); f.fillText('thorani.co', 114, 64);
  f.restore();
  let t0 = performance.now(), phase = 0;
  function frame() {
    if (g0 !== G.gen) return;
    const t = (performance.now() - t0) / 1000;
    const pan = Math.min(1, t / 7);
    const ease = pan < 0.5 ? 2 * pan * pan : 1 - Math.pow(-2 * pan + 2, 2) / 2;
    const ox = ease * (1100 - 640 - 120);
    g.fillStyle = '#000'; g.fillRect(0, 0, 640, 360);
    g.drawImage(floor, -ox, 0);
    const gr = g.createRadialGradient(kx - ox - 40, ky + 20, 30, kx - ox - 40, ky + 20, 380);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.92)');
    g.fillStyle = gr; g.fillRect(0, 0, 640, 360);
    if (kind === 'true') { g.fillStyle = `rgba(255,250,240,${Math.max(0, 0.6 - t * 0.12)})`; g.fillRect(0, 0, 640, 360); }
    if (t > 7.3 && phase === 0) { phase = 1; brand.style.opacity = 0.75; }
    if (t < 13.5) requestAnimationFrame(frame); else credits();
  }
  requestAnimationFrame(frame);
  function credits() {
    if (g0 !== G.gen) return;
    brand.style.opacity = 0;
    c.style.transition = 'opacity 1.5s'; c.style.opacity = 0;
    const cr = document.createElement('div'); cr.className = 'credits';
    const label = kind === 'true' ? 'ACCEPTANCE END — การยอมรับ' : 'DENIAL END — วงจรไม่รู้จบ';
    const epi = kind === 'true'
      ? `แดนชำระพังทลายลง<br>เสียงเครื่องวัดชีพจรในโรงพยาบาลค่อยๆ ช้าลง... และเงียบไปอย่างสงบ<br>วิญญาณสองดวงเดินออกจากซากเหล็กไปด้วยกัน<br>ไม่มีใครต้องรอใครอีกแล้ว`
      : `ปฐพีเลือกที่จะไม่มอง<br>บ้านหลังนั้นจึงรอเขาอยู่เสมอ<br>คืนแรก... คืนแรก... คืนแรก...`;
    cr.innerHTML = `
      <div class="end-tag">${label}</div>
      <div style="margin-top:calc(var(--u)*16);font-style:italic;color:#b9a99a">${epi}</div>
      <div class="k">ระดับความยาก</div><div>${MODE_NAME[G.mode]}</div>
      <div class="k">เศษความทรงจำที่พบ</div><div>${G.memories.length} / 8</div>
      ${kind === 'true' && G.memories.length >= 8 ? '<div style="color:#e9a">— มิ้นตอบตกลง —</div>' : ''}
      <h3 class="big">แดนชำระ</h3><div>กฎ ๙ ข้อของบ้านมรดก</div>
      <div class="k">เรื่อง · ออกแบบเกม · ปริศนา</div><div>ทีมพัฒนา rpg-horror-home-game</div>
      <div class="k">โปรแกรม · ภาพพิกเซล · เสียงสังเคราะห์</div><div>สร้างขึ้นทั้งหมดด้วยโค้ด (Canvas + WebAudio)</div>
      <div class="k">แรงบันดาลใจ</div><div>สยองขวัญจิตวิทยา · แดนชำระ · ความรู้สึกผิดที่ไม่เคยพูดออกมา</div>
      <div class="k">ขอขอบคุณผู้สนับสนุน</div><div>Thorani Techno</div><div style="color:#8a7e74">https://thorani.co/</div>
      <h3>ขอบคุณที่เล่นจนจบ</h3>
      <div style="font-style:italic;color:#c99">"ขับรถช้าๆ นะ"</div>
      ${kind === 'denial' ? '<div class="k">ยังมีอีกตอนจบหนึ่ง</div><div>ลองลงไปเผชิญความจริงในห้องใต้ดินดูไหม</div>' : ''}
      <div style="height:calc(var(--u)*60)"></div>`;
    scr.appendChild(cr);
    const H = () => cr.offsetHeight;
    const st = performance.now();
    const dur = 30000;
    let finished = false;
    function scroll() {
      if (g0 !== G.gen || finished) return;
      const k = Math.min(1, (performance.now() - st) / dur);
      const sh = $('#stage').offsetHeight;
      cr.style.transform = `translateY(${-k * (H() + sh * 0.35)}px)`;
      if (k < 1) requestAnimationFrame(scroll); else end();
    }
    requestAnimationFrame(scroll);
    const L = pushLayer({ freeze: true, key(a) { if (a === 'ok' || a === 'cancel' || a === 'pause') end(); } });
    function end() {
      if (finished) return; finished = true; popLayer(L);
      cr.style.transform = 'none'; cr.style.top = '0'; cr.innerHTML = '';
      const box = document.createElement('div'); box.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center';
      box.innerHTML = `<div class="end-tag" style="color:#c33;letter-spacing:.4em">${label}</div><div class="t-menu"></div>`;
      scr.appendChild(box);
      const items = [];
      if (kind === 'denial') items.push(['ลองบทที่ 9 อีกครั้ง — ลงไปเผชิญความจริง', () => { scr.remove(); retryCh9(); }]);
      items.push(['กลับหน้าหลัก', () => { scr.remove(); showTitle(); }]);
      menuList(box.querySelector('.t-menu'), items);
    }
  }
}
function retryCh9() {
  G.inv = []; G.flags = { shoes: true, sawWound: true, woundVisible: true }; G.notes = { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 8: true }; G.broken = {};
  G.memories = G.memories.slice(); G.sanity = 100;
  addItem('rules', 'สมุดกฎ ๙ ข้อ', 'สมุดปกหนังสีดำ', true);
  addItem('card', 'นามบัตรทนาย', 'ชื่อบนนามบัตรเลือนจนอ่านไม่ออก', true);
  startChapter(9, { keepSanity: true });
}

/* ---------------- Boot ---------------- */
(function boot() {
  const q = new URLSearchParams(location.search);
  const ch = +q.get('ch');
  if (q.get('mode') === 'hard') G.mode = 'hard';
  if (ch >= 1 && ch <= 10) {
    $('#title-screen').hidden = true;
    G.inv = []; G.flags = {}; G.memories = []; G.notes = {}; G.broken = {}; G.sanity = 100;
    if (ch >= 2) { addItem('rules', 'สมุดกฎ ๙ ข้อ', '', true); G.flags.shoes = true; }
    if (ch >= 3) addItem('recipe', 'การ์ดสูตรอาหาร', '', true);
    if (ch >= 4) addItem('hand', 'เข็มนาฬิกาสั้น', '', true);
    if (ch >= 5) { G.flags.sawWound = true; G.flags.woundVisible = true; }
    startChapter(ch, { keepSanity: true });
    return;
  }
  showTitle();
})();
window.__game = { G, startChapter, startEnding, endScreen, CHAPTERS };
