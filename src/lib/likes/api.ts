import type { LikeData } from './constants';

async function parseLikeResponse(response: Response): Promise<LikeData> {
  if (!response.ok) {
    throw new Error(`Likes API request failed with status ${response.status}`);
  }

  return response.json() as Promise<LikeData>;
}

export async function fetchLikeData(postId: string): Promise<LikeData> {
  const response = await fetch(`/api/likes/${encodeURIComponent(postId)}`);
  return parseLikeResponse(response);
}

export async function incrementLike(postId: string, _current: LikeData): Promise<LikeData> {
  const response = await fetch(`/api/likes/${encodeURIComponent(postId)}`, {
    method: 'POST',
  });
  return parseLikeResponse(response);
}

export async function decrementLike(postId: string, _current: LikeData): Promise<LikeData> {
  const response = await fetch(`/api/likes/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });
  return parseLikeResponse(response);
}
