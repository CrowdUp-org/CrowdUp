/**
 * usePost Hook
 *
 * Fetches a single post by ID with loading and error states.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/lib/domain/entities/post';

/**
 * Result of usePost hook.
 */
export interface UsePostResult {
  /** The fetched post or null if not loaded */
  post: Post | null;
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Manually refetch the post */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single post by ID.
 *
 * @param id - Post ID to fetch
 * @returns Post data, loading/error states, and refetch function
 *
 * @example
 * const { post, loading, error, refetch } = usePost(postId);
 */
export function usePost(id: string): UsePostResult {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/posts/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to load post');
      }

      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, loading, error, refetch: fetchPost };
}
