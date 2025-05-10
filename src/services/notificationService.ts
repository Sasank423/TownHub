
import { supabase } from '../integrations/supabase/client';
import { Notification } from '../types/models';

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }

  return data.map(notification => ({
    id: notification.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    createdAt: notification.created_at,
    isRead: notification.is_read,
    relatedReservationId: notification.related_reservation_id
  }));
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    return false;
  }

  return true;
};

export const createNotification = async (notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedReservationId?: string;
}): Promise<Notification | null> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        related_reservation_id: notification.relatedReservationId,
        is_read: false
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    message: data.message,
    createdAt: data.created_at,
    isRead: data.is_read,
    relatedReservationId: data.related_reservation_id
  };
};
