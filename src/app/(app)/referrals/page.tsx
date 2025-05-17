
"use client";

import { ReferralCodeCard } from '@/components/referrals/referral-code-card';
import { ApplyReferralCard } from '@/components/referrals/apply-referral-card';
import { LeaderboardTable } from '@/components/referrals/LeaderboardTable';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { REFERRAL_BONUS } from '@/lib/constants';
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
          Referrals
        </h2>
        <p className="text-muted-foreground">
          Invite friends or view the leaderboard.
        </p>
      </div>

      <Tabs defaultValue="refer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="refer">Refer & Earn</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="refer">
          <Card className="border-border shadow-sm mt-4">
            <CardContent className="p-6 space-y-6">
               <p className="text-muted-foreground text-center">
                Invite your friends to AdPlay. When they sign up using your code, you both get a bonus of ₹{REFERRAL_BONUS.toFixed(2)}!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReferralCodeCard />
                <ApplyReferralCard />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leaderboard">
          <Card className="border-border shadow-sm mt-4">
            <CardContent className="p-6">
              <LeaderboardTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    