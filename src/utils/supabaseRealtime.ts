
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ReservationStatus } from '../types/models';

const REALTIME_LISTEN_DELAY = 2000;

// Generic table subscription function with proper callback type
const subscribeToTable = (
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void
): RealtimeChannel => {
  // Create and return the subscription channel
  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes' as any, // Type assertion to bypass TypeScript error
      { event, schema: 'public', table },
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
): RealtimeChannel => {
  if (!userId) return null;
  
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes' as any, // Type assertion to bypass TypeScript error
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
): RealtimeChannel => {
  if (!userId) return null;

  const channel = supabase
    .channel(`public:reservations:${userId}`)
    .on(
      'postgres_changes' as any, // Type assertion to bypass TypeScript error
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
): RealtimeChannel => {
  if (!userId) return null;
  
  const channel = supabase
    .channel(`messages:${userId}`)
    .on('postgres_changes' as any, // Type assertion to bypass TypeScript error
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
const removeSubscription = async (channel: RealtimeChannel): Promise<void> => {
  if (channel) {
    await supabase.removeChannel(channel);
  }
};

// Alias for removeSubscription to match imports in components
const unsubscribe = removeSubscription;

// Define interface for the activity data returned from the query
interface ActivityWithReservation {
  id: string;
  user_id: string;
  action: string;
  description: string;
  item_type: string | null;
  user_name: string | null;
  reservations: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    status: ReservationStatus;
    [key: string]: any;
  } | null;
}

// Function to get pending book requests
const getPendingBookRequests = async (): Promise<ActivityWithReservation[]> => {
  // Directly get pending reservations
  const { data: reservationData, error: reservationError } = await supabase
    .from('reservations')
    .select(`
      id,
      user_id,
      title,
      start_date,
      end_date,
      status,
      item_id,
      item_type
    `)
    .eq('status', 'Pending')
    .order('created_at', { ascending: false });

  if (reservationError) {
    console.error("Error fetching pending reservations:", reservationError);
    return [];
  }

  // If we have pending reservations, format them to match the expected interface
  if (reservationData && reservationData.length > 0) {
    console.log("Found pending reservations:", reservationData);
    
    // Format the reservations to match the ActivityWithReservation interface
    // without trying to look up user details, which might be causing issues
    return reservationData.map(res => ({
      id: `activity-${res.id}`, // Generate a unique activity ID
      user_id: res.user_id,
      action: 'reservation',
      description: `Reservation for ${res.title}`,
      item_type: res.item_type || 'book',
      user_name: `User ${res.user_id.substring(0, 8)}`,
      reservations: {
        id: res.id,
        title: res.title,
        start_date: res.start_date,
        end_date: res.end_date,
        status: res.status as ReservationStatus
      }
    }));
  }

  // Fallback: Try the original method of getting pending requests from activities
  const { data, error } = await supabase
    .from('activities')
    .select(`
      id,
      user_id,
      action,
      description,
      item_type,
      user_name,
      reservations (
        id,
        title,
        start_date,
        end_date,
        status
      )
    `)
    .eq('action', 'reservation')
    .eq('is_processed', false)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching pending book requests from activities:", error);
    return [];
  }

  // Handle cases where the join might not work correctly
  // Use type assertion to safely convert the response to our expected type
  const validData = (data || []).filter(item => {
    // Only include items where reservations is a valid object with required fields
    if (!item.reservations || typeof item.reservations !== 'object') {
      return false;
    }
    
    // Check if reservations has the required properties
    const res = item.reservations;
    return res && 
           'id' in res && 
           'title' in res && 
           'start_date' in res && 
           'end_date' in res && 
           'status' in res;
  }) as unknown as ActivityWithReservation[];

  return validData;
};

// Function to update reservation status
const updateReservationStatus = async (
  reservationId: string, 
  status: ReservationStatus, 
  activityId: string
): Promise<boolean> => {
  try {
    console.log(`Updating reservation ${reservationId} to status: ${status}`);
    
    // Update the reservation status
    const { error: reservationError } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId);

    if (reservationError) {
      console.error('Reservation update error:', reservationError);
      throw reservationError;
    }

    // Only try to update the activity if it's a valid ID (not our generated one)
    if (activityId && !activityId.startsWith('activity-')) {
      console.log(`Updating activity ${activityId} to processed`);
      // Mark the activity as processed
      const { error: activityError } = await supabase
        .from('activities')
        .update({ is_processed: true })
        .eq('id', activityId);

      if (activityError) {
        console.error('Activity update error:', activityError);
        // Don't throw here, we still want to consider the reservation update a success
      } else {
        console.log(`Successfully updated activity ${activityId}`);
      }
    } else {
      console.log(`Skipping activity update for ${activityId} (invalid or generated ID)`);
    }

    console.log(`Successfully updated reservation ${reservationId} to ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating reservation status:', error);
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
