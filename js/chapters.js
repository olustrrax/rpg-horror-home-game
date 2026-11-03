'use strict';
/* =========================================================
   Chapters — story, maps & puzzles
   ========================================================= */

const RULES = [
  'ดูแลทำความสะอาดบ้านให้เรียบร้อยเสมอ',
  'ของหยิบมาจากไหน ให้วางคืนที่เดิม',
  'กินเฉพาะอาหารที่ทำในครัวของบ้านหลังนี้เท่านั้น',
  'รดน้ำต้นไม้ในสวนตอนตีสามตรง',
  'พูดกับกระจกในห้องนอนตอนเที่ยงตรง',
  'ได้ยินเสียงเรียก ห้ามทัก ห้ามตอบ',
  'อย่าเปิดซองจดหมายที่ไม่มีชื่อผู้รับ',
  'ห้ามออกจากบ้านหลังเที่ยงคืน ไม่ว่าใครจะเรียก',
  'ห้ามลงไปที่ห้องใต้ดินเด็ดขาด',
];
const RULE_TRUTH = [
  'ขัดเท่าไหร่ก็ไม่ออก... เพราะมันคือเลือดของเธอที่ติดตัวฉันมา',
  'ทางเดินพาฉันวนกลับมาที่เดิมทุกครั้ง เหมือนที่ฉันพยายามจัดทุกอย่างกลับเข้าที่ ทำเหมือนวันนั้นไม่เคยเกิดขึ้น',
  'ฉันกลืนเศษเนื้อกับเศษกระจกลงไป... กลืนความทรงจำไม่ให้ใครเห็น',
  'ฉันไม่ได้รดน้ำต้นไม้ ฉันรดเลือดลงบนหลุมที่ฝังเธอไว้',
  'ทุกเที่ยงฉันโกหกกระจก เพื่อจะได้ไม่ต้องเห็นกะโหลกตัวเองที่แตกยับ',
  'เสียงนั้นคือเธอ ร้องขอให้ฉันช่วยอยู่สิบสี่นาทีเต็ม... และฉันไม่เคยตอบ',
  'ในซองนั้นคือความจริง — ใบชันสูตรศพที่มีชื่อของเธอ',
  'ข้างนอกไม่ใช่ทางหนี มันคือการตื่นขึ้นมาเจอความจริง',
  'ห้องใต้ดินคือที่ที่ซากรถทับร่างของเธอไว้',
];
const MEMS = [
  { find: 'ในที่ใส่ร่มมีร่มสีเหลืองคันเล็กเปียกโชก... ทั้งที่ข้างนอกไม่มีฝน', mem: '"ฝนตกหนักนะ ขับช้าๆ หน่อย" — มิ้นพูดแบบนั้น ตอนกางร่มสีเหลืองวิ่งขึ้นรถ' },
  { find: 'หลังกรอบรูปมีตั๋วหนังสองใบเสียบอยู่ รอบ 15:30', mem: 'เธอรอหนังเรื่องนี้มาทั้งปี... ฉันบอกว่า "ทันน่า เดี๋ยวซิ่งไปแป๊บเดียว"' },
  { find: 'ใต้โต๊ะมีใบเสร็จร้านอาหารยับยู่ยี่ พิมพ์เวลา 13:52', mem: 'เบียร์สองขวด... ฉันหัวเราะแล้วบอกเธอว่า "แค่นี้ไม่เมาหรอก"' },
  { find: 'ในกระเป๋าแจ็คเก็ตมีโทรศัพท์จอแตก ข้อความที่พิมพ์ค้างไว้ยังไม่ได้ส่ง', mem: '"ใกล้ถึงแล้ว อีก 5 นาที" — ฉันก้มมองจอ ตอนรถกำลังเข้าโค้ง' },
  { find: 'สมุดบันทึกเล่มเล็กแทรกอยู่ระหว่างหนังสือ ลายมือของมิ้น', mem: '"เขาสัญญาแล้วว่าจะไม่ขับเร็วอีก... ฉันเชื่อเขา"' },
  { find: 'ที่ขอบบ่อมีกล่องกำมะหยี่สีแดงจมโคลนอยู่', mem: 'แหวนวงนั้น... คืนนั้นฉันตั้งใจจะขอเธอแต่งงาน มันยังอยู่ในกระเป๋าเสื้อตอนรถพลิกคว่ำ' },
  { find: 'ในท่อระบายมีเศษกระจกมองหลัง มีเส้นผมยาวสีดำพันอยู่', mem: 'ตอนรถพลิกรอบที่สอง ฉันเห็นหน้าเธอในกระจกบานนั้น... ตาเธอยังเปิดอยู่ และจ้องมาที่ฉัน' },
  { find: 'ในกระเป๋าเสื้อโค้ทมีเมมโมรี่การ์ดจากกล้องหน้ารถ', mem: 'เสียงสุดท้ายก่อนแรงกระแทก — "ปฐพี! มองถนนสิ!!"' },
];


/* ---------- difficulty ---------- */
const EASY = () => G.mode !== 'hard';
const ez = (easy, hard) => (EASY() ? easy : hard);
const CH_RULES = {
  1: { rules: [8], tip: 'คำเตือนของทนาย: หลังสวมรองเท้า ห้ามเดินถอยหลัง (ห้ามกดลง)' },
  2: { rules: [2], tip: 'ทางเดินจะวนกลับที่เดิม — สังเกตสิ่งที่เปลี่ยนไปในแต่ละรอบ' },
  3: { rules: [3], tip: 'ใส่วัตถุดิบตามตัวเลขบนผนัง เทียบกับจำนวนในการ์ดสูตร แล้วต้องกินให้หมด' },
  4: { rules: [5], tip: 'หลบแสงไฟหน้ารถหลังเฟอร์นิเจอร์ แล้วตั้งนาฬิกาหัวเตียงให้เป็น 12:00' },
  5: { rules: [6], tip: 'ปล่อยให้โทรศัพท์ดังจนเงียบ 5 ครั้ง — ห้ามกดรับ ห้ามขยับ' },
  6: { rules: [4], tip: 'อ่านตารางรดน้ำให้ดี รดผิดต้นต้องเริ่มใหม่ทั้งหมด' },
  7: { rules: [1], tip: 'เดินถูตามรอยเลือด ม็อบเต็มต้องไปบิดที่ถัง และระวังสิ่งที่คลานออกมา' },
  8: { rules: [8], tip: 'ถามคนหลังประตูก่อนตัดสินใจ — จำสิ่งที่เงาในกระจกเคยบอกไว้' },
  9: { rules: [7, 9], tip: 'ในบทนี้ การละเมิดกฎคือทางเดียวที่จะไปต่อ — ทางเลือกของคุณกำหนดตอนจบ' },
};
async function showChapterRules() {
  const d = CH_RULES[G.chapter];
  if (!EASY() || !d) return;
  await showHTML(`<div class="panel rules-card"><h2>กฎที่ต้องระวังในบทนี้</h2>
    ${d.rules.map(n => `<div class="rule"><b>ข้อ ${n}.</b> ${RULES[n - 1]}</div>`).join('')}
    <div class="rc-tip">◆ ${d.tip}</div>
    <div class="hint">โหมดง่าย · แตะหรือกด E เพื่อเริ่ม</div></div>`);
}

function revealRule(n) { if (G.notes[n]) return; G.notes[n] = true; Sound.glitch(); G.fx.glitch = 0.4; toast(`สมุดกฎ: ข้อ ${n} ถูกเขียนทับด้วยหมึกแดง`, 'red', 2800); }
async function memory(i) {
  if (G.memories.includes(i)) { await say('', 'ไม่มีอะไรเหลืออยู่ตรงนี้แล้ว'); return; }
  await say('', MEMS[i - 1].find);
  flash('255,235,225', 0.55); Sound.bell(); G.fx.glitch = 0.3;
  await say('ความทรงจำ', MEMS[i - 1].mem, { cls: 'mint' });
  G.memories.push(i); toast(`เศษความทรงจำ ${G.memories.length}/8`, 'red');
}
async function thought(t) { await say('ปฐพี', t); }
async function lockedDoor(msg) { Sound.locked(); await say('', msg || 'ประตูล็อกอยู่'); }

/* grid helpers */
function mkGrid(w, h, fill = '.') { const g = []; for (let y = 0; y < h; y++) g.push(Array(w).fill(fill)); return g; }
function boxWalls(g, top = 2) { const h = g.length, w = g[0].length; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (y < top || y === h - 1 || x === 0 || x === w - 1) g[y][x] = '#'; return g; }
const gstr = g => g.map(r => r.join(''));

function showFace() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  r(0, 0, 64, 64, '#2b3134');
  r(14, 10, 36, 44, '#b89a86'); r(12, 6, 40, 10, '#120c0a'); r(12, 14, 4, 18, '#120c0a'); r(48, 14, 4, 18, '#120c0a');
  // eyes
  r(36, 26, 6, 3, '#0a0a0a'); r(37, 26, 2, 2, '#ddd');
  r(20, 28, 7, 4, '#3a0606'); r(22, 29, 2, 2, '#ddd');
  // crushed right side (viewer left)
  g.fillStyle = '#5a0909'; g.beginPath(); g.moveTo(12, 8); g.lineTo(30, 14); g.lineTo(26, 24); g.lineTo(30, 34); g.lineTo(14, 40); g.closePath(); g.fill();
  g.fillStyle = '#c56a76'; g.beginPath(); g.ellipse(21, 20, 6, 5, 0.3, 0, 7); g.fill();
  g.strokeStyle = '#7a2a35'; g.beginPath(); g.moveTo(17, 18); g.quadraticCurveTo(21, 15, 25, 20); g.moveTo(18, 22); g.quadraticCurveTo(22, 19, 25, 24); g.stroke();
  r(16, 30, 2, 22, '#6a0a0a'); r(22, 34, 2, 16, '#6a0a0a');
  r(26, 44, 14, 2, '#5a2a2a'); r(28, 46, 10, 1, '#3a0a0a');
  // glass shards
  r(40, 40, 2, 3, '#cde'); r(30, 18, 2, 2, '#cde'); r(44, 16, 1, 3, '#cde');
  c.style.width = 'calc(var(--u) * 210)'; c.style.height = 'calc(var(--u) * 210)'; c.style.imageRendering = 'pixelated'; c.style.display = 'block'; c.style.margin = '0 auto';
  const wrap = document.createElement('div'); wrap.className = 'panel'; wrap.style.textAlign = 'center';
  wrap.appendChild(c);
  const cap = document.createElement('div'); cap.className = 'hint'; cap.style.fontSize = 'calc(var(--u)*11)'; cap.style.color = '#d99'; cap.textContent = 'นั่น... หน้าฉัน'; wrap.appendChild(cap);
  const g0 = G.gen;
  return new Promise(res => { let h; const close = () => { h.close(); if (g0 === G.gen) res(); }; h = openModal(wrap, { key(a) { if (a === 'ok' || a === 'cancel') close(); } }); wrap.onclick = close; });
}

/* =========================================================
   CHAPTER 1 — The Denial
   ========================================================= */
const FOYER_GRID = [
  '###########',
  '###C#I#####',
  '#K..===..U#',
  '#...===...#',
  '#...===...#',
  '#...===...#',
  '#...===...#',
  '#S..===...#',
  '#...===...#',
  '#####F#####',
];
const FOYER_WALL = { face: '#3b2e2a', stripe: '#342823', base: '#1a110e', top: '#0a0708', win: '#06070d' };

