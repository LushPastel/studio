
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Mail, Hourglass, User, ImageUp, Trash2, Crop } from 'lucide-react';
import Link from 'next/link';
import Cropper, { type Area } from 'react-easy-crop';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  photoURL: z.string().optional().or(z.literal('')),
  email: z.string().email(),
  gender: z.enum(["Not Specified", "Male", "Female", "Other"]),
  ageRange: z.enum(["Prefer not to say", "18-24", "25-34", "35-44", "45-54", "55+"]),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg'); 
}


export default function EditProfilePage() {
  const { user, isAuthenticated, isLoadingAuth, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropperDialog, setShowCropperDialog] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      photoURL: '',
      email: '',
      gender: 'Not Specified',
      ageRange: 'Prefer not to say',
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
        });
        setImagePreview(user.photoURL || null);
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, router, form]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixelsVal: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsVal);
  }, []);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast({
          variant: "destructive",
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageSrc(reader.result as string);
        setShowCropperDialog(true);
        setZoom(1); 
        setCrop({ x: 0, y: 0 }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = async () => {
    if (!originalImageSrc || !croppedAreaPixels) {
      return;
    }
    try {
      const croppedImage = await getCroppedImg(originalImageSrc, croppedAreaPixels);
      if (croppedImage) {
        setImagePreview(croppedImage);
        form.setValue('photoURL', croppedImage, { shouldValidate: true });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Cropping Failed", description: "Could not process the image. Please try another one." });
    }
    setShowCropperDialog(false);
    setOriginalImageSrc(null); 
  };


  const handleRemoveImage = () => {
    setImagePreview(null);
    setOriginalImageSrc(null);
    form.setValue('photoURL', '', { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    const success = updateUser({ 
      name: data.name,
      photoURL: data.photoURL, 
      gender: data.gender,
      ageRange: data.ageRange,
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading...</p>
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
        <h1 className="text-3xl font-bold mt-2 text-foreground">Edit Profile</h1>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={imagePreview || undefined} alt={user.name || "User"} data-ai-hint="profile avatar" className="object-cover"/>
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
                  onChange={handleImageFileChange}
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

      {showCropperDialog && originalImageSrc && (
        <Dialog open={showCropperDialog} onOpenChange={(open) => {
          if (!open) { 
            setShowCropperDialog(false);
            setOriginalImageSrc(null); 
          } else {
            setShowCropperDialog(true);
          }
        }}>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-primary">Crop Your Photo</DialogTitle>
            </DialogHeader>
            <div className="relative h-[300px] md:h-[400px] w-full bg-muted">
              <Cropper
                image={originalImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1 / 1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoom-slider" className="text-foreground/80">Zoom</Label>
                <Slider
                  id="zoom-slider"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  className="[&>span:first-child]:h-2 [&>span:first-child>span]:bg-primary [&>button]:bg-background [&>button]:border-primary"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => {
                  setShowCropperDialog(false);
                  setOriginalImageSrc(null);
                  if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
                }}>
                  Cancel
                </Button>
                <Button onClick={handleApplyCrop}>
                  <Crop className="mr-2 h-4 w-4" /> Apply Crop
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    