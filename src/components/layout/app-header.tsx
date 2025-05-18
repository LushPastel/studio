
"use client";

import Link from 'next/link';
import { Coins } from 'lucide-react'; // Changed from CircleDollarSign
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  // This logic helps show a minimal header on protected routes if auth is still loading
  // or if the user is somehow unauthenticated on a protected route.
  const showMinimalHeader = !isLoadingAuth && !isAuthenticated && user === null;

  if (showMinimalHeader && !isAuthenticated) { // Check !isAuthenticated for robustness
    return <header className="sticky top-0 z-50 w-full border-b bg-background/95 h-16"></header>;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/home"
          className={cn(
            "flex items-center space-x-2 text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          )}
        >
          <Coins className="h-7 w-7" /> {/* Changed Icon */}
          <span className="font-bold text-xl tracking-tighter sm:inline-block">
            {APP_NAME}
          </span>
        </Link>

        {isAuthenticated && user && !isLoadingAuth && (
          <div className="flex items-center space-x-2 text-foreground">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold text-lg">{user.coins?.toLocaleString() || 0}</span>
          </div>
        )}
      </div>
    </header>
  );
}
