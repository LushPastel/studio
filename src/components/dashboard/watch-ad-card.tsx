"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { AD_REWARD } from "@/lib/constants";
import { PlaySquare, Gift, CheckCircle } from "lucide-react";
import Image from 'next/image';

const AD_DURATION_SECONDS = 5; // Simulate 5 second ad

export function WatchAdCard() {
  const { addBalance } = useAuth();
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isAdWatched, setIsAdWatched] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdModalOpen && !isAdWatched) {
      const interval = AD_DURATION_SECONDS * 10; // 1000ms / 100 steps for progress
      timer = setInterval(() => {
        setAdProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsAdWatched(true);
            return 100;
          }
          return prev + (100 / (AD_DURATION_SECONDS * 1000 / interval));
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isAdModalOpen, isAdWatched]);

  const handleWatchAd = () => {
    setIsAdModalOpen(true);
    setAdProgress(0);
    setIsAdWatched(false);
  };

  const handleClaimReward = () => {
    addBalance(AD_REWARD);
    setIsAdModalOpen(false);
  };

  return (
    <>
      <Card className="shadow-lg border-accent/30 transform hover:scale-105 transition-transform duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-accent flex items-center">
            <PlaySquare className="mr-2 h-6 w-6" /> Watch Ads & Earn
          </CardTitle>
          <CardDescription>
            Watch short video ads to add ₹{AD_REWARD.toFixed(2)} to your balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleWatchAd} 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_15px_2px_hsl(var(--accent))] transition-shadow duration-300"
          >
            <PlaySquare className="mr-2 h-5 w-5" /> Watch Ad Now
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isAdModalOpen} onOpenChange={setIsAdModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">Watching Ad</DialogTitle>
            <DialogDescription>
              Please watch the ad completely to earn your reward.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isAdWatched ? (
              <div className="text-center space-y-2">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto neon-glow" />
                <p className="text-lg font-semibold">Ad Watched Successfully!</p>
                <p className="text-muted-foreground">You've earned ₹{AD_REWARD.toFixed(2)}.</p>
              </div>
            ) : (
              <>
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                   <Image src="https://placehold.co/300x200.png" alt="Ad Placeholder" width={300} height={200} data-ai-hint="advertisement video" />
                </div>
                <Progress value={adProgress} className="w-full [&>div]:bg-primary" />
                <p className="text-center text-sm text-muted-foreground">
                  Time remaining: {Math.max(0, AD_DURATION_SECONDS - Math.floor(adProgress / (100/AD_DURATION_SECONDS)))}s
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            {isAdWatched ? (
              <Button onClick={handleClaimReward} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Gift className="mr-2 h-5 w-5" /> Claim Reward
              </Button>
            ) : (
              <Button disabled className="w-full">
                Waiting for ad to finish...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
