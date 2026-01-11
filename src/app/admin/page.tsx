"use client";

import Header from "@/components/Header";
import {
  LayoutDashboard,
  Users,
  Shield,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Target,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isCurrentUserAdmin,
  getPlatformStats,
  getTrendingCompanies,
  getTrendingTopics,
} from "@/lib/services/verification.service";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [trendingCompanies, setTrendingCompanies] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const admin = await isCurrentUserAdmin(userId);
    if (!admin) {
      router.push("/");
      return;
    }
    setIsAdmin(true);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const [statsData, companies, topics] = await Promise.all([
      getPlatformStats(),
      getTrendingCompanies(5),
      getTrendingTopics(5),
    ]);
    setStats(statsData);
    setTrendingCompanies(companies);
    setTrendingTopics(topics);
    setLoading(false);
  };

  if (!isAdmin) return null;

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Avg. Engagement",
      value:
        stats?.totalPosts > 0
          ? (stats?.totalVotes / stats?.totalPosts).toFixed(1)
          : 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Votes",
      value: stats?.totalVotes || 0,
      icon: ArrowUpRight,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
              <LayoutDashboard className="h-8 w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Platform overview and real-time community trends
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/verification")}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Verifications
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/audit")}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Audit Logs
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <Card key={idx} className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {card.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : card.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Companies */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-blue-600" />
                  Trending Companies
                </CardTitle>
                <span className="text-xs text-gray-500 font-normal">
                  Last 30 Days
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : trendingCompanies.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No data available
                </div>
              ) : (
                <div className="divide-y">
                  {trendingCompanies.map((company, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: company.company_color }}
                        >
                          {company.company?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {company.company}
                          </p>
                          <p className="text-xs text-gray-500">
                            {company.post_count} reports
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            company.growth_percent >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {company.growth_percent > 0 ? "+" : ""}
                          {company.growth_percent}%
                        </p>
                        <p className="text-[10px] text-gray-400">Growth</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Trending Topics
                </CardTitle>
                <span className="text-xs text-gray-500 font-normal">
                  Last 30 Days
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : trendingTopics.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No data available
                </div>
              ) : (
                <div className="divide-y">
                  {trendingTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {topic.topic}
                          </p>
                          <p className="text-xs text-gray-500">
                            Common report type
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {topic.post_count}
                        </p>
                        <p className="text-[10px] text-gray-400">Reports</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
