/**
 * Unified Theme Controller for Proviqra
 * Synchronizes Dark / Light mode across:
 * - Page 1: 3D Landing Page (/)
 * - Page 2: Minimalist 3D Dashboard (#/app)
 * - All other pages (Discover, Ask, Messages, Profile, Modals)
 */

export const THEME_STORAGE_KEY = 'proviqra_theme';
export const APP_STATE_KEY = 'proviqra_app_state_v1';
export const THEME_CHANGE_EVENT = 'proviqra-theme-changed';

/**
 * Returns current stored theme ('dark' | 'light').
 * Defaults to 'dark' for high-contrast futuristic 3D aesthetic.
 */
export function getStoredTheme() {
  try {
    const direct = localStorage.getItem(THEME_STORAGE_KEY);
    if (direct === 'dark' || direct === 'light') {
      return direct;
    }

    const raw = localStorage.getItem(APP_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.theme === 'dark' || parsed?.theme === 'light') {
        return parsed.theme;
      }
    }
  } catch (e) {
    // ignore parsing failure
  }
  return 'dark';
}

/**
 * Applies the given theme globally to documentElement, updates localStorage
 * and notifies active listeners.
 */
export function setAppTheme(theme) {
  const safeTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', safeTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, safeTheme);

    const raw = localStorage.getItem(APP_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        parsed.theme = safeTheme;
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(parsed));
      }
    }
  } catch (e) {
    // ignore storage quota issues
  }

  // Dispatch custom event for real-time reactivity across components
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: safeTheme }));
  return safeTheme;
}
