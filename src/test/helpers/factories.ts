/**
 * Test data factories for generating consistent test entities.
 * Use these factories to create test data with sensible defaults.
 */

// Generate UUID using crypto API
const uuid = (): string => crypto.randomUUID();

// Post factory
export const createMockPost = (
  overrides: Partial<MockPost> = {},
): MockPost => ({
  id: uuid(),
  title: "Test Post Title",
  description:
    "This is a detailed test post description for unit testing purposes.",
  post_type: "bug",
  company_id: null,
  app_id: null,
  created_by: uuid(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: "open",
  votes: 0,
  comment_count: 0,
  tags: [],
  priority: "medium",
  image_url: null,
  ...overrides,
});

interface MockPost {
  id: string;
  title: string;
  description: string;
  post_type: "bug" | "feature" | "complaint";
  company_id: string | null;
  app_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  votes: number;
  comment_count: number;
  tags: string[];
  priority: "low" | "medium" | "high" | "critical" | null;
  image_url: string | null;
}

// User factory
export const createMockUser = (
  overrides: Partial<MockUser> = {},
): MockUser => ({
  id: uuid(),
  email: `test-${Date.now()}@example.com`,
  username: `testuser_${Date.now()}`,
  full_name: "Test User",
  avatar_url: null,
  bio: null,
  reputation_score: 0,
  is_verified: false,
  is_admin: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

interface MockUser {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  reputation_score: number;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Vote factory
export const createMockVote = (
  overrides: Partial<MockVote> = {},
): MockVote => ({
  id: uuid(),
  post_id: uuid(),
  user_id: uuid(),
  vote_type: "upvote",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

interface MockVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: "upvote" | "downvote";
  created_at: string;
  updated_at: string;
}

// Comment factory
export const createMockComment = (
  overrides: Partial<MockComment> = {},
): MockComment => ({
  id: uuid(),
  post_id: uuid(),
  user_id: uuid(),
  content: "This is a test comment.",
  parent_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

interface MockComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

// Company factory
export const createMockCompany = (
  overrides: Partial<MockCompany> = {},
): MockCompany => ({
  id: uuid(),
  name: "Test Company",
  slug: "test-company",
  description: "A test company for unit testing.",
  logo_url: null,
  website_url: null,
  is_verified: false,
  created_by: uuid(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

interface MockCompany {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_verified: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Application factory
export const createMockApp = (overrides: Partial<MockApp> = {}): MockApp => ({
  id: uuid(),
  name: "Test App",
  slug: "test-app",
  description: "A test application for unit testing.",
  logo_url: null,
  website_url: null,
  company_id: null,
  is_verified: false,
  created_by: uuid(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

interface MockApp {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  company_id: string | null;
  is_verified: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Message factory
export const createMockMessage = (
  overrides: Partial<MockMessage> = {},
): MockMessage => ({
  id: uuid(),
  sender_id: uuid(),
  receiver_id: uuid(),
  content: "Hello, this is a test message.",
  is_read: false,
  created_at: new Date().toISOString(),
  ...overrides,
});

interface MockMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Notification factory
export const createMockNotification = (
  overrides: Partial<MockNotification> = {},
): MockNotification => ({
  id: uuid(),
  user_id: uuid(),
  type: "vote",
  title: "New notification",
  message: "You received a notification.",
  is_read: false,
  reference_id: null,
  reference_type: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

interface MockNotification {
  id: string;
  user_id: string;
  type: "vote" | "comment" | "follow" | "mention" | "system";
  title: string;
  message: string;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

// Helper to create multiple entities
export const createMockPosts = (
  count: number,
  overrides: Partial<MockPost> = {},
): MockPost[] =>
  Array.from({ length: count }, (_, i) =>
    createMockPost({
      title: `Test Post ${i + 1}`,
      ...overrides,
    }),
  );

export const createMockUsers = (
  count: number,
  overrides: Partial<MockUser> = {},
): MockUser[] =>
  Array.from({ length: count }, (_, i) =>
    createMockUser({
      username: `testuser_${i + 1}`,
      email: `test${i + 1}@example.com`,
      ...overrides,
    }),
  );
