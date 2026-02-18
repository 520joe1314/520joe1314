import { loadState, saveState } from './storage.js';
import { getDailyPlan, recordAttempt, sessionSummary, scoreSession } from './game.js';

const app = document.getElementById('app');
const state = loadState();
let data = {};
let currentMode = 'home';
let currentSet = [];
let cursor = 0;
let startedAt = 0;
let sessionAttempts = [];

const modeCards = [
  ['daily', 'Quick Start', '15–25 min auto session with weak-spot summary'],
  ['grammar', 'Grammar Arcade', 'Trigger lists + chunk drills + mixed questions'],
  ['vocab', 'Vocabulary Quest', 'Recognition and production-light chunk work'],
  ['listening', 'Listening Lab', 'Listen twice (gist then detail) with TTS fallback'],
  ['reading', 'Reading Runner', 'Contest-style passage and paraphrase matching'],
  ['mock', 'Mock Exam Mode', 'Part A/B timed simulation with breakdown'],
  ['boss', 'Boss Battles', 'High-yield mixed trap clusters'],
  ['questionpack', 'Question Starter Words', 'Timed mnemonics + starter drill'],
  ['lapack', 'là / la / l’a Pack', 'Accent logic + 30 quick questions'],
  ['mistakes', 'Mistake Notebook', 'Filter, redo, mini test, CSV export'],
  ['teacher', 'Teacher Mode', 'Hide answers, timer controls, topic selection'],
];

init();

async function init() {
  const [grammarTopics, vocabEntries, chunks, questionBank] = await Promise.all([
    fetchJSON('data/grammar_topics.json'),
    fetchJSON('data/vocab_entries.json'),
    fetchJSON('data/chunk_entries.json'),
    fetchJSON('data/question_bank.json'),
  ]);
  data = { grammarTopics, vocabEntries, chunks, questionBank };
  renderHome();
}

async function fetchJSON(path) { const r = await fetch(path); return r.json(); }

function renderHome() {
  currentMode = 'home';
  app.innerHTML = `
    <header><h1>🎮 Grand Concours L3 Arena</h1><p>French 3 (D’accord! 3 Leçons 1–8) · Speed + Accuracy + Context</p></header>
    <section class="stats">
      <div><strong>${data.questionBank.length}</strong><span>Questions</span></div>
      <div><strong>${data.vocabEntries.length}</strong><span>Vocab Forms</span></div>
      <div><strong>${data.chunks.length}</strong><span>Chunks</span></div>
      <div><strong>${state.mistakes.length}</strong><span>Mistakes Logged</span></div>
    </section>
    <section class="grid">
      ${modeCards.map(([id, name, desc]) => `<button class="card" data-mode="${id}"><h3>${name}</h3><p>${desc}</p></button>`).join('')}
    </section>
  `;
  app.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => launchMode(b.dataset.mode));
}

function launchMode(mode) {
  currentMode = mode;
  if (mode === 'mistakes') return renderMistakes();
  if (mode === 'teacher') return renderTeacher();

  if (mode === 'daily') currentSet = getDailyPlan(data.questionBank, state);
  if (mode === 'grammar') currentSet = data.questionBank.filter(q => q.mode === 'grammar_arcade').slice(0, 35);
  if (mode === 'vocab') currentSet = data.questionBank.filter(q => ['vocab_quest','daily'].includes(q.mode)).slice(0, 35);
  if (mode === 'listening') currentSet = data.questionBank.filter(q => q.type === 'listening_mcq').slice(0, 24);
  if (mode === 'reading') currentSet = data.questionBank.filter(q => q.type === 'reading_mcq').slice(0, 24);
  if (mode === 'mock') currentSet = data.questionBank.slice(0, 30);
  if (mode === 'boss') currentSet = data.questionBank.filter(q => q.trapType).slice(0, 30);
  if (mode === 'questionpack') currentSet = data.questionBank.filter(q => q.type === 'question_word').slice(0, 30);
  if (mode === 'lapack') currentSet = data.questionBank.filter(q => q.trapType === 'accent-trap').slice(0, 30);

  cursor = 0;
  sessionAttempts = [];
  renderQuestion();
}

