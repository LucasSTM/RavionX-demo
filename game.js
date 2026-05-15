/* ============================================================
   PIXEL RPG LEARNING GAME — game.js
   ============================================================ */

/* ============================================================
   1. DATA STRUCTURES
   ============================================================ */

/**
 * Question schema:
 * {
 *   id:      string   — unique identifier
 *   text:    string   — the question prompt
 *   answer:  string   — correct answer (case-insensitive match)
 *   choices: string[] — all answer options (include correct)
 *   diff:    'easy' | 'medium' | 'hard'
 *   dmg:     number   — base damage dealt on correct answer (1 / 2 / 4)
 * }
 */
let currentLang = 'en'; // Mặc định tiếng Việt

const LANG_DB = {
  vi: {
    questMap: "⚔️ BẢN ĐỒ NHIỆM VỤ",
    questSubtitle: "chọn vùng đất — trả lời để chiến đấu",
    btnGear: "🎒 Trang bị",
    btnAddQ: "✏️ Thêm câu hỏi",
    pName: "HỌC GIẢ",
    logStart: "Một quái vật xuất hiện!",
    btnFlee: "✖ Bỏ chạy",
    btnSkip: "BỎ QUA ▶",
    invTitle: "🎒 HÀNH TRANG TRANG BỊ",
    btnBack: "◀ Trở về bản đồ",
    logCorrect: "✓ Chính xác! Gây {dmg} sát thương! +{xp} XP",
    logWrong: "✗ Sai rồi! Bạn bị quái cắn mất {dmg} máu! Đáp án: {ans}",
    logDefeatE: "⚡ Đã tiêu diệt {name}! Nhận {bonus} XP thưởng!",
    logDefeatP: "💀 Bạn đã gục ngã! Hồi sinh với 30% HP."
  },
  en: {
    questMap: "⚔️ QUEST MAP",
    questSubtitle: "choose your zone — answer to fight",
    btnGear: "🎒 Gear",
    btnAddQ: "✏️ Add Questions",
    pName: "SCHOLAR",
    logStart: "A wild monster appears!",
    btnFlee: "✖ Flee",
    btnSkip: "SKIP ▶",
    invTitle: "🎒 EQUIPMENT",
    btnBack: "◀ Back to Map",
    logCorrect: "✓ Correct! Dealt {dmg} damage! +{xp} XP",
    logWrong: "✗ Wrong! Enemy strikes for {dmg} damage! Answer: {ans}",
    logDefeatE: "⚡ {name} defeated! +{bonus} bonus XP!",
    logDefeatP: "💀 You fell! Recovered with 30% HP."
  }
}
function changeLanguage(lang) {
  currentLang = lang;
  
  // Quét toàn bộ HTML có attribute data-t để thay chữ tương ứng
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    if (LANG_DB[lang][key]) {
      el.textContent = LANG_DB[lang][key];
    }
  });

  // Đổi trạng thái hiển thị sáng/tối của 2 nút bấm VN/EN
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes(lang));
  });
}

