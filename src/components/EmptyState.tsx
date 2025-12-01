"use client";

import { ReactNode } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Search, 
  Bookmark, 
  Bell, 
  Users, 
  FileText,
  Plus,
  Sparkles
} from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "compact" | "card";
  className?: string;
}

const defaultIcons: Record<string, typeof MessageSquare> = {
  posts: FileText,
  search: Search,
  bookmarks: Bookmark,
  notifications: Bell,
  followers: Users,
  comments: MessageSquare,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const isCompact = variant === "compact";
  const isCard = variant === "card";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-8 px-4" : isCard ? "py-12 px-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800" : "py-16 px-6",
        className
      )}
    >
      {/* Animated Icon Container */}
      <div className={cn(
        "relative mb-4",
        isCompact ? "mb-3" : "mb-6"
      )}>
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl scale-150" />
        
        {/* Icon circle */}
        <div className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700",
          isCompact ? "h-12 w-12" : "h-20 w-20"
        )}>
          {icon || (
            <Sparkles className={cn(
              "text-gray-400 dark:text-gray-500",
              isCompact ? "h-5 w-5" : "h-8 w-8"
            )} />
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-semibold text-gray-900 dark:text-gray-100",
        isCompact ? "text-base mb-1" : "text-xl mb-2"
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn(
        "text-gray-500 dark:text-gray-400 max-w-sm",
        isCompact ? "text-sm" : "text-base mb-6"
      )}>
        {description}
      </p>

      {/* Action Button */}
      {action && !isCompact && (
        <Button
          onClick={action.onClick}
          className="mt-4 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoPostsEmptyState({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-gray-400" />}
      title="No posts yet"
      description="Be the first to share your feedback with the community!"
      action={{ label: "Create Post", onClick: onCreatePost }}
      variant="card"
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-gray-400" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try different keywords or check for typos.`}
      variant="card"
    />
  );
}

export function NoBookmarksEmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      icon={<Bookmark className="h-8 w-8 text-gray-400" />}
      title="No saved posts"
      description="Posts you bookmark will appear here for easy access later."
      action={{ label: "Browse Posts", onClick: onBrowse }}
      variant="card"
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={<Bell className="h-6 w-6 text-gray-400" />}
      title="No notifications yet"
      description="We'll notify you when something happens."
      variant="compact"
    />
  );
}

export function NoCommentsEmptyState() {
  return (
    <EmptyState
      icon={<MessageSquare className="h-6 w-6 text-gray-400" />}
      title="No comments yet"
      description="Be the first to share your thoughts!"
      variant="compact"
    />
  );
}

export function NoFollowersEmptyState({ type }: { type: "followers" | "following" }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-gray-400" />}
      title={type === "followers" ? "No followers yet" : "Not following anyone"}
      description={type === "followers" 
        ? "When people follow this account, they'll show up here."
        : "Follow people to see their posts in your feed."
      }
      variant="card"
    />
  );
}
