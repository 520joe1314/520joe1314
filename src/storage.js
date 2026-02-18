const KEY = 'grand-concours-l3-state-v1';

export const defaultState = {
  userProfile: { name: 'Player', darkMode: false, minimalHints: false },
  teacherMode: { hideAnswersUntilEnd: false, timerMultiplier: 1, selectedLessons: [] },
  reviewSchedule: {},
  attempts: [],
  mistakes: [],
  badges: [],
};

export function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
