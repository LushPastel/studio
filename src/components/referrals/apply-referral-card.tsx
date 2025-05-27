
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/auth-context';
import { CheckCircle, UserPlus } from "lucide-react";
import { useState } from 'react';

const formSchema = z.object({
  referralCode: z.string().min(6, { message: 'Referral code must be at least 6 characters.' }),
});

export function ApplyReferralCard() {
  const { applyReferral, user } = useAuth();
  const hasAlreadyAppliedReferral = user?.hasAppliedReferral;
  const [appliedThisSession, setAppliedThisSession] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referralCode: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (hasAlreadyAppliedReferral) {
      return;
    }
    const success = applyReferral(values.referralCode);
    if (success) {
      form.reset();
      setAppliedThisSession(true);
    }
  }

  if (hasAlreadyAppliedReferral || appliedThisSession) {
    return (
       <Card className="shadow-lg border-green-500/50">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-green-500 flex items-center">
            <CheckCircle className="mr-2 h-6 w-6" /> Referral Applied
          </CardTitle>
          <CardDescription>
            You have successfully applied a referral bonus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Enjoy your bonus!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary/30"> {/* Changed border to primary for consistency */}
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary flex items-center"> {/* Changed text to primary */}
          <UserPlus className="mr-2 h-6 w-6" /> Got a Referral Code?
        </CardTitle>
        <CardDescription>
          Enter a friend&apos;s referral code here to get a bonus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Enter Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Referral Code" {...field} className="border-input focus:border-primary focus:ring-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_2px_hsl(var(--primary))] transition-shadow duration-300"
            >
              Apply Code
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
