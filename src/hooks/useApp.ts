/**
 * useApp Hook
 *
 * Fetches app/product data by ID.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { App } from '@/lib/domain/entities/app';

/**
 * Result of useApp hook.
 */
export interface UseAppResult {
  /** The fetched app or null if not loaded */
  app: App | null;
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Manually refetch the app */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching an app by ID.
 *
 * @param id - App ID to fetch
 * @returns App data, loading/error states, and refetch function
 *
 * @example
 * const { app, loading, error } = useApp(appId);
 */
export function useApp(id: string): UseAppResult {
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApp = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/apps/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to load app');
      }

      const data = await response.json();
      setApp(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApp();
  }, [fetchApp]);

  return { app, loading, error, refetch: fetchApp };
}

/**
 * Result of useApps hook.
 */
export interface UseAppsResult {
  /** Array of apps */
  apps: App[];
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Whether more apps are available */
  hasMore: boolean;
  /** Load more apps */
  loadMore: () => Promise<void>;
  /** Refresh the list */
  refresh: () => Promise<void>;
}

/**
 * Options for useApps hook.
 */
export interface UseAppsOptions {
  /** Number of apps per page (default: 20) */
  limit?: number;
  /** Filter by company ID */
  companyId?: string;
  /** Filter by category */
  category?: string;
  /** Search query */
  search?: string;
  /** Get top-rated apps */
  topRated?: boolean;
  /** Skip initial fetch */
  skip?: boolean;
}

/**
 * Hook for fetching a list of apps with pagination.
 *
 * @param options - Configuration options
 * @returns Apps data, loading/error states, and pagination controls
 *
 * @example
 * const { apps, loading, loadMore } = useApps({ companyId: 'abc' });
 */
export function useApps(options: UseAppsOptions = {}): UseAppsResult {
  const { limit = 20, companyId, category, search, topRated, skip = false } = options;

  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchApps = useCallback(
    async (currentOffset: number, append = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(currentOffset),
        });

        if (companyId) params.set('companyId', companyId);
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        if (topRated) params.set('topRated', 'true');

        const response = await fetch(`/api/apps?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? 'Failed to load apps');
        }

        const data: App[] = await response.json();

        if (append) {
          setApps((prev) => [...prev, ...data]);
        } else {
          setApps(data);
        }

        setHasMore(data.length === limit);
        setOffset(currentOffset + data.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (!append) {
          setApps([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [limit, companyId, category, search, topRated]
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchApps(offset, true);
  }, [loading, hasMore, offset, fetchApps]);

  const refresh = useCallback(async () => {
    setOffset(0);
    setHasMore(true);
    await fetchApps(0, false);
  }, [fetchApps]);

  useEffect(() => {
    if (!skip) {
      setOffset(0);
      setHasMore(true);
      fetchApps(0, false);
    }
  }, [skip, companyId, category, search, topRated, fetchApps]);

  return { apps, loading, error, hasMore, loadMore, refresh };
}
