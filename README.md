# CrowdUp

A social feedback platform where users can submit and vote on bug reports, feature requests, and complaints about various companies and products.

## Features

- 🔐 Custom authentication (username/email + password)
- 🔑 Google Sign-In (OAuth 2.0)
- 📝 Create posts (Bug Reports, Feature Requests, Complaints)
- ⬆️ Upvote/downvote system with real-time updates
- 👤 User profiles with post history
- ⚙️ Settings page for profile management
- 🏆 Podium view for top posts
- 💾 Supabase backend with PostgreSQL

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Supabase** for database and storage
- **bcryptjs** for password hashing

## Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. Create a Supabase project and run the SQL schema from `supabase-schema.sql`
2. Copy `.env.example` to `.env.local` and add your Supabase credentials
3. Install dependencies: `npm install` or `bun install`
4. Run dev server: `npm run dev` or `bun dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── create/            # Post creation
│   ├── profile/           # User profiles
│   ├── settings/          # User settings
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
└── lib/                  # Utilities
    ├── auth.ts           # Authentication logic
    ├── supabase.ts       # Supabase client
    └── database.types.ts # TypeScript types
```

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Deployment

For deploying to **Cloudflare Pages**, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed configuration instructions.

**Note**: This project uses `npm` for production deployments due to compatibility issues with Bun 1.2.x. You can still use Bun for local development.
