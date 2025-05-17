
"use client";

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, KeyRound } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import React from 'react'; // Added React import

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Min 1 for prototype, adjust as needed
});

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = await login(values.email, values.password);
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      form.setError("password", { type: "manual", message: "Login failed. Check credentials." });
      form.resetField("password");
    }
  }

  return (
    <Card className="shadow-xl border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
        <CardDescription>Sign in to continue to {APP_NAME}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                      <Input placeholder="you@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_2px_hsl(var(--primary))] transition-shadow duration-300"
              disabled={isLoading}
            >
              {isLoading ? <LogIn className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <p className="text-foreground/70">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-accent hover:text-accent/80 underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-foreground/70">
            <Link href="/forgot-password" className="font-medium text-accent hover:text-accent/80 underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
