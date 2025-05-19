
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // loads translations from your /public/locales path
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en-US', // default language
    debug: process.env.NODE_ENV === 'development', // enable debug messages in development
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // path to translation files
    },
    // detection: {
    //   order: ['localStorage', 'navigator'], // order of language detection
    //   caches: ['localStorage'], // cache user language preference
    //   lookupLocalStorage: 'appLanguage', // key in localStorage to find language
    // },
    react: {
      useSuspense: false, // Set to false if you don't want to use React Suspense
    },
    supportedLngs: ['en-US', 'es-ES', 'zh-CN', 'hi-IN', 'ar-SA'], // Add languages you support
  });

export default i18n;
