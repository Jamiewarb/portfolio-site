import likesManifest from '../../data/likes.json';
import type { LikesManifest } from './git/types';

const manifest = likesManifest as LikesManifest;

export function getArchivedLikeCount(postId: string): number {
  return manifest.posts[postId] ?? 0;
}