const QUESTIONS = {
  math: [
    { id: 'm1', text: '7 × 8 bằng bao nhiêu?',                    answer: '56',       choices: ['56','54','64','48'],                           diff: 'easy',   dmg: 1 },
    { id: 'm2', text: '√144 bằng bao nhiêu?',                     answer: '12',       choices: ['12','11','14','16'],                           diff: 'easy',   dmg: 1 },
    { id: 'm3', text: 'Giải phương trình: 3x + 6 = 21',           answer: '5',        choices: ['5','3','7','4'],                               diff: 'medium', dmg: 2 },
    { id: 'm4', text: '15% của 200 bằng bao nhiêu?',              answer: '30',       choices: ['30','25','35','20'],                           diff: 'medium', dmg: 2 },
    { id: 'm5', text: 'Rút gọn biểu thức: (x² + 2x + 1)',          answer: '(x+1)²',   choices: ['(x+1)³','(x+2)²','(x-1)²','x²+1'],           diff: 'hard',   dmg: 4 }, // Đã sửa lựa chọn đầu thành (x+1)² cho giống đáp án
    { id: 'm6', text: 'Đạo hàm của x³ là gì?',                    answer: '3x²',      choices: ['3x²','x²','3x','2x³'],                        diff: 'hard',   dmg: 4 },
  ],
  science: [
    { id: 's1', text: 'Thực vật hấp thụ chất khí nào trong quá trình quang hợp?', answer: 'CO₂',          choices: ['CO₂','O₂','N₂','H₂'],                                     diff: 'medium', dmg: 2 },
    { id: 's2', text: 'Số hiệu nguyên tử của Cacbon là bao nhiêu?',             answer: '6',            choices: ['6','12','8','14'],                                         diff: 'medium', dmg: 2 },
    { id: 's3', text: "Định luật II Newton: F = ?",                          answer: 'ma',           choices: ['ma','mv','m/a','a/m'],                                     diff: 'medium', dmg: 2 },
    { id: 's4', text: 'Tốc độ ánh sáng (xấp xỉ) bằng bao nhiêu?',             answer: '3×10⁸ m/s',   choices: ['3×10⁸ m/s','3×10⁶ m/s','3×10⁴ m/s','1×10⁸ m/s'],       diff: 'hard',   dmg: 4 },
    { id: 's5', text: 'Bào quan nào đảm nhận nhiệm vụ sản sinh ATP?',             answer: 'Mitochondria', choices: ['Mitochondria','Nucleus','Ribosome','Vacuole'],              diff: 'hard',   dmg: 4 },
  ],
  english: [
    { id: 'e1', text: 'Which word is a synonym for "happy"?',                              answer: 'Joyful',          choices: ['Joyful','Sad','Angry','Tired'],                                           diff: 'easy',   dmg: 1 },
    { id: 'e2', text: 'Identify the verb: "The cat runs fast."',                           answer: 'runs',            choices: ['runs','cat','fast','The'],                                                diff: 'easy',   dmg: 1 },
    { id: 'e3', text: 'What literary device is "the wind whispered"?',                     answer: 'Personification', choices: ['Personification','Simile','Metaphor','Alliteration'],                     diff: 'medium', dmg: 2 },
    { id: 'e4', text: 'Choose the correct: "Neither he nor she ___ wrong."',               answer: 'is',              choices: ['is','are','were','been'],                                                 diff: 'medium', dmg: 2 },
    { id: 'e5', text: 'What is the mood of subjunctive in "If I were king"?',              answer: 'Hypothetical',    choices: ['Hypothetical','Indicative','Imperative','Interrogative'],                 diff: 'hard',   dmg: 4 },
  ],
  custom: [],
};

/**
 * Equipment schema:
 * {
 *   id:       string  — unique key
 *   name:     string  — display name
 *   icon:     string  — emoji
 *   bonus:    number  — attack bonus added to calcDamage()
 *   mpBonus:  number  — max MP bonus
 *   req:      number  — minimum player level to equip
 *   stat:     string  — display string for UI
 * }
 */
const EQUIPMENT = [
  { id: 'stick', name: 'Wooden Staff', icon: '🪄', bonus: 0, mpBonus: 0,  req: 1, stat: 'ATK +0'       },
  { id: 'staff', name: 'Magic Staff',  icon: '⚡', bonus: 1, mpBonus: 5,  req: 2, stat: 'ATK +1'       },
  { id: 'wand',  name: 'Elder Wand',   icon: '🔮', bonus: 2, mpBonus: 10, req: 5, stat: 'ATK +2'       },
  { id: 'book1', name: 'Spell Primer', icon: '📗', bonus: 0, mpBonus: 10, req: 1, stat: 'MP +10'       },
  { id: 'book2', name: 'Tome of Power',icon: '📕', bonus: 1, mpBonus: 20, req: 3, stat: 'ATK+1 MP+20'  },
  { id: 'book3', name: 'Ancient Codex',icon: '📜', bonus: 2, mpBonus: 30, req: 6, stat: 'ATK+2 MP+30'  },
];

