
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TrendingTaskItemProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageHint?: string;
  isRecommended?: boolean;
}

export function TrendingTaskItem({ title, subtitle, imageUrl, imageHint, isRecommended = false }: TrendingTaskItemProps) {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Task Clicked!",
      description: `${title} - This feature is coming soon.`,
    });
  };

  return (
    <Card 
      className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative w-full aspect-[16/9]">
        <Image 
          src={imageUrl} 
          alt={title} 
          layout="fill" 
          objectFit="cover" 
          data-ai-hint={imageHint || "task offer"}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {isRecommended && (
          <Badge className="absolute top-2 right-2 bg-orange-500 text-white border-orange-500 shadow-md">RECOMMENDED</Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary p-0">
          Explore Task <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
