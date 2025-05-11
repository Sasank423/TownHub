
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import App from './App.tsx';
import './index.css';
import { supabase } from './integrations/supabase/client';
import { LoadingScreen } from './components/ui/loading-screen';

// Create a channel for real-time updates on the notifications table
const enableRealTimeForNotifications = () => {
  const channel = supabase.channel('public:notifications');
  
  channel
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'notifications' 
    }, (payload) => {
      console.log('Change received!', payload);
    })
    .subscribe();
};

// Initialize real-time subscriptions
enableRealTimeForNotifications();

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<LoadingScreen />}>
    <App />
  </Suspense>
);