const ENEMIES = {
  math:    [
    { name: 'Calc Goblin',    icon: '👺', hp: 100 },
    { name: 'Number Troll',   icon: '🧌', hp: 140 },
    { name: 'Algebra Dragon', icon: '🐉', hp: 200 },
  ],
  english: [
    { name: 'Grammar Ghoul',  icon: '👻', hp: 100 },
    { name: 'Word Witch',     icon: '🧙‍♀️', hp: 140 },
    { name: 'Vocab Vampire',  icon: '🧛', hp: 200 },
  ],
  science: [
    { name: 'Lab Fiend',      icon: '🧪', hp: 120 },
    { name: 'Chem Wraith',    icon: '☠️', hp: 160 },
    { name: 'Physics Lich',   icon: '💀', hp: 220 },
  ],
  custom:  [
    { name: 'Quiz Specter',   icon: '❓', hp: 100 },
    { name: 'Mystery Beast',  icon: '🌀', hp: 150 },
    { name: 'Custom Boss',    icon: '🎭', hp: 200 },
  ],
};

/* ============================================================
   2. PLAYER STATE
   ============================================================ */
const P = {
  hp:     100,
  maxHp:  100,
  mp:     80,
  maxMp:  80,
  xp:     0,
  xpToNext: 80,
  level:  1,
  attack: 10,
  equip:  { weapon: 'stick', book: 'book1' },
  combo:  0,
  score:  0,
  kills:  0,
};

/* ============================================================
   3. RUNTIME STATE
   ============================================================ */
let currentCategory = 'math';
let currentQ        = null;
let currentQType    = 'mc';
let enemy           = { hp: 100, maxHp: 100, name: 'Monster', icon: '👾' };
let questionQueue   = [];
let answered        = false;

/* ============================================================
   4. COMBAT FORMULA
   ============================================================
   damage = diffMult × (weaponBonus + 1) × comboMult × (baseAttack / 10)
   
   diffMult  : easy=1, medium=2, hard=4
   weaponBonus: from equipped weapon's .bonus
   comboMult : 1.5× when combo streak ≥ 3, otherwise 1
   baseAttack: P.attack, starts at 10, +5 per level
   ============================================================ */
function calcDamage(q) {
  const diffMult  = { easy: 1, medium: 2, hard: 4 }[q.diff] || 1;
  const weapon    = EQUIPMENT.find(e => e.id === P.equip.weapon);
  const atkBonus  = (weapon?.bonus || 0) + 1;
  const comboMult = P.combo >= 3 ? 1.5 : 1;
  return Math.floor(diffMult * atkBonus * comboMult * (P.attack / 10));
}

/**
 * XP awarded on correct answer.
 * Base = easy:10, medium:20, hard:40
 * Combo bonus = +5 XP per combo count
 */
function calcXP(q) {
  const base = { easy: 10, medium: 20, hard: 40 }[q.diff] || 10;
  return base + (P.combo > 0 ? P.combo * 5 : 0);
}

/** Enemy strikes back when player answers wrong */
function takeDamage() {
  const dmg = 8 + Math.floor(Math.random() * 12);
  P.hp = Math.max(0, P.hp - dmg);
  const sprite = document.getElementById('player-sprite');
  sprite.classList.add('shake');
  setTimeout(() => sprite.classList.remove('shake'), 400);
  updateBars();
  return dmg;
}

/* ============================================================
   5. GAME LOOP
   ============================================================ */

