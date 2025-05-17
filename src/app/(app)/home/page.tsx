
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Hourglass, Gamepad2, TrendingUp, FileText, BarChartBig, Gift } from 'lucide-react'; // Added new icons
import { Separator } from '@/components/ui/separator';
import { OfferCard } from '@/components/home/OfferCard';
import { ShopPromoCard } from '@/components/dashboard/ShopPromoCard'; 
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';

// Custom text-based icons for specific offer cards
const OfferProIcon = () => <span className="font-black text-2xl leading-none">Offer<br/>.<br/>PRO</span>;
const TimeWallIcon = () => <span className="font-black text-2xl leading-none">time<br/>wall</span>;
const CPXIcon = () => <span className="font-black text-4xl">CPX</span>;
const NNIcon = () => <span className="font-black text-4xl">NN</span>;


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

      {/* Shop Promo Card Section */}
      <section>
        <ShopPromoCard />
      </section>

      <Separator />

      {/* Dash & Cash Section (Kept for navigation) */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">Dash & Cash</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <QuickActionCard 
            title="Dashboard"
            description="View your streak calendar"
            href="/dashboard" 
            className="bg-card hover:bg-muted/50"
            iconType="dashboard" 
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

      {/* Top tasks Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Top tasks</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <OfferCard 
            title="Offer.PRO" 
            subtitle="OfferPro" 
            customIconElement={<OfferProIcon />} 
            className="bg-indigo-600 text-white" 
            onClickAction={() => console.log('Offer.PRO clicked')}
          />
          <OfferCard 
            title="Playtime" 
            icon={Gamepad2} 
            isRecommended 
            className="bg-indigo-600 text-white" 
            showStartButton={false}
            onClickAction={() => console.log('Playtime clicked')}
          />
          <OfferCard 
            title="Timewall" 
            subtitle="Timewall" 
            customIconElement={<TimeWallIcon />} 
            className="bg-green-500 text-white"
            onClickAction={() => console.log('Timewall clicked')}
          />
        </div>
      </section>
      
      <Separator />

      {/* Trending Tasks Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Trending Tasks</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <OfferCard 
            title="Pubscale" 
            customIconElement={<TrendingUp className="h-8 w-8"/>} 
            className="bg-cyan-500 text-white"
            onClickAction={() => console.log('Pubscale clicked')}
          />
          <OfferCard 
            title="Timewall" 
            subtitle="Timewall" 
            customIconElement={<TimeWallIcon />} 
            className="bg-green-500 text-white"
            onClickAction={() => console.log('Timewall clicked')}
          />
          <OfferCard 
            title="See All" 
            cardType="seeAll" 
            className="bg-purple-600 text-white" 
            href="/all-tasks" // Example link
          />
        </div>
      </section>
      
      <Separator />

      {/* Trending Survey Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Trending Survey</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <OfferCard 
            title="CPX" 
            subtitle="CPX Research"
            customIconElement={<CPXIcon />} 
            className="bg-blue-500 text-white"
            onClickAction={() => console.log('CPX clicked')}
          />
          <OfferCard 
            title="Wannads" 
            subtitle="Wannads Surveys"
            customIconElement={<NNIcon />} 
            className="bg-orange-400 text-white"
            onClickAction={() => console.log('Wannads clicked')}
          />
          <OfferCard 
            title="See All" 
            cardType="seeAll" 
            className="bg-purple-600 text-white" 
            href="/all-surveys" // Example link
          />
        </div>
      </section>

      <Separator />

      {/* Bonus Offers Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Bonus Offers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
           <OfferCard 
            title="Special Bonus" 
            icon={Gift}
            className="bg-pink-500 text-white"
            onClickAction={() => console.log('Bonus clicked')}
          />
          <p className="text-muted-foreground col-span-2 sm:col-span-2 pt-4">More bonus offers coming soon!</p>
        </div>
      </section>
    </div>
  );
}

