export type Locale = (typeof locales)[number];

export const locales = ['en', 'hi'] as const;
export const defaultLocale: Locale = 'en';

/** Cookie used to persist the user's locale (no URL prefix routing). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
