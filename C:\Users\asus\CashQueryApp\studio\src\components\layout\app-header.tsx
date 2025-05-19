
"use client";

import Link from 'next/link';
import { Coins } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  // Show a minimal header or no header if loading or not authenticated on protected routes.
  // This logic might be better placed in the (app) layout if we want a consistent "loading header"
  // For now, if auth is loading, or if user is null and not authenticated, show a minimal bar.
  if (isLoadingAuth || (!user && !isAuthenticated)) {
    return <header className="sticky top-0 z-50 w-full border-b bg-background/95 h-16"></header>;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/" // Link to the new app root (Daily Streak page)
          className={cn(
            "flex items-center space-x-2 text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          )}
        >
          <Coins className="h-7 w-7" /> 
          <span className="font-bold text-xl tracking-tighter sm:inline-block">
            {APP_NAME}
          </span>
        </Link>

        {isAuthenticated && user && (
          <div className="flex items-center space-x-2 text-foreground">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold text-lg">{user.coins?.toLocaleString() || 0}</span>
          </div>
        )}
      </div>
    </header>
  );
}
