"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrendingPage() {
  const router = useRouter();

  const trendingCompanies = [
    {
      name: "Instagram",
      followers: "15.4K",
      growth: "+12%",
      posts: 347,
      initial: "I",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      id: "instagram",
    },
    {
      name: "WhatsApp",
      followers: "12.3K",
      growth: "+8%",
      posts: 289,
      initial: "W",
      color: "bg-green-500",
      id: "whatsapp",
    },
    {
      name: "Spotify",
      followers: "9.8K",
      growth: "+15%",
      posts: 234,
      initial: "S",
      color: "bg-green-600",
      id: "spotify",
    },
    {
      name: "Discord",
      followers: "8.7K",
      growth: "+5%",
      posts: 198,
      initial: "D",
      color: "bg-indigo-500",
      id: "discord",
    },
    {
      name: "Netflix",
      followers: "7.2K",
      growth: "+10%",
      posts: 176,
      initial: "N",
      color: "bg-red-600",
      id: "netflix",
    },
    {
      name: "Twitter",
      followers: "6.9K",
      growth: "+7%",
      posts: 245,
      initial: "T",
      color: "bg-blue-400",
      id: "twitter",
    },
  ];

  const trendingTopics = [
    { name: "UI/UX Issues", posts: 234, icon: "🎨" },
    { name: "Performance", posts: 189, icon: "⚡" },
    { name: "Dark Mode", posts: 156, icon: "🌙" },
    { name: "Mobile Bugs", posts: 143, icon: "📱" },
    { name: "Feature Requests", posts: 298, icon: "💡" },
    { name: "Security", posts: 87, icon: "🔒" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Flame className="h-10 w-10 text-orange-500" />
            <h1 className="text-4xl font-bold">Trending Now</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover the most popular companies and topics in the community
          </p>
        </div>

        {/* Trending Companies */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              Trending Companies
            </h2>
            <Button variant="outline" onClick={() => router.push("/search")}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingCompanies.map((company) => (
              <div
                key={company.name}
                onClick={() => router.push(`/company/${company.id}`)}
                className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-all cursor-pointer hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <Avatar
                    className={`h-16 w-16 ${company.color} ring-4 ring-gray-100`}
                  >
                    <AvatarFallback
                      className={`${company.color} text-white text-xl font-bold`}
                    >
                      {company.initial}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {company.growth}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">{company.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{company.followers}</span>
                  </div>
                  <div className="text-gray-600">{company.posts} posts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Trending Topics
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTopics.map((topic) => (
              <div
                key={topic.name}
                className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-all cursor-pointer hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{topic.icon}</span>
                  <h3 className="text-lg font-bold">{topic.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {topic.posts} active discussions
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
