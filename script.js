/* ── State ── */
let sessions = 0, isRunning = false, iv = null, mode = 'focus';
let tasks = [], activeAmb = null, actx = null, ambN = {};
const modes = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
let total = 25 * 60, remain = 25 * 60;

const quotes = [
  '今この瞬間に集中する · Focus on this moment',
  '一歩一歩 · One step at a time',
  '小さな進歩も進歩 · Small progress is still progress',
  '深く息を吸って · Breathe deep and begin',
  'あなたはできる · You are capable of great things',
  '今日も頑張ろう · Let\'s do our best today',
  '集中は筋肉です · Focus is a muscle — train it',
  '静かな心で · With a quiet mind, anything is possible'
];

/* ── Avatar helpers ── */
function ns() { return 'http://www.w3.org/2000/svg'; }

function mk(tag, attrs, par) {
  const e = document.createElementNS(ns(), tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  (par || document.getElementById('av')).appendChild(e);
  return e;
}

function drawFlower(par, cx, cy, col, r) {
  const g = mk('g', { class: 'a-sway' }, par);
  [0, 60, 120, 180, 240, 300].forEach(a => {
    const rd = a * Math.PI / 180;
    mk('circle', { cx: String(cx + Math.cos(rd) * r), cy: String(cy + Math.sin(rd) * r), r: String(r * .7), fill: col, opacity: '.8' }, g);
  });
  mk('circle', { cx: String(cx), cy: String(cy), r: String(r * .6), fill: '#FFF0D0' }, g);
}

function drawAvatar(s) {
  const av = document.getElementById('av');
  av.innerHTML = '';
  const bc = s === 0 ? '#E0D5C8' : s === 1 ? '#D4C8B8' : s === 2 ? '#CCBEA8' : '#C4B49A';
  const ear = '#C8A882', epink = '#E8C4A8';
  const fl = mk('g', { class: 'a-float' });
  const body = mk('g', { class: 'a-body' }, fl);

  /* Tail */
  mk('path', { d: 'M 84 88 Q 108 76 102 58', stroke: bc, 'stroke-width': '13', fill: 'none', 'stroke-linecap': 'round' }, body);

  /* Ears */
  mk('ellipse', { cx: '37', cy: '38', rx: '14', ry: '19', fill: ear }, fl);
  mk('ellipse', { cx: '83', cy: '38', rx: '14', ry: '19', fill: ear }, fl);
  mk('ellipse', { cx: '37', cy: '39', rx: '8', ry: '12', fill: epink }, fl);
  mk('ellipse', { cx: '83', cy: '39', rx: '8', ry: '12', fill: epink }, fl);

  /* Decorations by happiness level */
  if (s >= 2) drawFlower(fl, 60, 18, '#D4A8A0', 7);
  if (s >= 3) {
    drawFlower(fl, 28, 34, '#A8C4A0', 5);
    drawFlower(fl, 92, 34, '#A8A8C8', 5);
    const sp1 = mk('g', { class: 'a-pop' }, fl); mk('text', { x: '14', y: '50', 'font-size': '11', fill: '#C4A040', 'font-family': 'serif' }, sp1).textContent = '✦';
    const sp2 = mk('g', { class: 'a-pop2' }, fl); mk('text', { x: '97', y: '46', 'font-size': '9', fill: '#C4A040', 'font-family': 'serif' }, sp2).textContent = '✦';
    const sp3 = mk('g', { class: 'a-pop3' }, fl); mk('text', { x: '18', y: '78', 'font-size': '8', fill: '#D89898', 'font-family': 'serif' }, sp3).textContent = '✿';
  }

  /* Head & body */
  mk('circle', { cx: '60', cy: '50', r: '33', fill: bc }, body);
  mk('ellipse', { cx: '60', cy: '76', rx: '28', ry: '22', fill: bc }, body);
  mk('ellipse', { cx: '38', cy: '88', rx: '12', ry: '8', fill: bc }, body);
  mk('ellipse', { cx: '82', cy: '88', rx: '12', ry: '8', fill: bc }, body);

  /* Eyes by state */
  if (s === 0) {
    const eg = mk('g', { class: 'a-blink' }, body);
    mk('path', { d: 'M 46 49 Q 51 45 56 49', stroke: '#5C4A3A', 'stroke-width': '2', fill: 'none', 'stroke-linecap': 'round' }, eg);
    mk('path', { d: 'M 64 49 Q 69 45 74 49', stroke: '#5C4A3A', 'stroke-width': '2', fill: 'none', 'stroke-linecap': 'round' }, eg);
    mk('text', { x: '85', y: '30', 'font-size': '9', fill: '#A09080', 'font-family': 'serif', class: 'a-pop' }, body).textContent = 'z';
    mk('text', { x: '91', y: '22', 'font-size': '7', fill: '#A09080', 'font-family': 'serif', class: 'a-pop2' }, body).textContent = 'z';
  } else if (s === 1) {
    const eg = mk('g', { class: 'a-blink' }, body);
    mk('circle', { cx: '51', cy: '49', r: '5.5', fill: '#3C2E24' }, eg);
    mk('circle', { cx: '69', cy: '49', r: '5.5', fill: '#3C2E24' }, eg);
    mk('circle', { cx: '53', cy: '47', r: '1.8', fill: 'white' }, eg);
    mk('circle', { cx: '71', cy: '47', r: '1.8', fill: 'white' }, eg);
  } else if (s === 2) {
    const eg = mk('g', { class: 'a-blink' }, body);
    mk('path', { d: 'M 45 51 Q 51 44 57 51', stroke: '#3C2E24', 'stroke-width': '2.5', fill: 'none', 'stroke-linecap': 'round' }, eg);
    mk('path', { d: 'M 63 51 Q 69 44 75 51', stroke: '#3C2E24', 'stroke-width': '2.5', fill: 'none', 'stroke-linecap': 'round' }, eg);
    mk('ellipse', { cx: '42', cy: '59', rx: '7', ry: '4', fill: 'rgba(200,130,110,0.4)' }, body);
    mk('ellipse', { cx: '78', cy: '59', rx: '7', ry: '4', fill: 'rgba(200,130,110,0.4)' }, body);
  } else {
    mk('text', { x: '43', y: '55', 'font-size': '14', fill: '#B07040', 'text-anchor': 'middle', 'font-family': 'serif' }, body).textContent = '★';
    mk('text', { x: '77', y: '55', 'font-size': '14', fill: '#B07040', 'text-anchor': 'middle', 'font-family': 'serif' }, body).textContent = '★';
    mk('ellipse', { cx: '39', cy: '61', rx: '9', ry: '5', fill: 'rgba(200,130,110,0.45)' }, body);
    mk('ellipse', { cx: '81', cy: '61', rx: '9', ry: '5', fill: 'rgba(200,130,110,0.45)' }, body);
  }

  /* Nose & mouth */
  mk('ellipse', { cx: '60', cy: '57', rx: '3.5', ry: '2.5', fill: '#B08070' }, body);
  if (s === 0) {
    mk('path', { d: 'M 54 63 Q 60 65 66 63', stroke: '#8A7060', 'stroke-width': '1.5', fill: 'none', 'stroke-linecap': 'round' }, body);
  } else if (s === 1) {
    mk('path', { d: 'M 52 63 Q 60 69 68 63', stroke: '#5C4A3A', 'stroke-width': '2', fill: 'none', 'stroke-linecap': 'round' }, body);
  } else {
    mk('path', { d: 'M 49 62 Q 60 75 71 62', stroke: '#5C4A3A', 'stroke-width': '2', fill: '#EAB8A8', 'stroke-linecap': 'round' }, body);
  }
}

function avatarState() { return sessions === 0 ? 0 : sessions <= 2 ? 1 : sessions <= 4 ? 2 : 3; }
function refreshAvatar() { drawAvatar(avatarState()); }

/* ── Timer ── */
function setMode(m, btn) {
  mode = m; total = modes[m]; remain = total;
  isRunning = false; clearInterval(iv);
  document.getElementById('sb').textContent = 'Start';
  document.querySelectorAll('.mtab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  updateDisplay();
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(iv); isRunning = false;
    document.getElementById('sb').textContent = 'Resume';
  } else {
    isRunning = true;
    document.getElementById('sb').textContent = 'Pause';
    iv = setInterval(tick, 1000);
  }
}

function resetTimer() {
  clearInterval(iv); isRunning = false; remain = total;
  document.getElementById('sb').textContent = 'Start';
  updateDisplay();
}

function tick() {
  remain--;
  if (remain <= 0) {
    clearInterval(iv); isRunning = false; remain = 0;
    document.getElementById('sb').textContent = 'Start';
    if (mode === 'focus') {
      sessions++;
      document.getElementById('sBadge').textContent = sessions + (sessions === 1 ? ' session' : ' sessions');
      refreshAvatar();
      rotateQuote();
    }
    playBell();
  }
  updateDisplay();
}

function updateDisplay() {
  const m = Math.floor(remain / 60), s = remain % 60;
  document.getElementById('td').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  document.getElementById('pf').style.width = ((remain / total) * 100) + '%';
}

/* ── Tasks ── */
function addTask() {
  const inp = document.getElementById('ti'), t = inp.value.trim();
  if (!t) return;
  tasks.push({ t, done: false }); inp.value = ''; renderTasks();
}

function renderTasks() {
  const l = document.getElementById('tl'); l.innerHTML = '';
  tasks.forEach((task, i) => {
    const d = document.createElement('div'); d.className = 't-item';
    d.innerHTML = `
      <div class="t-chk${task.done ? ' done' : ''}" onclick="tog(${i})">
        ${task.done ? '<svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3.5 6L8 1" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>' : ''}
      </div>
      <span class="t-txt${task.done ? ' done' : ''}">${task.t}</span>
      <button class="t-del" onclick="del(${i})">×</button>`;
    l.appendChild(d);
  });
}

function tog(i) { tasks[i].done = !tasks[i].done; renderTasks(); }
function del(i) { tasks.splice(i, 1); renderTasks(); }

/* ── Quotes ── */
function rotateQuote() {
  const el = document.getElementById('qt');
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    el.style.opacity = '1';
  }, 300);
}

