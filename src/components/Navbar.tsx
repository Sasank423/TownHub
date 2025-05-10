import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, BookOpen, Calendar, BarChart2, FileText, LogOut, Search, User, Settings } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [unreadNotifications] = React.useState(2); // Hardcoded for demo, would be dynamic in a real app

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-primary font-bold">
              <img src="/logo.svg" alt="TownBook Logo" className="h-8" />
              <span>TownBook</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/catalog" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Browse Books</span>
                </Link>
                <Link to="/rooms" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Rooms</span>
                </Link>
                <Link to="/analytics" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
                <Link to="/report-issue" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Report Issue</span>
                </Link>
              </div>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-foreground" />
              </button>
              
              <div className="relative">
                <button 
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-foreground" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 z-10 w-80">
                    <NotificationCenter onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="p-2">
                <ThemeToggle />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-secondary transition-colors">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
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
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reservations" className="flex items-center space-x-2">
                      <BookOpen size={16} />
                      <span>My Reservations</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/calendar" className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>Calendar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center space-x-2">
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={logout}>
                    <div className="flex items-center space-x-2">
                      <LogOut size={16} />
                      <span>Logout</span>
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
