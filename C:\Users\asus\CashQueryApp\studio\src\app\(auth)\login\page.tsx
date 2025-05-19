
"use client";

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hourglass } from 'lucide-react'; // Added for loading state

export default function LoginPage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.push('/'); // Updated redirection to new app root
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Only render form if not loading and not authenticated (or redirection hasn't happened yet)
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return null; // Or a generic loading state if needed while redirecting
}
