
"use client";

import { WithdrawalForm } from '@/components/wallet/withdrawal-form';
import { WithdrawalHistory } from '@/components/wallet/withdrawal-history';
import { BalanceCard } from '@/components/dashboard/balance-card'; 
import { CoinProgressCard } from '@/components/wallet/CoinProgressCard'; 
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'; // Added React import
import { Hourglass } from 'lucide-react';

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
          Your Wallet
        </h2>
        <p className="text-muted-foreground">Manage your earnings and withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <BalanceCard />
          <CoinProgressCard />
          <WithdrawalForm />
        </div>
        <div className="lg:col-span-2">
          <WithdrawalHistory />
        </div>
      </div>
    </div>
  );
}
