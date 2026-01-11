"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  ThumbsUp,
  MessageSquare,
  Reply,
  UserPlus,
  AlertCircle,
  Building2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  notification_type:
    | "vote"
    | "comment"
    | "reply"
    | "follow"
    | "mention"
    | "status_change"
    | "official_response"
    | "post_mention"
    | "company_post"
    | "vote_milestone"
    | "priority_alert"
    | "trending"
    | "sentiment_alert";
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

const notificationIcons: Record<string, typeof Bell> = {
  vote: ThumbsUp,
  comment: MessageSquare,
  reply: Reply,
  follow: UserPlus,
  mention: Bell,
  status_change: AlertCircle,
  official_response: Building2,
  post_mention: Bell,
  company_post: Building2,
  vote_milestone: ThumbsUp,
  priority_alert: AlertTriangle,
  trending: TrendingUp,
  sentiment_alert: AlertTriangle,
};

const notificationColors: Record<string, string> = {
  vote: "text-green-500 bg-green-50 dark:bg-green-950",
  comment: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  reply: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  follow: "text-pink-500 bg-pink-50 dark:bg-pink-950",
  mention: "text-orange-500 bg-orange-50 dark:bg-orange-950",
  status_change: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  official_response: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950",
  post_mention: "text-orange-500 bg-orange-50 dark:bg-orange-950",
  company_post: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  vote_milestone: "text-green-500 bg-green-50 dark:bg-green-950",
  priority_alert: "text-red-500 bg-red-50 dark:bg-red-950",
  trending: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  sentiment_alert: "text-red-500 bg-red-50 dark:bg-red-950",
};

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = (await supabase
        .from("notifications")
        .select(
          `
          id,
          notification_type,
          title,
          message,
          link,
          is_read,
          created_at,
          actor_id
        `,
        )
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)) as { data: any[] | null; error: any };

      if (!error && data) {
        // Fetch actor info for each notification
        const actorIds = [
          ...new Set(
            data.filter((n: any) => n.actor_id).map((n: any) => n.actor_id),
          ),
        ];
        let actorsMap: Record<string, any> = {};

        if (actorIds.length > 0) {
          const { data: actors } = await supabase
            .from("users")
            .select("id, username, display_name, avatar_url")
            .in("id", actorIds);

          if (actors) {
            actorsMap = Object.fromEntries(
              (actors as any[]).map((a: any) => [a.id, a]),
            );
          }
        }

        const notificationsWithActors = data.map((n: any) => ({
          ...n,
          actor: n.actor_id ? actorsMap[n.actor_id] : undefined,
        })) as Notification[];

        setNotifications(notificationsWithActors);
        setUnreadCount(
          notificationsWithActors.filter((n) => !n.is_read).length,
        );
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const userId = getCurrentUserId();
    if (userId) {
      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userId}`,
          },
          () => {
            fetchNotifications();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    await (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    await (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg sm:rounded-xl transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8 sm:h-10 sm:w-10 relative"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-[10px] sm:text-xs font-bold text-white shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No notifications yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We&apos;ll notify you when something happens
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon =
                notificationIcons[notification.notification_type] || Bell;
              const colorClass =
                notificationColors[notification.notification_type] ||
                "text-gray-500 bg-gray-50";

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                    notification.is_read
                      ? "bg-white dark:bg-gray-950"
                      : "bg-orange-50/50 dark:bg-orange-950/20"
                  } hover:bg-gray-50 dark:hover:bg-gray-900`}
                >
                  <div
                    className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${notification.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-gray-100 font-medium"}`}
                    >
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0 h-2 w-2 rounded-full bg-orange-500 mt-2" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-2">
            <button
              onClick={() => router.push("/notifications")}
              className="w-full text-center text-sm text-orange-500 hover:text-orange-600 font-medium py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
            >
              View all notifications
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
