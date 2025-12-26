# CrowdUp Recommendation Algorithm

## Overview

CrowdUp uses a sophisticated multi-signal ranking algorithm inspired by major social media platforms like Instagram, Facebook, and X (Twitter). The algorithm combines multiple factors to surface the most relevant and engaging content to users.

## Algorithm Components

### 1. **Time Decay** (20% weight)
- **Purpose**: Prioritize fresh content
- **Method**: Exponential decay with 24-hour half-life
- **Effect**: Posts lose half their ranking value after 24 hours
- **Similar to**: Reddit's time-based ranking

### 2. **Engagement Score** (30% weight)
- **Metrics**:
  - Votes (weight: 1.0x)
  - Comments (weight: 2.0x) - More valuable than votes
  - Shares (weight: 3.0x) - Most valuable interaction
- **Calculation**: Weighted sum + engagement rate bonus
- **Similar to**: Facebook's engagement-based ranking

### 3. **Velocity Score** (25% weight)
- **Purpose**: Detect trending content
- **Method**: Engagement per hour × logarithmic growth factor
- **Boost**: New posts (<1 hour) get 2x multiplier
- **Effect**: Fast-growing posts rank higher
- **Similar to**: X (Twitter)'s trending algorithm

### 4. **Personalization** (15% weight)
- **Factors**:
  - Posts from followed users (2.0x boost)
  - Posts about interacted companies (1.5x boost)
  - Preferred post types (1.3x boost)
  - Already-voted posts (0.5x penalty)
- **Similar to**: Instagram's interest-based ranking

### 5. **Diversity** (5% weight)
- **Purpose**: Avoid echo chambers
- **Method**: Exponential penalty for repeated sources
- **Effect**: Variety in feed (different companies/users)
- **Similar to**: Facebook's diversity ranking

### 6. **Quality Score** (5% weight)
- **Signals**:
  - Negative votes → 0.3x penalty
  - High comment-to-vote ratio → 1.2x boost (engaging discussions)
  - Old posts with no engagement → 0.5x penalty
- **Purpose**: Filter low-quality content

## Final Score Calculation

```
Final Score = 
  (Engagement × 0.30) +
  (Velocity × 0.25) +
  (Time Decay × 100 × 0.20) +
  (Personalization × 50 × 0.15) +
  (Diversity × 50 × 0.05) +
  (Quality × 50 × 0.05)
```

## Sorting Modes

### Featured (Default)
Uses the full algorithm with all signals combined. Best for discovering relevant content.

### New
Simple chronological sort by `created_at`. Best for seeing latest posts.

### Top
Simple sort by vote count. Best for seeing all-time popular posts.

## Trending Algorithm

Separate algorithm for trending sidebar and trending page:

```
Trending Score = (Engagement / Age in Hours) × (1 + Recency Boost)
```

- Only considers posts from last 48 hours
- Recency boost: Linear from 1.0 (48h old) to 2.0 (just posted)
- Identifies posts gaining traction quickly

## Personalization Features

### Current Implementation
- Filters out already-voted posts
- Tracks user's voting history

### Future Enhancements (TODO)
- Follow system integration
- Company interaction tracking
- Post type preference learning
- Reading time tracking
- Click-through rate analysis

## Company/Topic Trending

Aggregates trending scores by company to show:
- Which companies are being discussed most
- Total trending score per company
- Number of posts per company

## A/B Testing Support

Built-in variant system for testing different algorithm weights:
- **Default**: Balanced weights (current)
- **Engagement**: Higher weight on engagement signals
- **Recency**: Higher weight on time decay

Users are consistently assigned to variants based on user ID hash.

## Performance Considerations

### Optimizations
- Single database query for all posts
- Batch comment count fetching
- Client-side ranking (no server load)
- Efficient sorting algorithms

### Scalability
- Algorithm runs in O(n log n) time
- Can handle thousands of posts
- Caching opportunities for future optimization

## Comparison to Major Platforms

| Feature | Instagram | Facebook | X (Twitter) | CrowdUp |
|---------|-----------|----------|-------------|---------|
| Time Decay | ✅ | ✅ | ✅ | ✅ |
| Engagement | ✅ | ✅ | ✅ | ✅ |
| Velocity | ✅ | ✅ | ✅ | ✅ |
| Personalization | ✅ | ✅ | ✅ | ✅ |
| Diversity | ✅ | ✅ | ❌ | ✅ |
| Quality Signals | ✅ | ✅ | ✅ | ✅ |

## Usage Examples

### Basic Ranking
```typescript
import { rankPosts } from '@/lib/algorithm';

const rankedPosts = rankPosts(posts);
```

### Personalized Ranking
```typescript
const userInteraction = {
  userId: 'user-123',
  followedUsers: ['user-456', 'user-789'],
  interactedCompanies: ['Instagram', 'Twitter'],
  preferredTypes: ['Bug Report', 'Feature Request'],
  votedPosts: ['post-1', 'post-2']
};

const personalizedPosts = rankPosts(posts, userInteraction);
```

### Trending Posts
```typescript
import { getTrendingPosts } from '@/lib/algorithm';

const trending = getTrendingPosts(posts, 10); // Top 10 trending
```

### Company Trending
```typescript
import { calculateCompanyTrending } from '@/lib/algorithm';

const trendingCompanies = calculateCompanyTrending(posts);
```

## Future Improvements

### Short-term
1. Implement follow system for better personalization
2. Track company interaction history
3. Learn user's preferred post types
4. Add view tracking for engagement rate

### Medium-term
1. Machine learning for personalization
2. Collaborative filtering (users like you also liked...)
3. Time-of-day optimization
4. Geographic relevance

### Long-term
1. Deep learning recommendation model
2. Real-time streaming updates
3. Multi-armed bandit for exploration/exploitation
4. Sentiment analysis for quality scoring

## Monitoring & Analytics

### Key Metrics to Track
- Average engagement per post by ranking position
- Click-through rate by algorithm variant
- User session time with different algorithms
- Diversity score distribution
- Personalization effectiveness

### A/B Test Ideas
- Different weight combinations
- Time decay half-life variations
- Personalization aggressiveness
- Diversity penalty strength

## Technical Details

### File Location
`src/lib/algorithm.ts`

### Dependencies
- None (pure TypeScript)
- Works with any post data structure

### Type Safety
Fully typed with TypeScript interfaces for:
- `Post` - Basic post structure
- `PostWithEngagement` - Post with engagement metrics
- `UserInteraction` - User behavior profile

### Testing
Run build test to verify algorithm integration:
```bash
npm run build
```

## Credits

Algorithm design inspired by:
- Reddit's "Hot" ranking algorithm
- Instagram's engagement-based feed
- Facebook's EdgeRank algorithm
- X (Twitter)'s trending topics algorithm

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
