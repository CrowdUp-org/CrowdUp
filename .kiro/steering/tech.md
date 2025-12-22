# Tech Stack

## Framework & Core

- **Next.js 15.3.5** with App Router (React 19)
- **TypeScript 5** with strict mode enabled
- **Turbopack** for fast development builds

## Styling & UI

- **Tailwind CSS 4** with PostCSS
- **shadcn/ui** components (New York style variant)
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Lucide React** for icons

## Database & Auth

- **Drizzle ORM** with LibSQL client
- **Better Auth** for authentication
- **bcrypt** for password hashing

## Key Libraries

- **React Hook Form** with Zod validation
- **date-fns** for date handling
- **Sonner** for toast notifications
- **Three.js** with React Three Fiber for 3D graphics
- **Recharts** for data visualization

## Development Tools

- **ESLint** with Next.js config
- **Bun** as package manager (lock file present)

## Common Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
bun dev             # Alternative with Bun

# Build & Deploy
npm run build       # Production build
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Build Configuration

- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- Remote images allowed from all domains
- Custom Turbopack loader for visual edits component tagging
