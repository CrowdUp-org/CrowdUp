/**
 * useUser Hook
 *
 * Fetches user profile data by username.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type { PublicUser } from "@/lib/domain/entities/user";

/**
 * Result of useUser hook.
 */
export interface UseUserResult {
  /** The fetched user or null if not loaded */
  user: PublicUser | null;
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Manually refetch the user */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a user profile by username.
 *
 * @param username - Username to fetch
 * @returns User data, loading/error states, and refetch function
 *
 * @example
 * const { user, loading, error } = useUser(username);
 */
export function useUser(username: string): UseUserResult {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Failed to load user");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

/**
 * Hook for fetching the current authenticated user's profile.
 *
 * @returns User data, loading/error states, and refetch function
 *
 * @example
 * const { user, loading } = useCurrentUser();
 */
export function useCurrentUser(): UseUserResult {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/me");

      if (response.status === 401) {
        // Not authenticated - not an error, just no user
        setUser(null);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Failed to load profile");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return { user, loading, error, refetch: fetchCurrentUser };
}
