
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Creates a real-time subscription to a table
 * 
 * @param table - The table name to subscribe to
 * @param event - The event type to listen for (INSERT, UPDATE, DELETE, or * for all)
 * @param callback - The callback function to execute when an event is received
 * @returns The channel object that can be used to unsubscribe
 */
export const subscribeToTable = (
  table: string, 
  event: string,
  callback: (payload: any) => void
): RealtimeChannel => {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes' as any, 
      {
        event, 
        schema: 'public', 
        table
      }, 
      callback
    )
    .subscribe();
};

/**
 * Unsubscribes from a channel
 * 
 * @param channel - The channel to unsubscribe from
 */
export const unsubscribe = (channel: RealtimeChannel): void => {
  supabase.removeChannel(channel);
};

/**
 * Creates a real-time subscription to a table with filters
 * 
 * @param table - The table name to subscribe to
 * @param event - The event type to listen for (INSERT, UPDATE, DELETE, or * for all)
 * @param filter - The filter to apply to the subscription (column=eq.value format)
 * @param callback - The callback function to execute when an event is received
 * @returns The channel object that can be used to unsubscribe
 */
export const subscribeToTableWithFilter = (
  table: string,
  event: PostgresChangeEvent = '*',
  filter: { column: string; value: any },
  callback: (payload: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`public:${table}:${filter.column}:${filter.value}`)
    .on(
      'postgres_changes', 
      {
        event,
        schema: 'public',
        table,
        filter: `${filter.column}=eq.${filter.value}`
      },
      callback
    )
    .subscribe();
  
  return channel;
};

/**
 * Creates a reservation and activity entry for a book request
 * 
 * @param bookId - The ID of the book being requested
 * @param bookTitle - The title of the book being requested
 * @param userId - The ID of the user making the request
 * @param userName - The name of the user making the request
 * @returns A promise that resolves to the created reservation or null if there was an error
 */
export const createBookRequest = async (
  bookId: string,
  bookTitle: string,
  userId: string,
  userName: string
): Promise<any> => {
  try {
    // Create a reservation in the reservations table
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        item_id: bookId,
        item_type: 'book',
        title: bookTitle,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        status: 'Pending',
        notes: 'Requested by member'
      })
      .select()
      .single();

    if (reservationError) throw reservationError;

    // Create an activity entry to trigger the notification
    const { error: activityError } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        user_name: userName,
        action: 'reservation',
        description: bookTitle,
        item_id: bookId,
        item_type: 'book',
        is_processed: false
      });

    if (activityError) throw activityError;

    return reservation;
  } catch (error) {
    console.error('Error creating book request:', error);
    return null;
  }
};

/**
 * Updates a reservation status and marks the related activity as processed
 * 
 * @param reservationId - The ID of the reservation being updated
 * @param status - The new status of the reservation (Approved or Declined)
 * @param activityId - The ID of the related activity
 * @returns A promise that resolves to true if the update was successful
 */
export const updateReservationStatus = async (
  reservationId: string,
  status: 'Approved' | 'Declined',
  activityId: string
): Promise<boolean> => {
  try {
    // Update reservation status
    const { error: reservationError } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId);

    if (reservationError) throw reservationError;

    // Mark activity as processed
    const { error: activityError } = await supabase
      .from('activities')
      .update({ is_processed: true })
      .eq('id', activityId);

    if (activityError) throw activityError;

    return true;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return false;
  }
};

/**
 * Gets all pending book requests for librarians
 * 
 * @returns A promise that resolves to an array of pending book requests
 */
export const getPendingBookRequests = async (): Promise<any[]> => {
  try {
    // First approach: Get directly from reservations table
    const { data: reservationData, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        *,
        user:user_id (name, email)
      `)
      .eq('status', 'Pending');

    if (reservationError) throw reservationError;
    
    // Format the data to match the expected structure
    const formattedData = reservationData.map(reservation => ({
      id: reservation.id,
      activityId: reservation.id, // Using reservation ID as activity ID
      user_id: reservation.user_id,
      user_name: reservation.user?.name || `User #${reservation.user_id}`,
      item_id: reservation.item_id,
      item_type: reservation.item_type,
      action: 'reservation',
      description: reservation.title,
      is_processed: false,
      created_at: reservation.created_at,
      reservations: {
        id: reservation.id,
        status: reservation.status,
        title: reservation.title,
        start_date: reservation.start_date,
        end_date: reservation.end_date
      }
    }));
    
    return formattedData || [];
  } catch (error) {
    console.error('Error fetching pending book requests:', error);
    return [];
  }
};
