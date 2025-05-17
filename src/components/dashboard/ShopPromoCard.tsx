
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Image from 'next/image';

export function ShopPromoCard() {
  return (
    <Card className="shadow-lg border-primary/30 overflow-hidden group transform hover:scale-105 transition-transform duration-300">
      <div className="relative h-48 sm:h-56 md:h-64">
        <Image
          src="https://placehold.co/600x400.png"
          alt="Promotional offer"
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-110 transition-transform duration-500 ease-in-out"
          data-ai-hint="shopping gifts neon"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 flex flex-col justify-end">
          <CardTitle className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            <ShoppingBag className="mr-2 h-7 w-7 inline-block mb-1" />
            Exclusive Shop Offers!
          </CardTitle>
          <CardDescription className="text-neutral-200 drop-shadow-md mt-1">
            Discover amazing deals and products.
          </CardDescription>
        </div>
      </div>
      <CardContent className="p-4 bg-card">
        <Link href="/shop" passHref>
          <Button
            variant="default" 
            className="w-full flex items-center justify-center" 
          >
            <span className="font-semibold">SHOP</span>
            <span className="ml-2 bg-white rounded-full p-1 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-black" />
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
