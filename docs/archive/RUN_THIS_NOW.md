# 🚨 IMPORTANT - Run This Now!

## ✅ Step 1: Environment Variables - DONE ✓
Your `.env.local` file has been created with your Supabase credentials.

## 🔴 Step 2: Set Up Database Tables - DO THIS NOW!

Your dev server is running at **http://localhost:3001**

But you need to create the database tables first!

### Instructions:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/eodcobxjgofitexvlqwc

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the SQL Schema**
   - Open the file `supabase-schema.sql` in this project
   - Copy ALL the content (Cmd/Ctrl + A, then Cmd/Ctrl + C)

4. **Run the SQL**
   - Paste into the Supabase SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

5. **Verify Tables Created**
   - Click "Table Editor" in the left sidebar
   - You should see 4 tables: users, posts, comments, votes

## 🎉 Step 3: Test the App

Once you've run the SQL schema:

1. Open http://localhost:3001
2. Click "Sign up" 
3. Create an account with:
   - Username: your_username
   - Display Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
4. After signup, you'll be logged in automatically
5. Click the "+" button to create your first post!

## 🐛 Troubleshooting

**If you see errors:**
- Make sure you ran the ENTIRE SQL schema
- Check browser console (F12) for error messages
- Verify all 4 tables exist in Supabase Table Editor

**If signup doesn't work:**
- Check that the SQL schema ran successfully
- Look for error messages on the signup page

## 📝 Quick SQL Schema Location

The SQL file is at the root of this project:
```
./supabase-schema.sql
```

It contains:
- Users table (for authentication)
- Posts table (for bug reports, features, complaints)
- Comments table (for future use)
- Votes table (for upvote/downvote)

---

**Ready?** Go run that SQL schema now! 🚀
