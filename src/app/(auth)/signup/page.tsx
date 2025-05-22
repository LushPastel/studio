
"use client";

import { SignupForm } from '@/components/auth/signup-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hourglass } from 'lucide-react';

export default function SignupPage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.push('/home');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading...</p>
      </div>
    );
  }
  
  return <SignupForm />;
}
