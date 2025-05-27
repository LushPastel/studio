
"use client";

import Image from 'next/image';
import type { GIFT_CARDS_AVAILABLE } from '@/lib/constants'; // Type import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiftCardItemProps {
  cardDetails: typeof GIFT_CARDS_AVAILABLE[0];
  userCoins: number;
  onRedeem: () => void;
}

export function GiftCardItem({ cardDetails, userCoins, onRedeem }: GiftCardItemProps) {
  const canAfford = userCoins >= cardDetails.coinPrice;

  return (
    <Card className={cn("shadow-lg border-border/30 flex flex-col overflow-hidden transition-all hover:shadow-primary/20 hover:border-primary/50", !canAfford && "opacity-70 bg-muted/50")}>
      <CardHeader className="p-4 pb-0">
        <div className="aspect-[16/9] w-full bg-muted rounded-md overflow-hidden flex items-center justify-center mb-3">
          <Image
            src={`https://placehold.co/300x170.png?text=${encodeURIComponent(cardDetails.name.substring(0,15))}`}
            alt={cardDetails.name}
            width={300}
            height={170}
            className="object-contain"
            data-ai-hint={cardDetails.imageHint}
          />
        </div>
        <CardTitle className="text-lg font-semibold leading-tight text-foreground">{cardDetails.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Value: ₹{cardDetails.valueInRupees}</span>
          <div className="flex items-center font-semibold text-yellow-400">
            <Coins className="h-4 w-4 mr-1" />
            {cardDetails.coinPrice.toLocaleString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button
          onClick={onRedeem}
          disabled={!canAfford}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {canAfford ? 'Redeem Now' : 'Not Enough Coins'}
        </Button>
      </CardFooter>
    </Card>
  );
}
