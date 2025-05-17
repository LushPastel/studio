
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, ShoppingBag } from "lucide-react";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";

export function ShopPromoCard() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Coming Soon!",
      description: "The shop feature will be available soon.",
    });
  };

  return (
    <Card 
      className="shadow-xl border-primary/30 overflow-hidden cursor-pointer hover:shadow-primary/50 transition-shadow duration-300"
      onClick={handleClick}
    >
      <div className="relative aspect-[16/7] md:aspect-[16/5]">
        <Image 
          src="https://placehold.co/800x350.png" 
          alt="Shop Promotion" 
          layout="fill" 
          objectFit="cover"
          data-ai-hint="shopping gifts neon" 
          className="opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent p-6 md:p-8 flex flex-col justify-center">
          <ShoppingBag className="h-12 w-12 text-primary-foreground mb-2" />
          <h3 className="text-4xl md:text-5xl font-extrabold text-primary-foreground drop-shadow-lg">
            SHOP
          </h3>
          <p className="text-lg text-primary-foreground/80 mt-1 drop-shadow-sm">
            Discover exclusive deals & products.
          </p>
        </div>
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/30 border-primary-foreground/30">
            <ArrowRightCircle className="h-7 w-7" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
