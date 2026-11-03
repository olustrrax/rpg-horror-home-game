'use strict';
/* =========================================================
   Sprites — procedural pixel art drawn with rects
   Signature: (ctx, px, py, obj, t)
   ========================================================= */
const SPR = {};
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function oval(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); }
function shadowAt(c, x, y, w = 10) { oval(c, x + 16, y + 29, w, 3.5, 'rgba(0,0,0,.38)'); }

const PLAYER_PAL = { skin: '#c4a28c', hair: '#17110f', shirt: '#7f8e95', pants: '#2a2a31', shoe: '#120c0b', blood: '#5e0d0d' };

function human(c, x, y, dir, step, pal, opt = {}) {
  if (!opt.noShadow) shadowAt(c, x, y);
  const lg = step === 1 ? 1 : step === 3 ? -1 : 0;
  // legs
  R(c, x + 11, y + 20, 4, 9 - (lg > 0 ? 2 : 0), pal.pants);
  R(c, x + 17, y + 20, 4, 9 - (lg < 0 ? 2 : 0), pal.pants);
  R(c, x + 11, y + 27 - (lg > 0 ? 2 : 0), 4, 2, pal.shoe);
  R(c, x + 17, y + 27 - (lg < 0 ? 2 : 0), 4, 2, pal.shoe);
  if (pal.dress) R(c, x + 9, y + 18, 14, 8, pal.shirt);
  // torso
  R(c, x + 9, y + 8, 14, 13, pal.shirt);
  R(c, x + 9, y + 8, 14, 2, 'rgba(255,255,255,.08)');
  if (pal.blood) { R(c, x + 15, y + 11, 4, 6, pal.blood); R(c, x + 10, y + 16, 3, 3, pal.blood); R(c, x + 19, y + 18, 2, 4, pal.blood); }
  // arms
  const sw = lg;
  R(c, x + 6, y + 9 + sw, 3, 10, pal.shirt); R(c, x + 23, y + 9 - sw, 3, 10, pal.shirt);
  R(c, x + 6, y + 19 + sw, 3, 2, pal.skin); R(c, x + 23, y + 19 - sw, 3, 2, pal.skin);
  if (opt.noHead) return;
  // head
  R(c, x + 10, y - 4, 12, 12, pal.skin);
  if (pal.longHair) {
    if (dir === 'up') R(c, x + 8, y - 5, 16, 24, pal.hair);
    else { R(c, x + 8, y - 5, 16, 6, pal.hair); R(c, x + 8, y - 1, 4, 20, pal.hair); R(c, x + 20, y - 1, 4, 20, pal.hair); R(c, x + 11, y, 10, 10 + (opt.faceCover ? 4 : 0), pal.hair); if (!opt.faceCover) R(c, x + 13, y + 6, 6, 3, pal.skin); }
    return;
  }
  if (dir === 'up') { R(c, x + 9, y - 5, 14, 12, pal.hair); }
  else if (dir === 'down') {
    R(c, x + 9, y - 5, 14, 4, pal.hair); R(c, x + 9, y - 1, 2, 5, pal.hair); R(c, x + 21, y - 1, 2, 5, pal.hair);
    R(c, x + 13, y + 2, 2, 2, '#111'); R(c, x + 18, y + 2, 2, 2, '#111'); R(c, x + 14, y + 6, 4, 1, '#6b4a40');
  } else {
    const L = dir === 'left';
    R(c, x + 9, y - 5, 14, 4, pal.hair); R(c, L ? x + 17 : x + 9, y - 1, 6, 6, pal.hair);
    R(c, L ? x + 11 : x + 19, y + 2, 2, 2, '#111');
  }
  if (opt.wound) {
    // crushed right side of skull (screen-left when facing down)
    const wx = dir === 'down' ? x + 9 : dir === 'up' ? x + 18 : dir === 'right' ? x + 13 : null;
    if (wx !== null) { R(c, wx, y - 3, 6, 7, '#5a0a0a'); R(c, wx + 1, y - 1, 3, 3, '#a8323a'); R(c, wx + 2, y + 4, 2, 6, '#5a0a0a'); }
  }
}

SPR.player = (c, x, y, p, t) => {
  if (G.playerPose === 'sit') {
    shadowAt(c, x, y);
    R(c, x + 9, y + 2, 14, 13, PLAYER_PAL.shirt); R(c, x + 10, y - 9, 12, 12, PLAYER_PAL.skin); R(c, x + 9, y - 10, 14, 4, PLAYER_PAL.hair);
    R(c, x + 13, y - 4, 2, 2, '#111'); R(c, x + 18, y - 4, 2, 2, '#111');
    R(c, x + 10, y + 15, 12, 5, PLAYER_PAL.pants); R(c, x + 11, y + 20, 4, 6, PLAYER_PAL.pants); R(c, x + 17, y + 20, 4, 6, PLAYER_PAL.pants);
    return;
  }
  if (G.playerPose === 'kneel') {
    shadowAt(c, x, y);
    R(c, x + 9, y + 10, 14, 12, PLAYER_PAL.shirt); R(c, x + 10, y, 12, 11, PLAYER_PAL.skin); R(c, x + 9, y - 1, 14, 6, PLAYER_PAL.hair);
    R(c, x + 8, y + 22, 16, 6, PLAYER_PAL.pants);
    return;
  }
  const walk = p.moving ? p.step : 0;
  const pal = Object.assign({}, PLAYER_PAL);
  if (G.flags.shoes) pal.shoe = '#2a0a08';
  human(c, x, y - (p.moving && (p.step % 2) ? 1 : 0), p.dir, walk, pal, { wound: G.flags.woundVisible || (G.sanity < 30 && Math.sin(t * 3) > 0.9) });
};

