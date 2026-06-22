export const MAX_LIKES_PER_USER = 16;

export interface LikeData {
  count: number;
  userLikes: number;
  hasLiked: boolean;
  canLike: boolean;
}

export const INITIAL_LIKE_DATA: LikeData = {
  count: 0,
  userLikes: 0,
  hasLiked: false,
  canLike: true,
};
