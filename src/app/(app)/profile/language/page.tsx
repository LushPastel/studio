
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, ChevronLeft, Hourglass } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LanguageOption {
  code: string;
  nameKey: string; // Key for translation file
  nativeName: string;
  countryKey: string; // Key for translation file
  flagEmoji: string;
}

const supportedLanguages: LanguageOption[] = [
  { code: 'en-US', nameKey: 'language_english_us', nativeName: 'English', countryKey: 'country_us', flagEmoji: '🇺🇸' },
  { code: 'es-ES', nameKey: 'language_spanish_es', nativeName: 'Español', countryKey: 'country_es', flagEmoji: '🇪🇸' },
  { code: 'zh-CN', nameKey: 'language_chinese_cn', nativeName: '中文 (简体)', countryKey: 'country_cn', flagEmoji: '🇨🇳' },
  { code: 'hi-IN', nameKey: 'language_hindi_in', nativeName: 'हिन्दी', countryKey: 'country_in', flagEmoji: '🇮🇳' },
  { code: 'ar-SA', nameKey: 'language_arabic_sa', nativeName: 'العربية', countryKey: 'country_sa', flagEmoji: '🇸🇦' },
];

export default function AppLanguagePage() {
  const { user, isAuthenticated, isLoadingAuth, appLanguage, setAppLanguage } = useAuth();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  const handleLanguageSelect = (languageCode: string) => {
    setAppLanguage(languageCode);
    i18n.changeLanguage(languageCode); // Ensure i18next instance also changes
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Loading...</p>
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
        <h1 className="text-3xl font-bold mt-2 text-foreground">{t('language_settings_title')}</h1>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardContent className="pt-6 space-y-2">
          {supportedLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-3 px-4 rounded-md transition-all duration-150 ease-in-out",
                appLanguage === lang.code
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted/50"
              )}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              <span className="text-2xl mr-4">{lang.flagEmoji}</span>
              <div className="flex-1 text-left">
                <p className="font-semibold">{t(lang.nameKey)}</p>
                <p className="text-xs opacity-80">{lang.nativeName} - {t(lang.countryKey)}</p>
              </div>
              {appLanguage === lang.code && <Check className="h-5 w-5 text-primary-foreground" />}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
