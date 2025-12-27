# CrowdUp

Public repository for community contributions via pull requests. The production website is operated privately by the maintainer and a collaborator. Pull requests do not trigger deployments; deployment and operations are restricted.

## Overview

CrowdUp is a social feedback platform where users submit and vote on bug reports, feature requests, and complaints about companies and products. The app is built with Next.js (App Router) and uses Supabase for database and storage with a client-first access pattern.

## Features

- Authentication: custom username/email + password (bcrypt-based), optional Google Sign-In (OAuth 2.0)
- Posts: create and interact with Bug Reports, Feature Requests, Complaints
- Voting: upvote/downvote with real-time updates and denormalized counters
- Comments: discuss on posts
- Profiles & Follows: user profiles with history and following
- Messaging: 1:1 conversations with realtime updates
- Apps & Companies: entity pages for discovery and organization
- Leaderboard & Reputation: ranking utilities and podium view
- Notifications: user notifications for relevant events
- Feed & Discovery: trending, recent, top, following, and personalized sorts

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Storage)
- bcryptjs for password hashing

## Architecture

- Client-first data access using Supabase from client components/hooks.
- Client-side auth: sessions stored in `localStorage`; helpers in `src/lib/auth.ts`; middleware does not gate routes.
- Feed ranking logic combines engagement, velocity, recency, personalization, and diversity (`src/lib/algorithm.ts`), used by the homepage (`src/app/page.tsx`).
- Messaging uses Supabase realtime channels (`postgres_changes`) (`src/lib/messaging.ts`).
- Voting pattern follows upsert/delete on `votes` with denormalized `posts.votes` updates (`src/components/PostCard.tsx`).
- Styling via Tailwind and shadcn primitives (`src/components/ui/*`); class composition via `cn()` (`src/lib/utils.ts`).
- Visual Edits: Turbopack loader injects tags consumed by `src/visual-edits/VisualEditsMessenger.tsx` (see `next.config.ts`).

### Key Files

- `src/app/page.tsx` — Home feed, sorting, data shaping
- `src/lib/algorithm.ts` — Ranking utilities
- `src/lib/auth.ts` — Client auth/session helpers (bcrypt, localStorage)
- `src/lib/messaging.ts` — Conversations/messages + realtime
- `src/components/PostCard.tsx` — Vote flows + UI patterns
- `src/lib/supabase.ts` — Supabase client (publishable + server usage notes)
- `next.config.ts` — Build flags and visual-edits loader
- `src/visual-edits/VisualEditsMessenger.tsx` — Visual Edits messenger

## Repository Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── auth/                 # Authentication pages
│   ├── create/               # Post creation
│   ├── messages/             # 1:1 messaging
│   ├── trending/             # Trending feed
│   ├── leaderboard/          # Leaderboard
│   ├── profile/              # User profiles
│   ├── apps/                 # Apps pages
│   ├── company/              # Company pages
│   ├── settings/             # User settings
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # shadcn/ui primitives
│   └── PostCard.tsx         # Voting UI and logic
└── lib/                      # Utilities
    ├── auth.ts               # Authentication logic
    ├── supabase.ts           # Supabase client
    ├── algorithm.ts          # Feed ranking
    ├── messaging.ts          # Messaging utilities
    └── database.types.ts     # TS types for DB schema
```

## Environment

Create `.env.local` with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL="https://<your-project>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
SUPABASE_SECRET_KEY="<your-service-role-key>"
```

Notes:
- `src/lib/supabase.ts` includes placeholder URL/key fallbacks allowing `next build` without envs. Provide real values at runtime.
- Treat the client-first pattern as a development bootstrap. For sensitive operations, prefer server mediation with the Secret API key.

## Setup (Local Development)

Follow the wiki for end-to-end guidance:
- Getting Started: https://github.com/CrowdUp-org/CrowdUp/wiki/Getting-Started
- Features: https://github.com/CrowdUp-org/CrowdUp/wiki/Features
- Troubleshooting: https://github.com/CrowdUp-org/CrowdUp/wiki/Troubleshooting

Quick start:

1. Create a Supabase project and run the SQL schema from `supabase-schema.sql`.
2. Add your Supabase credentials to `.env.local` (see above).
3. Install dependencies and start dev server:

```bash
npm install
npm run dev
```

4. Build and preview:

```bash
npm run build
npm start
```

5. Lint:

```bash
npm run lint
```

## Build Notes

- TypeScript/ESLint: `next.config.ts` is configured to ignore TS and ESLint errors during production builds for speed. Avoid introducing new errors.
- Turbopack: `npm run dev` uses Turbopack. The visual-edits loader is enabled via `next.config.ts` and consumed by `src/visual-edits/VisualEditsMessenger.tsx`.
- Ports: Dev defaults to 3000 unless overridden.

## Database

- Primary schema: `supabase-schema.sql`; additional migrations in root (e.g., `migration-google-oauth.sql`, `migration-reputation.sql`, etc.).
- Core tables: `users`, `posts`, `comments`, `votes`; plus `connections`, `apps`, `companies`, `conversations`, `messages`.
- Types: defined in `src/lib/database.types.ts`.
- Row Level Security: disabled in the provided schema (development bootstrap).

## Contributing

This public repository exists to accept contributions via PRs. Please review the wiki before opening a PR:
- Contributing: https://github.com/CrowdUp-org/CrowdUp/wiki/Contributing
- Development Conventions: https://github.com/CrowdUp-org/CrowdUp/wiki/Development-Conventions

Guidelines (summary):
- Branch naming: `type/scope-description` (e.g., `feature/feed-personalization`).
- Conventional Commits: `feat|fix|docs|refactor|chore|test|perf`.
- PR checklist: up-to-date with `main`, passes `npm run lint` and `npm run build`, documented changes and test steps.
- Scope: one focused feature/fix per PR; maintainers review and decide roadmap. PRs do not deploy.

## Deployment & Operations

Production deployment and operations are private and managed by the maintainer and a collaborator. Contributions do not grant deploy access and PRs do not trigger deployments. For administrators, a restricted Deployment page exists:
- Deployment (restricted): https://github.com/CrowdUp-org/CrowdUp/wiki/Deployment

## Troubleshooting

See the wiki for common issues and solutions:
- Troubleshooting: https://github.com/CrowdUp-org/CrowdUp/wiki/Troubleshooting

## License

This work is licensed under CC BY-NC-ND 4.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/