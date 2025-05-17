
"use client";

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightCircle, LayoutDashboard, Wallet } from "lucide-react";
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  href: string;
  className?: string;
  iconType: 'dashboard' | 'wallet';
}

export function QuickActionCard({ title, href, className, iconType }: QuickActionCardProps) {
  const Icon = iconType === 'dashboard' ? LayoutDashboard : Wallet;
  
  return (
    <Link href={href} passHref>
      <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer", className)}>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <Icon className="h-8 w-8 mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-2xl font-bold">{title}</h4>
          </div>
          <ArrowRightCircle className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
