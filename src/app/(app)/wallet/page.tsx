
"use client";

import { WithdrawalForm } from '@/components/wallet/withdrawal-form';
import { WithdrawalHistory } from '@/components/wallet/withdrawal-history';
import { BalanceCard } from '@/components/dashboard/balance-card'; 
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hourglass } from 'lucide-react'; // Changed from Loader2

export default function WalletPage() {
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
          Your Wallet
        </h2>
        <p className="text-muted-foreground">Manage your earnings and withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <BalanceCard />
          <div className="mt-8">
            <WithdrawalForm />
          </div>
        </div>
        <div className="lg:col-span-2">
          <WithdrawalHistory />
        </div>
      </div>
    </div>
  );
}
