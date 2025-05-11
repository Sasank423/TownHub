import { supabase } from '@/integrations/supabase/client';

const REALTIME_LISTEN_DELAY = 2000;

const subscribeToTable = (
  table: string,
  userId: string,
  callback: () => void
) => {
  if (!userId) return null;

  const channel = supabase
    .channel(`public:${table}:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: table, filter: `user_id=eq.${userId}` },
      (payload) => {
        console.log('Change received!', payload)
        setTimeout(callback, REALTIME_LISTEN_DELAY);
      }
    )
    .subscribe()

  return channel;
};

const subscribeToNotifications = (userId: string, callback: () => void) => {
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

const subscribeToReservations = (userId: string, callback: () => void) => {
  if (!userId) return null;

  const channel = supabase
    .channel(`public:reservations:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservations', filter: `user_id=eq.${userId}` },
      (payload) => {
        console.log('Change received!', payload)
        setTimeout(callback, REALTIME_LISTEN_DELAY);
      }
    )
    .subscribe()

  return channel;
};

const subscribeToMessages = (userId: string, callback: () => void) => {
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

const removeSubscription = async (channel: any) => {
  if (channel) {
    await supabase.removeChannel(channel);
  }
};

export { subscribeToTable, subscribeToNotifications, subscribeToReservations, subscribeToMessages, removeSubscription };
