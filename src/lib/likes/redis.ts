import { Redis } from '@upstash/redis';

import { MAX_LIKES_PER_USER } from './constants';
import { getEnv, requireEnv } from './env';

let redis: Redis | null = null;

const TOTAL_PREFIX = 'likes:total:';
const USERS_PREFIX = 'likes:users:';
const USER_LIKES_PREFIX = 'likes:user:';
const RATE_LIMIT_PREFIX = 'ratelimit:likes:';

const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 60;

function getLikesRedis(): Redis {
  if (redis) return redis;

  const url = requireEnv('UPSTASH_LIKES_REST_URL');
  const token = getEnv('UPSTASH_LIKES_REST_TOKEN') ?? getEnv('UPSTASH_LIKES_WRITE_TOKEN');

  if (!token) {
    throw new Error(
      'Missing Upstash token. Set UPSTASH_LIKES_REST_TOKEN or UPSTASH_LIKES_WRITE_TOKEN.',
    );
  }

  redis = new Redis({ url, token });
  return redis;
}

export async function getLikeCount(postId: string): Promise<number> {
  const client = getLikesRedis();

  try {
    const count = await client.get<number>(`${TOTAL_PREFIX}${postId}`);
    return count ?? 0;
  } catch (error) {
    console.error('[likes] Error getting like count:', error);
    return 0;
  }
}

export async function getUserLikeCount(userHash: string, postId: string): Promise<number> {
  const client = getLikesRedis();

  try {
    const count = await client.get<number>(`${USER_LIKES_PREFIX}${userHash}:${postId}`);
    return count ?? 0;
  } catch (error) {
    console.error('[likes] Error getting user like count:', error);
    return 0;
  }
}

export async function hasUserLiked(userHash: string, postId: string): Promise<boolean> {
  const client = getLikesRedis();

  try {
    const isMember = await client.sismember(`${USERS_PREFIX}${postId}`, userHash);
    return isMember === 1;
  } catch (error) {
    console.error('[likes] Error checking user liked:', error);
    return false;
  }
}

export async function addLike(userHash: string, postId: string): Promise<number> {
  const client = getLikesRedis();

  const pipeline = client.pipeline();
  pipeline.incr(`${TOTAL_PREFIX}${postId}`);
  pipeline.sadd(`${USERS_PREFIX}${postId}`, userHash);
  pipeline.incr(`${USER_LIKES_PREFIX}${userHash}:${postId}`);

  const results = await pipeline.exec();
  return (results[0] as number) ?? 0;
}

export async function removeLike(
  userHash: string,
  postId: string,
): Promise<{ count: number; userLikes: number }> {
  const client = getLikesRedis();
  const currentUserLikes = await getUserLikeCount(userHash, postId);

  if (currentUserLikes <= 0) {
    return { count: await getLikeCount(postId), userLikes: 0 };
  }

  const pipeline = client.pipeline();
  pipeline.decr(`${TOTAL_PREFIX}${postId}`);
  pipeline.decr(`${USER_LIKES_PREFIX}${userHash}:${postId}`);

  const results = await pipeline.exec();
  const newCount = Math.max(0, (results[0] as number) ?? 0);
  const newUserLikes = Math.max(0, (results[1] as number) ?? 0);

  if (newUserLikes === 0) {
    await client.srem(`${USERS_PREFIX}${postId}`, userHash);
  }

  return { count: newCount, userLikes: newUserLikes };
}

export async function checkRateLimit(ip: string): Promise<boolean> {
  const client = getLikesRedis();

  try {
    const key = `${RATE_LIMIT_PREFIX}${ip}`;
    const count = await client.incr(key);

    if (count === 1) {
      await client.expire(key, RATE_LIMIT_WINDOW);
    }

    return count > RATE_LIMIT_MAX;
  } catch (error) {
    console.error('[likes] Error checking rate limit:', error);
    return false;
  }
}

export async function getAllLikeCounts(): Promise<Map<string, number>> {
  const client = getLikesRedis();
  const counts = new Map<string, number>();

  let cursor = 0;
  const pattern = `${TOTAL_PREFIX}*`;

  do {
    const [nextCursor, keys] = await client.scan(cursor, { match: pattern, count: 100 });
    cursor = Number(nextCursor);

    if (keys.length > 0) {
      const values = await client.mget<(number | null)[]>(...keys);

      keys.forEach((key, index) => {
        const postId = key.replace(TOTAL_PREFIX, '');
        const count = values[index];

        if (count !== null && count > 0) {
          counts.set(postId, count);
        }
      });
    }
  } while (cursor !== 0);

  return counts;
}

export function getMaxLikesPerUser(): number {
  return MAX_LIKES_PER_USER;
}
