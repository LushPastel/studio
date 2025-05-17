
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShoppingBag } from "lucide-react"; // ShoppingBag can be re-added if desired

export function ShopPromoCard() {
  return (
    <Card className="shadow-lg border-primary/30">
      <CardHeader className="p-6">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
          <ShoppingBag className="mr-3 h-8 w-8 text-primary" /> {/* Icon added here */}
          Explore Our Shop
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          Find amazing deals and exclusive products.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
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