const CH1 = {
  num: 'บทที่ ๑', title: 'คืนแรกในบ้านมรดก', en: 'The Denial', when: 'คืนที่ 1 · 23:58',
  start() {
    setChapterLabel(`บทที่ 1 — ${this.title}`);
    setClock('23:51');
    Sound.ambient('hospital');
    loadMap(this.hospital(), 3, 4, 'up');
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await wait(400);
      await say('', '...ตี๊ด ...ตี๊ด ...ตี๊ด');
      await fade(0, 2200);
      await thought('ที่นี่... ที่ไหน');
      await thought('หัวฉัน... ทำไมข้างขวามันชาไปหมด');
      await say('', 'ห้องพักผู้ป่วยว่างเปล่า ไม่มีหมอ ไม่มีพยาบาล มีแค่เสียงเครื่องวัดชีพจรดังอยู่เครื่องเดียว');
      setObjective('สำรวจห้องพักผู้ป่วย');
    });
  },
  hospital() {
    return {
      name: 'hospital', floor: 'tile', seed: 3,
      wall: { face: '#5a5f59', stripe: '#535852', base: '#2e302d', top: '#0b0c0c', win: '#05070c' },
      grid: [
        '#############',
        '##w###w###w##',
        '#.BM.......V#',
        '#..T........#',
        '#...........#',
        '#...........#',
        '#...........#',
        '######D######',
      ],
      dark: 0.55, playerLight: 120,
      legend: {
        B: { id: 'bed', draw: 'hbed', h: 2, on: async () => { await say('', 'ผ้าปูเตียงเปื้อนคราบน้ำเหลืองเป็นรูปร่างคน... ขนาดเท่าตัวฉันพอดี'); await thought('ฉันเพิ่งลุกจากตรงนั้น... หรือฉันยังนอนอยู่ตรงนั้น?'); } },
        M: { id: 'monitor', draw: 'monitor', light: { r: 60, color: '40,255,90', ga: 0.18 }, on: async () => { Sound.beep(); await say('', 'เส้นกราฟบนจอวัดชีพจรกระตุกเป็นจังหวะช้าๆ สายวัดห้อยระโยงระยาง... แต่ไม่ได้ต่ออยู่กับใครเลย'); await say('', 'แต่ตัวเลขบนจอยังขึ้นว่า: ชีพจร 41 · ออกซิเจนในเลือด 72%'); } },
        T: { id: 'table', draw: 'nightstand', card: true, on: async o => this.takeCard(o) },
        V: { id: 'iv', draw: 'ivstand', on: async () => { await say('', 'ถุงน้ำเกลือห้อยอยู่ แต่ของเหลวข้างในข้นและแดงคล้ำ'); } },
        D: { id: 'door', draw: 'doorBottom', layer: 'wall', color: '#40464a', on: async () => this.hospitalDoor() },
      },
      objects: [],
      lights: () => [{ x: 6.5 * TILE, y: 3 * TILE, r: 140, a: 0.5, flicker: true }],
    };
  },
  async takeCard(o) {
    if (G.flags.card) { await say('', 'โต๊ะข้างเตียงว่างเปล่า มีแค่รอยนิ้วมือเปื้อนเขม่า'); return; }
    await say('', 'บนโต๊ะข้างเตียงมีนามบัตรใบหนึ่งวางไว้ตรงกลางพอดี เหมือนมีคนจงใจวางให้ฉันเห็น');
    await showHTML(`<div class="bizcard">
      <div class="bc-role">ทนายความ · ผู้จัดการมรดก</div>
      <div class="bc-name">นาย ████ ███████</div>
      <div class="bc-line">ติดต่อ: บ้านเลขที่ ๗ ซอยไม่มีชื่อ<br>เวลาทำการ: หลังเที่ยงคืน — ก่อนรุ่งสาง<br><i>"ทุกอย่างจะเป็นของท่าน เพียงทำตามกฎ"</i></div>
      <div class="bc-stamp">รับรอง<br>๗ วัน</div>
      <div class="bc-brand">Thorani Techno<br>https://thorani.co/</div>
    </div>`);
    o.card = false; G.flags.card = true;
    addItem('card', 'นามบัตรทนาย', 'ชื่อบนนามบัตรเลือนจนอ่านไม่ออก ตรายางสีแดงประทับว่า "รับรอง ๗ วัน" มุมล่างมีตัวอักษรเล็กๆ จางๆ พิมพ์ไว้');
    await wait(300);
    await this.lawyerScene();
  },
  async lawyerScene() {
    const m = G.map;
    const law = { id: 'lawyer', x: 6, y: 5, draw: 'lawyer', dir: 'up', alpha: 0, solid: true };
    m.ents.push(law);
    Sound.stinger();
    for (let i = 0; i <= 20; i++) { law.alpha = i / 20 * (0.6 + Math.random() * 0.4); await wait(45); }
    law.alpha = 1;
    G.player.dir = 'down';
    await talk([
      ['ทนาย', 'ยินดีด้วยครับ คุณปฐพี'],
      ['ปฐพี', 'คุณ... เป็นใคร เข้ามาตอนไหน'],
      ['ทนาย', 'ผมเป็นผู้จัดการมรดกของท่าน ท่านได้รับบ้านหนึ่งหลัง และเงินสดอีกสามล้านบาท'],
      ['ปฐพี', 'มรดก...? ของใคร ใครตาย'],
      ['ทนาย', 'คนที่รักท่านมากที่สุดครับ'],
      ['ทนาย', 'เงื่อนไขมีเพียงอย่างเดียวครับ — อยู่ในบ้านหลังนั้นให้ครบเจ็ดวัน โดยทำตามกฎทั้งเก้าข้อ ห้ามละเมิดแม้แต่ข้อเดียว'],
    ]);
    addItem('rules', 'สมุดกฎ ๙ ข้อ', 'สมุดปกหนังสีดำ เขียนกฎเก้าข้อด้วยลายมือ กระดาษบางหน้ายังชื้นอยู่');
    toast(IS_TOUCH ? 'แตะปุ่ม "สมุด" เพื่อเปิดสมุดกฎ' : 'กด J เพื่อเปิดสมุดกฎ', '', 3000);
    await talk([
      ['ทนาย', 'และนี่คือกุญแจบ้าน'],
      () => addItem('housekey', 'กุญแจบ้าน', 'กุญแจทองเหลืองเก่า เย็นเฉียบเหมือนน้ำแข็ง'),
      ['ทนาย', 'ประตูบานนั้นจะพาท่านกลับบ้าน... อ้อ อีกเรื่อง'],
      ['ทนาย', 'อย่าเดินถอยหลังนะครับ คนที่ถอยหลังมักจะได้เห็นสิ่งที่ตัวเองไม่อยากเห็น'],
    ]);
    Sound.glitch(); G.fx.glitch = 0.6;
    for (let i = 0; i < 8; i++) { law.alpha = i % 2 ? 1 : 0.1; await wait(70); }
    m.ents = m.ents.filter(e => e !== law);
    await wait(500);
    await thought('เดี๋ยวนะ... เมื่อกี้เขา... ไม่มีหัว');
    await thought('แล้วใต้เท้าเขา... ก็ไม่มีเงาเลยสักนิด');
    setObjective('ออกจากห้องทางประตูด้านล่าง');
  },
  async hospitalDoor() {
    if (!hasItem('housekey')) { await lockedDoor('ประตูล็อก มีป้ายแขวนว่า "ห้ามผู้ป่วยออกนอกห้อง"'); return; }
    Sound.door();
    await fade(1, 900);
    Sound.ambient('house');
    setClock('23:58');
    loadMap(this.foyer(), 5, 8, 'up');
    await wait(400);
    await fade(0, 1200);
    await say('', 'ประตูห้องพักผู้ป่วยเปิดออก... แต่ข้างนอกไม่ใช่ทางเดินโรงพยาบาล มันคือโถงของบ้านไม้เก่าหลังหนึ่ง อากาศหนาวจนลมหายใจเป็นไอ');
    await thought('นี่คือบ้านที่ฉันได้มา...? ฉันไม่เคยมาที่นี่ แต่ทำไมรู้สึกคุ้นเคยนัก');
    setObjective('หาทางเข้าไปในบ้าน');
  },
  foyer() {
    const self = this;
    return {
      name: 'foyer', floor: 'wood', floor2: 'carpet', seed: 11, wall: FOYER_WALL,
      grid: FOYER_GRID, dark: 0.6, playerLight: 115,
      legend: {
        C: { id: 'clock', draw: 'wallclock', layer: 'wall', on: async () => { await say('', 'นาฬิกาแขวนบอกเวลา 23:58 ...เข็มวินาทีเดินถอยหลัง'); } },
        I: { id: 'inner', draw: 'door', layer: 'wall', bolt: true, on: async o => self.innerDoor(o) },
        K: { id: 'coat', draw: 'coat', on: async () => { await say('', 'ราวแขวนเสื้อ มีโค้ทสีเทาตัวหนึ่ง ไหล่เปียกเหมือนเพิ่งตากฝนมา'); } },
        U: { id: 'umb', draw: 'umbrella', mem: 1, on: async () => memory(1) },
        S: { id: 'shoes', draw: 'shoeRack', on: async o => self.shoes(o) },
        F: { id: 'front', draw: 'doorBottom', layer: 'wall', fingers: true, on: async () => self.frontDoor() },
      },
      beforeMove(nx, ny, d) {
        if (G.flags.noBack && d === 'down' && G.busy === 0) { self.backward(); return false; }
      },
      onStep(x, y) {
        if (!G.flags.noBack) return;
        if (y <= 6 && !G.flags.w1) { G.flags.w1 = 1; Sound.whisper(); subtitle('...ปฐพี', 2200, 'whisper'); }
        if (y <= 4 && !G.flags.w2) {
          G.flags.w2 = 1; Sound.breath();
          const mint = { id: 'mintBehind', x: 5, y: 8, draw: 'mint', dir: 'up', alpha: 0.75, jitter: true };
          G.map.ents.push(mint);
          subtitle('ปฐพี... หันมาสิ... ฉันอยู่ข้างหลังเธอนะ', 3200, 'mint');
        }
        if (y <= 3 && !G.flags.w3) { G.flags.w3 = 1; Sound.whisper(); subtitle('ทำไมไม่หันมามองฉันเลย...', 2600, 'mint'); }
      },
    };
  },
  async frontDoor() {
    await say('', 'ประตูหน้าบ้าน ลูกบิดมีรอยนิ้วมือเล็กๆ เปื้อนเขม่าดำ... นิ้วมือเด็ก');
    await thought('บ้านนี้ไม่น่าจะมีเด็ก... หรือมันไม่ใช่นิ้วเด็ก แต่เป็นนิ้วที่ถูกไฟไหม้จนหดเล็กลง');
    Sound.locked();
    await say('', ez('ประตูไม่ยอมเปิด แล้วกฎข้อ 8 ก็ผุดขึ้นมาในหัว: "ห้ามออกจากบ้านหลังเที่ยงคืน"', 'ประตูไม่ยอมเปิด ลูกบิดเย็นจนมือชา'));
  },
  async shoes(o) {
    if (G.flags.shoes) { await say('', 'ชั้นวางรองเท้าว่างเปล่า มีรอยเลือดเป็นวงกลมสองวงอยู่ตรงที่เคยวางรองเท้า'); return; }
    await say('', 'รองเท้าหนังคู่หนึ่งวางอยู่บนชั้น ขนาดดูพอดีกับเท้าฉันเป๊ะ');
    await say('', 'พื้นรองเท้ามีคราบเลือดแห้งกรังเป็นวงกลม... เหมือนเพิ่งเหยียบแอ่งอะไรบางอย่างมา');
    const c = await choose(['สวมรองเท้า', 'ปล่อยไว้อย่างนั้น']);
    if (c !== 0) { await thought('เท้าฉันเย็นจนแทบไม่รู้สึกอะไรแล้ว...'); return; }
    o.taken = true; G.flags.shoes = true;
    Sound.squish();
    await say('', 'รองเท้าสวมเข้าพอดีราวกับหล่อมาจากเท้าฉัน ข้างในยังอุ่นและชื้นอยู่');
    await wait(400);
    Sound.unlock(); shake(2, 300);
    await say('', 'แกร๊ก... เสียงกลอนที่ประตูด้านในเลื่อนเปิดออกเอง');
    const inner = getObj('inner'); if (inner) inner.open = true;
    await wait(300);
    await say('เสียงทนาย', ez('ยินดีต้อนรับกลับบ้านครับ คุณปฐพี... เดินตรงไปข้างหน้า อย่าถอยหลัง', 'ยินดีต้อนรับกลับบ้านครับ คุณปฐพี'), { cls: 'lawyer' });
    G.flags.noBack = true;
    setObjective(ez('เดินไปที่ประตูด้านใน — ห้ามเดินถอยหลัง', 'เดินไปที่ประตูด้านใน'));
  },
  async backward() {
    if (G.flags.backCd && G.t < G.flags.backCd) return;
    G.flags.backCd = G.t + 1.6;
    G.flags.backCount = (G.flags.backCount || 0) + 1;
    Sound.scream(1.1); G.fx.red = 0.5;
    hurt(10, 'อย่าหันกลับไป!!');
    setTimeout(() => { G.fx.red = 0; }, 700);
    if (G.flags.backCount === 2) setTimeout(() => subtitle('ร่างบางอย่างยืนชิดแผ่นหลังฉัน... ใกล้จนได้กลิ่นน้ำมันเครื่อง', 3000), 900);
  },
  async innerDoor(o) {
    if (!G.flags.shoes) {
      Sound.locked();
      await say('', 'กลอนประตูเย็นเฉียบ ไม่ขยับเลยแม้แต่นิดเดียว');
      await say('', 'บนพื้นมีรอยเท้าเปื้อนเลือดเดินมาหยุดตรงหน้าประตูนี้... เป็นรอยรองเท้าหนัง ไม่ใช่เท้าเปล่า');
      await thought('คนที่เดินเข้าประตูนี้ได้ใส่รองเท้า... ส่วนฉันยังเท้าเปล่าอยู่เลย ที่ชั้นวางข้างประตูหน้าบ้านมีรองเท้าอยู่คู่หนึ่งนี่');
      return;
    }
    Sound.door();
    await say('', 'ประตูเปิดออกง่ายดาย... เหมือนบ้านหลังนี้รอฉันมานานแล้ว');
    const behind = G.map.ents.find(e => e.id === 'mintBehind');
    if (behind) { await say('', 'ข้างหลังเงียบสนิท แต่ฉันรู้สึกได้ถึงลมหายใจเย็นๆ ที่ต้นคอ'); }
    G.flags.noBack = false;
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 2 — The Distorted Spine (looping corridor)
   ========================================================= */
const CH2 = {
  num: 'บทที่ ๒', title: 'ทางเดินที่ไม่มีวันสุด', en: 'The Distorted Spine', when: 'วันที่ 2 · 14:05',
  start() {
    setChapterLabel(`บทที่ 2 — ${this.title}`);
    setClock('14:05');
    Sound.ambient('corridor');
    G.flags.loop = 0;
    loadMap(this.map(), 2, 3, 'right');
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      await say('', 'แดดบ่ายสีเลือดหมูส่องเฉียงผ่านหน้าต่าง ทั้งที่เมื่อครู่ยังเป็นเที่ยงคืน');
      await thought('ทางเดินนี้ยาวผิดปกติ... สุดทางมีประตูอยู่บานหนึ่ง กลิ่นเนื้อไหม้ลอยมาจากตรงนั้น');
      setObjective('ไปให้ถึงประตูสุดทางเดิน');
    });
  },
  map() {
    const self = this;
    const w = 34, h = 6;
    const g = boxWalls(mkGrid(w, h), 2);
    [3, 13, 23].forEach(x => g[1][x] = 'w');
    g[1][8] = 'F'; g[1][18] = 'G'; g[1][27] = 'H'; g[1][32] = 'E';
    g[3][6] = 'C'; g[3][19] = 'X'; g[2][12] = 'P';
    const frameOn = (i) => async o => self.frame(o, i);
    return {
      name: 'corridor', floor: 'wood', seed: 21, wall: { face: '#3d2a24', stripe: '#36241f', base: '#1a100c', win: '#7a1a0e' },
      grid: gstr(g), dark: 0.42, playerLight: 90,
      legend: {
        F: { id: 'f1', draw: 'frame', layer: 'wall', stage: 0, on: frameOn(0) },
        G: { id: 'f2', draw: 'frame', layer: 'wall', stage: 0, on: frameOn(1) },
        H: { id: 'f3', draw: 'frame', layer: 'wall', stage: 0, on: frameOn(2), mem: 2 },
        E: { id: 'end', draw: 'door', layer: 'wall', color: '#2a1810', on: async () => self.endDoor() },
        C: { id: 'chair', draw: 'chair', on: async o => self.chair(o) },
        X: { id: 'drawer', draw: 'drawer', on: async o => self.drawer(o) },
        P: { id: 'vase', draw: 'vase', on: async () => { await say('', 'แจกันดอกไม้แห้ง ก้านดอกไม้ทุกก้านหักงอไปทางเดียวกัน... ทางที่ฉันเดินมา'); } },
      },
      onStep(x, y) {
        if (x >= 30 && !G.flags.loopBroken) self.loop();
      },
      slowAt(x, y) { return G.map.objs.some(o => o.hair && o.x === x && o.y === y) ? 2.4 : 1; },
      drawLight(c, cam, t) {
        [3, 13, 23].forEach(wx => {
          const x = wx * TILE - cam.x, y = 2 * TILE - cam.y;
          const gr = c.createLinearGradient(x, y, x + 60, y + 96);
          gr.addColorStop(0, 'rgba(190,40,20,.28)'); gr.addColorStop(1, 'rgba(190,40,20,0)');
          c.fillStyle = gr; c.beginPath(); c.moveTo(x + 4, y); c.lineTo(x + 28, y); c.lineTo(x + 90, y + 96); c.lineTo(x + 50, y + 96); c.closePath(); c.fill();
        });
      },
      lights: () => [3, 13, 23].map(wx => ({ x: wx * TILE + 40, y: 3.4 * TILE, r: 90, a: 0.8 })),
    };
  },
  async loop() {
    await run(async () => {
      G.flags.loop++;
      const L = G.flags.loop;
      Sound.glitch(); G.fx.glitch = 0.5; flash('0,0,0', 0.9);
      const p = G.player; p.x = p.tx = 3; p.fx = 3; p.moving = false;
      ['f1', 'f2', 'f3'].forEach(id => { const f = getObj(id); f.stage = Math.min(3, L); f.tilt = L % 2 === 1; });
      await wait(250);
      if (L === 1) { subtitle('...ทางเดินเดิม ประตูบานเดิม', 2600); await thought('ฉันเพิ่งเดินผ่านตรงนี้ไป... ทำไมกลับมาอยู่ที่เดิม'); setObjective('ทางเดินวนกลับที่เดิม — สังเกตสิ่งที่เปลี่ยนไปในแต่ละรอบ'); }
      if (L === 2) {
        Sound.creak(); Sound.hair();
        const d = getObj('drawer'); d.open = true;
        [[18, 3], [20, 3], [18, 4], [19, 4], [20, 4], [19, 2], [17, 4], [21, 4]].forEach(([x, y]) => addObj({ x, y, draw: 'hairTile', layer: 'floor', solid: false, hair: true }));
        await say('', 'ครืด... ลิ้นชักกลางทางเดินเลื่อนเปิดออกเองช้าๆ เส้นผมยาวสีดำไหลทะลักออกมาเต็มพื้น');
      }
      if (L === 3) { Sound.whisper(); subtitle('นั่งลงสิ... แบกมันไว้ แบกสิ่งที่เธอทำ', 3500, 'mint'); }
      if (L >= 4 && !G.flags.sat) { subtitle('เก้าอี้ตัวนั้น... รอเธออยู่', 3000, 'whisper'); hurt(4); }
    });
  },
  async frame(o, i) {
    const L = Math.min(3, G.flags.loop || 0);
    const txt = [
      'ภาพถ่ายคู่รักยิ้มให้กล้อง ใบหน้าของผู้หญิงถูกขูดจนกระดาษเป็นรู',
      'ภาพเดิม... แต่ตอนนี้ทั้งสองคนนั่งอยู่ในรถ ผู้ชายหันมายิ้มให้กล้อง ไม่ได้มองถนน',
      'ภาพรถคันเดิม กระจกหน้าแตกเป็นใยแมงมุม มีมือขาวซีดแนบอยู่ด้านใน',
      'กรอบรูปว่างเปล่า มีแต่รอยฝ่ามือเปื้อนเลือดประทับอยู่ด้านในกระจก',
    ];
    await say('', txt[L]);
    if (i === 2 && L >= 2) await memory(2);
    if (o.tilt) { await say('', ez('กรอบรูปเอียงอยู่ ฉันจัดให้ตรง... กฎข้อ 2 "ของหยิบมาจากไหน ให้วางคืนที่เดิม"', 'กรอบรูปเอียงอยู่ ฉันจัดให้ตรงโดยไม่ได้คิด... เหมือนมีอะไรสั่งให้ทำ')); o.tilt = false; }
  },
  async chair(o) {
    if (G.flags.sat) { await say('', 'เบาะเก้าอี้มีรูทะลุรูปกระดูกสันหลัง ยังอุ่นอยู่'); return; }
    await say('', 'เก้าอี้เบาะยุบตัวหนึ่ง หันหน้าออกจากผนัง รอยบุ๋มบนเบาะเป็นรูปคนนั่งพอดี');
    if ((G.flags.loop || 0) >= 1) await thought('ทุกรอบที่ฉันเดินผ่าน... เก้าอี้ตัวนี้หันตามฉันมาเรื่อยๆ');
    const c = await choose(['นั่งลง', 'เดินผ่านไป']);
    if (c !== 0) return;
    const p = G.player; p.x = p.tx = o.x; p.y = p.ty = o.y; p.fx = o.x; p.fy = o.y;
    o.hidden = true; G.playerPose = 'sit';
    await wait(500);
    Sound.crack(); Sound.crunch(); shake(6, 600); G.fx.red = 0.35;
    await say('', 'กร๊อบ— กระดูกสันหลังของใครบางคนแทงทะลุเบาะขึ้นมา... รับกับแผ่นหลังฉันพอดี ราวกับวัดตัวมาแล้ว');
    await say('', 'น้ำหนักบางอย่างกดทับลงบนบ่า หนักเหมือนหลังคารถที่บุบลงมา');
    G.fx.red = 0;
    await say('', 'มือเย็นเฉียบนับสิบโผล่ออกมาจากเบาะ รัดข้อมือฉันไว้แน่น!');
    let okk = false;
    for (let tries = 0; tries < 4 && !okk; tries++) {
      okk = await qteMash('กด [E] รัวๆ เพื่อดิ้นให้หลุด!', 12, 4200);
      if (!okk) { hurt(6, 'มันไม่ยอมปล่อย...'); Sound.scream(0.6); }
    }
    G.playerPose = null; o.hidden = false; o.spine = true;
    p.y = p.ty = o.y + 1; p.fy = p.y; p.dir = 'up';
    Sound.hit();
    G.flags.sat = true;
    await say('', 'ฉันกระชากตัวหลุดออกมาได้ หลังเสื้อขาดเป็นแนวยาว');
    await thought('ตราบาปที่ฉันแบกไว้... มันหนักขนาดนี้เลยเหรอ');
    Sound.creak();
    await say('', 'ไกลออกไปกลางทางเดิน ลิ้นชักสั่นกึกๆ เหมือนกลอนข้างในเพิ่งคลายออก');
    if (!getObj('drawer').open) { getObj('drawer').open = true; Sound.hair(); [[18, 3], [20, 3], [18, 4], [19, 4], [20, 4]].forEach(([x, y]) => addObj({ x, y, draw: 'hairTile', layer: 'floor', solid: false, hair: true })); }
    setObjective('ตรวจดูลิ้นชักที่เส้นผมไหลออกมา');
  },
  async drawer(o) {
    if (G.flags.recipe) { await say('', 'ลิ้นชักว่างเปล่า เหลือแค่เส้นผมพันกันเป็นก้อน'); return; }
    if (!G.flags.sat) {
      if (o.open) await say('', 'เส้นผมพันกันแน่นเหมือนตาข่าย ดึงเท่าไหร่ก็ไม่ขาด มันดึงกลับเหมือนมีใครกำไว้จากข้างใน');
      else await say('', 'ลิ้นชักติดแน่น เหมือนมีอะไรดึงไว้จากข้างใน');
      await thought('บ้านหลังนี้คงไม่ยอมให้อะไรฉันง่ายๆ... จนกว่าฉันจะยอมแบกอะไรบางอย่างไว้ก่อน');
      return;
    }
    Sound.hair(); shake(2, 400);
    await say('', 'ฉันล้วงมือลงไปในกองเส้นผม มันเปียกและอุ่น... ปลายนิ้วสะดุดกับการ์ดแข็งๆ แผ่นหนึ่ง');
    await say('', 'การ์ดแผ่นนั้นมีเศษเนื้อติดอยู่เป็นจุดๆ');
    await this.readRecipe();
    addItem('recipe', 'การ์ดสูตรอาหาร', 'การ์ดสูตร "ข้าวผัดของมิ้น" เปื้อนเศษเนื้อ — เปิดอ่านซ้ำได้ในสมุด');
    G.flags.recipe = true;
    G.flags.loopBroken = true;
    Sound.rumble(1.2);
    await say('', 'ทางเดินเงียบลงทันที แดดสีเลือดหรี่ลง... ประตูสุดทางดูใกล้เข้ามา');
    revealRule(2);
    setObjective('ไปที่ประตูสุดทางเดิน');
  },
  async readRecipe() {
    await readNote('การ์ดสูตรอาหาร — "ข้าวผัดของมิ้น"',
      `• ข้าวสวย .......... 1 ทัพพี <span class="blood">(ใส่ก่อนเสมอ)</span>
• ไข่ .................. 4 ฟอง (เน่าแล้วก็ไม่เป็นไร)
• น้ำมัน ............... 1 กระป๋อง — <span class="blood">ไม่ใช่น้ำมันพืช กลิ่นต้องเหมือนรถ</span>
• ผัก .................. 7 ใบ (ไม่ต้องล้างเลือดออก)
• เนื้อ ................. 3 ชิ้น
• เกลือ ................ 9 หยิบมือ

<span class="blood">"ใส่ตามเวลาที่ทุกอย่างพังลง"</span>`);
  },
  async endDoor() {
    if (!G.flags.loopBroken) { await say('', 'ประตูอยู่ตรงหน้าแท้ๆ แต่ยิ่งเดินเข้าไปใกล้ มันกลับยิ่งถอยห่าง'); return; }
    Sound.door();
    await say('', 'กลิ่นเนื้อไหม้ปะทะหน้าทันทีที่ประตูเปิด');
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 3 — Tasting the Rot (kitchen recipe puzzle)
   ========================================================= */
const ING = {
  rice: 'ข้าวสวย', egg: 'ไข่เน่า', oil: 'น้ำมันเครื่อง', veg: 'ผักเปื้อนเลือด', meat: 'ชิ้นเนื้อ', salt: 'เกลือ',
};
const CH3 = {
  num: 'บทที่ ๓', title: 'อาหารที่ต้องกลืน', en: 'Tasting the Rot', when: 'วันที่ 2 · 14:17',
  start() {
    setChapterLabel(`บทที่ 3 — ${this.title}`);
    setClock('14:17');
    Sound.ambient('kitchen');
    loadMap(this.map(), 7, 7, 'up');
    this.bangT = 0;
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      await say('', 'ห้องครัวคละคลุ้งไปด้วยกลิ่นเนื้อไหม้ ตู้เย็นสั่นสะท้าน มีเสียงกระแทกดังมาจากข้างใน');
      Sound.bang();
      await thought('ประตูที่ฉันเพิ่งเดินเข้ามา... หายไปแล้ว');
      if (EASY()) await thought('กฎข้อ 3 — กินเฉพาะอาหารที่ทำในครัวนี้ ...ฉันคงต้องทำอาหารตามการ์ดนั่น');
      setObjective('หาวัตถุดิบ แล้วทำ "ข้าวผัดของมิ้น" ที่เตา');
    });
  },
  map() {
    const self = this;
    return {
      name: 'kitchen', floor: 'tile', seed: 33, wall: { face: '#4a4236', stripe: '#433c31', base: '#211c16', top: '#0b0909' },
      grid: [
        '################',
        '#############WE#',
        '#F.KS.P.V..L...#',
        '#..............#',
        '#......T.......#',
        '#..............#',
        '#..............#',
        '#..............#',
        '#######D########',
      ],
      dark: 0.5, playerLight: 110,
      legend: {
        F: { id: 'fridge', draw: 'fridge', bang: true, on: async o => self.fridge(o) },
        K: { id: 'sink', draw: 'counter', item: 'sink', on: async o => self.sink(o) },
        S: { id: 'stove', draw: 'stove', fire: null, light: o => o.fire ? { r: 110, color: o.fire === 'blue' ? '60,120,255' : '255,120,30', ga: 0.35, flicker: true } : null, on: async o => self.stove(o) },
        P: { id: 'ricepot', draw: 'counter', item: 'rice', on: async o => self.pick(o, 'rice', 'หม้อหุงข้าวเก่าๆ ข้าวข้างในเย็นชืด เม็ดข้าวบางเม็ดเป็นสีชมพู', 'ฉันตักข้าวมาหนึ่งทัพพี') },
        V: { id: 'vegc', draw: 'counter', item: 'veg', on: async o => self.pick(o, 'veg', 'ผักกาดกองหนึ่งบนเขียง ใบผักเปื้อนเลือดเป็นจ้ำๆ เหมือนเพิ่งถูกกดลงบนแผล', 'ฉันเด็ดใบผักมาเจ็ดใบ') },
        L: { id: 'saltc', draw: 'counter', item: 'salt', on: async o => self.pick(o, 'salt', 'โหลเกลือ ฝาเปื้อนรอยนิ้วมือสีแดง', 'ฉันหยิบเกลือมาเก้าหยิบมือ') },
        T: { id: 'table', draw: 'table', w: 2, cloth: true, mem: 3, on: async () => { await say('', 'โต๊ะกินข้าวสำหรับสองคน จานอีกใบวางคว่ำไว้ เหมือนรู้ว่าจะไม่มีใครมานั่ง'); await memory(3); } },
        W: { id: 'scratch', draw: 'scratch', layer: 'wall', on: async () => { await say('', 'บนผนังมีรอยเล็บขูดลึกลงไปในเนื้อไม้ เป็นตัวเลขสี่ตัว'); await say('', '1  4  1  7'); await thought('สิบสี่นาฬิกา สิบเจ็ดนาที... ทำไมเลขนี้ทำให้หัวฉันปวดตุบๆ'); G.flags.sawScratch = true; } },
        E: { id: 'exit', draw: 'door', layer: 'wall', color: '#2a1a12', on: async () => self.exit() },
        D: { id: 'fake', draw: 'doorBottom', layer: 'wall', on: async () => { await say('', 'ประตูที่ฉันเดินเข้ามา... ตอนนี้เป็นแค่ภาพวาดบนผนัง สีน้ำมันยังไม่แห้ง'); } },
      },
      update(dt) {
        self.bangT -= dt;
        const f = getObj('fridge');
        if (self.bangT <= 0 && !G.flags.cooked) {
          self.bangT = (G.flags.failCook ? 2.2 : 3.6) + Math.random() * 2;
          Sound.bang(); f.bang = true; setTimeout(() => f.bang = false, 260);
          if (G.player && dist(G.player.x, G.player.y, f.x, f.y) < 4) shake(2, 200);
        }
      },
    };
  },
  async pick(o, id, desc, took) {
    await say('', desc);
    if (hasItem(id)) { await say('', 'หยิบมาแล้ว'); return; }
    const c = await choose(['หยิบ', 'ไม่หยิบ']);
    if (c !== 0) return;
    addItem(id, ING[id], took);
    if (id === 'veg') o.item = 'empty';
  },
  async sink(o) {
    await say('', 'อ่างล้างจานมีน้ำแดงขุ่นขังอยู่ ใต้อ่างมีตู้เล็กๆ แง้มอยู่');
    if (hasItem('oil')) return;
    await say('', 'ข้างในมีกระป๋องน้ำมันเครื่องรถยนต์... กลิ่นมันเหมือนรถคันนั้น');
    const c = await choose(['หยิบ', 'ไม่หยิบ']);
    if (c === 0) addItem('oil', ING.oil, 'น้ำมันเครื่องหนึ่งกระป๋อง ข้างกระป๋องมีรอยบุบ');
  },
  async fridge(o) {
    if (!G.flags.fridgeOpened) {
      await say('', 'ตู้เย็นสั่นอย่างรุนแรง ทุกครั้งที่มีเสียงกระแทก ประตูตู้จะนูนออกมาเป็นรูปฝ่ามือ');
      const c = await choose(['เปิดตู้เย็น', 'ถอยห่าง']);
      if (c !== 0) return;
      G.flags.fridgeOpened = true;
      o.open = true; Sound.stinger(); Sound.scream(0.7); flash('255,255,255', 0.7); shake(8, 600); G.fx.glitch = 0.8;
      await say('', '...เงียบ ข้างในไม่มีใคร มีแต่ไอเย็นพวยพุ่งออกมาพร้อมกลิ่นเน่า');
      await say('', 'ชั้นบนมีไข่สี่ฟองเปลือกดำคล้ำ ชั้นล่างมีชิ้นเนื้อสามชิ้น... ชิ้นหนึ่งมีต่างหูมุกติดอยู่');
      hurt(4);
    }
    const opts = [];
    if (!hasItem('egg')) opts.push(['egg', 'หยิบไข่เน่า']);
    if (!hasItem('meat')) opts.push(['meat', 'หยิบชิ้นเนื้อ']);
    if (!opts.length) { await say('', 'ตู้เย็นว่างเปล่า มีแต่น้ำแข็งเกาะเป็นรอยนิ้วมือ'); return; }
    const c = await choose(opts.map(x => x[1]).concat(['ปิดตู้']));
    if (c < 0 || c >= opts.length) return;
    const id = opts[c][0];
    addItem(id, ING[id], id === 'egg' ? 'ไข่สี่ฟอง เปลือกนิ่มยุบลงไปเป็นบางจุด' : 'ชิ้นเนื้อสามชิ้น ชิ้นหนึ่งมีต่างหูมุกฝังอยู่');
    if (id === 'meat') { await thought('ต่างหูนี่... ฉันซื้อให้ใครบางคน'); }
  },
  async stove(o) {
    if (G.flags.cooked) {
      if (!G.flags.ate) return this.eat(o);
      await say('', 'เปลวไฟสีน้ำเงินมอดลงแล้ว'); return;
    }
    if (!G.flags.readStoveNote) {
      G.flags.readStoveNote = true;
      await readNote('โน้ตแปะหน้าเตา', 'อย่าเคี้ยว...\nมันมีเศษกระจก\n\n<span class="blood">กลืนลงไปเลย เหมือนทุกครั้ง</span>');
    }
    const have = Object.keys(ING).filter(hasItem);
    if (have.length < 4) { await say('', `กระทะว่างเปล่ารออยู่บนเตา... ฉันยังมีวัตถุดิบไม่พอ (มี ${have.length} อย่าง)`); return; }
    await this.cookUI(o);
  },
  cookUI(o) {
    const g0 = G.gen, self = this;
    return new Promise(res => {
      const have = Object.keys(ING).filter(hasItem);
      const seq = [];
      let sel = 0;
      const panel = document.createElement('div'); panel.className = 'panel pz-center';
      panel.innerHTML = `<h2>กระทะบนเตา</h2><div class="pz-num">ใส่วัตถุดิบทีละอย่าง ครบสี่อย่างแล้วไฟจะติด</div>
        <div class="pz-row slots"></div><div class="pz-row btns"></div>
        <div class="pz-row"><button class="pz-btn" data-k="clear">เทออก</button><button class="pz-btn" data-k="card">ดูการ์ดสูตร</button><button class="pz-btn" data-k="close">ถอยออกมา</button></div>
        <div class="hint kbd">← → เลือก · E ใส่ · X ปิด</div>`;
      const slots = panel.querySelector('.slots'), btns = panel.querySelector('.btns');
      const allBtns = [];
      function draw() {
        slots.innerHTML = '';
        for (let i = 0; i < 4; i++) { const d = document.createElement('div'); d.className = 'pz-slot' + (seq[i] ? ' filled' : ''); d.textContent = seq[i] ? ING[seq[i]] : '—'; slots.appendChild(d); }
        allBtns.forEach((b, i) => { b.classList.toggle('sel', i === sel); if (b.dataset.k && ING[b.dataset.k]) b.disabled = seq.includes(b.dataset.k); });
      }
      have.forEach(k => { const b = document.createElement('button'); b.className = 'pz-btn'; b.dataset.k = k; b.textContent = ING[k]; btns.appendChild(b); });
      panel.querySelectorAll('button').forEach(b => allBtns.push(b));
      allBtns.forEach((b, i) => b.onclick = e => { e.stopPropagation(); sel = i; act(); });
      let h, busy = false;
      async function act() {
        if (busy) return;
        const k = allBtns[sel].dataset.k;
        if (k === 'close') { h.close(); if (g0 === G.gen) res(); return; }
        if (k === 'clear') { seq.length = 0; Sound.splash(); draw(); return; }
        if (k === 'card') { h.close(); await self.constructor_readRecipe(); if (g0 === G.gen) { await self.cookUI(o); res(); } return; }
        if (seq.includes(k)) return;
        seq.push(k); Sound.sizzle(0.4); draw();
        if (seq.length === 4) {
          busy = true;
          await wait(500);
          h.close();
          const ok = seq.join(',') === 'rice,egg,oil,veg';
          if (ok) await self.success(o); else await self.fail(o, seq);
          if (g0 === G.gen) res();
        }
      }
      h = openModal(panel, {
        key(a) {
          if (busy) return;
          if (a === 'left') { sel = (sel + allBtns.length - 1) % allBtns.length; Sound.tick(); draw(); }
          else if (a === 'right' || a === 'down') { sel = (sel + 1) % allBtns.length; Sound.tick(); draw(); }
          else if (a === 'up') { sel = (sel + allBtns.length - 1) % allBtns.length; Sound.tick(); draw(); }
          else if (a === 'ok') act();
          else if (a === 'cancel') { h.close(); if (g0 === G.gen) res(); }
        }
      });
      draw();
    });
  },
  constructor_readRecipe() { return CH2.readRecipe(); },
  async fail(o, seq) {
    o.fire = 'orange'; Sound.fire(); Sound.scream(0.5); flash('255,120,20', 0.7); shake(8, 500);
    G.flags.failCook = (G.flags.failCook || 0) + 1;
    hurt(9, 'ไฟลุกท่วมมือ!');
    await wait(600); o.fire = null;
    await say('', 'น้ำมันในกระทะระเบิดเป็นลูกไฟสีส้ม หลังมือฉันพองเป็นตุ่ม วัตถุดิบไหม้เกรียมเป็นสีดำ');
    if (seq.includes('meat') || seq.includes('salt')) await say('', 'กลิ่นเหม็นไหม้ของเนื้อ... ตู้เย็นกระแทกแรงขึ้นเหมือนโกรธ');
    await say('', 'แต่พอกะพริบตา วัตถุดิบทุกอย่างก็กลับไปวางอยู่ที่เดิม');
    if (G.flags.failCook >= 2 && !G.flags.sawScratch) await thought('ต้องมีอะไรบอกลำดับไว้สักที่... ลองดูตามผนังห้อง');
    else if (G.flags.failCook >= 2) await thought('"ใส่ตามเวลาที่ทุกอย่างพังลง"... 1-4-1-7 กับจำนวนในการ์ดสูตร');
  },
  async success(o) {
    o.fire = 'blue'; Sound.fire(); flash('80,140,255', 0.6);
    await wait(500);
    await say('', 'พรึ่บ— เปลวไฟลุกขึ้นเป็นสีน้ำเงินสว่างจ้า แต่กลับเงียบสนิท ไม่มีเสียงน้ำมันแตกเลยสักนิด');
    Sound.stopAmbient(0.5);
    await say('', 'ตู้เย็นหยุดสั่น ความเงียบแผ่ไปทั่วห้อง');
    o.dish = true; G.flags.cooked = true;
    ['rice', 'egg', 'oil', 'veg'].forEach(removeItem);
    await say('', 'ในกระทะมีข้าวผัดสีดำสนิท มีเศษอะไรบางอย่างระยิบระยับอยู่ข้างใน');
    Sound.ambient('kitchen');
    await this.eat(o);
  },
  async eat(o) {
    const c = await choose([ez('กิน (กฎข้อ 3)', 'กิน'), 'ยังไม่กิน']);
    if (c !== 0) { await say('', 'ท้องฉันบิดเหมือนมีอะไรข่วนอยู่ข้างใน'); hurt(3); return; }
    G.playerPose = null;
    await say('', 'ฉันตักเข้าปาก...');
    Sound.crunch(); shake(3, 700);
    await wait(700);
    Sound.shatter(); flash('255,255,255', 1); G.fx.glitch = 1; shake(12, 900);
    setClock('14:17');
    await say('', '— กระจกหน้ารถแตกกระจายเป็นเกล็ด แสงไฟหน้าของรถอีกคัน เสียงเหล็กบิด เสียงผู้หญิงกรีดร้อง —', { cls: 'shadow' });
    await wait(300);
    hurt(8);
    await say('', 'ฉันสำลัก คายเศษกระจกปนเลือดออกมาเต็มฝ่ามือ... มีเข็มนาฬิกาสีทองอันเล็กปนอยู่ด้วย');
    addItem('hand', 'เข็มนาฬิกาสั้น', 'เข็มชั่วโมงสีทอง ยังมีข้าวผัดสีดำติดอยู่');
    G.flags.ate = true; o.dish = false;
    revealRule(3);
    Sound.unlock();
    await say('', 'แกร๊ก... ประตูมุมห้องปลดล็อก');
    setObjective('ออกจากห้องครัว');
  },
  async exit() {
    if (!G.flags.ate) { await lockedDoor('ประตูล็อกแน่น มีกระดาษติดไว้ว่า "กินให้หมดก่อน"'); return; }
    Sound.door();
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 4 — Shattered Face (headlights & mirror)
   ========================================================= */
const CH4 = {
  num: 'บทที่ ๔', title: 'เงาในกระจก', en: 'Shattered Face', when: 'วันที่ 3 · 11:52',
  start() {
    setChapterLabel(`บทที่ 4 — ${this.title}`);
    setClock('11:52');
    Sound.ambient('bedroom');
    this.beam = { phase: 'off', t: 3, x: -3, dir: 1 };
    loadMap(this.map(), 6, 8, 'up');
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      await say('', 'ห้องนอนมืดสลัว ทั้งที่ใกล้เที่ยงวัน หน้าต่างกลับมีแสงไฟหน้ารถสองดวงสาดเข้ามาเป็นระยะ');
      await thought('ข้างนอกไม่มีถนนสักหน่อย... แล้วรถคันนั้นมาจากไหน');
      if (EASY()) await say('', 'ไม่รู้ทำไม แต่ฉันรู้ว่าต้องไม่ให้แสงนั่นส่องโดนตัว... ต้องหลบหลังเฟอร์นิเจอร์ หรือรอให้แสงผ่านไปก่อน');
      setObjective(ez('พูดกับกระจกตอนเที่ยงตรง (กฎข้อ 5)', 'สำรวจห้องนอน'));
    });
  },
  map() {
    const self = this;
    return {
      name: 'bedroom', floor: 'wood', floor2: 'carpet', seed: 44,
      wall: { face: '#2f2a35', stripe: '#29242f', base: '#141017', top: '#08070a', win: '#c8c090' },
      grid: [
        '###############',
        '##ww####ww##M##',
        '#.B.N........A#',
        '#.............#',
        '#.....Q.......#',
        '#.........H...#',
        '#..==.........#',
        '#..==.........#',
        '#.............#',
        '######D#####X##',
      ],
      dark: 0.68, playerLight: 95,
      legend: {
        B: { id: 'bed', draw: 'bed2', w: 2, h: 2, on: async () => { await say('', 'เตียงคู่ หมอนใบหนึ่งยังมีรอยบุ๋มของศีรษะ อีกใบเปื้อนเลือดแห้งเป็นวง'); } },
        N: { id: 'clock', draw: 'nightstand', clock: true, on: async o => self.clock(o) },
        M: { id: 'mirror', draw: 'mirror', layer: 'wall', on: async o => self.mirror(o) },
        A: { id: 'wardrobe', draw: 'wardrobe', mem: 4, on: async () => { await say('', 'ตู้เสื้อผ้า มีแจ็คเก็ตหนังของผู้ชายแขวนอยู่ตัวเดียว ไหล่ซ้ายขาดวิ่น'); await memory(4); } },
        Q: { id: 'dresser', draw: 'drawer', on: async () => { await say('', 'โต๊ะเครื่องแป้ง ในลิ้นชักมีแต่ยาแก้ปวดหัวเป็นสิบแผง ทุกช่องที่แกะแล้วมีวันที่เขียนกำกับไว้'); } },
        H: { id: 'chairb', draw: 'chair', on: async () => { await say('', 'เก้าอี้หันหน้าเข้าหาหน้าต่าง เหมือนมีคนนั่งรอใครบางคนกลับบ้าน'); } },
        D: { id: 'in', draw: 'doorBottom', layer: 'wall', on: async () => { await say('', 'ประตูที่เข้ามา... ลูกบิดหมุนฟรี มันไม่พาไปไหนแล้ว'); } },
        X: { id: 'study', draw: 'doorBottom', layer: 'wall', color: '#1c1410', on: async () => self.studyDoor() },
      },
      update(dt) { self.updateBeam(dt); },
      cutLight(lc, cam) {
        const b = self.beam; if (b.phase !== 'sweep') return;
        const x = b.x * TILE - cam.x, y0 = 2 * TILE - cam.y;
        const gr = lc.createLinearGradient(x - 50, 0, x + 50, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        lc.fillStyle = gr; lc.fillRect(x - 50, y0, 100, 8 * TILE);
      },
      drawLight(c, cam, t) {
        const b = self.beam;
        if (b.phase === 'warn' || b.phase === 'sweep') {
          const a = b.phase === 'warn' ? 0.25 + Math.sin(t * 30) * 0.15 : 0.35;
          [[2, 3], [8, 9]].forEach(([a1]) => { c.fillStyle = `rgba(255,240,180,${a})`; c.fillRect(a1 * TILE - cam.x, TILE - cam.y, 64, 32); });
        }
        if (b.phase !== 'sweep') return;
        const x = b.x * TILE - cam.x, y0 = 2 * TILE - cam.y;
        const gr = c.createLinearGradient(x - 50, 0, x + 50, 0);
        gr.addColorStop(0, 'rgba(255,240,190,0)'); gr.addColorStop(0.5, 'rgba(255,240,190,.32)'); gr.addColorStop(1, 'rgba(255,240,190,0)');
        c.fillStyle = gr; c.fillRect(x - 50, y0, 100, 8 * TILE);
      },
    };
  },
  shadowed(x, y) { for (let yy = 2; yy < y; yy++) if (objsAt(x, yy).some(o => o.solid !== false && o.layer !== 'floor')) return true; return false; },
  updateBeam(dt) {
    const b = this.beam; if (!G.running || G.flags.noonDone && G.flags.mirrorDone) { b.phase = 'off'; return; }
    b.t -= dt;
    if (b.phase === 'off' && b.t <= 0) { b.phase = 'warn'; b.t = 1.1; Sound.engine(); }
    else if (b.phase === 'warn' && b.t <= 0) { b.phase = 'sweep'; b.dir = Math.random() < 0.5 ? 1 : -1; b.x = b.dir > 0 ? -1 : 16; b.t = 2.3; }
    else if (b.phase === 'sweep') {
      b.x += b.dir * dt * 7.4;
      const p = G.player;
      if (p && G.busy === 0 && !Input.layers.length && !this.hitCd) {
        const px = p.fx + 0.5;
        if (Math.abs(px - b.x) < 0.9 && !this.shadowed(Math.round(p.fx), Math.round(p.fy))) {
          this.hitCd = true; setTimeout(() => this.hitCd = false, 1800);
          Sound.horn(); Sound.brake(); flash('255,250,220', 0.95); hurt(8, 'เบรก!!');
        }
      }
      if (b.t <= 0) { b.phase = 'off'; b.t = 3.6 + Math.random() * 1.6; }
    }
  },
  async clock(o) {
    if (G.flags.noonDone) { await say('', 'นาฬิกาหยุดเดินที่ 12:00 ...เข็มสั่นเหมือนอยากย้อนกลับไปที่ 14:17'); return; }
    if (!G.flags.handIn) {
      await say('', 'นาฬิกาหัวเตียง ไม่มีเข็มสั้น เข็มยาวค้างอยู่ที่นาทีที่ 17');
      if (!hasItem('hand')) return;
      await say('', 'ฉันใส่เข็มสีทองที่คายออกมาจากปากลงไป... พอดีเป๊ะ');
      removeItem('hand'); G.flags.handIn = true;
      Sound.unlock();
      await say('', 'นาฬิกาบอกเวลา 14:17 — บ่ายสองโมงสิบเจ็ดนาที');
    }
    const ok = await this.clockUI();
    if (!ok) return;
    G.flags.noonDone = true; setClock('12:00');
    for (let i = 0; i < 12; i++) setTimeout(() => Sound.dong(), i * 260);
    await wait(1200);
    const m = getObj('mirror'); m.clear = true;
    Sound.sizzle(1.5);
    await say('', 'เหง่ง... เหง่ง... นาฬิกาตีบอกเที่ยงสิบสองครั้ง ไอฝ้าบนกระจกบานใหญ่ค่อยๆ กลายเป็นหยดน้ำไหลลงมา');
    setObjective('พูดกับกระจก');
  },
  clockUI() {
    const g0 = G.gen;
    return new Promise(res => {
      let mins = 14 * 60 + 17;
      const panel = document.createElement('div'); panel.className = 'panel pz-center';
      panel.innerHTML = `<h2>นาฬิกาหัวเตียง</h2>
        <div class="clockwrap"><svg viewBox="-50 -50 100 100"></svg><div><div class="digital"></div><div class="pz-num" style="margin-top:6px">${ez('ตั้งเวลา "เที่ยงตรง"', 'ตั้งเวลา')}</div></div></div>
        <div class="pz-row"><button class="pz-btn" data-d="-60">◀◀ ชม.</button><button class="pz-btn" data-d="-5">◀ 5 น.</button><button class="pz-btn" data-d="5">5 น. ▶</button><button class="pz-btn" data-d="60">ชม. ▶▶</button></div>
        <div class="pz-row"><button class="pz-btn" data-k="ok">ตั้งเวลา</button><button class="pz-btn" data-k="x">ถอยออกมา</button></div>
        <div class="hint kbd">← → ทีละ 5 นาที · ↑ ↓ ทีละชั่วโมง · E ยืนยัน · X ปิด</div>`;
      const svg = panel.querySelector('svg'), dig = panel.querySelector('.digital');
      function draw() {
        const t24 = ((mins % 1440) + 1440) % 1440, hh = Math.floor(t24 / 60), mm = t24 % 60;
        let s = '<circle r="46" fill="#cdbf9f" stroke="#2a1a10" stroke-width="4"/>';
        const nums = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        nums.forEach((n, i) => { const a = i / 12 * Math.PI * 2; s += `<text x="${Math.sin(a) * 36}" y="${-Math.cos(a) * 36 + 3}" font-size="8" text-anchor="middle" fill="#3a1a10" font-family="serif">${n}</text>`; });
        s += '<circle cx="-14" cy="18" r="9" fill="rgba(110,10,10,.35)"/>';
        const ha = (((hh % 12) + mm / 60) / 12) * Math.PI * 2, ma = (mm / 60) * Math.PI * 2;
        s += `<line x1="0" y1="0" x2="${Math.sin(ha) * 22}" y2="${-Math.cos(ha) * 22}" stroke="#a8862a" stroke-width="4" stroke-linecap="round"/>`;
        s += `<line x1="0" y1="0" x2="${Math.sin(ma) * 34}" y2="${-Math.cos(ma) * 34}" stroke="#111" stroke-width="2" stroke-linecap="round"/><circle r="3" fill="#111"/>`;
        svg.innerHTML = s;
        dig.textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      }
      let h;
      const adj = d => { mins += d; if (Math.abs(d) === 5) mins = Math.round(mins / 5) * 5; Sound.tick(); draw(); };
      const fin = v => { h.close(); if (g0 === G.gen) res(v); };
      const confirm = async () => {
        const t24 = ((mins % 1440) + 1440) % 1440;
        if (t24 === 12 * 60) { Sound.dong(); fin(true); return; }
        if (t24 === 0) { Sound.glitch(); G.fx.glitch = 0.4; mins = 14 * 60 + 17; draw(); panel.querySelector('.pz-num').textContent = ez('นั่นคือเที่ยงคืน... เข็มดีดกลับไปที่ 14:17 เอง ต้องเป็นเที่ยงวัน', 'เข็มดีดกลับไปที่ 14:17 เอง...'); return; }
        else { Sound.glitch(); mins = 14 * 60 + 17; draw(); dig.textContent = '14:17'; G.fx.glitch = 0.3; panel.querySelector('.pz-num').textContent = ez('เข็มดีดกลับไปที่ 14:17 เอง... ต้องเป็น "เที่ยงตรง" เท่านั้น', 'เข็มดีดกลับไปที่ 14:17 เอง...'); }
      };
      panel.querySelectorAll('[data-d]').forEach(b => b.onclick = () => adj(+b.dataset.d));
      panel.querySelector('[data-k=ok]').onclick = confirm;
      panel.querySelector('[data-k=x]').onclick = () => fin(false);
      h = openModal(panel, {
        key(a) {
          if (a === 'left') adj(-5); else if (a === 'right') adj(5);
          else if (a === 'up') adj(60); else if (a === 'down') adj(-60);
          else if (a === 'ok') confirm(); else if (a === 'cancel') fin(false);
        }
      });
      draw();
    });
  },
  async mirror(o) {
    if (G.flags.mirrorDone) { await say('', 'กระจกร้าวเป็นใยแมงมุม เงาในนั้นยังจ้องฉันอยู่ ทั้งที่ฉันหันหลังให้มัน'); return; }
    if (!G.flags.noonDone) {
      await say('', 'กระจกบานใหญ่ขุ่นมัวด้วยไอน้ำร้อน... ทั้งที่ห้องนี้หนาวจนมือชา');
      await say('', 'ที่มุมกระจก มีคนใช้นิ้วเขียนไว้บนไอฝ้า: "พูดกับฉันตอนเที่ยง"');
      return;
    }
    await say('', 'กระจกใสแจ๋ว เงาของฉันยืนอยู่ในนั้น... แต่ห้องในกระจกมืดกว่าห้องจริง');
    const c = await choose(['"ฉันสบายดี ทุกอย่างปกติ"', '"ฉันไม่ได้ทำอะไรผิด"', '"...ฉันเป็นใคร"'], { prompt: ez('กฎข้อ 5: พูดกับกระจกตอนเที่ยง', 'จะพูดอะไรกับกระจก') });
    const lines = ['ฉันสบายดี ทุกอย่างปกติ', 'ฉันไม่ได้ทำอะไรผิด', 'ฉันเป็นใคร'];
    await say('ปฐพี', lines[Math.max(0, c)] + '...');
    await wait(600);
    Sound.stinger(); Sound.glitch(); G.fx.glitch = 1; shake(6, 700);
    o.near = true;
    await say('', 'เงาในกระจกไม่ขยับปากตามฉัน มันเอียงคอช้าๆ...');
    await say('', 'แล้วผมด้านขวาของมันก็ร่วงหลุดลงมา เผยให้เห็นกะโหลกที่ยุบลงไปเป็นแอ่ง');
    flash('120,0,0', 0.8); Sound.scream(0.8);
    await showFace();
    G.flags.woundVisible = true; G.flags.sawWound = true;
    hurt(10);
    await talk([
      ['เงาในกระจก', c === 1 ? 'ไม่ได้ทำอะไรผิด...? ดูหัวเราสิ ปฐพี' : c === 0 ? 'สบายดี...? ดูหัวเราสิ ปฐพี' : 'เราคือคนขับ... ดูหัวเราสิ ปฐพี'],
      ['เงาในกระจก', 'ไม่ใช่ข้างซ้ายนะ... ข้างขวา กระจกฝั่งคนขับแตกใส่หัวเราด้านขวา'],
      ['เงาในกระจก', 'จำไว้ให้ดี ข้างขวา... เพราะจะมีคนพยายามทำให้เราลืม'],
    ]);
    o.cracked = true; Sound.shatter(); shake(8, 500);
    await say('', 'เพล้ง! กระจกร้าว มือของเงาทะลุรอยแตกออกมา ยื่นกุญแจเปื้อนเลือดดอกหนึ่งให้ฉัน');
    addItem('studykey', 'กุญแจห้องทำงาน', 'กุญแจเปียกเลือด ยังอุ่นเหมือนเพิ่งหลุดออกมาจากในตัวใครสักคน');
    G.flags.mirrorDone = true;
    revealRule(5);
    setObjective('ไปที่ห้องทำงาน (ประตูมุมขวาล่าง)');
  },
  async studyDoor() {
    if (!hasItem('studykey')) { await lockedDoor('ประตูห้องทำงานล็อกอยู่ รูกุญแจมีคราบเลือดแห้ง'); return; }
    Sound.unlock(); await wait(200); Sound.door();
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 5 — The Silent Call (don't answer x5)
   ========================================================= */
const MINT_CALLS = [
  'ฮัลโหล... ปฐพี... ได้ยินฉันมั้ย',
  'มันหนักมาก... อะไรสักอย่างทับขาฉันอยู่... ขยับไม่ได้',
  'ฉันหายใจไม่ออก... มีอะไรอุ่นๆ ไหลเข้าปาก... มันคาว',
  'เธออยู่ตรงนั้นใช่มั้ย... ฉันเห็นรองเท้าเธอ... ทำไมไม่ช่วยฉัน',
  '...ไม่เป็นไรแล้ว... ไม่ต้องตอบแล้วก็ได้...',
];
const CH5 = {
  num: 'บทที่ ๕', title: 'สายที่ไม่ได้รับ', en: 'The Silent Call', when: 'คืนที่ 4 · 02:17',
  start() {
    setChapterLabel(`บทที่ 5 — ${this.title}`);
    setClock('02:17');
    Sound.ambient('study');
    this.st = { phase: 'idle', t: 0, count: 0, moved: false, ringSnd: 0 };
    loadMap(this.map(), 6, 8, 'up');
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      await say('', 'ห้องทำงานมืดสนิท ไฟดับทั้งห้อง ฉันมองเห็นได้แค่รอบตัวไม่กี่ก้าว');
      await thought('ที่โต๊ะกลางห้อง... มีแสงสีเขียวจางๆ จากโทรศัพท์บ้าน');
      setObjective('สำรวจห้องทำงาน');
    });
  },
  map() {
    const self = this;
    return {
      name: 'study', floor: 'wood', floor2: 'carpet', seed: 55,
      wall: { face: '#22261f', stripe: '#1e221b', base: '#0f110d', top: '#050605' },
      grid: [
        '##############',
        '##############',
        '#.KJ......KR.#',
        '#............#',
        '#....D.......#',
        '#....=====...#',
        '#..L.=====...#',
        '#............#',
        '#............#',
        '######E#####X#',
      ],
      dark: 0.95, playerLight: 72,
      legend: {
        K: { id: 'shelf', draw: 'shelf', books: true, on: async () => { await say('', 'ชั้นหนังสือกฎหมายจราจร ทุกเล่มเปิดค้างไว้ที่หน้าเดียวกัน: "ความผิดฐานขับรถโดยประมาทเป็นเหตุให้ผู้อื่นถึงแก่ความตาย"'); } },
        J: { id: 'shelf2', draw: 'shelf', books: true, on: async () => { await say('', 'หนังสือเรียงตามสี มีช่องว่างช่องหนึ่งเหมือนมีคนดึงเล่มหนึ่งออกไป'); } },
        R: { id: 'shelf3', draw: 'shelf', books: true, mem: 5, on: async () => memory(5) },
        D: { id: 'desk', draw: (c, x, y, o, t) => { SPR.desk(c, x, y, o, t); SPR.phone(c, x + 30, y - 10, o, t); }, w: 3, light: o => o.ringing ? { r: 120, color: '60,255,120', ga: 0.3, flicker: true } : { r: 40, color: '40,140,70', ga: 0.15 }, on: async o => self.desk(o) },
        L: { id: 'lamp', draw: 'lamp', on: async () => { Sound.click(); await say('', 'โคมไฟตั้งพื้น กดสวิตช์แล้วไม่ติด... สายไฟถูกตัดขาด รอยตัดเรียบกริบ'); } },
        E: { id: 'in', draw: 'doorBottom', layer: 'wall', on: async () => { await say('', 'ประตูที่เข้ามา... มีเสียงหายใจดังอยู่อีกฝั่ง'); } },
        X: { id: 'garden', draw: 'doorBottom', layer: 'wall', color: '#1a1a14', on: async () => self.gardenDoor() },
      },
      update(dt) { self.updateRing(dt); },
      interceptOk() { return self.interceptOk(); },
      onStep() { const s = self.st; if (s.phase === 'ring' && !s.moved) self.movedDuringRing(); },
    };
  },
  updateRing(dt) {
    const s = this.st, p = G.player; if (!p) return;
    const desk = getObj('desk');
    if (s.phase === 'idle' && !G.flags.callsDone && G.busy === 0 && dist(p.x, p.y, 6, 4) < 3.2) { s.phase = 'pre'; s.t = 1.4; }
    if (s.phase === 'pre') { s.t -= dt; if (s.t <= 0) { s.phase = 'introWait'; run(() => this.intro()); } }
    if (s.phase === 'ring') {
      if (Input.layers.some(l => l.freeze)) return;
      s.t -= dt; s.ringSnd -= dt;
      if (s.ringSnd <= 0) { s.ringSnd = 1.5; Sound.ring(); shake(1, 150); }
      const bar = document.querySelector('#ring-ui .ring-bar i'); if (bar) bar.style.width = clamp(s.t / 6.5 * 100, 0, 100) + '%';
      if (s.t <= 0) this.endRing(true);
    } else if (s.phase === 'gap') {
      s.t -= dt; if (s.t <= 0) this.startRing();
    }
    desk.ringing = s.phase === 'ring';
  },
  async intro() {
    await say('', 'กริ๊ง— โทรศัพท์บ้านดังขึ้นกลางความมืด');
    if (EASY()) await thought('กฎข้อ 6... "ได้ยินเสียงเรียก ห้ามทัก ห้ามตอบ"');
    if (EASY()) await say('', 'ที่หูโทรศัพท์มีโน้ตแปะไว้ ลายมือเดียวกับบนนามบัตร: "ยืนนิ่งๆ อย่าขยับ อย่ารับสาย จนกว่ามันจะเงียบไปเอง"');
    setObjective(this.callObj(0));
    G.allowMove = true;
    this.st.count = 0;
    this.startRing();
  },
  callObj(n) { return ez(`ห้ามรับสาย ห้ามขยับ — รอจนเสียงเงียบไปเอง (${n}/5)`, 'โทรศัพท์ยังดังอยู่ในความมืด'); },
  startRing() {
    const s = this.st;
    s.phase = 'ring'; s.t = 6.5; s.moved = false; s.ringSnd = 0;
    $('#ring-ui').hidden = false;
    $('#ring-ui .ring-count').textContent = ez(`สายที่ไม่ได้รับ ${s.count}/5`, `สายที่ไม่ได้รับ ${s.count}`);
    setTimeout(() => { if (this.st.phase === 'ring') { Sound.breath(); subtitle(MINT_CALLS[Math.min(4, s.count)], 5200, 'mint'); } }, 1600);
  },
  movedDuringRing() {
    const s = this.st; s.moved = true;
    Sound.creak(); hurt(4);
    subtitle(ez('พื้นไม้ลั่นเอี๊ยด... "เธออยู่ตรงนั้นจริงๆ ด้วย" (สายนี้ไม่นับ)', 'พื้นไม้ลั่นเอี๊ยด... "เธออยู่ตรงนั้นจริงๆ ด้วย"'), 2600, 'whisper');
  },
  interceptOk() {
    const s = this.st;
    if (s.phase === 'ring') { this.answer(); return true; }
    if (s.phase === 'gap') return true;
    return false;
  },
  endRing(ok) {
    const s = this.st;
    $('#ring-ui').hidden = true; clearSubtitle();
    if (ok && !s.moved) {
      s.count++;
      setObjective(this.callObj(s.count));
      if (s.count >= 5) { s.phase = 'done'; G.allowMove = false; run(() => this.callsDone()); return; }
      toast(ez(`สายที่ไม่ได้รับ ${s.count}/5`, `สายที่ไม่ได้รับ ${s.count}`));
    }
    s.phase = 'gap'; s.t = 2.6;
  },
  answer() {
    const s = this.st;
    $('#ring-ui').hidden = true;
    s.phase = 'answered';
    G.allowMove = false;
    run(async () => {
      await say('ปฐพี', 'มิ้น!? มิ้นใช่มั้ย ฉันอยู่นี่—');
      Sound.glitch(); G.fx.glitch = 1;
      await wait(400);
      Sound.scream(1.4); flash('160,0,0', 0.9); shake(14, 1200);
      hurt(14);
      await say('มิ้น', 'ตอนนั้นเธอไม่ตอบฉัน!! อย่ามาตอบตอนนี้!!', { speed: 14 });
      await say('', 'สายตัดไป... ความเงียบกลับมา และฉันรู้ว่าต้องเริ่มนับใหม่ทั้งหมด');
      s.count = 0;
      setObjective(this.callObj(0));
      G.allowMove = true;
      s.phase = 'gap'; s.t = 3;
    });
  },
  async callsDone() {
    await wait(800);
    await say('', '...');
    await say('', 'โทรศัพท์เงียบไป ครั้งนี้เงียบจริงๆ... เงียบเหมือนคนที่หยุดหายใจไปแล้ว');
    Sound.creak(); await wait(400); Sound.squish();
    const d = getObj('desk'); d.drawerOpen = true;
    await say('', 'ลิ้นชักโต๊ะเลื่อนเปิดออกเอง แล้วคายกระดาษแผ่นหนึ่งที่เปื้อนลิ่มเลือดออกมา');
    G.flags.callsDone = true;
    revealRule(6);
    setObjective('หยิบกระดาษจากลิ้นชักโต๊ะ');
  },
  async desk(o) {
    if (!G.flags.callsDone) {
      await say('', 'โต๊ะทำงานไม้สัก โทรศัพท์บ้านสีดำวางอยู่ หน้าจอเล็กๆ แสดงว่า "สายที่ไม่ได้รับ: 14 สาย"');
      return;
    }
    if (G.flags.schedule) { await say('', 'ลิ้นชักว่างเปล่า มีแต่ลิ่มเลือดเกาะเป็นแผ่น'); return; }
    await this.readSchedule();
    addItem('schedule', 'ตารางรดน้ำตีสาม', 'กระดาษเปื้อนลิ่มเลือด บอกลำดับการรดน้ำต้นไม้ — เปิดอ่านซ้ำได้ในสมุด');
    G.flags.schedule = true;
    setClock('03:00'); Sound.dong();
    await say('', 'นาฬิกาที่ไหนสักแห่งตีบอกเวลา... ตีสาม');
    Sound.unlock();
    await say('', 'แกร๊ก... ประตูมุมห้องที่ออกไปสวนหลังบ้านปลดล็อกแล้ว');
    setObjective('ไปที่สวนหลังบ้าน (ประตูมุมขวาล่าง)');
  },
  async readSchedule() {
    await readNote('ตารางรดน้ำ — ตีสามตรงเท่านั้น',
      `๑. ต้นที่อยู่ริม <b>ทางเดิน</b> ที่เธอเดินกลับบ้านทุกเย็น
๒. ต้นที่เธอมองเห็นจาก <b>หน้าต่าง</b> ตอนนั่งรอเขากลับมา
๓. ต้นสุดท้าย ปลูกบน <b>ดินดำ</b> ที่ไม่เคยแห้ง

<span class="blood">ห้ามรดต้นข้างบ่อ ห้ามรดต้นริมรั้ว
ถ้ารดผิด... มือพวกนั้นจะจำหน้าเธอได้</span>`);
  },
  async gardenDoor() {
    if (!G.flags.schedule) { await lockedDoor('ประตูออกสวนหลังบ้านล็อกอยู่ ลมเย็นลอดเข้ามาตามร่องประตู'); return; }
    Sound.door();
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 6 — The Burial Ground (watering order)
   ========================================================= */
const CH6 = {
  num: 'บทที่ ๖', title: 'รดน้ำตอนตีสาม', en: 'The Burial Ground', when: 'คืนที่ 5 · 03:00',
  start() {
    setChapterLabel(`บทที่ 6 — ${this.title}`);
    setClock('03:00');
    Sound.ambient('garden');
    this.st = { pours: 0, seq: 0, min: 0, mt: 0 };
    loadMap(this.map(), 15, 2, 'down');
    Sound.heart(54, 0.15);
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      await say('', 'สวนหลังบ้านตอนตีสาม ต้นไม้แห้งกรังแต่ละต้นมีกิ่งเหมือนแขนผู้หญิงนับสิบชูขึ้นฟ้า');
      await say('', 'ดินใต้เท้าแฉะ และเต้นตุบๆ... เหมือนหัวใจ');
      await thought('ต้องรดน้ำตามตารางให้เสร็จ ก่อนที่ตีสามจะผ่านไป');
      setObjective('หาบัวรดน้ำ แล้วรดน้ำต้นไม้ตามตาราง');
    });
  },
  map() {
    const self = this;
    const w = 22, h = 14;
    const g = mkGrid(w, h, 'g'); boxWalls(g, 2);
    [4, 10].forEach(x => g[1][x] = 'w');
    // path from door down
    for (let y = 2; y <= 7; y++) g[y][15] = 'p';
    for (let x = 8; x <= 15; x++) g[7][x] = 'p';
    for (let y = 7; y <= 12; y++) g[y][8] = 'p';
    for (let y = 9; y <= 11; y++) for (let x = 16; x <= 20; x++) g[y][x] = 's';
    g[1][15] = 'Z'; g[13][8] = 'Y';
    g[9][7] = 'A';   // tree by path
    g[3][4] = 'B';   // tree under window
    g[10][18] = 'C'; // tree on black soil
    g[11][13] = 'F'; // tree by fence
    g[10][4] = 'G';  // tree by well
    g[10][2] = 'W';  // well
    g[2][11] = 'U';  // faucet
    g[3][12] = 'N';  // watering can
    g[11][18] = 'S'; // soil mound
    g[12][1] = '.'; g[12][20] = 's';
    const tree = (id, desc) => ({ id, draw: 'armTree', tile: id === 'tC' ? 's' : 'g', on: async o => self.tree(o, desc) });
    return {
      name: 'garden', floor: 'grass', seed: 66,
      wall: { face: '#211a16', stripe: '#1b1512', base: '#0e0a08', top: '#040303', win: '#3a3418' },
      grid: gstr(g), dark: 0.86, darkColor: '4,6,18', playerLight: 105,
      legend: {
        A: tree('tA', 'ต้นไม้ข้างทางเดินหิน กิ่งของมันยื่นมาขวางทาง เหมือนอยากจับมือคนที่เดินกลับบ้าน'),
        B: tree('tB', 'ต้นไม้ใต้หน้าต่างบ้าน มองผ่านหน้าต่างเข้าไปเห็นเก้าอี้ตัวหนึ่งหันหน้าออกมาทางนี้'),
        C: tree('tC', 'ต้นไม้บนดินดำที่แฉะอยู่ตลอด รากของมันกระตุกเป็นจังหวะเดียวกับเสียงหัวใจ'),
        F: tree('tF', 'ต้นไม้ริมรั้ว นิ้วของมันเกาะรั้วแน่นเหมือนพยายามปีนหนี'),
        G: tree('tG', 'ต้นไม้ข้างบ่อน้ำ ทุกกิ่งชี้ลงไปในบ่อ'),
        W: { id: 'well', draw: 'well', mem: 6, on: async () => { await say('', 'บ่อน้ำเก่า ข้างล่างมืดสนิท ได้ยินเสียงน้ำหยดเป็นจังหวะ'); await memory(6); } },
        U: { id: 'faucet', draw: 'faucet', drip: true, on: async () => self.faucet() },
        N: { id: 'can', draw: 'can', on: async o => { await say('', 'บัวรดน้ำสังกะสีเก่า ก้นบัวมีคราบสีแดงเกาะหนา'); addItem('can', 'บัวรดน้ำ', 'บัวรดน้ำสังกะสี เติมหนึ่งครั้งรดได้สามต้น'); o.hidden = true; setObjective('เติมน้ำที่ก๊อก แล้วรดน้ำต้นไม้ตามตาราง'); } },
        S: { id: 'mound', draw: 'soilMound', tile: 's', on: async o => self.mound(o) },
        Z: { id: 'back', draw: 'door', layer: 'wall', color: '#1a1a14', on: async () => self.backDoor() },
        Y: { id: 'gate', draw: 'doorBottom', layer: 'wall', chainLock: true, color: '#1d1712', on: async () => { await say('', 'ประตูรั้วถูกล่ามโซ่ไว้หลายชั้น ข้างนอกเป็นถนนมืดๆ ที่ไม่มีไฟสักดวง'); await thought('ทางนี้... เธอเคยเดินเข้ามาทุกเย็น'); } },
      },
      update(dt) {
        const p = G.player; if (!p) return;
        const d = dist(p.x, p.y, 18, 10);
        Sound.setHeartVol(clamp(0.7 - d * 0.05, 0.08, 0.7));
        self.st.mt += dt;
        if (self.st.mt > 35 && self.st.min < 4) { self.st.mt = 0; self.st.min++; setClock('03:0' + self.st.min); }
      },
      lights: () => [{ x: 4.5 * TILE, y: 2.2 * TILE, r: 80, a: 0.5 }, { x: 10.5 * TILE, y: 2.2 * TILE, r: 80, a: 0.5 }],
    };
  },
  async faucet() {
    if (!hasItem('can')) { await say('', 'ก๊อกน้ำสนิมเขรอะ มีของเหลวสีแดงหยดออกมาช้าๆ'); return; }
    if (this.st.pours > 0) { await say('', `บัวรดน้ำยังมีน้ำอยู่ (${this.st.pours}/3)`); return; }
    Sound.pour();
    await say('', 'ฉันเปิดก๊อก น้ำที่ไหลออกมาข้นและอุ่น... สีแดงคล้ำ กลิ่นเหมือนสนิม');
    this.st.pours = 3;
    toast('บัวรดน้ำ: เต็ม (3/3)');
  },
  async tree(o, desc) {
    await say('', desc);
    if (!hasItem('can')) return;
    if (o.wet) { await say('', 'ดินรอบโคนต้นยังเปียกแดง... มันพอใจแล้ว'); return; }
    if (this.st.pours <= 0) { await say('', 'บัวรดน้ำว่างเปล่า ต้องไปเติมที่ก๊อก'); return; }
    const c = await choose(['รดน้ำต้นนี้', 'ไม่รด'], { prompt: `น้ำในบัว ${this.st.pours}/3` });
    if (c !== 0) return;
    this.st.pours--;
    Sound.pour();
    const ORDER = ['tA', 'tB', 'tC'];
    if (o.id === ORDER[this.st.seq]) {
      o.wet = true; this.st.seq++;
      await wait(500);
      Sound.breath();
      await say('', ['แขนบนต้นไม้ค่อยๆ ลดต่ำลง... เหมือนคนที่เลิกโบกมือ', 'นิ้วของกิ่งไม้กำแน่น แล้วคลายออกช้าๆ ราวกับโล่งใจ', 'ดินดำดูดน้ำสีแดงลงไปจนหมดเกลี้ยง เสียงหัวใจใต้ดินหยุดเต้น'][this.st.seq - 1]);
      if (this.st.seq === 3) await this.solved();
    } else {
      o.agit = true; Sound.scream(0.8); shake(10, 700); flash('140,0,0', 0.8);
      hurt(11, 'มือพวกนั้นจำหน้าฉันได้!');
      await say('', 'แขนนับสิบบนต้นไม้ตวัดลงมาตะครุบข้อมือฉัน เล็บจิกลงไปในเนื้อ บัวรดน้ำหลุดมือ น้ำหกเรี่ยราด');
      o.agit = false;
      this.st.pours = 0; this.st.seq = 0;
      G.map.objs.forEach(t => { if (t.draw === 'armTree') t.wet = false; });
      await say('', 'ดินใต้ต้นที่รดไปแล้วแห้งผากในพริบตา... ต้องเริ่มใหม่ทั้งหมด');
    }
  },
  async solved() {
    Sound.rumble(2.5); shake(8, 2000);
    await say('', 'พื้นดินสั่นสะเทือน ดินดำตรงหน้าต้นไม้ต้นสุดท้ายยุบตัวลงเป็นหลุมลึก');
    Sound.heart(0);
    const m = getObj('mound'); m.draw = 'hole';
    setObjective('ตรวจดูหลุม');
  },
  async mound(o) {
    if (o.draw !== 'hole') { await say('', 'กองดินนูนขึ้นมาและยุบลงเป็นจังหวะ... เหมือนหน้าอกของคนที่กำลังหายใจ'); return; }
    if (G.flags.band) { await say('', 'หลุมว่างเปล่า ดินก้นหลุมยังมีรอยนิ้วมือข่วน'); return; }
    G.playerPose = 'kneel';
    Sound.dig();
    await say('', 'ฉันคุกเข่าลง ขุดด้วยมือเปล่า... ดินอุ่นเหมือนผิวหนังคน');
    Sound.dig(); await wait(600);
    await say('', 'ปลายนิ้วสัมผัสกับพลาสติกแข็งๆ... ป้ายข้อมือโรงพยาบาล');
    await readNote('ป้ายข้อมือโรงพยาบาล', `ผู้ป่วย: <b>ไม่ทราบชื่อ (หญิง)</b>
อายุโดยประมาณ: 25–30 ปี
นำส่งโดย: กู้ภัย — อุบัติเหตุรถยนต์พลิกคว่ำ ถนนสายเก่า กม. 14

<span class="blood">สถานะ: เสียชีวิตในที่เกิดเหตุ</span>`);
    G.playerPose = null;
    addItem('band', 'ป้ายข้อมือโรงพยาบาล', '"ผู้ป่วยไม่ทราบชื่อ (หญิง) — เสียชีวิตในที่เกิดเหตุ"');
    G.flags.band = true;
    await thought('ไม่ทราบชื่อ...? ฉันรู้ชื่อเธอ... ฉันรู้ ทำไมฉันพูดออกมาไม่ได้');
    revealRule(4);
    setObjective('กลับเข้าบ้าน (ประตูหลังบ้าน)');
  },
  async backDoor() {
    if (!G.flags.band) { await say('', 'ยังกลับเข้าไปไม่ได้... งานตอนตีสามยังไม่เสร็จ'); return; }
    Sound.door(); Sound.heart(0);
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 7 — Wiping the Flesh (mop the trail, crawler)
   ========================================================= */
const TRAIL = [[2, 3], [3, 3], [4, 3], [5, 3], [5, 4], [5, 5], [6, 5], [7, 5], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3], [11, 3], [11, 4], [11, 5], [11, 6], [11, 7], [10, 7], [9, 7], [8, 7], [8, 8], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [13, 9], [14, 9]];
const MOP_CAP = 7;
const CH7 = {
  num: 'บทที่ ๗', title: 'รอยที่เช็ดไม่ออก', en: 'Wiping the Flesh', when: 'วันที่ 6 · 09:00',
  start() {
    setChapterLabel(`บทที่ 7 — ${this.title}`);
    setClock('09:00');
    Sound.ambient('storage');
    this.st = { clean: new Set(), load: 0, crawl: null, crawlT: 0, stun: 0, fullWarn: 0, done: false };
    loadMap(this.map(), 14, 2, 'down');
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      await say('', 'ห้องเก็บของใต้บันได พื้นปูนมีคราบดำหนืดเป็นทางยาว เหยียบแล้วรองเท้าติดหนึบ');
      if (EASY()) await thought('กฎข้อ 1 — ดูแลทำความสะอาดบ้านให้เรียบร้อย');
      setObjective(ez('หาไม้ม็อบ แล้วเช็ดคราบให้หมด', 'สำรวจห้องเก็บของ'));
    });
  },
  key: (x, y) => x + ',' + y,
  isTrail(x, y) { return TRAIL.some(([a, b]) => a === x && b === y); },
  map() {
    const self = this;
    const g = boxWalls(mkGrid(18, 12, '.'), 2);
    g[1][2] = 'M'; g[1][14] = 'Z'; g[11][15] = 'X';
    g[2][16] = 'B'; g[10][16] = 'R';
    g[2][7] = 'O'; g[6][2] = 'O'; g[5][14] = 'O'; g[8][4] = 'O'; g[4][16] = 'P';
    return {
      name: 'storage', floor: 'concrete', seed: 77, wetFloor: true,
      wall: { face: '#2e2c2a', stripe: '#292725', base: '#141312', top: '#060606' },
      grid: gstr(g), dark: 0.74, playerLight: 110,
      legend: {
        M: { id: 'mop', draw: 'mop', layer: 'wall', on: async o => self.takeMop(o) },
        B: { id: 'bucket', draw: 'bucket', on: async o => self.bucket(o) },
        R: { id: 'drain', draw: 'drain', layer: 'floor', mem: 7, on: async () => self.drain() },
        O: () => ({ draw: 'boxes', on: async () => { await say('', 'ลังกระดาษเก่า ข้างในมีอะไหล่รถยนต์ — ไฟเลี้ยว กันชน ล้อแม็กบิดเบี้ยว'); } }),
        P: { draw: 'shelf', on: async () => { await say('', 'ชั้นวางน้ำยาทำความสะอาดเป็นสิบขวด ทุกขวดใช้จนหมดเกลี้ยง'); } },
        Z: { id: 'in', draw: 'door', layer: 'wall', color: '#1d1a16', on: async () => { await say('', 'ประตูกลับไปที่สวน... ถูกล็อกจากอีกฝั่ง'); } },
        X: { id: 'exit', draw: 'doorBottom', layer: 'wall', color: '#1a1714', on: async () => self.exit() },
      },
      drawFloor(c, t) {
        TRAIL.forEach(([x, y], i) => {
          const X = x * TILE, Y = y * TILE;
          if (self.st.clean.has(self.key(x, y))) {
            // revealed road segment
            c.fillStyle = 'rgba(70,70,74,.85)'; c.fillRect(X + 4, Y + 4, 24, 24);
            const nb = [TRAIL[i - 1], TRAIL[i + 1]].filter(Boolean);
            c.fillStyle = 'rgba(70,70,74,.85)';
            nb.forEach(([nx, ny]) => { c.fillRect(X + 4 + (nx - x) * 14, Y + 4 + (ny - y) * 14, 24, 24); });
            c.fillStyle = 'rgba(230,220,180,.75)';
            nb.forEach(([nx, ny]) => { const dx = nx - x, dy = ny - y; if (dx) c.fillRect(X + 16 + (dx > 0 ? 2 : -10), Y + 15, 8, 2); else c.fillRect(X + 15, Y + 16 + (dy > 0 ? 2 : -10), 2, 8); });
            c.strokeStyle = 'rgba(200,190,170,.25)'; c.strokeRect(X + 3.5, Y + 3.5, 25, 25);
          } else {
            const red = G.flags.mop;
            c.fillStyle = red ? 'rgba(110,4,6,.9)' : 'rgba(8,6,6,.92)';
            c.beginPath(); c.ellipse(X + 16, Y + 16, 13, 11, (x * 3 + y) % 3, 0, 7); c.fill();
            if (red) { c.fillStyle = 'rgba(60,0,0,.9)'; const nx = (TRAIL[i + 1] || TRAIL[i])[0] - x, ny = (TRAIL[i + 1] || TRAIL[i])[1] - y; c.fillRect(X + 14 + nx * 10, Y + 14 + ny * 10, 4, 4); for (let k = 0; k < 3; k++) c.fillRect(X + 8 + k * 6, Y + 10 + ((k * 5) % 12), 2, 9); }
            else { c.fillStyle = 'rgba(40,30,30,.6)'; c.fillRect(X + 10, Y + 12, 4, 2); }
          }
        });
      },
      onStep(x, y) { self.step(x, y); },
      update(dt) { self.update(dt); },
    };
  },
  async takeMop(o) {
    if (G.flags.mop) { await say('', 'ที่แขวนว่างเปล่า'); return; }
    await say('', 'ไม้ม็อบแขวนอยู่บนผนัง ผ้าม็อบแข็งกรังเป็นแท่ง');
    addItem('mop', 'ไม้ม็อบ', `เช็ดได้ ${MOP_CAP} ช่อง จากนั้นต้องไปบิดที่ถัง`);
    G.flags.mop = true; o.hidden = true;
    Sound.stinger(); G.fx.red = 0.25; setTimeout(() => G.fx.red = 0, 600);
    await say('', 'ทันทีที่จับด้ามม็อบ คราบดำบนพื้นก็ค่อยๆ เปลี่ยนสี... กลายเป็นรอยเลือดสด เป็นทางยาวเหมือนมีใครถูกลากไปตามพื้น');
    if (EASY()) await thought('ต้องเดินเช็ดไปตามรอยเลือด ให้หมดทุกช่อง');
    setObjective(`เช็ดรอยเลือดให้หมด (0/${TRAIL.length}) — ม็อบเต็มแล้วให้ไปบิดที่ถัง`);
  },
  step(x, y) {
    const st = this.st;
    if (!G.flags.mop || st.done || !this.isTrail(x, y) || st.clean.has(this.key(x, y))) return;
    if (st.load >= MOP_CAP) {
      if (G.t > st.fullWarn) { st.fullWarn = G.t + 3; subtitle('ม็อบชุ่มเลือดจนหนักอึ้ง... ต้องไปบิดที่ถังก่อน', 2400); Sound.squish(); }
      return;
    }
    st.clean.add(this.key(x, y)); st.load++;
    Sound.squish();
    setObjective(`เช็ดรอยเลือดให้หมด (${st.clean.size}/${TRAIL.length}) — ม็อบ ${st.load}/${MOP_CAP}`);
    if (!st.crawl) this.spawnCrawler();
    if (st.clean.size === 10 && !G.flags.c7a) { G.flags.c7a = 1; subtitle('รอยที่เช็ดออก... เผยให้เห็นเส้นถนนอยู่ข้างใต้', 3000); }
    if (st.clean.size === TRAIL.length) run(() => this.finish());
  },
  spawnCrawler() {
    const st = this.st;
    st.crawl = { x: 16, y: 10, draw: 'crawler', dir: 'left', alpha: 0 };
    G.map.ents.push(st.crawl);
    st.crawlT = 2.4;
    Sound.gurgle(); Sound.stinger();
    subtitle('มีบางอย่างคลานออกมาจากท่อระบาย...', 2800, 'loud');
  },
  update(dt) {
    const st = this.st, c = st.crawl, p = G.player;
    if (!c || st.done || !p) return;
    if (c.alpha < 1) c.alpha = Math.min(1, c.alpha + dt * 0.8);
    if (G.busy || Input.layers.length) return;
    if (st.stun > 0) { st.stun -= dt; return; }
    st.crawlT -= dt;
    const speed = 0.82 - st.clean.size / TRAIL.length * 0.35;
    if (st.crawlT <= 0) {
      st.crawlT = speed;
      const nx = bfsStep(Math.round(c.x), Math.round(c.y), p.x, p.y, walkablePlain);
      if (nx) { c.dir = nx[0] < c.x ? 'left' : 'right'; moveEnt(c, nx[0], nx[1], speed * 900); if (Math.random() < 0.3) Sound.squish(); }
    }
    if (Math.abs(c.x - p.fx) < 0.55 && Math.abs(c.y - p.fy) < 0.55) {
      hurt(14, 'มันคว้าข้อเท้า!');
      Sound.scream(0.7);
      st.stun = 2.2; c.x = 16; c.y = 10; c.alpha = 0;
    }
  },
  async bucket(o) {
    if (!G.flags.mop) { await say('', 'ถังน้ำสังกะสี มีน้ำใสอยู่ครึ่งถัง'); return; }
    if (this.st.load === 0) { await say('', 'ม็อบยังไม่เปื้อน'); return; }
    Sound.splash();
    this.st.load = 0; o.full = true;
    toast('บิดม็อบแล้ว');
    setObjective(`เช็ดรอยเลือดให้หมด (${this.st.clean.size}/${TRAIL.length}) — ม็อบ 0/${MOP_CAP}`);
    if (!G.flags.bucketTxt) { G.flags.bucketTxt = 1; await say('', 'ฉันบิดม็อบลงถัง น้ำใสกลายเป็นสีแดงข้นในพริบตา มีเส้นผมลอยขึ้นมาเป็นกระจุก'); }
  },
  async finish() {
    const st = this.st; st.done = true;
    if (st.crawl) { Sound.scream(1.2); shake(8, 700); for (let i = 0; i < 10; i++) { st.crawl.alpha = 1 - i / 10; await wait(60); } G.map.ents = G.map.ents.filter(e => e !== st.crawl); }
    await say('', 'สิ่งที่คลานตามฉันมาไหลกลับลงท่อระบาย พร้อมเสียงครางยาว');
    await say('', 'รอยเลือดหายไปหมดแล้ว... เหลือแต่ลายเส้นบนพื้นปูน มันคือแผนที่ถนน');
    await showHTML(`<div class="panel pz-center"><h2>แผนที่บนพื้นปูน</h2>
      <svg viewBox="0 0 200 130" style="width:calc(var(--u)*320);height:calc(var(--u)*208)">
        <rect width="200" height="130" fill="#2a2a2c"/>
        <path d="M10 20 H45 V45 H75 V20 H110 V75 H75 V100 H185" stroke="#666" stroke-width="10" fill="none"/>
        <path d="M10 20 H45 V45 H75 V20 H110 V75 H75 V100 H185" stroke="#e6dcb4" stroke-width="1.2" stroke-dasharray="4 4" fill="none"/>
        <circle cx="110" cy="75" r="7" fill="none" stroke="#c22" stroke-width="2"/>
        <text x="122" y="70" fill="#d55" font-size="8">โค้งที่สาม · 14:17</text>
        <path d="M150 100 L185 100 M178 94 L186 100 L178 106" stroke="#c22" stroke-width="2" fill="none"/>
        <text x="120" y="120" fill="#cbb" font-size="8">→ ประตูหน้าบ้าน</text>
      </svg><div class="hint">แตะหรือกด E เพื่อปิด</div></div>`);
    await thought('ถนนสายเก่า โค้งที่สาม... ทุกเส้นชี้ไปที่ประตูหน้าบ้าน');
    revealRule(1);
    G.flags.storageDone = true;
    Sound.unlock();
    setObjective('ออกไปที่โถงหน้าบ้าน');
  },
  async drain() {
    if (!this.st.done) { await say('', 'ท่อระบายน้ำ มีเสียงหายใจครืดคราดดังขึ้นมาจากข้างใต้'); if (this.st.crawl) return; await say('', 'ฉันไม่กล้าล้วงมือลงไปตอนนี้'); return; }
    await memory(7);
  },
  async exit() {
    if (!G.flags.storageDone) { await lockedDoor('ประตูไม่ยอมเปิด มีกระดาษติดว่า "บ้านยังไม่สะอาด"'); return; }
    Sound.door();
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 8 — The Hallucination of Mercy (door)
   ========================================================= */
const CH8 = {
  num: 'บทที่ ๘', title: 'เสียงเรียกหลังเที่ยงคืน', en: 'The Hallucination of Mercy', when: 'คืนที่ 6 · 00:30',
  start() {
    setChapterLabel(`บทที่ 8 — ${this.title}`);
    setClock('00:30');
    Sound.ambient('foyer_night');
    this.bangT = 2; this.asked = {}; this.ended = false;
    loadMap(this.map(), 5, 2, 'down');
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      Sound.bang(); shake(6, 300);
      await say('', 'ตูม! ตูม! ตูม! เสียงทุบประตูหน้าบ้านดังสนั่นจนฝุ่นร่วงจากเพดาน');
      await say('เสียงจากนอกบ้าน', 'ปฐพี! ปฐพีเปิดประตู! นายต้องออกมาจากที่นั่นเดี๋ยวนี้!');
      await thought('เสียงนั่น... ภูมิ เพื่อนสนิทฉัน');
      if (EASY()) await thought('แต่กฎข้อ 8 — ห้ามออกจากบ้านหลังเที่ยงคืน ไม่ว่าใครจะเรียก');
      setObjective('ตัดสินใจเรื่องประตูหน้าบ้าน');
    });
  },
  map() {
    const self = this;
    return {
      name: 'foyer8', floor: 'wood', floor2: 'carpet', seed: 11, wall: FOYER_WALL,
      grid: FOYER_GRID, dark: 0.78, playerLight: 100,
      legend: {
        C: { id: 'clock', draw: 'wallclock', layer: 'wall', ang: Math.PI, on: async () => { await say('', 'นาฬิกาบอกเวลา 00:30 ...เข็มสั่นระริกไปตามเสียงทุบประตู'); } },
        I: { id: 'inner', draw: 'door', layer: 'wall', open: true, bolt: true, on: async () => { await say('', 'ประตูกลับเข้าบ้าน... มันล็อกอยู่ เหมือนบ้านไม่อยากให้ฉันหนีจากเรื่องนี้'); } },
        K: { id: 'coat', draw: 'coat', mem: 8, on: async () => { await say('', 'โค้ทสีเทาตัวเดิม ไหล่ยังเปียก'); await memory(8); } },
        U: { id: 'umb', draw: 'umbrella', on: async () => { await say('', 'ที่ใส่ร่ม ร่มสีเหลืองหายไปแล้ว เหลือแต่น้ำนองที่ก้น'); } },
        S: { id: 'shoes', draw: 'shoeRack', taken: true, on: async () => { await say('', 'ชั้นวางรองเท้าว่างเปล่า'); } },
        F: { id: 'front', draw: 'doorBottom', layer: 'wall', chainLock: true, fingers: true, on: async () => self.door() },
      },
      update(dt) {
        if (self.ended) return;
        self.bangT -= dt;
        if (self.bangT <= 0) {
          self.bangT = 1.3 + Math.random() * 1.4;
          Sound.bang(); shake(3, 180);
          if (G.busy === 0 && Math.random() < 0.4) subtitle(['เปิดสิ ปฐพี!', 'ตำรวจกำลังมา! เร็วเข้า!', 'ฉันเอง ภูมิไง!', 'ได้ยินฉันมั้ย!?'][Math.floor(Math.random() * 4)], 1800, 'loud');
        }
      },
    };
  },
  async chainEvent() {
    Sound.chain(); shake(5, 400);
    const ok = await qtePress('โซ่คล้องประตูกำลังหลุด! กด [E] ดันไว้!', 1900);
    if (ok) { Sound.knock(); await say('', 'ฉันดันประตูปิดไว้ได้ทัน โซ่กลับเข้าที่'); }
    else {
      Sound.scream(0.6); flash('0,0,0', 0.9); shake(10, 600);
      hurt(12, 'มือสีดำลอดช่องประตูเข้ามา!');
      await say('', 'ประตูแง้มออกเพียงคืบเดียว แขนสีดำยาวผิดรูปลอดเข้ามาข่วนหน้าฉัน... ก่อนจะถูกดึงกลับออกไป');
    }
  },
  async door() {
    while (!this.ended) {
      if (Math.random() < 0.38) await this.chainEvent();
      const opts = [];
      if (!this.asked.who) opts.push(['who', 'ภูมิ...? นั่นนายจริงๆ เหรอ']);
      if (!this.asked.what) opts.push(['what', 'เกิดอะไรขึ้นข้างนอก']);
      if (!this.asked.wound) opts.push(['wound', 'ถ้านายเห็นฉันจริง... ฉันเจ็บตรงไหน']);
      opts.push(['open', 'เปิดประตู']);
      opts.push(['stay', 'ไม่เปิด — ถอยห่างจากประตู']);
      opts.push(['leave', '(ปล่อยไว้ก่อน)']);
      const c = await choose(opts.map(o => ({ text: o[1], danger: o[0] === 'open' })), { prompt: 'ประตูหน้าบ้านสั่นตามแรงทุบ' });
      const k = opts[c] ? opts[c][0] : 'leave';
      if (k === 'leave') return;
      if (k === 'who') {
        this.asked.who = 1;
        await say('เสียงจากนอกบ้าน', 'ใช่! ฉันเอง ภูมิ! เพื่อนนายตั้งแต่ ม.1 ไง เร็วเข้า!');
        await thought('เสียงเหมือนภูมิทุกอย่าง... แต่ภูมิไม่เคยเรียกฉันว่า "ปฐพี" เต็มๆ แบบนี้');
      } else if (k === 'what') {
        this.asked.what = 1;
        await say('เสียงจากนอกบ้าน', 'นายไม่รู้เหรอ!? มีคนแจ้งตำรวจ เขากำลังมาจับนาย! เรื่องมิ้น... เรื่องวันนั้น!');
        await say('เสียงจากนอกบ้าน', 'หนีไปกับฉันเถอะ! ไม่มีใครต้องรู้ ไม่มีใครต้องจำ!');
      } else if (k === 'wound') {
        this.asked.wound = 1;
        await say('เสียงจากนอกบ้าน', 'หัวนายไง! ข้างซ้าย! นายโดนกระแทกข้างซ้ายจนเลือดท่วม ฉันเห็นกับตา! เปิดเร็ว ฉันจะพาไปหาหมอ!');
        if (G.flags.sawWound) {
          G.fx.glitch = 0.5; Sound.glitch();
          await thought('ข้างซ้าย...?');
          await thought('เงาในกระจกบอกว่าข้างขวา... หน้าต่างฝั่งคนขับแตกใส่หัวข้างขวา');
          await thought('คนที่อยู่หลังประตูนั่น... ไม่ใช่ภูมิ มันไม่เคยเห็นฉันเลย');
        } else {
          await thought('ข้างซ้าย... จริงเหรอ ทำไมฉันรู้สึกเหมือนแผลมันอยู่อีกข้าง');
        }
      } else if (k === 'open') {
        const sure = await choose([{ text: 'เปิดเลย', danger: true }, 'เดี๋ยวก่อน'], { prompt: ez('เปิดประตูหน้าบ้านหลังเที่ยงคืน? (ละเมิดกฎข้อ 8)', 'เปิดประตูหน้าบ้าน?') });
        if (sure !== 0) continue;
        this.ended = true;
        await this.opened();
        return;
      } else if (k === 'stay') {
        this.ended = true;
        await this.stayed();
        return;
      }
    }
  },
  async opened() {
    Sound.chain(); await wait(300); Sound.door();
    await say('', 'ฉันปลดโซ่ บิดลูกบิด...');
    await say('', 'ข้างนอกไม่มีใคร ไม่มีภูมิ ไม่มีตำรวจ ไม่มีถนน มีแต่ความมืดที่หายใจได้');
    Sound.stinger(); Sound.scream(1.6); shake(18, 1500); G.fx.glitch = 1.5; G.fx.red = 0.7;
    await say('???', 'ขอบใจที่เปิดให้นะ ปฐพี', { speed: 50 });
    flash('0,0,0', 1);
    G.fx.red = 0;
    window.gameOver('เงามืดฉีกร่างของปฐพีออกเป็นชิ้นๆ... ไม่เคยมีใครอยู่หลังประตูบานนั้น มีแค่ความหิวโหยที่เลียนเสียงคนที่เขาไว้ใจ', 'เพื่อนที่ไม่มีอยู่จริง');
  },
  async stayed() {
    const p = G.player;
    await say('ปฐพี', '...');
    await say('', 'ฉันถอยห่างจากประตู กลั้นหายใจ ไม่ตอบอะไรอีก');
    await wait(1200);
    await say('เสียงจากนอกบ้าน', 'ปฐพี...? ทำไมไม่เปิด... เราเพื่อนกันนะ...');
    await wait(800);
    Sound.glitch();
    await say('เสียงจากนอกบ้าน', 'ปะ...ฐะ...พี... ปะ.ฐะ.พี. ปะฐะพีปะฐะพีปะฐะพี', { speed: 40 });
    Sound.laugh(); setTimeout(() => Sound.laugh(), 1300);
    shake(6, 2400); G.fx.glitch = 1;
    await say('', 'เสียงเพื่อนบิดเบี้ยวกลายเป็นเสียงหัวเราะแหลมสูง... เหมือนสิ่งที่ไม่เคยรู้ว่าการหัวเราะคืออะไร แค่เลียนเสียงมันมา');
    await wait(900);
    await say('', '...แล้วทุกอย่างก็เงียบลง');
    await wait(1200);
    Sound.chain(); await wait(300); Sound.bang(); shake(10, 600);
    await say('', 'แกร๊ง!! เสียงโซ่ขาดดังมาจากห้องใต้ดิน');
    revealRule(8);
    await thought(ez('ห้องใต้ดิน... กฎข้อ 9', 'ห้องใต้ดิน...'));
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 9 — The Carcass of Steel (envelope, maze, shadow)
   ========================================================= */
const BASEMENT = [
  '########################',
  '#U.....#.......#.......#',
  '#.###..#.#####.#.#####.#',
  '#...#....#...#...#...#.#',
  '###.#.####.#.#####.#.#.#',
  '#...#.#....#.....#.#.#.#',
  '#.###.#.########.#.#...#',
  '#.....#.#......#.#.###.#',
  '#####.#.#.####.#.#...#.#',
  '#.....#...#....#.###.#.#',
  '#.#########.####.#.....#',
  '#.#.........#..........#',
  '#.#.#######.#..........#',
  '#...#.......#..........#',
  '#####.#######..........#',
  '########################',
];
const CH9 = {
  num: 'บทที่ ๙', title: 'สิ่งที่รออยู่ข้างล่าง', en: 'The Carcass of Steel', when: 'คืนที่ 7 · 03:33',
  start() {
    setChapterLabel(`บทที่ 9 — ${this.title}`);
    setClock('03:33');
    Sound.ambient('basement');
    loadMap(this.hall(), 12, 4, 'left');
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1500);
      await say('', 'คืนที่เจ็ด ฉันลงมาถึงทางเดินหน้าห้องใต้ดิน โซ่ที่เคยล่ามประตูไว้ขาดสะบั้นกองอยู่บนพื้น');
      await say('', 'กลิ่นน้ำมันเบนซินและเนื้อไหม้โชยขึ้นมาจากช่องประตู');
      setObjective('สำรวจทางเดินหน้าห้องใต้ดิน');
    });
  },
  hall() {
    const self = this;
    return {
      name: 'hall', floor: 'wood', seed: 91, wall: { face: '#2a221f', stripe: '#251d1a', base: '#120d0b', top: '#060404' },
      grid: [
        '##############',
        '########B#####',
        '#......C.....#',
        '#........E...#',
        '#U...........#',
        '#............#',
        '##############',
      ],
      dark: 0.82, playerLight: 100,
      legend: {
        B: { id: 'bdoor', draw: 'basementDoor', layer: 'wall', light: { r: 30, color: '255,80,20', ga: 0.12, flicker: true }, on: async o => self.bdoor(o) },
        C: { id: 'chains', draw: 'chainPile', solid: false, layer: 'floor', on: async () => { Sound.chain(); await say('', 'โซ่เหล็กเส้นหนาขาดกระจุย ปลายที่ขาดไม่ได้ถูกตัด... มันถูกดึงจนขาดจากข้างใน'); } },
        E: { id: 'env', draw: 'envelope', solid: false, layer: 'floor', on: async o => self.envelope(o) },
        U: { id: 'up', draw: 'stairsUp', on: async () => self.goUp() },
      },
    };
  },
  async envelope(o) {
    if (G.flags.envOpen) return;
    await say('', 'ซองจดหมายสีน้ำตาลวางอยู่บนพื้น ไม่มีชื่อผู้ส่ง ไม่มีชื่อผู้รับ มีของแข็งๆ อยู่ข้างใน');
    if (EASY()) await thought('กฎข้อ 7 — อย่าเปิดซองจดหมายที่ไม่มีชื่อผู้รับ');
    const c = await choose([{ text: ez('เปิดซอง (ละเมิดกฎข้อ 7)', 'เปิดซอง'), danger: true }, 'ปล่อยไว้']);
    if (c !== 0) { await thought('ถ้าไม่เปิด... ฉันก็ไม่ต้องรู้'); return; }
    G.flags.envOpen = true; G.broken[7] = true; o.hidden = true;
    Sound.stinger(); G.fx.glitch = 0.8;
    await say('', 'ฉันฉีกซองออก... สิ่งแรกที่หล่นลงบนพื้นคือกุญแจรถยนต์ที่บิดเบี้ยวผิดรูป');
    addItem('carkey', 'กุญแจรถที่บิดเบี้ยว', 'กุญแจรถของฉัน... ห้อยตุ๊กตาหมีตัวเล็กที่มิ้นให้');
    await say('', 'ตามด้วยกระดาษพับครึ่งอีกแผ่นหนึ่ง');
    hurt(6);
    await readNote('รายงานการชันสูตรพลิกศพ (ฉบับย่อ)', `ผู้ตาย: <b>หญิง อายุ 26 ปี</b> — <span class="blood">ชื่อ: มิ้น ██████</span>
สถานที่: ถนนสายเก่า กม. 14 โค้งที่สาม
เวลาเกิดเหตุ: <b>14:17 น.</b>

สาเหตุการเสียชีวิต: ถูกโครงหลังคารถยุบทับบริเวณทรวงอก
ขาดอากาศหายใจ ร่วมกับเสียเลือด

เวลาเสียชีวิตโดยประมาณ: <b>14:31 น.</b>
<span class="blood">(ผู้ตายยังมีชีวิตอยู่ภายหลังเกิดเหตุประมาณ 14 นาที)</span>

หมายเหตุ: ผู้ขับขี่ (ชาย) ติดอยู่ในซากรถ บาดเจ็บสาหัสที่ศีรษะด้านขวา
อยู่ในภาวะโคม่า — ส่งตัวโรงพยาบาล`);
    await thought('สิบสี่นาที... เธอยังมีชีวิตอยู่อีกสิบสี่นาที');
    await thought('สิบสี่สายที่ไม่ได้รับ...');
    revealRule(7);
    await this.lawyerOffer();
  },
  async lawyerOffer() {
    const law = { id: 'lawyer', x: 3, y: 4, draw: 'lawyer', dir: 'right', alpha: 0, solid: true, case: true };
    G.map.ents.push(law);
    for (let i = 0; i <= 15; i++) { law.alpha = i / 15; await wait(50); }
    await talk([
      ['ทนาย', 'เปิดจนได้นะครับ คุณปฐพี'],
      ['ทนาย', 'แต่ยังไม่สายเกินไป คืนนี้เป็นคืนสุดท้าย ขึ้นไปข้างบน นอนหลับให้ครบเจ็ดวัน'],
      ['ทนาย', 'แล้วทุกอย่างจะเป็นของท่าน บ้าน เงินสามล้าน... และการไม่ต้องจำอะไรอีกเลยตลอดไป'],
      ['ทนาย', 'หรือท่านจะลงไปข้างล่าง... ที่ที่ไม่มีอะไรรออยู่ นอกจากความจริง'],
    ]);
    setObjective('เลือก: ขึ้นบันไดไปข้างบน หรือ ลงไปห้องใต้ดิน');
  },
  async goUp() {
    if (!G.flags.envOpen) { await say('', 'บันไดขึ้นไปชั้นบน ห้องนอนอุ่นๆ รออยู่ข้างบน... แต่ตอนนี้ฉันยังไม่อยากขึ้นไป'); return; }
    const c = await choose([{ text: 'ขึ้นไปข้างบน — นอนให้ครบเจ็ดวัน', danger: true }, 'ยังก่อน'], { prompt: 'ถ้าเลือกทางนี้ จะย้อนกลับไม่ได้อีก' });
    if (c !== 0) return;
    await say('', 'ฉันหันหลังให้ประตูห้องใต้ดิน... แล้วก้าวขึ้นบันไดทีละขั้น');
    await say('ทนาย', 'ฉลาดมากครับ', { cls: 'lawyer' });
    await fade(1, 1500);
    startEnding('denial');
  },
  async bdoor(o) {
    if (!G.flags.envOpen) {
      await say('', 'ประตูห้องใต้ดินแง้มอยู่ แต่ยังมีแม่กุญแจรูปร่างประหลาดล็อกไว้ — รูกุญแจเป็นรูปกุญแจรถยนต์');
      if (EASY()) await thought('กฎข้อ 9 — ห้ามลงไปที่ห้องใต้ดินเด็ดขาด');
      return;
    }
    await say('', 'ฉันเสียบกุญแจรถที่บิดเบี้ยวลงในแม่กุญแจ... มันหมุนได้ เหมือนสตาร์ทรถ');
    Sound.engine(); await wait(600); Sound.unlock();
    const c = await choose([{ text: ez('ลงไปในความมืด (ละเมิดกฎข้อ 9)', 'ลงไปในความมืด'), danger: true }, 'ยังก่อน']);
    if (c !== 0) return;
    G.broken[9] = true;
    Sound.door();
    await fade(1, 1200);
    loadMap(this.basement(), 1, 2, 'down');
    G.map.ents.length = 0;
    this.sh = { e: null, t: 0, active: false, caught: 0, talk: 0 };
    await wait(300);
    await fade(0, 1400);
    await say('', 'บันไดพาฉันลงมาสู่ความมืดที่หนาจนแทบจับต้องได้ เสียงน้ำหยด... เสียงเหล็กครูดกันอยู่ไกลๆ');
    Sound.whisper();
    await say('มิ้น', '...ปฐพี... ทางนี้...', { cls: 'mint' });
    await thought('รอยเท้าเปื้อนเลือดเรืองแสงจางๆ บนพื้น... เดินตามมันไป');
    setObjective('ตามเสียงมิ้นไปในความมืด — อย่าให้ "มัน" ตามทัน');
  },
  basement() {
    const self = this;
    const legend = {
      U: { id: 'up', draw: 'stairsUp', on: async () => self.basementUp() },
      Q: { id: 'car', draw: 'carWreck', w: 3, h: 2, light: { r: 90, color: '255,240,190', ga: 0.25, flicker: true }, on: async o => CH10.car(o) },
    };
    const grid = BASEMENT.map(r => r);
    grid[11] = grid[11].substring(0, 17) + 'Q' + grid[11].substring(18);
    return {
      name: 'basement', floor: 'concrete', seed: 99, wall: { face: '#1c1b1a', stripe: '#191817', base: '#0b0a0a', top: '#030303' },
      grid, dark: 0.97, playerLight: 78, legend,
      onLoad(m) {
        // solution path for glowing footprints
        const path = []; let cur = [1, 2]; const goal = [16, 11];
        const pass = (x, y) => { const t = m.tiles[y] && m.tiles[y][x]; return t && t !== '#' && t !== ' ' && !(x >= 17 && x <= 19 && y >= 11 && y <= 12); };
        for (let i = 0; i < 200; i++) { const n = bfsStep(cur[0], cur[1], goal[0], goal[1], pass, 2000); if (!n) break; path.push(n); cur = n; if (n[0] === goal[0] && n[1] === goal[1]) break; }
        m.trail = path;
      },
      drawFloor(c, t) {
        const p = G.player; if (!p || !G.map.trail) return;
        G.map.trail.forEach(([x, y], i) => {
          const d = dist(x, y, p.fx, p.fy); if (d > 4.5) return;
          const a = (1 - d / 4.5) * 0.55;
          c.fillStyle = `rgba(160,10,10,${a})`;
          const off = i % 2 ? 5 : -5;
          c.fillRect(x * TILE + 13 + off, y * TILE + 12, 4, 7); c.fillRect(x * TILE + 13 + off, y * TILE + 9, 3, 2);
        });
      },
      update(dt) { self.updateShadow(dt); },
      lights: () => [],
    };
  },
  updateShadow(dt) {
    const s = this.sh, p = G.player; if (!s || !p || G.flags.reachedCar) return;
    if (p.x >= 13 && p.y >= 10 && !G.flags.reachedCar) { G.flags.reachedCar = true; run(() => this.reachCar()); return; }
    if (!s.active) {
      if (dist(p.x, p.y, 1, 2) > 5 && G.busy === 0) {
        s.active = true;
        s.e = { x: 1, y: 1, draw: 'shadowSelf', alpha: 0 }; G.map.ents.push(s.e); s.t = 1.5;
        Sound.stinger(); subtitle('มีบางอย่างลงบันไดตามมา...', 2500, 'loud');
        Sound.heart(96, 0.35);
      }
      return;
    }
    const e = s.e;
    if (e.alpha < 1) e.alpha = Math.min(1, e.alpha + dt);
    if (G.busy || Input.layers.length) return;
    s.t -= dt; s.talk -= dt;
    const d = dist(e.x, e.y, p.fx, p.fy);
    Sound.setHeartVol(clamp(0.9 - d * 0.06, 0.15, 0.9));
    if (s.t <= 0) {
      s.t = 0.43;
      const n = bfsStep(Math.round(e.x), Math.round(e.y), p.x, p.y, walkablePlain, 1500);
      if (n) moveEnt(e, n[0], n[1], 380);
    }
    if (s.talk <= 0 && d < 7) {
      s.talk = 6;
      const L = ['ขึ้นไปเถอะ... ข้างบนอุ่นกว่า', 'เธอไม่ได้ฆ่าใคร มันเป็นอุบัติเหตุ', 'ลืมเธอซะ แล้วเราจะได้เงินสามล้าน', 'ถ้าเห็นมันแล้ว เธอจะลืมตาไม่ขึ้นอีกเลย', 'หยุดเดินสิ ปฐพี... หยุด'];
      subtitle(L[Math.floor(Math.random() * L.length)], 2600, 'loud'); Sound.whisper();
    }
    if (Math.abs(e.x - p.fx) < 0.6 && Math.abs(e.y - p.fy) < 0.6) {
      s.caught++;
      run(async () => {
        Sound.scream(1); hurt(16, 'มันรัดตัวฉันไว้แน่น...'); G.fx.glitch = 1;
        await say('เงาของปฐพี', s.caught > 1 ? 'กลับขึ้นไป... ทำไมไม่ยอมเข้าใจ' : 'จะลงไปทำไม... ข้างล่างนั่นมีแต่ความเจ็บปวด', { cls: 'shadow' });
        await fade(1, 400);
        const pl = G.player; pl.x = pl.tx = 1; pl.y = pl.ty = 2; pl.fx = 1; pl.fy = 2; pl.moving = false; pl.dir = 'down';
        G.map.ents = G.map.ents.filter(x => x !== e); s.active = false; s.e = null;
        await fade(0, 600);
        await say('', 'ฉันกลับมาอยู่ที่ตีนบันไดอีกครั้ง... เสียงมิ้นยังเรียกอยู่ข้างล่าง');
      });
    }
  },
  async basementUp() {
    const c = await choose([{ text: 'กลับขึ้นไปข้างบน — ยอมแพ้', danger: true }, 'เดินต่อไป'], { prompt: 'บันไดกลับขึ้นไปชั้นบน' });
    if (c !== 0) return;
    await say('', 'ฉันหันหลังให้เสียงเรียกนั้น... แล้วปีนขึ้นไปหาแสงสว่างอุ่นๆ ข้างบน');
    await fade(1, 1500);
    Sound.heart(0);
    startEnding('denial');
  },
  async reachCar() {
    const s = this.sh;
    if (s && s.e) { Sound.scream(0.8); for (let i = 0; i < 10; i++) { s.e.alpha = 1 - i / 10; await wait(50); } G.map.ents = G.map.ents.filter(x => x !== s.e); }
    Sound.heart(0);
    await say('', 'เงาที่ไล่ตามมาหยุดอยู่ที่ขอบความมืด... มันไม่กล้าเข้ามาใกล้กว่านี้');
    await nextChapter();
  },
};

