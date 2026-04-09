import { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../utils/i18n/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'ar';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    
    root.setAttribute('dir', direction);
    root.setAttribute('lang', language);
    
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'ar' ? 'en' : 'ar');
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
