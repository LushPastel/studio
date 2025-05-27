
"use client";

import React, { useEffect } from 'react';
import { useAuth, type CoinTransaction } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Hourglass, Coins, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';

const TransactionTypeIcon = ({ type }: { type: CoinTransaction['type'] }) => {
  switch (type) {
    case 'Daily Ad':
      return <Coins className="h-5 w-5 text-yellow-400" />;
    case 'Referral Bonus':
      return <Coins className="h-5 w-5 text-green-500" />;
    case 'Special Offer':
      return <Coins className="h-5 w-5 text-blue-500" />;
    case 'Special Bonus':
      return <Coins className="h-5 w-5 text-purple-500" />;
    case 'Rating Bonus':
        return <Coins className="h-5 w-5 text-orange-500" />;
    default:
      return <Coins className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function RewardHistoryPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  if (isLoadingAuth || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading...</p>
      </div>
    );
  }

  const { coinTransactionHistory = [] } = user;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/profile" className="flex items-center text-sm text-primary hover:underline">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-bold mt-2 text-foreground">Reward History</h1>
        <p className="text-muted-foreground">View a log of all coins you have earned.</p>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Your Coin Earnings</CardTitle>
          <CardDescription>A log of all coins you have earned. Showing the last {coinTransactionHistory.length > 0 ? Math.min(coinTransactionHistory.length, 50) : 0} entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {coinTransactionHistory.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center">
              <Image 
                src="https://placehold.co/300x200.png" 
                alt="No data found" 
                width={200} 
                height={150}
                className="mb-4 opacity-70"
                data-ai-hint="empty box illustration"
              />
              <p className="text-muted-foreground text-lg">No data found</p>
              <p className="text-sm text-muted-foreground mt-1">Start completing tasks to earn coins!</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] rounded-md border border-border">
              <ul className="divide-y divide-border">
                {coinTransactionHistory.map((transaction) => (
                  <li key={transaction.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <TransactionTypeIcon type={transaction.type} />
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">Type: {transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} Coins
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center justify-end">
                           <CalendarDays className="h-3 w-3 mr-1" /> {format(parseISO(transaction.date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