SPR.lawyer = (c, x, y, o, t) => {
  const pal = { skin: '#b9b0a8', hair: '#000', shirt: '#0c0c10', pants: '#0a0a0d', shoe: '#050505' };
  // no shadow on purpose (ไร้เงา)
  const dir = o.dir || 'down';
  R(c, x + 11, y + 20, 4, 10, pal.pants); R(c, x + 17, y + 20, 4, 10, pal.pants);
  R(c, x + 8, y + 2, 16, 19, pal.shirt);
  R(c, x + 5, y + 3, 3, 16, pal.shirt); R(c, x + 24, y + 3, 3, 16, pal.shirt);
  R(c, x + 5, y + 19, 3, 2, pal.skin); R(c, x + 24, y + 19, 3, 2, pal.skin);
  if (dir !== 'up') { R(c, x + 13, y + 2, 6, 6, '#d9d4cc'); R(c, x + 15, y + 4, 2, 9, '#6a0e10'); }
  // neck stump — void, faint smoke
  R(c, x + 12, y - 1, 8, 3, '#000');
  c.fillStyle = 'rgba(160,160,180,.12)';
  for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i * 0.25) % 1; c.fillRect(x + 13 + Math.sin(t * 2 + i) * 3, y - 2 - k * 14, 4, 3); }
  if (o.case) { R(c, x + 24, y + 16, 9, 8, '#2b1a12'); R(c, x + 27, y + 14, 3, 2, '#2b1a12'); R(c, x + 24, y + 19, 9, 1, '#5a4030'); }
};

SPR.mint = (c, x, y, o, t) => {
  const pal = { skin: '#d8cfc8', hair: '#060506', shirt: '#cfc8c0', pants: '#cfc8c0', shoe: '#9a8f88', blood: '#6e0b0b', longHair: true, dress: true };
  const j = o.jitter ? Math.round(Math.sin(t * 40) * 1) : 0;
  human(c, x + j, y, o.dir || 'down', 0, pal, { faceCover: true, noShadow: true });
  R(c, x + 12, y + 18, 8, 3, '#7a0c0c');
};

SPR.shadowSelf = (c, x, y, o, t) => {
  const j = () => Math.round((Math.random() - 0.5) * 2);
  c.save(); c.globalAlpha *= 0.92;
  const pal = { skin: '#000', hair: '#000', shirt: '#050304', pants: '#030203', shoe: '#000' };
  human(c, x + j(), y + j(), 'down', Math.floor(t * 6) % 4, pal, { noShadow: true });
  R(c, x + 13, y + 2, 2, 2, '#ff2a2a'); R(c, x + 18, y + 2, 2, 2, '#ff2a2a');
  R(c, x + 9, y + 2, 4, 6, '#3a0000'); // crushed side
  c.restore();
};

SPR.crawler = (c, x, y, o, t) => {
  const k = Math.sin(t * 8);
  oval(c, x + 16, y + 26, 15, 4, 'rgba(0,0,0,.5)');
  R(c, x + 4, y + 16, 22, 9, '#140708');
  R(c, x + 6, y + 18, 18, 2, '#2a0d0d');
  // arms reaching
  const dx = o.dir === 'left' ? -1 : 1;
  const ax = dx > 0 ? x + 24 : x - 4;
  R(c, ax, y + 18 + k * 2, 12, 2, '#d0c0b0'); R(c, ax + (dx > 0 ? 10 : 0), y + 15 + k * 2, 2, 5, '#d0c0b0');
  R(c, ax, y + 23 - k * 2, 12, 2, '#d0c0b0');
  // head + hair
  const hx = dx > 0 ? x + 20 : x;
  R(c, hx, y + 12, 10, 10, '#050405'); R(c, hx + (dx > 0 ? -6 : 8), y + 16, 8, 10, '#050405');
  R(c, hx + 3, y + 18, 2, 2, '#e8e0d0');
  R(c, x + 2, y + 24, 6, 3, '#5a0a0a');
};

SPR.ghostHand = (c, x, y, o, t) => {
  const k = Math.max(0, Math.sin(t * 3 + (o.ph || 0)));
  c.fillStyle = 'rgba(210,200,190,.8)';
  c.fillRect(x + 14, y + 30 - k * 14, 4, k * 14);
  c.fillRect(x + 11, y + 26 - k * 14, 10, 5);
};

