import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, BarChart2, FileText, LogOut, User, Settings, History, ClipboardList } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation } from '../i18n';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, isAuthPage } = useTranslation();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  
  // Fetch unread notifications count from Supabase
  React.useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const { data, error, count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('is_read', false);
            
          if (error) throw error;
          setUnreadNotifications(count || 0);
        } catch (error) {
          console.error('Error fetching notifications count:', error);
        }
      };
      
      fetchUnreadCount();
      
      // Set up subscription for real-time updates to notifications
      const channel = supabase
        .channel('public:notifications')
        .on('postgres_changes', 
          {
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-1.5">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 font-bold">
              <span className="text-gradient-blue-green">TownBook</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                {user?.role === 'librarian' ? (
                  <Link 
                    to="/book-management" 
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Manage Books</span>
                  </Link>
                ) : (
                  <Link 
                    to="/catalog" 
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>{t('navbar.catalog')}</span>
                  </Link>
                )}
                <Link to={user?.role === 'librarian' ? "/room-management" : "/rooms"} className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{t('navbar.rooms')}</span>
                </Link>
                {user?.role === 'librarian' ? (
                  <Link to="/activity-logs" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <ClipboardList className="h-4 w-4" />
                    <span>{t('navbar.activityLogs')}</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/report-issue" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{t('navbar.reportIssue')}</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center space-x-3">
              {/* Search and notification buttons removed as requested */}

              {/* Theme Toggle */}
              <div className="p-1">
                <ThemeToggle />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-secondary transition-colors">
                    <Avatar className="h-7 w-7 border border-primary/20">
                      {/* Fix for the avatarUrl TypeScript error */}
                      <AvatarImage src={user.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}` : undefined} alt={user.name || 'User'} />
                      <AvatarFallback className="bg-primary/30 text-primary-foreground">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {user.name || 'User'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center space-x-2">
                      <User size={16} />
                      <span>{t('navbar.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/user-history" className="flex items-center space-x-2">
                      <History size={16} />
                      <span>{t('navbar.myHistory')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center space-x-2">
                      <Settings size={16} />
                      <span>{t('navbar.settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={logout}>
                    <div className="flex items-center space-x-2">
                      <LogOut size={16} />
                      <span>{t('navbar.logout')}</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Theme Toggle for non-logged in users */}
              <div className="p-2">
                <ThemeToggle />
              </div>
              
              <Link 
                to="/login" 
                className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-md"
              >
                Sign In
              </Link>
              <Link 
                to="/login?tab=signup" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
