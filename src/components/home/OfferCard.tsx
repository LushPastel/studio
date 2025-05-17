
"use client";

import type { ElementType } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

interface OfferCardProps {
  title: string;
  subtitle?: string;
  icon?: ElementType; // Lucide icon
  customIconElement?: React.ReactNode; // For text-based logos or complex SVGs
  showStartButton?: boolean;
  isRecommended?: boolean;
  cardType?: 'default' | 'seeAll';
  className?: string; // For background, text color, etc.
  href?: string; // For "See All" type or if the whole card is a link
  onClickAction?: () => void; // Custom action for "Start" or card click
}

export function OfferCard({
  title,
  subtitle,
  icon: IconComponent,
  customIconElement,
  showStartButton = true,
  isRecommended = false,
  cardType = 'default',
  className,
  href,
  onClickAction
}: OfferCardProps) {
  const { toast } = useToast();

  const handleClick = () => {
    if (onClickAction) {
      onClickAction();
    } else if (href) {
      // Navigation will be handled by Link component
    } else {
      toast({
        title: "Action Clicked!",
        description: `${title} - This feature is coming soon.`,
      });
    }
  };

  const cardContent = (
    <Card
      className={cn(
        "shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group overflow-hidden rounded-2xl h-full text-foreground",
        className,
        href || onClickAction ? 'cursor-pointer' : '' 
      )}
      onClick={!href ? handleClick : undefined} // Click handled by Link if href exists
    >
      {isRecommended && cardType === 'default' && (
        <Badge variant="default" className="absolute top-3 right-3 bg-orange-500 text-white border-orange-500 shadow-md z-10">RECOMMENDED</Badge>
      )}
      
      {cardType === 'seeAll' ? (
        <CardContent className="flex flex-col items-center justify-center p-4 flex-grow">
          <span className="text-lg font-semibold mb-2">{title}</span>
          <ArrowRight className="h-8 w-8" />
        </CardContent>
      ) : (
        <>
          <CardContent className="flex flex-col items-center justify-center p-4 pt-6 flex-grow space-y-1 text-center">
            {customIconElement ? (
              <div className="mb-2 flex items-center justify-center">{customIconElement}</div>
            ) : IconComponent ? (
              <IconComponent className="h-10 w-10 mb-1" />
            ) : null}
            <h4 className="text-base font-bold leading-tight">{title}</h4>
            {subtitle && <p className="text-xs opacity-80 leading-tight">{subtitle}</p>}
          </CardContent>
          {showStartButton && (
            <CardFooter className="p-2">
              <Button variant="ghost" className="w-full justify-center bg-white/20 hover:bg-white/30 text-current backdrop-blur-sm rounded-lg py-1.5 text-sm">
                Start <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );

  if (href) {
    return <Link href={href} className="block h-full">{cardContent}</Link>;
  }
  return cardContent;
}
