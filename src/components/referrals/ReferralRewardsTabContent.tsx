
"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, Users, Gift } from 'lucide-react';
import { ReferralRewardItem, type RewardTier } from './ReferralRewardItem';
import { useToast } from '@/hooks/use-toast';

const rewardTiers: RewardTier[] = [
  { id: '10_invites', invitesRequired: 10, type: 'coins', amount: 500, description: 'Win 500 coins' },
  { id: '50_invites', invitesRequired: 50, type: 'coins', amount: 3000, description: 'Win 3000 coins' },
  { id: '100_invites', invitesRequired: 100, type: 'coins', amount: 7500, description: 'Win 7500 coins' },
  { 
    id: '500_invites', 
    invitesRequired: 500, 
    type: 'physical', 
    description: 'SanDisk 128GB Pen Drive', 
    details: 'High-speed USB 2.0 pen drive with 128GB storage capacity.',
    imageSrc: 'https://placehold.co/64x64/0D1117/7DF9FF.png?text=USB', // Placeholder for USB drive
  },
];

export function ReferralRewardsTabContent() {
  const { user, addCoins, updateUser } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  const handleClaimReward = (tierId: string) => {
    const tier = rewardTiers.find(t => t.id === tierId);
    if (!tier) return;

    if (user.referralsMade >= tier.invitesRequired && !user.claimedReferralTiers.includes(tierId)) {
      if (tier.type === 'coins' && tier.amount) {
        addCoins(tier.amount);
        toast({ title: "Reward Claimed!", description: `${tier.amount} coins added to your balance.` });
      } else if (tier.type === 'physical') {
        toast({ title: "Reward Claimed!", description: `Congratulations on earning the ${tier.description}! We'll be in touch regarding your reward.` });
      }
      updateUser({ claimedReferralTiers: [...user.claimedReferralTiers, tierId] });
    } else {
      toast({ variant: "destructive", title: "Cannot Claim", description: "You are not eligible for this reward or have already claimed it." });
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <Card className="shadow-lg border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <Gift className="mr-2 h-6 w-6" />
            Your Referral Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-6 pt-2">
          <div className="text-center">
            <Coins className="h-10 w-10 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{user.referralsMade}</p>
            <p className="text-xs text-muted-foreground">Total Successful Invites</p>
          </div>
          <div className="text-center">
            <Users className="h-10 w-10 text-accent mx-auto mb-1" />
             <p className="text-2xl font-bold text-foreground">+{user.referralsMade}</p>
            <p className="text-xs text-muted-foreground">Friends Invited</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Reward Timeline</CardTitle>
          <CardDescription>Check the rewards timeline for the latest updates on your earned benefits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rewardTiers.map((tier) => (
            <ReferralRewardItem
              key={tier.id}
              tier={tier}
              currentUserReferrals={user.referralsMade}
              claimedTiers={user.claimedReferralTiers}
              onClaimReward={() => handleClaimReward(tier.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
