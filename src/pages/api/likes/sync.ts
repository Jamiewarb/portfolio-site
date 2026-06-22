import type { APIRoute } from 'astro';

import { getEnv } from '../../../lib/likes/env';
import { syncLikeCountsToGit } from '../../../lib/likes/git/sync';

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

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? url.searchParams.get('secret');
  const expected = getEnv('LIKES_SYNC_SECRET');

  if (!expected || !token || token !== expected) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const { changed, synced, total } = await syncLikeCountsToGit();

    if (total === 0) {
      return jsonResponse({ message: 'No likes to sync', changed: false, synced: 0, total: 0 });
    }

    return jsonResponse({
      message: changed
        ? 'Likes synced to src/data/likes.json'
        : 'Likes manifest unchanged',
      changed,
      synced,
      total,
    });
  } catch (error) {
    console.error('[likes sync] Error syncing likes:', error);
    return jsonResponse({ error: 'Failed to sync likes' }, 500);
  }
};
