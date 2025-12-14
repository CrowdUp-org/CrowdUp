---
name: Dynamic Trending Page with Real Data
about: Replace hardcoded trending data with dynamic database queries
title: "[BUG]: Trending page uses hardcoded data instead of real metrics"
labels: ["Bug 🐛", "Enhancement ✨"]
assignees: []
---

## Version/Commit

Current main branch (trending page at `src/app/trending/page.tsx`)

## Steps To Reproduce

1. Navigate to the `/trending` page
2. Observe the displayed trending companies and topics
3. Check the source code at `src/app/trending/page.tsx` lines 13-77
4. Notice that `trendingCompanies` and `trendingTopics` are hardcoded arrays

## Expected Behavior

The trending page should display dynamic, real-time data based on actual platform metrics:

- **Trending Companies:** Ranked by actual post volume, engagement, and growth metrics from the database
- **Trending Topics:** Derived from actual post content, tags, or categories
- **Follower Counts:** Real follower numbers from the `connections` table
- **Post Counts:** Actual post counts from the `posts` table
- **Growth Percentages:** Calculated from time-series data showing actual growth trends

## Actual Behavior

The trending page displays static, hardcoded data:

```javascript
const trendingCompanies = [
  { 
    name: "Instagram", 
    followers: "15.4K",  // Hardcoded
    growth: "+12%",       // Hardcoded
    posts: 347,          // Hardcoded
    // ...
  },
  // ... more hardcoded entries
];

const trendingTopics = [
  { name: "UI/UX Issues", posts: 234, icon: "🎨" },  // All hardcoded
  // ...
];
```

This means:
- The data never updates based on actual platform activity
- New companies or topics are never shown
- Metrics don't reflect real engagement
- The page provides no value for discovery

## Screenshots

The current implementation at `src/app/trending/page.tsx` shows hardcoded arrays instead of database queries.

## Browser

All browsers (server-side rendering issue)

## Additional Context

### Proposed Solution

1. **Create database queries to fetch trending data:**

```typescript
// In src/lib/trending.ts or similar
export async function getTrendingCompanies(limit = 6) {
  // Get companies with most posts in last 7 days
  const { data: companies } = await supabase
    .from('posts')
    .select('company, companies!inner(id, name, logo_url)')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });
  
  // Aggregate and calculate metrics
  // Group by company, count posts, calculate growth
  
  return processedCompanies;
}

export async function getTrendingTopics(limit = 6) {
  // Analyze post types, categories, or extract keywords
  const { data: posts } = await supabase
    .from('posts')
    .select('type, created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  
  // Aggregate by topic/type
  return processedTopics;
}
```

2. **Update the trending page to use real data:**

```typescript
export default async function TrendingPage() {
  const trendingCompanies = await getTrendingCompanies(6);
  const trendingTopics = await getTrendingTopics(6);
  
  return (
    // ... render with real data
  );
}
```

3. **Add proper database indexes for performance:**

```sql
CREATE INDEX IF NOT EXISTS idx_posts_created_at_company ON posts(created_at DESC, company);
CREATE INDEX IF NOT EXISTS idx_posts_type_created_at ON posts(type, created_at DESC);
```

4. **Consider caching:**
   - Cache trending data for 5-15 minutes
   - Use Redis or in-memory cache
   - Implement background refresh

### Benefits of Fix

- ✅ Real-time discovery of active companies
- ✅ Accurate metrics and statistics
- ✅ Automatic updates as platform grows
- ✅ Better user engagement
- ✅ Platform scales naturally
- ✅ No maintenance needed for trending list

### Database Tables Involved

- `posts` - for post counts and activity
- `companies` - for company information
- `votes` - for engagement metrics
- `connections` - for follower counts (if company following is implemented)
- `comments` - for discussion activity

### Related Features

This fix should leverage the existing algorithm utilities in `src/lib/algorithm.ts` which already has ranking functions like `rankPosts()` and could be extended for trending calculations.

### Performance Considerations

- Add database indexes for date range queries
- Implement query result caching
- Consider materialized views for complex aggregations
- Use database functions for heavy calculations

This is a critical issue as the trending page is meant to be a key discovery feature but currently provides no real value to users.
