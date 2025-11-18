"use client";

import { ChevronUp, ChevronDown, MessageSquare, Share2, Flag } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";

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
    "Complaint": {
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
    },
  };

  const config = typeConfig[type];

  const handleVote = async (voteType: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    let newVotes = votes;
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

      await supabase
        .from("votes")
        .upsert({
          post_id: postId,
          user_id: userId,
          vote_type: voteType,
        } as any);
    }

    // Update post votes count
    // @ts-ignore - Supabase type issue
    await supabase
      .from("posts")
      .update({ votes: newVotes })
      .eq("id", postId);

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
    alert("This post has been reported for review. Thank you for helping keep our community safe!");
  };

  return (
    <div 
      onClick={handlePostClick}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => handleVote("up", e)}
            className={cn(
              "h-7 w-7 rounded-md hover:bg-gray-100",
              userVote === "up" && "text-green-600"
            )}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          <span className={cn(
            "text-base font-semibold tabular-nums py-0.5",
            userVote === "up" && "text-green-600",
            userVote === "down" && "text-red-600"
          )}>
            {votes}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => handleVote("down", e)}
            className={cn(
              "h-7 w-7 rounded-md hover:bg-gray-100",
              userVote === "down" && "text-red-600"
            )}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex items-center gap-2 mb-2.5">
            <Badge 
              variant="secondary"
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium border",
                config.bgColor, 
                config.textColor, 
                config.borderColor
              )}
            >
              {config.icon} {type}
            </Badge>
            <span className="text-gray-300">•</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/company/${company.toLowerCase()}`);
              }}
              className="text-sm font-medium hover:underline"
              style={{ color: companyColor }}
            >
              {company}
            </button>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold mb-2 text-gray-900 leading-snug">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/${author.toLowerCase().replace(/\s+/g, '')}`);
              }}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-gray-200 text-[10px] font-medium">
                  {authorInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{author}</span>
              <span className="text-sm text-gray-400">• {timestamp}</span>
            </button>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 h-8 px-2.5 text-gray-600 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick();
                }}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{comments}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Flag Icon */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
          onClick={handleReport}
          title="Report post"
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}