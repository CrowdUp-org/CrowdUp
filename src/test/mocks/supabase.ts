import { vi } from 'vitest';

/**
 * Creates a mock Supabase client for testing.
 * Use this to mock specific queries in your tests.
 *
 * @example
 * ```typescript
 * import { createMockSupabase, mockQueryResult } from '@/test/mocks/supabase';
 * import { supabase } from '@/lib/supabase';
 *
 * vi.mock('@/lib/supabase', () => ({
 *   supabase: createMockSupabase(),
 * }));
 *
 * // In test:
 * mockQueryResult(supabase, 'posts', { id: '1', title: 'Test' });
 * ```
 */
export const createMockSupabase = () => {
  const mockFrom = vi.fn();

  const createChainedMethods = (data: unknown = null, error: unknown = null) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn((resolve) => resolve({ data, error }))
  });

  mockFrom.mockImplementation(() => createChainedMethods());

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } })),
        remove: vi.fn().mockResolvedValue({ data: null, error: null })
      }))
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  };
};

/**
 * Helper to mock a specific query result.
 */
export const mockQueryResult = <T>(
  mockSupabase: ReturnType<typeof createMockSupabase>,
  tableName: string,
  data: T | T[] | null,
  error: { message: string; code?: string } | null = null
) => {
  const chainedMethods = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error }),
    then: vi.fn((resolve) => resolve({ data, error }))
  };

  mockSupabase.from.mockImplementation((table: string) => {
    if (table === tableName) {
      return chainedMethods;
    }
    return {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    };
  });

  return chainedMethods;
};

/**
 * Mock authenticated user for tests.
 */
export const mockAuthenticatedUser = (
  mockSupabase: ReturnType<typeof createMockSupabase>,
  user: { id: string; email?: string; [key: string]: unknown }
) => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user },
    error: null
  });

  mockSupabase.auth.getSession.mockResolvedValue({
    data: {
      session: {
        user,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      }
    },
    error: null
  });
};
