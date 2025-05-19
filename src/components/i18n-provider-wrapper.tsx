
"use client";

import React, { useEffect, type ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n'; 
import { useAuth } from '@/context/auth-context';

interface I18nProviderWrapperProps {
  children: ReactNode;
}

export function I18nProviderWrapper({ children }: I18nProviderWrapperProps) {
  const { appLanguage } = useAuth();
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    if (i18nInstance.language !== appLanguage) {
      i18nInstance.changeLanguage(appLanguage);
    }
  }, [appLanguage, i18nInstance]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
