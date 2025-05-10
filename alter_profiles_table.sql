-- Add reading preferences and notification settings to profiles table
ALTER TABLE public.profiles
ADD COLUMN reading_preferences TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN notification_settings TEXT DEFAULT 'all';

-- Add books_read view for profile statistics
CREATE OR REPLACE VIEW public.user_reading_stats AS
SELECT 
  p.id as user_id,
  COUNT(CASE WHEN r.status = 'Completed' AND r.item_type = 'book' THEN 1 END) as books_read,
  COUNT(CASE WHEN r.status IN ('Pending', 'Approved') THEN 1 END) as active_reservations
FROM 
  public.profiles p
LEFT JOIN 
  public.reservations r ON p.id = r.user_id
GROUP BY 
  p.id;
