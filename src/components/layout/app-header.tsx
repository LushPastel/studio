
"use client";

import Link from 'next/link';
import { TvMinimalPlayIcon } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { user, isAuthenticated } = useAuth();

  // This logic helps show a minimal header on protected routes if auth is still loading
  // or if the user is somehow unauthenticated on a protected route.
  // It can be refined based on specific route protection strategies.
  const isPotentiallyProtectedRouteContext = true; // Simplified assumption for header visibility
  const showMinimalHeader = isPotentiallyProtectedRouteContext && !isAuthenticated && user === null;

  if (showMinimalHeader) {
    // Render a placeholder or minimal header to maintain layout consistency during auth checks
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
          <TvMinimalPlayIcon className="h-7 w-7" />
          <span className="font-bold text-xl tracking-tighter sm:inline-block">
            {APP_NAME}
          </span>
        </Link>
        {/* User profile dropdown and mobile menu were removed in a previous step */}
      </div>
    </header>
  );
}
