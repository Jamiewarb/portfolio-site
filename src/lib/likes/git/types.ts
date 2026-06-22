export interface LikesManifest {
  syncedAt: string;
  posts: Record<string, number>;
}

export const EMPTY_LIKES_MANIFEST: LikesManifest = {
  syncedAt: '1970-01-01T00:00:00.000Z',
  posts: {},
};
