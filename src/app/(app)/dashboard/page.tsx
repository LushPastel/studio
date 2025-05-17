
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Hourglass } from 'lucide-react';
import { ShopPromoCard } from '@/components/dashboard/ShopPromoCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { TrendingTaskItem } from '@/components/dashboard/TrendingTaskItem';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());

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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">Daily Log</h3>
            <p className="text-muted-foreground text-lg">Streak Calendar</p>
          </div>
        </div>
        <Card className="shadow-lg border-border overflow-hidden">
          <CardContent className="p-2 sm:p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full flex justify-center"
              classNames={{
                caption_label: "text-lg font-medium text-primary",
                head_cell: "text-muted-foreground font-normal w-10 sm:w-12",
                cell: "h-10 w-10 sm:h-12 sm:w-12 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal aria-selected:opacity-100 rounded-md",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground rounded-md",
              }}
            />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">Dash & Cash</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <QuickActionCard 
            title="Dashboard" 
            href="/dashboard" 
            className="bg-gradient-to-br from-primary/70 to-primary/40 text-primary-foreground hover:from-primary/80 hover:to-primary/50"
            iconType="dashboard"
          />
          <QuickActionCard 
            title="Wallet" 
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
