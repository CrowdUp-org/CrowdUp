/**
 * useVote Hook
 *
 * Manages vote state with optimistic updates.
 */
'use client';

import { useState, useCallback } from 'react';
import type { VoteType } from '@/lib/domain/entities/vote';

/**
 * Result of useVote hook.
 */
export interface UseVoteResult {
  /** Current user vote (null if not voted) */
  currentVote: VoteType | null;
  /** Net vote count */
  voteCount: number;
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Toggle vote (up or down) */
  toggleVote: (voteType: VoteType) => Promise<void>;
  /** Clear any error */
  clearError: () => void;
}

/**
 * Hook for managing vote state with optimistic updates.
 *
 * @param postId - Target post ID
 * @param initialVote - User's current vote (null if none)
 * @param initialVoteCount - Initial net vote count
 * @returns Vote state, actions, and loading/error states
 *
 * @example
 * const { currentVote, voteCount, toggleVote, loading } = useVote(
 *   postId,
 *   userVote,
 *   post.votes
 * );
 *
 * <button onClick={() => toggleVote('up')} disabled={loading}>
 *   👍 {voteCount}
 * </button>
 */
export function useVote(
  postId: string,
  initialVote: VoteType | null = null,
  initialVoteCount = 0
): UseVoteResult {
  const [currentVote, setCurrentVote] = useState<VoteType | null>(initialVote);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleVote = useCallback(
    async (voteType: VoteType) => {
      const previousVote = currentVote;
      const previousCount = voteCount;

      // Optimistic update
      const newVote = currentVote === voteType ? null : voteType;
      setCurrentVote(newVote);

      // Calculate optimistic vote count change
      let countChange = 0;
      if (previousVote === null) {
        // No previous vote → adding new vote
        countChange = voteType === 'up' ? 1 : -1;
      } else if (newVote === null) {
        // Removing vote
        countChange = previousVote === 'up' ? -1 : 1;
      } else {
        // Switching vote
        countChange = voteType === 'up' ? 2 : -2;
      }
      setVoteCount(previousCount + countChange);

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, voteType }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? 'Failed to vote');
        }

        const result = await response.json();

        // Update with actual server values
        if (result.action === 'removed') {
          setCurrentVote(null);
        } else if (result.vote) {
          setCurrentVote(result.vote.voteType);
        }

        // Use server's authoritative vote count
        if (typeof result.netVotes === 'number') {
          setVoteCount(result.netVotes);
        }
      } catch (err) {
        // Rollback on error
        setCurrentVote(previousVote);
        setVoteCount(previousCount);
        setError(err instanceof Error ? err.message : 'Vote failed');
      } finally {
        setLoading(false);
      }
    },
    [postId, currentVote, voteCount]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { currentVote, voteCount, loading, error, toggleVote, clearError };
}
