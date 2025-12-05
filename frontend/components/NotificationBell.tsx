'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { initSocket, getSocket } from '@/lib/socket';
import { notificationAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'reply' | 'accept_answer' | 'mention' | 'badge_earned';
  title: string;
  message: string;
  data?: {
    postId?: string;
    commentId?: string;
    userId?: string;
    link?: string;
    senderName?: string;
    senderImage?: string;
  };
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationBell() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({ limit: 20 });
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.meta?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Silently fail - notifications are not critical
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Silently fail
    }
  };

  useEffect(() => {
    if (user?._id && token) {
      // Initialize socket connection
      const socket = initSocket(user._id);

      // Fetch existing notifications
      fetchNotifications();

      // Listen for new real-time notifications
      socket.on('notification', (notification: Notification) => {
        console.log('📬 Received notification:', notification);
        
        // Add to notifications list at the beginning
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
          action: notification.data?.link ? {
            label: 'View',
            onClick: () => router.push(notification.data!.link!),
          } : undefined,
        });
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [user, token]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate to link
    if (notification.data?.link) {
      router.push(notification.data!.link);
      setShowDropdown(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            fetchNotifications();
          }
        }}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Actor Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {notification.data?.senderImage ? (
                        <img
                          src={notification.data.senderImage}
                          alt={notification.data.senderName || 'User'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (notification.data?.senderName?.charAt(0) || 'N').toUpperCase()
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Type Badge & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-lg">
                        {notification.type === 'like' && '❤️'}
                        {notification.type === 'comment' && '💬'}
                        {notification.type === 'reply' && '↩️'}
                        {notification.type === 'accept_answer' && '✅'}
                        {notification.type === 'badge_earned' && '🏆'}
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                        className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
