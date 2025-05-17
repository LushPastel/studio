"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { TvMinimalPlayIcon } from "lucide-react";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/wallet")) return "Wallet";
  if (pathname.startsWith("/referrals")) return "Referrals";
  return APP_NAME;
}

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2 md:hidden text-primary">
         <TvMinimalPlayIcon className="h-6 w-6" />
         <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
      </div>
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold text-primary">{pageTitle}</h1>
      </div>
      {/* Future elements like notifications or user menu can go here for larger screens */}
    </header>
  );
}