/** Entry point: pick category, spawn enemy, start questions */
function startBattle(cat) {
  currentCategory = cat;

  if (cat === 'custom' && QUESTIONS.custom.length === 0) {
    showScreen('custom');
    return;
  }

  // Shuffle question pool
  questionQueue = [...QUESTIONS[cat]].sort(() => Math.random() - 0.5);
  P.combo = 0;

  // Enemy tier scales with player level (0 / 1 / 2)
  const tier  = Math.min(2, Math.floor((P.level - 1) / 3));
  const eData = ENEMIES[cat][tier] || ENEMIES[cat][0];
  enemy = { hp: eData.hp, maxHp: eData.hp, name: eData.name, icon: eData.icon };

  document.getElementById('enemy-sprite').textContent  = enemy.icon;
  document.getElementById('enemy-name').textContent    = enemy.name;
  document.getElementById('enemy-hp').style.width      = '100%';
  updateCombo();
  showScreen('battle');
  nextQuestion();
}

/** Load next question from shuffled queue */
function nextQuestion() {
  if (questionQueue.length === 0) {
    questionQueue = [...QUESTIONS[currentCategory]].sort(() => Math.random() - 0.5);
  }
  currentQ = questionQueue.pop();
  if (!currentQ) { setBattleLog('No questions found!'); return; }
  answered = false;

  const diffLabels = { easy: '⭐ easy', medium: '⭐⭐ medium', hard: '⭐⭐⭐ hard' };
  document.getElementById('q-cat').textContent  = currentCategory.toUpperCase();
  document.getElementById('q-diff').textContent = diffLabels[currentQ.diff] || '';
  document.getElementById('q-text').textContent = currentQ.text;
  document.getElementById('type-ans').value     = '';

  renderChoices();
}

/** Build MC buttons or reveal text input */
function renderChoices() {
  const mcWrap   = document.getElementById('choices-wrap');
  const typeWrap = document.getElementById('type-wrap');

  if (currentQType === 'mc') {
    mcWrap.style.display   = 'grid';
    typeWrap.style.display = 'none';

    const shuffled = [...currentQ.choices].sort(() => Math.random() - 0.5);
    mcWrap.innerHTML = shuffled
      .map(c => `<button class="choice-btn" onclick="submitAnswer('${esc(c)}','${esc(currentQ.answer)}')">${c}</button>`)
      .join('');
  } else {
    mcWrap.style.display   = 'none';
    typeWrap.style.display = 'flex';
  }
}

function setQType(t) {
  currentQType = t;
  document.getElementById('btn-mc').classList.toggle('active', t === 'mc');
  document.getElementById('btn-type').classList.toggle('active', t === 'type');
  renderChoices();
}

function submitTyped() {
  const val = document.getElementById('type-ans').value.trim();
  if (!val) return;
  submitAnswer(val, currentQ.answer);
}

/** Core answer evaluation — triggers damage, XP, and state transitions */
function submitAnswer(chosen, correct) {
  if (answered) return;
  answered = true;

  const isCorrect = chosen.toLowerCase() === correct.toLowerCase();

  // Highlight MC buttons
  document.querySelectorAll('.choice-btn').forEach(btn => {
    if (btn.textContent.trim() === correct)          btn.classList.add('correct');
    else if (btn.textContent.trim() === chosen)      btn.classList.add('wrong');
  });

if (isCorrect) {
    P.combo++;
    const dmg = calcDamage(currentQ);
    const xp  = calcXP(currentQ);
    enemy.hp  = Math.max(0, enemy.hp - dmg);

    const pct = ((enemy.hp / enemy.maxHp) * 100).toFixed(0);
    document.getElementById('enemy-hp').style.width = pct + '%';

    const sprite = document.getElementById('enemy-sprite');
    sprite.classList.add('shake');
    setTimeout(() => sprite.classList.remove('shake'), 400);

    P.xp    += xp;
    P.score += xp;
    
    // --- ĐÃ THAY ĐỔI ĐA NGÔN NGỮ Ở ĐÂY ---
    let logMsg = LANG_DB[currentLang].logCorrect.replace('{dmg}', dmg).replace('{xp}', xp);
    if (P.combo >= 3) logMsg += ` 🔥×${P.combo} COMBO!`;
    setBattleLog(logMsg);
    
    updateBars();
    updateCombo();
    checkLevelUp();

    if (enemy.hp <= 0) { setTimeout(enemyDefeated, 900); return; }
  } else {
    P.combo = 0;
    updateCombo();
    const dmg = takeDamage();
    
    // --- ĐÃ THAY ĐỔI ĐA NGÔN NGỮ Ở ĐÂY ---
    let logMsg = LANG_DB[currentLang].logWrong.replace('{dmg}', dmg).replace('{ans}', correct);
    setBattleLog(logMsg);
    
    if (P.hp <= 0) { setTimeout(playerDefeated, 900); return; }
  }
  setTimeout(nextQuestion, 1100);
}

