
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { ShopPromoCard } from '@/components/dashboard/ShopPromoCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { TrendingTaskItem } from '@/components/dashboard/TrendingTaskItem';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
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
        <h2 className="text-xl font-semibold text-muted-foreground">
          Hello, <span className="text-primary font-bold">{user.name}!</span>
        </h2>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
      </div>

      <ShopPromoCard />

      <Separator />

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">Dash & Cash</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <QuickActionCard 
            title="Daily Log"
            description="View your streak calendar"
            href="/dashboard" 
            className="bg-gradient-to-br from-primary/70 to-primary/40 text-primary-foreground hover:from-primary/80 hover:to-primary/50"
            iconType="dashboard" // Re-using dashboard icon, could be calendar icon if available/desired
          />
          <QuickActionCard 
            title="Wallet"
            description="Manage your earnings"
            href="/wallet" 
            className="bg-card hover:bg-muted/50"
            iconType="wallet"
          />
        </div>
      </section>
      
      <Separator />

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">Trending Tasks</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TrendingTaskItem 
            title="Offer.PRO" 
            subtitle="OfferPro" 
            imageUrl="https://placehold.co/300x200.png"
            imageHint="offer deal"
          />
          <TrendingTaskItem 
            title="Game Zone" 
            subtitle="Play & Earn" 
            imageUrl="https://placehold.co/300x200.png"
            imageHint="game controller console"
            isRecommended
          />
          <TrendingTaskItem 
            title="Time Wall" 
            subtitle="Timewall" 
            imageUrl="https://placehold.co/300x200.png"
            imageHint="time clock"
          />
        </div>
      </section>
    </div>
  );
}
