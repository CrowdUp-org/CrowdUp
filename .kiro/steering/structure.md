# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── company/[id]/      # Dynamic company pages
│   ├── post/[id]/         # Dynamic post detail pages
│   ├── profile/[username]/ # Dynamic user profiles
│   ├── create/            # Post creation page
│   ├── messages/          # Messaging interface
│   ├── search/            # Search functionality
│   ├── settings/          # User settings
│   ├── trending/          # Trending posts view
│   ├── layout.tsx         # Root layout with error reporting
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Main navigation header
│   ├── PostCard.tsx      # Post display component
│   ├── PodiumView.tsx    # Top 3 posts display
│   ├── Sidebar.tsx       # Sidebar navigation
│   └── SidePanel.tsx     # Side panel component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── hooks/           # Additional hooks
│   └── utils.ts         # Shared utilities (cn helper)
└── visual-edits/        # Visual editing tools
```

## Path Aliases

- `@/*` maps to `src/*`
- `@/components` for components
- `@/lib/utils` for utilities
- `@/hooks` for custom hooks

## Routing Conventions

- Use App Router with file-based routing
- Dynamic routes use `[param]` syntax
- All pages are client components (`"use client"`)
- Layout includes error reporting and visual edits messenger

## Component Patterns

- UI components from shadcn/ui in `components/ui/`
- Feature components in `components/` root
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Prefer composition with Radix UI primitives
- Client-side navigation with `useRouter` from `next/navigation`

## Styling Conventions

- Tailwind utility classes for styling
- Gradient accent: `from-yellow-400 to-orange-500`
- Rounded corners: typically `rounded-xl` or `rounded-2xl`
- Hover effects with `transition-all` for smooth animations
- Shadow effects: `shadow-lg shadow-orange-500/30` for branded elements
