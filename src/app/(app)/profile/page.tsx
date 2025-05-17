
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Hourglass, UserCog, BellRing, Languages, Palette, History, HelpCircle, FileText, ShieldCheck, LogOut, ChevronRight, Copy, KeyRound } from 'lucide-react'; // Changed Loader2 to Hourglass
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ProfileListItemProps {
  icon: React.ElementType;
  text: string;
  onClick?: () => void;
  href?: string;
  status?: string;
  isDestructive?: boolean;
}

const ProfileListItem: React.FC<ProfileListItemProps> = ({ icon: Icon, text, onClick, href, status, isDestructive }) => {
  const commonClasses = "flex items-center space-x-4 p-4 w-full text-left";
  const interactiveClasses = "hover:bg-muted/50 transition-colors rounded-md";

  const content = (
    <>
      <Icon className={`h-6 w-6 ${isDestructive ? 'text-destructive' : 'text-primary'}`} />
      <span className={`flex-1 text-sm font-medium ${isDestructive ? 'text-destructive' : 'text-foreground'}`}>{text}</span>
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
      {!status && (onClick || href) && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${commonClasses} ${interactiveClasses}`}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${commonClasses} ${interactiveClasses}`}>
        {content}
      </button>
    );
  }

  return (
    <div className={commonClasses}>
      {content}
    </div>
  );
};

export default function ProfilePage() {
  const { user, isAuthenticated, logout, isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isLoggingOut) {
      return;
    }
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router, isLoggingOut]);

  const handleLogout = () => { 
    setIsLoggingOut(true);
    logout();
    router.push('/login');
  };

  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({ title: "Referral Code Copied!", description: "Your referral code has been copied to the clipboard." });
    }
  };

  if (isLoggingOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Hourglass className="h-12 w-12 animate-spin text-primary mb-4" /> {/* Changed from Loader2 */}
        <p className="text-lg text-foreground">Logging out...</p>
      </div>
    );
  }

  if (isLoadingAuth || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Hourglass className="h-12 w-12 animate-spin text-primary mb-4" /> {/* Changed from Loader2 */}
        <p className="text-lg text-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="pb-8 max-w-2xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col items-center py-8 space-y-3">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="avatar person" />
          <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="flex items-center space-x-2 p-2 border border-dashed border-primary/50 rounded-md bg-muted/20 max-w-xs w-full">
          <span className="text-xs font-mono text-primary truncate flex-1 text-center">{user.referralCode}</span>
          <Button variant="ghost" size="icon" onClick={handleCopyReferralCode} className="text-primary hover:bg-primary/10 h-7 w-7">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-1">
        <ProfileListItem icon={UserCog} text="Edit Profile" href="/profile/edit" />
        <Separator />
        <ProfileListItem icon={KeyRound} text="Change Password" onClick={() => toast({ title: "Coming Soon", description: "Password change functionality will be available soon."})} />
        <Separator />
        <ProfileListItem icon={BellRing} text="Notification Settings" onClick={() => toast({ title: "Coming Soon", description: "Notification settings will be available soon."})} />
        <Separator />
        <ProfileListItem icon={Languages} text="App Language" onClick={() => toast({ title: "Coming Soon", description: "Language selection will be available soon."})} />
        <Separator />
        <ProfileListItem icon={Palette} text="Theme" status="Coming Soon" />
        <Separator />
        <ProfileListItem icon={History} text="Reward History" href="/wallet" />
        <Separator />
        <ProfileListItem icon={HelpCircle} text="Get Help" onClick={() => toast({ title: "Coming Soon", description: "Help & Support section will be available soon."})} />
        <Separator />
        <ProfileListItem icon={FileText} text="Terms and Conditions" onClick={() => toast({ title: "Coming Soon", description: "Terms & Conditions will be available soon."})} />
        <Separator />
        <ProfileListItem icon={ShieldCheck} text="Privacy Policy" onClick={() => toast({ title: "Coming Soon", description: "Privacy Policy will be available soon."})} />
        <Separator />
        <ProfileListItem icon={LogOut} text="Log Out" onClick={handleLogout} isDestructive />
      </div>
    </div>
  );
}
