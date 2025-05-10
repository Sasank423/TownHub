
import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, X, Check, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserNotifications } from '../utils/mockData';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(user ? getUserNotifications(user.id) : []);
  const [activeTab, setActiveTab] = useState('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle size={18} className="text-blue-500 dark:text-blue-400" />;
      case 'pickup':
        return <Bell size={18} className="text-green-500 dark:text-green-400" />;
      case 'due':
        return <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />;
      case 'reminder':
        return <Clock size={18} className="text-purple-500 dark:text-purple-400" />;
      case 'event':
        return <Calendar size={18} className="text-indigo-500 dark:text-indigo-400" />;
      default:
        return <Bell size={18} className="text-gray-500 dark:text-gray-400" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Group notifications by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

  const groupedNotifications = notifications.reduce((acc: any, notification) => {
    const notifDate = new Date(notification.date);
    notifDate.setHours(0, 0, 0, 0);
    
    let group = 'earlier';
    
    if (notifDate.getTime() === today.getTime()) {
      group = 'today';
    } else if (notifDate.getTime() === yesterday.getTime()) {
      group = 'yesterday';
    } else if (notifDate > thisWeekStart) {
      group = 'thisWeek';
    }
    
    if (!acc[group]) {
      acc[group] = [];
    }
    
    acc[group].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === activeTab);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-medium dark:text-white">Notifications</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>
      
      <div>
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-slate-700">
            <TabsList className="flex">
              <TabsTrigger className="flex-1 rounded-none" value="all">
                All
              </TabsTrigger>
              <TabsTrigger className="flex-1 rounded-none" value="unread">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger className="flex-1 rounded-none" value="due">
                Due Soon
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="max-h-96 overflow-y-auto">
            <NotificationList 
              groupedNotifications={groupedNotifications} 
              getIcon={getIcon} 
              onMarkAsRead={handleMarkAsRead}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    icon={getIcon(notification.type)}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Check className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">No unread notifications</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="due" className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    icon={getIcon(notification.type)}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">No upcoming due dates</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleMarkAllAsRead}
          className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors"
          disabled={unreadCount === 0}
        >
          <Check className="h-3.5 w-3.5 mr-1.5" />
          Mark all as read
        </Button>
      </div>
    </div>
  );
};

interface NotificationListProps {
  groupedNotifications: Record<string, any[]>;
  getIcon: (type: string) => React.ReactNode;
  onMarkAsRead: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  groupedNotifications, 
  getIcon,
  onMarkAsRead
}) => {
  if (Object.keys(groupedNotifications).length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">No notifications yet</p>
      </div>
    );
  }

  return (
    <div>
      {groupedNotifications.today && groupedNotifications.today.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/50">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Today</h4>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {groupedNotifications.today.map((notification: any) => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                icon={getIcon(notification.type)}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      )}

      {groupedNotifications.yesterday && groupedNotifications.yesterday.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/50">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Yesterday</h4>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {groupedNotifications.yesterday.map((notification: any) => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                icon={getIcon(notification.type)}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      )}

      {groupedNotifications.thisWeek && groupedNotifications.thisWeek.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/50">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">This Week</h4>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {groupedNotifications.thisWeek.map((notification: any) => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                icon={getIcon(notification.type)}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      )}

      {groupedNotifications.earlier && groupedNotifications.earlier.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/50">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Earlier</h4>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {groupedNotifications.earlier.map((notification: any) => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                icon={getIcon(notification.type)}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: any;
  icon: React.ReactNode;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, icon, onMarkAsRead }) => {
  return (
    <div 
      className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-900/20 transition-colors ${notification.read ? '' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm text-gray-800 dark:text-gray-200 ${notification.read ? '' : 'font-medium'}`}>{notification.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(notification.date).toLocaleString()}
          </p>
        </div>
        {!notification.read && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="flex-shrink-0 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
            aria-label="Mark as read"
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
