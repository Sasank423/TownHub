import React, { createContext, useContext, useState, useEffect } from 'react';

// Import all translations
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import zhTranslations from './locales/zh.json';

// Define supported languages
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh';

// Translation map
const translations: Record<SupportedLanguage, Record<string, any>> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  zh: zhTranslations
};

// Auth pages that should always be in English
const ALWAYS_ENGLISH_PATHS = ['/login', '/signup', '/forgot-password'];

// i18n context type
interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultValue?: string) => string;
  isAuthPage: boolean;
}

// Create the context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    // Get from localStorage, default to English
    const savedLang = localStorage.getItem('library-language');
    return (savedLang as SupportedLanguage) || 'en';
  });
  
  const [isAuthPage, setIsAuthPage] = useState(false);
  
  useEffect(() => {
    // Set language attribute on html element
    document.documentElement.setAttribute('lang', language);
    
    // Check if current path is an auth page
    const checkIfAuthPage = () => {
      const path = window.location.pathname;
      const isAuth = ALWAYS_ENGLISH_PATHS.some(authPath => path.startsWith(authPath));
      setIsAuthPage(isAuth);
    };
    
    // Initial check
    checkIfAuthPage();
    
    // Listen for route changes
    const handleRouteChange = () => {
      checkIfAuthPage();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [language]);
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('library-language', language);
  }, [language]);
  
  // Translation function
  const t = (key: string, defaultValue?: string): string => {
    // Always use English for auth pages
    const currentLang = isAuthPage ? 'en' : language;
    
    try {
      // Split the key by dots (e.g., 'navbar.home' => ['navbar', 'home'])
      const keys = key.split('.');
      let result: any = translations[currentLang];
      
      // Navigate through the nested objects
      for (const k of keys) {
        if (result && result[k] !== undefined) {
          result = result[k];
        } else {
          // Key not found, return default value or key itself
          return defaultValue || key;
        }
      }
      
      // Return the translation if it's a string
      return typeof result === 'string' ? result : defaultValue || key;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return defaultValue || key;
    }
  };
  
  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isAuthPage }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use translations
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
