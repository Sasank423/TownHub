
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '@/utils/debugHelper';

interface UserData extends User {
  role?: 'member' | 'librarian' | 'admin';
  name?: string;
}

interface AuthContextType {
  user: UserData | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clean up any stale Supabase auth state to prevent issues
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user as UserData ?? null);
        
        // Fetch user profile data if user is logged in
        if (session?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user as UserData ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        console.log('Profile data retrieved:', data);
        setUser(prev => {
          if (!prev) return null;
          const updatedUser = { ...prev, role: data.role, name: data.name };
          console.log('Updated user with role:', updatedUser);
          return updatedUser;
        });
      } else {
        console.error('No profile data found for user ID:', userId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // First, clean up any stale auth state
      cleanupAuthState();
      
      // Attempt to sign out globally first to clear any previous sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Global sign out attempt failed, continuing");
      }
      
      console.log(`Attempting login for: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }
      
      // Success case - the onAuthStateChange handler will update the user state
      console.log("Login successful:", data.user?.email);
      toast.success('Welcome back!');
      
      // Fetch user profile directly to ensure role is available for routing
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', data.user.id)
          .single();
          
        if (profileData) {
          // Update user data with profile info
          setUser(prev => {
            if (!prev) return null;
            return { ...prev, role: profileData.role, name: profileData.name };
          });
        }
      }
      
      return;
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      console.error("Login error:", err);
      toast.error(`Login failed: ${err.message || 'An error occurred'}`);
      throw err; // Re-throw to let components handle the error
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear user and session state
      setUser(null);
      setSession(null);
      
      toast.success('You have been logged out');
      
      // Force page reload for a clean state
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    logout,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