function renderQuestion() {
  const q = currentSet[cursor];
  if (!q) return renderSummary();
  startedAt = performance.now();
  const hint = state.userProfile.minimalHints ? '' : `<small>${q.explanation}</small>`;
  app.innerHTML = `
  <header><button id="homeBtn">← Home</button><h2>${modeTitle(currentMode)}</h2><p>Q ${cursor+1}/${currentSet.length}</p></header>
  <article class="question">
    <p class="tagline">${q.grammarTopics.join(', ')} · ${q.lessonId} · ${q.difficulty}</p>
    <p class="prompt">${q.prompt}</p>
    <p class="sentence">${q.sentence}</p>
    ${hint}
    <div class="options">
      ${q.options.map((opt, i) => `<button data-i="${i}">${opt}</button>`).join('')}
    </div>
    <div class="actions">
      <button id="listenBtn">🔊 Listen twice</button>
      <button id="ruleBtn">Show me the rule</button>
    </div>
    <p id="feedback"></p>
  </article>`;

  app.querySelector('#homeBtn').onclick = renderHome;
  app.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => submitAnswer(Number(b.dataset.i)));
  app.querySelector('#listenBtn').onclick = () => speakTwice(q.audioText || q.sentence);
  app.querySelector('#ruleBtn').onclick = () => alert(shortRule(q.grammarTopics[0]));
}

function submitAnswer(index) {
  const q = currentSet[cursor];
  const elapsed = Math.round(performance.now() - startedAt);
  const correct = recordAttempt(state, q, index, elapsed);
  sessionAttempts.push({ questionId: q.id, correct, elapsedMs: elapsed, topic: q.grammarTopics[0] });
  saveState(state);

  const feedback = app.querySelector('#feedback');
  feedback.textContent = correct ? `✅ Correct (${elapsed}ms)` : `❌ ${q.correctAnswer} — ${q.explanation}`;
  setTimeout(() => { cursor += 1; renderQuestion(); }, 350);
}

function renderSummary() {
  const summary = sessionSummary(sessionAttempts, data.questionBank, state.mistakes);
  const score = scoreSession(sessionAttempts);
  app.innerHTML = `
    <header><button id="homeBtn">← Home</button><h2>Session Complete</h2></header>
    <section class="summary">
      <p><strong>Score:</strong> ${score}</p>
      <p><strong>Accuracy:</strong> ${Math.round(100 * sessionAttempts.filter(a => a.correct).length / Math.max(1, sessionAttempts.length))}%</p>
      <p><strong>Top 3 weak spots:</strong> ${summary.weak.join(', ') || 'None yet'}</p>
      <p><strong>Top missed words:</strong> ${summary.missedWords.join(', ') || 'None yet'}</p>
      <p><strong>Recommended next set:</strong> ${summary.weak[0] ? `Boss Battle: ${summary.weak[0]}` : 'Daily Session refresh'}</p>
    </section>
  `;
  app.querySelector('#homeBtn').onclick = renderHome;
}