function enemyDefeated() {
  P.kills++;
  const bonus = Math.floor(enemy.maxHp / 5);
  P.xp += bonus;
  
  // --- ĐÃ THAY ĐỔI ĐA NGÔN NGỮ Ở ĐÂY ---
  setBattleLog(LANG_DB[currentLang].logDefeatE.replace('{name}', enemy.name).replace('{bonus}', bonus));
  
  updateBars();
  checkLevelUp();
  setTimeout(() => startBattle(currentCategory), 1200);
}

function playerDefeated() {
  P.hp    = Math.floor(P.maxHp * 0.3);
  P.combo = 0;
  updateBars();
  
  // --- ĐÃ THAY ĐỔI ĐA NGÔN NGỮ Ở ĐÂY ---
  setBattleLog(LANG_DB[currentLang].logDefeatP);
  
  setTimeout(() => showScreen('world'), 1500);
}

/* ============================================================
   6. PROGRESSION SYSTEM
   ============================================================
   XP threshold = 80 × 1.4^(level − 1)
   Each level up: +20 maxHp, +10 maxMp, +5 attack
   New equipment unlocks are tied to level (req field on each item)
   ============================================================ */
function checkLevelUp() {
  if (P.xp < P.xpToNext) return;

  P.xp      -= P.xpToNext;
  P.level   += 1;
  P.xpToNext = Math.floor(80 * Math.pow(1.4, P.level - 1));
  P.maxHp   += 20;
  P.hp       = P.maxHp;
  P.maxMp   += 10;
  P.attack  += 5;

  document.getElementById('lv-badge').textContent = 'LV ' + P.level;
  document.getElementById('lu-msg').textContent   = `You reached level ${P.level}!`;
  document.getElementById('lu-hp').textContent    = '+20';
  document.getElementById('lu-atk').textContent   = '+5';
  updateBars();
  showScreen('levelup');
}

/* ============================================================
   7. INVENTORY
   ============================================================ */
function renderInventory() {
  const grid = document.getElementById('equip-grid');
  grid.innerHTML = '';

  EQUIPMENT.forEach(eq => {
    const isEquipped = P.equip.weapon === eq.id || P.equip.book === eq.id;
    const unlocked   = P.level >= eq.req;

    const div = document.createElement('div');
    div.className = 'equip-slot'
      + (isEquipped ? ' equipped' : '')
      + (!unlocked  ? ' locked'   : '');

    div.innerHTML = `
      <div class="slot-icon">${eq.icon}</div>
      <div class="slot-name">${eq.name}</div>
      <div class="slot-stat">${eq.stat}</div>
      ${!unlocked ? `<div class="slot-req">LV${eq.req}+</div>` : ''}
    `;
    if (unlocked) div.onclick = () => equipItem(eq);
    grid.appendChild(div);
  });

  const weapon   = EQUIPMENT.find(e => e.id === P.equip.weapon);
  const book     = EQUIPMENT.find(e => e.id === P.equip.book);
  const atkTotal = P.attack + (weapon?.bonus || 0) + (book?.bonus || 0);
  const mpTotal  = P.maxMp  + (weapon?.mpBonus || 0) + (book?.mpBonus || 0);

  document.getElementById('inv-stats').innerHTML = `
    <div class="inv-stat"><span>Level</span><span>${P.level}</span></div>
    <div class="inv-stat"><span>Max HP</span><span>${P.maxHp}</span></div>
    <div class="inv-stat"><span>Attack</span><span>${atkTotal}</span></div>
    <div class="inv-stat"><span>Max MP</span><span>${mpTotal}</span></div>
    <div class="inv-stat"><span>XP</span><span>${P.xp}/${P.xpToNext}</span></div>
    <div class="inv-stat"><span>Kills</span><span>${P.kills}</span></div>
  `;
}

