/**
 * CrowdUp Recommendation Algorithm
 * 
 * Inspired by social media platforms like Instagram, Facebook, and X (Twitter)
 * This algorithm ranks content based on multiple signals to maximize engagement
 */

export interface Post {
  id: string;
  votes: number;
  created_at: string;
  user_id: string;
  type: string;
  company: string;
  company_color: string;
  title: string;
  description: string;
}

export interface PostWithEngagement extends Post {
  comments_count?: number;
  views?: number;
  shares?: number;
}

interface UserInteraction {
  userId: string;
  followedUsers: string[];
  interactedCompanies: string[];
  preferredTypes: string[];
  votedPosts: string[];
}

/**
 * Calculate post age in hours
 */
function getPostAgeInHours(createdAt: string): number {
  const now = new Date();
  const postDate = new Date(createdAt);
  return (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Time decay function - newer posts get higher scores
 * Uses exponential decay similar to Reddit's algorithm
 */
function calculateTimeDecay(ageInHours: number): number {
  const halfLife = 24; // Posts lose half their value after 24 hours
  return Math.pow(0.5, ageInHours / halfLife);
}

/**
 * Engagement score based on votes, comments, and interactions
 * Similar to Facebook's engagement ranking
 */
function calculateEngagementScore(post: PostWithEngagement): number {
  const votes = post.votes || 0;
  const comments = post.comments_count || 0;
  const views = post.views || 1; // Avoid division by zero
  const shares = post.shares || 0;

  // Weighted engagement metrics
  const voteWeight = 1.0;
  const commentWeight = 2.0; // Comments are more valuable than votes
  const shareWeight = 3.0; // Shares are most valuable
  
  const totalEngagement = 
    (votes * voteWeight) + 
    (comments * commentWeight) + 
    (shares * shareWeight);

  // Engagement rate (similar to Instagram's algorithm)
  const engagementRate = totalEngagement / Math.max(views, 1);

  return totalEngagement * (1 + engagementRate);
}

/**
 * Velocity score - how fast is the post gaining engagement?
 * Similar to X (Twitter)'s trending algorithm
 */
function calculateVelocityScore(
  currentEngagement: number,
  ageInHours: number
): number {
  if (ageInHours < 1) {
    // Very new posts get a boost
    return currentEngagement * 2;
  }
  
  // Engagement per hour
  const velocity = currentEngagement / ageInHours;
  
  // Boost posts with high velocity
  return velocity * Math.log10(currentEngagement + 10);
}

/**
 * Personalization score based on user's interests
 * Similar to Instagram's interest-based ranking
 */
function calculatePersonalizationScore(
  post: Post,
  userInteraction?: UserInteraction
): number {
  if (!userInteraction) return 1.0; // No personalization data

  let score = 1.0;

  // Boost posts from followed users
  if (userInteraction.followedUsers.includes(post.user_id)) {
    score *= 2.0;
  }

  // Boost posts about companies user interacts with
  if (userInteraction.interactedCompanies.includes(post.company)) {
    score *= 1.5;
  }

  // Boost preferred post types
  if (userInteraction.preferredTypes.includes(post.type)) {
    score *= 1.3;
  }

  // Penalize posts user already voted on
  if (userInteraction.votedPosts.includes(post.id)) {
    score *= 0.5;
  }

  return score;
}

/**
 * Diversity penalty - avoid showing too many posts from same source
 * Similar to Facebook's diversity ranking
 */
function calculateDiversityScore(
  post: Post,
  recentlyShownCompanies: string[],
  recentlyShownUsers: string[]
): number {
  let score = 1.0;

  // Count how many times this company appeared recently
  const companyCount = recentlyShownCompanies.filter(c => c === post.company).length;
  if (companyCount > 0) {
    score *= Math.pow(0.7, companyCount); // Exponential penalty
  }

  // Count how many times this user appeared recently
  const userCount = recentlyShownUsers.filter(u => u === post.user_id).length;
  if (userCount > 0) {
    score *= Math.pow(0.8, userCount);
  }

  return score;
}

/**
 * Quality score based on post characteristics
 * Similar to content quality signals used by all platforms
 */
function calculateQualityScore(post: PostWithEngagement): number {
  let score = 1.0;

  const votes = post.votes || 0;
  const comments = post.comments_count || 0;

  // Posts with negative votes get penalized
  if (votes < 0) {
    score *= 0.3;
  }

  // Posts with high comment-to-vote ratio are likely controversial or engaging
  if (votes > 0 && comments > 0) {
    const commentRatio = comments / votes;
    if (commentRatio > 0.5) {
      score *= 1.2; // Boost engaging discussions
    }
  }

  // Very low engagement might indicate low quality
  if (votes === 0 && comments === 0) {
    const ageInHours = getPostAgeInHours(post.created_at);
    if (ageInHours > 6) {
      score *= 0.5; // Old posts with no engagement
    }
  }

  return score;
}

/**
 * Main ranking algorithm - combines all signals
 * Returns a final score for each post
 */
export function calculatePostScore(
  post: PostWithEngagement,
  userInteraction?: UserInteraction,
  recentlyShownCompanies: string[] = [],
  recentlyShownUsers: string[] = []
): number {
  const ageInHours = getPostAgeInHours(post.created_at);
  
  // Calculate individual scores
  const timeDecay = calculateTimeDecay(ageInHours);
  const engagementScore = calculateEngagementScore(post);
  const velocityScore = calculateVelocityScore(engagementScore, ageInHours);
  const personalizationScore = calculatePersonalizationScore(post, userInteraction);
  const diversityScore = calculateDiversityScore(post, recentlyShownCompanies, recentlyShownUsers);
  const qualityScore = calculateQualityScore(post);

  // Weighted combination of all signals
  const finalScore = 
    engagementScore * 0.3 +        // 30% engagement
    velocityScore * 0.25 +          // 25% velocity (trending)
    timeDecay * 100 * 0.2 +         // 20% recency
    personalizationScore * 50 * 0.15 + // 15% personalization
    diversityScore * 50 * 0.05 +    // 5% diversity
    qualityScore * 50 * 0.05;       // 5% quality

  return finalScore;
}

/**
 * Rank posts using the algorithm
 */
export function rankPosts(
  posts: PostWithEngagement[],
  userInteraction?: UserInteraction
): PostWithEngagement[] {
  const recentlyShownCompanies: string[] = [];
  const recentlyShownUsers: string[] = [];

  // Calculate scores for all posts
  const postsWithScores = posts.map(post => ({
    post,
    score: calculatePostScore(post, userInteraction, recentlyShownCompanies, recentlyShownUsers)
  }));

  // Sort by score (highest first)
  postsWithScores.sort((a, b) => b.score - a.score);

  // Track shown companies and users for diversity
  return postsWithScores.map(({ post }) => {
    recentlyShownCompanies.push(post.company);
    recentlyShownUsers.push(post.user_id);
    return post;
  });
}

/**
 * Calculate trending score for sidebar/trending page
 * Similar to X (Twitter)'s trending topics
 */
export function calculateTrendingScore(
  post: PostWithEngagement
): number {
  const ageInHours = getPostAgeInHours(post.created_at);
  
  // Only consider posts from last 48 hours for trending
  if (ageInHours > 48) return 0;

  const engagementScore = calculateEngagementScore(post);
  const velocity = engagementScore / Math.max(ageInHours, 0.5);
  
  // Trending = high velocity + recency
  const recencyBoost = Math.max(0, 48 - ageInHours) / 48;
  
  return velocity * (1 + recencyBoost);
}

/**
 * Get trending posts
 */
export function getTrendingPosts(
  posts: PostWithEngagement[],
  limit: number = 10
): PostWithEngagement[] {
  const postsWithTrendingScore = posts.map(post => ({
    post,
    trendingScore: calculateTrendingScore(post)
  }));

  return postsWithTrendingScore
    .filter(({ trendingScore }) => trendingScore > 0)
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
    .map(({ post }) => post);
}

/**
 * Get personalized recommendations based on user behavior
 */
export function getPersonalizedRecommendations(
  allPosts: PostWithEngagement[],
  userInteraction: UserInteraction,
  limit: number = 20
): PostWithEngagement[] {
  // Filter out posts user already interacted with
  const unseenPosts = allPosts.filter(
    post => !userInteraction.votedPosts.includes(post.id)
  );

  // Rank using personalization
  const rankedPosts = rankPosts(unseenPosts, userInteraction);

  return rankedPosts.slice(0, limit);
}

/**
 * Calculate company/topic popularity for trending sidebar
 */
export function calculateCompanyTrending(
  posts: PostWithEngagement[]
): Array<{ company: string; score: number; postCount: number }> {
  const companyStats = new Map<string, { totalScore: number; count: number }>();

  posts.forEach(post => {
    const trendingScore = calculateTrendingScore(post);
    if (trendingScore > 0) {
      const existing = companyStats.get(post.company) || { totalScore: 0, count: 0 };
      companyStats.set(post.company, {
        totalScore: existing.totalScore + trendingScore,
        count: existing.count + 1
      });
    }
  });

  return Array.from(companyStats.entries())
    .map(([company, stats]) => ({
      company,
      score: stats.totalScore,
      postCount: stats.count
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * A/B Testing variant - can be used to test different algorithm weights
 */
export function getAlgorithmVariant(userId: string): 'default' | 'engagement' | 'recency' {
  // Simple hash-based assignment for consistent A/B testing
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variant = hash % 3;
  
  if (variant === 0) return 'default';
  if (variant === 1) return 'engagement';
  return 'recency';
}
