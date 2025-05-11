
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log("User already logged in, role:", user.role);
      
      // Determine the correct path based on user role
      const redirectPath = user.role === 'librarian' ? '/librarian' : '/member';
      console.log(`Redirecting to ${redirectPath}`);
      
      // Use navigate for redirection
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background dark:bg-background flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center group">
            <div className="bg-primary/10 p-2 rounded-full mr-3 group-hover:bg-primary/20 transition-all duration-300">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-playfair text-gradient-blue-green">TownBook</span>
          </Link>
          <ThemeToggle />
        </div>
        
        <div className="max-w-md mx-auto w-full">
          <div className="gradient-border-top bg-card rounded-lg p-6 shadow-soft-xl">
            <AuthForm />
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Need help? <a href="#" className="text-primary hover:underline">Contact Support</a></p>
          </div>
        </div>
      </div>
      
      <div className="mt-auto wave-animation">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="opacity-20">
          <path 
            fill="currentColor" 
            fillOpacity="1" 
            d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z">
          </path>
        </svg>
      </div>
    </div>
  );
};

export default Login;
