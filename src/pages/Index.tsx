
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Book, Calendar, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'librarian' ? '/librarian' : '/member');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-secondary/20">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-slide-in">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-balance">
                Your Community Library <span className="text-primary">At Your Fingertips</span>
              </h1>
              <p className="text-lg text-gray-700 max-w-lg">
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">Everything You Need in One Place</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Book size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Browse & Reserve</h3>
              <p className="text-gray-600">
                Explore our extensive catalog and reserve books with just a few clicks
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Calendar size={32} className="text-purple-700" />
              </div>
              <h3 className="text-xl font-medium mb-2">Book Study Rooms</h3>
              <p className="text-gray-600">
                Reserve study spaces and meeting rooms for individual or group use
              </p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg flex flex-col items-center text-center">
              <div className="bg-amber-100 p-4 rounded-full mb-4">
                <Calendar size={32} className="text-amber-700" />
              </div>
              <h3 className="text-xl font-medium mb-2">Track & Manage</h3>
              <p className="text-gray-600">
                Keep track of your borrowed items, returns, and upcoming reservations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src="/logo.svg" alt="TownBook Logo" className="h-8" />
            </div>
            
            <div className="text-sm text-gray-500">
              © 2025 TownBook. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
