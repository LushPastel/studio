
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
       <section className="space-y-4">
        <Card className="shadow-lg border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Daily Log</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">Your Streak Calendar</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full flex justify-center"
              classNames={{
                caption_label: "text-lg font-medium text-primary",
                head_cell: "text-muted-foreground font-normal w-10 sm:w-12",
                cell: "h-10 w-10 sm:h-12 sm:w-12 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal aria-selected:opacity-100 rounded-md",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground rounded-md",
              }}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