/* ---------------- Furniture & props ---------------- */
SPR.hbed = (c, x, y, o) => { // hospital bed 1x2
  shadowAt(c, x, y + 32, 14);
  R(c, x + 2, y + 2, 28, 58, '#5f6266'); R(c, x + 4, y + 4, 24, 54, '#bdb6a3');
  R(c, x + 6, y + 6, 20, 10, '#d8d2c3');
  c.fillStyle = 'rgba(140,120,40,.45)'; c.beginPath(); c.ellipse(x + 16, y + 34, 7, 16, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(110,20,10,.4)'; c.beginPath(); c.ellipse(x + 13, y + 12, 5, 3, 0, 0, 7); c.fill();
  R(c, x + 2, y + 58, 28, 4, '#3a3d40'); R(c, x + 2, y, 28, 3, '#3a3d40');
};
SPR.monitor = (c, x, y, o, t) => {
  shadowAt(c, x, y, 8);
  R(c, x + 14, y + 10, 3, 18, '#555'); R(c, x + 8, y + 26, 16, 3, '#444');
  R(c, x + 4, y - 8, 24, 18, '#2a2d2e'); R(c, x + 6, y - 6, 20, 14, '#041208');
  c.strokeStyle = o.flat ? '#4f4' : '#3f6'; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i < 20; i++) {
    const ph = (i + t * 14) % 20; let v = 0;
    if (!o.flat && ph > 9 && ph < 11) v = ph < 10 ? -5 : 4;
    c.lineTo(x + 6 + i, y + 1 + v);
  }
  c.stroke();
};
SPR.nightstand = (c, x, y, o, t) => {
  shadowAt(c, x, y, 11);
  R(c, x + 4, y + 6, 24, 22, '#3b2a20'); R(c, x + 4, y + 6, 24, 3, '#4d382b'); R(c, x + 6, y + 14, 20, 1, '#22160f'); R(c, x + 15, y + 17, 3, 2, '#8a7b5a');
  if (o.card) { R(c, x + 9, y + 7, 9, 5, '#e6e0d4'); R(c, x + 10, y + 8, 5, 1, '#555'); }
  if (o.clock) { R(c, x + 10, y - 2, 12, 10, '#2a1a12'); R(c, x + 12, y, 8, 6, '#c9b9a0'); R(c, x + 16, y + 1, 1, 3, '#111'); }
};
SPR.ivstand = (c, x, y) => { shadowAt(c, x, y, 6); R(c, x + 15, y - 10, 2, 38, '#777'); R(c, x + 10, y - 12, 12, 2, '#888'); R(c, x + 18, y - 10, 6, 10, 'rgba(160,30,30,.7)'); R(c, x + 10, y + 27, 12, 2, '#555'); };
SPR.door = (c, x, y, o) => {
  const col = o.color || '#3a2418';
  R(c, x + 3, y - 4, 26, 36, '#140c09'); R(c, x + 5, y - 2, 22, 34, col);
  R(c, x + 7, y, 8, 12, 'rgba(0,0,0,.2)'); R(c, x + 17, y, 8, 12, 'rgba(0,0,0,.2)'); R(c, x + 7, y + 15, 8, 14, 'rgba(0,0,0,.2)'); R(c, x + 17, y + 15, 8, 14, 'rgba(0,0,0,.2)');
  R(c, x + 22, y + 14, 3, 3, '#b59a5a');
  if (o.fingers) { c.fillStyle = 'rgba(10,8,8,.8)'; [[21, 10], [24, 11], [22, 19], [25, 18], [23, 21]].forEach(([a, b]) => c.fillRect(x + a, y + b, 2, 2)); }
  if (o.chainLock) { R(c, x + 6, y + 10, 20, 2, '#777'); R(c, x + 6, y + 20, 20, 2, '#777'); R(c, x + 13, y + 12, 6, 7, '#555'); }
  if (o.bolt) { R(c, x + 6, y + 4, 10, 3, o.open ? '#555' : '#9a8a6a'); }
  if (o.blood) { c.fillStyle = 'rgba(110,0,0,.7)'; c.fillRect(x + 8, y + 6, 3, 18); c.fillRect(x + 12, y + 3, 2, 12); }
};
SPR.doorBottom = (c, x, y, o) => { // door on south wall (seen from inside, as dark opening)
  R(c, x + 3, y, 26, 32, '#0d0807'); R(c, x + 5, y + 2, 22, 30, o.color || '#2b1b13'); R(c, x + 22, y + 14, 3, 3, '#a28a4a');
  if (o.fingers) { c.fillStyle = 'rgba(8,6,6,.85)'; [[21, 12], [24, 13], [22, 18], [25, 17], [23, 10]].forEach(([a, b]) => c.fillRect(x + a, y + b, 2, 2)); }
  if (o.chainLock) { R(c, x + 6, y + 9, 20, 2, '#888'); R(c, x + 6, y + 21, 20, 2, '#888'); }
};
SPR.shoeRack = (c, x, y, o) => {
  shadowAt(c, x, y, 12);
  R(c, x + 3, y + 8, 26, 20, '#2b1e16'); R(c, x + 3, y + 17, 26, 2, '#1a120c');
  if (!o.taken) { R(c, x + 7, y + 11, 7, 5, '#1b0f0b'); R(c, x + 16, y + 11, 7, 5, '#1b0f0b'); R(c, x + 7, y + 15, 7, 1, '#5a0d0d'); R(c, x + 16, y + 15, 7, 1, '#5a0d0d'); }
};
SPR.coat = (c, x, y) => { shadowAt(c, x, y, 6); R(c, x + 15, y - 12, 2, 40, '#2a1d14'); R(c, x + 9, y - 8, 14, 22, '#1c2228'); R(c, x + 11, y - 10, 10, 4, '#1c2228'); R(c, x + 10, y + 26, 12, 2, '#2a1d14'); };
SPR.umbrella = (c, x, y) => { shadowAt(c, x, y, 7); R(c, x + 10, y + 12, 12, 16, '#2a2522'); R(c, x + 14, y - 2, 3, 16, '#a88c1e'); R(c, x + 12, y - 4, 7, 4, '#c9a52a'); R(c, x + 19, y + 2, 2, 12, '#333'); };
SPR.wallclock = (c, x, y, o, t) => {
  R(c, x + 8, y + 4, 16, 22, '#2a1a10'); oval(c, x + 16, y + 12, 6, 6, '#cbbd9e');
  const a = (o.ang !== undefined ? o.ang : -t * 0.8);
  c.strokeStyle = '#111'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 16, y + 12); c.lineTo(x + 16 + Math.sin(a) * 5, y + 12 - Math.cos(a) * 5); c.stroke();
  R(c, x + 15, y + 18, 2, 6 + Math.sin(t * 2) * 2, '#9a8040');
};
SPR.frame = (c, x, y, o) => {
  R(c, x + 6, y + 6, 20, 16, '#4a3420'); R(c, x + 8, y + 8, 16, 12, o.inner || '#6a5a4a');
  if (o.stage === 0) { R(c, x + 10, y + 11, 4, 7, '#2a1a14'); R(c, x + 17, y + 11, 4, 7, '#2a1a14'); R(c, x + 17, y + 10, 4, 3, '#999'); }
  if (o.stage === 1) { R(c, x + 9, y + 13, 14, 5, '#3a2a2a'); R(c, x + 11, y + 11, 10, 3, '#4a5a6a'); }
  if (o.stage === 2) { R(c, x + 9, y + 13, 14, 5, '#3a2a2a'); c.strokeStyle = '#ddd'; c.beginPath(); c.moveTo(x + 12, y + 10); c.lineTo(x + 17, y + 14); c.lineTo(x + 20, y + 10); c.stroke(); }
  if (o.stage >= 3) { R(c, x + 8, y + 8, 16, 12, '#1a0a0a'); R(c, x + 12, y + 10, 6, 8, '#6a0b0b'); }
  if (o.tilt) { R(c, x + 24, y + 6, 2, 3, '#4a3420'); }
};
SPR.window = (c, x, y, o) => { };
SPR.chair = (c, x, y, o, t) => {
  shadowAt(c, x, y, 11);
  R(c, x + 7, y - 6, 18, 16, '#3d2a1e'); R(c, x + 9, y - 4, 14, 12, '#4a1c1c');
  R(c, x + 6, y + 10, 20, 10, '#5a2222'); oval(c, x + 16, y + 14, 6, 3, '#3a1212');
  R(c, x + 7, y + 20, 3, 8, '#2b1d14'); R(c, x + 22, y + 20, 3, 8, '#2b1d14');
  if (o.spine) { for (let i = 0; i < 5; i++) R(c, x + 14, y - 4 + i * 4, 4, 3, '#e3dccb'); R(c, x + 13, y + 15, 6, 2, '#7a0e0e'); }
};
SPR.drawer = (c, x, y, o, t) => {
  shadowAt(c, x, y, 12);
  R(c, x + 3, y + 2, 26, 26, '#35251b'); R(c, x + 3, y + 2, 26, 3, '#47322a');
  R(c, x + 5, y + 8, 22, 8, '#2b1d15'); R(c, x + 5, y + 18, 22, 8, '#2b1d15');
  R(c, x + 14, y + 11, 4, 2, '#8a7a5a'); R(c, x + 14, y + 21, 4, 2, '#8a7a5a');
  if (o.open) { R(c, x + 4, y + 14, 24, 7, '#1a110c'); c.fillStyle = '#060405'; for (let i = 0; i < 9; i++) { const k = Math.sin(t * 2 + i) * 2; c.fillRect(x + 6 + i * 2.4, y + 18, 2, 14 + k + (i % 3) * 3); } }
};
SPR.hairTile = (c, x, y, o, t) => {
  c.strokeStyle = 'rgba(5,4,5,.9)'; c.lineWidth = 1;
  for (let i = 0; i < 9; i++) { c.beginPath(); const sx = x + (i * 37 % 30) + 1; c.moveTo(sx, y + 2); c.bezierCurveTo(sx + 6, y + 10 + Math.sin(t + i) * 2, sx - 6, y + 20, sx + 3, y + 31); c.stroke(); }
};
SPR.fridge = (c, x, y, o, t) => {
  const j = o.bang ? Math.round(rnd(-1.5, 1.5)) : 0;
  shadowAt(c, x, y, 13);
  R(c, x + 3 + j, y - 18, 26, 46, '#a7aaa2'); R(c, x + 3 + j, y - 18, 26, 2, '#c9cbc3');
  R(c, x + 3 + j, y - 2, 26, 2, '#6a6c66'); R(c, x + 24 + j, y - 12, 2, 8, '#555'); R(c, x + 24 + j, y + 4, 2, 12, '#555');
  c.fillStyle = 'rgba(100,10,10,.6)'; c.fillRect(x + 6 + j, y + 20, 3, 8); c.fillRect(x + 10 + j, y + 24, 2, 4);
  if (o.open) { R(c, x + 4, y - 16, 21, 42, '#2a2620'); R(c, x + 6, y - 12, 17, 2, '#555'); R(c, x + 8, y - 10, 6, 5, '#6a1414'); R(c, x + 15, y - 3, 7, 5, '#b8b080'); }
};
SPR.stove = (c, x, y, o, t) => {
  R(c, x, y - 6, 32, 34, '#2b2b2c'); R(c, x, y - 6, 32, 3, '#444');
  oval(c, x + 9, y + 4, 5, 3, '#111'); oval(c, x + 23, y + 4, 5, 3, '#111');
  R(c, x + 4, y + 14, 24, 12, '#1d1d1e'); R(c, x + 6, y + 16, 20, 8, '#100d0c');
  if (o.fire) {
    const col = o.fire === 'blue' ? ['rgba(60,120,255,', 'rgba(150,200,255,'] : ['rgba(255,110,20,', 'rgba(255,220,90,'];
    for (let i = 0; i < 6; i++) { const h = 6 + Math.random() * 10; c.fillStyle = col[0] + '.8)'; c.fillRect(x + 4 + i * 4, y + 4 - h, 3, h); c.fillStyle = col[1] + '.8)'; c.fillRect(x + 5 + i * 4, y + 4 - h / 2, 1, h / 2); }
  }
  // pan
  R(c, x + 16, y - 1, 13, 7, '#1a1a1a'); R(c, x + 28, y + 1, 5, 2, '#111');
  if (o.dish) { R(c, x + 18, y, 9, 4, '#120a08'); R(c, x + 20, y, 2, 1, '#9cf'); }
};
SPR.counter = (c, x, y, o) => {
  R(c, x, y - 6, 32, 34, '#3a2c22'); R(c, x, y - 6, 32, 4, '#5a4a3a'); R(c, x + 2, y + 6, 28, 1, '#241a14'); R(c, x + 15, y + 12, 3, 2, '#8a7a5a');
  if (o.item === 'rice') { oval(c, x + 16, y - 1, 9, 5, '#555'); oval(c, x + 16, y - 3, 7, 3, '#ddd6c6'); }
  if (o.item === 'veg') { oval(c, x + 12, y - 2, 6, 3, '#2a4a1a'); oval(c, x + 20, y - 1, 5, 3, '#3a5a22'); R(c, x + 10, y - 3, 6, 2, '#7a0e0e'); }
  if (o.item === 'salt') { R(c, x + 12, y - 10, 8, 10, '#ddd'); R(c, x + 12, y - 10, 8, 2, '#a33'); }
  if (o.item === 'sink') { R(c, x + 5, y - 4, 22, 9, '#6a6e70'); R(c, x + 7, y - 2, 18, 5, '#2a2e30'); R(c, x + 15, y - 9, 2, 6, '#999'); c.fillStyle = 'rgba(120,10,10,.6)'; c.fillRect(x + 10, y - 1, 8, 2); }
  if (o.item === 'empty') { }
};
SPR.shelf = (c, x, y, o) => {
  R(c, x + 2, y - 12, 28, 40, '#2b1f17'); for (let i = 0; i < 3; i++) R(c, x + 2, y - 2 + i * 10, 28, 2, '#1a120d');
  R(c, x + 5, y - 10, 5, 7, '#6a5a3a'); R(c, x + 12, y - 9, 4, 6, '#3a4a5a'); R(c, x + 20, y, 6, 7, '#5a2020'); R(c, x + 6, y + 10, 8, 6, '#4a4a3a');
  if (o.books) { for (let i = 0; i < 6; i++) R(c, x + 4 + i * 4, y - 9, 3, 7, ['#4a1a1a', '#2a3a4a', '#4a4a2a'][i % 3]); for (let i = 0; i < 6; i++) R(c, x + 4 + i * 4, y + 1, 3, 7, ['#2a2a2a', '#5a3a1a', '#3a1a3a'][i % 3]); }
};
SPR.table = (c, x, y, o) => {
  const w = (o.w || 1) * 32;
  shadowAt(c, x + (w - 32) / 2, y, w / 2.4);
  R(c, x + 2, y + 4, w - 4, 16, '#3d2b20'); R(c, x + 2, y + 4, w - 4, 3, '#4f3a2c');
  R(c, x + 4, y + 20, 3, 8, '#2a1d15'); R(c, x + w - 7, y + 20, 3, 8, '#2a1d15');
  if (o.cloth) { R(c, x + 4, y + 6, w - 8, 12, '#b8ae98'); c.fillStyle = 'rgba(110,10,10,.5)'; c.fillRect(x + 10, y + 9, 10, 5); }
  if (o.plate) { oval(c, x + w / 2, y + 11, 7, 4, '#ddd'); oval(c, x + w / 2, y + 11, 4, 2, '#3a0a0a'); }
};
SPR.oilcan = (c, x, y) => { R(c, x + 10, y + 10, 12, 16, '#1d2a3a'); R(c, x + 12, y + 7, 4, 4, '#1d2a3a'); R(c, x + 11, y + 15, 10, 4, '#c9a020'); };
SPR.scratch = (c, x, y, o) => {
  c.strokeStyle = 'rgba(220,200,180,.55)'; c.lineWidth = 1;
  const segs = [[6, 8, 6, 20], [11, 8, 9, 14], [9, 14, 13, 14], [12, 8, 12, 20], [16, 8, 16, 20], [20, 8, 25, 8], [25, 8, 21, 20]];
  segs.forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(x + a, y + b); c.lineTo(x + d, y + e); c.stroke(); });
  c.fillStyle = 'rgba(90,0,0,.6)'; c.fillRect(x + 6, y + 20, 1, 5); c.fillRect(x + 16, y + 20, 1, 3);
};
SPR.note = (c, x, y) => { R(c, x + 11, y + 8, 10, 12, '#d6ccb2'); R(c, x + 13, y + 11, 6, 1, '#555'); R(c, x + 13, y + 14, 5, 1, '#555'); R(c, x + 11, y + 8, 10, 2, '#a33'); };
SPR.bed2 = (c, x, y) => { // double bed 2x2
  shadowAt(c, x + 16, y + 32, 26);
  R(c, x + 2, y - 6, 60, 10, '#3a241a'); R(c, x + 2, y + 2, 60, 58, '#2c1e17'); R(c, x + 4, y + 4, 56, 54, '#5a4e60');
  R(c, x + 8, y + 6, 20, 10, '#d0c8bc'); R(c, x + 36, y + 6, 20, 10, '#d0c8bc');
  R(c, x + 4, y + 22, 56, 36, '#463c4c');
  c.fillStyle = 'rgba(100,10,10,.5)'; c.beginPath(); c.ellipse(x + 46, y + 11, 6, 3, 0, 0, 7); c.fill();
  R(c, x + 36, y + 6, 20, 10, 'rgba(0,0,0,.0)');
};
SPR.mirror = (c, x, y, o, t) => {
  R(c, x + 4, y - 18, 24, 46, '#2a1d12'); R(c, x + 6, y - 16, 20, 42, o.clear ? '#3a4448' : '#8f969a');
  if (!o.clear) { c.fillStyle = 'rgba(230,230,230,.35)'; for (let i = 0; i < 6; i++) c.fillRect(x + 7 + Math.sin(t + i) * 2 + i * 3, y - 14 + i * 6, 6, 4); }
  else {
    // reflection
    const pal = Object.assign({}, PLAYER_PAL); c.save(); c.beginPath(); c.rect(x + 6, y - 16, 20, 42); c.clip();
    human(c, x, y - 8 + (o.near ? 2 : 0), 'down', 0, pal, { noShadow: true, wound: true });
    if (o.cracked) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(x + 16, y); c.lineTo(x + 8, y - 12); c.moveTo(x + 16, y); c.lineTo(x + 24, y + 14); c.moveTo(x + 16, y); c.lineTo(x + 22, y - 14); c.moveTo(x + 16, y); c.lineTo(x + 7, y + 18); c.stroke(); }
    c.restore();
  }
  R(c, x + 6, y - 16, 20, 1, 'rgba(255,255,255,.3)');
};
SPR.wardrobe = (c, x, y) => { shadowAt(c, x, y, 13); R(c, x + 2, y - 18, 28, 46, '#2d1f15'); R(c, x + 15, y - 16, 1, 42, '#140d09'); R(c, x + 12, y + 2, 2, 4, '#8a7a5a'); R(c, x + 17, y + 2, 2, 4, '#8a7a5a'); R(c, x + 2, y - 18, 28, 3, '#3d2c20'); };
SPR.desk = (c, x, y, o) => {
  const w = (o.w || 2) * 32;
  shadowAt(c, x + (w - 32) / 2, y, w / 2.3);
  R(c, x + 2, y - 2, w - 4, 22, '#2c1f16'); R(c, x + 2, y - 2, w - 4, 3, '#3e2c1f'); R(c, x + 4, y + 20, 4, 8, '#1d140e'); R(c, x + w - 8, y + 20, 4, 8, '#1d140e');
  R(c, x + w - 24, y + 6, 18, 5, '#22170f'); R(c, x + w - 17, y + 8, 4, 1, '#8a7a5a');
  if (o.drawerOpen) { R(c, x + w - 26, y + 10, 22, 8, '#120c08'); R(c, x + w - 22, y + 11, 12, 6, '#d6ccb2'); }
};
SPR.phone = (c, x, y, o, t) => {
  const ring = o.ringing && Math.sin(t * 40) > 0;
  R(c, x + 8 + (ring ? 1 : 0), y + 6, 16, 10, '#151515'); R(c, x + 6 + (ring ? 1 : 0), y + 3, 20, 5, '#222');
  R(c, x + 11, y + 9, 10, 4, o.ringing ? '#4f8' : '#1a3a22');
};
SPR.lamp = (c, x, y, o) => { R(c, x + 14, y + 4, 3, 22, '#444'); R(c, x + 8, y - 2, 16, 8, o.on ? '#d9c070' : '#3a3220'); R(c, x + 10, y + 26, 12, 3, '#333'); };
SPR.armTree = (c, x, y, o, t) => {
  shadowAt(c, x, y, 13);
  R(c, x + 12, y + 4, 8, 26, '#2a1a12');
  const arms = 6;
  for (let i = 0; i < arms; i++) {
    const a = -Math.PI / 2 + (i - (arms - 1) / 2) * 0.35 + Math.sin(t * (o.agit ? 6 : 0.8) + i) * (o.agit ? 0.22 : 0.06);
    const L = 18 + (i % 2) * 6;
    const ex = x + 16 + Math.cos(a) * L, ey = y + 6 + Math.sin(a) * L;
    c.strokeStyle = '#3a2418'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 16, y + 8); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = '#c9b8a6'; c.lineWidth = 1; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a - 0.5) * 4, ey + Math.sin(a - 0.5) * 4); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a) * 5, ey + Math.sin(a) * 5); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a + 0.5) * 4, ey + Math.sin(a + 0.5) * 4); c.stroke();
  }
  if (o.wet) { c.fillStyle = 'rgba(120,0,0,.6)'; c.beginPath(); c.ellipse(x + 16, y + 28, 10, 3, 0, 0, 7); c.fill(); }
};
SPR.faucet = (c, x, y, o, t) => {
  R(c, x + 14, y + 4, 4, 20, '#555'); R(c, x + 14, y + 4, 10, 4, '#666'); R(c, x + 12, y + 2, 8, 3, '#7a1a1a');
  if (o.drip) { const k = (t * 1.2) % 1; R(c, x + 22, y + 9 + k * 16, 2, 3, '#7a0a0a'); }
  oval(c, x + 22, y + 28, 6, 2, 'rgba(110,0,0,.6)');
};
SPR.can = (c, x, y) => { R(c, x + 10, y + 14, 12, 12, '#3a5a4a'); R(c, x + 20, y + 12, 8, 3, '#3a5a4a'); R(c, x + 12, y + 11, 8, 3, '#2a4a3a'); };
SPR.well = (c, x, y) => { shadowAt(c, x, y, 14); oval(c, x + 16, y + 16, 14, 9, '#3a3532'); oval(c, x + 16, y + 15, 10, 6, '#050404'); R(c, x + 3, y - 10, 3, 24, '#2a1a12'); R(c, x + 26, y - 10, 3, 24, '#2a1a12'); R(c, x + 3, y - 12, 26, 3, '#2a1a12'); };
SPR.fence = (c, x, y) => { for (let i = 0; i < 4; i++) R(c, x + 2 + i * 8, y - 6, 4, 30, '#2a2018'); R(c, x, y + 2, 32, 3, '#1f1712'); R(c, x, y + 14, 32, 3, '#1f1712'); };
SPR.soilMound = (c, x, y, o, t) => { const k = 1 + Math.sin(t * 6) * 0.06; oval(c, x + 16, y + 18, 13 * k, 8 * k, '#160b09'); oval(c, x + 16, y + 16, 9 * k, 5 * k, '#22120e'); };
SPR.hole = (c, x, y) => { oval(c, x + 16, y + 16, 14, 10, '#050303'); oval(c, x + 16, y + 14, 11, 6, '#000'); R(c, x + 12, y + 14, 8, 2, '#c8c0b0'); };
SPR.mop = (c, x, y) => { R(c, x + 15, y - 12, 2, 34, '#6a5a40'); R(c, x + 10, y + 20, 12, 8, '#8a8070'); };
SPR.bucket = (c, x, y, o) => { shadowAt(c, x, y, 9); R(c, x + 8, y + 10, 16, 16, '#3a4a5a'); oval(c, x + 16, y + 10, 8, 3, o.full ? '#4a0606' : '#1a1a1a'); };
SPR.drain = (c, x, y) => { oval(c, x + 16, y + 16, 10, 7, '#0a0a0a'); for (let i = 0; i < 4; i++) R(c, x + 9 + i * 4, y + 12, 2, 8, '#2a2a2a'); };
SPR.boxes = (c, x, y) => { shadowAt(c, x, y, 13); R(c, x + 3, y + 6, 26, 22, '#4a3a26'); R(c, x + 3, y + 6, 26, 2, '#5a4a32'); R(c, x + 6, y - 6, 18, 13, '#3a2c1c'); R(c, x + 14, y + 6, 4, 22, '#6a5a3a'); };
SPR.envelope = (c, x, y, o, t) => { R(c, x + 9, y + 14, 15, 10, '#cfc5ae'); c.strokeStyle = '#8a7a5a'; c.beginPath(); c.moveTo(x + 9, y + 14); c.lineTo(x + 16, y + 20); c.lineTo(x + 24, y + 14); c.stroke(); R(c, x + 15, y + 18, 3, 3, '#7a0a0a'); };
SPR.chainPile = (c, x, y) => { c.strokeStyle = '#6a6a6a'; c.lineWidth = 2; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + 6 + i * 3, y + 22 + (i % 2) * 3, 3, 2, i, 0, 7); c.stroke(); } };
SPR.stairsUp = (c, x, y) => { for (let i = 0; i < 4; i++) R(c, x + 2, y + i * 8, 28, 7, ['#2a1f18', '#33261d', '#3c2d22', '#45342a'][i]); };
SPR.stairsDown = (c, x, y) => { for (let i = 0; i < 4; i++) R(c, x + 2, y + i * 8, 28, 7, ['#2a201a', '#1c1512', '#0f0b09', '#050404'][i]); };
SPR.basementDoor = (c, x, y, o) => {
  R(c, x + 3, y - 4, 26, 36, '#0c0807'); R(c, x + 5, y - 2, 22, 34, o.open ? '#000' : '#2a1a14');
  if (!o.open) { R(c, x + 6, y + 6, 20, 2, '#555'); R(c, x + 6, y + 18, 20, 2, '#555'); R(c, x + 13, y + 9, 7, 8, '#3a3a3a'); R(c, x + 15, y + 12, 3, 3, '#000'); }
};
SPR.carWreck = (c, x, y, o, t) => { // 3x2
  shadowAt(c, x + 32, y + 32, 44);
  R(c, x + 2, y + 8, 92, 46, '#1e2226');
  R(c, x + 6, y + 4, 60, 12, '#2a3036');
  c.fillStyle = '#14171a'; c.beginPath(); c.moveTo(x + 20, y + 4); c.lineTo(x + 40, y + 20); c.lineTo(x + 30, y + 30); c.lineTo(x + 8, y + 10); c.fill();
  R(c, x + 14, y + 14, 34, 18, '#0a0c0e');
  c.strokeStyle = 'rgba(220,230,240,.5)'; c.beginPath(); c.moveTo(x + 30, y + 22); c.lineTo(x + 18, y + 15); c.moveTo(x + 30, y + 22); c.lineTo(x + 44, y + 16); c.moveTo(x + 30, y + 22); c.lineTo(x + 26, y + 31); c.moveTo(x + 30, y + 22); c.lineTo(x + 46, y + 30); c.stroke();
  // Mint inside (hair + hand)
  if (!o.empty) { R(c, x + 50, y + 18, 14, 12, '#050405'); R(c, x + 46, y + 30, 14, 4, '#d0c6bc'); R(c, x + 44, y + 33, 4, 2, '#d0c6bc'); c.fillStyle = 'rgba(110,0,0,.8)'; c.fillRect(x + 48, y + 34, 18, 6); }
  R(c, x + 2, y + 50, 92, 4, '#111');
  oval(c, x + 16, y + 56, 8, 5, '#070707'); oval(c, x + 78, y + 56, 8, 5, '#070707');
  const fl = Math.random() < 0.85;
  R(c, x + 88, y + 18, 6, 10, fl ? '#f6f0c0' : '#443');
  c.fillStyle = 'rgba(60,0,0,.6)'; c.beginPath(); c.ellipse(x + 50, y + 60, 26, 5, 0, 0, 7); c.fill();
};
SPR.briefcase = (c, x, y, o) => {
  shadowAt(c, x, y, 10);
  R(c, x + 6, y + 12, 20, 14, '#3a2416'); R(c, x + 13, y + 9, 6, 3, '#3a2416'); R(c, x + 6, y + 17, 20, 1, '#6a4a30');
  if (o.open) { R(c, x + 6, y + 4, 20, 9, '#2a1a10'); R(c, x + 8, y + 13, 16, 10, '#8a8478'); R(c, x + 10, y + 14, 4, 3, '#e0d8c8'); R(c, x + 16, y + 16, 5, 2, '#e0d8c8'); }
};
SPR.cardOnFloor = (c, x, y) => { R(c, x + 10, y + 16, 12, 7, '#e8e2d6'); R(c, x + 12, y + 18, 6, 1, '#666'); };
SPR.memory = (c, x, y, o, t) => {
  // faint glint for hidden memory fragments
  const a = 0.35 + Math.sin(t * 3 + (o.x * 7)) * 0.3;
  c.fillStyle = `rgba(255,220,200,${Math.max(0, a)})`; c.fillRect(x + 15, y + (o.gy || 14), 2, 2);
};
SPR.bloodTrail = (c, x, y) => { };
SPR.vase = (c, x, y) => { shadowAt(c, x, y, 7); R(c, x + 11, y + 10, 10, 16, '#3a2a3a'); R(c, x + 13, y + 6, 6, 5, '#3a2a3a'); for (let i = 0; i < 4; i++) R(c, x + 10 + i * 4, y - 6 + (i % 2) * 3, 2, 12, '#2a2a1a'); };
SPR.radio = (c, x, y) => { R(c, x + 8, y + 10, 18, 12, '#3a2a1a'); oval(c, x + 13, y + 16, 3, 3, '#111'); R(c, x + 18, y + 13, 6, 2, '#a96'); };
SPR.car = SPR.carWreck;
