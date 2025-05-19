
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL, MIN_WITHDRAWAL_AMOUNT, REFERRAL_BONUS, APP_NAME, MAX_ADS_PER_DAY, AD_REWARDS_TIERED } from '@/lib/constants';
import { format, subDays, parseISO, isValid, isSameDay } from 'date-fns';

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
  password?: string; // Only stored in LS for this prototype, NOT secure for production
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
  dailyCheckIns: string[];
  // appLanguage: string; // Removed appLanguage
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
  recordAdWatchAndCheckIn: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `${APP_NAME.toUpperCase().substring(0,4)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
    let loggedInUser: User | undefined;
    try {
      const currentUserId = localStorage.getItem(LS_CURRENT_USER_ID_KEY);
      if (currentUserId) {
        const users = getAllUsers();
        loggedInUser = users.find(u => u.id === currentUserId);
        if (loggedInUser) {
          const today = todayISOString();
          const yesterday = yesterdayISOString();

          // Initialize new fields if missing and ensure correct types
          loggedInUser.balance = Number(loggedInUser.balance) || 0;
          loggedInUser.coins = Number(loggedInUser.coins) || 0;
          loggedInUser.referralsMade = Number(loggedInUser.referralsMade) || 0;
          loggedInUser.hasAppliedReferral = !!loggedInUser.hasAppliedReferral;
          loggedInUser.hasRatedApp = !!loggedInUser.hasRatedApp;
          loggedInUser.gender = loggedInUser.gender || 'Not Specified';
          loggedInUser.ageRange = loggedInUser.ageRange || 'Prefer not to say';
          loggedInUser.contactMethod = loggedInUser.contactMethod || 'WhatsApp';
          loggedInUser.contactDetail = loggedInUser.contactDetail || '';
          loggedInUser.notificationPreferences = loggedInUser.notificationPreferences || {
            offers: true, promo: true, payments: true, updates: true,
          };
          loggedInUser.photoURL = loggedInUser.photoURL || undefined;
          loggedInUser.claimedReferralTiers = Array.isArray(loggedInUser.claimedReferralTiers) ? loggedInUser.claimedReferralTiers : [];
          loggedInUser.currentStreak = Number(loggedInUser.currentStreak) || 0;
          loggedInUser.lastStreakUpdate = loggedInUser.lastStreakUpdate || "";
          loggedInUser.adsWatchedToday = Number(loggedInUser.adsWatchedToday) || 0;
          loggedInUser.lastAdWatchDate = loggedInUser.lastAdWatchDate || "";
          loggedInUser.dailyCheckIns = Array.isArray(loggedInUser.dailyCheckIns) ? loggedInUser.dailyCheckIns.filter(d => typeof d === 'string') : [];
          // loggedInUser.appLanguage = loggedInUser.appLanguage || 'en-US'; // Removed appLanguage


          // Daily state updates
          if (loggedInUser.lastAdWatchDate !== today) {
            loggedInUser.adsWatchedToday = 0;
          }
          if (loggedInUser.lastStreakUpdate !== today && loggedInUser.lastStreakUpdate !== yesterday) {
            loggedInUser.currentStreak = 0;
          }
          loggedInUser.dailyCheckIns = loggedInUser.dailyCheckIns
            .map(dateStr => {
              try { return isValid(parseISO(dateStr)) ? dateStr : null; } catch { return null; }
            })
            .filter(dateStr => dateStr !== null)
            .sort((a, b) => b!.localeCompare(a!))
            .slice(0, 7) as string[];

          // Persist updates made during initialization
          const userIndex = users.findIndex(u => u.id === loggedInUser!.id);
          if (userIndex !== -1) {
            users[userIndex] = loggedInUser;
            saveAllUsers(users);
          }


          const { password, ...userWithoutPassword } = loggedInUser;
          setUser(userWithoutPassword as User);
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
      localStorage.removeItem(LS_CURRENT_USER_ID_KEY); // Clear potentially corrupted state
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoadingAuth(false);
  }, []);


  const updateUserInStorage = (userId: string, updatedDetails: Partial<User>): User | undefined => {
    let users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      // Ensure coins and balance are always numbers
      if (updatedDetails.coins !== undefined) updatedDetails.coins = Number(updatedDetails.coins);
      if (updatedDetails.balance !== undefined) updatedDetails.balance = Number(updatedDetails.balance);

      users[userIndex] = { ...users[userIndex], ...updatedDetails };
      saveAllUsers(users);
      return users[userIndex];
    }
    return undefined;
  };

  const signup = async (name: string, email: string, passwordInput: string, referralCodeInput?: string): Promise<boolean> => {
    let allUsers = getAllUsers();
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({ variant: "destructive", title: "Signup Failed", description: "Email already registered. Please log in." });
      return false;
    }

    let newUser: User = {
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
      lastStreakUpdate: "",
      adsWatchedToday: 0,
      lastAdWatchDate: "",
      dailyCheckIns: [],
      // appLanguage: 'en-US', // Removed appLanguage
    };

    if (referralCodeInput) {
      const codeToCompare = referralCodeInput.trim().toUpperCase();
      const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === codeToCompare && u.id !== newUser.id);
      if (referrerIndex !== -1) {
        newUser.balance = parseFloat((newUser.balance + REFERRAL_BONUS).toFixed(2));
        newUser.coins = (newUser.coins || 0) + REFERRAL_BONUS;
        newUser.hasAppliedReferral = true;
        toast({ title: "Referral Bonus Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus and ${REFERRAL_BONUS} coins!` });

        allUsers[referrerIndex].balance = parseFloat(((allUsers[referrerIndex].balance || 0) + REFERRAL_BONUS).toFixed(2));
        allUsers[referrerIndex].coins = (allUsers[referrerIndex].coins || 0) + REFERRAL_BONUS;
        allUsers[referrerIndex].referralsMade = (allUsers[referrerIndex].referralsMade || 0) + 1;
      } else {
        toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code entered was invalid. Signup proceeded without this bonus." });
      }
    }

    allUsers.push(newUser);
    saveAllUsers(allUsers);

    const { password, ...userToSet } = newUser;
    setUser(userToSet as User);
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
    let userToLogin = { ...foundUser };

    // Ensure all fields are present and correctly typed
    userToLogin.balance = Number(userToLogin.balance) || 0;
    userToLogin.coins = Number(userToLogin.coins) || 0;
    userToLogin.referralsMade = Number(userToLogin.referralsMade) || 0;
    userToLogin.hasAppliedReferral = !!userToLogin.hasAppliedReferral;
    userToLogin.hasRatedApp = !!userToLogin.hasRatedApp;
    userToLogin.gender = userToLogin.gender || 'Not Specified';
    userToLogin.ageRange = userToLogin.ageRange || 'Prefer not to say';
    userToLogin.contactMethod = userToLogin.contactMethod || 'WhatsApp';
    userToLogin.contactDetail = userToLogin.contactDetail || '';
    userToLogin.notificationPreferences = userToLogin.notificationPreferences || {
      offers: true, promo: true, payments: true, updates: true,
    };
    userToLogin.photoURL = userToLogin.photoURL || undefined;
    userToLogin.claimedReferralTiers = Array.isArray(userToLogin.claimedReferralTiers) ? userToLogin.claimedReferralTiers : [];
    userToLogin.currentStreak = Number(userToLogin.currentStreak) || 0;
    userToLogin.lastStreakUpdate = userToLogin.lastStreakUpdate || "";
    userToLogin.adsWatchedToday = Number(userToLogin.adsWatchedToday) || 0;
    userToLogin.lastAdWatchDate = userToLogin.lastAdWatchDate || "";
    userToLogin.dailyCheckIns = Array.isArray(userToLogin.dailyCheckIns) ? userToLogin.dailyCheckIns.filter(d => typeof d === 'string') : [];
    // userToLogin.appLanguage = userToLogin.appLanguage || 'en-US'; // Removed appLanguage


    if (userToLogin.lastAdWatchDate !== today) {
        userToLogin.adsWatchedToday = 0;
    }
    if (userToLogin.lastStreakUpdate !== today && userToLogin.lastStreakUpdate !== yesterday) {
        userToLogin.currentStreak = 0;
    }
    userToLogin.dailyCheckIns = userToLogin.dailyCheckIns
        .map(dateStr => {
            try { return isValid(parseISO(dateStr)) ? dateStr : null; } catch { return null; }
        })
        .filter(dateStr => dateStr !== null)
        .sort((a,b) => b!.localeCompare(a!))
        .slice(0, 7) as string[];

    updateUserInStorage(userToLogin.id, {
        adsWatchedToday: userToLogin.adsWatchedToday,
        currentStreak: userToLogin.currentStreak,
        dailyCheckIns: userToLogin.dailyCheckIns,
        lastAdWatchDate: userToLogin.lastAdWatchDate === today ? today : userToLogin.lastAdWatchDate,
        lastStreakUpdate: userToLogin.lastStreakUpdate,
    });

    const { password, ...userForState } = userToLogin;
    setUser(userForState as User);
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

  const addBalance = (amount: number) => {
    if (!user) return;
    const newBalance = parseFloat((user.balance + amount).toFixed(2));
    const updatedUserForState = { ...user, balance: newBalance };
    setUser(updatedUserForState);
    updateUserInStorage(user.id, { balance: newBalance });
  };

  const addCoins = (amount: number): boolean => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "User not logged in." });
      return false;
    }
    const currentCoins = Number(user.coins) || 0;
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
    const currentCoins = Number(user.coins) || 0;
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
    if (user.balance < amount) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: "Insufficient balance." });
      return false;
    }
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}.` });
      return false;
    }
    const newBalance = parseFloat((user.balance - amount).toFixed(2));
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
    if (user.hasAppliedReferral) {
      toast({ variant: "destructive", title: "Referral Failed", description: "You have already applied a referral bonus." });
      return false;
    }
    let allUsers = getAllUsers();
    const codeToCompare = code.trim().toUpperCase();
    const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === codeToCompare && u.id !== user.id);

    if (referrerIndex === -1) {
      toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code is invalid or does not exist." });
      return false;
    }

    const applicantNewBalance = parseFloat(((user.balance || 0) + REFERRAL_BONUS).toFixed(2));
    const applicantNewCoins = (user.coins || 0) + REFERRAL_BONUS;
    const applicantUpdatedFields = { balance: applicantNewBalance, coins: applicantNewCoins, hasAppliedReferral: true };
    setUser(prevUser => prevUser ? { ...prevUser, ...applicantUpdatedFields } : null);
    updateUserInStorage(user.id, applicantUpdatedFields);

    allUsers[referrerIndex].balance = parseFloat(((allUsers[referrerIndex].balance || 0) + REFERRAL_BONUS).toFixed(2));
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
    const updateData: Partial<User> = { ...updatedDetails };
    if (updatedDetails.balance !== undefined) updateData.balance = Number(updatedDetails.balance);
    if (updatedDetails.coins !== undefined) updateData.coins = Number(updatedDetails.coins);
    if (updatedDetails.referralsMade !== undefined) updateData.referralsMade = Number(updatedDetails.referralsMade);
    if (updatedDetails.currentStreak !== undefined) updateData.currentStreak = Number(updatedDetails.currentStreak);
    if (updatedDetails.adsWatchedToday !== undefined) updateData.adsWatchedToday = Number(updatedDetails.adsWatchedToday);


    setUser(prevUser => prevUser ? { ...prevUser, ...updateData } : null);
    updateUserInStorage(user.id, updateData);
    return true;
  };

  const googleSignIn = async (): Promise<void> => {
    const mockGoogleUserEmail = "google.user@example.com";
    const mockGoogleUserName = "Google User";
    const mockGoogleUserPhotoURL = "https://placehold.co/100x100/7DF9FF/0D1117?text=G";

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
        // appLanguage: 'en-US', // Removed appLanguage
      };
      allUsers.push(googleUser);
      saveAllUsers(allUsers);
    } else {
        googleUser.photoURL = googleUser.photoURL || mockGoogleUserPhotoURL;
        googleUser.balance = Number(googleUser.balance) || 0;
        googleUser.coins = Number(googleUser.coins) || 0;
        googleUser.referralsMade = Number(googleUser.referralsMade) || 0;
        googleUser.hasAppliedReferral = !!googleUser.hasAppliedReferral;
        googleUser.hasRatedApp = !!googleUser.hasRatedApp;
        googleUser.gender = googleUser.gender || 'Not Specified';
        googleUser.ageRange = googleUser.ageRange || 'Prefer not to say';
        googleUser.contactMethod = googleUser.contactMethod || 'WhatsApp';
        googleUser.contactDetail = googleUser.contactDetail || '';
        googleUser.notificationPreferences = googleUser.notificationPreferences || {
          offers: true, promo: true, payments: true, updates: true,
        };
        googleUser.claimedReferralTiers = Array.isArray(googleUser.claimedReferralTiers) ? googleUser.claimedReferralTiers : [];
        googleUser.currentStreak = Number(googleUser.currentStreak) || 0;
        googleUser.lastStreakUpdate = googleUser.lastStreakUpdate || "";
        googleUser.adsWatchedToday = Number(googleUser.adsWatchedToday) || 0;
        googleUser.lastAdWatchDate = googleUser.lastAdWatchDate || "";
        googleUser.dailyCheckIns = Array.isArray(googleUser.dailyCheckIns) ? googleUser.dailyCheckIns.filter(d => typeof d === 'string') : [];
        // googleUser.appLanguage = googleUser.appLanguage || 'en-US'; // Removed appLanguage
        updateUserInStorage(googleUser.id, googleUser);
    }
    await login(googleUser.email, googleUser.password!);
    toast({ title: "Signed in with Google (Simulated)" });
  };

  const getAllUsersForLeaderboard = (): User[] => {
    const users = getAllUsers();
    // Ensure all fields are present and correctly typed for each user
    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name || "Unnamed User",
      password: u.password, // Not actually used by leaderboard but part of User
      balance: Number(u.balance) || 0,
      coins: Number(u.coins) || 0,
      referralCode: u.referralCode,
      referralsMade: Number(u.referralsMade) || 0,
      hasAppliedReferral: !!u.hasAppliedReferral,
      hasRatedApp: !!u.hasRatedApp,
      gender: u.gender || 'Not Specified',
      ageRange: u.ageRange || 'Prefer not to say',
      contactMethod: u.contactMethod || 'WhatsApp',
      contactDetail: u.contactDetail || '',
      notificationPreferences: u.notificationPreferences || { offers: true, promo: true, payments: true, updates: true },
      photoURL: u.photoURL || undefined,
      claimedReferralTiers: Array.isArray(u.claimedReferralTiers) ? u.claimedReferralTiers : [],
      currentStreak: Number(u.currentStreak) || 0,
      lastStreakUpdate: u.lastStreakUpdate || "",
      adsWatchedToday: Number(u.adsWatchedToday) || 0,
      lastAdWatchDate: u.lastAdWatchDate || "",
      dailyCheckIns: Array.isArray(u.dailyCheckIns) ? u.dailyCheckIns.filter(d => typeof d === 'string') : [],
      // appLanguage: u.appLanguage || 'en-US', // Removed appLanguage
    }));
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

    let mutableUser = { ...currentUserData };
    const today = todayISOString();
    const yesterday = yesterdayISOString();

    if (mutableUser.lastAdWatchDate !== today) {
      mutableUser.adsWatchedToday = 0;
      mutableUser.lastAdWatchDate = today;
    }

    if (mutableUser.adsWatchedToday >= MAX_ADS_PER_DAY) {
      toast({ title: "Ad Limit Reached", description: "You've watched all available ads for today." });
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
      } else if (mutableUser.lastStreakUpdate !== today) {
        mutableUser.currentStreak = 1;
      }
      mutableUser.lastStreakUpdate = today;

      let newCheckIns = [today, ...mutableUser.dailyCheckIns.filter(d => d !== today)];
      newCheckIns = Array.from(new Set(newCheckIns))
                         .sort((a,b) => b.localeCompare(a))
                         .slice(0, 7);
      mutableUser.dailyCheckIns = newCheckIns;
    }

    const { password, ...userForState } = mutableUser;
    setUser(userForState as User);
    updateUserInStorage(mutableUser.id, userForState);

    toast({ title: "Reward Claimed!", description: `You earned ${reward} coins!` });
    return true;
  };

  // Helper to get full user data from storage, useful for functions that need the latest persisted state
  const getFullUserFromStorage = (userId: string): User | undefined => {
    const users = getAllUsers();
    return users.find(u => u.id === userId);
  };


  return (
    <AuthContext.Provider value={{
        user, isAuthenticated, isLoadingAuth,
        signup, login, logout, addBalance, addCoins, spendCoins,
        requestWithdrawal, withdrawalHistory, applyReferral, updateUser,
        googleSignIn, getAllUsersForLeaderboard,
        recordAdWatchAndCheckIn
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
