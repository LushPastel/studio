
"use client";

import Link from 'next/link';
import { Coins } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
// import { APP_NAME } from '@/lib/constants'; // APP_NAME will now come from translations
import { useTranslation } from 'react-i18next';

export function AppHeader() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t } = useTranslation();
  const appName = t('appName');

  const showMinimalHeader = isLoadingAuth || (!isAuthenticated && user === null);

  if (showMinimalHeader) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16">
        <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
          <Link
            href="/" 
            className={cn(
              "flex items-center space-x-2 text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
            )}
          >
            <Coins className="h-7 w-7" />
            <span className="font-bold text-xl tracking-tighter sm:inline-block">
              {appName}
            </span>
          </Link>
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
            {appName}
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
