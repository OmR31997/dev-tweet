import type en from '../messages/en.json';

type Messages = typeof en;

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages;
    Locale: (typeof import('./i18n/config').locales)[number];
  }
}
