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
} from "@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/auth-context';
import { MIN_WITHDRAWAL_AMOUNT } from '@/lib/constants';
import { IndianRupee, Send } from 'lucide-react';

const formSchema = z.object({
  amount: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(MIN_WITHDRAWAL_AMOUNT, { message: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}.` })
  ),
});

export function WithdrawalForm() {
  const { user, requestWithdrawal } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: MIN_WITHDRAWAL_AMOUNT,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const success = requestWithdrawal(values.amount);
    if (success) {
      form.reset();
    }
  }
  
  if (!user) return null;

  return (
    <Card className="shadow-lg border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Request Withdrawal</CardTitle>
        <CardDescription>
          Minimum withdrawal amount: ₹{MIN_WITHDRAWAL_AMOUNT.toFixed(2)}. 
          Current balance: ₹{user.balance.toFixed(2)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Withdrawal Amount (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                      <Input type="number" step="0.01" placeholder={String(MIN_WITHDRAWAL_AMOUNT)} {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_2px_hsl(var(--primary))] transition-shadow duration-300"
              disabled={user.balance < MIN_WITHDRAWAL_AMOUNT || form.watch('amount') > user.balance}
            >
             <Send className="mr-2 h-5 w-5" /> Submit Request
            </Button>
            {form.watch('amount') > user.balance && (
              <p className="text-sm text-destructive text-center">Withdrawal amount cannot exceed your balance.</p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
