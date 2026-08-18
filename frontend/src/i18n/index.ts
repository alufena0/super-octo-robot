import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';

const savedLang = localStorage.getItem('erp-lang') ?? 'pt-BR';

i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'pt-BR': { translation: ptBR },
  },
  lng: savedLang,
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
});

export default i18n;
