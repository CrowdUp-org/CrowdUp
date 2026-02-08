[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Contributions: PR Only](https://img.shields.io/badge/Contributions-PR%20Only-yellow.svg)](CONTRIBUTING.md)

# CrowdUp

CrowdUp is a community feedback and reputation platform where people report bugs, suggest features, and raise complaints about companies and products. This repository accepts contributions via pull requests; production deployment and operations are managed privately by the maintainers.

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

## Architecture (high level)

- Clean layers: presentation → application/services → infrastructure/repositories. Components use services/hooks; repositories are not called from UI directly.
- Auth & permissions: enforced server-side (Server Actions / API routes) and backed by Supabase RLS.
- Feed ranking: see `src/lib/algorithm.ts`; messaging uses `src/lib/messaging.ts`.
- Visual edits: Turbopack loader + `src/visual-edits/VisualEditsMessenger.tsx` (see `next.config.ts`).

## Key Files & Entry Points

- `src/app/page.tsx` — Home feed and sorting
- `src/components/PostCard.tsx` — Voting UI and client flows
- `src/lib/supabase.ts` — Supabase client helpers
- `src/lib/algorithm.ts` — Ranking utilities

## Repository Structure

Top-level source: `src/` — app routes, components, hooks, and lib utilities. Database migrations and schema live at the repo root (`supabase-schema.sql`, `supabase_migrations/`).

## For Contributors

1. Read the project wiki for contribution guidelines and coding conventions: https://github.com/CrowdUp-org/CrowdUp/wiki/Contributing
2. Follow branch naming and Conventional Commits; open focused PRs.
3. Code quality checks:
   - **Prettier & ESLint** run automatically on PRs via [pre-commit.ci](https://pre-commit.ci) and auto-fix issues
   - **TypeScript** typecheck runs in GitHub Actions CI (`npx tsc --noEmit`)
   - Optional: Install pre-commit locally for immediate feedback: `pip install pre-commit && pre-commit install`

Notes:

- Do not include production secrets or deployment instructions in PRs.
- This repository is intended for code-level contributions; internal ops/runbooks are in the private `internal/` docs for maintainers.

## Maintainers & Deployment

Production deployments are handled privately by project maintainers. Pull requests do not trigger deployments and do not confer any operational privileges.

## License

**CrowdUp is proprietary software.** The source code is visible for transparency and to accept community contributions, but is NOT open source.

See [LICENSE](./LICENSE) for full terms.

## Quick Contact

Report issues via GitHub issues in this repository or open a PR with a suggested fix. For sensitive security reports, contact the maintainers privately (see internal docs).

---

_This README provides a high-level overview for contributors and reviewers. For internal setup, deployment, and operational runbooks see the `internal/` docs (maintainers only)._
