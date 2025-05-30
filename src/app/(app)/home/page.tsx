
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Hourglass, Gamepad2, TrendingUp, Star, Gift } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { OfferCard } from '@/components/home/OfferCard';
import { ShopPromoCard } from '@/components/dashboard/ShopPromoCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { SpecialBonusAdCard } from '@/components/home/SpecialBonusAdCard';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/lib/constants';


const OfferProIcon = () => <span className="font-black text-2xl leading-none">Offer<br/>.<br/>PRO</span>;
const TimeWallIcon = () => <span className="font-black text-2xl leading-none">time<br/>wall</span>;
const CPXIcon = () => <span className="font-black text-4xl">CPX</span>;
const NNIcon = () => <span className="font-black text-4xl">NN</span>;

const FiveStars = () => (
  <div className="flex space-x-0.5">
    <Star className="h-5 w-5 fill-current text-current" />
    <Star className="h-5 w-5 fill-current text-current" />
    <Star className="h-5 w-5 fill-current text-current" />
    <Star className="h-5 w-5 fill-current text-current" />
    <Star className="h-5 w-5 fill-current text-current" />
  </div>
);

export default function HomePage() {
  const { user, isAuthenticated, isLoadingAuth, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  if (isLoadingAuth || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading...</p>
      </div>
    );
  }

  const handleRateUs = async () => {
    if (user && !user.hasRatedApp) {
      updateUser({ hasRatedApp: true });
      toast({ title: "Thanks for rating!", description: `We appreciate your feedback on ${APP_NAME}.` });
    } else if (user && user.hasRatedApp) {
      toast({ title: "Already Rated", description: "You've already shared your feedback!" });
    }
  };

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

      <section>
        <ShopPromoCard />
      </section>

      <Separator />

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

      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Top tasks</h3>
        <div className="grid grid-cols-3 gap-4">
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

      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Trending Tasks</h3>
        <div className="grid grid-cols-3 gap-4">
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
            href="/all-tasks"
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Trending Survey</h3>
        <div className="grid grid-cols-3 gap-4">
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
            href="/all-surveys"
          />
        </div>
      </section>

      <Separator />

       <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Bonus Offers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
           <SpecialBonusAdCard />
           <OfferCard
            title="Rate Us"
            subtitle={user?.hasRatedApp ? "Thanks for your feedback!" : `Enjoying ${APP_NAME}? Share your thoughts!`}
            customIconElement={<FiveStars />}
            className="bg-yellow-500 text-white"
            onClickAction={handleRateUs}
            showStartButton={!user?.hasRatedApp}
            startButtonText="Rate Now"
          />
        </div>
      </section>
    </div>
  );
}
