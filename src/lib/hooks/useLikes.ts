import { useCallback, useEffect, useRef, useState } from 'react';

import { decrementLike, fetchLikeData, incrementLike } from '../likes/api';
import { INITIAL_LIKE_DATA, MAX_LIKES_PER_USER, type LikeData } from '../likes/constants';

export function useLikes(postId: string, initialCount = 0) {
  const [data, setData] = useState<LikeData>({
    ...INITIAL_LIKE_DATA,
    count: initialCount,
  });
  const [isLoading, setIsLoading] = useState(true);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let cancelled = false;

    fetchLikeData(postId)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Error fetching likes:', error);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const addLike = useCallback(async () => {
    const current = dataRef.current;
    if (!current.canLike) return;

    const optimisticData: LikeData = {
      count: current.count + 1,
      userLikes: current.userLikes + 1,
      hasLiked: true,
      canLike: current.userLikes + 1 < MAX_LIKES_PER_USER,
    };

    const previousData = current;
    setData(optimisticData);

    try {
      const result = await incrementLike(postId, previousData);
      setData(result);
    } catch (error) {
      console.error('Error adding like:', error);
      setData(previousData);
    }
  }, [postId]);

  const removeLike = useCallback(async () => {
    const current = dataRef.current;
    if (current.userLikes <= 0) return;

    const newUserLikes = current.userLikes - 1;
    const optimisticData: LikeData = {
      count: Math.max(0, current.count - 1),
      userLikes: newUserLikes,
      hasLiked: newUserLikes > 0,
      canLike: true,
    };

    const previousData = current;
    setData(optimisticData);

    try {
      const result = await decrementLike(postId, previousData);
      setData(result);
    } catch (error) {
      console.error('Error removing like:', error);
      setData(previousData);
    }
  }, [postId]);

  return {
    count: data.count,
    userLikes: data.userLikes,
    hasLiked: data.hasLiked,
    canLike: data.canLike,
    isLoading,
    addLike,
    removeLike,
  };
}