/* =========================================================
   CHAPTER 10 — The Judgment
   ========================================================= */
const CH10 = {
  num: 'บทที่ ๑๐', title: 'ครบเจ็ดวัน', en: 'The Judgment', when: 'วันที่ 7 · 14:17',
  start() {
    setChapterLabel(`บทที่ 10 — ${this.title}`);
    setClock('14:17');
    Sound.ambient('basement');
    // rebuild basement and place player in the car room
    loadMap(CH9.basement(), 16, 13, 'up');
    G.flags.reachedCar = true;
    G.map.dark = 0.9; G.map.playerLight = 95;
    run(async () => {
      fadeInstant(1);
      await chapterCard(this.num, this.title, this.en, this.when);
      await fade(0, 1800);
      await say('', 'กลางห้องใต้ดินมีซากรถยนต์พังยับเยินจอดอยู่ ไฟหน้าข้างหนึ่งยังกะพริบ');
      await thought('รถของฉัน...');
      const mint = { id: 'mintGhost', x: 21, y: 12, draw: 'mint', dir: 'left', alpha: 0.6, jitter: true };
      G.map.ents.push(mint);
      setObjective('เข้าไปที่ซากรถ');
    });
  },
  async car(o) {
    if (G.flags.confessed) return;
    await say('', 'ซากเหล็กบิดเป็นเกลียว หลังคายุบลงมาจนเกือบติดเบาะ ป้ายทะเบียนยังอ่านออก... เป็นรถของฉัน');
    await say('', 'ที่เบาะข้างคนขับ... ร่างผอมบางในชุดสีขาว ผมยาวสีดำปรกหน้า มือข้างหนึ่งยื่นออกมานอกหน้าต่าง');
    Sound.breath();
    await say('', 'มิ้น...');
    const pairs = [
      { q: 'ปากฉันขยับเอง...', lie: '"มันเป็นอุบัติเหตุ ถนนมันลื่น"', truth: '"ฉันขับเร็วเกินไป ทั้งที่เธอขอให้ขับช้าๆ"' },
      { q: 'เสียงในหัวกระซิบให้หาข้ออ้าง...', lie: '"ฉันไม่ได้ยินเสียงเธอเลย"', truth: '"ฉันได้ยินเธอเรียก... แต่ฉันกลัวเกินกว่าจะตอบ"' },
      { q: 'คำสุดท้ายติดอยู่ในลำคอ...', lie: '"ฉันไม่ได้ฆ่าเธอ"', truth: '"ฉันเป็นคนขับ... ฉันเป็นคนทำให้เธอตาย"' },
    ];
    for (const pr of pairs) {
      while (true) {
        await say('', pr.q);
        const flip = Math.random() < 0.5;
        const opts = flip ? [pr.truth, pr.lie] : [pr.lie, pr.truth];
        const c = await choose(opts, { prompt: 'สารภาพกับเธอ' });
        const said = opts[Math.max(0, c)];
        await say('ปฐพี', said.replace(/"/g, ''));
        if (said === pr.truth) { Sound.bell(); heal(4); break; }
        Sound.glitch(); Sound.rumble(1); shake(8, 700); G.fx.glitch = 0.8;
        hurt(7);
        await say('', 'โลหะครูดกันเสียงแหลมเหมือนเสียงกรีดร้อง หลังคารถยุบลงไปอีกนิ้วหนึ่ง... ร่างของเธอกระตุก');
        await say('มิ้น', '...อย่าโกหกฉันอีกเลย...', { cls: 'mint' });
      }
    }
    G.flags.confessed = true;
    await say('', 'ฉันคลานเข้าไปในซากรถ เศษกระจกบาดเข่า... แต่ฉันไม่รู้สึกเจ็บอีกแล้ว');
    await qteHold('กด [E] ค้างไว้ — กอดเธอไว้', 3600);
    G.fx.white = 0.35;
    Sound.stopAmbient(3);
    await say('ปฐพี', 'ขอโทษ... ขอโทษนะมิ้น... ขอโทษที่ไม่ตอบ ขอโทษที่ไม่มองถนน');
    await say('ปฐพี', 'ฉันเป็นคนขับรถคันนั้น... และฉันฆ่าเธอ');
    await wait(800);
    await say('มิ้น', '...ในที่สุด เธอก็มองฉันสักที', { cls: 'mint' });
    if (G.memories.length >= 8) {
      await say('มิ้น', 'ฉันให้อภัยเธอตั้งแต่สายแรกแล้วนะ ปฐพี... ฉันแค่อยากให้เธอยอมรับมัน', { cls: 'mint' });
      await say('มิ้น', 'แหวนวงนั้น... ฉันรู้มาตลอดว่ามันอยู่ในกระเป๋าเสื้อเธอ คำตอบของฉันคือ "ตกลง"', { cls: 'mint' });
    }
    Sound.rumble(4); shake(10, 4000);
    await say('', 'บ้านทั้งหลังครางกระหึ่ม ผนังแตกร้าว ความมืดหลุดลอกออกเป็นแผ่นเหมือนสีที่ไหม้ไฟ');
    for (let i = 0; i < 30; i++) { G.fx.white = 0.35 + i / 30 * 0.65; await wait(70); }
    startEnding('true');
  },
};

const CHAPTERS = [null, CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9, CH10];
