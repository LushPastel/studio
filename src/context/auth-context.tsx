
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AD_REWARD, MIN_WITHDRAWAL_AMOUNT, REFERRAL_BONUS, APP_NAME, API_BASE_URL } from '@/lib/constants';

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
  password?: string; // Stored in LS, not in active user state object for security simulation
  balance: number;
  coins: number;
  referralCode: string;
  referralsMade: number;
  weeklyReferralsMade: number;
  hasAppliedReferral?: boolean;
  hasRatedApp?: boolean;
  // Profile fields
  gender?: 'Not Specified' | 'Male' | 'Female' | 'Other';
  ageRange?: 'Prefer not to say' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  contactMethod?: 'WhatsApp' | 'Instagram' | 'Telegram';
  contactDetail?: string;
  // Notification preferences
  notificationPreferences?: NotificationPreferences;
  photoURL?: string;
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
  updateUser: (updatedDetails: Partial<Omit<User, 'id' | 'email' | 'password' | 'balance' | 'referralCode' | 'coins'>>) => boolean;
  processWeeklyLeaderboardReset: () => void;
  googleSignIn: () => Promise<void>;
  getAllUsersForLeaderboard: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = () => `${APP_NAME.toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
          setUser({
            coins: loggedInUser.coins || 0,
            hasRatedApp: loggedInUser.hasRatedApp || false,
            referralsMade: loggedInUser.referralsMade || 0,
            weeklyReferralsMade: loggedInUser.weeklyReferralsMade || 0,
            gender: loggedInUser.gender || 'Not Specified',
            ageRange: loggedInUser.ageRange || 'Prefer not to say',
            contactMethod: loggedInUser.contactMethod || 'WhatsApp',
            contactDetail: loggedInUser.contactDetail || '',
            notificationPreferences: loggedInUser.notificationPreferences || {
              offers: true,
              promo: true,
              payments: true,
              updates: true,
            },
            photoURL: loggedInUser.photoURL || undefined,
            hasAppliedReferral: loggedInUser.hasAppliedReferral || false,
            ...userWithoutPassword
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
      notificationPreferences: {
        offers: true,
        promo: true,
        payments: true,
        updates: true,
      },
      photoURL: undefined,
    };

    let finalNewUser = { ...newUserBase };

    if (referralCodeInput) {
      const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === referralCodeInput.trim().toUpperCase() && u.id !== finalNewUser.id);
      if (referrerIndex !== -1) {
        finalNewUser.balance = parseFloat((finalNewUser.balance + REFERRAL_BONUS).toFixed(2));
        finalNewUser.coins = (finalNewUser.coins || 0) + REFERRAL_BONUS; // Assuming referral bonus also gives coins
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
     setUser({
        coins: foundUser.coins || 0,
        hasRatedApp: foundUser.hasRatedApp || false,
        referralsMade: foundUser.referralsMade || 0,
        weeklyReferralsMade: foundUser.weeklyReferralsMade || 0,
        gender: foundUser.gender || 'Not Specified',
        ageRange: foundUser.ageRange || 'Prefer not to say',
        contactMethod: foundUser.contactMethod || 'WhatsApp',
        contactDetail: foundUser.contactDetail || '',
        notificationPreferences: foundUser.notificationPreferences || {
          offers: true,
          promo: true,
          payments: true,
          updates: true,
        },
        photoURL: foundUser.photoURL || undefined,
        hasAppliedReferral: foundUser.hasAppliedReferral || false,
        ...userToSet
      } as User);
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

  const addCoins = (amount: number): boolean => {
    if (!user) return false;
    const newCoins = (user.coins || 0) + amount;
    const updatedUserForState = { ...user, coins: newCoins };
    setUser(updatedUserForState);
    const fullUserFromStorage = getFullUserFromStorage(user.id);
    if (fullUserFromStorage) {
      updateUserInStorage(user.id, { ...fullUserFromStorage, coins: newCoins });
    }
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
    const referrerIndex = allUsers.findIndex(u => u.referralCode.toUpperCase() === code.trim().toUpperCase() && u.id !== user.id);

    if (referrerIndex === -1) {
      toast({ variant: "destructive", title: "Invalid Referral Code", description: "The referral code is invalid or does not exist." });
      return false;
    }

    // Update applicant (current user)
    const applicantNewBalance = parseFloat((user.balance + REFERRAL_BONUS).toFixed(2));
    const applicantNewCoins = (user.coins || 0) + REFERRAL_BONUS; // Assuming referral bonus also gives coins
    const applicantWithBonusForState = {
        ...user,
        balance: applicantNewBalance,
        coins: applicantNewCoins,
        hasAppliedReferral: true
    };
    setUser(applicantWithBonusForState);

    const fullApplicantUserFromStorage = getFullUserFromStorage(user.id);
    if (fullApplicantUserFromStorage) {
        updateUserInStorage(user.id, {
            ...fullApplicantUserFromStorage,
            balance: applicantNewBalance,
            coins: applicantNewCoins,
            hasAppliedReferral: true
        });
    }

    // Update referrer
    allUsers[referrerIndex].balance = parseFloat((allUsers[referrerIndex].balance + REFERRAL_BONUS).toFixed(2));
    allUsers[referrerIndex].coins = (allUsers[referrerIndex].coins || 0) + REFERRAL_BONUS; // Assuming referral bonus also gives coins
    allUsers[referrerIndex].referralsMade = (allUsers[referrerIndex].referralsMade || 0) + 1;
    allUsers[referrerIndex].weeklyReferralsMade = (allUsers[referrerIndex].weeklyReferralsMade || 0) + 1;

    saveAllUsers(allUsers);

    toast({ title: "Referral Applied!", description: `You've received a ₹${REFERRAL_BONUS.toFixed(2)} bonus and ${REFERRAL_BONUS} coins!` });
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

  const processWeeklyLeaderboardReset = () => {
    // This function used to award coins based on weekly referrals.
    // Now, it primarily resets weekly referral counts.
    // The leaderboard itself is based on total coins.
    let allUsers = getAllUsers();
    allUsers.forEach(u => u.weeklyReferralsMade = 0);
    saveAllUsers(allUsers);

    if(user && allUsers.find(u => u.id === user.id)) {
      setUser(prevUser => prevUser ? {...prevUser, weeklyReferralsMade: 0} : null);
    }
    // Consider if a toast is still needed here or if this reset is silent.
    // toast({ title: "Weekly Referrals Reset", description: "Weekly referral counts have been reset." });
  };

  const googleSignIn = async (): Promise<void> => {
    const mockGoogleUserEmail = "google.user@example.com";
    const mockGoogleUserName = "Google User";
    const mockGoogleUserPhotoURL = "https://placehold.co/100x100/7DF9FF/0D1117?text=G";

    let allUsers = getAllUsers();
    let googleUser = allUsers.find(u => u.email.toLowerCase() === mockGoogleUserEmail.toLowerCase());

    if (!googleUser) {
      const newGoogleUserBase: User = {
        id: `user-google-${Date.now()}`,
        email: mockGoogleUserEmail,
        name: mockGoogleUserName,
        password: "mockpassword",
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
        notificationPreferences: {
          offers: true,
          promo: true,
          payments: true,
          updates: true,
        },
        photoURL: mockGoogleUserPhotoURL,
      };

      allUsers.push(newGoogleUserBase);
      saveAllUsers(allUsers);
      googleUser = newGoogleUserBase;

    } else {
        if (!googleUser.photoURL || googleUser.photoURL !== mockGoogleUserPhotoURL) {
            googleUser.photoURL = mockGoogleUserPhotoURL;
            updateUserInStorage(googleUser.id, { photoURL: mockGoogleUserPhotoURL });
        }
    }

    const { password, ...userToSet } = googleUser;
     setUser({
        coins: googleUser.coins || 0,
        hasRatedApp: googleUser.hasRatedApp || false,
        referralsMade: googleUser.referralsMade || 0,
        weeklyReferralsMade: googleUser.weeklyReferralsMade || 0,
        gender: googleUser.gender || 'Not Specified',
        ageRange: googleUser.ageRange || 'Prefer not to say',
        contactMethod: googleUser.contactMethod || 'WhatsApp',
        contactDetail: googleUser.contactDetail || '',
        notificationPreferences: googleUser.notificationPreferences || {
          offers: true,
          promo: true,
          payments: true,
          updates: true,
        },
        hasAppliedReferral: googleUser.hasAppliedReferral || false,
        ...userToSet
      } as User);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_CURRENT_USER_ID_KEY, googleUser.id);
        const storedHistory = localStorage.getItem(`${LS_WITHDRAWAL_HISTORY_PREFIX}${googleUser.id}`);
        setWithdrawalHistory(storedHistory ? JSON.parse(storedHistory).map((req: any) => ({...req, requestedAt: new Date(req.requestedAt), processedAt: req.processedAt ? new Date(req.processedAt) : undefined })) : []);
    }

    toast({ title: "Signed in with Google (Simulated)", description: `Welcome, ${googleUser.name}!` });
    if (typeof window !== 'undefined') {
      window.location.href = '/home';
    }
  };

  const getAllUsersForLeaderboard = (): User[] => {
    return getAllUsers();
  };


  return (
    <AuthContext.Provider value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        signup,
        login,
        logout,
        addBalance,
        addCoins,
        spendCoins,
        requestWithdrawal,
        withdrawalHistory,
        applyReferral,
        updateUser,
        processWeeklyLeaderboardReset,
        googleSignIn,
        getAllUsersForLeaderboard
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
