import { createContext, useContext } from 'react';
import { en } from './en';
import { ko } from './ko';
import type { TranslationKey } from './en';

export type Locale = 'en' | 'ko';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ko };

export interface I18nContext {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

export const I18nCtx = createContext<I18nContext>({
  locale: 'en',
  t: (key) => en[key],
  setLocale: () => {},
});

export function useI18n(): I18nContext {
  return useContext(I18nCtx);
}

export function createI18n(locale: Locale, setLocale: (l: Locale) => void): I18nContext {
  const dict = dictionaries[locale];
  return {
    locale,
    t: (key: TranslationKey) => dict[key] ?? key,
    setLocale,
  };
}

export type { TranslationKey };
