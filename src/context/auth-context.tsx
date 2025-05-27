
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
  SPECIAL_OFFERS_CONFIG,
  AD_DURATION_SECONDS, // Used by SpecialBonusAdCard, ensure it's available
  SPECIAL_BONUS_ADS_REQUIRED,
  SPECIAL_BONUS_COIN_REWARD,
} from '@/lib/constants';
import { format, subDays, parseISO, isValid, isSameDay } from 'date-fns';

// Constants for localStorage keys
const LS_USERS_KEY = 'cashwhiz-users';
const LS_CURRENT_USER_ID_KEY = 'cashwhiz-current-user-id';
const LS_WITHDRAWAL_HISTORY_PREFIX = 'cashwhiz-withdrawal-';

interface NotificationPreferences {
  offers: boolean;
  promo: boolean;
  payments: boolean;
  updates: boolean;
}

interface SpecialOfferProgress {
  currentOfferIndex: number;
  completedOfferIds: string[];
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'Daily Ad' | 'Referral Bonus' | 'Special Offer' | 'Special Bonus' | 'Rating Bonus' | 'Manual Adjustment';
  description: string;
  date: string; // ISO string
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
  notificationPreferences: NotificationPreferences;
  photoURL?: string;
  claimedReferralTiers: string[];
  currentStreak: number;
  lastStreakUpdate: string;
  adsWatchedToday: number;
  lastAdWatchDate: string;
  dailyCheckIns: string[];
  // For daily refreshing special offers
  dailySpecialOffersCompletedIds: string[];
  lastSpecialOfferResetDate: string;
  historicalSpecialOffers: Array<{ id: string; dateCompleted: string; coinsEarned: number }>;
  // For one-time special ad bonus
  specialBonusAdsWatched: number;
  specialBonusCompleted: boolean;
  coinTransactionHistory: CoinTransaction[];
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
  addCoins: (amount: number, type: CoinTransaction['type'], description: string) => boolean;
  spendCoins: (amount: number) => boolean;
  requestWithdrawal: (amount: number) => boolean;
  withdrawalHistory: WithdrawalRequest[];
  applyReferral: (code: string) => boolean;
  updateUser: (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password'>>) => boolean;
  googleSignIn: () => Promise<void>;
  getAllUsersForLeaderboard: () => User[];
  recordAdWatchAndCheckIn: () => Promise<boolean>;
  completeSpecialOffer: (offerId: string, coinReward: number) => Promise<boolean>;
  recordSpecialBonusAdWatch: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `${APP_NAME.toUpperCase().substring(0,8).replace(/\s/g, '')}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
const todayISOString = () => format(new Date(), 'yyyy-MM-dd');
const yesterdayISOString = () => format(subDays(new Date(), 1), 'yyyy-MM-dd');

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

const saveAllUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving all users to localStorage:", error);
  }
};

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
    const today = todayISOString();
    const yesterday = yesterdayISOString();

    let initializedData = {
      ...userData,
      balance: Number(userData.balance) || 0,
      coins: Number(userData.coins) || 0,
      referralsMade: Number(userData.referralsMade) || 0,
      hasAppliedReferral: !!userData.hasAppliedReferral,
      hasRatedApp: !!userData.hasRatedApp,
      gender: userData.gender || 'Not Specified',
      ageRange: userData.ageRange || 'Prefer not to say',
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
      dailySpecialOffersCompletedIds: Array.isArray(userData.dailySpecialOffersCompletedIds) ? userData.dailySpecialOffersCompletedIds : [],
      lastSpecialOfferResetDate: userData.lastSpecialOfferResetDate || "",
      historicalSpecialOffers: Array.isArray(userData.historicalSpecialOffers) ? userData.historicalSpecialOffers : [],
      specialBonusAdsWatched: Number(userData.specialBonusAdsWatched) || 0,
      specialBonusCompleted: !!userData.specialBonusCompleted,
      coinTransactionHistory: Array.isArray(userData.coinTransactionHistory) ? userData.coinTransactionHistory : [],
    };

    // Daily reset logic
    if (initializedData.lastAdWatchDate !== today) {
      initializedData.adsWatchedToday = 0;
    }
    if (initializedData.lastStreakUpdate !== today && initializedData.lastStreakUpdate !== yesterday) {
      initializedData.currentStreak = 0;
    }
    if (initializedData.lastSpecialOfferResetDate !== today) {
        initializedData.dailySpecialOffersCompletedIds = [];
    }
     initializedData.dailyCheckIns = initializedData.dailyCheckIns
      .filter(dateStr => { try { return isValid(parseISO(dateStr)); } catch { return false; }})
      .sort((a,b) => parseISO(b).getTime() - parseISO(a).getTime())
      .slice(0, 7);

    return initializedData;
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

          // Ensure daily resets are applied if user data was stale
          const today = todayISOString();
          if (userToSet.lastAdWatchDate !== today) {
            userToSet.adsWatchedToday = 0;
            userToSet.lastAdWatchDate = today; // Important to update this so it doesn't reset again until tomorrow
          }
          if (userToSet.lastSpecialOfferResetDate !== today) {
            userToSet.dailySpecialOffersCompletedIds = [];
            userToSet.lastSpecialOfferResetDate = today;
          }

          const { password, ...userWithoutPassword } = userToSet;
          setUser(userWithoutPassword);
          setIsAuthenticated(true);
          const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${userToSet.id}`);
          if (storedHistory) {
            setWithdrawalHistory(JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })));
          }
          updateUserInStorage(userToSet.id, userToSet); // Save potentially reset daily fields
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
      password: passwordInput, // Stored in plain text for prototype
      balance: 0,
      coins: 0,
      referralCode: generateReferralCode(),
      referralsMade: 0,
      hasAppliedReferral: false,
      hasRatedApp: false,
      gender: 'Not Specified',
      ageRange: 'Prefer not to say',
      notificationPreferences: { offers: true, promo: true, payments: true, updates: true },
      photoURL: undefined,
      claimedReferralTiers: [],
      currentStreak: 0,
      lastStreakUpdate: "",
      adsWatchedToday: 0,
      lastAdWatchDate: "",
      dailyCheckIns: [],
      dailySpecialOffersCompletedIds: [],
      lastSpecialOfferResetDate: "",
      historicalSpecialOffers: [],
      specialBonusAdsWatched: 0,
      specialBonusCompleted: false,
      coinTransactionHistory: [],
    };

    allUsers.push(newUser);
    saveAllUsers(allUsers);

    const { password, ...userToSet } = newUser;
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
    if (rawFoundUser.password !== passwordInput) {
      toast({ variant: "destructive", title: "Login Failed", description: "Incorrect password." });
      return false;
    }

    let userToLogin = initializeUserFields(rawFoundUser);

    // Ensure daily resets are applied on login
    const today = todayISOString();
    let fieldsToUpdateOnLogin: Partial<User> = {};
    if (userToLogin.lastAdWatchDate !== today) {
        fieldsToUpdateOnLogin.adsWatchedToday = 0;
        fieldsToUpdateOnLogin.lastAdWatchDate = today;
    }
    if (userToLogin.lastSpecialOfferResetDate !== today) {
        fieldsToUpdateOnLogin.dailySpecialOffersCompletedIds = [];
        fieldsToUpdateOnLogin.lastSpecialOfferResetDate = today;
    }
    userToLogin = { ...userToLogin, ...fieldsToUpdateOnLogin };


    const { password, ...userForState } = userToLogin;
    setUser(userForState);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, userToLogin.id);
        const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${userToLogin.id}`);
        setWithdrawalHistory(storedHistory ? JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })) : []);
    }
    updateUserInStorage(userToLogin.id, userToLogin); // Save updated daily fields

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

  const addBalance = (amount: number) => {
    if (!user) return;
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) return;

    const newBalance = parseFloat((currentUserData.balance + amount).toFixed(2));
    const updatedFields = { balance: newBalance };
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedFields } : null);
    updateUserInStorage(user.id, updatedFields);
  };

  const addCoins = (amount: number, type: CoinTransaction['type'], description: string): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "User not logged in." });
      return false;
    }
    const currentUserData = getFullUserFromStorage(user.id);
    if (!currentUserData) {
        toast({ variant: "destructive", title: "Error", description: "User data not found." });
        return false;
    }

    const currentCoins = Number(currentUserData.coins) || 0;
    const newCoins = currentCoins + Number(amount);

    const newTransaction: CoinTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: Number(amount),
      type,
      description,
      date: new Date().toISOString(),
    };
    const existingHistory = Array.isArray(currentUserData.coinTransactionHistory) ? currentUserData.coinTransactionHistory : [];
    const updatedHistory = [newTransaction, ...existingHistory].slice(0, 50);

    const updatedFields = { coins: newCoins, coinTransactionHistory: updatedHistory };

    setUser(prevUser => prevUser ? { ...prevUser, ...updatedFields } : null);
    updateUserInStorage(user.id, updatedFields);
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
    // Log spending transaction if needed (not implemented here for brevity)
    const updatedFields = { coins: newCoins };
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedFields } : null);
    updateUserInStorage(user.id, updatedFields);
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
    updateUser( { balance: newBalance } ); // Use updateUser to also update state

    const newRequest: WithdrawalRequest = {
      id: `wd-${Date.now()}`, amount, status: 'pending', requestedAt: new Date(),
    };
    const updatedWithdrawalHist = [newRequest, ...withdrawalHistory];
    setWithdrawalHistory(updatedWithdrawalHist);
    if (typeof window !== 'undefined') {
        localStorage.setItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${user.id}`, JSON.stringify(updatedWithdrawalHist));
    }
    toast({ title: "Withdrawal Requested", description: `₹${amount.toFixed(2)} withdrawal request submitted.` });
    return true;
  };

  const applyReferral = (code: string): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to apply a referral code." });
      return false;
    }
    const applicantFullData = getFullUserFromStorage(user.id);
    if (!applicantFullData || applicantFullData.hasAppliedReferral) {
      toast({ variant: "destructive", title: "Referral Failed", description: "You have already applied a referral bonus or user data is missing." });
      return false;
    }

    let allUsers = getAllUsers();
    const codeToCompare = code.trim().toUpperCase();
    const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === codeToCompare && u.id !== applicantFullData.id);

    if (referrerIndex === -1) {
      toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code is invalid or does not exist." });
      return false;
    }

    let referrer = allUsers[referrerIndex];

    // Apply to applicant
    addCoins(REFERRAL_BONUS, 'Referral Bonus', `Applied referral code ${referrer.referralCode}`);
    updateUser({ hasAppliedReferral: true }); // This saves applicant's specific field

    // Apply to referrer
    const referrerCurrentCoins = Number(referrer.coins) || 0;
    const referrerNewCoins = referrerCurrentCoins + REFERRAL_BONUS;
    const referrerTransaction: CoinTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: REFERRAL_BONUS,
      type: 'Referral Bonus',
      description: `Friend ${applicantFullData.name} used your code`,
      date: new Date().toISOString(),
    };
    const referrerHistory = Array.isArray(referrer.coinTransactionHistory) ? referrer.coinTransactionHistory : [];
    const referrerUpdatedHistory = [referrerTransaction, ...referrerHistory].slice(0, 50);

    updateUserInStorage(referrer.id, {
      coins: referrerNewCoins,
      coinTransactionHistory: referrerUpdatedHistory,
      referralsMade: (referrer.referralsMade || 0) + 1,
    });

    toast({ title: "Referral Applied!", description: `You and your friend earned ${REFERRAL_BONUS} coins!` });
    return true;
  };

  const updateUser = (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password'>>): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to update your profile." });
      return false;
    }
    const currentUserData = getFullUserFromStorage(user.id); // Get latest from storage
    if (!currentUserData) {
        toast({ variant: "destructive", title: "Error", description: "User data not found for update." });
        return false;
    }

    const updatedUser = { ...currentUserData, ...updatedDetails };
    const { password, ...userForState } = updatedUser; // Ensure password is not in state

    setUser(userForState); // Update local React state
    updateUserInStorage(user.id, updatedUser); // Update localStorage
    return true;
  };


  const googleSignIn = async (): Promise<void> => {
    const mockGoogleUserEmail = "google.user@example.com";
    const mockGoogleUserName = "Google User";
    const mockGoogleUserPhotoURL = "https://placehold.co/100x100.png?text=G";

    let allUsers = getAllUsers();
    let googleUserRaw = allUsers.find(u => u.email.toLowerCase() === mockGoogleUserEmail.toLowerCase());

    if (!googleUserRaw) {
      const newGoogleUser: User = {
        id: `user-google-${Date.now()}`,
        email: mockGoogleUserEmail,
        name: mockGoogleUserName,
        password: "mockpassword", // Placeholder for prototype
        photoURL: mockGoogleUserPhotoURL,
        balance: 0, coins: 0, referralCode: generateReferralCode(), referralsMade: 0,
        hasAppliedReferral: false, hasRatedApp: false, gender: 'Not Specified',
        ageRange: 'Prefer not to say',
        notificationPreferences: { offers: true, promo: true, payments: true, updates: true },
        claimedReferralTiers: [], currentStreak: 0, lastStreakUpdate: "", adsWatchedToday: 0,
        lastAdWatchDate: "", dailyCheckIns: [],
        dailySpecialOffersCompletedIds: [], lastSpecialOfferResetDate: "", historicalSpecialOffers: [],
        specialBonusAdsWatched: 0, specialBonusCompleted: false, coinTransactionHistory: [],
      };
      allUsers.push(newGoogleUser);
      saveAllUsers(allUsers);
      googleUserRaw = newGoogleUser;
    } else {
        let updatedGoogleUser = initializeUserFields(googleUserRaw);
        updatedGoogleUser.photoURL = updatedGoogleUser.photoURL || mockGoogleUserPhotoURL;
        updatedGoogleUser.password = updatedGoogleUser.password || "mockpassword";
        updateUserInStorage(updatedGoogleUser.id, updatedGoogleUser);
        googleUserRaw = updatedGoogleUser;
    }
    // Simulate login which handles daily resets and state updates
    await login(googleUserRaw.email, googleUserRaw.password!);
    // Toast for Google sign-in is handled by login if successful
  };

  const getAllUsersForLeaderboard = (): User[] => {
    if (API_BASE_URL !== "REPLACE_WITH_YOUR_LIVE_API_BASE_URL") {
        // This indicates we are in a mode where we might use a live API
        // For now, as per user request, we'll always use local storage
    }
    const users = getAllUsers();
    return users.map(u => {
      const initializedUser = initializeUserFields(u);
      const { password, ...userForDisplay } = initializedUser;
      return userForDisplay;
    }).sort((a, b) => (b.coins || 0) - (a.coins || 0));
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

    let mutableUser = { ...currentUserData }; // Work with a mutable copy
    const today = todayISOString();
    const yesterday = yesterdayISOString();

    // Reset adsWatchedToday if it's a new day
    if (mutableUser.lastAdWatchDate !== today) {
      mutableUser.adsWatchedToday = 0;
      mutableUser.lastAdWatchDate = today;
    }

    if (mutableUser.adsWatchedToday >= MAX_ADS_PER_DAY) {
      toast({ title: "Ad Limit Reached", description: "You've watched all available ads for today." });
      updateUser({ adsWatchedToday: mutableUser.adsWatchedToday, lastAdWatchDate: mutableUser.lastAdWatchDate }); // Ensure date is saved
      return false;
    }

    const rewardIndex = mutableUser.adsWatchedToday;
    const reward = AD_REWARDS_TIERED[rewardIndex < AD_REWARDS_TIERED.length ? rewardIndex : AD_REWARDS_TIERED.length - 1];

    // Call addCoins to handle coin update and transaction logging
    addCoins(reward, 'Daily Ad', `Watched Ad #${mutableUser.adsWatchedToday + 1}`);

    // Now prepare other user field updates
    let updatedFieldsForUser: Partial<User> = {
        adsWatchedToday: mutableUser.adsWatchedToday + 1,
        lastAdWatchDate: today, // Ensure lastAdWatchDate is updated
    };

    let hasCheckedInToday = mutableUser.dailyCheckIns.some(dateStr => {
        try { return isSameDay(parseISO(dateStr), new Date()); } catch { return false; }
    });

    if (!hasCheckedInToday) {
      if (mutableUser.lastStreakUpdate === yesterday) {
        updatedFieldsForUser.currentStreak = (Number(mutableUser.currentStreak) || 0) + 1;
      } else if (mutableUser.lastStreakUpdate !== today) {
        updatedFieldsForUser.currentStreak = 1;
      } else { // Already checked in today but somehow this logic is hit - keep current streak
        updatedFieldsForUser.currentStreak = Number(mutableUser.currentStreak) || 0;
      }
      updatedFieldsForUser.lastStreakUpdate = today;

      let newCheckIns = [today, ...mutableUser.dailyCheckIns.filter(d => d !== today)];
      newCheckIns = Array.from(new Set(newCheckIns))
                         .map(dateStr => { try { return parseISO(dateStr); } catch { return null; }})
                         .filter(date => date !== null && isValid(date))
                         .sort((a,b) => b!.getTime() - a!.getTime())
                         .slice(0, 7)
                         .map(date => format(date!, 'yyyy-MM-dd'));
      updatedFieldsForUser.dailyCheckIns = newCheckIns;
    }

    // Use the main updateUser function to save these specific changes
    updateUser(updatedFieldsForUser);

    toast({ title: "Reward Claimed!", description: `You earned ${reward} coins!` });
    return true;
  };

  const completeSpecialOffer = async (offerId: string, coinReward: number): Promise<boolean> => {
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
    let progress = { // Ensure progress object is well-defined
        dailySpecialOffersCompletedIds: Array.isArray(mutableUser.dailySpecialOffersCompletedIds) ? mutableUser.dailySpecialOffersCompletedIds : [],
        lastSpecialOfferResetDate: mutableUser.lastSpecialOfferResetDate || "",
        historicalSpecialOffers: Array.isArray(mutableUser.historicalSpecialOffers) ? mutableUser.historicalSpecialOffers : [],
    };

    const today = todayISOString();
    // Reset daily progress if it's a new day
    if (progress.lastSpecialOfferResetDate !== today) {
        progress.dailySpecialOffersCompletedIds = [];
        progress.lastSpecialOfferResetDate = today;
    }

    if (progress.dailySpecialOffersCompletedIds.includes(offerId)) {
      toast({ title: "Already Completed Today", description: "You have already completed this offer today." });
      updateUser({ // Save reset date if it changed
          dailySpecialOffersCompletedIds: progress.dailySpecialOffersCompletedIds,
          lastSpecialOfferResetDate: progress.lastSpecialOfferResetDate,
      });
      return false;
    }

    // Log the coin transaction
    const offerDetails = SPECIAL_OFFERS_CONFIG.find(o => o.id === offerId);
    addCoins(coinReward, 'Special Offer', `Completed: ${offerDetails?.title || offerId}`);

    // Update special offer progress fields
    const newDailyCompletedIds = [...progress.dailySpecialOffersCompletedIds, offerId];
    const newHistoricalEntry = { id: offerId, dateCompleted: today, coinsEarned: coinReward };
    const newHistoricalOffers = [newHistoricalEntry, ...progress.historicalSpecialOffers].slice(0, 10);

    updateUser({
      dailySpecialOffersCompletedIds: newDailyCompletedIds,
      lastSpecialOfferResetDate: today, // ensure reset date is current
      historicalSpecialOffers: newHistoricalOffers,
    });

    toast({ title: "Offer Completed!", description: `You earned ${coinReward} coins!` });
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

    if (currentUserData.specialBonusCompleted) {
      toast({ title: "Bonus Already Claimed", description: "You have already claimed this special bonus." });
      return false;
    }

    const newAdsWatched = (currentUserData.specialBonusAdsWatched || 0) + 1;
    let bonusCompletedThisTime = false;
    let fieldsToUpdate: Partial<User> = { specialBonusAdsWatched: newAdsWatched };

    if (newAdsWatched >= SPECIAL_BONUS_ADS_REQUIRED) {
      fieldsToUpdate.specialBonusAdsWatched = SPECIAL_BONUS_ADS_REQUIRED; // Cap it
      fieldsToUpdate.specialBonusCompleted = true;
      bonusCompletedThisTime = true;
      addCoins(SPECIAL_BONUS_COIN_REWARD, 'Special Bonus', 'Special Ad Bonus Claimed');
      toast({ title: "Special Bonus Claimed!", description: `You earned ${SPECIAL_BONUS_COIN_REWARD} coins!` });
    } else {
      toast({ title: "Ad Watched!", description: `Progress: ${newAdsWatched}/${SPECIAL_BONUS_ADS_REQUIRED} ads for special bonus.` });
    }
    updateUser(fieldsToUpdate);
    return true;
  };

  return (
    <AuthContext.Provider value={{
        user, isAuthenticated, isLoadingAuth,
        signup, login, logout, addBalance, addCoins, spendCoins,
        requestWithdrawal, withdrawalHistory, applyReferral, updateUser,
        googleSignIn, getAllUsersForLeaderboard,
        recordAdWatchAndCheckIn, completeSpecialOffer, recordSpecialBonusAdWatch
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

