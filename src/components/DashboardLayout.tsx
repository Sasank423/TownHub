
import React from 'react';
import { Navbar } from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

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
      <Navbar />
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
            <h1 className="text-3xl font-semibold">{title}</h1>
          </div>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
};
