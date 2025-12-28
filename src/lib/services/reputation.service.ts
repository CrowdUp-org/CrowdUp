import { supabase } from "../supabase";
import { createNotification } from "./notifications.service";

// =====================================================
// Reputation Level Definitions
// =====================================================
export const REPUTATION_LEVELS = {
  newcomer: { name: "Newcomer", icon: "🌱", minScore: 0, maxScore: 99 },
  contributor: {
    name: "Contributor",
    icon: "🌿",
    minScore: 100,
    maxScore: 499,
  },
  established: {
    name: "Established",
    icon: "🌳",
    minScore: 500,
    maxScore: 999,
  },
  trusted: { name: "Trusted", icon: "⭐", minScore: 1000, maxScore: 4999 },
  expert: { name: "Expert", icon: "🏆", minScore: 5000, maxScore: 9999 },
  legend: { name: "Legend", icon: "💎", minScore: 10000, maxScore: Infinity },
} as const;

export type ReputationLevel = keyof typeof REPUTATION_LEVELS;

// =====================================================
// Point Values for Actions
// =====================================================
export const POINT_VALUES = {
  post_created: 5,
  post_upvoted: 2,
  post_downvoted: -1,
  post_acknowledged: 20,
  post_implemented: 100,
  comment_upvoted: 3,
  reported_content: -50,
} as const;

export type ReputationActionType =
  | keyof typeof POINT_VALUES
  | "manual_adjustment";

// =====================================================
// Types
// =====================================================
export interface ReputationData {
  score: number;
  level: ReputationLevel;
  levelInfo: (typeof REPUTATION_LEVELS)[ReputationLevel];
  pointsToNextLevel: number;
  progressPercent: number;
}

export interface ReputationHistoryItem {
  id: string;
  action_type: ReputationActionType;
  points_change: number;
  related_post_id: string | null;
  reason: string | null;
  created_at: string;
  post_title?: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  reputation_score: number;
  reputation_level: string;
  rank: number;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Calculate reputation level from score
 */
export function calculateLevel(score: number): ReputationLevel {
  if (score >= 10000) return "legend";
  if (score >= 5000) return "expert";
  if (score >= 1000) return "trusted";
  if (score >= 500) return "established";
  if (score >= 100) return "contributor";
  return "newcomer";
}

/**
 * Get full reputation data for a score
 */
export function getReputationData(score: number): ReputationData {
  const level = calculateLevel(score);
  const levelInfo = REPUTATION_LEVELS[level];

  // Calculate progress to next level
  let pointsToNextLevel = 0;
  let progressPercent = 100;

  if (level !== "legend") {
    const nextLevelMinScore = levelInfo.maxScore + 1;
    pointsToNextLevel = nextLevelMinScore - score;
    const levelRange = levelInfo.maxScore - levelInfo.minScore + 1;
    const progressInLevel = score - levelInfo.minScore;
    progressPercent = Math.min(
      100,
      Math.round((progressInLevel / levelRange) * 100),
    );
  }

  return {
    score,
    level,
    levelInfo,
    pointsToNextLevel,
    progressPercent,
  };
}

/**
 * Get friendly description for action type
 */
export function getActionDescription(actionType: ReputationActionType): string {
  const descriptions: Record<ReputationActionType, string> = {
    post_created: "Created a post",
    post_upvoted: "Post received an upvote",
    post_downvoted: "Post received a downvote",
    post_acknowledged: "Post acknowledged by company",
    post_implemented: "Suggestion was implemented",
    comment_upvoted: "Comment received an upvote",
    reported_content: "Content was reported",
    manual_adjustment: "Manual adjustment",
  };
  return descriptions[actionType] || actionType;
}

// =====================================================
// Database Operations
// =====================================================

/**
 * Award reputation points to a user
 */
export async function awardPoints(
  userId: string,
  actionType: ReputationActionType,
  options?: {
    relatedPostId?: string;
    relatedCommentId?: string;
    reason?: string;
    customPoints?: number;
  },
): Promise<{ success: boolean; error: string | null; newScore?: number }> {
  try {
    const points =
      options?.customPoints ??
      POINT_VALUES[actionType as keyof typeof POINT_VALUES] ??
      0;

    if (points === 0 && !options?.customPoints) {
      return {
        success: false,
        error: "Invalid action type or no points to award",
      };
    }

    // Get current level before update
    const currentLevel = await getUserReputation(userId);

    // Call the atomic database function
    const { data, error } = (await supabase.rpc("award_reputation_points", {
      p_user_id: userId,
      p_action_type: actionType,
      p_points: points,
      p_related_post_id: options?.relatedPostId || null,
      p_related_comment_id: options?.relatedCommentId || null,
      p_reason: options?.reason || null,
    } as any)) as any;

    if (error) {
      console.error("Error awarding points via RPC:", error);
      return { success: false, error: error.message };
    }

    const result = data as {
      success: boolean;
      error?: string;
      new_score?: number;
    };
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to award points",
      };
    }

    // Check for level up
    const newLevel = calculateLevel(result.new_score || 0);
    if (
      currentLevel &&
      newLevel !== currentLevel.level &&
      result.new_score! > currentLevel.score
    ) {
      const usernameResult = (await (supabase.from("users") as any)
        .select("username")
        .eq("id", userId)
        .single()) as any;
      await createNotification(
        userId,
        "level",
        "Reputation Level Up!",
        `Congratulations! You've reached the ${REPUTATION_LEVELS[newLevel].name} level.`,
        `/profile/${usernameResult.data?.username || ""}`,
      );
    }

