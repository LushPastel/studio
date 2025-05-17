
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TvMinimalPlayIcon } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';

export function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth(); 

  const isProtectedRoute = pathname.startsWith('/home') || pathname.startsWith('/dashboard') || pathname.startsWith('/wallet') || pathname.startsWith('/referrals') || pathname.startsWith('/profile');
  if (isProtectedRoute && !isAuthenticated && user === null) { 
    return <header className="sticky top-0 z-50 w-full border-b bg-background/95 h-16"></header>;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/home" className="flex items-center space-x-2 text-primary">
          <TvMinimalPlayIcon className="h-7 w-7" />
          <span className="font-bold text-xl tracking-tighter sm:inline-block">
            {APP_NAME}
          </span>
        </Link>
      </div>
    </header>
  );
}
