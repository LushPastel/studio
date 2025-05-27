
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Coins, Hourglass } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants'; // Used for conceptual check, not direct calls

interface UserForLeaderboard {
  id: string;
  name: string;
  coins: number;
  photoURL?: string;
}

export function LeaderboardTable() {
  const { user: currentUser, getAllUsersForLeaderboard, isLoadingAuth } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<UserForLeaderboard[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true); // Renamed for clarity

  useEffect(() => {
    if (isLoadingAuth) {
      setIsDataLoading(true);
      return;
    }
    setIsDataLoading(true);
    try {
      const allUsers = getAllUsersForLeaderboard(); // From AuthContext, sorted by coins
      
      const topUsers = allUsers
        .slice(0, 15) // Get top 15
        .map(u => ({ // Ensure a clean mapping for display
          id: u.id,
          name: u.name || "Unnamed User",
          coins: u.coins || 0,
          photoURL: u.photoURL,
        }));
      setLeaderboardData(topUsers);
    } catch (e: any) {
      console.error("Failed to load leaderboard from localStorage:", e);
      setLeaderboardData([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [getAllUsersForLeaderboard, isLoadingAuth]); // Re-fetch if users change or auth state loads

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Hourglass className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading leaderboard...</p>
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
                    <AvatarImage 
                        src={user.photoURL || undefined} 
                        alt={user.name || 'User'} 
                        data-ai-hint={user.photoURL ? "profile photo" : "avatar person"}
                    />
                    <AvatarFallback>{(user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
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
