"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowRight } from "lucide-react";
import { REFERRAL_BONUS } from '@/lib/constants';

export function ReferralPromoCard() {
  return (
    <Card className="shadow-lg border-primary/30">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <Users className="mr-2 h-6 w-6" /> Refer & Earn
        </CardTitle>
        <CardDescription>
          Invite friends to AdNeon and you both earn ₹{REFERRAL_BONUS.toFixed(2)}!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/referrals" passHref>
          <Button 
            variant="outline" 
            className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_10px_1px_hsl(var(--primary))] transition-shadow duration-300"
          >
            Go to Referrals <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
