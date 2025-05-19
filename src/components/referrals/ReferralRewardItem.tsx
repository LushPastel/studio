
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Lock, Gift } from 'lucide-react'; // Added Gift icon
import { cn } from '@/lib/utils';

export interface RewardTier {
  id: string;
  invitesRequired: number;
  type: 'coins' | 'physical';
  amount?: number; // for coins
  description: string;
  details?: string; // for physical items
  imageSrc?: string; // for physical items
}

interface ReferralRewardItemProps {
  tier: RewardTier;
  currentUserReferrals: number;
  claimedTiers: string[];
  onClaimReward: (tierId: string) => void;
}

export function ReferralRewardItem({
  tier,
  currentUserReferrals,
  claimedTiers,
  onClaimReward,
}: ReferralRewardItemProps) {
  const isUnlocked = currentUserReferrals >= tier.invitesRequired;
  const isClaimed = claimedTiers.includes(tier.id);

  let statusIcon;
  let statusText = "";
  let canClaim = false;

  if (isClaimed) {
    statusIcon = <CheckCircle2 className="h-6 w-6 text-green-500" />;
    statusText = "Claimed";
  } else if (isUnlocked) {
    statusIcon = <Circle className="h-6 w-6 text-primary" />; // Represents claimable
    statusText = "Claim Reward";
    canClaim = true;
  } else {
    statusIcon = <Lock className="h-6 w-6 text-muted-foreground" />;
    statusText = "Locked";
  }

  return (
    <Card className={cn("border-border/50 overflow-hidden", isUnlocked && !isClaimed ? "border-primary shadow-primary/20" : "")}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {tier.imageSrc ? (
            <Image 
              src={tier.imageSrc} 
              alt={tier.description} 
              width={64} 
              height={64} 
              className="rounded-md object-contain bg-muted p-1" 
              data-ai-hint="usb drive"
            />
          ) : (
            <div className="p-3 bg-muted rounded-full">
               <Gift className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              Unlock at {tier.invitesRequired} invites
            </p>
            <h4 className="text-lg font-semibold text-primary">{tier.description}</h4>
            {tier.details && <p className="text-xs text-muted-foreground">{tier.details}</p>}
          </div>
        </div>
        
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          {canClaim ? (
            <Button onClick={() => onClaimReward(tier.id)} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              Claim Reward
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 w-full sm:w-auto justify-center">
              {statusIcon}
              <span className={cn("text-sm font-medium", isClaimed ? "text-green-500" : "text-muted-foreground")}>
                {statusText}
              </span>
            </div>
          )}
           {!isUnlocked && (
             <p className="text-xs text-muted-foreground text-center sm:text-right">
                Invite {tier.invitesRequired - currentUserReferrals} more friends to unlock.
             </p>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
