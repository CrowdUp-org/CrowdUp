"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Info, Star, Shield, Trophy } from "lucide-react";
import { Button } from "./button";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    subscribeToNotifications,
    Notification
} from "@/lib/notifications";
import { getCurrentUserId } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const userId = getCurrentUserId();
        if (!userId) return;

        fetchNotifications();

        const subscription = subscribeToNotifications(userId, (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Optional: Play sound or show toast
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        setLoading(true);
        const [data, count] = await Promise.all([
            getNotifications(userId),
            getUnreadCount(userId)
        ]);
        setNotifications(data);
        setUnreadCount(count);
        setLoading(false);
    };

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await markAsRead(id);
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        const success = await markAllAsRead(userId);
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        setIsOpen(false);
        if (notif.link) {
            router.push(notif.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'badge': return <AwardIcon />;
            case 'level': return <LevelIcon />;
            case 'verification': return <VerificationIcon />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 rounded-full h-10 w-10"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={cn(
                                            "p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group relative",
                                            !notif.is_read && "bg-blue-50/30"
                                        )}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-semibold text-gray-900",
                                                !notif.is_read && "pr-4"
                                            )}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                {notif.content}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-2">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="absolute top-4 right-4 h-2 w-2 bg-blue-600 rounded-full group-hover:hidden"
                                            />
                                        )}
                                        {!notif.is_read && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="hidden group-hover:flex absolute top-3 right-3 h-5 w-5 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const AwardIcon = () => (
    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
        <Trophy className="h-4 w-4 text-yellow-600" />
    </div>
);

const LevelIcon = () => (
    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
        <Star className="h-4 w-4 text-green-600" />
    </div>
);

const VerificationIcon = () => (
    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Shield className="h-4 w-4 text-blue-600" />
    </div>
);
