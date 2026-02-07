/**
 * useComments Hook
 *
 * Fetches comments for a post with pagination and mutation support.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Comment } from "@/lib/domain/entities/comment";

/**
 * Options for useComments hook.
 */
export interface UseCommentsOptions {
  /** Number of comments per page (default: 50) */
  limit?: number;
  /** Sort order (default: ascending - oldest first) */
  ascending?: boolean;
  /** Skip initial fetch */
  skip?: boolean;
}

/**
 * Result of useComments hook.
 */
export interface UseCommentsResult {
  /** Array of comments */
  comments: Comment[];
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Whether more comments are available */
  hasMore: boolean;
  /** Load more comments */
  loadMore: () => Promise<void>;
  /** Refresh the list */
  refresh: () => Promise<void>;
  /** Add a new comment */
  addComment: (content: string) => Promise<Comment | null>;
  /** Adding comment loading state */
  adding: boolean;
  /** Total comment count */
  totalCount: number;
}

/**
 * Hook for fetching and managing comments on a post.
 *
 * @param postId - Parent post ID
 * @param options - Configuration options
 * @returns Comments data, loading/error states, and mutation functions
 *
 * @example
 * const { comments, loading, addComment, adding } = useComments(postId);
 */
export function useComments(
  postId: string,
  options: UseCommentsOptions = {},
): UseCommentsResult {
  const { limit = 50, ascending = true, skip = false } = options;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [adding, setAdding] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComments = useCallback(
    async (currentOffset: number, append = false) => {
      if (!postId) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          postId,
          limit: String(limit),
          offset: String(currentOffset),
          ascending: String(ascending),
        });

        const response = await fetch(`/api/comments?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? "Failed to load comments");
        }

        const data = await response.json();
        const fetchedComments: Comment[] = data.comments ?? data;
        const count =
          typeof data.total === "number" ? data.total : fetchedComments.length;

        if (append) {
          setComments((prev) => [...prev, ...fetchedComments]);
        } else {
          setComments(fetchedComments);
          setTotalCount(count);
        }

        setHasMore(fetchedComments.length === limit);
        setOffset(currentOffset + fetchedComments.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        if (!append) {
          setComments([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [postId, limit, ascending],
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchComments(offset, true);
  }, [loading, hasMore, offset, fetchComments]);

  const refresh = useCallback(async () => {
    setOffset(0);
    setHasMore(true);
    await fetchComments(0, false);
  }, [fetchComments]);

  const addComment = useCallback(
    async (content: string): Promise<Comment | null> => {
      if (!postId || !content.trim()) return null;

      setAdding(true);
      setError(null);

      try {
        const response = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, content }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? "Failed to add comment");
        }

        const newComment: Comment = await response.json();

        // Add to list (at end for ascending, at start for descending)
        setComments((prev) =>
          ascending ? [...prev, newComment] : [newComment, ...prev],
        );
        setTotalCount((prev) => prev + 1);

        return newComment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add comment");
        return null;
      } finally {
        setAdding(false);
      }
    },
    [postId, ascending],
  );

  useEffect(() => {
    if (!skip && postId) {
      fetchComments(0, false);
    }
  }, [skip, postId, fetchComments]);

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    addComment,
    adding,
    totalCount,
  };
}
