
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate(user.role === 'librarian' ? '/librarian' : '/member');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background dark:bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <img src="/logo.svg" alt="TownBook Logo" className="h-10" />
          </Link>
          <ThemeToggle />
        </div>
        
        <div className="max-w-md mx-auto w-full">
          <div className="gradient-border-top bg-card rounded-lg p-6 shadow-lg">
            <AuthForm />
          </div>
        </div>
      </div>
      
      <div className="wave-animation">
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