    // Check for badges
    await checkAndAwardBadges(userId);

    return { success: true, error: null, newScore: result.new_score };
  } catch (error) {
    console.error("Error awarding points:", error);
    return { success: false, error: "An error occurred while awarding points" };
  }
}

/**
 * Get user reputation data
 */
export async function getUserReputation(
  userId: string,
): Promise<ReputationData | null> {
  try {
    const { data: user, error } = (await supabase
      .from("users")
      .select("reputation_score, reputation_level")
      .eq("id", userId)
      .single()) as any;

    if (error || !user) {
      return null;
    }

    return getReputationData(user.reputation_score || 0);
  } catch (error) {
    console.error("Error fetching user reputation:", error);
    return null;
  }
}

/**
 * Get reputation history for a user
 */
export async function getReputationHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<ReputationHistoryItem[]> {
  try {
    const { data, error } = (await supabase
      .from("reputation_history")
      .select(
        `
        id,
        action_type,
        points_change,
        related_post_id,
        reason,
        created_at
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)) as any;

    if (error || !data) {
      return [];
    }

    // Fetch post titles for related posts
    const postIds = (data as any)
      .filter((item: any) => item.related_post_id)
      .map((item: any) => item.related_post_id);

    let postTitles: Record<string, string> = {};
    if (postIds.length > 0) {
      const { data: posts } = (await supabase
        .from("posts")
        .select("id, title")
        .in("id", postIds)) as any;

      if (posts) {
        postTitles = Object.fromEntries(
          (posts as any).map((p: any) => [p.id, p.title]),
        );
      }
    }

    return (data as any).map((item: any) => ({
      ...item,
      post_title: item.related_post_id
        ? postTitles[item.related_post_id]
        : undefined,
    })) as ReputationHistoryItem[];
  } catch (error) {
    console.error("Error fetching reputation history:", error);
    return [];
  }
}

/**
 * Get leaderboard with pagination
 */
export async function getLeaderboard(options?: {
  limit?: number;
  page?: number;
}): Promise<LeaderboardEntry[]> {
  try {
    const limit = options?.limit || 50;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const { data, error } = (await supabase
      .from("users")
      .select(
        "id, username, display_name, avatar_url, reputation_score, reputation_level",
      )
      .order("reputation_score", { ascending: false })
      .range(offset, offset + limit - 1)) as any;

    if (error || !data) {
      return [];
    }

    return (data as any).map((user: any, index: any) => ({
      ...user,
      rank: index + 1,
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

/**
 * Get user badges
 */
export async function getUserBadges(userId: string): Promise<
  {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }[]
> {
  try {
    const { data, error } = (await supabase
      .from("user_badges")
      .select(
        `
        id,
        earned_at,
        badges (
          name,
          description,
          icon
        )
      `,
      )
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })) as any;

    if (error || !data) {
      return [];
    }

    return (data as any).map((item: any) => ({
      id: item.id,
      earned_at: item.earned_at,
      name: (item.badges as any)?.name || "",
      description: (item.badges as any)?.description || "",
      icon: (item.badges as any)?.icon || "",
    }));
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }
}

/**
 * Check and award badges based on user stats
 */
export async function checkAndAwardBadges(userId: string): Promise<void> {
  try {
    // Get user stats
    const { data: user } = (await supabase
      .from("users")
      .select("reputation_score")
      .eq("id", userId)
      .single()) as any;

    if (!user) return;

    const { count: postsCount } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get total upvotes received on user's posts
    const { data: posts } = (await supabase
      .from("posts")
      .select("id")
      .eq("user_id", userId)) as any;

    let totalUpvotes = 0;
    if (posts && posts.length > 0) {
      const postIds = (posts as any).map((p: any) => p.id);
      const { count } = await supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .in("post_id", postIds)
        .eq("vote_type", "up");
      totalUpvotes = count || 0;
    }

    // Get all badges user doesn't have
    const { data: userBadges } = (await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId)) as any;

    const earnedBadgeIds = new Set(
      (userBadges || []).map((b: any) => b.badge_id),
    );

    // Get all badges
    const { data: allBadges } = (await supabase
      .from("badges")
      .select("*")) as any;

    if (!allBadges) return;

    // Check each badge
    for (const badge of allBadges as any[]) {
      if (earnedBadgeIds.has((badge as any).id)) continue;

      let qualified = false;
      switch ((badge as any).requirement_type) {
        case "posts_count":
          qualified = (postsCount || 0) >= (badge as any).requirement_value;
          break;
        case "upvotes_received":
          qualified = totalUpvotes >= (badge as any).requirement_value;
          break;
        case "reputation_score":
          qualified =
            (user!.reputation_score || 0) >= (badge as any).requirement_value;
          break;
      }

      if (qualified) {
        (await (supabase.from("user_badges").insert({
          user_id: userId,
          badge_id: (badge as any).id,
        } as any) as any)) as any;

        // Send notification
        const badgeUsernameResult = (await (supabase.from("users") as any)
          .select("username")
          .eq("id", userId)
          .single()) as any;
        await createNotification(
          userId,
          "badge",
          "New Badge Earned!",
          `You've earned the ${(badge as any).name} badge: ${(badge as any).description}`,
          `/profile/${badgeUsernameResult.data?.username || ""}`,
        );
      }
    }
  } catch (error) {
    console.error("Error checking badges:", error);
  }
}
