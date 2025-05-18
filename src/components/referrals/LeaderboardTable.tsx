
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Coins, Hourglass } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface UserForLeaderboard {
  id: string;
  name: string;
  coins: number;
  photoURL?: string;
}

export function LeaderboardTable() {
  const { user: currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<UserForLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      if (API_BASE_URL === "REPLACE_WITH_YOUR_LIVE_API_BASE_URL") {
        setError("Leaderboard API is not configured. Please deploy functions and update API_BASE_URL.");
        setIsLoading(false);
        setLeaderboardData([]); // Show empty state if API not configured
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.leaderboard)) {
          setLeaderboardData(data.leaderboard.slice(0, 15)); // Ensure top 15 from backend
        } else {
          throw new Error("Invalid data format from leaderboard API.");
        }
      } catch (e: any) {
        console.error("Failed to fetch leaderboard:", e);
        setError(e.message || "Could not load leaderboard data.");
        setLeaderboardData([]); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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
        {API_BASE_URL === "REPLACE_WITH_YOUR_LIVE_API_BASE_URL" && (
            <p className="text-sm mt-2 text-muted-foreground">Please deploy your Firebase Functions and update the API_BASE_URL in `src/lib/constants.ts`.</p>
        )}
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="text-center py-10">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">The leaderboard is currently empty.</p>
        <p className="text-sm text-muted-foreground">Earn coins to appear on the leaderboard!</p>
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
                  <span>{user.name || 'Unnamed User'}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">{(user.coins || 0).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
