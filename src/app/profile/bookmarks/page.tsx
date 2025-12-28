"use client";

import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { NoBookmarksEmptyState } from "@/components/EmptyState";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Loader2 } from "lucide-react";

interface BookmarkedPost {
  id: string;
  user_id: string;
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  company_color: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
}

export default function BookmarksPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    fetchBookmarkedPosts(userId);
  }, [router]);

  const fetchBookmarkedPosts = async (userId: string) => {
    try {
      // Get bookmarked post IDs
      const { data: bookmarks, error: bookmarksError } = (await supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })) as {
        data: any[] | null;
        error: any;
      };

      if (bookmarksError || !bookmarks || bookmarks.length === 0) {
        setLoading(false);
        return;
      }

      const postIds = bookmarks.map((b: any) => b.post_id);

      // Fetch the actual posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          users (username, display_name)
        `,
        )
        .in("id", postIds);

      if (!postsError && postsData) {
        // Maintain bookmark order
        const orderedPosts: BookmarkedPost[] = [];
        for (const id of postIds) {
          const found = postsData.find((p: any) => p.id === id);
          if (found) orderedPosts.push(found as BookmarkedPost);
        }

        setPosts(orderedPosts);

        // Fetch comment counts
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
        }
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Bookmark className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Saved Posts
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {posts.length} {posts.length === 1 ? "post" : "posts"} saved
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : posts.length === 0 ? (
          <NoBookmarksEmptyState onBrowse={() => router.push("/")} />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                type={post.type}
                company={post.company}
                companyColor={post.company_color}
                title={post.title}
                description={post.description}
                votes={post.votes}
                author={post.users?.display_name || "Unknown"}
                authorInitial={(post.users?.display_name || "U")
                  .charAt(0)
                  .toUpperCase()}
                timestamp={formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
                comments={commentCounts[post.id] || 0}
                status={(post.status as any) || "open"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
