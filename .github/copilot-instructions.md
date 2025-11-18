# AI Coding Assistant Guide for CrowdUp

This repo is a Next.js 15 (App Router) + TypeScript app using Supabase as a database and storage. It implements a client-side auth model and leans on direct Supabase queries from the client. Follow the patterns below to be productive and consistent.

## Architecture & Data Flow
- UI: React components and pages under `src/app/**` (App Router). Example feed and sorting in `src/app/page.tsx`.
- State: Lightweight client state; auth context in `src/contexts/AuthContext.tsx` reads from localStorage.
- Data: Direct `@supabase/supabase-js` client (`src/lib/supabase.ts`) used in client components for CRUD.
- Auth: Custom client-side auth in `src/lib/auth.ts` using `bcryptjs`. Sessions are stored in `localStorage` (`user` and `userId`). Middleware (`src/middleware.ts`) does not gate routes.
- Algorithm: Feed ranking logic in `src/lib/algorithm.ts` (engagement, velocity, recency, personalization, diversity) used by homepage.
- Messaging: 1:1 conversations + messages via `src/lib/messaging.ts` with realtime `postgres_changes` subscription channels.
- Styling: Tailwind CSS + shadcn/ui; use `cn()` from `src/lib/utils.ts` to compose classes. UI atoms live in `src/components/ui/`.

## Environment & Build
- Required env (runtime): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. See `SETUP.md`.
- Build placeholders: `src/lib/supabase.ts` falls back to placeholder URL/key to allow `next build` without envs (see `BUILD_NOTES.md`). Ensure real values at runtime.
- TypeScript/ESLint: Builds ignore TS/ESLint errors for speed (`next.config.ts`: `typescript.ignoreBuildErrors`, `eslint.ignoreDuringBuilds`). Don’t introduce new errors, even if builds pass.
- Scripts:
  - `npm run dev` (Turbopack, with visual-edits loader)
  - `npm run build` → `npm start`
  - `npm run lint`
- Port: Docs reference 3000/3001; default Next.js dev is 3000 unless overridden.

## Database Model (public schema)
- Core tables: `users`, `posts`, `comments`, `votes` (+ `connections`, `apps`, `companies`, `conversations`, `messages`). Types live in `src/lib/database.types.ts`.
- RLS: Disabled in the provided schema. The app uses anon key from the client. Treat this as a dev bootstrap; for sensitive changes, prefer server mediation.
- Migrations/schema: Primary DDL in `supabase-schema.sql`. Optional Google OAuth migration exists (`migration-google-oauth.sql`).

## Project-Specific Conventions
- Client-first data access: Prefer `supabase.from(...).select/insert/update` directly in client components/hooks unless a server boundary is explicitly introduced.
- Auth helpers: Use `getCurrentUser()`/`getCurrentUserId()` from `src/lib/auth.ts` for gating actions and `signIn/signUp/signOut` for flows.
- Voting pattern: See `src/components/PostCard.tsx` for upsert/delete in `votes` and denormalized `posts.votes` update. Mirror this interaction model for similar counters.
- Feed ranking: Use `rankPosts()` and related helpers from `src/lib/algorithm.ts` when adding feeds that need “featured/trending/personalized” sorts.
- Realtime: Use `supabase.channel(...).on('postgres_changes', ...)` as in `subscribeToMessages()` for live updates.
- UI patterns: Use shadcn primitives from `src/components/ui` and the `cn()` utility. Keep Tailwind utility classes idiomatic; prefer existing styling patterns.
- Visual Edits: Turbopack loader (`next.config.ts`) injects tags used by `src/visual-edits/VisualEditsMessenger.tsx`. Keep this import in `src/app/layout.tsx`.

## Typical Workflows
- Install + run:
  ```bash
  npm install
  npm run dev
  ```
- Build + preview:
  ```bash
  npm run build
  npm start
  ```
- Initialize DB: open Supabase → run `supabase-schema.sql` (see `QUICK_START.md`, `RUN_THIS_NOW.md`).

## When Adding Features
- Data writes: Use the existing client Supabase pattern; return `{ success/error }` shaped results like in `auth.ts` and `messaging.ts`.
- Access control: Gate UI actions with `getCurrentUserId()`; redirect to `/auth/signin` when unauthenticated (see `PostCard.tsx`).
- Types: Extend `Database` in `src/lib/database.types.ts` if you add tables/columns; keep enums and union types in sync with SQL.
- Pages: Place new routes under `src/app/<route>/page.tsx`; keep server components minimal if they don’t align with the client-first access pattern.
- Performance: Batch reads and use `.in(...)` queries as seen on the home feed for comment counts; avoid N+1 fetches.

## Key Files (jump-starters)
- `src/app/page.tsx` — feed, sorting, data shaping
- `src/lib/algorithm.ts` — ranking utilities
- `src/lib/auth.ts` — client auth/session helpers
- `src/lib/messaging.ts` — conversations/messages + realtime
- `src/components/PostCard.tsx` — vote flows + UI patterns
- `src/lib/supabase.ts` — configured Supabase client
- `next.config.ts` — build flags, visual-edits loader

If anything above is unclear or missing, tell the maintainer what specific flow or file needs elaboration, and propose a concrete addition to this guide.
