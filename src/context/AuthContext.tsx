import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, User } from '../types';
import { mockUser, mockAdminUser } from '../lib/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext - Initializing, checking for saved user');
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('AuthContext - Found saved user:', parsedUser);
      setUser(parsedUser);
    } else {
      console.log('AuthContext - No saved user found');
    }
    setLoading(false);
    console.log('AuthContext - Initialization complete');
  }, []);

  const login = async (identifier: string, password: string) => {
    console.log('AuthContext - Login attempt for:', identifier);
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

    console.log('AuthContext - Setting user:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setLoading(false);
    console.log('AuthContext - Login completed');
  };

  const signup = async (email: string, password: string, mobileNumber: string, referralCode?: string) => {
    console.log('AuthContext - Signup attempt for:', email, mobileNumber, 'with referral:', referralCode);
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

    // Only create referral coupons if someone used a referral code
    if (referralCode) {
      try {
        console.log('AuthContext - Creating referral coupons for successful referral');

        // Find the referrer by their referral code
        const users = await fetch('http://localhost:3001/api/users').then(res => res.json());
        const referrer = users.find((u: User) => u.referralCode === referralCode);

        if (referrer) {
          // Create coupon for the referrer
          await fetch('http://localhost:3001/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              discountPercent: 10,
              userMobile: referrer.mobileNumber,
              isActive: true,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            })
          });

          // Create coupon for the new user (referee)
          await fetch('http://localhost:3001/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              discountPercent: 10,
              userMobile: newUser.mobileNumber,
              isActive: true,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            })
          });

          console.log('AuthContext - Referral coupons created for both referrer and referee');
        }
      } catch (error) {
        console.error('AuthContext - Error creating referral coupons:', error);
        // Don't fail signup if coupon creation fails
      }
    } else {
      console.log('AuthContext - No referral code provided, no coupons created');
    }

    console.log('AuthContext - Setting new user:', newUser);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setLoading(false);
    console.log('AuthContext - Signup completed');
  };

  const logout = () => {
    console.log('AuthContext - Logout initiated');
    setUser(null);
    localStorage.removeItem('user');
    console.log('AuthContext - User logged out');
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
