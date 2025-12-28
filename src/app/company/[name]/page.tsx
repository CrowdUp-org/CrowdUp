"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import {
  ExternalLink,
  BarChart3,
  UserPlus,
  UserCheck,
  Settings,
} from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getVerifiedMembers } from "@/lib/verification";

interface Company {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  category: string | null;
  follower_count: number;
}

export default function CompanyPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [verifiedMembers, setVerifiedMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchCompany();
    fetchPosts();
  }, [name]);

  useEffect(() => {
    if (company) {
      fetchApps();
      checkOwnership();
      checkFollowStatus();
      fetchVerifiedMembers();
    }
  }, [company]);

  const fetchCompany = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("name", name.toLowerCase())
      .single();

    if (data) {
      setCompany(data);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(
        `
        *,
        users (username, display_name)
      `,
      )
      .ilike("company", name)
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data);

      // Fetch comment counts
      const postIds = data.map((p: any) => p.id);
      if (postIds.length > 0) {
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
    }
  };

  const fetchApps = async () => {
    if (!company) return;

    const { data } = await supabase
      .from("apps")
      .select("*")
      .eq("company_id", company.id);

    if (data) {
      setApps(data);
    }
  };

  const checkOwnership = async () => {
    const userId = getCurrentUserId();
    if (!userId || !company) return;

    const { data } = (await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", company.id)
      .eq("user_id", userId)
      .single()) as any;

    if (data && (data.role === "owner" || data.role === "admin")) {
      setIsOwnerOrAdmin(true);
    }
  };

  const checkFollowStatus = async () => {
    const userId = getCurrentUserId();
    if (!userId || !company) return;

    const { data } = await supabase
      .from("company_follows")
      .select("id")
      .eq("company_id", company.id)
      .eq("user_id", userId)
      .single();

    setIsFollowing(!!data);
    setFollowerCount(company.follower_count || 0);
  };

  const handleFollow = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    if (!company) return;

    if (isFollowing) {
      // Unfollow
      (await supabase
        .from("company_follows")
        .delete()
        .eq("company_id", company!.id)
        .eq("user_id", userId)) as any;

      (await (supabase.from("companies") as any)
        .update({ follower_count: Math.max(0, followerCount - 1) })
        .eq("id", company!.id)) as any;

      setIsFollowing(false);
      setFollowerCount(Math.max(0, followerCount - 1));
    } else {
      // Follow
      (await supabase
        .from("company_follows")
        .insert({ company_id: company!.id, user_id: userId } as any)) as any;

      (await (supabase.from("companies") as any)
        .update({ follower_count: followerCount + 1 })
        .eq("id", company!.id)) as any;

      setIsFollowing(true);
      setFollowerCount(followerCount + 1);
    }
  };

  const fetchVerifiedMembers = async () => {
    if (!company) return;
    const memberIds = await getVerifiedMembers(company.id);
    if (memberIds.length > 0) {
      const { data } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .in("id", memberIds);
      if (data) {
        setVerifiedMembers(data);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const displayName =
    company?.display_name || name.charAt(0).toUpperCase() + name.slice(1);
  const logoUrl = company?.logo_url;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Company Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                {displayName.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <div className="flex gap-2">
                  {!isOwnerOrAdmin && (
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className="gap-2"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                  {isOwnerOrAdmin && (
                    <>
                      <Button
                        onClick={() => router.push(`/company/${name}/manage`)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/company/${name}/analytics`)
                        }
                        variant="outline"
                        className="gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {company?.description && (
                <p className="text-gray-700 mb-4">{company.description}</p>
              )}
              {company?.category && (
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-4">
                  {company.category}
                </span>
              )}
              {company?.website && (
                <Button
                  onClick={() => window.open(company.website!, "_blank")}
                  variant="outline"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Apps Section */}
        {apps.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Apps by {displayName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => router.push(`/apps/${app.id}`)}
                  className="bg-white rounded-xl border p-6 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt={app.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                        {app.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{app.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {app.category}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          ⭐ {app.average_rating.toFixed(1)} (
                          {app.total_reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Verified Team Section */}
        {verifiedMembers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              Verified Representatives
            </h2>
            <div className="flex flex-wrap gap-4">
              {verifiedMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => router.push(`/profile/${member.username}`)}
                  className="bg-white rounded-xl border p-4 hover:shadow-md transition-all flex items-center gap-3"
                >
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                      {member.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900">
                      {member.display_name}
                    </span>
                    <VerifiedBadge size="md" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Posts about {displayName} ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border">
              <p className="text-gray-600 mb-4">
                No posts yet about {displayName}
              </p>
              <Button
                onClick={() => router.push("/create")}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                Create First Post
              </Button>
            </div>
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
                  author={post.users.display_name}
                  authorInitial={post.users.display_name
                    .charAt(0)
                    .toUpperCase()}
                  timestamp={formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                  comments={commentCounts[post.id] || 0}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
