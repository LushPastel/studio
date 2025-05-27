
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GiftCardItem } from '@/components/shop/GiftCardItem';
import { GIFT_CARDS_AVAILABLE } from '@/lib/constants';
import { ArrowLeft, Coins as CoinsIcon, Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ShopPage() {
  const { user, isAuthenticated, isLoadingAuth, redeemGiftCard } = useAuth();
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

  const handleRedeem = async (cardId: string, coinPrice: number, cardName: string) => {
    await redeemGiftCard(cardId, coinPrice, cardName);
    // The redeemGiftCard function in AuthContext handles toasts and coin updates.
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-card p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/home" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-primary">Gift Card Shop</h1>
          <div className="flex items-center space-x-1 text-yellow-400">
            <CoinsIcon className="h-5 w-5" />
            <span className="font-semibold text-foreground">{user.coins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4">
        <Card className="bg-primary/10 border-primary/30 text-center">
          <CardContent className="p-6">
            <p className="text-6xl font-extrabold text-primary">{user.coins.toLocaleString()}</p>
            <p className="text-lg text-foreground">Your Coin Balance</p>
            <p className="text-sm text-muted-foreground">Redeem coins for exciting gift cards!</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GIFT_CARDS_AVAILABLE.map((card) => (
            <GiftCardItem
              key={card.id}
              cardDetails={card}
              userCoins={user.coins}
              onRedeem={() => handleRedeem(card.id, card.coinPrice, card.name)}
            />
          ))}
        </div>
         {GIFT_CARDS_AVAILABLE.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No gift cards available at the moment. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
