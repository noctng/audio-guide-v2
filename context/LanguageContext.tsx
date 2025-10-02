import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language, LanguageContextType } from '../types';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(() => {
    try {
        const storedLang = sessionStorage.getItem('selectedLanguage');
        return storedLang ? JSON.parse(storedLang) : null;
    } catch {
        return null;
    }
  });

  const selectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    sessionStorage.setItem('selectedLanguage', JSON.stringify(language));
  };

  const contextValue: LanguageContextType = {
    languages: availableLanguages,
    selectedLanguage,
    selectLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};