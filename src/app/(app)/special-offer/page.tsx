
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Coins as CoinsIcon, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { SPECIAL_OFFERS_CONFIG, AD_DURATION_SECONDS } from '@/lib/constants';
import { useRouter } from 'next/navigation'; // For redirecting
import { cn } from '@/lib/utils';

interface OfferItemProps {
  offer: typeof SPECIAL_OFFERS_CONFIG[0];
  isCompleted: boolean;
  isActive: boolean;
  onActionClick: () => void;
}

const OfferItem: React.FC<OfferItemProps> = ({ offer, isCompleted, isActive, onActionClick }) => {
  return (
    <Card className={cn("shadow-md border-border transition-all", isActive && "border-primary ring-2 ring-primary", isCompleted && "bg-muted/30 opacity-70")}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <Image
          src={`https://placehold.co/80x80.png?text=${offer.id.slice(-1)}`} // Simple placeholder based on ID
          alt={offer.title}
          width={80}
          height={80}
          className="rounded-lg bg-muted p-1 object-cover"
          data-ai-hint={offer.imageHint}
        />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-foreground">{offer.title}</h3>
          <p className="text-sm text-muted-foreground mb-1">{offer.description}</p>
          <div className="flex items-center justify-center sm:justify-start text-yellow-400 font-medium">
            <CoinsIcon className="h-4 w-4 mr-1" /> +{offer.coins} Coins
          </div>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          {isCompleted ? (
            <Button variant="ghost" disabled className="w-full text-green-500">
              <CheckCircle className="mr-2 h-5 w-5" /> Completed
            </Button>
          ) : isActive ? (
            <Button onClick={onActionClick} className="w-full bg-primary hover:bg-primary/90">
              {offer.actionType === 'watchAd' ? 'Watch Ad' : 'Start Task'}
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              Locked
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function SpecialOfferPage() {
  const { user, isAuthenticated, isLoadingAuth, completeSpecialOffer, addCoins } = useAuth();
  const router = useRouter();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isAdWatchedInModal, setIsAdWatchedInModal] = useState(false);
  const [currentOfferForModal, setCurrentOfferForModal] = useState<typeof SPECIAL_OFFERS_CONFIG[0] | null>(null);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdModalOpen && !isAdWatchedInModal && currentOfferForModal) {
      const totalSteps = AD_DURATION_SECONDS * 20; 
      const intervalDuration = 1000 / 20; 
      const progressIncrement = 100 / totalSteps;

      timer = setInterval(() => {
        setAdProgress((prev) => {
          if (prev >= 100 - progressIncrement) {
            clearInterval(timer);
            setIsAdWatchedInModal(true);
            return 100;
          }
          return prev + progressIncrement;
        });
      }, intervalDuration);
    }
    return () => clearInterval(timer);
  }, [isAdModalOpen, isAdWatchedInModal, currentOfferForModal, AD_DURATION_SECONDS]);


  if (isLoadingAuth || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading...</p>
      </div>
    );
  }

  const { currentOfferIndex, completedOfferIds } = user.specialOfferProgress;
  const offersCompletedCount = completedOfferIds.length;

  const activeOffers = SPECIAL_OFFERS_CONFIG.filter(offer => !completedOfferIds.includes(offer.id));
  const completedOffers = SPECIAL_OFFERS_CONFIG.filter(offer => completedOfferIds.includes(offer.id));
  
  const currentActiveOffer = SPECIAL_OFFERS_CONFIG[currentOfferIndex];

  const handleOfferAction = (offer: typeof SPECIAL_OFFERS_CONFIG[0]) => {
    if (offer.actionType === 'watchAd') {
      setCurrentOfferForModal(offer);
      setIsAdModalOpen(true);
      setAdProgress(0);
      setIsAdWatchedInModal(false);
    }
    // Add other action types here if needed
  };

  const handleClaimAdReward = async () => {
    if (currentOfferForModal) {
      await completeSpecialOffer(currentOfferForModal.id, currentOfferForModal.coins);
    }
    setIsAdModalOpen(false);
    setCurrentOfferForModal(null);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-card p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/home" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-primary">Special Offer</h1>
          <div className="flex items-center space-x-1 text-yellow-400">
            <CoinsIcon className="h-5 w-5" />
            <span className="font-semibold text-foreground">{user.coins}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4">
        <Card className="bg-primary/10 border-primary/30 text-center">
          <CardContent className="p-6">
            <p className="text-6xl font-extrabold text-primary">{offersCompletedCount}</p>
            <p className="text-lg text-foreground">Offers Completed</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted border-border">
            <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Active</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4 space-y-4">
            {currentActiveOffer ? (
              <OfferItem
                offer={currentActiveOffer}
                isCompleted={false}
                isActive={true}
                onActionClick={() => handleOfferAction(currentActiveOffer)}
              />
            ) : (
              <Card className="text-center">
                <CardContent className="p-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-foreground">All special offers completed!</p>
                  <p className="text-muted-foreground">Check back later for more.</p>
                </CardContent>
              </Card>
            )}
             {/* Display next locked offers for context, if any */}
             {SPECIAL_OFFERS_CONFIG.map((offer, index) => {
                if (index > currentOfferIndex && index < SPECIAL_OFFERS_CONFIG.length) {
                    return (
                        <OfferItem
                            key={offer.id}
                            offer={offer}
                            isCompleted={false}
                            isActive={false}
                            onActionClick={() => {}} // No action for locked
                        />
                    );
                }
                return null;
            })}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {completedOffers.length > 0 ? (
              completedOffers.map(offer => (
                <OfferItem
                  key={offer.id}
                  offer={offer}
                  isCompleted={true}
                  isActive={false}
                  onActionClick={() => {}} // No action
                />
              ))
            ) : (
              <Card className="text-center">
                <CardContent className="p-6">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No offers completed yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAdModalOpen} onOpenChange={(open) => {
         if (!open && !isAdWatchedInModal && currentOfferForModal) { 
            setIsAdModalOpen(false); 
            setCurrentOfferForModal(null);
          } else if (!open && isAdWatchedInModal && currentOfferForModal) { 
            handleClaimAdReward();
          }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">Watching Ad</DialogTitle>
            <DialogDescription>
              Please watch the ad completely to earn your reward for {currentOfferForModal?.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isAdWatchedInModal ? (
              <div className="text-center space-y-2">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <p className="text-lg font-semibold">Ad Watched Successfully!</p>
                <p className="text-muted-foreground">You've earned {currentOfferForModal?.coins} coins.</p>
              </div>
            ) : (
              <>
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                   <Image src={`https://placehold.co/300x200.png?text=Ad+for+${currentOfferForModal?.id || 'offer'}`} alt="Ad Placeholder" width={300} height={200} data-ai-hint={currentOfferForModal?.imageHint || "advertisement video"} />
                </div>
                <Progress value={adProgress} className="w-full [&>div]:bg-primary" />
                <p className="text-center text-sm text-muted-foreground">
                   Time remaining: {Math.max(0, AD_DURATION_SECONDS - Math.floor(AD_DURATION_SECONDS * (adProgress/100)) )}s
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            {isAdWatchedInModal ? (
              <Button onClick={handleClaimAdReward} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <CoinsIcon className="mr-2 h-5 w-5" /> Claim Reward & Continue
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
