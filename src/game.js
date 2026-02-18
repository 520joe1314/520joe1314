import { scheduleReview, priorityScore } from './srs.js';

export function getDailyPlan(questions, state) {
  const weakTopics = topicWeakness(state.attempts);
  const sorted = [...questions].sort((a, b) => {
    const pa = priorityScore(state.reviewSchedule[a.id]);
    const pb = priorityScore(state.reviewSchedule[b.id]);
    return pb - pa;
  });
  const targeted = sorted.filter((q) => weakTopics.includes(q.grammarTopics[0])).slice(0, 20);
  const review = sorted.filter((q) => !targeted.includes(q)).slice(0, 8);
  return [...targeted, ...review].slice(0, 28);
}

export function topicWeakness(attempts) {
  const map = {};
  attempts.forEach((a) => {
    const k = a.topic;
    if (!map[k]) map[k] = { correct: 0, total: 0 };
    map[k].total += 1;
    if (a.correct) map[k].correct += 1;
  });
  const scored = Object.entries(map).map(([topic, val]) => ({ topic, score: val.correct / Math.max(1, val.total) }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 5).map((s) => s.topic);
}

export function recordAttempt(state, q, selectedIndex, elapsedMs) {
  const correct = selectedIndex === q.correctIndex;
  state.attempts.push({ questionId: q.id, topic: q.grammarTopics[0], correct, elapsedMs, at: Date.now() });
  state.reviewSchedule[q.id] = scheduleReview(state.reviewSchedule[q.id], correct, elapsedMs, q.trapType);

  if (!correct) {
    state.mistakes.push({
      question_id: q.id,
      user_answer: q.options[selectedIndex] ?? 'No answer',
      correct_answer: q.correctAnswer,
      grammar_topic_tags: q.grammarTopics,
      vocab_words: q.vocabRefs,
      trigger_words: q.triggerWords,
      corrected_model_sentence: q.sentence,
      why: q.explanation,
      ts: Date.now(),
    });
  }
  return correct;
}

export function sessionSummary(sessionAttempts, questions, mistakes) {
  const missed = sessionAttempts.filter((a) => !a.correct).map((a) => a.questionId);
  const weak = topicWeakness(sessionAttempts).slice(0, 3);
  const missedWords = mistakes
    .filter((m) => missed.includes(m.question_id))
    .flatMap((m) => m.vocab_words)
    .slice(0, 10);
  return { weak, missedWords };
}

export function scoreSession(sessionAttempts) {
  let streak = 0;
  let score = 0;
  sessionAttempts.forEach((a) => {
    if (a.correct) {
      streak += 1;
      score += 100 + Math.max(0, 40 - Math.floor(a.elapsedMs / 250)) + streak * 10;
    } else {
      streak = 0;
      score -= 20;
    }
  });
  return Math.max(0, score);
}
