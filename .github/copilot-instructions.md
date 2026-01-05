# CrowdUp – Copilot Coding Agent Guide

## What this repo is

- CrowdUp is a Next.js 15 (App Router) social feedback app: users post and vote on bug reports, feature requests, complaints; includes comments, follows, messaging, company/app pages, leaderboard/reputation, notifications, search/trending feeds.
- Client-first data access via Supabase; auth stored client-side; messaging and voting use Supabase realtime.
- Frontend styling: Tailwind + shadcn/ui primitives, motion/three effects in places.
- License: CC BY-NC-ND 4.0.

## Stack & tooling

- Runtime: Node 20 (CI uses `actions/setup-node@v4` with 20). Package manager: npm. TypeScript 5.
- Framework: Next.js 15.4.x (App Router); React 19.
- Styling: Tailwind CSS 4, shadcn/ui components in `src/components/ui/*`.
- Supabase client in `src/lib/supabase.ts`; database schema SQL in root (`supabase-schema.sql`, `migration-*.sql`, `supabase_migrations/`).
- Lint/format/typecheck: ESLint (config in `eslint.config.mjs`), Prettier (no custom config found, uses defaults), TypeScript (`tsconfig.json`). CI also runs `npx tsc --noEmit`.
- Images: `next.config.ts` allows all hosts; build ignores TS/ESLint errors (see below), but CI still typechecks and lints.
- Path alias: `@/* -> ./src/*` (tsconfig `paths`).

## Layout map (high signal spots)

- App entry: `src/app/layout.tsx`, global styles `src/app/globals.css`, home feed `src/app/page.tsx`.
- Feature routes under `src/app/`: auth (`auth/*`), messaging (`messages/page.tsx`), profile (`profile/[username]`), leaderboard, trending, search, settings, company/app pages, posts (`post/[id]`), create flows.
- Components: `src/components/` (PostCard voting logic, NotificationDropdown, Sidebar, Header, etc.), shadcn primitives in `src/components/ui/*`, Google OAuth button in `src/components/auth/GoogleSignInButton.tsx`.
- Lib utilities: `src/lib/algorithm.ts` (ranking), `auth.ts`, `messaging.ts`, `notifications.ts`, `reputation.ts`, `imageUpload.ts`, `supabase.ts`, `database.types.ts`, `utils.ts`, `verification.ts`.
- Contexts/hooks: `src/contexts/*`, `src/hooks/*` plus subdir `src/lib/hooks`.
- Visual Edits: `src/visual-edits/` with Turbopack loader wired via `next.config.ts` (loader at `src/visual-edits/component-tagger-loader.js`).
- Middleware: `src/middleware.ts` (mostly passthrough; no auth gate).
- Config at root: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind` via PostCSS 4 entry, `package.json`, `next-env.d.ts`.
- Docs/examples: `docs/`, `prototype-from-figma/` (ignored by CI), `UI design screenshots/`.

## Environment & secrets

- `.env.local` expected with: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
- `src/lib/supabase.ts` includes placeholder defaults so `next build` can run without envs, but real runtime requires valid Supabase project.
- No other required secrets observed; Stripe dependency present but not wired in CI configs.


## Development Conventions (VERY IMPORTANT)
- Follow `PULL_REQUEST_TEMPLATE.md`
- Follow https://github.com/CrowdUp-org/CrowdUp/wiki/Development-Conventions

## Commands (observed from package.json & CI)

> Commands were not executed in this writing environment; they mirror CI and README. Prefer these sequences and only deviate if they fail.

- Install: `npm install` (or `npm ci` to match lockfile in CI). Always install before any other step.
- Dev server (Turbopack): `npm run dev` (defaults to port 3000). Uses Turbopack; visual-edits loader applied to `*.jsx/tsx`.
- Build: `npm run build` (Next.js production build; `next.config.ts` ignores TS/ESLint errors during build). Still ensure typecheck/lint pass because CI checks them separately.
- Start (after build): `npm start`.
- Lint: `npm run lint` (ESLint; see `eslint.config.mjs` for import rules). Build ignores lint errors, but CI fails on them.
- Typecheck: `npx tsc --noEmit` (run separately; required in CI `quality` job).
- Prettier check: `npx prettier --check .` (CI runs this; no repo config means default Prettier behavior).
- Tests: no test script present; CI does not run tests.

Recommended local validation sequence (mirrors CI):

```
npm ci          # or npm install
npx prettier --check .
npm run lint
npx tsc --noEmit
npm run build
```

If formatting fails, run `npx prettier --write .` selectively. If lint fails on import cycles/paths, check `@/*` alias resolution and file extensions.

## CI/CD expectations

- GitHub Actions workflow `.github/workflows/ci.yml` runs on PRs to `main`/`develop` (ignores docs/markdown/figma assets):
  - Job `quality`: `npm ci`, then Prettier check, ESLint, TypeScript noEmit.
  - Job `build`: depends on `quality`; runs `npm ci` then `npm run build`.
  - Job `codeql`: weekly + PR/merge_group; JavaScript/TypeScript autobuild.
- No auto-deploy from PRs. Production deploy is private.

## Behavioral notes & pitfalls

- `next.config.ts` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` to true; build may succeed even with issues, but CI will fail—always fix lint/type errors.
- All remote images allowed; be cautious when adding external hosts if privacy/security matters.
- ESLint import plugin enforces resolved paths and forbids cycles/useless segments; watch for barrel imports that create cycles.
- `tsconfig` uses `moduleResolution: "bundler"`; avoid relying on `require`/CJS patterns.
- Repo path alias `@/` is common; update tsconfig if adding new root dirs.
- Turbopack loader: any new JSX/TSX file will receive the visual-edits loader; keep it compatible (standard ES modules). Loader path: `src/visual-edits/component-tagger-loader.js`.
- No tests present; changes rely on lint/type/build + manual checks.

## Root inventory (quick orientation)

- Key files: `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` (shadcn?), `supabase-schema.sql`, multiple `migration-*.sql`, `supabase_migrations/messages.sql`, `README.md`, `LICENSE.md`.
- App source: `src/` as described above. Static assets: `public/`.
- Docs/examples: `docs/`, `prototype-from-figma/` (Vite demo), `UI design screenshots/`.

## How to use these instructions

- Prefer the command sequences above; they mirror CI. If something fails, re-run installs, then lint → typecheck → build in that order.
- Trust this file first. Only search the codebase if information here is missing or clearly incorrect.
