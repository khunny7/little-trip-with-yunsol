// Local preferences for PWA/offline mode
const LOCAL_KEY = 'pwaUserPreferences';

export function isPWA() {
  return typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
}

export function getLocalPreferences() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { liked: [], hidden: [], pinned: [] };
    return JSON.parse(raw);
  } catch {
    return { liked: [], hidden: [], pinned: [] };
  }
}

export function setLocalPreferences(prefs) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(prefs));
}

export function toggleLocalAction(placeId, actionType) {
  const prefs = getLocalPreferences();
  const field = actionType;
  const arr = new Set(prefs[field] || []);
  if (arr.has(placeId)) arr.delete(placeId); else arr.add(placeId);
  const newPrefs = { ...prefs, [field]: Array.from(arr) };
  setLocalPreferences(newPrefs);
  return newPrefs;
}
