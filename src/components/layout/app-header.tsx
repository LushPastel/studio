
"use client";

import Link from 'next/link';
import { Coins } from 'lucide-react'; // Using Coins consistently
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { getTranslation } from '@/lib/translations'; // Import translation helper

export function AppHeader() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  // Determine if the minimal header should be shown (e.g., on auth pages or when not logged in)
  // This logic might need adjustment based on your routing for auth pages vs. app pages.
  // For now, assuming if user is null AND not authenticated, show minimal header.
  // If isLoadingAuth, we might also want a minimal or loading state for the header.
  const showMinimalHeader = isLoadingAuth || (!isAuthenticated && user === null);

  if (showMinimalHeader) {
    // A very basic header for loading or unauthenticated states on protected routes
    // Or a different header for auth pages (though auth pages usually have their own layout)
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16">
        <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
          <Link
            href="/" // Usually links to home or a landing page
            className={cn(
              "flex items-center space-x-2 text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
            )}
          >
            <Coins className="h-7 w-7" />
            <span className="font-bold text-xl tracking-tighter sm:inline-block">
              {getTranslation(user?.appLanguage, 'appName')}
            </span>
          </Link>
          {/* No user-specific info here */}
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className={cn(
            "flex items-center space-x-2 text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          )}
        >
          <Coins className="h-7 w-7" />
          <span className="font-bold text-xl tracking-tighter sm:inline-block">
            {getTranslation(user?.appLanguage, 'appName')}
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
