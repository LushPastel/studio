"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift } from "lucide-react";

export function ReferralCodeCard() {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
  };

  return (
    <Card className="shadow-lg border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary flex items-center">
          <Gift className="mr-2 h-6 w-6" /> Your Referral Code
        </CardTitle>
        <CardDescription>
          Share this code with friends. When they sign up, you both get a bonus!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input 
            readOnly 
            value={user.referralCode} 
            className="text-lg font-mono tracking-wider border-dashed border-primary/50 bg-background text-center" 
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCopyCode}
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
            aria-label="Copy referral code"
          >
            <Copy className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
