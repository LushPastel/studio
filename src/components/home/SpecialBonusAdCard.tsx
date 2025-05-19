
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Removed imports for Dialog, Progress, useAuth, constants, Image, Coins, PlaySquare, CheckCircle

export function SpecialBonusAdCard() {
  const { toast } = useToast();

  const handleStartBonus = () => {
    toast({
      title: "Coming Soon!",
      description: "This special bonus feature is under development.",
    });
  };

  return (
    <Card className="shadow-lg border-pink-500/30 text-white bg-pink-500">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Gift className="mr-2 h-7 w-7" /> Special Bonus!
        </CardTitle>
        <CardDescription className="text-pink-100">
          An exclusive offer awaits you. Click start to learn more!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleStartBonus}
          className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
        >
          Start Bonus <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
