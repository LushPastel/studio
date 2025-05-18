
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
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Mail, Hourglass, User, ImageUp, Trash2 } from 'lucide-react';
import Link from 'next/link';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  photoURL: z.string().optional().or(z.literal('')), // Will store Data URI
  email: z.string().email(), // Will be read-only
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
  const [currentContactMethod, setCurrentContactMethod] = useState<'WhatsApp' | 'Instagram' | 'Telegram'>('WhatsApp');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      photoURL: '',
      email: '',
      gender: 'Not Specified',
      ageRange: 'Prefer not to say',
      contactMethod: 'WhatsApp',
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
          photoURL: user.photoURL || '',
          email: user.email || '',
          gender: user.gender || 'Not Specified',
          ageRange: user.ageRange || 'Prefer not to say',
          contactMethod: user.contactMethod || 'WhatsApp',
          contactDetail: user.contactDetail || '',
        });
        setCurrentContactMethod(user.contactMethod || 'WhatsApp');
        setImagePreview(user.photoURL || null);
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, router, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('photoURL', dataUri, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue('photoURL', '', { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    const success = updateUser({
      name: data.name,
      photoURL: data.photoURL, // This will be the Data URI or empty string
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
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Loading...</p>
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
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={imagePreview || undefined} alt={user.name} data-ai-hint="profile avatar"/>
                <AvatarFallback className="text-4xl bg-muted">
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <ImageUp className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="photoUpload"
                />
                {imagePreview && (
                  <Button type="button" variant="destructive" size="icon" onClick={handleRemoveImage} aria-label="Remove profile picture">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
               {form.formState.errors.photoURL && <p className="text-sm text-destructive mt-1">{form.formState.errors.photoURL.message}</p>}
            </div>


            <div>
              <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
              <Input id="name" {...form.register("name")} className="mt-1 border-input focus:border-primary focus:ring-primary" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground/80">Email</Label>
              <div className="relative mt-1">
                <Input id="email" {...form.register("email")} disabled className="bg-muted/50 border-input pl-3 pr-10" />
                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="gender" className="text-foreground/80">Gender</Label>
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                value={currentContactMethod}
                onValueChange={(value) => {
                  setCurrentContactMethod(value as 'WhatsApp' | 'Instagram' | 'Telegram');
                  form.setValue('contactMethod', value as 'WhatsApp' | 'Instagram' | 'Telegram');
                }}
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
              {isSubmitting ? <Hourglass className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    