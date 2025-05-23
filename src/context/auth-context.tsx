
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  API_BASE_URL,
  MIN_WITHDRAWAL_AMOUNT,
  REFERRAL_BONUS,
  APP_NAME,
  MAX_ADS_PER_DAY,
  AD_REWARDS_TIERED,
  SPECIAL_BONUS_ADS_REQUIRED,
  SPECIAL_BONUS_COIN_REWARD
} from '@/lib/constants';
import { format, subDays, parseISO, isValid, isSameDay } from 'date-fns';

// Constants for localStorage keys
const LS_USERS_KEY = 'cashwhiz-users'; // Updated app name
const LS_CURRENT_USER_ID_KEY = 'cashwhiz-current-user-id'; // Updated app name
const LS_WITHDRAWAL_HISTORY_PREFIX = 'cashwhiz-withdrawal-'; // Updated app name

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
  password?: string; // Only present when getting all users, not on the 'user' state object
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
  notificationPreferences: NotificationPreferences;
  photoURL?: string;
  claimedReferralTiers: string[];
  currentStreak: number;
  lastStreakUpdate: string;
  adsWatchedToday: number;
  lastAdWatchDate: string;
  dailyCheckIns: string[]; // Array of YYYY-MM-DD strings
  specialBonusAdsWatched: number;
  specialBonusCompleted: boolean;
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
  signup: (name: string, email: string, passwordInput: string) => Promise<boolean>;
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
  getAllUsersForLeaderboard: () => User[]; // For local leaderboard
  recordAdWatchAndCheckIn: () => Promise<boolean>;
  recordSpecialBonusAdWatch: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `${APP_NAME.toUpperCase().substring(0,4)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
const todayISOString = () => format(new Date(), 'yyyy-MM-dd');
const yesterdayISOString = () => format(subDays(new Date(), 1), 'yyyy-MM-dd');

// Helper to get all users from localStorage
const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedUsers = localStorage.getItem(LS_USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error("Error accessing localStorage for all users:", error);
    return [];
  }
};

// Helper to save all users to localStorage
const saveAllUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving all users to localStorage:", error);
  }
};

// Helper to get a specific user (including password) from localStorage
const getFullUserFromStorage = (userId: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.id === userId);
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const { toast } = useToast();

  const initializeUserFields = (userData: any): User => {
    return {
      ...userData,
      balance: Number(userData.balance) || 0,
      coins: Number(userData.coins) || 0,
      referralsMade: Number(userData.referralsMade) || 0,
      hasAppliedReferral: !!userData.hasAppliedReferral,
      hasRatedApp: !!userData.hasRatedApp,
      gender: userData.gender || 'Not Specified',
      ageRange: userData.ageRange || 'Prefer not to say',
      contactMethod: userData.contactMethod || 'WhatsApp',
      contactDetail: userData.contactDetail || '',
      notificationPreferences: userData.notificationPreferences || {
        offers: true, promo: true, payments: true, updates: true,
      },
      photoURL: userData.photoURL || undefined,
      claimedReferralTiers: Array.isArray(userData.claimedReferralTiers) ? userData.claimedReferralTiers : [],
      currentStreak: Number(userData.currentStreak) || 0,
      lastStreakUpdate: userData.lastStreakUpdate || "",
      adsWatchedToday: Number(userData.adsWatchedToday) || 0,
      lastAdWatchDate: userData.lastAdWatchDate || "",
      dailyCheckIns: Array.isArray(userData.dailyCheckIns) ? userData.dailyCheckIns.filter((d): d is string => typeof d === 'string' && isValid(parseISO(d))) : [],
      specialBonusAdsWatched: Number(userData.specialBonusAdsWatched) || 0,
      specialBonusCompleted: !!userData.specialBonusCompleted,
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoadingAuth(false);
      return;
    }
    let loggedInUserRaw: User | undefined;
    try {
      const currentUserId = localStorage.getItem(LS_CURRENT_USER_ID_KEY);
      
      if (currentUserId) {
        loggedInUserRaw = getFullUserFromStorage(currentUserId);
        
        if (loggedInUserRaw) {
          let userToSet = initializeUserFields(loggedInUserRaw);

          const today = todayISOString();
          const yesterday = yesterdayISOString();

          if (userToSet.lastAdWatchDate !== today) {
            userToSet.adsWatchedToday = 0;
          }
          if (userToSet.lastStreakUpdate !== today && userToSet.lastStreakUpdate !== yesterday) {
            userToSet.currentStreak = 0;
          }
          // Ensure dailyCheckIns are valid dates and sorted
          userToSet.dailyCheckIns = userToSet.dailyCheckIns
            .filter(dateStr => { try { return isValid(parseISO(dateStr)); } catch { return false; }})
            .sort((a,b) => b.localeCompare(a)) // newest first
            .slice(0, 7); // keep only last 7

          const { password, ...userWithoutPassword } = userToSet; // Remove password for state
          setUser(userWithoutPassword);
          setIsAuthenticated(true);
          const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${userToSet.id}`);
          if (storedHistory) {
            setWithdrawalHistory(JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })));
          }
          // Save potentially updated streak/ad data back to localStorage
          updateUserInStorage(userToSet.id, userToSet); 
        } else {
          localStorage.removeItem(LS_CURRENT_USER_ID_KEY); // Clean up if user ID is stale
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

  const updateUserInStorage = (userId: string, updatedDetails: Partial<User>): User | undefined => {
    let users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedDetails };
      saveAllUsers(users);
      return users[userIndex];
    }
    return undefined;
  };

  const signup = async (name: string, email: string, passwordInput: string): Promise<boolean> => {
    let allUsers = getAllUsers();
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({ variant: "destructive", title: "Signup Failed", description: "Email already registered. Please log in." });
      return false;
    }

    let newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      password: passwordInput, // Storing password in LS for prototype
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
      lastStreakUpdate: "",
      adsWatchedToday: 0,
      lastAdWatchDate: "",
      dailyCheckIns: [],
      specialBonusAdsWatched: 0,
      specialBonusCompleted: false,
    };

    allUsers.push(newUser);
    saveAllUsers(allUsers);

    const { password, ...userToSet } = newUser; // Don't keep password in React state
    setUser(userToSet);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, newUser.id);
    }
    setWithdrawalHistory([]);

    toast({ title: "Signup Successful", description: `Welcome, ${name}!` });
    return true;
  };

  const login = async (email: string, passwordInput: string): Promise<boolean> => {
    const users = getAllUsers();
    const rawFoundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!rawFoundUser) {
      toast({ variant: "destructive", title: "Login Failed", description: "Email not found. Please sign up." });
      return false;
    }
    if (rawFoundUser.password !== passwordInput) { // Comparing plain text passwords (prototype only)
      toast({ variant: "destructive", title: "Login Failed", description: "Incorrect password." });
      return false;
    }

    let userToLogin = initializeUserFields(rawFoundUser);

    const today = todayISOString();
    const yesterday = yesterdayISOString();

    if (userToLogin.lastAdWatchDate !== today) {
        userToLogin.adsWatchedToday = 0;
    }
    if (userToLogin.lastStreakUpdate !== today && userToLogin.lastStreakUpdate !== yesterday) {
        userToLogin.currentStreak = 0;
    }
    userToLogin.dailyCheckIns = userToLogin.dailyCheckIns
        .filter(dateStr => { try { return isValid(parseISO(dateStr)); } catch { return false; }})
        .sort((a,b) => b.localeCompare(a))
        .slice(0, 7);

    updateUserInStorage(userToLogin.id, { // Save potentially updated streak/ad data
        adsWatchedToday: userToLogin.adsWatchedToday,
        currentStreak: userToLogin.currentStreak,
        dailyCheckIns: userToLogin.dailyCheckIns,
        lastAdWatchDate: userToLogin.lastAdWatchDate === today ? today : userToLogin.lastAdWatchDate,
        lastStreakUpdate: userToLogin.lastStreakUpdate,
    });
    
    const { password, ...userForState } = userToLogin; // Remove password for state
    setUser(userForState);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, userToLogin.id);
        const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${userToLogin.id}`);
        setWithdrawalHistory(storedHistory ? JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })) : []);
    }

    toast({ title: "Login Successful", description: `Welcome back, ${userToLogin.name}!` });
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

  const addBalance = (amount: number) => { // For real money balance
    if (!user) return;
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) return;

    const newBalance = parseFloat((currentUserData.balance + amount).toFixed(2));
    setUser(prevUser => prevUser ? { ...prevUser, balance: newBalance } : null);
    updateUserInStorage(user.id, { balance: newBalance });
  };

  const addCoins = (amount: number): boolean => { // For in-app currency
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "User not logged in." });
      return false;
    }
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) return false;

    const currentCoins = Number(currentUserData.coins) || 0;
    const newCoins = currentCoins + Number(amount);

    setUser(prevUser => prevUser ? { ...prevUser, coins: newCoins } : null);
    updateUserInStorage(user.id, { coins: newCoins });
    return true;
  };

  const spendCoins = (amount: number): boolean => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "User not logged in." });
        return false;
    }
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) return false;

    const currentCoins = Number(currentUserData.coins) || 0;
    if (currentCoins < Number(amount)) {
      toast({ variant: "destructive", title: "Not enough coins", description: "You don't have enough coins for this action." });
      return false;
    }
    const newCoins = currentCoins - Number(amount);
    setUser(prevUser => prevUser ? { ...prevUser, coins: newCoins } : null);
    updateUserInStorage(user.id, { coins: newCoins });
    return true;
  };

  const requestWithdrawal = (amount: number): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return false;
    }
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) return false;

    if (currentUserData.balance < amount) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: "Insufficient balance." });
      return false;
    }
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}.` });
      return false;
    }
    const newBalance = parseFloat((currentUserData.balance - amount).toFixed(2));
    setUser(prevUser => prevUser ? { ...prevUser, balance: newBalance } : null);
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
    const currentUserData = getFullUserFromStorage(user.id); // Get full data for current user
    if (!currentUserData || currentUserData.hasAppliedReferral) {
      toast({ variant: "destructive", title: "Referral Failed", description: "You have already applied a referral bonus or user data is missing." });
      return false;
    }

    let allUsers = getAllUsers();
    const codeToCompare = code.trim().toUpperCase();
    const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === codeToCompare && u.id !== currentUserData.id);

    if (referrerIndex === -1) {
      toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code is invalid or does not exist." });
      return false;
    }

    // Update applicant (current user)
    const applicantNewBalance = parseFloat(((currentUserData.balance || 0) + REFERRAL_BONUS).toFixed(2));
    const applicantNewCoins = (currentUserData.coins || 0) + REFERRAL_BONUS; // Applying coin bonus as well
    const applicantUpdatedFields: Partial<User> = { 
      balance: applicantNewBalance, 
      coins: applicantNewCoins, 
      hasAppliedReferral: true 
    };
    
    setUser(prevUser => prevUser ? { ...prevUser, ...applicantUpdatedFields } : null);
    updateUserInStorage(currentUserData.id, applicantUpdatedFields); // Save applicant changes
    
    allUsers = getAllUsers(); // Re-fetch all users after applicant's update

    // Update referrer
    let referrer = allUsers[referrerIndex]; // Get fresh referrer data
    referrer.balance = parseFloat(((referrer.balance || 0) + REFERRAL_BONUS).toFixed(2));
    referrer.coins = (referrer.coins || 0) + REFERRAL_BONUS; // Applying coin bonus as well
    referrer.referralsMade = (referrer.referralsMade || 0) + 1;
    updateUserInStorage(referrer.id, { balance: referrer.balance, coins: referrer.coins, referralsMade: referrer.referralsMade }); // Save referrer changes

    toast({ title: "Referral Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} balance bonus and ${REFERRAL_BONUS} coins!` });
    return true;
  };

  const updateUser = (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password'>>): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to update your profile." });
      return false;
    }
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) return false;
    
    const updatedUser = { ...currentUserData, ...updatedDetails };
    const { password, ...userForState } = updatedUser; // Remove password before setting to state
    setUser(userForState);
    updateUserInStorage(user.id, updatedUser); // Store full user data including password if it exists
    return true;
  };

  const googleSignIn = async (): Promise<void> => {
    const mockGoogleUserEmail = "google.user@example.com";
    const mockGoogleUserName = "Google User";
    const mockGoogleUserPhotoURL = "https://placehold.co/100x100/E0E0E0/333333?text=G";

    let allUsers = getAllUsers();
    let googleUserRaw = allUsers.find(u => u.email.toLowerCase() === mockGoogleUserEmail.toLowerCase());

    if (!googleUserRaw) {
      const newGoogleUser: User = {
        id: `user-google-${Date.now()}`,
        email: mockGoogleUserEmail,
        name: mockGoogleUserName,
        password: "mockpassword", // Required for login flow
        photoURL: mockGoogleUserPhotoURL,
        balance: 0, coins: 0, referralCode: generateReferralCode(), referralsMade: 0,
        hasAppliedReferral: false, hasRatedApp: false, gender: 'Not Specified',
        ageRange: 'Prefer not to say', contactMethod: 'WhatsApp', contactDetail: '',
        notificationPreferences: { offers: true, promo: true, payments: true, updates: true },
        claimedReferralTiers: [], currentStreak: 0, lastStreakUpdate: "", adsWatchedToday: 0,
        lastAdWatchDate: "", dailyCheckIns: [], specialBonusAdsWatched: 0, specialBonusCompleted: false,
      };
      allUsers.push(newGoogleUser);
      saveAllUsers(allUsers);
      googleUserRaw = newGoogleUser;
    } else {
        // Ensure existing "Google user" has photoURL and password for login
        let updatedGoogleUser = initializeUserFields(googleUserRaw);
        updatedGoogleUser.photoURL = updatedGoogleUser.photoURL || mockGoogleUserPhotoURL;
        updatedGoogleUser.password = updatedGoogleUser.password || "mockpassword";
        updateUserInStorage(updatedGoogleUser.id, updatedGoogleUser);
        googleUserRaw = updatedGoogleUser;
    }
    await login(googleUserRaw.email, googleUserRaw.password!); 
    toast({ title: "Signed in with Google (Simulated)" });
  };

  const getAllUsersForLeaderboard = (): User[] => {
    // This function returns all users from localStorage, used by LeaderboardTable
    const users = getAllUsers();
    // Initialize fields and remove password for leaderboard display
    return users.map(u => {
      const initializedUser = initializeUserFields(u);
      const { password, ...userForDisplay } = initializedUser;
      return userForDisplay;
    });
  };

  const recordAdWatchAndCheckIn = async (): Promise<boolean> => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return false;
    }

    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) {
         toast({ variant: "destructive", title: "Error", description: "User data not found." });
        return false;
    }

    let mutableUser = { ...currentUserData }; // Create a mutable copy
    const today = todayISOString();
    const yesterday = yesterdayISOString();

    // Reset adsWatchedToday if last ad watch was not today
    if (mutableUser.lastAdWatchDate !== today) {
      mutableUser.adsWatchedToday = 0;
      mutableUser.lastAdWatchDate = today;
    }

    if (mutableUser.adsWatchedToday >= MAX_ADS_PER_DAY) {
      toast({ title: "Ad Limit Reached", description: "You've watched all available ads for today." });
      // Update user state to reflect the reset if it happened
      setUser(prev => prev ? {...prev, adsWatchedToday: mutableUser.adsWatchedToday, lastAdWatchDate: mutableUser.lastAdWatchDate } : null);
      updateUserInStorage(mutableUser.id, { adsWatchedToday: mutableUser.adsWatchedToday, lastAdWatchDate: mutableUser.lastAdWatchDate });
      return false;
    }

    const rewardIndex = mutableUser.adsWatchedToday;
    const reward = AD_REWARDS_TIERED[rewardIndex < AD_REWARDS_TIERED.length ? rewardIndex : AD_REWARDS_TIERED.length -1];

    const currentCoins = Number(mutableUser.coins) || 0;
    mutableUser.coins = currentCoins + Number(reward);
    mutableUser.adsWatchedToday += 1;

    let hasCheckedInToday = mutableUser.dailyCheckIns.some(dateStr => {
        try { return isSameDay(parseISO(dateStr), new Date()); } catch { return false; }
    });

    if (!hasCheckedInToday) {
      if (mutableUser.lastStreakUpdate === yesterday) {
        mutableUser.currentStreak = (Number(mutableUser.currentStreak) || 0) + 1;
      } else if (mutableUser.lastStreakUpdate !== today) { // If last update wasn't today or yesterday
        mutableUser.currentStreak = 1;
      }
      mutableUser.lastStreakUpdate = today;

      let newCheckIns = [today, ...mutableUser.dailyCheckIns.filter(d => d !== today)];
      // Ensure unique dates, sort, and limit to 7
      newCheckIns = Array.from(new Set(newCheckIns))
                         .map(dateStr => { try { return parseISO(dateStr); } catch { return null; }})
                         .filter(date => date !== null && isValid(date))
                         .sort((a,b) => b!.getTime() - a!.getTime()) // Sort by date descending
                         .slice(0, 7)
                         .map(date => format(date!, 'yyyy-MM-dd'));
      mutableUser.dailyCheckIns = newCheckIns;
    }
    
    const { password, ...userForState } = mutableUser;
    setUser(userForState);
    updateUserInStorage(mutableUser.id, userForState); // Save full user data including password if it exists

    toast({ title: "Reward Claimed!", description: `You earned ${reward} coins!` });
    return true;
  };

  const recordSpecialBonusAdWatch = async (): Promise<boolean> => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return false;
    }
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) {
      toast({ variant: "destructive", title: "Error", description: "User data not found." });
      return false;
    }

    let mutableUser = { ...currentUserData };

    if (mutableUser.specialBonusCompleted) {
      toast({ title: "Bonus Unavailable", description: "You have already claimed this special bonus." });
      return false;
    }

    mutableUser.specialBonusAdsWatched = (Number(mutableUser.specialBonusAdsWatched) || 0) + 1;

    if (mutableUser.specialBonusAdsWatched >= SPECIAL_BONUS_ADS_REQUIRED) {
      const currentCoins = Number(mutableUser.coins) || 0;
      mutableUser.coins = currentCoins + SPECIAL_BONUS_COIN_REWARD;
      mutableUser.specialBonusCompleted = true;
      mutableUser.specialBonusAdsWatched = SPECIAL_BONUS_ADS_REQUIRED; // Cap it
      toast({ title: "Special Bonus Claimed!", description: `You earned ${SPECIAL_BONUS_COIN_REWARD} coins!` });
    } else {
      toast({ title: "Ad Watched!", description: `Watch ${SPECIAL_BONUS_ADS_REQUIRED - mutableUser.specialBonusAdsWatched} more ads to claim the bonus.` });
    }
    
    const { password, ...userForState } = mutableUser;
    setUser(userForState);
    updateUserInStorage(mutableUser.id, userForState);
    return true;
  };


  return (
    <AuthContext.Provider value={{
        user, isAuthenticated, isLoadingAuth,
        signup, login, logout, addBalance, addCoins, spendCoins,
        requestWithdrawal, withdrawalHistory, applyReferral, updateUser,
        googleSignIn, getAllUsersForLeaderboard,
        recordAdWatchAndCheckIn, recordSpecialBonusAdWatch
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

