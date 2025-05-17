
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AD_REWARD, MIN_WITHDRAWAL_AMOUNT, REFERRAL_BONUS } from '@/lib/constants';

// Constants for localStorage keys
const LS_USERS_KEY = 'adplay-users';
const LS_CURRENT_USER_ID_KEY = 'adplay-current-user-id';
const LS_WITHDRAWAL_HISTORY_PREFIX = 'adplay-withdrawal-';

interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Stored in LS, not in active user state object for security simulation
  balance: number;
  referralCode: string;
  hasAppliedReferral?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
}

interface AuthContextType {
  user: User | null; // User object without password
  isAuthenticated: boolean;
  signup: (name: string, email: string, passwordInput: string, referralCodeInput?: string) => Promise<boolean>;
  login: (email: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
  addBalance: (amount: number) => void;
  requestWithdrawal: (amount: number) => boolean;
  withdrawalHistory: WithdrawalRequest[];
  applyReferral: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `ADPLAY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// Helper to get all users from localStorage
const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const storedUsers = localStorage.getItem(LS_USERS_KEY);
  return storedUsers ? JSON.parse(storedUsers) : [];
};

// Helper to save all users to localStorage
const saveAllUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Stores user data *without* password
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentUserId = localStorage.getItem(LS_CURRENT_USER_ID_KEY);
    if (currentUserId) {
      const users = getAllUsers();
      const loggedInUser = users.find(u => u.id === currentUserId);
      if (loggedInUser) {
        const { password, ...userWithoutPassword } = loggedInUser;
        setUser(userWithoutPassword as User); // Cast: password field is removed
        setIsAuthenticated(true);
        const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${loggedInUser.id}`);
        if (storedHistory) {
          setWithdrawalHistory(JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })));
        }
      } else {
        localStorage.removeItem(LS_CURRENT_USER_ID_KEY); // Clean up if user ID is invalid
      }
    }
  }, []);

  const signup = async (name: string, email: string, passwordInput: string, referralCodeInput?: string): Promise<boolean> => {
    let allUsers = getAllUsers();
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({ variant: "destructive", title: "Signup Failed", description: "Email already registered. Please log in." });
      return false;
    }

    // IMPORTANT: In a real app, hash the password before storing.
    const newUserBase: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      password: passwordInput, // Storing plain text for prototype
      balance: 0,
      referralCode: generateReferralCode(),
      hasAppliedReferral: false,
    };

    let finalNewUser = { ...newUserBase }; // Work with a mutable copy for referral modifications

    if (referralCodeInput) {
      const referrer = allUsers.find(u => u.referralCode === referralCodeInput && u.id !== finalNewUser.id);

      if (referrer) {
        // Apply bonus to new user (applicant)
        finalNewUser.balance = parseFloat((finalNewUser.balance + REFERRAL_BONUS).toFixed(2));
        finalNewUser.hasAppliedReferral = true;
        toast({ title: "Referral Bonus Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus for signing up with a referral code!` });

        // Apply bonus to referrer and update them in the allUsers array
        const referrerIndex = allUsers.findIndex(u => u.id === referrer.id);
        if (referrerIndex !== -1) { // Should always be found if referrer object exists
          const updatedReferrer = {
            ...allUsers[referrerIndex],
            balance: parseFloat((allUsers[referrerIndex].balance + REFERRAL_BONUS).toFixed(2)),
          };
          allUsers[referrerIndex] = updatedReferrer;
        }
      } else {
        toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code entered during signup was invalid. Signup will proceed without this bonus." });
      }
    }
    
    // Add the final (potentially modified by referral) new user to the list and save
    const updatedUsersArray = [...allUsers.filter(u => u.id !== finalNewUser.id), finalNewUser]; // Filter to avoid duplicates if referrer logic somehow re-added
    saveAllUsers(updatedUsersArray);

    const { password, ...userToSet } = finalNewUser;
    setUser(userToSet as User);
    setIsAuthenticated(true);
    localStorage.setItem(LS_CURRENT_USER_ID_KEY, finalNewUser.id);
    setWithdrawalHistory([]); // Reset history for new user

    toast({ title: "Signup Successful", description: `Welcome, ${name}!` });
    return true;
  };

  const login = async (email: string, passwordInput: string): Promise<boolean> => {
    const users = getAllUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      toast({ variant: "destructive", title: "Login Failed", description: "Email not found. Please sign up." });
      return false;
    }

    // IMPORTANT: In a real app, compare hashed passwords. Here, plain text.
    if (foundUser.password !== passwordInput) {
      toast({ variant: "destructive", title: "Login Failed", description: "Incorrect password." });
      return false;
    }

    const { password, ...userToSet } = foundUser;
    setUser(userToSet as User);
    setIsAuthenticated(true);
    localStorage.setItem(LS_CURRENT_USER_ID_KEY, foundUser.id);

    const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${foundUser.id}`);
    setWithdrawalHistory(storedHistory ? JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })) : []);
    
    toast({ title: "Login Successful", description: `Welcome back, ${foundUser.name}!` });
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setWithdrawalHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LS_CURRENT_USER_ID_KEY);
    }
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  // Helper to update a user's details in the LS_USERS_KEY storage
  // This ensures the password from storage is preserved if not explicitly changed
  const updateUserInStorage = (userToUpdate: Omit<User, 'password'> & { password?: string }) => {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userToUpdate.id);
    if (userIndex !== -1) {
      const existingUser = users[userIndex];
      users[userIndex] = { 
        ...existingUser, // Start with existing stored user (has password)
        ...userToUpdate, // Override with new details
        password: userToUpdate.password || existingUser.password // Preserve old password if new one not provided
      };
      saveAllUsers(users);
    }
  };

  const addBalance = (amount: number) => {
    if (!user) return;
    const newBalance = parseFloat((user.balance + amount).toFixed(2));
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    updateUserInStorage(updatedUser);
  };

  const requestWithdrawal = (amount: number): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return false;
    }
    if (user.balance < amount) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: "Insufficient balance." });
      return false;
    }
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}.` });
      return false;
    }

    const newBalance = parseFloat((user.balance - amount).toFixed(2));
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    updateUserInStorage(updatedUser);

    const newRequest: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      amount,
      status: 'pending',
      requestedAt: new Date(),
    };
    
    const updatedHistory = [newRequest, ...withdrawalHistory];
    setWithdrawalHistory(updatedHistory);
    if (typeof window !== 'undefined') {
        localStorage.setItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${user.id}`, JSON.stringify(updatedHistory));
    }

    toast({ title: "Withdrawal Requested", description: `₹${amount.toFixed(2)} withdrawal request submitted.` });
    return true;
  };
  
  const applyReferral = (code: string): boolean => {
    if (!user) { // Current user trying to apply the code
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to apply a referral code." });
      return false;
    }
    if (user.hasAppliedReferral) {
      toast({ variant: "destructive", title: "Referral Failed", description: "You have already applied a referral bonus." });
      return false;
    }

    let allUsers = getAllUsers();
    const referrer = allUsers.find(u => u.referralCode === code && u.id !== user.id);

    if (!referrer) {
      toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code is invalid or does not exist." });
      return false;
    }

    // Update applicant (current user) in the allUsers array
    const applicantIndex = allUsers.findIndex(u => u.id === user.id);
    if (applicantIndex === -1) { 
        toast({ variant: "destructive", title: "Error", description: "Critical: Could not find current user to apply bonus." });
        return false;
    }
    const applicantWithBonus = {
        ...allUsers[applicantIndex],
        balance: parseFloat((allUsers[applicantIndex].balance + REFERRAL_BONUS).toFixed(2)),
        hasAppliedReferral: true
    };
    allUsers[applicantIndex] = applicantWithBonus;

    // Update referrer in the allUsers array
    const referrerIndex = allUsers.findIndex(u => u.id === referrer.id);
    // No need to check referrerIndex again, already found referrer object
    const updatedReferrer = {
        ...allUsers[referrerIndex],
        balance: parseFloat((allUsers[referrerIndex].balance + REFERRAL_BONUS).toFixed(2))
    };
    allUsers[referrerIndex] = updatedReferrer;

    saveAllUsers(allUsers); // Save all changes to localStorage

    // Update React state for the current user (applicant)
    // Destructure password before setting to React state
    const { password: PwFromApplicant, ...applicantToSetInState } = applicantWithBonus; 
    setUser(applicantToSetInState as User); 
    
    toast({ title: "Referral Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus!` });
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signup, login, logout, addBalance, requestWithdrawal, withdrawalHistory, applyReferral }}>
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

