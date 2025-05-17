
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function SuperOfferPromoCard() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Super Offers",
      description: "This feature is coming soon!",
    });
  };

  return (
    <Card 
      onClick={handleClick}
      className="shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-2xl overflow-hidden bg-orange-500 text-white aspect-[4/3] sm:aspect-auto"
    >
      <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold">Super Offers</h3>
          <p className="text-xs sm:text-sm opacity-80">Best Offers to Earn Fast</p>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 rounded-full h-10 w-10 sm:h-12 sm:w-12">
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
