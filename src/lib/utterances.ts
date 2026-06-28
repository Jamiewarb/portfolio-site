import { THEME } from '@/constants/theme';

const UTTERANCES_ORIGIN = 'https://utteranc.es';

export type UtterancesTheme = 'github-light' | 'github-dark';

export function utterancesTheme(): UtterancesTheme {
  return document.documentElement.classList.contains(THEME.dark)
    ? 'github-dark'
    : 'github-light';
}

export function syncUtterancesTheme() {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.utterances-frame');
  if (!iframe?.contentWindow) return;

  iframe.contentWindow.postMessage(
    { type: 'set-theme', theme: utterancesTheme() },
    UTTERANCES_ORIGIN,
  );
}

export function setupUtterances(anchor: HTMLElement) {
  if (anchor.querySelector('script[src*="utteranc.es"]')) return;

  const script = document.createElement('script');
  script.src = `${UTTERANCES_ORIGIN}/client.js`;
  script.setAttribute('repo', 'Jamiewarb/portfolio-site');
  script.setAttribute('issue-term', 'pathname');
  script.setAttribute('theme', utterancesTheme());
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;
  anchor.appendChild(script);

  document.addEventListener('themechange', syncUtterancesTheme);
}
