
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
  weeklyReferralsMade: number; // For simulated weekly leaderboard
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
  addCoins: (amount: number) => boolean; // Operates on localStorage
  spendCoins: (amount: number) => boolean; // Operates on localStorage
  requestWithdrawal: (amount: number) => boolean;
  withdrawalHistory: WithdrawalRequest[];
  applyReferral: (code: string) => boolean;
  updateUser: (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password'>>) => boolean;
  googleSignIn: () => Promise<void>; // Simulates Google Sign-In
  getAllUsersForLeaderboard: () => User[]; // Reads from localStorage
  processWeeklyLeaderboardReset: () => void; // Simulates weekly reset, uses localStorage
  recordAdWatchAndCheckIn: () => Promise<boolean>; // For daily streak, uses localStorage
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
          loggedInUser.weeklyReferralsMade = loggedInUser.weeklyReferralsMade || 0;


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


          const { password, ...userWithoutPassword } = loggedInUser;
          setUser({
            ...userWithoutPassword, 
            coins: loggedInUser.coins || 0,
            hasRatedApp: loggedInUser.hasRatedApp || false,
            referralsMade: loggedInUser.referralsMade || 0,
            weeklyReferralsMade: loggedInUser.weeklyReferralsMade || 0,
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
      referralsMade: 0,
      weeklyReferralsMade: 0,
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
        allUsers[referrerIndex].weeklyReferralsMade = (allUsers[referrerIndex].weeklyReferralsMade || 0) + 1;
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

    userToSet.currentStreak = userToSet.currentStreak || 0;
    userToSet.lastStreakUpdate = userToSet.lastStreakUpdate || "";
    userToSet.adsWatchedToday = userToSet.adsWatchedToday || 0;
    userToSet.lastAdWatchDate = userToSet.lastAdWatchDate || "";
    userToSet.dailyCheckIns = Array.isArray(userToSet.dailyCheckIns) ? userToSet.dailyCheckIns : [];
    userToSet.weeklyReferralsMade = userToSet.weeklyReferralsMade || 0;


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
        .sort((a,b) => b!.localeCompare(a!))
        .slice(0, 7) as string[];

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

  // Operates on localStorage
  const addCoins = (amount: number): boolean => {
    if (!user) return false;
    const newCoins = (user.coins || 0) + amount;
    const updatedUserForState = { ...user, coins: newCoins };
    setUser(updatedUserForState);
    updateUserInStorage(user.id, { coins: newCoins });
    return true;
  };

  // Operates on localStorage
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
    allUsers[referrerIndex].weeklyReferralsMade = (allUsers[referrerIndex].weeklyReferralsMade || 0) + 1;
    saveAllUsers(allUsers); // Save changes for the referrer
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
        password: "mockpassword", // For prototype login flow
        balance: 0, coins: 0, referralCode: generateReferralCode(), referralsMade: 0, weeklyReferralsMade: 0,
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
        googleUser.currentStreak = googleUser.currentStreak || 0;
        googleUser.lastStreakUpdate = googleUser.lastStreakUpdate || "";
        googleUser.adsWatchedToday = googleUser.adsWatchedToday || 0;
        googleUser.lastAdWatchDate = googleUser.lastAdWatchDate || "";
        googleUser.dailyCheckIns = Array.isArray(googleUser.dailyCheckIns) ? googleUser.dailyCheckIns : [];
        googleUser.weeklyReferralsMade = googleUser.weeklyReferralsMade || 0;
        updateUserInStorage(googleUser.id, googleUser); // Ensure any missing fields are saved
    }
    await login(googleUser.email, googleUser.password!); 
    toast({ title: "Signed in with Google (Simulated)" });
  };

  const getAllUsersForLeaderboard = (): User[] => {
    const users = getAllUsers();
    return users.map(u => ({
      ...u,
      coins: u.coins || 0, 
      name: u.name || "Unnamed User", 
      weeklyReferralsMade: u.weeklyReferralsMade || 0,
    }));
  };

  const processWeeklyLeaderboardReset = (): void => {
    let allUsers = getAllUsers();
    // Sort by weeklyReferralsMade for awarding, but this logic is now removed.
    // The leaderboard itself ranks by total coins.
    // This function will now only reset weeklyReferralsMade for all users.

    allUsers.forEach(u => {
      u.weeklyReferralsMade = 0;
    });
    saveAllUsers(allUsers);

    // Update current user state if logged in
    if (user) {
      const updatedCurrentUser = allUsers.find(u => u.id === user.id);
      if (updatedCurrentUser) {
        const { password, ...userToSet } = updatedCurrentUser;
        setUser(userToSet as User);
      }
    }
    toast({ title: "Weekly Referrals Reset", description: "Weekly referral counts have been reset for all users." });
  };

  const recordAdWatchAndCheckIn = async (): Promise<boolean> => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return false;
    }

    let mutableUser = { ...user }; 
    const today = todayISOString();
    const yesterday = yesterdayISOString();

    if (mutableUser.lastAdWatchDate !== today) {
      mutableUser.adsWatchedToday = 0;
      mutableUser.lastAdWatchDate = today;
    }

    if (mutableUser.adsWatchedToday >= MAX_ADS_PER_DAY) {
      toast({ title: "Ad Limit Reached", description: "You've watched all available ads for today." });
      return false;
    }

    const rewardIndex = mutableUser.adsWatchedToday;
    const reward = AD_REWARDS_TIERED[rewardIndex < AD_REWARDS_TIERED.length ? rewardIndex : AD_REWARDS_TIERED.length -1]; // Ensure valid index
    
    addCoins(reward); // This will update user state and localStorage for coins

    mutableUser.adsWatchedToday += 1;

    let hasCheckedInToday = mutableUser.dailyCheckIns.some(dateStr => isSameDay(parseISO(dateStr), new Date()));

    if (!hasCheckedInToday) { // Only update streak if not already checked in today
      if (mutableUser.lastStreakUpdate === yesterday) {
        mutableUser.currentStreak += 1;
      } else if (mutableUser.lastStreakUpdate !== today) { // Avoid double increment if already updated
        mutableUser.currentStreak = 1; 
      }
      mutableUser.lastStreakUpdate = today;

      let newCheckIns = [today, ...mutableUser.dailyCheckIns.filter(d => d !== today)];
      newCheckIns = Array.from(new Set(newCheckIns)) 
                         .sort((a,b) => b.localeCompare(a)) 
                         .slice(0, 7); 
      mutableUser.dailyCheckIns = newCheckIns;
    }
    
    setUser(mutableUser);
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
        googleSignIn, getAllUsersForLeaderboard, processWeeklyLeaderboardReset,
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
