import { getAllLikeCounts } from '../redis';
import {
  buildLikesManifest,
  postsEqual,
  readLikesManifest,
  writeLikesManifest,
} from './manifest';

export interface GitSyncResult {
  changed: boolean;
  synced: number;
  total: number;
}

export async function syncLikeCountsToGit(): Promise<GitSyncResult> {
  const likeCounts = await getAllLikeCounts();
  const current = readLikesManifest();
  const next = buildLikesManifest(likeCounts);

  if (postsEqual(current.posts, next.posts)) {
    return {
      changed: false,
      synced: 0,
      total: likeCounts.size,
    };
  }

  writeLikesManifest(next);

  return {
    changed: true,
    synced: Object.keys(next.posts).length,
    total: likeCounts.size,
  };
}
