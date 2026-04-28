import type { TFunction } from 'i18next';

const localeMap: Record<string, string> = {
  es: 'es-ES',
  en: 'en-US',
  ja: 'ja-JP',
  fr: 'fr-FR',
};

const typeKeyMap: Record<string, 'products.types.book' | 'products.types.game'> = {
  libro: 'products.types.book',
  videojuego: 'products.types.game',
};

const roleKeyMap: Record<string, 'admin.roles.user' | 'admin.roles.admin'> = {
  user: 'admin.roles.user',
  admin: 'admin.roles.admin',
};

export const getLocaleTag = (language?: string) => {
  const normalized = language?.split('-')[0] ?? 'es';
  return localeMap[normalized] ?? 'es-ES';
};

export const translateProductType = (value: string | null | undefined, t: TFunction) => {
  if (!value) return t('common.notAvailable');
  const key = typeKeyMap[value.toLowerCase()];
  return key ? t(key) : value;
};

export const translateUserRole = (value: string | null | undefined, t: TFunction) => {
  if (!value) return t('admin.roles.user');
  const key = roleKeyMap[value.toLowerCase()];
  return key ? t(key) : value;
};
