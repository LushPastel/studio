"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInput,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Wallet, Users, LogOut, Settings, TvMinimalPlayIcon, Search, IndianRupee } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
    { href: '/referrals', label: 'Referrals', icon: Users },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar" defaultOpen={true}>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <TvMinimalPlayIcon className="h-8 w-8" />
            <h1 className="text-2xl font-bold tracking-tighter group-data-[collapsible=icon]:hidden">
              {APP_NAME}
            </h1>
        </Link>
      </SidebarHeader>

      {/* <SidebarGroup className="group-data-[collapsible=icon]:hidden p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
          <SidebarInput placeholder="Search..." className="pl-8" />
        </div>
      </SidebarGroup> */}

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, className:"bg-sidebar text-sidebar-foreground border-sidebar-border" }}
                  className="aria-[current=page]:bg-sidebar-primary aria-[current=page]:text-sidebar-primary-foreground"
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        {user && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="avatar person" />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-semibold text-sm text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
              <p className="text-sm font-semibold text-primary flex items-center">
                <IndianRupee className="h-4 w-4 mr-1" />
                {user.balance.toFixed(2)}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
