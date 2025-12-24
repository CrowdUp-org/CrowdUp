---
title: CrowdUp
emoji: 🗣️
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: cc-by-nc-nd-4.0
app_port: 7860
---

# CrowdUp on Hugging Face Spaces

A social feedback platform where users can submit and vote on bug reports, feature requests, and complaints about various companies and products.

## Features

- 🔐 Custom authentication (username/email + password)
- 🔑 Google Sign-In (OAuth 2.0)
- 📝 Create posts (Bug Reports, Feature Requests, Complaints)
- ⬆️ Upvote/downvote system with real-time updates
- 👤 User profiles with post history
- ⚙️ Settings page for profile management
- 🏆 Podium view for top posts
- 💬 Direct messaging between users
- 💾 Supabase backend with PostgreSQL

## Running on Hugging Face Spaces

This Space runs a Next.js 15 application using Docker. The application requires environment variables to connect to Supabase.

### Required Environment Variables

To run this Space, you need to configure the following secrets in your Space settings:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxx.supabase.co`
   - Get it from: Supabase Dashboard → Project Settings → API

2. **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY**
   - Your Supabase publishable/anon key
   - Starts with: `eyJ...`
   - Get it from: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`

3. **SUPABASE_SECRET_KEY** (Optional but recommended)
   - Your Supabase secret/service_role key
   - Starts with: `eyJ...`
   - Get it from: Supabase Dashboard → Project Settings → API → Project API keys → `service_role`
   - Required for: OAuth functionality

4. **NEXT_PUBLIC_GOOGLE_CLIENT_ID** (Optional)
   - Google OAuth Client ID
   - Required only if you want Google Sign-In
   - Get it from: Google Cloud Console

5. **GOOGLE_CLIENT_SECRET** (Optional)
   - Google OAuth Client Secret
   - Required only if you want Google Sign-In
   - Get it from: Google Cloud Console

### Setup Instructions

1. **Fork or Duplicate this Space**
   - Click "Duplicate Space" to create your own instance

2. **Set up Supabase**
   - Create a free Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from the original repository's `supabase-schema.sql`
   - Copy your API credentials

3. **Configure Space Secrets**
   - Go to your Space Settings → Variables and Secrets
   - Add the environment variables listed above
   - Mark secrets as "Secret" to keep them private

4. **Restart the Space**
   - The Space will rebuild and start with your configuration

### Database Setup

You need to initialize your Supabase database with the required schema:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL schema from: [supabase-schema.sql](https://github.com/CrowdUp-org/CrowdUp/blob/main/supabase-schema.sql)

This creates the necessary tables:
- `users` - User accounts
- `posts` - User-submitted posts
- `comments` - Comments on posts
- `votes` - Upvotes/downvotes
- `conversations` - Direct messages
- `messages` - Message contents
- `companies` - Company profiles
- `apps` - App profiles

### Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** + shadcn/ui components
- **Supabase** for database, authentication, and real-time features
- **Docker** for containerization

### Local Development

If you want to run this locally instead:

```bash
# Clone the repository
git clone https://github.com/CrowdUp-org/CrowdUp.git
cd CrowdUp

# Install dependencies
npm install

# Configure environment
cp .env.local.template .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Building with Docker

To build and run the Docker image locally:

```bash
# Build the image
docker build -t crowdup .

# Run the container
docker run -p 7860:7860 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key \
  crowdup
```

### Troubleshooting

**Space won't start:**
- Check that all required environment variables are set
- Verify your Supabase credentials are correct
- Check the Space logs for error messages

**Database connection errors:**
- Ensure your Supabase project is active
- Verify the database schema is initialized
- Check that RLS policies are configured (or disabled for testing)

**Authentication issues:**
- For custom auth: Ensure `users` table exists
- For Google OAuth: Verify OAuth credentials are set and callback URL is configured

### Contributing

Visit the main repository for contribution guidelines:
[https://github.com/CrowdUp-org/CrowdUp](https://github.com/CrowdUp-org/CrowdUp)

### License

This work is licensed under CC BY-NC-ND 4.0. 
See: https://creativecommons.org/licenses/by-nc-nd/4.0/

### Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/CrowdUp-org/CrowdUp/issues)
- Check the documentation in the repository

---

**Note:** This is a Hugging Face Spaces deployment of CrowdUp. The app requires external Supabase services to function.
