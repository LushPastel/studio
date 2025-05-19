
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, Hourglass, Tv2, Coins, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { AD_REWARDS_TIERED, MAX_ADS_PER_DAY, AD_DURATION_SECONDS } from '@/lib/constants';
import { format, subDays, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

const DayIndicator = ({ date, isCheckedIn }: { date: Date; isCheckedIn: boolean }) => {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground">{format(date, 'EEE')}</span>
      <div className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 mt-1",
        isCheckedIn ? "bg-green-500 border-green-600" : "bg-muted border-border"
      )}>
        {isCheckedIn && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
      </div>
      <span className="text-xs text-muted-foreground mt-0.5">{format(date, 'd')}</span>
    </div>
  );
};


export default function DailyStreakPage() {
  const { user, isAuthenticated, isLoadingAuth, recordAdWatchAndCheckIn } = useAuth();
  const router = useRouter();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isAdWatchedInModal, setIsAdWatchedInModal] = useState(false);
  const [currentAdReward, setCurrentAdReward] = useState(0);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  // Ad modal progress timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdModalOpen && !isAdWatchedInModal) {
      const interval = AD_DURATION_SECONDS * 10; 
      timer = setInterval(() => {
        setAdProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsAdWatchedInModal(true);
            return 100;
          }
          // Calculate increment based on total duration and number of steps
          return prev + (100 / (AD_DURATION_SECONDS * 1000 / interval));
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isAdModalOpen, isAdWatchedInModal]);


  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }

  const handleWatchAdClick = (reward: number) => {
    setCurrentAdReward(reward);
    setIsAdModalOpen(true);
    setAdProgress(0);
    setIsAdWatchedInModal(false);
  };

  const handleClaimRewardAndCheckIn = async () => {
    await recordAdWatchAndCheckIn();
    setIsAdModalOpen(false);
  };

  const today = new Date();
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();
  const userCheckIns = user.dailyCheckIns.map(dateStr => parseISO(dateStr));


  return (
    <div className="space-y-6 pb-16">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-xl shadow-lg">
        <div className="flex items-center mb-4">
          <Link href="/home" className="mr-4 p-2 rounded-full hover:bg-black/20 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Daily Streak</h1>
        </div>
        <div className="text-center">
          <p className="text-7xl font-extrabold">{user.currentStreak}</p>
          <p className="text-lg">days streak</p>
          <p className="text-sm opacity-80 mt-1">Extend your streak to unlock new rewards! Way to go!</p>
        </div>
      </div>
      
      <Card className="mx-2 sm:mx-4 shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-around">
            {lastSevenDays.map((day) => (
              <DayIndicator 
                key={day.toISOString()} 
                date={day} 
                isCheckedIn={userCheckIns.some(checkInDate => isSameDay(checkInDate, day))}
              />
            ))}
          </div>
        </CardContent>
      </Card>


      <Card className="mx-2 sm:mx-4 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Watch Ads?</CardTitle>
          <CardDescription className="text-muted-foreground">You can watch up to {MAX_ADS_PER_DAY} ads every day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AD_REWARDS_TIERED.map((reward, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-card-foreground/5 rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Tv2 className="h-7 w-7 text-primary" />
                <Coins className="h-6 w-6 text-yellow-400" />
                <span className="text-lg font-medium text-foreground">+{reward}</span>
              </div>
              {index < user.adsWatchedToday ? (
                <Button variant="ghost" disabled className="text-green-500">
                  <CheckCircle className="mr-2 h-5 w-5" /> Watched
                </Button>
              ) : index === user.adsWatchedToday ? (
                <Button onClick={() => handleWatchAdClick(reward)} className="bg-primary hover:bg-primary/90">
                  Watch Ad
                </Button>
              ) : (
                <Button variant="outline" disabled>Locked</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={isAdModalOpen} onOpenChange={(open) => {
         if (!open && !isAdWatchedInModal) { // If dialog is closed before ad finishes
            setIsAdModalOpen(false); // Ensure it closes
          } else if (!open && isAdWatchedInModal) { // If closed after ad finished (e.g. by clicking outside)
            handleClaimRewardAndCheckIn(); // Still claim reward
          }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">Watching Ad</DialogTitle>
            <DialogDescription>
              Please watch the ad completely to earn your reward.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isAdWatchedInModal ? (
              <div className="text-center space-y-2">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto neon-glow" />
                <p className="text-lg font-semibold">Ad Watched Successfully!</p>
                <p className="text-muted-foreground">You've earned {currentAdReward} coins.</p>
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
            {isAdWatchedInModal ? (
              <Button onClick={handleClaimRewardAndCheckIn} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Coins className="mr-2 h-5 w-5" /> Claim Reward & Check In
              </Button>
            ) : (
              <Button disabled className="w-full">
                Waiting for ad to finish...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

    