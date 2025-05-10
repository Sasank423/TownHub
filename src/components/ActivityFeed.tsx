
import React from 'react';
import { Book, Clock, User, Database, CheckCircle } from 'lucide-react';
import { Activity, mockActivities } from '../utils/mockData';
import { format, formatDistance } from 'date-fns';

export const ActivityFeed: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reservation':
        return <Book className="h-5 w-5 text-blue-500" />;
      case 'return':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      case 'new_item':
        return <Database className="h-5 w-5 text-amber-500" />;
      case 'new_member':
        return <User className="h-5 w-5 text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          Recent Activity
        </h2>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-600"> {activity.details}</span>
              </p>
              <p className="text-xs text-gray-500">
                {getTimeAgo(activity.date)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <button className="text-primary hover:text-primary/80 text-sm">
          View All Activity
        </button>
      </div>
    </div>
  );
};
