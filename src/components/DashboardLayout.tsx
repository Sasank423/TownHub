
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { BookOpen, BarChart2, FileText, Calendar } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  breadcrumbs = []
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar inspired by the image */}
      <nav className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-primary font-bold text-xl">
                <span className="mr-2">TownBook</span>
              </Link>
              
              <div className="hidden md:flex ml-10 space-x-8">
                <Link to="/" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                  Home
                </Link>
                <Link to="/catalog" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                  <BookOpen className="inline mr-1 h-4 w-4" />
                  Browse Books
                </Link>
                <Link to="/rooms" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                  <Calendar className="inline mr-1 h-4 w-4" />
                  Rooms
                </Link>
                <Link to="/analytics" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                  <BarChart2 className="inline mr-1 h-4 w-4" />
                  Analytics
                </Link>
                <Link to="/report-issue" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                  <FileText className="inline mr-1 h-4 w-4" />
                  Report Issue
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            {breadcrumbs.length > 0 && (
              <div className="flex items-center mb-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
                    {crumb.path ? (
                      <a 
                        href={crumb.path} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-foreground">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
          </div>
        </div>
        
        {/* Apply the gradient top border to content cards */}
        <div className="gradient-border-top bg-card rounded-lg shadow-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
