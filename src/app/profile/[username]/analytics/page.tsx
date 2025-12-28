"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Users, Eye, ThumbsUp } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

interface Analytics {
  totalPosts: number;
  totalVotes: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
  topPosts: any[];
  recentActivity: any[];
  votesByType: {
    bugReports: number;
    featureRequests: number;
    complaints: number;
  };
}

export default function ProfileAnalyticsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPosts: 0,
    totalVotes: 0,
    totalComments: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    topPosts: [],
    recentActivity: [],
    votesByType: { bugReports: 0, featureRequests: 0, complaints: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndAnalytics();
  }, [username]);

  const fetchProfileAndAnalytics = async () => {
    // Fetch user profile
    const { data: userData } = (await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()) as any;

    if (!userData) {
      router.push("/");
      return;
    }

    // Check if current user is viewing their own profile
    if (!currentUser || currentUser.username !== username) {
      router.push(`/profile/${username}`);
      return;
    }

    await fetchAnalytics(userData.id);
  };

  const fetchAnalytics = async (userId: string) => {
    // Fetch posts
    const { data: posts } = (await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })) as any;

    const totalPosts = (posts as any)?.length || 0;
    const totalVotes =
      (posts as any)?.reduce((sum: any, post: any) => sum + post.votes, 0) || 0;

    // Count by type
    const bugReports =
      (posts as any)?.filter((p: any) => p.type === "Bug Report").length || 0;
    const featureRequests =
      (posts as any)?.filter((p: any) => p.type === "Feature Request").length ||
      0;
    const complaints =
      (posts as any)?.filter((p: any) => p.type === "Complaint").length || 0;

    // Fetch comments on user's posts
    const postIds = (posts as any)?.map((p: any) => p.id) || [];
    let totalComments = 0;
    if (postIds.length > 0) {
      const { data: comments } = (await supabase
        .from("comments")
        .select("id")
        .in("post_id", postIds)) as any;
      totalComments = comments?.length || 0;
    }

    // Fetch followers
    const { data: followers } = (await supabase
      .from("connections")
      .select("id")
      .eq("following_id", userId)) as any;

    // Fetch following
    const { data: following } = (await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", userId)) as any;

    // Get top posts (by votes)
    const topPosts =
      (posts as any)?.sort((a: any, b: any) => b.votes - a.votes).slice(0, 5) ||
      [];

    // Get recent activity
    const recentActivity = (posts as any)?.slice(0, 10) || [];

    setAnalytics({
      totalPosts,
      totalVotes,
      totalComments,
      totalFollowers: followers?.length || 0,
      totalFollowing: following?.length || 0,
      topPosts,
      recentActivity,
      votesByType: { bugReports, featureRequests, complaints },
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push(`/profile/${username}`)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Your Analytics</h1>
            <p className="text-gray-600">Track your activity and engagement</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <Eye className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalPosts}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.votesByType.bugReports} bugs,{" "}
              {analytics.votesByType.featureRequests} features,{" "}
              {analytics.votesByType.complaints} complaints
            </p>
          </Card>

          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <ThumbsUp className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalVotes}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalPosts > 0
                ? (analytics.totalVotes / analytics.totalPosts).toFixed(1)
                : 0}{" "}
              avg per post
            </p>
          </Card>

          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Total Comments
              </p>
              <MessageCircle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalComments}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalPosts > 0
                ? (analytics.totalComments / analytics.totalPosts).toFixed(1)
                : 0}{" "}
              avg per post
            </p>
          </Card>

          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Followers</p>
              <Users className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalFollowers}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Following {analytics.totalFollowing}
            </p>
          </Card>
        </div>

        {/* Top Posts */}
        <Card className="p-8 bg-white border shadow-sm rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6">Top Posts by Votes</h2>
          {analytics.topPosts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No posts yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.topPosts.map((post: any, index: number) => (
                <button
                  key={post.id}
                  onClick={() => router.push(`/post/${post.id}`)}
                  className="w-full text-left p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-300">
                          #{index + 1}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            post.type === "Bug Report"
                              ? "bg-red-100 text-red-700"
                              : post.type === "Feature Request"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {post.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.company}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 text-orange-500">
                        <ThumbsUp className="h-4 w-4" />
                        <p className="text-lg font-bold">{post.votes}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-8 bg-white border shadow-sm rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          {analytics.recentActivity.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {analytics.recentActivity.map((post: any) => (
                <button
                  key={post.id}
                  onClick={() => router.push(`/post/${post.id}`)}
                  className="w-full text-left p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            post.type === "Bug Report"
                              ? "bg-red-100 text-red-700"
                              : post.type === "Feature Request"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {post.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.company}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {post.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {post.votes} votes
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
