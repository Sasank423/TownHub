
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
  event: PostgresChangeEvent = '*',
  callback: (payload: any) => void
): RealtimeChannel => {
  // Create a channel with a unique name for this subscription
  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes', 
      { event, schema: 'public', table },
      callback
    )
    .subscribe();
  
  return channel;
};

/**
 * Unsubscribes from a channel
 * 
 * @param channel - The channel to unsubscribe from
 */
export const unsubscribe = (channel: RealtimeChannel): void => {
  supabase.removeChannel(channel);
};
