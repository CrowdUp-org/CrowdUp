[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Contributions: PR Only](https://img.shields.io/badge/Contributions-PR%20Only-yellow.svg)](CONTRIBUTING.md)


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

## Setup

**For Maintainers:** See `internal/docs/setup/` for detailed development and deployment instructions.

**For Contributors:** Follow the contributing guidelines below to submit pull requests.

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

**CrowdUp is proprietary software.** The source code is visible for transparency and to accept community contributions, but is NOT open source.

See [LICENSE](./LICENSE) for full terms.

**TL;DR:**
- ❌ You CANNOT use, run, or deploy this software
- ❌ You CANNOT create competing products
- ✅ You CAN contribute bug fixes via pull requests
- ✅ You CAN report issues