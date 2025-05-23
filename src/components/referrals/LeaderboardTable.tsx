
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context'; // For fetching local users
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Coins, Hourglass } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants'; // Used to check if we are in mock mode

interface UserForLeaderboard {
  id: string;
  name: string;
  coins: number;
  photoURL?: string;
}

export function LeaderboardTable() {
  const { user: currentUser, getAllUsersForLeaderboard } = useAuth(); // Use local data source
  const [leaderboardData, setLeaderboardData] = useState<UserForLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Using localStorage via AuthContext as per current directive
    if (API_BASE_URL === "REPLACE_WITH_YOUR_LIVE_API_BASE_URL") {
      try {
        const allUsers = getAllUsersForLeaderboard(); // From AuthContext
        
        const sortedUsers = [...allUsers]
          .sort((a, b) => (b.coins || 0) - (a.coins || 0))
          .slice(0, 15)
          .map(u => ({
            id: u.id,
            name: u.name || "Unnamed User",
            coins: u.coins || 0,
            photoURL: u.photoURL,
          }));

        setLeaderboardData(sortedUsers);
      } catch (e: any) {
        console.error("Failed to load leaderboard from localStorage:", e);
        setError("Could not load leaderboard data from local storage.");
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Placeholder for when API_BASE_URL is configured for a live backend
      // This block would be used if we were making a real API call.
      // For now, it indicates that the system is set up for local data.
      console.warn("Leaderboard is in local mode. API_BASE_URL is not configured for a live backend.");
      setError("Leaderboard is in local/mock mode. Configure API_BASE_URL for live data.");
      setIsLoading(false);
      // Optionally, still load from local storage as a fallback:
      // const allUsers = getAllUsersForLeaderboard();
      // const sortedUsers = ...
      // setLeaderboardData(sortedUsers);
    }

  }, [getAllUsersForLeaderboard, currentUser]); // currentUser dependency to re-highlight if user changes

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
        <p className="font-semibold">Leaderboard Information:</p>
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

