"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, MessageCircle, Users, Eye } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";

interface Analytics {
  totalPosts: number;
  totalVotes: number;
  totalComments: number;
  totalApps: number;
  recentActivity: any[];
}

export default function CompanyAnalyticsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPosts: 0,
    totalVotes: 0,
    totalComments: 0,
    totalApps: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);

  useEffect(() => {
    fetchCompanyAndCheck();
  }, [name]);

  const fetchCompanyAndCheck = async () => {
    const { data: companyData } = (await supabase
      .from("companies")
      .select("*")
      .eq("name", name.toLowerCase())
      .single()) as any;

    if (!companyData) {
      router.push("/");
      return;
    }

    setCompany(companyData);

    // Check ownership
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const { data: memberData } = (await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", companyData.id)
      .eq("user_id", userId)
      .single()) as any;

    if (
      !memberData ||
      (memberData.role !== "owner" && memberData.role !== "admin")
    ) {
      router.push(`/company/${name}`);
      return;
    }

    setIsOwnerOrAdmin(true);
    await fetchAnalytics(companyData);
  };

  const fetchAnalytics = async (companyData: any) => {
    // Fetch posts
    const { data: posts } = (await supabase
      .from("posts")
      .select("*")
      .ilike("company", companyData.display_name)) as any;

    const totalPosts = (posts as any)?.length || 0;
    const totalVotes =
      (posts as any)?.reduce((sum: any, post: any) => sum + post.votes, 0) || 0;

    // Fetch comments for these posts
    const postIds = (posts as any)?.map((p: any) => p.id) || [];
    let totalComments = 0;
    if (postIds.length > 0) {
      const { data: comments } = (await supabase
        .from("comments")
        .select("id")
        .in("post_id", postIds)) as any;
      totalComments = comments?.length || 0;
    }

    // Fetch apps
    const { data: apps } = (await supabase
      .from("apps")
      .select("*")
      .eq("company_id", companyData.id)) as any;

    const totalApps = apps?.length || 0;

    // Recent activity (last 10 posts)
    // Recent activity (last 10 posts)
    const { data: recentPosts } = (await supabase
      .from("posts")
      .select(
        `
        *,
        users (username, display_name)
      `,
      )
      .ilike("company", companyData.display_name)
      .order("created_at", { ascending: false })
      .limit(10)) as any;

    setAnalytics({
      totalPosts,
      totalVotes,
      totalComments,
      totalApps,
      recentActivity: recentPosts || [],
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

  if (!isOwnerOrAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push(`/company/${name}`)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {company?.display_name} Analytics
            </h1>
            <p className="text-gray-600">Track your company's performance</p>
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
          </Card>

          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalVotes}
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
          </Card>

          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Apps</p>
              <Users className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalApps}
            </p>
          </Card>
        </div>

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
                        <span className="text-sm text-gray-500">
                          by {post.users.display_name}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {post.votes} votes
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
