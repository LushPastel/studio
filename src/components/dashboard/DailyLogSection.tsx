
"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React from "react";

export function DailyLogSection() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">Daily Log</h3>
          <p className="text-muted-foreground text-lg">Streak Calendar</p>
        </div>
        {/* Optional: Could add a button or info here */}
      </div>
      <Card className="shadow-lg border-border overflow-hidden">
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
  );
}
