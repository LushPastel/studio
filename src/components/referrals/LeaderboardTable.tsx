
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';

interface UserForLeaderboard {
  id: string;
  name: string;
  weeklyReferralsMade: number; // Changed from referralsMade
}

export function LeaderboardTable() {
  const { getAllUsersForLeaderboard, user: currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<UserForLeaderboard[]>([]);

  useEffect(() => {
    const users = getAllUsersForLeaderboard();
    const sortedUsers = users
      .map(u => ({ 
        id: u.id, 
        name: u.name, 
        weeklyReferralsMade: u.weeklyReferralsMade || 0 // Use weekly referrals
      }))
      .filter(u => u.weeklyReferralsMade > 0) 
      .sort((a, b) => b.weeklyReferralsMade - a.weeklyReferralsMade);
    setLeaderboardData(sortedUsers);
  }, [getAllUsersForLeaderboard, currentUser]); // Added currentUser to dependencies to refresh if they log in/out

  if (leaderboardData.length === 0) {
    return (
      <div className="text-center py-10">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">The weekly leaderboard is currently empty.</p>
        <p className="text-sm text-muted-foreground">Start referring friends this week to climb the ranks!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Weekly Referrals</TableHead> 
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.map((user, index) => (
            <TableRow 
              key={user.id}
              className={currentUser?.id === user.id ? 'bg-primary/10' : ''}
            >
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="avatar person" />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">{user.weeklyReferralsMade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {leaderboardData.length > 10 && <TableCaption>Showing top weekly referrers.</TableCaption>}
    </ScrollArea>
  );
}

    
