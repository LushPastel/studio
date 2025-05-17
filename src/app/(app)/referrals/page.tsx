
"use client";

import { ReferralCodeCard } from '@/components/referrals/referral-code-card';
import { ApplyReferralCard } from '@/components/referrals/apply-referral-card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hourglass } from 'lucide-react'; // Changed from Loader2
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
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" /> {/* Changed from Loader2 */}
        <p className="ml-4 text-lg">Loading referrals...</p>
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
          Invite your friends to AdPlay. When they sign up using your code, you both get a bonus of ₹{REFERRAL_BONUS.toFixed(2)}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReferralCodeCard />
        <ApplyReferralCard />
      </div>

      {/* Optional: Referral Stats/History
      <div className="mt-8">
        <Card>
          <CardHeader><CardTitle>Your Referrals</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">You haven't referred anyone yet.</p></CardContent>
        </Card>
      </div>
      */}
    </div>
  );
}
