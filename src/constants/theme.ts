export const THEME = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const;

export type Theme = (typeof THEME)[keyof typeof THEME];
