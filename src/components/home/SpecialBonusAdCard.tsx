
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { SPECIAL_BONUS_ADS_REQUIRED, SPECIAL_BONUS_COIN_REWARD, AD_DURATION_SECONDS } from '@/lib/constants';
import { Gift, Coins, PlaySquare, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export function SpecialBonusAdCard() {
  const { user, recordSpecialBonusAdWatch } = useAuth();
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isAdSimulationWatched, setIsAdSimulationWatched] = useState(false); // Tracks if current modal ad is "watched"

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdModalOpen && !isAdSimulationWatched) {
      const totalSteps = AD_DURATION_SECONDS * 20; 
      const intervalDuration = 1000 / 20; 
      const progressIncrement = 100 / totalSteps;

      timer = setInterval(() => {
        setAdProgress((prev) => {
          if (prev >= 100 - progressIncrement) {
            clearInterval(timer);
            setIsAdSimulationWatched(true);
            return 100;
          }
          return prev + progressIncrement;
        });
      }, intervalDuration);
    }
    return () => clearInterval(timer);
  }, [isAdModalOpen, isAdSimulationWatched]);

  if (!user) {
    return (
      <Card className="shadow-lg border-pink-500/30 text-white bg-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center"><Gift className="mr-2 h-6 w-6" /> Special Bonus Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Loading offer...</p>
        </CardContent>
      </Card>
    );
  }

  const handleWatchAdClick = () => {
    if (user.specialBonusCompleted) return;
    setIsAdModalOpen(true);
    setAdProgress(0);
    setIsAdSimulationWatched(false);
  };

  const handleClaimFromModal = async () => {
    await recordSpecialBonusAdWatch();
    setIsAdModalOpen(false);
  };

  const adsRemaining = SPECIAL_BONUS_ADS_REQUIRED - (user.specialBonusAdsWatched || 0);

  return (
    <>
      <Card className="shadow-lg border-pink-500/30 text-white bg-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><Gift className="mr-2 h-7 w-7" /> Special Bonus!</CardTitle>
          <CardDescription className="text-pink-100">
            {user.specialBonusCompleted 
              ? "You've already claimed this awesome bonus!" 
              : `Watch ${SPECIAL_BONUS_ADS_REQUIRED} ads to earn ${SPECIAL_BONUS_COIN_REWARD} coins!`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user.specialBonusCompleted ? (
            <div className="flex items-center justify-center p-3 bg-white/20 rounded-lg">
              <CheckCircle className="mr-2 h-6 w-6 text-green-300" />
              <span className="font-semibold">Bonus Claimed!</span>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold">{user.specialBonusAdsWatched || 0} / {SPECIAL_BONUS_ADS_REQUIRED}</p>
                <p className="text-xs">Ads Watched</p>
              </div>
              <Progress 
                value={((user.specialBonusAdsWatched || 0) / SPECIAL_BONUS_ADS_REQUIRED) * 100} 
                className="w-full h-3 [&>div]:bg-yellow-300 bg-white/30" 
              />
              <Button 
                onClick={handleWatchAdClick} 
                className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
                disabled={user.specialBonusCompleted}
              >
                <PlaySquare className="mr-2 h-5 w-5" /> Watch Ad ({adsRemaining} left)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAdModalOpen} onOpenChange={(open) => {
         if (!open && !isAdSimulationWatched) { 
            setIsAdModalOpen(false); 
          } else if (!open && isAdSimulationWatched) { 
            handleClaimFromModal();
          }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">Watching Special Ad</DialogTitle>
            <DialogDescription>
              Please watch the ad completely.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isAdSimulationWatched ? (
              <div className="text-center space-y-2">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <p className="text-lg font-semibold">Ad Watched!</p>
                <p className="text-muted-foreground">
                  {user.specialBonusAdsWatched + 1 >= SPECIAL_BONUS_ADS_REQUIRED 
                    ? `You're about to claim ${SPECIAL_BONUS_COIN_REWARD} coins!` 
                    : `Progress: ${user.specialBonusAdsWatched + 1} / ${SPECIAL_BONUS_ADS_REQUIRED} ads.`}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                   <Image src="https://placehold.co/300x200.png" alt="Ad Placeholder" width={300} height={200} data-ai-hint="advertisement video" />
                </div>
                <Progress value={adProgress} className="w-full [&>div]:bg-primary" />
                <p className="text-center text-sm text-muted-foreground">
                  Time remaining: {Math.max(0, AD_DURATION_SECONDS - Math.floor(AD_DURATION_SECONDS * (adProgress/100)) )}s
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            {isAdSimulationWatched ? (
              <Button onClick={handleClaimFromModal} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Coins className="mr-2 h-5 w-5" /> Continue
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
