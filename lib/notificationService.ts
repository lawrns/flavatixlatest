/**
 * Notification Service
 * 
 * Handles creating, fetching, and managing user notifications.
 * Integrates with Supabase for persistence.
 */
import { supabase } from './supabase';

export type NotificationType = 
  | 'follow' 
  | 'like' 
  | 'comment' 
  | 'tasting_invite' 
  | 'achievement' 
  | 'system' 
  | 'review';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  created_at: string;
  related_user_id?: string;
  related_tasting_id?: string;
  related_review_id?: string;
  // Joined data
  related_user?: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

export interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  related_user_id?: string;
  related_tasting_id?: string;
  related_review_id?: string;
}

class NotificationService {
  /**
   * Get all notifications for a user
   */
  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        related_user:profiles!notifications_related_user_id_fkey(
          full_name,
          avatar_url,
          username
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // TODO(notifications): Silent failure returns empty array - caller has no way to know
      // notifications failed to load vs user has no notifications. Consider:
      // 1. Throwing error and letting caller handle, or
      // 2. Returning { data: [], error } tuple pattern like other services.
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    return true;
  }

  /**
   * Create a new notification
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(params)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a follow notification
   */
  async notifyFollow(followerId: string, followedUserId: string, followerName: string): Promise<void> {
    await this.createNotification({
      user_id: followedUserId,
      type: 'follow',
      title: 'New Follower',
      message: `${followerName} started following you`,
      action_url: `/profile/${followerId}`,
      action_text: 'View Profile',
      related_user_id: followerId,
    });
  }

  /**
   * Create a like notification
   */
  async notifyLike(
    likerId: string, 
    contentOwnerId: string, 
    likerName: string,
    contentType: 'tasting' | 'review',
    contentId: string
  ): Promise<void> {
    // Don't notify if user likes their own content
    if (likerId === contentOwnerId) return;

    await this.createNotification({
      user_id: contentOwnerId,
      type: 'like',
      title: 'New Like',
      message: `${likerName} liked your ${contentType}`,
      action_url: contentType === 'tasting' ? `/tasting/${contentId}` : `/review/${contentId}`,
      action_text: `View ${contentType}`,
      related_user_id: likerId,
      ...(contentType === 'tasting' ? { related_tasting_id: contentId } : { related_review_id: contentId }),
    });
  }

  /**
   * Create a comment notification
   */
  async notifyComment(
    commenterId: string,
    contentOwnerId: string,
    commenterName: string,
    contentType: 'tasting' | 'review',
    contentId: string,
    commentPreview: string
  ): Promise<void> {
    // Don't notify if user comments on their own content
    if (commenterId === contentOwnerId) return;

    await this.createNotification({
      user_id: contentOwnerId,
      type: 'comment',
      title: 'New Comment',
      message: `${commenterName} commented: "${commentPreview.slice(0, 50)}${commentPreview.length > 50 ? '...' : ''}"`,
      action_url: contentType === 'tasting' ? `/tasting/${contentId}` : `/review/${contentId}`,
      action_text: 'View Comment',
      related_user_id: commenterId,
      ...(contentType === 'tasting' ? { related_tasting_id: contentId } : { related_review_id: contentId }),
    });
  }

  /**
   * Create a tasting invite notification
   */
  async notifyTastingInvite(
    inviterId: string,
    inviteeId: string,
    inviterName: string,
    tastingId: string,
    tastingName: string
  ): Promise<void> {
    await this.createNotification({
      user_id: inviteeId,
      type: 'tasting_invite',
      title: 'Tasting Invitation',
      message: `${inviterName} invited you to join "${tastingName}"`,
      action_url: `/tasting/${tastingId}`,
      action_text: 'Join Tasting',
      related_user_id: inviterId,
      related_tasting_id: tastingId,
    });
  }

  /**
   * Create an achievement notification
   */
  async notifyAchievement(
    userId: string,
    achievementTitle: string,
    achievementMessage: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'achievement',
      title: achievementTitle,
      message: achievementMessage,
      action_url: '/dashboard',
      action_text: 'View Profile',
    });
  }

  /**
   * Create a system notification
   */
  async notifySystem(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'system',
      title,
      message,
      action_url: actionUrl,
      action_text: actionText,
    });
  }

  /**
   * Create a review notification (when someone reviews something you also reviewed)
   */
  async notifyReview(
    reviewerId: string,
    targetUserId: string,
    reviewerName: string,
    reviewId: string,
    itemName: string
  ): Promise<void> {
    if (reviewerId === targetUserId) return;

    await this.createNotification({
      user_id: targetUserId,
      type: 'review',
      title: 'New Review',
      message: `${reviewerName} also reviewed "${itemName}"`,
      action_url: `/review/summary/${reviewId}`,
      action_text: 'View Review',
      related_user_id: reviewerId,
      related_review_id: reviewId,
    });
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): () => void {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
