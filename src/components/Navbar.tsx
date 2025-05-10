
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Book, Calendar, LogOut, Search, User } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [unreadNotifications] = React.useState(2); // Hardcoded for demo, would be dynamic in a real app

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="TownBook Logo" className="h-10" />
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-300 dark:hover:text-primary">
                  Home
                </Link>
                <Link to="/catalog" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-300 dark:hover:text-primary">
                  Catalog
                </Link>
                <Link to="/rooms" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-300 dark:hover:text-primary">
                  Rooms
                </Link>
                {user.role === 'librarian' && (
                  <Link to="/librarian" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-300 dark:hover:text-primary">
                    Management
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative"
                aria-label="Search"
              >
                <Search size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              <div className="relative">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
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
                  <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="hidden md:inline text-sm font-medium dark:text-white">
                      {user.name}
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
                      <Book size={16} />
                      <span>My Reservations</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/calendar" className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>Calendar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={logout}>
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
                className="px-4 py-2 text-primary hover:text-primary/80 transition-colors dark:text-primary dark:hover:text-primary/80"
              >
                Sign In
              </Link>
              <Link 
                to="/login?tab=signup" 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
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
