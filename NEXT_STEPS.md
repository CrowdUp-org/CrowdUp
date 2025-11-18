# Next Steps - Getting CrowdUp Running

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose a name, database password, and region
4. Wait 2-3 minutes for provisioning

### 2. Set Up Database Tables
1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the `supabase-schema.sql` file in this project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### 3. Get Your API Keys
1. In Supabase, go to "Project Settings" (gear icon in sidebar)
2. Click "API" in the settings menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 4. Configure Environment Variables
1. In this project, create a file called `.env.local` in the root directory
2. Add these two lines (replace with your actual values):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 5. Install & Run
```bash
npm install
npm run dev
```

### 6. Test It Out!
1. Open http://localhost:3000
2. You'll be redirected to sign in
3. Click "Sign up" and create an account
4. Start creating posts!

## ✅ What's Working

- ✅ User authentication (signup/signin/logout)
- ✅ Create posts with different types
- ✅ Upvote/downvote posts
- ✅ View user profiles
- ✅ Edit profile settings
- ✅ Real-time data from Supabase
- ✅ Podium view for top posts

## 🎯 Features You Can Add Next

- Comments on posts
- Search functionality
- Company pages
- Trending page
- Notifications
- Follow/unfollow users
- Post filtering and sorting
- Image uploads for profiles

## 🐛 Troubleshooting

**"Invalid credentials" when signing in:**
- Make sure you ran the SQL schema in Supabase
- Check your .env.local file has the correct values

**Posts not showing:**
- Open browser DevTools (F12) and check Console for errors
- Verify your Supabase URL and key are correct

**Can't create posts:**
- Make sure you're signed in
- Check that the database tables were created

## 📚 Learn More

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
