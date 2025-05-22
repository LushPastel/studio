
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Hourglass } from 'lucide-react';

export default function AuthenticatedRootPage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Hourglass className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-foreground">Loading...</p>
    </div>
  );
}
