
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Coins, Hourglass } from 'lucide-react';

interface UserForLeaderboard {
  id: string;
  name: string;
  coins: number;
  photoURL?: string;
}

export function LeaderboardTable() {
  const { user: currentUser, getAllUsersForLeaderboard } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<UserForLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const allUsers = getAllUsersForLeaderboard();
      
      const sortedUsers = [...allUsers] 
        .sort((a, b) => (b.coins || 0) - (a.coins || 0))
        .slice(0, 15) // Get top 15 users
        .map(u => ({ // Ensure correct structure for UserForLeaderboard
          id: u.id,
          name: u.name || "Unnamed User",
          coins: u.coins || 0,
          photoURL: u.photoURL
        }));

      setLeaderboardData(sortedUsers);
    } catch (e: any) {
      console.error("Failed to load leaderboard from localStorage:", e);
      setError("Could not load leaderboard data.");
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  }, [getAllUsersForLeaderboard, currentUser]); 

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Hourglass className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <Trophy className="mx-auto h-12 w-12 mb-4" />
        <p className="font-semibold">Error loading leaderboard:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="text-center py-10">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">The leaderboard is currently empty.</p>
        <p className="text-sm text-muted-foreground">Users will appear here as they earn coins.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border border-border">
      <Table>
        <TableCaption>Top 15 users by coin balance.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end">
                <Coins className="h-4 w-4 mr-1 text-yellow-400" /> Coins
              </div>
            </TableHead>
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
                    <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png?text=${(user.name || 'U').charAt(0)}`} alt={user.name || 'User'} data-ai-hint="avatar person" />
                    <AvatarFallback>{(user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">{user.coins.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
