"use client";

import { Trophy, TrendingUp } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface PodiumPost {
  postId: string;
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  companyColor: string;
  title: string;
  votes: number;
  rank: 1 | 2 | 3;
}

interface PodiumViewProps {
  posts: [PodiumPost, PodiumPost, PodiumPost];
}

export default function PodiumView({ posts }: PodiumViewProps) {
  const router = useRouter();

  // Sort posts by rank: [2nd, 1st, 3rd] for visual layout
  const [second, first, third] = [
    posts.find((p) => p.rank === 2)!,
    posts.find((p) => p.rank === 1)!,
    posts.find((p) => p.rank === 3)!,
  ];

  const typeConfig = {
    "Bug Report": {
      icon: "🐛",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
    "Feature Request": {
      icon: "💡",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    Complaint: {
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
    },
  };

  const PodiumCard = ({
    post,
    position,
  }: {
    post: PodiumPost;
    position: "first" | "second" | "third";
  }) => {
    const config = typeConfig[post.type];

    const podiumHeights = {
      first: "h-32",
      second: "h-20",
      third: "h-16",
    };

    return (
      <div className="flex flex-col items-center">
        {/* Card - Same size and color for all */}
        <div
          onClick={() => router.push(`/post/${post.postId}`)}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-white p-5 cursor-pointer transition-all hover:scale-105 hover:shadow-xl w-full",
            "h-64 border-gray-200 shadow-md",
            "hover:-translate-y-1",
          )}
        >
          {/* Content */}
          <div className="flex flex-col flex-1 justify-between">
            <div className="flex-1 overflow-hidden">
              {/* Type and Company */}
              <div className="flex flex-col gap-2 mb-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium border w-fit",
                    config.bgColor,
                    config.textColor,
                    config.borderColor,
                  )}
                >
                  {config.icon} {post.type}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/company/${post.company.toLowerCase()}`);
                  }}
                  className="text-sm font-semibold hover:underline w-fit"
                  style={{ color: post.companyColor }}
                >
                  {post.company}
                </button>
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-gray-900 leading-tight mb-3 line-clamp-3">
                {post.title}
              </h3>
            </div>

            {/* Votes */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <TrendingUp className="h-5 w-5 flex-shrink-0 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {post.votes}
              </span>
              <span className="text-sm text-gray-500 ml-1 whitespace-nowrap">
                votes
              </span>
            </div>
          </div>
        </div>

        {/* Podium Base - Same color for all */}
        <div
          className={cn(
            "w-full rounded-b-xl shadow-lg mt-2 flex items-center justify-center font-bold text-lg transition-all",
            "bg-gradient-to-b from-orange-100 to-orange-200 text-gray-700",
            podiumHeights[position],
          )}
        >
          <span className="opacity-70">#{post.rank}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Top Posts This Week
          </h2>
          <p className="text-sm text-gray-600">
            Most upvoted posts by the community
          </p>
        </div>
      </div>

      {/* Podium Layout */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {/* 2nd Place */}
        <PodiumCard post={second} position="second" />

        {/* 1st Place */}
        <PodiumCard post={first} position="first" />

        {/* 3rd Place */}
        <PodiumCard post={third} position="third" />
      </div>
    </div>
  );
}
