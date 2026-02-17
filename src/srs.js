const LEVELS = ['New', 'Learning', 'Practiced', 'Strong', 'Automatic'];

export function scheduleReview(record = {}, correct, responseMs, trapType = '') {
  const now = Date.now();
  const streak = correct ? (record.streak || 0) + 1 : 0;
  const easeBase = correct ? 1.8 : 0.8;
  const speedBonus = responseMs < 5000 ? 1.2 : responseMs < 9000 ? 1.0 : 0.9;
  const trapPenalty = trapType ? 0.85 : 1;
  const interval = Math.max(1, Math.round((record.intervalDays || 1) * easeBase * speedBonus * trapPenalty));
  const nextReviewAt = now + interval * 24 * 60 * 60 * 1000;
  const masteryIndex = Math.min(4, Math.floor(streak / 2));
  return { streak, intervalDays: interval, nextReviewAt, mastery: LEVELS[masteryIndex] };
}

export function priorityScore(itemSchedule) {
  if (!itemSchedule?.nextReviewAt) return 100;
  const diff = itemSchedule.nextReviewAt - Date.now();
  return diff < 0 ? 100 : Math.max(5, 100 - diff / (1000 * 60 * 60));
}
