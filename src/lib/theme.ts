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

export function applyTheme(theme: Theme) {
	localStorage.setItem(STORAGE_KEY, theme);
	document.documentElement.classList.toggle('dark', isDark(theme));
	document.documentElement.dataset.theme = theme;
	syncToggles(theme);
	document.dispatchEvent(
		new CustomEvent('themechange', { detail: { theme, dark: isDark(theme) } }),
	);
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
		applyTheme((button as HTMLElement).dataset.themeValue as Theme);
	});
}
