
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AD_REWARD, MIN_WITHDRAWAL_AMOUNT, REFERRAL_BONUS } from '@/lib/constants';

// Constants for localStorage keys
const LS_USERS_KEY = 'adplay-users';
const LS_CURRENT_USER_ID_KEY = 'adplay-current-user-id';
const LS_WITHDRAWAL_HISTORY_PREFIX = 'adplay-withdrawal-';

interface NotificationPreferences {
  offers: boolean;
  promo: boolean;
  payments: boolean;
  updates: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Stored in LS, not in active user state object for security simulation
  balance: number;
  coins: number;
  referralCode: string;
  referralsMade: number; // New field for leaderboard
  hasAppliedReferral?: boolean;
  hasRatedApp?: boolean;
  // Profile fields
  gender?: 'Not Specified' | 'Male' | 'Female' | 'Other';
  ageRange?: 'Prefer not to say' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  contactMethod?: 'WhatsApp' | 'Instagram' | 'Telegram';
  contactDetail?: string;
  // Notification preferences
  notificationPreferences?: NotificationPreferences;
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
  isLoadingAuth: boolean;
  signup: (name: string, email: string, passwordInput: string, referralCodeInput?: string) => Promise<boolean>;
  login: (email: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
  addBalance: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  requestWithdrawal: (amount: number) => boolean;
  withdrawalHistory: WithdrawalRequest[];
  applyReferral: (code: string) => boolean;
  updateUser: (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password' | 'balance' | 'referralCode' | 'coins'>>) => boolean;
  getAllUsersForLeaderboard: () => User[]; // Helper for leaderboard
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `ADPLAY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// Helper to get all users from localStorage
const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedUsers = localStorage.getItem(LS_USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return [];
  }
};

// Helper to save all users to localStorage
const saveAllUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoadingAuth(false);
      return;
    }
    try {
      const currentUserId = localStorage.getItem(LS_CURRENT_USER_ID_KEY);
      if (currentUserId) {
        const users = getAllUsers();
        const loggedInUser = users.find(u => u.id === currentUserId);
        if (loggedInUser) {
          const { password, ...userWithoutPassword } = loggedInUser;
          setUser({ coins: 0, hasRatedApp: false, referralsMade: 0, ...userWithoutPassword } as User); // Default coins, hasRatedApp, referralsMade if not present
          setIsAuthenticated(true);
          const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${loggedInUser.id}`);
          if (storedHistory) {
            setWithdrawalHistory(JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })));
          }
        } else {
          localStorage.removeItem(LS_CURRENT_USER_ID_KEY);
        }
      }
    } catch (error) {
      console.error("Error during auth initialization from localStorage:", error);
      localStorage.removeItem(LS_CURRENT_USER_ID_KEY);
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoadingAuth(false);
  }, []);

  const signup = async (name: string, email: string, passwordInput: string, referralCodeInput?: string): Promise<boolean> => {
    let allUsers = getAllUsers();
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({ variant: "destructive", title: "Signup Failed", description: "Email already registered. Please log in." });
      return false;
    }

    const newUserBase: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      password: passwordInput,
      balance: 0,
      coins: 0,
      referralCode: generateReferralCode(),
      referralsMade: 0, // Initialize referralsMade
      hasAppliedReferral: false,
      hasRatedApp: false,
      gender: 'Not Specified',
      ageRange: 'Prefer not to say',
      contactMethod: 'WhatsApp',
      contactDetail: '',
      notificationPreferences: {
        offers: true,
        promo: true,
        payments: true,
        updates: true,
      },
    };

    let finalNewUser = { ...newUserBase };

    if (referralCodeInput) {
      const referrerIndex = allUsers.findIndex(u => u.referralCode === referralCodeInput && u.id !== finalNewUser.id);
      if (referrerIndex !== -1) {
        finalNewUser.balance = parseFloat((finalNewUser.balance + REFERRAL_BONUS).toFixed(2));
        finalNewUser.hasAppliedReferral = true;
        toast({ title: "Referral Bonus Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus!` });
        
        allUsers[referrerIndex].balance = parseFloat((allUsers[referrerIndex].balance + REFERRAL_BONUS).toFixed(2));
        allUsers[referrerIndex].referralsMade = (allUsers[referrerIndex].referralsMade || 0) + 1;
      } else {
        toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code entered was invalid. Signup proceeded without this bonus." });
      }
    }
    
    const updatedUsersArray = [...allUsers.filter(u => u.id !== finalNewUser.id), finalNewUser];
    saveAllUsers(updatedUsersArray);

    const { password, ...userToSet } = finalNewUser;
    setUser(userToSet as User);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, finalNewUser.id);
    }
    setWithdrawalHistory([]);

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

    if (foundUser.password !== passwordInput) {
      toast({ variant: "destructive", title: "Login Failed", description: "Incorrect password." });
      return false;
    }

    const { password, ...userToSet } = foundUser;
    setUser({ coins: 0, hasRatedApp: false, referralsMade: 0, ...userToSet } as User);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, foundUser.id);
        const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${foundUser.id}`);
        setWithdrawalHistory(storedHistory ? JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })) : []);
    }
    
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

  const getFullUserFromStorage = (userId: string): User | undefined => {
    const users = getAllUsers();
    return users.find(u => u.id === userId);
  };

  const updateUserInStorage = (userId: string, updatedDetails: Partial<User>) => {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedDetails };
      saveAllUsers(users);
    }
  };
  
  const addBalance = (amount: number) => {
    if (!user) return;
    const newBalance = parseFloat((user.balance + amount).toFixed(2));
    const updatedUserForState = { ...user, balance: newBalance };
    setUser(updatedUserForState);
    
    const fullUserFromStorage = getFullUserFromStorage(user.id);
    if (fullUserFromStorage) {
        updateUserInStorage(user.id, { ...fullUserFromStorage, balance: newBalance });
    }
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    const newCoins = (user.coins || 0) + amount;
    const updatedUserForState = { ...user, coins: newCoins };
    setUser(updatedUserForState);

    const fullUserFromStorage = getFullUserFromStorage(user.id);
    if (fullUserFromStorage) {
      updateUserInStorage(user.id, { ...fullUserFromStorage, coins: newCoins });
    }
  };

  const spendCoins = (amount: number): boolean => {
    if (!user || (user.coins || 0) < amount) {
      toast({ variant: "destructive", title: "Not enough coins", description: "You don't have enough coins for this purchase." });
      return false;
    }
    const newCoins = (user.coins || 0) - amount;
    const updatedUserForState = { ...user, coins: newCoins };
    setUser(updatedUserForState);

    const fullUserFromStorage = getFullUserFromStorage(user.id);
    if (fullUserFromStorage) {
      updateUserInStorage(user.id, { ...fullUserFromStorage, coins: newCoins });
    }
    return true;
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
    const updatedUserForState = { ...user, balance: newBalance };
    setUser(updatedUserForState);

    const fullUserFromStorage = getFullUserFromStorage(user.id);
     if (fullUserFromStorage) {
        updateUserInStorage(user.id, { ...fullUserFromStorage, balance: newBalance });
    }

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
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to apply a referral code." });
      return false;
    }
    if (user.hasAppliedReferral) {
      toast({ variant: "destructive", title: "Referral Failed", description: "You have already applied a referral bonus." });
      return false;
    }

    let allUsers = getAllUsers();
    const referrerIndex = allUsers.findIndex(u => u.referralCode === code && u.id !== user.id);

    if (referrerIndex === -1) {
      toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code is invalid or does not exist." });
      return false;
    }

    const applicantNewBalance = parseFloat((user.balance + REFERRAL_BONUS).toFixed(2));
    const applicantWithBonusForState = {
        ...user,
        balance: applicantNewBalance,
        hasAppliedReferral: true
    };
    setUser(applicantWithBonusForState);

    const fullApplicantUserFromStorage = getFullUserFromStorage(user.id);
    if (fullApplicantUserFromStorage) {
        updateUserInStorage(user.id, { ...fullApplicantUserFromStorage, balance: applicantNewBalance, hasAppliedReferral: true});
    }
    
    allUsers[referrerIndex].balance = parseFloat((allUsers[referrerIndex].balance + REFERRAL_BONUS).toFixed(2));
    allUsers[referrerIndex].referralsMade = (allUsers[referrerIndex].referralsMade || 0) + 1;
    saveAllUsers(allUsers); // Save all users after updating referrer
    
    toast({ title: "Referral Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus!` });
    return true;
  };

  const updateUser = (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password' | 'balance' | 'referralCode' | 'coins'>>): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to update your profile." });
      return false;
    }

    const updatedUserForState = { ...user, ...updatedDetails };
    setUser(updatedUserForState);

    const fullUserFromStorage = getFullUserFromStorage(user.id);
    if (fullUserFromStorage) {
         updateUserInStorage(user.id, { ...fullUserFromStorage, ...updatedDetails });
    }
    
    return true;
  };

  const getAllUsersForLeaderboard = (): User[] => {
    return getAllUsers();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, signup, login, logout, addBalance, addCoins, spendCoins, requestWithdrawal, withdrawalHistory, applyReferral, updateUser, getAllUsersForLeaderboard }}>
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

    