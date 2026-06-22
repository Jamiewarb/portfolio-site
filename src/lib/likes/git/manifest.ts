import { readFileSync, writeFileSync } from 'node:fs';

import { EMPTY_LIKES_MANIFEST, type LikesManifest } from './types';
import { LIKES_JSON_PATH } from './path';

function sortPosts(posts: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(posts).sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function readLikesManifest(): LikesManifest {
  try {
    const raw = readFileSync(LIKES_JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<LikesManifest>;

    return {
      syncedAt: parsed.syncedAt ?? EMPTY_LIKES_MANIFEST.syncedAt,
      posts: sortPosts(parsed.posts ?? {}),
    };
  } catch {
    return { ...EMPTY_LIKES_MANIFEST, posts: {} };
  }
}

export function buildLikesManifest(likeCounts: Map<string, number>): LikesManifest {
  const posts: Record<string, number> = {};

  for (const [postId, count] of likeCounts) {
    if (count > 0) {
      posts[postId] = count;
    }
  }

  return {
    syncedAt: new Date().toISOString(),
    posts: sortPosts(posts),
  };
}

export function postsEqual(
  left: Record<string, number>,
  right: Record<string, number>,
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
}

export function writeLikesManifest(manifest: LikesManifest): void {
  writeFileSync(LIKES_JSON_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
