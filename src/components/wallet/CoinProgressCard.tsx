
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { Coins } from "lucide-react";

const TARGET_COINS = 1000; // Define a target for coin collection

export function CoinProgressCard() {
  const { user } = useAuth();
  const currentCoins = user?.coins || 0;
  const progressPercentage = TARGET_COINS > 0 ? (currentCoins / TARGET_COINS) * 100 : 0;

  return (
    <Card className="shadow-lg border-yellow-500/30 transform hover:scale-105 transition-transform duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-yellow-500 flex items-center">
          <Coins className="mr-2 h-6 w-6" /> Your Coin Chest
        </CardTitle>
        <CardDescription>
          Collect coins to redeem exciting rewards!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">{currentCoins}</p>
          <p className="text-sm text-muted-foreground">
            Coins Collected (Goal: {TARGET_COINS})
          </p>
        </div>
        <Progress value={progressPercentage} className="w-full [&>div]:bg-yellow-500" />
        {currentCoins >= TARGET_COINS && (
          <p className="text-center text-sm font-medium text-green-500">
            Congratulations! You've reached the goal!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
