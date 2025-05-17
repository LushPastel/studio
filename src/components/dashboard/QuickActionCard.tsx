
"use client";

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightCircle, LayoutDashboard, Wallet } from "lucide-react";
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description?: string; // Added optional description
  href: string;
  className?: string;
  iconType: 'dashboard' | 'wallet';
}

export function QuickActionCard({ title, description, href, className, iconType }: QuickActionCardProps) {
  const Icon = iconType === 'dashboard' ? LayoutDashboard : Wallet;
  
  return (
    <Link href={href} passHref>
      <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer", className)}>
        <CardContent className="p-6 flex flex-col justify-between h-full"> {/* Ensure content fills card */}
          <div className="flex items-center justify-between mb-2">
            <Icon className="h-8 w-8 opacity-80 group-hover:opacity-100 transition-opacity" />
            <ArrowRightCircle className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="space-y-1 mt-auto"> {/* Push title and desc to bottom if card is taller */}
            <h4 className="text-2xl font-bold">{title}</h4>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
