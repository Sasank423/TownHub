
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await forgotPassword(email);
      if (success) {
        setResetSent(true);
        toast.success('Password reset email sent');
      } else {
        toast.error('Failed to send reset email');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 dark:bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <img src="/logo.svg" alt="TownBook Logo" className="h-10" />
          </Link>
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <div className="space-y-6 bg-card p-8 rounded-lg shadow-sm border border-border">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {resetSent 
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive a password reset link'}
              </p>
            </div>

            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
                  Reset link sent to {email}
                </div>
                
                <Button 
                  onClick={() => {
                    setEmail('');
                    setResetSent(false);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Reset Another Email
                </Button>

                <div className="pt-2">
                  <Link to="/login" className="text-primary hover:underline text-sm">
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-primary hover:underline text-sm">
                    Return to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