function equipItem(eq) {
  const isWeapon = ['stick','staff','wand'].includes(eq.id);
  if (isWeapon) P.equip.weapon = eq.id;
  else          P.equip.book   = eq.id;
  renderInventory();
}

/* ============================================================
   8. CUSTOM QUESTIONS
   ============================================================ */
function addCustomQ() {
  const q  = document.getElementById('cq-q').value.trim();
  const a  = document.getElementById('cq-a').value.trim();
  const w1 = document.getElementById('cq-w1').value.trim();
  const w2 = document.getElementById('cq-w2').value.trim();
  const d  = document.getElementById('cq-d').value;

  if (!q || !a || !w1) {
    alert('Please fill in the question, correct answer, and at least one wrong answer.');
    return;
  }

  const dmgMap = { easy: 1, medium: 2, hard: 4 };
  QUESTIONS.custom.push({
    id:      'cq_' + Date.now(),
    text:    q,
    answer:  a,
    choices: [a, w1, w2 || w1].filter(Boolean),
    diff:    d,
    dmg:     dmgMap[d],
  });

  ['cq-q','cq-a','cq-w1','cq-w2'].forEach(id => {
    document.getElementById(id).value = '';
  });

  renderCustomList();
}

function renderCustomList() {
  const list = document.getElementById('cq-list');

  if (!QUESTIONS.custom.length) {
    list.innerHTML = '<div style="text-align:center;font-size:6px;color:#666;padding:10px;">No custom questions yet.</div>';
    return;
  }

  list.innerHTML = QUESTIONS.custom.map((q, i) => `
    <div class="cq-item">
      <div class="cq-item-text">
        ${q.text}<br>
        <span style="color:var(--green)">${q.answer}</span>
      </div>
      <span class="cq-badge badge-${q.diff}">${q.diff}</span>
      <button class="px-btn danger" style="font-size:5px;padding:3px 6px;" onclick="removeCustomQ(${i})">✖</button>
    </div>
  `).join('');
}

function removeCustomQ(i) {
  QUESTIONS.custom.splice(i, 1);
  renderCustomList();
}

/* ============================================================
   9. UI HELPERS
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');

  // Screen-specific render
  if (id === 'inventory') renderInventory();
  if (id === 'custom')    renderCustomList();
}

function setBattleLog(msg) {
  document.getElementById('battle-log').textContent = msg;
}

function updateBars() {
  const hpPct = Math.max(0, (P.hp    / P.maxHp)    * 100).toFixed(0);
  const mpPct = Math.max(0, (P.mp    / P.maxMp)    * 100).toFixed(0);
  const xpPct = Math.max(0, (P.xp    / P.xpToNext) * 100).toFixed(0);

  document.getElementById('hp-bar').style.width   = hpPct + '%';
  document.getElementById('mp-bar').style.width   = mpPct + '%';
  document.getElementById('xp-bar').style.width   = xpPct + '%';
  document.getElementById('lv-badge').textContent = 'LV ' + P.level;
}

function updateCombo() {
  const el = document.getElementById('combo-display');
  if      (P.combo >= 3) el.textContent = `🔥 ${P.combo}× COMBO`;
  else if (P.combo > 0)  el.textContent = `${P.combo}× streak`;
  else                   el.textContent = '';
}

/** Escape single-quotes for inline onclick attribute strings */
function esc(str) {
  return String(str).replace(/'/g, "\\'");
}

/* ============================================================
   10. INIT
   ============================================================ */
changeLanguage('vi'); // Thêm dòng này để áp dụng tiếng Việt ngay từ đầu cho UI
updateBars();
renderCustomList();
