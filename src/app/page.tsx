"use client";

import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import PodiumView from "@/components/PodiumView";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import SidePanel from "@/components/SidePanel";
import { NoPostsEmptyState } from "@/components/EmptyState";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { rankPosts } from "@/lib/algorithm";
import { getCurrentUserId } from "@/lib/auth";

interface Post {
  id: string;
  user_id: string;
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  company_color: string;
  title: string;
  description: string;
  votes: number;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
}

interface PostWithEngagement extends Post {
  comments_count?: number;
  views?: number;
  shares?: number;
}

interface AlgorithmPost {
  id: string;
  user_id: string;
  type: string;
  company: string;
  company_color: string;
  title: string;
  description: string;
  votes: number;
  created_at: string;
  comments_count?: number;
  views?: number;
  shares?: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"featured" | "new" | "top">("featured");
  const [displayCount, setDisplayCount] = useState(10);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    
    // Fetch all posts with user data
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        users (username, display_name)
      `);

    if (!error && data) {
      // Fetch comment counts for all posts
      let postsWithEngagement: PostWithEngagement[] = data as PostWithEngagement[];
      
      if (data.length > 0) {
        const postIds = data.map((p: any) => p.id);
        const { data: commentsData } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);

        if (commentsData) {
          const counts: Record<string, number> = {};
          commentsData.forEach((comment: any) => {
            counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
          });
          setCommentCounts(counts);
          
          // Add comment counts to posts
          postsWithEngagement = postsWithEngagement.map(post => ({
            ...post,
            comments_count: counts[post.id] || 0
          }));
        }
      }

      // Apply algorithm-based sorting
      let sortedPosts: PostWithEngagement[];
      
      if (sortBy === "new") {
        // Simple recency sort
        sortedPosts = [...postsWithEngagement].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortBy === "top") {
        // Simple vote sort
        sortedPosts = [...postsWithEngagement].sort((a, b) => b.votes - a.votes);
      } else {
        // Featured: Use advanced algorithm
        const userId = getCurrentUserId();
        
        // Get user's voted posts for personalization
        let votedPosts: string[] = [];
        if (userId) {
          const { data: votesData } = await supabase
            .from("votes")
            .select("post_id")
            .eq("user_id", userId);
          
          if (votesData) {
            votedPosts = votesData.map((v: any) => v.post_id);
          }
        }
        
        // Create user interaction profile
        const userInteraction = userId ? {
          userId,
          followedUsers: [], // TODO: Implement follows
          interactedCompanies: [], // TODO: Track company interactions
          preferredTypes: [], // TODO: Track preferred post types
          votedPosts
        } : undefined;
        
        // Convert to algorithm format and rank
        const algorithmPosts: AlgorithmPost[] = postsWithEngagement.map(p => ({
          id: p.id,
          user_id: p.user_id,
          type: p.type,
          company: p.company,
          company_color: p.company_color,
          title: p.title,
          description: p.description,
          votes: p.votes,
          created_at: p.created_at,
          comments_count: p.comments_count,
          views: p.views,
          shares: p.shares
        }));
        
        const rankedAlgorithmPosts = rankPosts(algorithmPosts, userInteraction);
        
        // Convert back to Post format
        sortedPosts = rankedAlgorithmPosts.map(ap => {
          const original = postsWithEngagement.find(p => p.id === ap.id)!;
          return original;
        });
      }
      
      setPosts(sortedPosts as Post[]);
    }
    setLoading(false);
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  const topPosts = posts.slice(0, 3).map((post, index) => ({
    postId: post.id,
    type: post.type,
    company: post.company,
    companyColor: post.company_color,
    title: post.title,
    votes: post.votes,
    rank: (index + 1) as 1 | 2 | 3,
  }));

  const formattedPosts = posts.map((post) => ({
    postId: post.id,
    type: post.type,
    company: post.company,
    companyColor: post.company_color,
    title: post.title,
    description: post.description,
    votes: post.votes,
    author: post.users.display_name,
    authorInitial: post.users.display_name.charAt(0).toUpperCase(),
    timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    comments: commentCounts[post.id] || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading amazing posts...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      <main className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Main Feed */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            {/* Podium View */}
            {topPosts.length === 3 && (
              <PodiumView posts={topPosts as [typeof topPosts[0], typeof topPosts[1], typeof topPosts[2]]} />
            )}

            {/* Sort dropdown */}
            <div className="mb-4 sm:mb-6 relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
              >
                Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              
              {showSortMenu && (
                <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-10 min-w-[140px]">
                  <button
                    onClick={() => { setSortBy("featured"); setShowSortMenu(false); }}
                    className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-50 rounded-t-lg text-sm"
                  >
                    Featured
                  </button>
                  <button
                    onClick={() => { setSortBy("new"); setShowSortMenu(false); }}
                    className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    New
                  </button>
                  <button
                    onClick={() => { setSortBy("top"); setShowSortMenu(false); }}
                    className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-50 rounded-b-lg text-sm"
                  >
                    Top
                  </button>
                </div>
              )}
            </div>

            {formattedPosts.length === 0 ? (
              <NoPostsEmptyState onCreatePost={() => window.location.href = "/create"} />
            ) : (
              <>
                {formattedPosts.slice(0, displayCount).map((post) => (
                  <PostCard key={post.postId} {...post} />
                ))}
                
                {displayCount < formattedPosts.length && (
                  <div className="text-center py-6 sm:py-8">
                    <Button 
                      onClick={loadMore}
                      variant="outline" 
                      size="lg" 
                      className="rounded-full px-6 sm:px-8 text-sm sm:text-base hover:bg-gradient-to-br hover:from-yellow-400 hover:to-orange-500 hover:text-white hover:border-transparent border-gray-300 transition-all shadow-lg hover:shadow-orange-500/30"
                    >
                      Load More Posts
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Hidden on mobile and tablet */}
          <aside className="w-80 hidden xl:block">
            <Sidebar />
          </aside>
        </div>
      </main>
      <SidePanel />
    </div>
  );
}
