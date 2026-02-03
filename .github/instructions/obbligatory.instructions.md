---
applyTo: '**'
---
# CrowdUp: Social Feedback & Reputation Platform

## Project Vision

**CrowdUp** is a modern social feedback and reputation system where users report bugs, request features, or file complaints against Companies/Products. The core loop is built on a **Voting System (Upvote/Downvote)** and **User Reputation**, creating a trust-based community-driven quality improvement engine.

**Tagline:** "Your voice matters. Your vote creates impact. Your reputation builds trust."

---

## Architecture & Stack

### Core Technologies
- **Frontend:** Next.js 15 (App Router) + React 19
- **Backend:** Next.js 15 Server Components + Server Actions
- **Database:** Supabase (PostgreSQL 15+)
- **Auth:** Supabase Auth (OAuth + Magic Links)
- **Security:** Row Level Security (RLS) + JWT tokens
- **API Layer:** tRPC v11 (optional, for type-safe RPC)
- **Styling:** Tailwind CSS + Shadcn/ui (if using)
- **Testing:** Vitest + Playwright E2E
- **Type Safety:** TypeScript 5+ with strict mode

### Repository Structure
```
crowdup/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup)
│   ├── (platform)/               # Main app routes
│   │   ├── dashboard/            # User dashboard
│   │   ├── issues/               # Issue listing/detail
│   │   ├── companies/            # Company profiles
│   │   └── api/                  # Internal API routes
│   └── layout.tsx
├── components/                   # Reusable React components
│   ├── common/                   # Shared (navbar, footer)
│   ├── features/                 # Feature-specific (voting, auth)
│   └── ui/                       # Design system (buttons, cards)
├── lib/                          # Utilities
│   ├── db/                       # Database queries + RLS
│   ├── auth/                     # Auth utilities
│   ├── vote/                     # Voting logic
│   ├── reputation/               # Reputation calculation
│   └── types/                    # Global TypeScript types
├── hooks/                        # React hooks
├── store/                        # State management (Zustand/Jotai)
├── .github/
│   ├── copilot-instructions.md   # THIS FILE
│   └── workflows/                # GitHub Actions
└── prisma/ OR migrations/        # DB schema (if using Prisma)
```

---

## Core Domain Concepts

### 1. Issues/Reports
An **Issue** is any user-generated report on a Company/Product. Can be:
- **Bug Report:** Something is broken
- **Feature Request:** Suggestion for improvement
- **Complaint/Claim:** Allegation or quality concern

```typescript
// Core Issue type
type Issue = {
  id: string;
  title: string;
  description: string;
  issueType: 'bug' | 'feature' | 'complaint';
  companyId: string;
  createdBy: string; // userId
  createdAt: Date;
  
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  upvotes: number;
  downvotes: number;
  net_votes: number; // upvotes - downvotes
  
  tags: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}
```

### 2. Voting System
Users **upvote** or **downvote** issues. Votes are:
- **Idempotent:** One vote per user per issue (togglable)
- **Immutable:** Vote history is tracked
- **Transparent:** Vote count visible to all users

```typescript
type Vote = {
  id: string;
  issueId: string;
  userId: string;
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
  updatedAt: Date;
  
  // Composite unique constraint: (issueId, userId) ensures one vote per user
}
```

### 3. User Reputation
Reputation is calculated based on:
- **Quality Votes:** Upvotes on user's reported issues
- **Trust Score:** Ratio of helpful votes to total votes
- **Activity:** Number of reports, comments, engagement
- **Verification:** Email verified? KYC done?

```typescript
type UserReputation = {
  userId: string;
  reputationScore: number; // 0-100
  issuesCreated: number;
  helpfulVotes: number;      // upvotes on their issues
  communityTrust: number;    // calculated metric
  
  // Badges
  badges: ('trusted' | 'verified' | 'contributor' | 'expert')[];
}
```

### 4. Companies/Products
Targets of feedback:
- Profile with bio, category, website
- Aggregate stats (total issues, avg rating)
- Team members who can claim/respond

