
"use client";

import { ReferralCodeCard } from '@/components/referrals/referral-code-card';
import { ApplyReferralCard } from '@/components/referrals/apply-referral-card';
import { ReferralRewardsTabContent } from '@/components/referrals/ReferralRewardsTabContent'; // New import
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';


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
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading...</p>
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
          Invite friends and earn rewards based on milestones.
        </p>
      </div>

      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
          <TabsTrigger value="invite" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Invite</TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Rewards</TabsTrigger>
        </TabsList>
        <TabsContent value="invite">
          <Card className="border-border shadow-sm mt-4">
            <CardContent className="p-6 space-y-6">
               <p className="text-muted-foreground text-center">
                Share your referral code with friends. When they sign up, you both get a bonus!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReferralCodeCard />
                <ApplyReferralCard />
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
