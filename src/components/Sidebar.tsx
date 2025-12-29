"use client";

import { TrendingUp, Users, Trophy, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { isCurrentUserAdmin } from "@/lib/services/verification.service";

export default function Sidebar() {
  const router = useRouter();
  const [trendingCompanies, setTrendingCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, companies: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTrendingCompanies();
    fetchStats();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const userId = getCurrentUserId();
    if (userId) {
      const admin = await isCurrentUserAdmin(userId);
      setIsAdmin(admin);
    }
  };

  const fetchTrendingCompanies = async () => {
    const { data } = await supabase
      .from("posts")
      .select("company, company_color")
      .limit(100);

    if (data) {
      const companyCounts: Record<string, { count: number; color: string }> =
        {};
      data.forEach((post: any) => {
        if (!companyCounts[post.company]) {
          companyCounts[post.company] = { count: 0, color: post.company_color };
        }
        companyCounts[post.company].count++;
      });

      const sorted = Object.entries(companyCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 4)
        .map(([name, data]) => ({
          name,
          followers: `${data.count} posts`,
          initial: name.charAt(0),
          color: data.color,
          id: name.toLowerCase(),
        }));

      setTrendingCompanies(sorted);
    }
  };

  const fetchStats = async () => {
    const [usersRes, postsRes, companiesRes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("company").limit(1000),
    ]);

    const uniqueCompanies = companiesRes.data
      ? new Set(companiesRes.data.map((p: any) => p.company)).size
      : 0;

    setStats({
      users: usersRes.count || 0,
      posts: postsRes.count || 0,
      companies: uniqueCompanies,
    });
  };

  return (
    <div className="space-y-4 sticky top-24">
      {/* Community Feed */}
      <div className="rounded-2xl bg-orange-50 p-5 border border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-base text-gray-900">
            Community Feed
          </h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Latest feedback and suggestions from the community
        </p>
      </div>

      {/* Leaderboard Link */}
      <button
        onClick={() => router.push("/leaderboard")}
        className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 p-5 text-white hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/20"
      >
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6" />
          <div className="text-left">
            <h3 className="font-semibold text-base">Leaderboard</h3>
            <p className="text-sm text-white/80">View top contributors</p>
          </div>
        </div>
      </button>

      {/* Admin Dashboard Link */}
      {isAdmin && (
        <button
          onClick={() => router.push("/admin/users")}
          className="w-full rounded-2xl bg-blue-600 p-5 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <div className="text-left">
              <h3 className="font-semibold text-base">Admin Panel</h3>
              <p className="text-sm text-white/80">
                Manage users & verification
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Trending Groups */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-base text-gray-900">
            Trending Group
          </h3>
        </div>

        <div className="space-y-3">
          {trendingCompanies.length > 0 ? (
            trendingCompanies.map((company) => (
              <button
                key={company.name}
                onClick={() => router.push(`/company/${company.id}`)}
                className="w-full flex items-center justify-between hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: company.color }}
                  >
                    {company.initial}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900">
                      {company.name}
                    </p>
                    <p className="text-xs text-gray-500">{company.followers}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No trending companies yet
            </p>
          )}
        </div>
      </div>

      {/* Community Stats */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-base text-gray-900">Community</h3>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Total Users</span>
            <span className="font-semibold text-gray-900">{stats.users}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Total Posts</span>
            <span className="font-semibold text-gray-900">{stats.posts}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Companies</span>
            <span className="font-semibold text-gray-900">
              {stats.companies}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
