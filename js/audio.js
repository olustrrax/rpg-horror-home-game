'use strict';
/* =========================================================
   Sound — procedural WebAudio (no external assets)
   ========================================================= */
const Sound = (() => {
  let ac = null, master, sfx, amb, nb;
  let enabled = true;
  const vol = 0.9;
  let ambNodes = [], ambTimers = [], pendingAmb = null, curAmb = null;
  let heartTimer = null, heartBpm = 0, heartVol = 0.5;

  function init() {
    // Safari 16.4+: play even when the iPhone silent switch is on
    try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) { }
    // iOS can leave the context 'interrupted' after switching apps or a phone call
    if (ac) { if (ac.state !== 'running' && ac.state !== 'closed') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = enabled ? vol : 0;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ac.destination);
    sfx = ac.createGain(); sfx.connect(master);
    amb = ac.createGain(); amb.gain.value = 0.6; amb.connect(master);
    nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (pendingAmb) { const k = pendingAmb; pendingAmb = null; ambient(k); }
    if (heartBpm) heart(heartBpm, heartVol);
  }
  const ok = () => ac && ac.state !== 'closed';
  const now = () => ac.currentTime;

  function env(g, t0, a, peak, hold, rel) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + a);
    g.gain.setValueAtTime(Math.max(peak, 0.0002), t0 + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + rel);
    return t0 + a + hold + rel;
  }

  function noise(o = {}) {
    if (!ok()) return;
    const { dur = 0.3, type = 'bandpass', f = 1000, f2, q = 1, g = 0.4, a = 0.005, rel = 0.1, t = 0, dest } = o;
    const t0 = now() + t;
    const s = ac.createBufferSource(); s.buffer = nb; s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t0); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const gn = ac.createGain();
    const end = env(gn, t0, a, g, Math.max(0, dur - a), rel);
    s.connect(fl); fl.connect(gn); gn.connect(dest || sfx);
    s.start(t0, Math.random() * 1.5); s.stop(end + 0.05);
    return gn;
  }

  function tone(o = {}) {
    if (!ok()) return;
    const { f = 440, f2, dur = 0.2, type = 'sine', g = 0.2, a = 0.005, rel = 0.1, t = 0, dest, vib = 0, vibF = 6, lp } = o;
    const t0 = now() + t;
    const osc = ac.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(f, t0);
    if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    if (vib) { const l = ac.createOscillator(); const lg = ac.createGain(); l.frequency.value = vibF; lg.gain.value = vib; l.connect(lg); lg.connect(osc.frequency); l.start(t0); l.stop(t0 + dur + rel + 0.1); }
    const gn = ac.createGain();
    const end = env(gn, t0, a, g, Math.max(0, dur - a), rel);
    let node = osc;
    if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; osc.connect(fl); node = fl; }
    node.connect(gn); gn.connect(dest || sfx);
    osc.start(t0); osc.stop(end + 0.05);
  }

  /* ---------------- SFX ---------------- */
  const S = {
    step() { noise({ dur: 0.03, type: 'lowpass', f: 260 + Math.random() * 120, g: 0.12, rel: 0.05 }); },
    stepWet() { noise({ dur: 0.06, type: 'lowpass', f: 700, f2: 250, g: 0.16, rel: 0.08 }); },
    blip(cls) { tone({ f: cls === 'mint' ? 900 + Math.random() * 80 : cls === 'lawyer' ? 180 : 520 + Math.random() * 60, dur: 0.012, type: 'triangle', g: 0.02, rel: 0.02 }); },
    tick() { tone({ f: 1400, dur: 0.01, type: 'square', g: 0.025, rel: 0.02 }); },
    click() { tone({ f: 700, dur: 0.02, type: 'square', g: 0.04, rel: 0.04 }); noise({ dur: 0.02, f: 3000, g: 0.05 }); },
    beep(g = 0.1) { tone({ f: 1000, dur: 0.11, type: 'sine', g, rel: 0.05 }); },
    flatline(d = 4) { tone({ f: 1000, dur: d, type: 'sine', g: 0.14, a: 0.01, rel: 0.6 }); },
    item() { tone({ f: 523, dur: 0.12, type: 'triangle', g: 0.07, rel: 0.4 }); tone({ f: 784, dur: 0.18, type: 'triangle', g: 0.05, t: 0.08, rel: 0.6 }); },
    scream(big = 1) {
      noise({ dur: 1.3 * big, f: 2200, f2: 600, q: 3, g: 0.55, a: 0.02, rel: 0.4 });
      tone({ f: 980, f2: 330, dur: 1.2 * big, type: 'sawtooth', g: 0.12, vib: 40, vibF: 9, rel: 0.4, lp: 3200 });
      tone({ f: 1460, f2: 420, dur: 1.1 * big, type: 'sawtooth', g: 0.08, vib: 60, vibF: 13, rel: 0.4, lp: 3800 });
    },
    stinger() {
      [55, 58.3, 82.4, 116.5, 123.5].forEach((f, i) => tone({ f, f2: f * 0.94, dur: 2.2, type: 'sawtooth', g: 0.07, a: 0.05, rel: 1.4, lp: 900, t: i * 0.01 }));
      noise({ dur: 1.6, type: 'lowpass', f: 300, f2: 2400, g: 0.25, a: 0.8, rel: 0.6 });
    },
    hit() { tone({ f: 70, f2: 30, dur: 0.5, type: 'sine', g: 0.9, rel: 0.3 }); noise({ dur: 0.3, type: 'lowpass', f: 900, f2: 120, g: 0.6 }); },
    bang() { noise({ dur: 0.12, type: 'lowpass', f: 220, g: 1.0, rel: 0.18 }); tone({ f: 65, f2: 38, dur: 0.2, g: 0.7, rel: 0.15 }); },
    knock() { noise({ dur: 0.05, type: 'lowpass', f: 600, g: 0.5, rel: 0.06 }); tone({ f: 120, f2: 80, dur: 0.06, g: 0.3 }); },
    ring() {
      for (let i = 0; i < 2; i++) {
        const t = i * 0.55;
        for (let k = 0; k < 9; k++) {
          tone({ f: 440, dur: 0.025, type: 'square', g: 0.05, t: t + k * 0.05, rel: 0.01, lp: 2400 });
          tone({ f: 480, dur: 0.025, type: 'square', g: 0.05, t: t + k * 0.05 + 0.025, rel: 0.01, lp: 2400 });
        }
      }
    },
    creak() { tone({ f: 140, f2: 85, dur: 0.6, type: 'sawtooth', g: 0.08, vib: 8, vibF: 23, lp: 700, rel: 0.2 }); },
    door() { S.creak(); noise({ dur: 0.1, type: 'lowpass', f: 180, g: 0.6, t: 0.55, rel: 0.2 }); },
    unlock() { tone({ f: 1800, dur: 0.02, type: 'square', g: 0.05 }); tone({ f: 1200, dur: 0.03, type: 'square', g: 0.05, t: 0.09 }); noise({ dur: 0.05, f: 2500, g: 0.15, t: 0.09 }); },
    locked() { noise({ dur: 0.08, type: 'lowpass', f: 500, g: 0.4 }); noise({ dur: 0.08, type: 'lowpass', f: 450, g: 0.35, t: 0.12 }); },
    horn() { tone({ f: 349, dur: 0.9, type: 'sawtooth', g: 0.14, lp: 1800, rel: 0.2 }); tone({ f: 440, dur: 0.9, type: 'sawtooth', g: 0.12, lp: 1800, rel: 0.2 }); noise({ dur: 0.4, type: 'highpass', f: 2000, g: 0.25, t: 0.75, rel: 0.4 }); },
    engine() { tone({ f: 42, f2: 95, dur: 1.4, type: 'sawtooth', g: 0.12, lp: 400, a: 0.3, rel: 0.3 }); },
    brake() { noise({ dur: 1.0, f: 3200, f2: 2400, q: 8, g: 0.25, a: 0.05, rel: 0.2 }); },
    shatter() {
      noise({ dur: 0.5, type: 'highpass', f: 2500, g: 0.6, rel: 0.4 });
      noise({ dur: 0.15, type: 'lowpass', f: 400, g: 0.7 });
      for (let i = 0; i < 14; i++) tone({ f: 2000 + Math.random() * 5000, dur: 0.03, type: 'triangle', g: 0.06, t: Math.random() * 0.6, rel: 0.1 });
    },
    crunch() { for (let i = 0; i < 4; i++) noise({ dur: 0.05, f: 2600 + Math.random() * 1500, q: 2, g: 0.4, t: i * 0.11 + Math.random() * 0.03 }); },
    fire() { noise({ dur: 1.2, type: 'lowpass', f: 300, f2: 1400, g: 0.5, a: 0.06, rel: 0.6 }); noise({ dur: 1.0, type: 'highpass', f: 3500, g: 0.12, rel: 0.4 }); },
    sizzle(d = 1) { noise({ dur: d, type: 'highpass', f: 4200, g: 0.1, a: 0.2, rel: 0.3 }); },
    squish() { noise({ dur: 0.14, type: 'lowpass', f: 1000, f2: 220, g: 0.32, rel: 0.1 }); },
    splash() { noise({ dur: 0.35, type: 'lowpass', f: 1600, f2: 300, g: 0.35, rel: 0.2 }); },
    pour() { noise({ dur: 1.1, f: 900, f2: 500, q: 1.5, g: 0.22, a: 0.1, rel: 0.3 }); },
    dig() { for (let i = 0; i < 3; i++) noise({ dur: 0.1, type: 'lowpass', f: 500, g: 0.45, t: i * 0.3 }); },
    whisper() {
      for (let i = 0; i < 6; i++) noise({ dur: 0.12 + Math.random() * 0.2, f: 2600 + Math.random() * 1800, q: 5, g: 0.08 + Math.random() * 0.05, t: i * 0.17 + Math.random() * 0.08, rel: 0.1 });
    },
    laugh() {
      for (let i = 0; i < 9; i++) tone({ f: 1150 + Math.random() * 250 + i * 30, f2: 900, dur: 0.1, type: 'triangle', g: 0.09, t: i * 0.15, vib: 30, vibF: 30, rel: 0.05 });
      noise({ dur: 1.4, f: 2200, q: 6, g: 0.05 });
    },
    dong(t = 0) { [220, 553, 880, 1170].forEach((f, i) => tone({ f, dur: 0.02, type: 'sine', g: 0.16 / (i + 1), t, rel: 2.2 })); },
    thump(g = 0.6) { tone({ f: 58, f2: 38, dur: 0.1, g, rel: 0.12 }); tone({ f: 52, f2: 36, dur: 0.08, g: g * 0.7, t: 0.2, rel: 0.12 }); },
    rumble(d = 2) { noise({ dur: d, type: 'lowpass', f: 140, g: 0.8, a: 0.4, rel: 0.8 }); tone({ f: 33, dur: d, type: 'sawtooth', g: 0.15, lp: 120, a: 0.4, rel: 0.8 }); },
    chain() { for (let i = 0; i < 7; i++) tone({ f: 1700 + Math.random() * 1800, dur: 0.04, type: 'triangle', g: 0.07, t: i * 0.06 + Math.random() * 0.03, rel: 0.15 }); noise({ dur: 0.3, f: 4000, g: 0.08 }); },
    drip() { tone({ f: 1600, f2: 500, dur: 0.06, type: 'sine', g: 0.05, rel: 0.1 }); },
    glitch() { for (let i = 0; i < 6; i++) tone({ f: 80 + Math.random() * 2000, dur: 0.03, type: 'square', g: 0.05, t: i * 0.035 }); },
    hair() { noise({ dur: 1.4, type: 'highpass', f: 5000, g: 0.06, a: 0.4, rel: 0.4 }); },
    breath() { noise({ dur: 0.9, f: 900, q: 0.8, g: 0.12, a: 0.3, rel: 0.4 }); noise({ dur: 0.7, f: 600, q: 0.8, g: 0.08, a: 0.25, t: 1.2, rel: 0.4 }); },
    gurgle() { for (let i = 0; i < 8; i++) tone({ f: 150 + Math.random() * 200, dur: 0.05, type: 'sine', g: 0.08, t: i * 0.07 }); noise({ dur: 0.8, f: 500, q: 2, g: 0.08 }); },
    crack() { noise({ dur: 0.08, type: 'highpass', f: 1500, g: 0.5 }); tone({ f: 200, f2: 60, dur: 0.1, g: 0.4 }); },
    bell() { tone({ f: 1318, dur: 0.02, g: 0.06, rel: 1.6 }); tone({ f: 1975, dur: 0.02, g: 0.03, rel: 1.4 }); },
    wind() { noise({ dur: 2.5, f: 500, f2: 900, q: 0.6, g: 0.12, a: 1, rel: 1 }); },
  };

  /* ---------------- Ambient beds ---------------- */
  const AMB = {
    hospital: { dr: [[60, 'sine', 0.05], [120, 'sine', 0.015]], lp: 600, nz: [380, 0.035], tm: [[1150, () => S.beep(0.05)]] },
    house: { dr: [[41, 'sawtooth', 0.035], [61.5, 'sine', 0.04]], lp: 220, nz: [320, 0.06] },
    corridor: { dr: [[46, 'sawtooth', 0.035], [69, 'sawtooth', 0.02], [97.5, 'sine', 0.012]], lp: 320, nz: [520, 0.04], tm: [[5200, () => Math.random() < 0.5 && S.creak()]] },
    kitchen: { dr: [[50, 'square', 0.012], [100, 'sine', 0.02], [47, 'sawtooth', 0.02]], lp: 240, nz: [260, 0.05], tm: [[2600, () => S.sizzle(0.6)]] },
    bedroom: { dr: [[38, 'sawtooth', 0.03], [57, 'sine', 0.03]], lp: 260, nz: [360, 0.05] },
    study: { dr: [[33, 'sine', 0.06], [49.5, 'sine', 0.02]], lp: 200, nz: [220, 0.03] },
    garden: { dr: [[44, 'sine', 0.04], [66, 'sine', 0.01]], lp: 200, nz: [900, 0.06], tm: [[7000, () => S.wind()]] },
    storage: { dr: [[52, 'sawtooth', 0.03], [55, 'sawtooth', 0.03]], lp: 260, nz: [300, 0.05], tm: [[2300, () => S.drip()]] },
    foyer_night: { dr: [[36, 'sawtooth', 0.04], [54, 'sawtooth', 0.02]], lp: 240, nz: [280, 0.06] },
    basement: { dr: [[30, 'sawtooth', 0.05], [45, 'sine', 0.04], [31.5, 'sawtooth', 0.04]], lp: 180, nz: [150, 0.09], tm: [[1700, () => S.drip()], [6100, () => Math.random() < 0.6 && S.gurgle()]] },
    limbo: { dr: [[110, 'sine', 0.02], [220.5, 'sine', 0.01], [55, 'sine', 0.04]], lp: 900, nz: [800, 0.02] },
    silent: {},
  };

  function stopAmbient(fade = 1.2) {
    if (!ok()) { pendingAmb = null; return; }
    const t = now();
    ambNodes.forEach(n => {
      try {
        if (n.gain) { n.gain.cancelScheduledValues(t); n.gain.setValueAtTime(n.gain.value, t); n.gain.linearRampToValueAtTime(0, t + fade); }
        if (n.stop) n.stop(t + fade + 0.1);
      } catch (e) { }
    });
    ambNodes = [];
    ambTimers.forEach(clearInterval); ambTimers = [];
    curAmb = null;
  }

  function ambient(kind) {
    if (!ac) { pendingAmb = kind; return; }
    if (curAmb === kind) return;
    stopAmbient(1.5);
    curAmb = kind;
    const d = AMB[kind]; if (!d) return;
    const t = now();
    const bus = ac.createGain(); bus.gain.setValueAtTime(0, t); bus.gain.linearRampToValueAtTime(1, t + 2.5); bus.connect(amb);
    ambNodes.push(bus);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = d.lp || 400; lp.connect(bus);
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07; const lg = ac.createGain(); lg.gain.value = (d.lp || 400) * 0.35;
    lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); ambNodes.push(lfo);
    (d.dr || []).forEach(([f, type, g]) => {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 12;
      const gn = ac.createGain(); gn.gain.value = g; o.connect(gn); gn.connect(lp); o.start(); ambNodes.push(o);
    });
    if (d.nz) {
      const s = ac.createBufferSource(); s.buffer = nb; s.loop = true;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = d.nz[0]; f.Q.value = 0.7;
      const g = ac.createGain(); g.gain.value = d.nz[1];
      const l2 = ac.createOscillator(); l2.frequency.value = 0.11; const l2g = ac.createGain(); l2g.gain.value = d.nz[1] * 0.6;
      l2.connect(l2g); l2g.connect(g.gain); l2.start();
      s.connect(f); f.connect(g); g.connect(bus); s.start(); ambNodes.push(s, l2);
    }
    (d.tm || []).forEach(([ms, fn]) => ambTimers.push(setInterval(fn, ms)));
  }

  function heart(bpm, v = 0.5) {
    heartBpm = bpm; heartVol = v;
    if (heartTimer) { clearTimeout(heartTimer); heartTimer = null; }
    if (!bpm || !ac) return;
    const beat = () => { S.thump(heartVol); heartTimer = setTimeout(beat, 60000 / heartBpm); };
    beat();
  }
  function setHeartVol(v) { heartVol = v; }

  function setEnabled(on) { enabled = on; if (master) master.gain.value = on ? vol : 0; }
  function isEnabled() { return enabled; }

  document.addEventListener('visibilitychange', () => { if (!document.hidden && ac && ac.state !== 'running' && ac.state !== 'closed') ac.resume().catch(() => { }); });
  return Object.assign({ init, ambient, stopAmbient, heart, setHeartVol, setEnabled, isEnabled }, S);
})();
