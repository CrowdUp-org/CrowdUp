"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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
  priority: "low" | "medium" | "high" | "urgent";
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

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, urgent, comments, posts

  const fetchNotifications = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      let query = supabase
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
          priority,
          actor_id
        `,
        )
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false });

      if (filter === "unread") {
        query = query.eq("is_read", false);
      } else if (filter === "urgent") {
        query = query.in("priority", ["high", "urgent"]);
      } else if (filter === "comments") {
        query = query.in("notification_type", ["comment", "reply"]);
      } else if (filter === "posts") {
        query = query.in("notification_type", ["post_mention", "company_post"]);
      }

      const { data, error } = (await query.limit(50)) as {
        data: any[] | null;
        error: any;
      };

      if (!error && data) {
        // Fetch actor info
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
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (notificationId: string) => {
    await (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    await (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Stay updated with activity related to you and your companies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 border-orange-200 dark:border-orange-900"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={
              filter === "all"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : ""
            }
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={
              filter === "unread"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : ""
            }
          >
            Unread
          </Button>
          <Button
            variant={filter === "urgent" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("urgent")}
            className={
              filter === "urgent"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : ""
            }
          >
            Urgent
          </Button>
          <Button
            variant={filter === "posts" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("posts")}
            className={
              filter === "posts"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : ""
            }
          >
            Posts
          </Button>
          <Button
            variant={filter === "comments" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("comments")}
            className={
              filter === "comments"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : ""
            }
          >
            Comments
          </Button>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No notifications found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                {filter === "all"
                  ? "You don't have any notifications yet."
                  : `You don't have any ${filter} notifications.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => {
                const Icon =
                  notificationIcons[notification.notification_type] || Bell;
                const colorClass =
                  notificationColors[notification.notification_type] ||
                  "text-gray-500 bg-gray-50";

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-4 p-4 sm:p-6 transition-colors cursor-pointer ${
                      notification.is_read
                        ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        : "bg-orange-50/30 dark:bg-orange-950/10 hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            className={`text-sm sm:text-base ${
                              notification.is_read
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-gray-900 dark:text-gray-100 font-semibold"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {notification.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {notification.priority === "urgent" && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0.5 h-5"
                          >
                            Urgent
                          </Badge>
                        )}
                        {notification.priority === "high" && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0.5 h-5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          >
                            High Priority
                          </Badge>
                        )}
                        {notification.actor && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <div className="h-4 w-4 rounded-full overflow-hidden bg-gray-200">
                              {notification.actor.avatar_url ? (
                                <img
                                  src={notification.actor.avatar_url}
                                  alt={notification.actor.username}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-300 text-[8px] font-bold text-gray-600">
                                  {notification.actor.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span>{notification.actor.display_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0 self-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
