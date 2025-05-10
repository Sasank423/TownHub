
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Book, Calendar, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === 'librarian' ? '/librarian' : '/member');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Theme Toggle */}
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <ThemeToggle />
      </div>
      
      {/* Hero Section */}
      <header className="bg-secondary/20 dark:bg-secondary/5">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-slide-in">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-balance text-foreground">
                Your Community Library <span className="text-primary">At Your Fingertips</span>
              </h1>
              <p className="text-lg text-foreground/80 max-w-lg">
                Browse, reserve, and manage your library resources with ease. 
                TownBook brings your local library experience online.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={() => navigate('/login')}
                >
                  Get Started <ArrowRight size={18} />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/login?tab=signup')}
                >
                  Create Account
                </Button>
              </div>
            </div>
            
            <div className="justify-self-center lg:justify-self-end fade-slide-in-delayed">
              <img 
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600&auto=format" 
                alt="Library books" 
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12 text-foreground">Everything You Need in One Place</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-4">
                <Book size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-foreground">Browse & Reserve</h3>
              <p className="text-foreground/70">
                Explore our extensive catalog and reserve books with just a few clicks
              </p>
            </div>
            
            <div className="bg-secondary/30 dark:bg-secondary/10 p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-secondary/50 dark:bg-secondary/20 p-4 rounded-full mb-4">
                <Calendar size={32} className="text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-foreground">Book Study Rooms</h3>
              <p className="text-foreground/70">
                Reserve study spaces and meeting rooms for individual or group use
              </p>
            </div>
            
            <div className="bg-accent/20 dark:bg-accent/10 p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-accent/30 dark:bg-accent/20 p-4 rounded-full mb-4">
                <Calendar size={32} className="text-accent-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-foreground">Track & Manage</h3>
              <p className="text-foreground/70">
                Keep track of your borrowed items, returns, and upcoming reservations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src="/logo.svg" alt="TownBook Logo" className="h-8" />
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 TownBook. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
