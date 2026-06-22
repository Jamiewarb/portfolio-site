import { MAX_LIKES_PER_USER, type LikeData } from './constants';
import {
  addLike,
  checkRateLimit,
  getLikeCount,
  getMaxLikesPerUser,
  getUserLikeCount,
  hasUserLiked,
  removeLike,
} from './redis';

export class LikesRateLimitError extends Error {
  constructor() {
    super('Rate limit exceeded. Try again later.');
    this.name = 'LikesRateLimitError';
  }
}

export async function getLikeData(postId: string, userHash: string): Promise<LikeData> {
  const [count, userLikes, liked] = await Promise.all([
    getLikeCount(postId),
    getUserLikeCount(userHash, postId),
    hasUserLiked(userHash, postId),
  ]);

  return {
    count,
    userLikes,
    hasLiked: liked,
    canLike: userLikes < MAX_LIKES_PER_USER,
  };
}

export async function incrementLike(
  postId: string,
  userHash: string,
  ip: string,
): Promise<LikeData> {
  if (await checkRateLimit(ip)) {
    throw new LikesRateLimitError();
  }

  const maxLikes = getMaxLikesPerUser();
  const userLikes = await getUserLikeCount(userHash, postId);

  if (userLikes >= maxLikes) {
    return getLikeData(postId, userHash);
  }

  const newCount = await addLike(userHash, postId);

  return {
    count: newCount,
    userLikes: userLikes + 1,
    hasLiked: true,
    canLike: userLikes + 1 < maxLikes,
  };
}

export async function decrementLike(
  postId: string,
  userHash: string,
  ip: string,
): Promise<LikeData> {
  if (await checkRateLimit(ip)) {
    throw new LikesRateLimitError();
  }

  const userLikes = await getUserLikeCount(userHash, postId);

  if (userLikes <= 0) {
    return getLikeData(postId, userHash);
  }

  const { count: newCount, userLikes: newUserLikes } = await removeLike(userHash, postId);
  const maxLikes = getMaxLikesPerUser();

  return {
    count: newCount,
    userLikes: newUserLikes,
    hasLiked: newUserLikes > 0,
    canLike: newUserLikes < maxLikes,
  };
}
