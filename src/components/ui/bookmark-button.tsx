"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  postId: string;
  className?: string;
  showCount?: boolean;
}

export function BookmarkButton({
  postId,
  className,
  showCount = false,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      const userId = getCurrentUserId();
      if (!userId) return;

      // Check if user has bookmarked
      const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      setIsBookmarked(!!data);
    };

    const getBookmarkCount = async () => {
      const { count } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      setBookmarkCount(count || 0);
    };

    checkBookmark();
    if (showCount) getBookmarkCount();
  }, [postId, showCount]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);

    try {
      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        setIsBookmarked(false);
        setBookmarkCount((prev) => Math.max(0, prev - 1));
      } else {
        await supabase
          .from("bookmarks")
          .insert({ post_id: postId, user_id: userId } as any);

        setIsBookmarked(true);
        setBookmarkCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleBookmark}
      disabled={loading}
      className={cn(
        "h-7 w-7 sm:h-8 sm:w-8 transition-all",
        isBookmarked
          ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800",
        className,
      )}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
    >
      <Bookmark
        className={cn(
          "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all",
          isBookmarked && "fill-current",
        )}
      />
      {showCount && bookmarkCount > 0 && (
        <span className="ml-1 text-xs">{bookmarkCount}</span>
      )}
    </Button>
  );
}
