
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MIN_WITHDRAWAL_AMOUNT, REFERRAL_BONUS, APP_NAME, MAX_ADS_PER_DAY, AD_REWARDS_TIERED } from '@/lib/constants';
import { format, subDays, parseISO, isValid } from 'date-fns';

// Constants for localStorage keys
const LS_USERS_KEY = 'cashquery-users';
const LS_CURRENT_USER_ID_KEY = 'cashquery-current-user-id';
const LS_WITHDRAWAL_HISTORY_PREFIX = 'cashquery-withdrawal-';

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
  password?: string;
  balance: number;
  coins: number;
  referralCode: string;
  referralsMade: number;
  hasAppliedReferral?: boolean;
  hasRatedApp?: boolean;
  gender?: 'Not Specified' | 'Male' | 'Female' | 'Other';
  ageRange?: 'Prefer not to say' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  contactMethod?: 'WhatsApp' | 'Instagram' | 'Telegram';
  contactDetail?: string;
  notificationPreferences?: NotificationPreferences;
  photoURL?: string;
  claimedReferralTiers: string[];
  // Daily Streak and Ad Watch fields
  currentStreak: number;
  lastStreakUpdate: string; // YYYY-MM-DD
  adsWatchedToday: number;
  lastAdWatchDate: string; // YYYY-MM-DD
  dailyCheckIns: string[]; // Array of YYYY-MM-DD for last 7 distinct check-ins
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
  addCoins: (amount: number) => boolean;
  spendCoins: (amount: number) => boolean;
  requestWithdrawal: (amount: number) => boolean;
  withdrawalHistory: WithdrawalRequest[];
  applyReferral: (code: string) => boolean;
  updateUser: (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password'>>) => boolean;
  googleSignIn: () => Promise<void>;
  getAllUsersForLeaderboard: () => User[];
  recordAdWatchAndCheckIn: () => Promise<boolean>; // Returns true if ad watched successfully
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `${APP_NAME.toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
const todayISOString = () => format(new Date(), 'yyyy-MM-dd');
const yesterdayISOString = () => format(subDays(new Date(), 1), 'yyyy-MM-dd');

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
        let loggedInUser = users.find(u => u.id === currentUserId);
        if (loggedInUser) {
          const today = todayISOString();
          const yesterday = yesterdayISOString();

          // Initialize new fields if missing
          loggedInUser.currentStreak = loggedInUser.currentStreak || 0;
          loggedInUser.lastStreakUpdate = loggedInUser.lastStreakUpdate || "";
          loggedInUser.adsWatchedToday = loggedInUser.adsWatchedToday || 0;
          loggedInUser.lastAdWatchDate = loggedInUser.lastAdWatchDate || "";
          loggedInUser.dailyCheckIns = Array.isArray(loggedInUser.dailyCheckIns) ? loggedInUser.dailyCheckIns : [];


          // Daily state updates
          if (loggedInUser.lastAdWatchDate !== today) {
            loggedInUser.adsWatchedToday = 0;
            // Don't update lastAdWatchDate here, recordAdWatchAndCheckIn will do it
          }
          if (loggedInUser.lastStreakUpdate !== today && loggedInUser.lastStreakUpdate !== yesterday) {
            loggedInUser.currentStreak = 0;
          }
           // Prune dailyCheckIns to last 7 valid dates
          loggedInUser.dailyCheckIns = loggedInUser.dailyCheckIns
            .map(dateStr => {
              try {
                return isValid(parseISO(dateStr)) ? dateStr : null;
              } catch { return null; }
            })
            .filter(dateStr => dateStr !== null)
            .sort((a, b) => b!.localeCompare(a!)) // Sort newest first
            .slice(0, 7) as string[];


          const { password, ...userWithoutPassword } = loggedInUser;
          setUser({
            ...userWithoutPassword, // existing fields
            coins: loggedInUser.coins || 0,
            hasRatedApp: loggedInUser.hasRatedApp || false,
            referralsMade: loggedInUser.referralsMade || 0,
            gender: loggedInUser.gender || 'Not Specified',
            ageRange: loggedInUser.ageRange || 'Prefer not to say',
            contactMethod: loggedInUser.contactMethod || 'WhatsApp',
            contactDetail: loggedInUser.contactDetail || '',
            notificationPreferences: loggedInUser.notificationPreferences || {
              offers: true, promo: true, payments: true, updates: true,
            },
            photoURL: loggedInUser.photoURL || undefined,
            hasAppliedReferral: loggedInUser.hasAppliedReferral || false,
            claimedReferralTiers: loggedInUser.claimedReferralTiers || [],
            // New fields
            currentStreak: loggedInUser.currentStreak,
            lastStreakUpdate: loggedInUser.lastStreakUpdate,
            adsWatchedToday: loggedInUser.adsWatchedToday,
            lastAdWatchDate: loggedInUser.lastAdWatchDate,
            dailyCheckIns: loggedInUser.dailyCheckIns,
          } as User);
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


  const getFullUserFromStorage = (userId: string): User | undefined => {
    const users = getAllUsers();
    return users.find(u => u.id === userId);
  };

  const updateUserInStorage = (userId: string, updatedDetails: Partial<User>) => {
    let users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedDetails };
      saveAllUsers(users);
    }
    return users[userIndex];
  };

  const signup = async (name: string, email: string, passwordInput: string, referralCodeInput?: string): Promise<boolean> => {
    let allUsers = getAllUsers();
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({ variant: "destructive", title: "Signup Failed", description: "Email already registered. Please log in." });
      return false;
    }
    const today = todayISOString();
    const newUserBase: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      password: passwordInput,
      balance: 0,
      coins: 0,
      referralCode: generateReferralCode(),
      referralsMade: 0,
      hasAppliedReferral: false,
      hasRatedApp: false,
      gender: 'Not Specified',
      ageRange: 'Prefer not to say',
      contactMethod: 'WhatsApp',
      contactDetail: '',
      notificationPreferences: { offers: true, promo: true, payments: true, updates: true },
      photoURL: undefined,
      claimedReferralTiers: [],
      currentStreak: 0,
      lastStreakUpdate: "", // Set to today on first check-in
      adsWatchedToday: 0,
      lastAdWatchDate: "", // Set to today on first ad watch
      dailyCheckIns: [],
    };

    let finalNewUser = { ...newUserBase };

    if (referralCodeInput) {
      const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === referralCodeInput.trim().toUpperCase() && u.id !== finalNewUser.id);
      if (referrerIndex !== -1) {
        finalNewUser.balance = parseFloat((finalNewUser.balance + REFERRAL_BONUS).toFixed(2));
        finalNewUser.coins = (finalNewUser.coins || 0) + REFERRAL_BONUS;
        finalNewUser.hasAppliedReferral = true;
        toast({ title: "Referral Bonus Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus and ${REFERRAL_BONUS} coins!` });

        allUsers[referrerIndex].balance = parseFloat((allUsers[referrerIndex].balance + REFERRAL_BONUS).toFixed(2));
        allUsers[referrerIndex].coins = (allUsers[referrerIndex].coins || 0) + REFERRAL_BONUS;
        allUsers[referrerIndex].referralsMade = (allUsers[referrerIndex].referralsMade || 0) + 1;
      } else {
        toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code entered was invalid. Signup proceeded without this bonus." });
      }
    }

    const updatedUsersArray = [...allUsers.filter(u => u.id !== finalNewUser.id && u.email.toLowerCase() !== finalNewUser.email.toLowerCase()), finalNewUser];
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

    const today = todayISOString();
    const yesterday = yesterdayISOString();
    let userToSet = { ...foundUser };

    // Initialize new fields if missing for older users
    userToSet.currentStreak = userToSet.currentStreak || 0;
    userToSet.lastStreakUpdate = userToSet.lastStreakUpdate || "";
    userToSet.adsWatchedToday = userToSet.adsWatchedToday || 0;
    userToSet.lastAdWatchDate = userToSet.lastAdWatchDate || "";
    userToSet.dailyCheckIns = Array.isArray(userToSet.dailyCheckIns) ? userToSet.dailyCheckIns : [];

    // Daily state updates on login
    if (userToSet.lastAdWatchDate !== today) {
        userToSet.adsWatchedToday = 0;
    }
    if (userToSet.lastStreakUpdate !== today && userToSet.lastStreakUpdate !== yesterday) {
        userToSet.currentStreak = 0;
    }
    userToSet.dailyCheckIns = userToSet.dailyCheckIns
        .map(dateStr => {
            try { return isValid(parseISO(dateStr)) ? dateStr : null; } catch { return null; }
        })
        .filter(dateStr => dateStr !== null)
        .sort((a, b) => b!.localeCompare(a!))
        .slice(0, 7) as string[];

    // Update storage immediately with potentially cleaned/reset daily data
    updateUserInStorage(userToSet.id, { 
        adsWatchedToday: userToSet.adsWatchedToday, 
        currentStreak: userToSet.currentStreak,
        dailyCheckIns: userToSet.dailyCheckIns
    });

    const { password, ...userForState } = userToSet;
    setUser(userForState as User);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, userToSet.id);
        const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${userToSet.id}`);
        setWithdrawalHistory(storedHistory ? JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })) : []);
    }

    toast({ title: "Login Successful", description: `Welcome back, ${userToSet.name}!` });
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setWithdrawalHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LS_CURRENT_USER_ID_KEY);
    }
  };

  const addBalance = (amount: number) => {
    if (!user) return;
    const newBalance = parseFloat((user.balance + amount).toFixed(2));
    const updatedUserForState = { ...user, balance: newBalance };
    setUser(updatedUserForState);
    updateUserInStorage(user.id, { balance: newBalance });
  };

  const addCoins = (amount: number): boolean => {
    if (!user) return false;
    const newCoins = (user.coins || 0) + amount;
    const updatedUserForState = { ...user, coins: newCoins };
    setUser(updatedUserForState);
    updateUserInStorage(user.id, { coins: newCoins });
    return true;
  };

  const spendCoins = (amount: number): boolean => {
    if (!user || (user.coins || 0) < amount) {
      toast({ variant: "destructive", title: "Not enough coins", description: "You don't have enough coins for this action." });
      return false;
    }
    const newCoins = (user.coins || 0) - amount;
    const updatedUserForState = { ...user, coins: newCoins };
    setUser(updatedUserForState);
    updateUserInStorage(user.id, { coins: newCoins });
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
    updateUserInStorage(user.id, { balance: newBalance });
    const newRequest: WithdrawalRequest = {
      id: `wd-${Date.now()}`, amount, status: 'pending', requestedAt: new Date(),
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
    const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === code.trim().toUpperCase() && u.id !== user.id);
    if (referrerIndex === -1) {
      toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code is invalid or does not exist." });
      return false;
    }
    const applicantNewBalance = parseFloat((user.balance + REFERRAL_BONUS).toFixed(2));
    const applicantNewCoins = (user.coins || 0) + REFERRAL_BONUS;
    const applicantUpdatedFields = { balance: applicantNewBalance, coins: applicantNewCoins, hasAppliedReferral: true };
    setUser(prevUser => prevUser ? { ...prevUser, ...applicantUpdatedFields } : null);
    updateUserInStorage(user.id, applicantUpdatedFields);

    allUsers[referrerIndex].balance = parseFloat((allUsers[referrerIndex].balance + REFERRAL_BONUS).toFixed(2));
    allUsers[referrerIndex].coins = (allUsers[referrerIndex].coins || 0) + REFERRAL_BONUS;
    allUsers[referrerIndex].referralsMade = (allUsers[referrerIndex].referralsMade || 0) + 1;
    saveAllUsers(allUsers);
    toast({ title: "Referral Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus and ${REFERRAL_BONUS} coins!` });
    return true;
  };

  const updateUser = (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password'>>): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to update your profile." });
      return false;
    }
    const updatedUserForState = { ...user, ...updatedDetails };
    setUser(updatedUserForState);
    updateUserInStorage(user.id, updatedDetails);
    // toast({title: "Profile Updated", description: "Your changes have been saved."}); // Toast moved to form
    return true;
  };

  const googleSignIn = async (): Promise<void> => {
    // ... (googleSignIn logic remains the same but ensures new fields are initialized)
    const mockGoogleUserEmail = "google.user@example.com";
    const mockGoogleUserName = "Google User";
    const mockGoogleUserPhotoURL = "https://placehold.co/100x100/7DF9FF/0D1117?text=G";
    const today = todayISOString();

    let allUsers = getAllUsers();
    let googleUser = allUsers.find(u => u.email.toLowerCase() === mockGoogleUserEmail.toLowerCase());

    if (!googleUser) {
      googleUser = {
        id: `user-google-${Date.now()}`,
        email: mockGoogleUserEmail,
        name: mockGoogleUserName,
        password: "mockpassword",
        balance: 0, coins: 0, referralCode: generateReferralCode(), referralsMade: 0,
        hasAppliedReferral: false, hasRatedApp: false, gender: 'Not Specified',
        ageRange: 'Prefer not to say', contactMethod: 'WhatsApp', contactDetail: '',
        notificationPreferences: { offers: true, promo: true, payments: true, updates: true },
        photoURL: mockGoogleUserPhotoURL, claimedReferralTiers: [],
        currentStreak: 0, lastStreakUpdate: "", adsWatchedToday: 0, lastAdWatchDate: "", dailyCheckIns: [],
      };
      allUsers.push(googleUser);
      saveAllUsers(allUsers);
    } else {
        if (!googleUser.photoURL || googleUser.photoURL !== mockGoogleUserPhotoURL) {
            googleUser.photoURL = mockGoogleUserPhotoURL;
        }
        // Initialize new fields if missing for existing Google user
        googleUser.currentStreak = googleUser.currentStreak || 0;
        googleUser.lastStreakUpdate = googleUser.lastStreakUpdate || "";
        googleUser.adsWatchedToday = googleUser.adsWatchedToday || 0;
        googleUser.lastAdWatchDate = googleUser.lastAdWatchDate || "";
        googleUser.dailyCheckIns = Array.isArray(googleUser.dailyCheckIns) ? googleUser.dailyCheckIns : [];
        updateUserInStorage(googleUser.id, googleUser);
    }
    login(googleUser.email, googleUser.password!); // Use existing login for full setup
  };

  const getAllUsersForLeaderboard = (): User[] => {
    const users = getAllUsers();
    return users.map(u => ({
      ...u,
      coins: u.coins || 0, // Ensure coins is a number
      name: u.name || "Unnamed User", // Ensure name exists
    }));
  };

  const recordAdWatchAndCheckIn = async (): Promise<boolean> => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return false;
    }

    let mutableUser = { ...user }; // Work with a mutable copy for this operation
    const today = todayISOString();
    const yesterday = yesterdayISOString();

    // Reset adsWatchedToday if it's a new day for ad watching
    if (mutableUser.lastAdWatchDate !== today) {
      mutableUser.adsWatchedToday = 0;
      mutableUser.lastAdWatchDate = today;
    }

    if (mutableUser.adsWatchedToday >= MAX_ADS_PER_DAY) {
      toast({ title: "Ad Limit Reached", description: "You've watched all available ads for today." });
      return false;
    }

    const reward = AD_REWARDS_TIERED[mutableUser.adsWatchedToday];
    addCoins(reward); // This will update user state and localStorage for coins

    mutableUser.adsWatchedToday += 1;

    // Streak Logic
    if (mutableUser.lastStreakUpdate !== today) { // Only update streak if not already updated today
      if (mutableUser.lastStreakUpdate === yesterday) {
        mutableUser.currentStreak += 1;
      } else {
        mutableUser.currentStreak = 1; // New or broken streak
      }
      mutableUser.lastStreakUpdate = today;

      // Update dailyCheckIns
      let newCheckIns = [today, ...mutableUser.dailyCheckIns.filter(d => d !== today)];
      newCheckIns = Array.from(new Set(newCheckIns)) // Ensure uniqueness
                         .sort((a,b) => b.localeCompare(a)) // Sort newest first
                         .slice(0, 7); // Keep last 7
      mutableUser.dailyCheckIns = newCheckIns;
    }
    
    // Update user state with all changes from this operation
    setUser(mutableUser);
    // Save the comprehensive update to localStorage
    updateUserInStorage(mutableUser.id, {
      adsWatchedToday: mutableUser.adsWatchedToday,
      lastAdWatchDate: mutableUser.lastAdWatchDate,
      currentStreak: mutableUser.currentStreak,
      lastStreakUpdate: mutableUser.lastStreakUpdate,
      dailyCheckIns: mutableUser.dailyCheckIns,
    });
    
    toast({ title: "Reward Claimed!", description: `You earned ${reward} coins!` });
    return true;
  };


  return (
    <AuthContext.Provider value={{
        user, isAuthenticated, isLoadingAuth,
        signup, login, logout, addBalance, addCoins, spendCoins,
        requestWithdrawal, withdrawalHistory, applyReferral, updateUser,
        googleSignIn, getAllUsersForLeaderboard, recordAdWatchAndCheckIn
    }}>
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

    