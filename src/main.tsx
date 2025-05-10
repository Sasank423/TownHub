
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client';
import { subscribeToTable } from './utils/supabaseRealtime';

// Enable real-time for notifications using channel subscription
const enableRealTimeForNotifications = () => {
  // Create a channel for real-time updates on the notifications table
  subscribeToTable('notifications', '*', (payload) => {
    console.log('Change received!', payload);
  });
};

// Initialize real-time subscriptions
enableRealTimeForNotifications();

createRoot(document.getElementById("root")!).render(<App />);
