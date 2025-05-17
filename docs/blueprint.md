# **App Name**: AdNeon

## Core Features:

- User Authentication: Secure user login using Firebase Authentication with email/password and Google sign-in, with optional auto-login based on Firebase auth state. Also give user the ability to use forgot password option.
- User Dashboard: Display a dashboard showing the user's current balance (default ₹0.00), options to watch ads to earn, a referral section, and a logout option.
- Rewarded Ads: Enable users to earn rewards by watching video ads via AdMob, crediting their account balance (stored in Firestore) upon successful ad completion.
- Referral System: Implement a referral system where each user has a unique code, allowing new users to enter a referral code during signup for bonuses, and rewarding the referrer, storing this information in Firestore.
- Withdrawal System: Allow users to track their earnings and request withdrawals once they reach a minimum threshold (e.g., ₹100), with withdrawal data sent to Firestore for manual approval. Provide history of the withdrawal request to the user.

## Style Guidelines:

- Primary color: Neon cyan (#00f0ff) to give the app a bright and futuristic feel, consistent with the 'AetherVision' reference.
- Background color: Dark gray (#0d1117) to provide a stark contrast and enhance the visibility of neon elements, ensuring a modern aesthetic.
- Accent color: Electric blue (#7DF9FF), slightly lighter than the primary neon cyan, used for interactive elements like buttons and notifications, adding visual interest.
- Use rounded, futuristic fonts for all text to enhance readability and match the neon aesthetic.
- Design custom icons with neon outlines or fills to maintain the theme's consistency.
- Incorporate neon accents sparingly to highlight important sections, with an intuitive and straightforward design.
- Implement subtle glow effects or animations for interactive elements, providing user feedback, using short animations forRewarded ads and other actions