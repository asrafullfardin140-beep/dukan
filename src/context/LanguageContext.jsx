import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import bn from '../i18n/bn';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('hisabbook_lang') || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('hisabbook_lang', lang);
  }, [lang]);

  const t = (key, params = {}) => {
    const dict = lang === 'bn' ? bn : en;
    let str = dict[key] || en[key] || key;
    
    // Replace %{param} with values
    Object.keys(params).forEach(p => {
      str = str.replace(`%{${p}}`, params[p]);
    });
    
    return str;
  };

  // Convert English numbers to Bengali numerals
  const toBnNum = (str) => {
    if (lang !== 'bn' || !str) return str;
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/\d/g, x => bnNums[x]);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toBnNum }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
