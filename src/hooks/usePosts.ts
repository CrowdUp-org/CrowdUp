/**
 * usePosts Hook
 *
 * Fetches a list of posts with pagination support.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Post } from "@/lib/domain/entities/post";

/**
 * Filter options for posts query.
 */
export interface PostsFilter {
  /** Filter by company */
  company?: string;
  /** Filter by app ID */
  appId?: string;
  /** Filter by user ID */
  userId?: string;
  /** Filter by post type */
  type?: string;
  /** Fetch trending posts */
  trending?: boolean;
}

/**
 * Options for usePosts hook.
 */
export interface UsePostsOptions {
  /** Number of posts per page (default: 20) */
  limit?: number;
  /** Initial offset (default: 0) */
  initialOffset?: number;
  /** Filter options */
  filter?: PostsFilter;
  /** Skip initial fetch */
  skip?: boolean;
}

/**
 * Result of usePosts hook.
 */
export interface UsePostsResult {
  /** Array of posts */
  posts: Post[];
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Whether more posts are available */
  hasMore: boolean;
  /** Load more posts */
  loadMore: () => Promise<void>;
  /** Refresh the list (reset to first page) */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching a list of posts with pagination.
 *
 * @param options - Configuration options
 * @returns Posts data, loading/error states, and pagination controls
 *
 * @example
 * const { posts, loading, loadMore, hasMore } = usePosts({ limit: 10 });
 */
export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
  const { limit = 20, initialOffset = 0, filter, skip = false } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);

  const buildQueryString = useCallback(
    (currentOffset: number) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(currentOffset));

      if (filter?.company) params.set("company", filter.company);
      if (filter?.appId) params.set("appId", filter.appId);
      if (filter?.userId) params.set("userId", filter.userId);
      if (filter?.type) params.set("type", filter.type);
      if (filter?.trending) params.set("trending", "true");

      return params.toString();
    },
    [limit, filter],
  );

  const fetchPosts = useCallback(
    async (currentOffset: number, append = false) => {
      try {
        setLoading(true);
        setError(null);

        const query = buildQueryString(currentOffset);
        const response = await fetch(`/api/posts?${query}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? "Failed to load posts");
        }

        const data: Post[] = await response.json();

        if (append) {
          setPosts((prev) => [...prev, ...data]);
        } else {
          setPosts(data);
        }

        setHasMore(data.length === limit);
        setOffset(currentOffset + data.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        if (!append) {
          setPosts([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [buildQueryString, limit],
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchPosts(offset, true);
  }, [loading, hasMore, offset, fetchPosts]);

  const refresh = useCallback(async () => {
    setOffset(0);
    setHasMore(true);
    await fetchPosts(0, false);
  }, [fetchPosts]);

  useEffect(() => {
    if (!skip) {
      fetchPosts(initialOffset, false);
    }
  }, [skip, initialOffset, fetchPosts]);

  return { posts, loading, error, hasMore, loadMore, refresh };
}
