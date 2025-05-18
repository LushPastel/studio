
"use client";

import { SignupForm } from '@/components/auth/signup-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// Removed Loader2 as it's not used here directly for a full page loader

export default function SignupPage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.push('/home'); // Updated redirection
    }
  }, [isLoadingAuth, isAuthenticated, router]);
  
  return <SignupForm />;
}
