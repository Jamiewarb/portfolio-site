export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

export function isDark(theme: Theme): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setTransitionOrigin(origin: HTMLElement) {
  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  document.documentElement.style.setProperty('--theme-transition-x', `${x}px`);
  document.documentElement.style.setProperty('--theme-transition-y', `${y}px`);
  document.documentElement.style.setProperty('--theme-transition-radius', `${radius}px`);
}

export function applyTheme(theme: Theme, options?: { origin?: HTMLElement }) {
  const willBeDark = isDark(theme);
  const isCurrentlyDark = document.documentElement.classList.contains('dark');

  const update = () => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', willBeDark);
    document.documentElement.dataset.theme = theme;
    syncToggles(theme);
    document.dispatchEvent(
      new CustomEvent('themechange', { detail: { theme, dark: willBeDark } }),
    );
  };

  const shouldAnimate =
    options?.origin &&
    isCurrentlyDark !== willBeDark &&
    !prefersReducedMotion() &&
    typeof document.startViewTransition === 'function';

  if (shouldAnimate) {
    setTransitionOrigin(options.origin);
    document.startViewTransition(update);
    return;
  }

  update();
}

function syncToggles(theme: Theme) {
  for (const root of document.querySelectorAll('[data-theme-toggle]')) {
    for (const button of root.querySelectorAll('[data-theme-value]')) {
      const value = (button as HTMLElement).dataset.themeValue;
      const active = value === theme;
      button.setAttribute('aria-pressed', String(active));
      button.toggleAttribute('data-active', active);
    }
  }
}

let initialized = false;

export function setupTheme() {
  if (initialized) return;
  initialized = true;

  applyTheme(getStoredTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') applyTheme('system');
  });

  document.addEventListener('click', (event) => {
    const button = (event.target as Element).closest('[data-theme-value]');
    if (!button?.closest('[data-theme-toggle]')) return;
    applyTheme((button as HTMLElement).dataset.themeValue as Theme, {
      origin: button as HTMLElement,
    });
  });
}
