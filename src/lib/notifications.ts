import { supabase } from './supabase';

export type NotificationType = 'badge' | 'level' | 'verification' | 'milestone';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    content: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    link: string | null = null
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                content,
                link
            });

        if (error) {
            console.error('Error creating notification:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Unexpected error creating notification:', error);
        return { success: false, error: 'Failed to create notification' };
    }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
    userId: string,
    limit: number = 20
): Promise<Notification[]> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching notifications:', error);
        return [];
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        return !error;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        return !error;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) return 0;
        return count || 0;
    } catch (error) {
        return 0;
    }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
) {
    return supabase
        .channel(`user-notifications-${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            },
            (payload) => {
                callback(payload.new as Notification);
            }
        )
        .subscribe();
}