function renderMistakes() {
  const rows = state.mistakes.slice(-200).reverse();
  app.innerHTML = `
    <header><button id="homeBtn">← Home</button><h2>Mistake Notebook</h2></header>
    <div class="actions"><button id="redoBtn">Redo only mistakes</button><button id="miniBtn">Mini-test from mistakes</button><button id="csvBtn">Export CSV</button></div>
    <div class="mistakes">${rows.map(m => `<details><summary>${m.question_id} · ${m.grammar_topic_tags.join(', ')}</summary><p><b>Trigger:</b> ${m.trigger_words.join(', ')}</p><p><b>Your answer:</b> ${m.user_answer}</p><p><b>Correct:</b> ${m.correct_answer}</p><p><b>Model:</b> ${m.corrected_model_sentence}</p><p>${m.why}</p></details>`).join('')}</div>`;
  app.querySelector('#homeBtn').onclick = renderHome;
  app.querySelector('#redoBtn').onclick = () => { currentSet = state.mistakes.map(m => data.questionBank.find(q => q.id === m.question_id)).filter(Boolean).slice(0,30); cursor=0; sessionAttempts=[]; renderQuestion(); };
  app.querySelector('#miniBtn').onclick = () => { currentSet = state.mistakes.slice(-20).map(m => data.questionBank.find(q => q.id === m.question_id)).filter(Boolean); cursor=0; sessionAttempts=[]; renderQuestion(); };
  app.querySelector('#csvBtn').onclick = exportMistakesCSV;
}

function renderTeacher() {
  app.innerHTML = `
    <header><button id="homeBtn">← Home</button><h2>Teacher Mode</h2></header>
    <label><input id="hideAns" type="checkbox" ${state.teacherMode.hideAnswersUntilEnd ? 'checked' : ''}/> Hide answers until end</label>
    <label>Timer multiplier <input id="tm" type="number" step="0.1" min="0.5" max="3" value="${state.teacherMode.timerMultiplier}"/></label>
    <p>Select lessons for targeted sets:</p>
    <div>${['L1','L2','L3','L4','L5','L6','L7','L8','ESS'].map(l => `<label><input class="lessonChk" type="checkbox" value="${l}" ${state.teacherMode.selectedLessons.includes(l)?'checked':''}/> ${l}</label>`).join(' ')}</div>
    <button id="saveTeacher">Save</button>
  `;
  app.querySelector('#homeBtn').onclick = renderHome;
  app.querySelector('#saveTeacher').onclick = () => {
    state.teacherMode.hideAnswersUntilEnd = app.querySelector('#hideAns').checked;
    state.teacherMode.timerMultiplier = Number(app.querySelector('#tm').value) || 1;
    state.teacherMode.selectedLessons = Array.from(app.querySelectorAll('.lessonChk:checked')).map(i => i.value);
    saveState(state);
    renderHome();
  };
}

function speakTwice(text) {
  if (!('speechSynthesis' in window)) return alert('TTS unavailable in this browser.');
  const u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR';
  speechSynthesis.speak(u);
  setTimeout(() => speechSynthesis.speak(new SpeechSynthesisUtterance(text)), 1200);
}

function shortRule(topic) {
  const map = {
    question_forms: 'Use est-ce que for neutral questions; inversion is formal; intonation in spoken French.',
    passe_compose: 'Passé composé = completed action. Use être with movement/reflexive and agree if needed.',
    imparfait_vs_pc: 'Imparfait sets background/habit; passé composé is a finished event.',
    pronouns: 'Pronoun order before verb: me/te/se/nous/vous -> le/la/les -> lui/leur -> y -> en.',
    accent_traps: 'où = where, ou = or; là = there; la = the; l’a = has it; a = has, à = to/at.',
  };
  return map[topic] || 'Find the trigger word, then match tense/pronoun/article pattern.';
}

function modeTitle(mode) { return modeCards.find(([id]) => id === mode)?.[1] || 'Practice'; }

function exportMistakesCSV() {
  const header = ['question_id','user_answer','correct_answer','grammar_topic_tags','vocab_words','trigger_words','corrected_model_sentence','why'];
  const lines = [header.join(',')];
  state.mistakes.forEach((m) => lines.push([
    m.question_id,
    esc(m.user_answer), esc(m.correct_answer),
    esc(m.grammar_topic_tags.join('|')),
    esc(m.vocab_words.join('|')),
    esc(m.trigger_words.join('|')),
    esc(m.corrected_model_sentence),
    esc(m.why)
  ].join(',')));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mistake_notebook.csv';
  a.click();
}

function esc(v='') { return `"${String(v).replaceAll('"','""')}"`; }
