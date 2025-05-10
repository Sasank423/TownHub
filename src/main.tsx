
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client';

// Enable real-time for notifications using channel subscription
const enableRealTimeForNotifications = async () => {
  // Create a channel for real-time updates on the notifications table
  supabase.channel('public:notifications')
    .on('postgres_changes', { 
      event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'notifications'
    }, (payload) => {
      console.log('Change received!', payload);
    })
    .subscribe();
};

// Initialize real-time subscriptions
enableRealTimeForNotifications();

createRoot(document.getElementById("root")!).render(<App />);
