
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Puzzle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PlayQuizPromoCard() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Play Quiz",
      description: "This feature is coming soon!",
    });
  };

  return (
    <Card 
      onClick={handleClick}
      className="shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-2xl overflow-hidden bg-green-500 text-white aspect-[4/3] sm:aspect-auto"
    >
      <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full">
        <div>
          <Puzzle className="h-8 w-8 sm:h-10 sm:w-10 mb-1 sm:mb-2" />
          <h3 className="text-xl sm:text-2xl font-bold">Play Quiz</h3>
          <p className="text-xs sm:text-sm opacity-80">Play quiz and start earning</p>
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
