
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
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
      {/* Use the Navbar component that includes the profile icon */}
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
                      <Link
                        to={crumb.path}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-semibold">
              {title.includes('Welcome') ? (
                <>
                  {title.split(',')[0]}, 
                  <span className="text-gradient-blue-green ml-1">
                    {title.split(',')[1]}
                  </span>
                </>
              ) : (
                title
              )}
            </h1>
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
