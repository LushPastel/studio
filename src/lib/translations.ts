// src/lib/translations.ts
export interface Translations {
  [key: string]: string;
}
export interface LocaleTranslations {
  [locale: string]: Translations;
}

export const translations: LocaleTranslations = {
  'en-US': {
    appName: 'CashQuery',
    navHome: 'Home',
    navWallet: 'Wallet',
    navReferrals: 'Referrals',
    navProfile: 'Profile',
    languageSettingsTitle: 'App Language',
    // Add other keys as needed
  },
  'es-ES': {
    appName: 'ConsultDinero', // Example Spanish name
    navHome: 'Inicio',
    navWallet: 'Cartera',
    navReferrals: 'Referidos',
    navProfile: 'Perfil',
    languageSettingsTitle: 'Idioma de la App',
    // Add other keys as needed
  },
  'zh-CN': {
    appName: '现金查询',
    navHome: '主页',
    navWallet: '钱包',
    navReferrals: '推荐',
    navProfile: '个人资料',
    languageSettingsTitle: '应用语言',
  },
  'fr-FR': {
    appName: 'RequêteDeCash',
    navHome: 'Accueil',
    navWallet: 'Portefeuille',
    navReferrals: 'Parrainages',
    navProfile: 'Profil',
    languageSettingsTitle: 'Langue de l\'application',
  },
  'pt-PT': {
    appName: 'ConsultaDeCaixa',
    navHome: 'Início',
    navWallet: 'Carteira',
    navReferrals: 'Referências',
    navProfile: 'Perfil',
    languageSettingsTitle: 'Idioma da Aplicação',
  },
  'id-ID': {
    appName: 'TanyaKas',
    navHome: 'Beranda',
    navWallet: 'Dompet',
    navReferrals: 'Referensi',
    navProfile: 'Profil',
    languageSettingsTitle: 'Bahasa Aplikasi',
  },
  'ja-JP': {
    appName: 'キャッシュクエリ',
    navHome: 'ホーム',
    navWallet: 'ウォレット',
    navReferrals: '紹介',
    navProfile: 'プロフィール',
    languageSettingsTitle: 'アプリ言語',
  },
  'ko-KR': {
    appName: '캐시쿼리',
    navHome: '홈',
    navWallet: '지갑',
    navReferrals: '추천',
    navProfile: '프로필',
    languageSettingsTitle: '앱 언어',
  }
  // Add other supported languages here
};

export const getTranslation = (locale: string | undefined, key: string): string => {
  const effectiveLocale = locale && translations[locale] ? locale : 'en-US';
  const lang = translations[effectiveLocale];
  return lang[key] || key; // Fallback to the key itself if not found in current or default lang
};
