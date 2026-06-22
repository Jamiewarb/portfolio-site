import { createHash } from 'node:crypto';

import { getEnv } from './env';

function getHashSalt(): string {
  const salt = getEnv('LIKES_HASH_SALT');

  if (!salt && (process.env.NODE_ENV === 'production' || import.meta.env.PROD)) {
    throw new Error('LIKES_HASH_SALT environment variable must be set in production');
  }

  return salt || 'default-likes-salt-dev';
}

export function hashUserIp(ip: string): string {
  return createHash('sha256').update(`${getHashSalt()}:${ip}`).digest('hex').substring(0, 16);
}

export function getClientIp(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}
