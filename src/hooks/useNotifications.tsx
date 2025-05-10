
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/models';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService';
import { subscribeToTable, unsubscribe } from '../utils/supabaseRealtime';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
      }
      return success;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      let success = true;
      
      for (const notification of unreadNotifications) {
        const result = await markNotificationAsRead(notification.id);
        if (!result) success = false;
      }
      
      if (success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
      
      return success;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [notifications]);

  // Initial fetch and real-time updates setup
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupNotifications = async () => {
      await fetchNotifications();
      
      if (userId) {
        // Subscribe to real-time updates for notifications
        channel = subscribeToTable('notifications', '*', (payload) => {
          // Only process notifications for this user
          if (payload.new && payload.new.user_id === userId) {
            if (payload.eventType === 'INSERT') {
              setNotifications(prev => [
                {
                  id: payload.new.id,
                  userId: payload.new.user_id,
                  title: payload.new.title,
                  message: payload.new.message,
                  createdAt: payload.new.created_at,
                  isRead: payload.new.is_read,
                  relatedReservationId: payload.new.related_reservation_id
                }, 
                ...prev
              ]);
              if (!payload.new.is_read) {
                setUnreadCount(prev => prev + 1);
              }
            } else if (payload.eventType === 'UPDATE') {
              setNotifications(prev => 
                prev.map(n => n.id === payload.new.id ? {
                  id: payload.new.id,
                  userId: payload.new.user_id,
                  title: payload.new.title,
                  message: payload.new.message,
                  createdAt: payload.new.created_at,
                  isRead: payload.new.is_read,
                  relatedReservationId: payload.new.related_reservation_id
                } : n)
              );
              
              // Update unread count if read status changed
              if (!payload.old.is_read && payload.new.is_read) {
                setUnreadCount(prev => Math.max(prev - 1, 0));
              } else if (payload.old.is_read && !payload.new.is_read) {
                setUnreadCount(prev => prev + 1);
              }
            } else if (payload.eventType === 'DELETE') {
              setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
              if (!payload.old.is_read) {
                setUnreadCount(prev => Math.max(prev - 1, 0));
              }
            }
          }
        });
      }
    };

    setupNotifications();

    // Cleanup
    return () => {
      if (channel) {
        unsubscribe(channel);
      }
    };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
