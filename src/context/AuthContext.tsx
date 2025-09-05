import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, User } from '../types';
import { mockUser, mockAdminUser } from '../lib/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isAdminLogin = identifier === 'admin@example.com' || identifier === '9999999999';
    // Create a copy to avoid mutating the original mock object
    const userData = isAdminLogin ? { ...mockAdminUser } : { ...mockUser };
    
    // In a real app, you'd find the user by email or mobile
    if (identifier.includes('@')) {
      userData.email = identifier;
    } else {
      userData.mobileNumber = identifier;
    }
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setLoading(false);
  };

  const signup = async (email: string, password: string, mobileNumber: string, referralCode?: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      mobileNumber,
      referralCode: `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      referredBy: referralCode,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
