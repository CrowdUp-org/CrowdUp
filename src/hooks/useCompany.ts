/**
 * useCompany Hook
 *
 * Fetches company data by name/slug.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Company } from '@/lib/domain/entities/company';

/**
 * Result of useCompany hook.
 */
export interface UseCompanyResult {
  /** The fetched company or null if not loaded */
  company: Company | null;
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Manually refetch the company */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a company by name/slug.
 *
 * @param name - Company name/slug to fetch
 * @returns Company data, loading/error states, and refetch function
 *
 * @example
 * const { company, loading, error } = useCompany('apple');
 */
export function useCompany(name: string): UseCompanyResult {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!name) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/companies/${encodeURIComponent(name)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to load company');
      }

      const data = await response.json();
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return { company, loading, error, refetch: fetchCompany };
}

/**
 * Result of useCompanies hook.
 */
export interface UseCompaniesResult {
  /** Array of companies */
  companies: Company[];
  /** Loading state */
  loading: boolean;
  /** Error message or null */
  error: string | null;
  /** Whether more companies are available */
  hasMore: boolean;
  /** Load more companies */
  loadMore: () => Promise<void>;
  /** Refresh the list */
  refresh: () => Promise<void>;
}

/**
 * Options for useCompanies hook.
 */
export interface UseCompaniesOptions {
  /** Number of companies per page (default: 20) */
  limit?: number;
  /** Filter by category */
  category?: string;
  /** Search query */
  search?: string;
  /** Skip initial fetch */
  skip?: boolean;
}

/**
 * Hook for fetching a list of companies with pagination.
 *
 * @param options - Configuration options
 * @returns Companies data, loading/error states, and pagination controls
 *
 * @example
 * const { companies, loading, loadMore } = useCompanies({ limit: 10 });
 */
export function useCompanies(options: UseCompaniesOptions = {}): UseCompaniesResult {
  const { limit = 20, category, search, skip = false } = options;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchCompanies = useCallback(
    async (currentOffset: number, append = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(currentOffset),
        });

        if (category) params.set('category', category);
        if (search) params.set('search', search);

        const response = await fetch(`/api/companies?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? 'Failed to load companies');
        }

        const data: Company[] = await response.json();

        if (append) {
          setCompanies((prev) => [...prev, ...data]);
        } else {
          setCompanies(data);
        }

        setHasMore(data.length === limit);
        setOffset(currentOffset + data.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (!append) {
          setCompanies([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [limit, category, search]
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchCompanies(offset, true);
  }, [loading, hasMore, offset, fetchCompanies]);

  const refresh = useCallback(async () => {
    setOffset(0);
    setHasMore(true);
    await fetchCompanies(0, false);
  }, [fetchCompanies]);

  useEffect(() => {
    if (!skip) {
      setOffset(0);
      setHasMore(true);
      fetchCompanies(0, false);
    }
  }, [skip, category, search, fetchCompanies]);

  return { companies, loading, error, hasMore, loadMore, refresh };
}
