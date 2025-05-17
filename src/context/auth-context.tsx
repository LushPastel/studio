// @ts-nocheck
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AD_REWARD, MIN_WITHDRAWAL_AMOUNT, REFERRAL_BONUS } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  referralCode: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  addBalance: (amount: number) => void;
  requestWithdrawal: (amount: number) => boolean;
  withdrawalHistory: WithdrawalRequest[];
  applyReferral: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `ADNEON${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate checking auth state on mount
    const storedUser = localStorage.getItem('adneon-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      const storedHistory = localStorage.getItem(`adneon-withdrawal-${parsedUser.id}`);
      if (storedHistory) {
        setWithdrawalHistory(JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })));
      }
    } else {
      // For development, auto-login a default user
      // In a real app, you'd redirect to /login
      const defaultUser: User = {
        id: 'dev-user-123',
        email: 'user@example.com',
        name: 'Demo User',
        balance: 50.00,
        referralCode: generateReferralCode(),
      };
      setUser(defaultUser);
      setIsAuthenticated(true);
      localStorage.setItem('adneon-user', JSON.stringify(defaultUser));
    }
  }, []);


  const login = (email: string, name: string = "New User") => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      balance: 0,
      referralCode: generateReferralCode(),
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('adneon-user', JSON.stringify(newUser));
    toast({ title: "Login Successful", description: `Welcome, ${name}!` });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setWithdrawalHistory([]);
    localStorage.removeItem('adneon-user');
    localStorage.removeItem(`adneon-withdrawal-${user?.id}`); // Clear history for logged out user
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    // In a real app, you'd redirect: router.push('/login');
    // For now, this will effectively make the app unusable until refresh or manual nav to login
  };

  const addBalance = (amount: number) => {
    if (!user) return;
    const newBalance = parseFloat((user.balance + amount).toFixed(2));
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('adneon-user', JSON.stringify(updatedUser));
  };

  const requestWithdrawal = (amount: number) => {
    if (!user || user.balance < amount) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: "Insufficient balance." });
      return false;
    }
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}.` });
      return false;
    }

    const newRequest: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      amount,
      status: 'pending',
      requestedAt: new Date(),
    };
    
    addBalance(-amount); // Deduct balance immediately
    const updatedHistory = [newRequest, ...withdrawalHistory];
    setWithdrawalHistory(updatedHistory);
    if(user) localStorage.setItem(`adneon-withdrawal-${user.id}`, JSON.stringify(updatedHistory));


    toast({ title: "Withdrawal Requested", description: `₹${amount.toFixed(2)} withdrawal request submitted.` });
    return true;
  };
  
  const applyReferral = (code: string): boolean => {
    // In a real app, this would validate the code against a backend
    // For simulation, we'll just assume any non-empty code is valid from another user
    // and the current user hasn't used one before (not tracked in this simple mock)
    if (user && code.startsWith("ADNEON") && code !== user.referralCode) {
      addBalance(REFERRAL_BONUS);
      toast({
        title: "Referral Applied!",
        description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus!`,
      });
      // Simulate referrer bonus (not actually implemented for the 'other' user)
      console.log(`Referrer with code ${code} would also get a bonus.`);
      return true;
    }
    toast({
      variant: "destructive",
      title: "Invalid Referral Code",
      description: "The referral code is invalid or cannot be used.",
    });
    return false;
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, addBalance, requestWithdrawal, withdrawalHistory, applyReferral }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
