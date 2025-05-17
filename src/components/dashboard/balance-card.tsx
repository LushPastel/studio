
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function BalanceCard() {
  const { user } = useAuth();

  return (
    <Card className="shadow-lg border-primary/30 transform hover:scale-105 transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-primary">Current Balance</CardTitle>
        <IndianRupee className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">
          ₹{user?.balance.toFixed(2) || '0.00'}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Your available earnings
        </p>
      </CardContent>
    </Card>
  );
}