---

## Development Conventions

### Frontend Conventions

#### Server Components vs Client Components
**Default to Server Components for:**
- Initial data fetching
- Database queries (leverage RLS)
- Secrets/API keys (safe server-side)
- Heavy computations

```typescript
// app/issues/page.tsx - SERVER COMPONENT (default)
export default async function IssuesPage() {
  // ✅ Safe: Direct DB access with RLS
  const issues = await getIssuesForUser();
  return <IssuesList issues={issues} />;
}
```

**Use Client Components ONLY for:**
- Interactivity (clicks, forms, real-time)
- State management (filters, cart, preferences)
- Browser APIs (localStorage, geolocation)
- Event handlers

```typescript
// components/IssueCard.tsx - CLIENT COMPONENT
'use client';

import { handleUpvote } from '@/app/actions/votes';

export function IssueCard({ issue }: { issue: Issue }) {
  const handleClick = async () => {
    const result = await handleUpvote(issue.id);
    // optimistic update or refetch
  };
  return (
    <div onClick={handleClick}>
      {/* interactive UI */}
    </div>
  );
}
```

#### Component Patterns
```typescript
// ✅ GOOD: Isolated, testable component
interface IssueVoteProps {
  issueId: string;
  currentVote?: 'upvote' | 'downvote' | null;
  upvoteCount: number;
  downvoteCount: number;
  onVoteChange?: (voteType: 'upvote' | 'downvote' | null) => void;
}

export const IssueVote = ({
  issueId,
  currentVote,
  upvoteCount,
  downvoteCount,
  onVoteChange,
}: IssueVoteProps) => {
  return (
    <div className="flex gap-2">
      <button onClick={() => onVoteChange?.('upvote')}>
        👍 {upvoteCount}
      </button>
      <button onClick={() => onVoteChange?.('downvote')}>
        👎 {downvoteCount}
      </button>
    </div>
  );
};
```

### Database Conventions

#### Row Level Security (RLS) is MANDATORY
Every query MUST respect RLS:

```sql
-- Table: votes
-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users can see their own votes
CREATE POLICY votes_select_own ON votes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create votes for themselves
CREATE POLICY votes_insert_own ON votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own votes
CREATE POLICY votes_update_own ON votes
  FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Query Examples (Supabase + TypeScript)
```typescript
// ✅ GOOD: Explicit fields, parameterized, RLS-aware
const getVoteStatus = async (issueId: string, userId: string) => {
  const { data, error } = await supabase
    .from('votes')
    .select('id, voteType')
    .eq('issueId', issueId)
    .eq('userId', userId)
    .single(); // Throws if not found
  
  return data || null;
};

// ❌ BAD: SELECT *, vulnerable, no RLS context
const votes = await supabase.from('votes').select();
```

#### Database Schema (SQL)
```sql
-- Issues table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  issue_type VARCHAR(20) NOT NULL, -- 'bug', 'feature', 'complaint'
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  net_votes INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
  
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority VARCHAR(20),
  
  CONSTRAINT issue_title_not_empty CHECK (title != ''),
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

-- Votes table (Idempotent: one vote per user per issue)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type VARCHAR(20) NOT NULL, -- 'upvote' or 'downvote'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(issue_id, user_id), -- Enforce one vote per user
  CONSTRAINT valid_vote_type CHECK (vote_type IN ('upvote', 'downvote'))
);

