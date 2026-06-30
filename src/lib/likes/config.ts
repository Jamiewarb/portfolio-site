import { getEnv } from './env';

export const LIKES_ENABLED_ENV = 'LIKES_ENABLED';

export const LIKES_DISABLED_MESSAGE = `Likes are disabled in development. Enable via environment variable ${LIKES_ENABLED_ENV}`;

export function isLikesEnabled(): boolean {
  const value = getEnv(LIKES_ENABLED_ENV);

  if (value === undefined || value === '') {
    return true;
  }

  return value !== 'false' && value !== '0';
}
