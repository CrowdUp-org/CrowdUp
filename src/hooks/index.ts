/**
 * Custom Hooks
 *
 * Barrel export for all presentation layer hooks.
 */

// Post hooks
export { usePost, type UsePostResult } from './usePost';
export {
  usePosts,
  type UsePostsResult,
  type UsePostsOptions,
  type PostsFilter,
} from './usePosts';

// Vote hooks
export { useVote, type UseVoteResult } from './useVote';

// Comment hooks
export {
  useComments,
  type UseCommentsResult,
  type UseCommentsOptions,
} from './useComments';

// User hooks
export { useUser, useCurrentUser, type UseUserResult } from './useUser';

// Company hooks
export {
  useCompany,
  useCompanies,
  type UseCompanyResult,
  type UseCompaniesResult,
  type UseCompaniesOptions,
} from './useCompany';

// App hooks
export {
  useApp,
  useApps,
  type UseAppResult,
  type UseAppsResult,
  type UseAppsOptions,
} from './useApp';
