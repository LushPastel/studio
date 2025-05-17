
"use client";

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// Removed Loader2 as it's not used here directly for a full page loader

export default function LoginPage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  // Optionally, show a loader if isLoadingAuth is true,
  // but for auth pages, usually rendering the form directly is fine.
  // if (isLoadingAuth) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  return <LoginForm />;
}
