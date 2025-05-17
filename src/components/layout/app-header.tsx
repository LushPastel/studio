
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TvMinimalPlayIcon } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';
// Removed: import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Removed: import { Button } from '@/components/ui/button';
// Removed: import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// Removed: import { LogOut, IndianRupee, Menu } from 'lucide-react';
// Removed: import React, { useState, useEffect } from 'react';
// Removed: import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth(); // Removed logout, as it's not used here anymore
  // Removed: const router = useRouter();
  // Removed: const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Removed: useEffect for mobileMenuOpen

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/wallet') || pathname.startsWith('/referrals') || pathname.startsWith('/profile');
  if (isProtectedRoute && !isAuthenticated && user === null) { 
    // Simplified header height
    return <header className="sticky top-0 z-50 w-full border-b bg-background/95 h-16"></header>;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center space-x-2 text-primary">
          <TvMinimalPlayIcon className="h-7 w-7" />
          <span className="font-bold text-xl tracking-tighter sm:inline-block">
            {APP_NAME}
          </span>
        </Link>
        
        {/* Desktop User Profile Dropdown - REMOVED */}
        {/* Mobile Menu Trigger (for user info & logout) - REMOVED */}
      </div>

      {/* Mobile User Information Menu - REMOVED */}
    </header>
  );
}
