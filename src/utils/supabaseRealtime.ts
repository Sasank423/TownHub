
import { supabase } from '@/integrations/supabase/client';

const REALTIME_LISTEN_DELAY = 2000;

// Generic table subscription function with proper callback type
const subscribeToTable = (
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void
) => {
  const userId = supabase.auth.getUser().then(({ data }) => data.user?.id);
  if (!userId) return null;

  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { event: event, schema: 'public', table: table },
      (payload) => {
        console.log('Change received!', payload);
        callback(payload);
      }
    )
    .subscribe();

  return channel;
};

// Specific subscription for notifications with proper callback type
const subscribeToNotifications = (
  userId: string, 
  callback: (payload: any) => void
) => {
  if (!userId) return null;
  
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  
  return channel;
};

// Specific subscription for reservations with proper callback type
const subscribeToReservations = (
  userId: string, 
  callback: (payload: any) => void
) => {
  if (!userId) return null;

  const channel = supabase
    .channel(`public:reservations:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservations', filter: `user_id=eq.${userId}` },
      (payload) => {
        console.log('Change received!', payload);
        setTimeout(() => callback(payload), REALTIME_LISTEN_DELAY);
      }
    )
    .subscribe();

  return channel;
};

// Specific subscription for messages with proper callback type
const subscribeToMessages = (
  userId: string, 
  callback: (payload: any) => void
) => {
  if (!userId) return null;
  
  const channel = supabase
    .channel(`messages:${userId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  
  return channel;
};

// Function to remove subscription
const removeSubscription = async (channel: any) => {
  if (channel) {
    await supabase.removeChannel(channel);
  }
};

// Alias for removeSubscription to match imports in components
const unsubscribe = removeSubscription;

// Function to get pending book requests
const getPendingBookRequests = async () => {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      id,
      user_id,
      action,
      description,
      item_type,
      user_name,
      reservations:reservations(*)
    `)
    .eq('action', 'reservation')
    .eq('is_processed', false)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching pending book requests:", error);
    return [];
  }

  return data || [];
};

// Function to update reservation status
const updateReservationStatus = async (reservationId: string, status: string, activityId: string) => {
  try {
    // Update the reservation status
    const { error: reservationError } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId);

    if (reservationError) throw reservationError;

    // Mark the activity as processed
    const { error: activityError } = await supabase
      .from('activities')
      .update({ is_processed: true })
      .eq('id', activityId);

    if (activityError) throw activityError;

    return true;
  } catch (error) {
    console.error(`Error updating reservation ${reservationId} status:`, error);
    return false;
  }
};

export { 
  subscribeToTable, 
  subscribeToNotifications, 
  subscribeToReservations, 
  subscribeToMessages, 
  removeSubscription,
  unsubscribe,
  getPendingBookRequests,
  updateReservationStatus 
};
