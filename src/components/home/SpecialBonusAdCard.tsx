
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link'; // Import Link

export function SpecialBonusAdCard() {
  return (
    <Link href="/special-offer" passHref>
      <Card className="shadow-lg border-pink-500/30 text-white bg-pink-500 hover:bg-pink-600 transition-colors cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Gift className="mr-2 h-7 w-7" /> Special Offer
          </CardTitle>
          <CardDescription className="text-pink-100">
            Complete a series of tasks for a big reward!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="ghost" // Ghost to make the whole card clickable more naturally
            className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-300 justify-center"
            asChild // Make the button act as the Link anchor
          >
            <span>
              Start Offer <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
