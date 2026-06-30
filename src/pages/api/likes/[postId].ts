import type { APIRoute } from 'astro';

import { INITIAL_LIKE_DATA } from '../../../lib/likes/constants';
import { isLikesEnabled } from '../../../lib/likes/config';
import {
  decrementLike,
  getLikeData,
  incrementLike,
  LikesRateLimitError,
} from '../../../lib/likes/store';
import { getClientIp, hashUserIp } from '../../../lib/likes/user-hash';

export const prerender = false;

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

export const GET: APIRoute = async ({ params, request }) => {
  const postId = params.postId;

  if (!postId) {
    return errorResponse('Missing post ID', 400);
  }

  if (!isLikesEnabled()) {
    return jsonResponse(INITIAL_LIKE_DATA);
  }

  try {
    const userHash = hashUserIp(getClientIp(request));
    const data = await getLikeData(postId, userHash);
    return jsonResponse(data);
  } catch (error) {
    console.error('[likes] GET failed:', error);
    return errorResponse('Failed to load likes', 500);
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const postId = params.postId;

  if (!postId) {
    return errorResponse('Missing post ID', 400);
  }

  if (!isLikesEnabled()) {
    return jsonResponse(INITIAL_LIKE_DATA);
  }

  try {
    const ip = getClientIp(request);
    const userHash = hashUserIp(ip);
    const data = await incrementLike(postId, userHash, ip);
    return jsonResponse(data);
  } catch (error) {
    if (error instanceof LikesRateLimitError) {
      return errorResponse(error.message, 429);
    }

    console.error('[likes] POST failed:', error);
    return errorResponse('Failed to increment like', 500);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const postId = params.postId;

  if (!postId) {
    return errorResponse('Missing post ID', 400);
  }

  if (!isLikesEnabled()) {
    return jsonResponse(INITIAL_LIKE_DATA);
  }

  try {
    const ip = getClientIp(request);
    const userHash = hashUserIp(ip);
    const data = await decrementLike(postId, userHash, ip);
    return jsonResponse(data);
  } catch (error) {
    if (error instanceof LikesRateLimitError) {
      return errorResponse(error.message, 429);
    }

    console.error('[likes] DELETE failed:', error);
    return errorResponse('Failed to decrement like', 500);
  }
};
