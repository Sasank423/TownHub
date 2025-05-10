
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

export const AuthForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { login, forgotPassword, error } = useAuth();
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      // If there's no error after login, redirect
      if (!error) {
        navigate('/');
        toast.success('Welcome back!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // In a real app, this would create a new user
    toast.success('Account created successfully!');
    setActiveTab('login');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await forgotPassword(formData.email);
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

  const loginDemo = async (role: 'member' | 'librarian') => {
    setIsLoading(true);
    try {
      if (role === 'member') {
        await login('john@example.com', 'password');
      } else {
        await login('jane@example.com', 'password');
      }
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {showForgotPassword ? (
        <div className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Reset Password</h2>
            <p className="text-sm text-gray-600 mt-2">
              {resetSent 
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="p-3 bg-green-50 text-green-700 rounded-md">
                Reset link sent to {formData.email}
              </div>
              
              <Button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                }}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            <div className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Welcome Back</h2>
                <p className="text-sm text-gray-600 mt-2">Sign in to your TownBook account</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo accounts</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => loginDemo('member')}
                    disabled={isLoading}
                  >
                    Demo Member
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => loginDemo('librarian')}
                    disabled={isLoading}
                  >
                    Demo Librarian
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            <div className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Create an Account</h2>
                <p className="text-sm text-gray-600 mt-2">Join TownBook library community</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  By signing up, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
