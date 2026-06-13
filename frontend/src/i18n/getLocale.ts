'use server';

import { cookies } from 'next/headers';
import {
  LOCALE_COOKIE,
  Locale,
  defaultLocale,
  isLocale,
} from '@/i18n/config';

export async function getUserLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;

  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  if (!isLocale(locale)) {
    return;
  }

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
}
