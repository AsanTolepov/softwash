// src/lib/i18n.ts
import { uz } from '@/locales/uz';
import { ru } from '@/locales/ru';
import { en } from '@/locales/en';
import { useApp } from '@/contexts/AppContext';

export type Language = 'uz' | 'ru' | 'en';

const TRANSLATIONS: Record<Language, any> = {
  uz,
  ru,
  en,
};

function translate(path: string, lang: Language): string {
  const segments = path.split('.');
  let current: any = TRANSLATIONS[lang];

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === 'string') {
    return current;
  }

  // fallback: o'zbekcha
  if (lang !== 'uz') {
    return translate(path, 'uz');
  }

  // hech nima topilmasa, o'zini qaytaramiz
  return path;
}

/**
 * React komponentlarida ishlatish uchun hook
 */
export function useI18n() {
  const { settings } = useApp();
  const lang =
    (settings.language as Language) || 'uz';

  return {
    t: (path: string) => translate(path, lang),
    lang,
  };
}