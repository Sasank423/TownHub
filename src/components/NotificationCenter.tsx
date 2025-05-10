
import React from 'react';
import { Bell, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserNotifications } from '../utils/mockData';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { user } = useAuth();
  const notifications = user ? getUserNotifications(user.id) : [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle size={18} className="text-blue-500" />;
      case 'pickup':
        return <Bell size={18} className="text-green-500" />;
      case 'due':
        return <Clock size={18} className="text-amber-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="font-medium">Notifications</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${notification.read ? '' : 'bg-blue-50/30'}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
        <button 
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};
