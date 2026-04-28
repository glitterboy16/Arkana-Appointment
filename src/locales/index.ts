import enJson from './en.json';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';

const en = {
  ...enJson,
  languages: {
    ...enJson.languages,
    fr: 'French',
  },
} as const;

export const defaultNS = 'translation';
export const resources = {
  es: { translation: es },
  en: { translation: en },
  ja: { translation: ja },
  fr: { translation: fr },
} as const;
