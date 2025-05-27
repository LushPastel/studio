
"use client";

import { ReferralCodeCard } from '@/components/referrals/referral-code-card';
import { ApplyReferralCard } from '@/components/referrals/apply-referral-card';
import { ReferralRewardsTabContent } from '@/components/referrals/ReferralRewardsTabContent';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Hourglass, Info, Share2, UserPlus, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { REFERRAL_BONUS } from '@/lib/constants';


export default function ReferralsPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  if (isLoadingAuth || !user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading...</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Refer & Earn
        </h2>
        <p className="text-muted-foreground">
          Invite friends and earn rewards.
        </p>
      </div>

      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
          <TabsTrigger value="invite" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Invite Friends</TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Your Rewards</TabsTrigger>
        </TabsList>
        <TabsContent value="invite">
          <Card className="border-border shadow-sm mt-4">
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReferralCodeCard />
                <ApplyReferralCard />
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-xl font-semibold text-primary flex items-center mb-4">
                    <Info className="mr-2 h-6 w-6" />
                    How It Works
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground list-inside">
                    <li className="flex items-start">
                        <Share2 className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                        <div>
                            <span className="font-medium text-foreground">Step 1: Share Your Code</span><br />
                            Find your unique referral code above and share it with your friends.
                        </div>
                    </li>
                    <li className="flex items-start">
                        <UserPlus className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                        <div>
                            <span className="font-medium text-foreground">Step 2: Friend Signs Up or Applies Code</span><br />
                            Your friend uses your code when they sign up, or applies it in their referral section if they already have an account.
                        </div>
                    </li>
                    <li className="flex items-start">
                        <Award className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                        <div>
                            <span className="font-medium text-foreground">Step 3: You Both Earn!</span><br />
                            Once your friend successfully applies the code, both of you will receive {REFERRAL_BONUS} coins as a bonus!
                        </div>
                    </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rewards">
           <ReferralRewardsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
