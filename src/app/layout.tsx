
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants';
import { I18nProviderWrapper } from '@/components/i18n-provider-wrapper';
// import "@/lib/i18n"; // Initialize i18next - THIS LINE IS REMOVED

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `${APP_NAME} - Earn Rewards`,
  description: `Watch ads, refer friends, and earn rewards with ${APP_NAME}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <AuthProvider>
          <I18nProviderWrapper>
            {children}
            <Toaster />
          </I18nProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
