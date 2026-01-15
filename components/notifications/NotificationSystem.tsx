import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  UserPlus,
  Heart,
  MessageCircle,
  Users,
} from 'lucide-react';
import notificationService, { Notification, NotificationType } from '@/lib/notificationService';

interface NotificationSystemProps {
  userId: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId }) => {
  // Notifications not yet implemented - hide until feature is ready
  return null;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(userId, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const success = await notificationService.markAllAsRead(userId);
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    const success = await notificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      setShowModal(false);
      router.push(notification.action_url);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      case 'tasting_invite':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'achievement':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setShowModal(true)} className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notifications Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Notifications" size="md">
        <ModalBody>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <>
                {unreadCount > 0 && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      variant={notification.read ? 'default' : 'elevated'}
                      className={`transition-all duration-200 ${
                        !notification.read ? 'border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <CardContent>
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatTimestamp(notification.created_at)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {notification.action_url && notification.action_text && (
                              <div className="mt-3">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  {notification.action_text}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default NotificationSystem;
