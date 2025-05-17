
"use client";

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// Removed Loader2 as it's not used here directly for a full page loader

export default function ForgotPasswordPage() {
  const { isAuthenticated, isLoadingAuth } = useAuth(); // Assuming you might want to redirect logged-in users
  const router = useRouter();

  useEffect(() => {
    // Decide if an authenticated user should be redirected from forgot password.
    // Typically, they might still want to access it. For consistency, we can add it.
    if (!isLoadingAuth && isAuthenticated) {
      // router.push('/dashboard'); // Uncomment if you want to redirect authenticated users
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  return <ForgotPasswordForm />;
}
