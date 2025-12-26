# CrowdUp Features & Usage Guide

## Overview
CrowdUp is a social feedback platform where users submit bug reports, feature requests, and complaints about companies and products. This guide consolidates all feature documentation and usage instructions.

## Core Features
- Authentication: signup/signin/logout with custom auth (bcryptjs)
- Posts: create Bug Reports, Feature Requests, Complaints
- Voting: upvote/downvote with denormalized counts
- Profiles: user pages with activity
- Settings: privacy, notifications, data export, delete account
- Feed: ranked using multi-signal algorithm (engagement, velocity, recency, personalization, diversity)

## App & Company Pages
- App pages: create `/apps/create`, view `/apps/[id]`
  - Details: name, description, category, app URL, logo URL
  - Reviews: 1–5 star ratings, text reviews, averages
- Company pages: `/company/[name]`
  - Details: logo, description, website, apps, related posts
  - Popular companies pre-loaded with logos
- Migrations: see `migration-companies-apps.sql`

### How to Create Pages
- Company: go to `/company/create`, fill details, submit → `/company/[name]`
- App: go to `/apps/create`, fill details (optional company link), submit → `/apps/[id]`
- Navigation helpers and categories: see [docs/archive/HOW_TO_CREATE_PAGES.md](docs/archive/HOW_TO_CREATE_PAGES.md) for code and examples

## Messaging (1:1)
- Mutual connections only: users must follow each other
- Real-time: Supabase `postgres_changes` subscriptions
- Conversations: list, search, unread counts, last message preview
- Messages: send, timestamps, read/unread, auto-mark read
- Start chat: “New” dialog with available mutual connections
- Data: see `/src/lib/messaging.ts` and `supabase_migrations/messages.sql`

## Settings
- Privacy: Public Profile, Show Activity, Allow Messages
- Notifications: email, project updates, new followers, messages
- Data & Account: export data (JSON), delete account (confirmation)
- UI/UX: toggles, dialogs, loading states, gradient styling
- Migration: `migration-user-settings.sql`

## Recommendation Algorithm
- Signals: Time Decay, Engagement, Velocity, Personalization, Diversity, Quality
- Sorting modes: Featured (default), New, Top
- Trending: engagement per hour with recency boost (48h window)
- Personalization: filters already-voted posts; future follow/company/type prefs
- Usage: `src/lib/algorithm.ts` → `rankPosts()`, `getTrendingPosts()`, `calculateCompanyTrending()`

## Follow/Connections
- Table: `connections` for follower/following pairs
- Used by Messaging and personalization roadmaps
- Migration: see `migration-follows.sql` and MIGRATION_GUIDE.md

## File Locations (Key)
- Feed: `src/app/page.tsx`
- Posts: `src/app/create/page.tsx`, `src/components/PostCard.tsx`
- Profiles: `src/app/profile/[username]/page.tsx`
- Settings: `src/app/settings/page.tsx`
- Company/App: `src/app/company/[name]/page.tsx`, `src/app/apps/[id]/page.tsx`
- Messaging: `src/app/messages/page.tsx`, `src/lib/messaging.ts`
- Algorithm: `src/lib/algorithm.ts`

## Future Enhancements
- Comments, search, notifications, follow/unfollow UX
- Messaging: attachments, reactions, typing indicators, groups
- Personalization: follow/companies/type preference
- Security: server-side sessions, RLS enablement for production

## Tips
- Test flows: create accounts, posts, votes, profiles
- Use Supabase SQL Editor to apply migrations
- Provide real env vars at runtime; placeholders only for build