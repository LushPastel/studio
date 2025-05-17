
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, Users, User, Home as HomeIcon, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: HomeIcon }, 
  { href: '/dashboard', label: 'Daily Log', icon: LayoutDashboard }, // Changed label, points to calendar page
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

export function AppFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-around px-2 md:px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/home' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-1/5 md:w-auto md:flex-row md:gap-2 hover:bg-accent/50", // Adjusted w-1/4 to w-1/5 for 5 items
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-5 w-5 md:h-4 md:w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="text-xs md:text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
