
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Using Card for structure
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Mail, Loader2 } from 'lucide-react'; // Changed MailLock to Mail
import Link from 'next/link';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(), // Will be read-only in the form
  gender: z.enum(["Not Specified", "Male", "Female", "Other"]),
  ageRange: z.enum(["Prefer not to say", "18-24", "25-34", "35-44", "45-54", "55+"]),
  contactMethod: z.enum(["WhatsApp", "Instagram", "Telegram"]),
  contactDetail: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const { user, isAuthenticated, isLoadingAuth, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialize with a static default, useEffect will set it from user data
  const [currentContactMethod, setCurrentContactMethod] = useState<'WhatsApp' | 'Instagram' | 'Telegram'>('WhatsApp');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      gender: 'Not Specified',
      ageRange: 'Prefer not to say',
      contactMethod: 'WhatsApp', // Default for the form data model
      contactDetail: '',
    },
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else {
        form.reset({
          name: user.name || '',
          email: user.email || '',
          gender: user.gender || 'Not Specified',
          ageRange: user.ageRange || 'Prefer not to say',
          contactMethod: user.contactMethod || 'WhatsApp', // form data
          contactDetail: user.contactDetail || '',
        });
        // State for Tabs component
        setCurrentContactMethod(user.contactMethod || 'WhatsApp');
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, router, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    // Use currentContactMethod from state for the actual method,
    // data.contactDetail is from the active tab's input
    const success = updateUser({
      name: data.name,
      gender: data.gender,
      ageRange: data.ageRange,
      contactMethod: currentContactMethod, 
      contactDetail: data.contactDetail,
    });

    if (success) {
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not save your changes. Please try again." });
    }
    setIsSubmitting(false);
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const getContactPlaceholder = () => {
    switch (currentContactMethod) {
      case 'WhatsApp': return 'WhatsApp Number (e.g., +1234567890)';
      case 'Instagram': return 'Instagram Username (e.g., @username)';
      case 'Telegram': return 'Telegram Username (e.g., @username)';
      default: return 'Contact Detail';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/profile" className="flex items-center text-sm text-primary hover:underline">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-bold mt-2 text-foreground">Edit Profile</h1>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
              <Input id="name" {...form.register("name")} className="mt-1 border-input focus:border-primary focus:ring-primary" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground/80">Email</Label>
              <div className="relative mt-1">
                <Input id="email" {...form.register("email")} disabled className="bg-muted/50 border-input pl-3 pr-10" />
                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /> {/* Changed MailLock to Mail */}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="gender" className="text-foreground/80">Gender</Label>
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="gender" className="mt-1 border-input focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Specified">Not Specified</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="ageRange" className="text-foreground/80">Age</Label>
                 <Controller
                  name="ageRange"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="ageRange" className="mt-1 border-input focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55+">55+</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-foreground/80 mb-1 block">Contact Details</Label>
              <Tabs 
                value={currentContactMethod} // Use value for controlled component
                onValueChange={(value) => setCurrentContactMethod(value as 'WhatsApp' | 'Instagram' | 'Telegram')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="WhatsApp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">WhatsApp</TabsTrigger>
                  <TabsTrigger value="Instagram" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Instagram</TabsTrigger>
                  <TabsTrigger value="Telegram" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Telegram</TabsTrigger>
                </TabsList>
                <TabsContent value="WhatsApp">
                   <Input 
                    {...form.register("contactDetail")} 
                    placeholder={getContactPlaceholder()} 
                    className="mt-2 border-input focus:border-primary focus:ring-primary" 
                  />
                </TabsContent>
                <TabsContent value="Instagram">
                  <Input 
                    {...form.register("contactDetail")} 
                    placeholder={getContactPlaceholder()} 
                    className="mt-2 border-input focus:border-primary focus:ring-primary" 
                  />
                </TabsContent>
                <TabsContent value="Telegram">
                  <Input 
                    {...form.register("contactDetail")} 
                    placeholder={getContactPlaceholder()} 
                    className="mt-2 border-input focus:border-primary focus:ring-primary" 
                  />
                </TabsContent>
              </Tabs>
              {form.formState.errors.contactDetail && <p className="text-sm text-destructive mt-1">{form.formState.errors.contactDetail.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_2px_hsl(var(--primary))] transition-shadow duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
