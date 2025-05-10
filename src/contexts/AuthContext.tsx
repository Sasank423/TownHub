
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, login as mockLogin } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored user in localStorage (simulating persistent session)
    const storedUser = localStorage.getItem('townbook_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await mockLogin(email, password);
      
      if (user) {
        setUser(user);
        localStorage.setItem('townbook_user', JSON.stringify(user));
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('townbook_user');
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    // In a real app, this would send a password reset email
    return new Promise((resolve) => {
      setTimeout(() => {
        const userExists = email.includes('@');
        if (userExists) {
          resolve(true);
        } else {
          setError('Email not found');
          resolve(false);
        }
      }, 1000);
    });
  };

  const value = {
    user,
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
