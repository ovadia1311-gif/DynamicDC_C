
// src/i18n/useTranslations.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Translations } from './translations';

export type Language = 'en' | 'he';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
  isRTL: boolean;
}

/**
 * Helper: detect initial language from browser.
 * Falls back to 'he' if the locale starts with 'he', otherwise 'en'.
 */
function detectInitialLanguage(): Language {
  if (typeof navigator !== 'undefined') {
    const n = navigator.language?.toLowerCase() || '';
    if (n.startsWith('he')) return 'he';
  }
  return 'en';
}

export const useTranslation = create<LanguageState>()(
  persist(
    (set, get) => {
      // Initial language based on browser (unless persisted value exists)
      const initialLang = detectInitialLanguage();
      const initialT = translations[initialLang];
      const initialRTL = initialLang === 'he';

      // Apply initial document direction & lang now (first load)
      if (typeof document !== 'undefined') {
        document.documentElement.dir = initialRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = initialLang;
      }

      return {
        language: initialLang,
        t: initialT,
        isRTL: initialRTL,

        setLanguage: (language: Language) => {
          set({
            language,
            t: translations[language],
            isRTL: language === 'he',
          });

          // Update <html> direction & lang for proper RTL/LTR layout
          if (typeof document !== 'undefined') {
            document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
            document.documentElement.lang = language;
          }
        },
      };
    },
    {
      name: 'language-storage',
      // When rehydrating from storage, re-apply document settings and ensure t/isRTL match the language
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const lang = state.language;
        const isRTL = lang === 'he';

        state.t = translations[lang];
        state.isRTL = isRTL;

        if (typeof document !== 'undefined') {
          document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
      },
    }
  )
);

// Optional: convenience hook alias (usage compatible with react-i18next naming)
export const useI18n = useTranslation
