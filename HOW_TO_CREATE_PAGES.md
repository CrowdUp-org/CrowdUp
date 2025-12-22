# How to Create Company and App Pages

## 🏢 Creating a Company Page

### Step 1: Navigate to Create Company Page
Go to: **`/company/create`**

Or add a link in your navigation:
```tsx
<Link href="/company/create">Create Company</Link>
```

### Step 2: Fill in Company Details

**Required Fields:**
- **Company Name** - Official name (e.g., "Acme Corporation")
- **Description** - What your company does

**Optional Fields:**
- **URL Name** - Custom URL slug (auto-generated if left blank)
- **Industry** - Select from 12 categories
- **Website** - Company website URL
- **Logo URL** - Direct link to company logo image

### Step 3: Submit
Click "Create Company Page" and you'll be redirected to your new company page at `/company/[name]`

### Features:
- ✅ Automatic URL-friendly name generation
- ✅ Duplicate name checking
- ✅ Creator becomes company owner
- ✅ Logo preview before submission
- ✅ 12 industry categories

---

## 📱 Creating an App Page

### Step 1: Navigate to Create App Page
Go to: **`/apps/create`**

Or add a link in your navigation:
```tsx
<Link href="/apps/create">Create App</Link>
```

### Step 2: Fill in App Details

**Required Fields:**
- **App Name** - Name of your application
- **Description** - What your app does and why people should use it
- **Category** - Select from 10 categories

**Optional Fields:**
- **App URL** - Link to your app/website
- **Logo URL** - Direct link to app logo image
- **Company** - Link to an existing company page

### Step 3: Submit
Click "Create App Page" and you'll be redirected to your new app page at `/apps/[id]`

### Features:
- ✅ Link to existing company pages
- ✅ 10 app categories
- ✅ Star rating system (users can rate 1-5 stars)
- ✅ Review system
- ✅ Automatic creator tracking

---

## 🔗 Adding Navigation Links

### In Header Component
Add these links to your header navigation:

```tsx
<Link href="/company/create" className="...">
  <Building2 className="h-4 w-4" />
  Create Company
</Link>

<Link href="/apps/create" className="...">
  <Plus className="h-4 w-4" />
  Create App
</Link>
```

### In Sidebar
```tsx
<div className="space-y-2">
  <Button variant="outline" onClick={() => router.push('/company/create')}>
    Create Company
  </Button>
  <Button variant="outline" onClick={() => router.push('/apps/create')}>
    Create App
  </Button>
</div>
```

---

## 📊 Database Tables

### Companies Table
```sql
companies (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,           -- URL-friendly name
  display_name TEXT,          -- Official name
  description TEXT,
  website TEXT,
  logo_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ
)
```

### Apps Table
```sql
apps (
  id UUID PRIMARY KEY,
  user_id UUID,               -- Creator
  name TEXT,
  description TEXT,
  app_url TEXT,
  logo_url TEXT,
  category TEXT,
  company_id UUID,            -- Optional link to company
  average_rating DECIMAL,
  total_reviews INTEGER,
  created_at TIMESTAMPTZ
)
```

### Company Members Table
```sql
company_members (
  id UUID PRIMARY KEY,
  company_id UUID,
  user_id UUID,
  role TEXT,                  -- 'owner', 'admin', 'member'
  created_at TIMESTAMPTZ
)
```

---

## 🎨 Categories

### Company Industries
- 💻 Technology
- 👥 Social Media
- 🎮 Entertainment
- 🛍️ E-commerce
- 💰 Finance
- ❤️ Healthcare
- 📚 Education
- 🚗 Transportation
- 🍔 Food & Beverage
- ✈️ Travel
- 🎯 Gaming
- 📦 Other

### App Categories
- 📦 Productivity
- 👥 Social
- 🎮 Entertainment
- 💬 Communication
- 🎵 Music
- 📸 Photo & Video
- 🛍️ Shopping
- 📊 Business
- 📚 Education
- ❤️ Health & Fitness

---

## 🔐 Authentication

Both pages require users to be logged in:
- Redirects to `/auth/signin` if not authenticated
- Uses `getCurrentUserId()` to get user ID
- Creator is automatically associated with the page

---

## 🖼️ Logo Images

### Best Practices
- **Format**: PNG or JPG
- **Size**: 200x200px recommended
- **Hosting**: Use image hosting service (Imgur, Cloudinary, etc.)
- **Direct Link**: Must be a direct image URL

### Example URLs
```
https://i.imgur.com/abc123.png
https://res.cloudinary.com/demo/image/upload/logo.jpg
https://example.com/images/logo.png
```

---

## 🚀 Quick Access URLs

- **Create Company**: `http://localhost:3000/company/create`
- **Create App**: `http://localhost:3000/apps/create`
- **View Company**: `http://localhost:3000/company/[name]`
- **View App**: `http://localhost:3000/apps/[id]`

---

## 💡 Tips

1. **Company First**: Create a company page before creating apps to link them
2. **Good Descriptions**: Write clear, engaging descriptions (helps with discovery)
3. **Logo Quality**: Use high-quality logos for better presentation
4. **URL Names**: Keep company URL names short and memorable
5. **Categories**: Choose the most relevant category for better discoverability

---

## 🐛 Troubleshooting

### "Company name already exists"
- Try a different URL name
- Check if company already exists at `/company/[name]`

### "Failed to create"
- Check database connection
- Verify all required fields are filled
- Check browser console for errors

### Logo not showing
- Verify URL is a direct image link
- Check image is publicly accessible
- Try a different image hosting service

---

## 📝 Example Workflow

1. **Create Company**:
   - Go to `/company/create`
   - Fill in "Acme Corp" details
   - Submit → Redirected to `/company/acme-corp`

2. **Create App**:
   - Go to `/apps/create`
   - Fill in "Acme Messenger" details
   - Select "Acme Corp" from company dropdown
   - Submit → Redirected to `/apps/[id]`

3. **Users Can**:
   - View company page
   - See all apps by company
   - Leave reviews on apps
   - Rate apps 1-5 stars
   - Create posts about company/app

---

**Need Help?** Check the database schema in `supabase-schema.sql` or migration files.
