
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // Imported useState
import { Loader2, UserCircle, Mail, Gift, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State for logout message

  useEffect(() => {
    // If already logging out, don't process other redirects from this effect
    if (isLoggingOut) return;

    // Redirect to login if not authenticated and user data isn't available
    if (!isAuthenticated && user === null) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router, isLoggingOut]);

  const handleLogout = () => {
    setIsLoggingOut(true); // Show "Logging out..." message
    logout();
    router.push('/login'); // Navigate to login page
  };

  if (isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Logging out...</p>
      </div>
    );
  }

  // Show "Loading profile..." during initial load or if user data is missing (and not logging out)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading profile...</p>
      </div>
    );
  }

  // Render profile content if user data is available and not logging out
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Your Profile
        </h2>
        <p className="text-muted-foreground">Manage your account details and settings.</p>
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardHeader className="flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left">
          <Avatar className="h-20 w-20 border-2 border-primary mb-4 sm:mb-0 sm:mr-6">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="avatar person" />
            <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl text-primary">{user.name}</CardTitle>
            <CardDescription className="text-base">{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-5 w-5 text-accent" />
              <div>
                <p className="text-muted-foreground">Current Balance</p>
                <p className="font-semibold text-foreground">₹{user.balance.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Gift className="h-5 w-5 text-accent" />
              <div>
                <p className="text-muted-foreground">Referral Code</p>
                <p className="font-mono text-foreground">{user.referralCode}</p>
              </div>
            </div>
             <div className="flex items-center space-x-3">
              <UserCircle className="h-5 w-5 text-accent" />
              <div>
                <p className="text-muted-foreground">User ID</p>
                <p className="font-mono text-xs text-foreground">{user.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-accent" />
               <div>
                <p className="text-muted-foreground">Email Verified</p>
                <p className="font-semibold text-foreground">Yes (Simulated)</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
              Edit Profile
            </Button>
             <Button variant="outline" className="w-full sm:w-auto">
              Change Password
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full sm:w-auto sm:ml-auto"
            >
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>

       {/* Placeholder for other profile sections like settings, activity log, etc. */}
        {/* <Card className="mt-8">
          <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Settings options will appear here.</p></CardContent>
        </Card> */}
    </div>
  );
}
