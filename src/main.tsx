
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client';

// Enable real-time for notifications
const enableRealTime = async () => {
  // Enable realtime for the notifications table
  await supabase.rpc('enable_realtime', { table_name: 'notifications' });
};

enableRealTime();

createRoot(document.getElementById("root")!).render(<App />);
