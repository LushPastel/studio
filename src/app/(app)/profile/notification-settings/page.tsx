
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Hourglass } from 'lucide-react';
import Link from 'next/link';

type NotificationPreference = "offers" | "promo" | "payments" | "updates";

interface NotificationSetting {
  id: NotificationPreference;
  label: string;
  description?: string;
}

const notificationSettingsConfig: NotificationSetting[] = [
  { id: "offers", label: "Special Offers", description: "Receive notifications about new offers and deals." },
  { id: "promo", label: "Promotional Updates", description: "Get updates on promotions and new features." },
  { id: "payments", label: "Payment Confirmations", description: "Notifications for successful payments and withdrawals." },
  { id: "updates", label: "App Updates & News", description: "Stay informed about important app updates and news." },
];

export default function NotificationSettingsPage() {
  const { user, isAuthenticated, isLoadingAuth, updateUser } = useAuth();
  const router = useRouter();
  
  // Local state to manage switch values, initialized from user or defaults
  const [preferences, setPreferences] = useState(user?.notificationPreferences || {
    offers: true,
    promo: true,
    payments: true,
    updates: true,
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else {
        // Ensure local state is synced with user context if it changes
        if (user.notificationPreferences) {
          setPreferences(user.notificationPreferences);
        }
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, router]);

  const handlePreferenceChange = (id: NotificationPreference, checked: boolean) => {
    const newPreferences = { ...preferences, [id]: checked };
    setPreferences(newPreferences);
    updateUser({ notificationPreferences: newPreferences });
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/profile" className="flex items-center text-sm text-primary hover:underline">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-bold mt-2 text-foreground">Notification Settings</h1>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardContent className="pt-6 space-y-6">
          {notificationSettingsConfig.map((setting, index) => (
            <React.Fragment key={setting.id}>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor={setting.id} className="text-base font-medium text-foreground">
                    {setting.label}
                  </Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                </div>
                <Switch
                  id={setting.id}
                  checked={preferences[setting.id]}
                  onCheckedChange={(checked) => handlePreferenceChange(setting.id, checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              {index < notificationSettingsConfig.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
