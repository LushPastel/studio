
"use client";

import { BalanceCard } from '@/components/dashboard/balance-card';
import { WatchAdCard } from '@/components/dashboard/watch-ad-card';
import { ReferralPromoCard } from '@/components/dashboard/referral-promo-card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hourglass } from 'lucide-react'; // Changed from Loader2

export default function DashboardPage() {
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
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, <span className="text-primary">{user.name}!</span>
        </h2>
        <p className="text-muted-foreground">Here&apos;s an overview of your AdPlay activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard />
        <WatchAdCard />
        <ReferralPromoCard />
      </div>
      
      {/* Placeholder for more dashboard elements */}
      {/* <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
