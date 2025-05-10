
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Use the notifications hook
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(user?.id);
  
  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'unread' 
        ? notifications.filter(n => !n.is_read)
        : notifications.filter(n => n.is_read);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between bg-primary p-4 text-white">
          <h2 className="text-lg font-medium">Notifications</h2>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              className="h-auto p-1 text-xs hover:bg-primary-foreground/20"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full bg-transparent px-4 pt-2 gap-4 justify-start">
              <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1 bg-primary/10 text-primary text-xs rounded-full px-2">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                Read
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="mt-0">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>
          
          <TabsContent value="read" className="mt-0">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>
        </Tabs>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

interface NotificationListProps {
  notifications: any[];
  onMarkAsRead: (id: string) => Promise<boolean>;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onMarkAsRead }) => {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No notifications found</p>
      </div>
    );
  }
  
  return (
    <div className="max-h-[350px] overflow-y-auto">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`p-3 border-b last:border-b-0 ${notification.is_read ? 'bg-white' : 'bg-primary/5'}`}
          onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium">{notification.title}</h3>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          <div className="text-xs text-muted-foreground mt-2 flex justify-between">
            <span>{format(new Date(notification.created_at), 'MMM d, h:mm a')}</span>
            {!notification.is_read && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto py-0 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
