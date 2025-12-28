"use client";

import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Share2,
  Flag,
  Eye,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { StatusBadge } from "./ui/status-badge";
import { BookmarkButton } from "./ui/bookmark-button";

type PostStatus = "open" | "in_progress" | "resolved" | "closed" | "wont_fix";

interface PostCardProps {
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  companyColor: string;
  title: string;
  description: string;
  votes: number;
  author: string;
  authorInitial: string;
  timestamp: string;
  comments: number;
  postId?: string;
  status?: PostStatus;
  viewCount?: number;
  hasOfficialResponse?: boolean;
}

export default function PostCard({
  type,
  company,
  companyColor,
  title,
  description,
  votes: initialVotes,
  author,
  authorInitial,
  timestamp,
  comments,
  postId = "1",
  status = "open",
  viewCount = 0,
  hasOfficialResponse = false,
}: PostCardProps) {
  const router = useRouter();
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const fetchUserVote = async () => {
      const userId = getCurrentUserId();
      if (!userId || !postId) return;

      const { data } = await supabase
        .from("votes")
        .select("vote_type")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (data && (data as any).vote_type) {
        setUserVote((data as any).vote_type as "up" | "down");
      }
    };

    fetchUserVote();
  }, [postId]);

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

  const config =
    (typeConfig as Record<string, any>)[type] ?? typeConfig["Feature Request"];

  const handleVote = async (voteType: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    let newVotes;
    let newUserVote: "up" | "down" | null = voteType;

    if (userVote === voteType) {
      // Remove vote
      newUserVote = null;
      newVotes = votes + (voteType === "up" ? -1 : 1);

      await supabase
        .from("votes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
    } else {
      // Add or change vote
      if (userVote) {
        newVotes = votes + (voteType === "up" ? 2 : -2);
      } else {
        newVotes = votes + (voteType === "up" ? 1 : -1);
      }

      await supabase.from("votes").upsert({
        post_id: postId,
        user_id: userId,
        vote_type: voteType,
      } as any);
    }

    // Update post votes count
    // @ts-ignore - Supabase type issue
    await supabase.from("posts").update({ votes: newVotes }).eq("id", postId);

    setVotes(newVotes);
    setUserVote(newUserVote);
  };

  const handlePostClick = () => {
    router.push(`/post/${postId}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(
      "This post has been reported for review. Thank you for helping keep our community safe!",
    );
  };

  return (
    <div
      onClick={handlePostClick}
      className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md dark:hover:shadow-gray-800/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 sm:pt-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleVote("up", e)}
            className={cn(
              "h-6 w-6 sm:h-7 sm:w-7 rounded-md hover:bg-gray-100",
              userVote === "up" && "text-green-600",
            )}
          >
            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <span
            className={cn(
              "text-sm sm:text-base font-semibold tabular-nums py-0.5",
              userVote === "up" && "text-green-600",
              userVote === "down" && "text-red-600",
            )}
          >
            {votes}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleVote("down", e)}
            className={cn(
              "h-6 w-6 sm:h-7 sm:w-7 rounded-md hover:bg-gray-100",
              userVote === "down" && "text-red-600",
            )}
          >
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 flex-wrap">
            <Badge
              variant="secondary"
              className={cn(
                "rounded-md px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium border",
                config.bgColor,
                config.textColor,
                config.borderColor,
              )}
            >
              {config.icon} {type}
            </Badge>
            <StatusBadge status={status} size="sm" />
            {hasOfficialResponse && (
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 text-[10px] sm:text-xs">
                ✓ Official Response
              </Badge>
            )}
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">
              •
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/company/${company.toLowerCase()}`);
              }}
              className="text-xs sm:text-sm font-medium hover:underline"
              style={{ color: companyColor }}
            >
              {company}
            </button>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-900 dark:text-gray-100 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed line-clamp-2 sm:line-clamp-3">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-0.5 sm:pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/profile/${author.toLowerCase().replace(/\s+/g, "")}`,
                );
              }}
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-70 transition-opacity min-w-0 flex-1 mr-2"
            >
              <Avatar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0">
                <AvatarFallback className="bg-gray-200 text-[8px] sm:text-[10px] font-medium">
                  {authorInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {author}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 hidden sm:inline">
                • {timestamp}
              </span>
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {viewCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mr-1">
                  <Eye className="h-3 w-3" />
                  {viewCount > 999
                    ? `${(viewCount / 1000).toFixed(1)}k`
                    : viewCount}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 sm:gap-1.5 h-7 sm:h-8 px-1.5 sm:px-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick();
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{comments}</span>
              </Button>
              <BookmarkButton postId={postId} />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleShare}
              >
                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Flag Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
          onClick={handleReport}
          title="Report post"
        >
          <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
