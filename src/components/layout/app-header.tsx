
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, TvMinimalPlayIcon, IndianRupee, Menu } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/wallet') || pathname.startsWith('/referrals');
  if (isProtectedRoute && !isAuthenticated && !user) {
    // Simplified header height as nav links are moved
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
        
        {/* Desktop User Profile Dropdown */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-primary/30 hover:border-primary/70 transition-colors">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="avatar person" />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="avatar person" />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-default text-sm">
                  <div className="flex items-center text-primary font-medium">
                    <IndianRupee className="mr-2 h-4 w-4" />
                    <span>{user.balance.toFixed(2)}</span>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">Current Balance</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="group cursor-pointer !text-destructive hover:!bg-destructive/10 focus:!bg-destructive/10 focus:!text-destructive">
                  <LogOut className="mr-2 h-4 w-4 text-destructive group-hover:text-destructive group-focus:text-destructive" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Trigger (for user info & logout) */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle user menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile User Information Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t bg-background absolute w-full shadow-lg">
          <nav className="flex flex-col gap-1 p-3">
            <div className="px-3 py-2 space-y-1">
                <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="avatar person" />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center text-primary font-medium pt-1">
                    <IndianRupee className="mr-1 h-4 w-4" />
                    <span>{user.balance.toFixed(2)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">Balance</span>
                </div>
            </div>
            <div className="my-1 border-t border-border"></div>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive mt-1 px-3 py-2.5 text-base items-center">
                <LogOut className="mr-2 h-5 w-5 text-destructive" />
                Log out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
