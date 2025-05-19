
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Hourglass, Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getTranslation } from '@/lib/translations'; // Import translation helper

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  country: string;
  flag: string; // Emoji flag
}

const languages: LanguageOption[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', country: 'United States', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', country: 'Spain', flag: '🇪🇸' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', country: 'China', flag: '🇨🇳' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', country: 'France', flag: '🇫🇷' },
  { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', country: 'Portugal', flag: '🇵🇹' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', country: 'Indonesia', flag: '🇮🇩' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', country: 'Japan', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', country: 'South Korea', flag: '🇰🇷' },
];

export default function AppLanguagePage() {
  const { user, isAuthenticated, isLoadingAuth, updateUser } = useAuth();
  const router = useRouter();

  // Local state to manage the selected language, initialized from user or default
  // Ensure user is not null before accessing user.appLanguage
  const [selectedLanguage, setSelectedLanguage] = useState(user?.appLanguage || 'en-US');

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else {
        // Sync local state if context changes or user data becomes available
        if (user.appLanguage && user.appLanguage !== selectedLanguage) {
          setSelectedLanguage(user.appLanguage);
        }
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, router, selectedLanguage]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    if (user) {
      updateUser({ appLanguage: languageCode });
      // The app will re-render due to context update, and translated text will be used
    }
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Loading...</p>
      </div>
    );
  }

  const suggestedLanguage = languages.find(lang => lang.code === 'en-US');
  const otherLanguages = languages.filter(lang => lang.code !== 'en-US');

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center">
        <Link href="/profile" className="text-primary hover:underline p-2 -ml-2 rounded-full hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground ml-2">
          {getTranslation(user.appLanguage, 'languageSettingsTitle')}
        </h1>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Suggested</h2>
          {suggestedLanguage && (
            <LanguageItem
              language={suggestedLanguage}
              isSelected={selectedLanguage === suggestedLanguage.code}
              onSelect={handleLanguageSelect}
            />
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Others</h2>
          <div className="space-y-2">
            {otherLanguages.map((lang) => (
              <LanguageItem
                key={lang.code}
                language={lang}
                isSelected={selectedLanguage === lang.code}
                onSelect={handleLanguageSelect}
              />
            ))}
          </div>
        </section>
        <p className="text-xs text-muted-foreground text-center mt-4">
            Note: This demonstrates language preference saving. Full app translation is not yet implemented.
        </p>
      </div>
    </div>
  );
}

interface LanguageItemProps {
  language: LanguageOption;
  isSelected: boolean;
  onSelect: (code: string) => void;
}

const LanguageItem: React.FC<LanguageItemProps> = ({ language, isSelected, onSelect }) => {
  return (
    <Card
      onClick={() => onSelect(language.code)}
      className={cn(
        "cursor-pointer transition-all",
        isSelected
          ? "bg-primary text-primary-foreground shadow-lg border-primary/50 ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "bg-card hover:bg-muted/50 border-border"
      )}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{language.flag}</span>
          <div>
            <p className="font-semibold">
              {language.name} <span className={cn("text-sm", isSelected ? "opacity-80" : "text-muted-foreground")}>({language.nativeName})</span>
            </p>
            <p className={cn("text-xs", isSelected ? "opacity-70" : "text-muted-foreground")}>{language.country}</p>
          </div>
        </div>
        {isSelected && <Check className="h-6 w-6" />}
      </CardContent>
    </Card>
  );
};
