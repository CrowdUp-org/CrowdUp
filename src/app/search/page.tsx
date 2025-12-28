"use client";

import Header from "@/components/Header";
import { Search, UserPlus, UserCheck, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";

interface SearchResult {
  type: "post" | "user" | "company";
  data: any;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserId = getCurrentUserId();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "posts",
  );
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const categories = [
    { name: "Productivity", icon: "📦", gradient: "from-blue-400 to-cyan-500" },
    { name: "Social", icon: "👥", gradient: "from-pink-400 to-rose-500" },
    {
      name: "Entertainment",
      icon: "🎮",
      gradient: "from-purple-400 to-violet-500",
    },
    {
      name: "Communication",
      icon: "💬",
      gradient: "from-yellow-400 to-orange-500",
    },
    { name: "Music", icon: "🎵", gradient: "from-green-400 to-emerald-500" },
    { name: "Photo & Video", icon: "📸", gradient: "from-red-400 to-pink-500" },
    { name: "Shopping", icon: "🛍️", gradient: "from-indigo-400 to-purple-500" },
    { name: "Business", icon: "📊", gradient: "from-teal-400 to-cyan-500" },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setPosts([]);
      setUsers([]);
      setCompanies([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (currentUserId) {
      fetchFollowingStatus();
      fetchSuggestedUsers();
    }
  }, [currentUserId]);

  const fetchFollowingStatus = async () => {
    if (!currentUserId) return;

    const { data } = (await supabase
      .from("connections")
      .select("following_id")
      .eq("follower_id", currentUserId)) as any;

    if (data) {
      setFollowingIds(new Set(data.map((c: any) => c.following_id)));
    }
  };

  const fetchSuggestedUsers = async () => {
    if (!currentUserId) return;

    // Get users who are not followed by current user
    const { data } = await supabase
      .from("users")
      .select("*")
      .neq("id", currentUserId)
      .limit(10);

    if (data) {
      setSuggestedUsers(data);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return;

    const isFollowing = followingIds.has(userId);

    if (isFollowing) {
      // Unfollow
      await supabase
        .from("connections")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId);

      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      // Follow
      (await supabase.from("connections").insert({
        follower_id: currentUserId,
        following_id: userId,
      } as any)) as any;

      setFollowingIds((prev) => new Set(prev).add(userId));
    }
  };

  const performSearch = async () => {
    setLoading(true);
    const query = searchQuery.toLowerCase().trim();

    // Search posts
    const { data: postsData } = (await supabase
      .from("posts")
      .select(
        `
        *,
        users (username, display_name)
      `,
      )
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,company.ilike.%${query}%`,
      )
      .order("created_at", { ascending: false })
      .limit(20)) as any;

    setPosts(postsData || []);

    // Search users
    const { data: usersData } = (await supabase
      .from("users")
      .select("*")
      .or(
        `username.ilike.%${query}%,display_name.ilike.%${query}%,bio.ilike.%${query}%`,
      )
      .neq("id", currentUserId || "")
      .limit(20)) as any;

    setUsers(usersData || []);

    // Get unique companies from posts
    const { data: companiesData } = await supabase
      .from("posts")
      .select("company, company_color")
      .ilike("company", `%${query}%`)
      .limit(20);

    if (companiesData) {
      const uniqueCompanies = Array.from(
        new Map(
          (companiesData as any).map((c: any) => [c.company, c]),
        ).values(),
      );
      setCompanies(uniqueCompanies);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Search Everything
          </h1>
          <p className="text-gray-600">Discover posts, users, and companies</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for posts, users, or companies..."
            className="pl-10 h-12 rounded-xl border-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Searching posts...</p>
              </div>
            ) : searchQuery && posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border">
                <p className="text-gray-600">
                  No posts found for "{searchQuery}"
                </p>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post: any) => (
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
                    comments={0}
                  />
                ))}
              </div>
            ) : null}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Searching users...</p>
              </div>
            ) : searchQuery && users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border">
                <p className="text-gray-600">
                  No users found for "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(searchQuery ? users : suggestedUsers).map((user: any) => {
                  const isFollowing = followingIds.has(user.id);
                  return (
                    <div
                      key={user.id}
                      className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            router.push(`/profile/${user.username}`)
                          }
                        >
                          <Avatar className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-orange-500">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.display_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xl font-bold">
                                {user.display_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </button>
                        <div className="flex-1">
                          <button
                            onClick={() =>
                              router.push(`/profile/${user.username}`)
                            }
                            className="text-left"
                          >
                            <h3 className="text-lg font-bold hover:underline">
                              {user.display_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              @{user.username}
                            </p>
                            {user.bio && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {user.bio}
                              </p>
                            )}
                          </button>
                        </div>
                        {currentUserId && (
                          <Button
                            onClick={() => handleFollow(user.id)}
                            variant={isFollowing ? "outline" : "default"}
                            className={
                              isFollowing
                                ? ""
                                : "bg-gradient-to-br from-yellow-400 to-orange-500"
                            }
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!searchQuery && suggestedUsers.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border">
                    <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No users to suggest</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Searching companies...</p>
              </div>
            ) : searchQuery && companies.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border">
                <p className="text-gray-600">
                  No companies found for "{searchQuery}"
                </p>
              </div>
            ) : companies.length > 0 ? (
              <div className="space-y-4">
                {companies.map((company: any, index: number) => (
                  <button
                    key={index}
                    onClick={() =>
                      router.push(`/company/${company.company.toLowerCase()}`)
                    }
                    className="w-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: company.company_color }}
                      >
                        {company.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{company.company}</h3>
                        <p className="text-sm text-gray-600">View all posts</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </TabsContent>
        </Tabs>

        {!searchQuery && (
          <>
            {/* Popular Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Popular Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSearchQuery(category.name)}
                    className={`h-24 flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${category.gradient} text-white border-2 border-white/30 hover:scale-105 hover:shadow-lg transition-all shadow-md hover:border-white/50`}
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center py-12 bg-white rounded-2xl border">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                Start typing to search or click a category above
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          </main>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