-- User Reputation table
CREATE TABLE user_reputation (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  reputation_score INTEGER DEFAULT 0, -- 0-100
  issues_created INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  community_trust DECIMAL(3, 2) DEFAULT 0, -- 0-1.0
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_issues_company ON issues(company_id);
CREATE INDEX idx_issues_created_by ON issues(created_by);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX idx_votes_issue ON votes(issue_id);
CREATE INDEX idx_votes_user ON votes(user_id);
```

### API Conventions

#### Server Actions (Next.js 15)
All mutations use Server Actions for security and RLS context:

```typescript
// app/actions/votes.ts
'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const toggleVote = async (
  issueId: string,
  voteType: 'upvote' | 'downvote'
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServerComponentClient({ cookies });
  
  // Get current user (RLS context is automatic)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  // Check if vote exists
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id, voteType')
    .eq('issueId', issueId)
    .eq('userId', user.id)
    .single();

  if (existingVote) {
    // Toggle: same vote type = remove, different = update
    if (existingVote.voteType === voteType) {
      await supabase.from('votes').delete().eq('id', existingVote.id);
      return { success: true, message: 'Vote removed' };
    } else {
      await supabase
        .from('votes')
        .update({ voteType })
        .eq('id', existingVote.id);
      return { success: true, message: 'Vote updated' };
    }
  } else {
    // New vote
    const { error } = await supabase.from('votes').insert({
      issueId,
      userId: user.id,
      voteType,
    });
    if (error) throw error;
    return { success: true, message: 'Vote created' };
  }
};
```

#### API Route Handlers (for external integrations)
```typescript
// app/api/votes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Verify session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { issueId, voteType } = await request.json();

  try {
    const result = await toggleVote(issueId, voteType);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

---

## Code Quality Standards

### TypeScript Strictness
- `strict: true` in tsconfig.json
- No `any` types (use `unknown` if truly dynamic)
- All DB queries typed with generated types (if using Prisma/Drizzle)

```typescript
// ❌ Avoid
const issue: any = data;

// ✅ Good
const issue: Issue = data;
```

### Naming Conventions
- Database columns: `snake_case` (issue_id, user_id, vote_type)
- TypeScript variables: `camelCase` (issueId, userId, voteType)
- Types/Interfaces: `PascalCase` (Issue, User, Vote)
- Enums: `PascalCase` with UPPER_SNAKE_CASE values (VoteType.UPVOTE)

```typescript
type Vote = {
  id: string;           // camelCase
  issue_id: string;     // ✅ From database, keep snake_case
  userId: string;       // camelCase (parsed from DB)
  voteType: 'upvote' | 'downvote';
};
```

### Error Handling
All async operations must handle errors explicitly:

```typescript
// ❌ Bad
const vote = await toggleVote(issueId, voteType);

// ✅ Good
try {
  const vote = await toggleVote(issueId, voteType);
} catch (error) {
  if (error instanceof VotingError) {
    // Handle voting-specific errors
    console.error(`Voting failed: ${error.message}`);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error', error);
  }
}
```

### Logging
Use structured logging (avoid console.log):

```typescript
import { logger } from '@/lib/logger';

logger.info('User voted', { userId, issueId, voteType });
logger.error('Vote failed', { userId, issueId, error: error.message });
```

---

## Feature Development Checklist

When building a new feature (e.g., flagging an issue):

- [ ] **Database Schema:** Add tables/columns to schema.sql
- [ ] **RLS Policies:** Ensure Row Level Security is configured
- [ ] **Types:** Define TypeScript types for the feature
- [ ] **Server Action:** Write the mutation in app/actions/
- [ ] **API Route:** If external integration needed, create route
- [ ] **Client Component:** Build interactive UI (client-side)
- [ ] **Tests:** Add unit tests for business logic, E2E for user flow
- [ ] **Error Handling:** All paths covered (success, auth errors, DB errors)
- [ ] **Documentation:** JSDoc on public functions, API endpoint docs

---

## Performance Optimization

### Query Optimization
- Use indexes on frequently queried columns (company_id, created_by, issue_id)
- Limit SELECT to needed fields (no SELECT *)
- Use OFFSET/LIMIT for pagination (not FETCH ALL)

```typescript
// ✅ Paginated query
const issues = await supabase
  .from('issues')
  .select('id, title, net_votes')
  .range(0, 19) // First 20
  .order('net_votes', { ascending: false });
```

### Caching
- Use Next.js incremental static regeneration (ISR) for issue lists
- Cache expensive calculations (reputation scores)
- Revalidate on mutations

```typescript
export const revalidate = 3600; // 1 hour cache

export default async function IssuesPage() {
  const issues = await getIssues();
  return <IssuesList issues={issues} />;
}
```

---

## Security Practices

### Mandatory
1. **RLS on all tables** - No exceptions
2. **Validate all inputs** - Client-side + Server-side
3. **Sanitize outputs** - Prevent XSS
4. **Rate limiting** - On API endpoints
5. **CSRF tokens** - For state-changing requests
6. **No hardcoded secrets** - Use .env.local

### Example: Input Validation
```typescript
import { z } from 'zod';

const VoteSchema = z.object({
  issueId: z.string().uuid('Invalid issue ID'),
  voteType: z.enum(['upvote', 'downvote']),
});

const result = VoteSchema.safeParse({ issueId, voteType });
if (!result.success) {
  throw new ValidationError(result.error.message);
}
```

---

## Testing Strategy

### Unit Tests (Vitest)
Test pure functions and business logic:

```typescript
// lib/reputation.test.ts
describe('calculateReputation', () => {
  it('should return 0 for new user with no votes', () => {
    const rep = calculateReputation({ issuesCreated: 0, helpfulVotes: 0 });
    expect(rep).toBe(0);
  });

  it('should increase with more helpful votes', () => {
    const rep1 = calculateReputation({ issuesCreated: 5, helpfulVotes: 10 });
    const rep2 = calculateReputation({ issuesCreated: 5, helpfulVotes: 20 });
    expect(rep2).toBeGreaterThan(rep1);
  });
});
```

### E2E Tests (Playwright)
Test user workflows:

```typescript
// tests/voting.e2e.ts
test('User can upvote an issue', async ({ page, context }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. Navigate to issue
  await page.goto('/issues/123');

  // 3. Click upvote
  await page.click('button[aria-label="Upvote"]');

  // 4. Verify vote count increased
  await expect(page.locator('text=1 upvote')).toBeVisible();
});
```

---

## Commit Message Convention

Use Conventional Commits format:

```
feat(voting): prevent duplicate votes with unique constraint

- Add unique index on (issue_id, user_id)
- Implement idempotent vote toggle in Server Action
- Add error handling for constraint violations

Closes #123
```

**Prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring (no behavior change)
- `docs:` - Documentation
- `test:` - Test additions
- `perf:` - Performance improvements
- `chore:` - Tooling, dependencies

---

## Context References for Copilot

When working in this repo, use these tokens in Copilot Chat:

- `@workspace` → Analyze full CrowdUp codebase
- `#db` → Reference database schema and RLS
- `#voting` → Reference voting system logic
- `#auth` → Reference authentication flows

Example prompt:
```
@workspace How should I implement a "flag inappropriate report" feature?
Consider #db schema, #auth permissions, and #voting system patterns.
```

---

## Resources & Documentation

- **Supabase RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Next.js 15 App Router:** https://nextjs.org/docs/app
- **Playwright Testing:** https://playwright.dev
- **Conventional Commits:** https://www.conventionalcommits.org

---

**Last Updated:** January 2026
**Maintained by:** CrowdUp Development Team
```

---

## Integration Instructions

1. **Create the file:**
   ```bash
   touch .github/copilot-instructions.md
   ```

2. **Paste the entire markdown content** (starting from triple backticks above)

3. **Commit and push:**
   ```bash
   git add .github/copilot-instructions.md
   git commit -m "docs: add copilot-instructions for CrowdUp architecture"
   git push
   ```

4. **Reload VS Code:**
   - `Cmd+Shift+P` → "Reload Window"

5. **Test it:**
   ```
   @workspace Suggest a voting component implementation for CrowdUp
   ```

---

## Validation Checklist

- [ ] File exists at `.github/copilot-instructions.md`
- [ ] Content is valid markdown
- [ ] All code examples compile/run
- [ ] Database schema matches `.sql` files in repo
- [ ] API endpoints match actual route handlers
- [ ] RLS policies are enforced
- [ ] Copilot generates code following these patterns