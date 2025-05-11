
import React, { useState, useEffect } from 'react';
import { Book, Clock, User, Database, CheckCircle } from 'lucide-react';
import { Activity } from '../types/models';
import { format, formatDistance } from 'date-fns';
import { supabase } from '../integrations/supabase/client';
import { subscribeToTable } from '../utils/supabaseRealtime';
import { RealtimeChannel } from '@supabase/supabase-js';

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        // Transform the data to match our Activity type
        const formattedActivities = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          action: item.action,
          description: item.description,
          timestamp: item.timestamp,
          itemId: item.item_id,
          itemType: item.item_type,
          type: item.action, // Map action to type for backwards compatibility
          user: item.user_name || item.user_id, // Use user_name if available
          details: item.description,
          date: item.timestamp
        }));

        setActivities(formattedActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up real-time subscription
    const channel = subscribeToTable('activities', 'INSERT', (payload) => {
      const newActivity = payload.new;
      
      setActivities(prev => [{
        id: newActivity.id,
        userId: newActivity.user_id,
        action: newActivity.action,
        description: newActivity.description,
        timestamp: newActivity.timestamp,
        itemId: newActivity.item_id,
        itemType: newActivity.item_type,
        type: newActivity.action,
        user: newActivity.user_name || newActivity.user_id,
        details: newActivity.description,
        date: newActivity.timestamp
      }, ...prev.slice(0, 4)]); // Keep only the 5 most recent
    });

    return () => {
      // Clean up subscription
      supabase.removeChannel(channel);
    };
  }, []);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'reservation':
        return <Book className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'return':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'new_item':
        return <Database className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'new_member':
        return <User className="h-5 w-5 text-primary dark:text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {loading ? (
        // Loading state
        [...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-700 flex-shrink-0 w-10 h-10"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
          </div>
        ))
      ) : activities.length === 0 ? (
        // Empty state
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      ) : (
        // Activity list
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-700 flex-shrink-0">
              {getActivityIcon(activity.action)}
            </div>
            <div>
              <p className="text-sm dark:text-gray-200">
                <span className="font-medium dark:text-white">{activity.user}</span>
                <span className="text-gray-600 dark:text-gray-400"> {activity.description}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {getTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-center">
        <button className="text-primary hover:text-primary/80 text-sm">
          View All Activity
        </button>
      </div>
    </div>
  );

  function getActivityIcon(action: string) {
    switch (action) {
      case 'reservation':
        return <Book className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'return':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'new_item':
        return <Database className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'new_member':
        return <User className="h-5 w-5 text-primary dark:text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  }

  function getTimeAgo(dateString: string) {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  }
};
