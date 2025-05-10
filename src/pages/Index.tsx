
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Book, Calendar, ArrowRight, BarChart2, FileText, BookOpen } from 'lucide-react';
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
      {/* Navbar inspired by the image */}
      <nav className="border-b border-border">
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
              
              {!user && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/login?tab=signup')}
                    className="bg-primary text-primary-foreground"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <header className="bg-secondary/5 dark:bg-secondary/5 pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <svg className="wave-animation opacity-5" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,181.3C672,181,768,235,864,250.7C960,267,1056,245,1152,208C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-slide-in">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-balance text-foreground">
                Be Part of the <span className="text-accent">Solution</span>
              </h1>
              <p className="text-lg text-foreground/80 max-w-lg">
                Browse, reserve, and manage your library resources with ease. 
                TownBook brings your local library experience online.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary mr-3">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Track the status of your borrowed books</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary mr-3">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Receive updates when books are available</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary mr-3">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Reserve study rooms and resources</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary mr-3">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Engage with your local community</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="gap-2 bg-primary text-primary-foreground"
                  onClick={() => navigate('/login')}
                >
                  Join Our Platform <ArrowRight size={18} />
                </Button>
              </div>
            </div>
            
            <div className="justify-self-center lg:justify-self-end fade-slide-in-delayed">
              <div className="gradient-border-top bg-card p-6 rounded-lg shadow-lg max-w-md">
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Book className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-center mb-2">Welcome Back!</h2>
                <p className="text-center text-muted-foreground mb-6">
                  You're successfully logged in
                </p>
                <p className="text-center mb-8">
                  Thank you for being part of our community. You can now browse books and track their progress.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    My Reports
                  </Button>
                  <Button className="bg-primary text-primary-foreground">
                    Report an Issue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12 text-foreground">Everything You Need in One Place</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-secondary p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Book size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-foreground">Browse & Reserve</h3>
              <p className="text-foreground/70">
                Explore our extensive catalog and reserve books with just a few clicks
              </p>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Calendar size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-foreground">Book Study Rooms</h3>
              <p className="text-foreground/70">
                Reserve study spaces and meeting rooms for individual or group use
              </p>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <BarChart2 size={32} className="text-primary" />
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
      <footer className="bg-secondary/30 py-8">
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
