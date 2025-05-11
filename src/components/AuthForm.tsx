import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail, Key, User as UserIcon } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, forgotPassword, error: authError } = useAuth();
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(authError);
  const [emailNotConfirmedUser, setEmailNotConfirmedUser] = useState<string | null>(null);

  // Keep local error state in sync with auth context error
  React.useEffect(() => {
    setError(authError);
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailNotConfirmedUser(null);
    
    try {
      console.log("Login attempt with:", formData.email);
      
      // Try to login first
      await login(formData.email, formData.password);
      // Navigate will happen via the useEffect in Login.tsx
    } catch (err: any) {
      console.error("Form login error:", err);
      
      // Check if error is email not confirmed
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        console.log("Email not confirmed, attempting auto-confirmation");
        setEmailNotConfirmedUser(formData.email);
        
        // Try to automatically confirm the email
        try {
          // Get user by email
          const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
            filters: {
              email: formData.email
            }
          });
          
          if (usersError) throw usersError;
          
          if (users && users.length > 0) {
            // Update user to be confirmed
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              users[0].id,
              { email_confirm: true }
            );
            
            if (updateError) throw updateError;
            
            // Try login again
            await login(formData.email, formData.password);
            toast.success("Account confirmed automatically!");
          } else {
            throw new Error("User not found");
          }
        } catch (confirmError) {
          console.error("Could not auto-confirm:", confirmError);
          setError("Email not confirmed. Please contact support or try again later.");
        }
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          // No need for email verification
          emailRedirectTo: undefined
        }
      });
      
      if (error) throw error;

      // Since we removed email verification, we can directly show success and switch to login tab
      toast.success('Account created successfully! You can now log in.');
      setActiveTab('login');
      
      // Clear the form data for signup
      setFormData({
        ...formData,
        name: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
      setError(err.message || 'Failed to create account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await forgotPassword(formData.email);
      if (success) {
        setResetSent(true);
        toast.success('Password reset email sent');
      } else {
        toast.error('Failed to send reset email');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {showForgotPassword ? (
        <div className="space-y-6 bg-card p-8 rounded-lg shadow-card border border-border">
          <div className="text-center">
            <h2 className="text-2xl font-semibold font-playfair text-gradient-blue-green">Reset Password</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {resetSent 
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-100/10 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md border border-green-300/20 shadow-sm">
                Reset link sent to {formData.email}
              </div>
              
              <Button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                }}
                className="w-full"
                variant="gradient"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="pl-10 bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 focus:bg-background focus:ring-2"
                  />
                </div>
              </div>
              
              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" disabled={isLoading} variant="gradient">
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
            <TabsTrigger value="login" className="transition-all duration-300 data-[state=active]:text-primary data-[state=active]:shadow-md">Login</TabsTrigger>
            <TabsTrigger value="signup" className="transition-all duration-300 data-[state=active]:text-primary data-[state=active]:shadow-md">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4 animate-fade-in">
            <div className="space-y-6 bg-card p-8 rounded-lg shadow-card border border-border">
              <div className="text-center">
                <h2 className="text-2xl font-semibold font-playfair text-gradient-blue-green">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-2">Sign in to your TownBook account</p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 shadow-sm animate-fade-in">
                  {error}
                </div>
              )}
              
              {emailNotConfirmedUser && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm rounded-md border border-amber-200 dark:border-amber-700/30 shadow-sm animate-fade-in">
                  The email for {emailNotConfirmedUser} has not been confirmed yet. We attempted automatic confirmation but it failed.
                  <div className="mt-1 text-xs">
                    For development purposes, you can disable email confirmation in the Supabase dashboard under Authentication → Settings → Email Auth.
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="pl-10 bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 focus:bg-background focus:ring-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors duration-300"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10 bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 focus:bg-background focus:ring-2"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                    {isLoading ? 
                      <span className="flex items-center">
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                      </span> : 
                      'Sign In'
                    }
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4 animate-fade-in">
            <div className="space-y-6 bg-card p-8 rounded-lg shadow-card border border-border">
              <div className="text-center">
                <h2 className="text-2xl font-semibold font-playfair text-gradient-blue-green">Create an Account</h2>
                <p className="text-sm text-muted-foreground mt-2">Join TownBook library community</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="pl-10 bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 focus:bg-background focus:ring-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="pl-10 bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 focus:bg-background focus:ring-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10 bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 focus:bg-background focus:ring-2"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10 bg-secondary/30 transition-all duration-300 hover:bg-secondary/50 focus:bg-background focus:ring-2"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                    {isLoading ? 
                      <span className="flex items-center">
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                      </span> : 
                      'Create Account'
                    }
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  By signing up, you agree to our <a href="#" className="text-primary hover:text-primary/80 hover:underline transition-colors">Terms of Service</a> and <a href="#" className="text-primary hover:text-primary/80 hover:underline transition-colors">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