/* ── Audio ── */
function getCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  return actx;
}

function playBell() {
  try {
    const c = getCtx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.setValueAtTime(528, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(396, c.currentTime + 1.5);
    g.gain.setValueAtTime(.3, c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, c.currentTime + 2.5);
    o.start(c.currentTime); o.stop(c.currentTime + 2.5);
  } catch (e) {}
}

function mkNoise(c, dur) {
  const buf = c.createBuffer(1, c.sampleRate * (dur || 2), c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  return src;
}

function startRain() {
  const c = getCtx(), src = mkNoise(c, 3), f = c.createBiquadFilter(), g = c.createGain();
  f.type = 'bandpass'; f.frequency.value = 1000; f.Q.value = .4; g.gain.value = .08;
  src.connect(f); f.connect(g); g.connect(c.destination); src.start();
  ambN.rain = { src, g };
}

function startForest() {
  const c = getCtx(), mg = c.createGain(); mg.gain.value = .06; mg.connect(c.destination);
  const src = mkNoise(c, 4), f = c.createBiquadFilter(), gn = c.createGain();
  f.type = 'lowpass'; f.frequency.value = 400; gn.gain.value = .4;
  src.connect(f); f.connect(gn); gn.connect(mg); src.start();
  const oscs = [];
  [380, 520, 680, 850].forEach(freq => {
    const o = c.createOscillator(), og = c.createGain();
    o.type = 'sine'; o.frequency.value = freq; og.gain.value = .04;
    o.connect(og); og.connect(mg); o.start(); oscs.push({ o, og });
    setInterval(() => { og.gain.setValueAtTime(Math.random() * .07, c.currentTime); }, 700 + Math.random() * 900);
  });
  ambN.forest = { src, mg, oscs };
}

function startCafe() {
  const c = getCtx(), mg = c.createGain(); mg.gain.value = .06; mg.connect(c.destination);
  const src = mkNoise(c, 5);
  [280, 600, 1100].forEach(fr => {
    const f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = fr; f.Q.value = 1.2; g.gain.value = .22;
    src.connect(f); f.connect(g); g.connect(mg);
  });
  src.start(); ambN.cafe = { src, mg };
}

function stopAmb(name) {
  const n = ambN[name]; if (!n) return;
  try {
    if (n.src) n.src.stop();
    if (n.oscs) n.oscs.forEach(({ o }) => { try { o.stop(); } catch (e) {} });
    if (n.mg) n.mg.disconnect();
  } catch (e) {}
  delete ambN[name];
}

function toggleAmb(name) {
  const btn = document.getElementById(name + 'B');
  if (activeAmb === name) { stopAmb(name); btn.classList.remove('on'); activeAmb = null; return; }
  if (activeAmb) { stopAmb(activeAmb); document.querySelectorAll('.amb-btn').forEach(b => b.classList.remove('on')); }
  if (name === 'rain') startRain();
  else if (name === 'forest') startForest();
  else startCafe();
  btn.classList.add('on'); activeAmb = name;
}

/* ── Init ── */
refreshAvatar();