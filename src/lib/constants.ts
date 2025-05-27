
export const MIN_WITHDRAWAL_AMOUNT = 100; // ₹100
export const REFERRAL_BONUS = 50; // 50 Coins for both referrer and new user (Updated from balance to coins)
export const APP_NAME = "CashWhiz";
export const SUPPORT_EMAIL = "cashwhiz.helpdesk@gmail.com";
export const SUPPORT_EMAIL_SUBJECT = "CashWhiz App Support Request";

// Daily Streak and Ad Watch constants
export const MAX_ADS_PER_DAY = 7;
export const AD_REWARDS_TIERED = [5, 12, 20, 27, 35, 40, 50]; // Up to 7 rewards
export const AD_DURATION_SECONDS = 5; // Simulate 5 second ad duration

// Special Offer constants
export const SPECIAL_OFFERS_CONFIG = [
  { id: 'special_offer_1', title: 'Unlock the Treasure', description: 'Watch a quick ad to open the chest and find your first reward!', coins: 30, imageHint: 'treasure chest gold', actionType: 'watchAd' },
  { id: 'special_offer_2', title: 'Boost Your Earnings', description: 'Another ad, another boost! Keep going for bigger rewards.', coins: 50, imageHint: 'rocket boost speed', actionType: 'watchAd' },
  { id: 'special_offer_3', title: 'Final Jackpot!', description: 'One last ad for the grand prize! You\'re almost there!', coins: 90, imageHint: 'jackpot win prize', actionType: 'watchAd' },
];

// Special Bonus Ad constants
export const SPECIAL_BONUS_ADS_REQUIRED = 5;
export const SPECIAL_BONUS_COIN_REWARD = 50;

// Placeholder for actual API base URL
export const API_BASE_URL = "REPLACE_WITH_YOUR_LIVE_API_BASE_URL";
