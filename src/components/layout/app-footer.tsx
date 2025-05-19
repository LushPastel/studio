
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, Users, User, Home as HomeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { getTranslation } from '@/lib/translations'; // Import translation helper

export function AppFooter() {
  const pathname = usePathname();
  const { user } = useAuth(); // Get user to access appLanguage

  const navItems = [
    { href: '/home', labelKey: 'navHome', icon: HomeIcon },
    { href: '/wallet', labelKey: 'navWallet', icon: Wallet },
    { href: '/referrals', labelKey: 'navReferrals', icon: Users },
    { href: '/profile', labelKey: 'navProfile', icon: User },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-around px-2 md:px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/home' && pathname === '/'); // Adjusted for root path being home
          const label = getTranslation(user?.appLanguage, item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-1/4 md:w-auto md:flex-row md:gap-2 hover:bg-accent/50",
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-5 w-5 md:h-4 md:w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="text-xs md:text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
