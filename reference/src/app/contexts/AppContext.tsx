import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'he';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  isRTL: boolean;
  selectedWorkspace: string;
  setSelectedWorkspace: (workspace: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedWorkspace, setSelectedWorkspace] = useState('Acme Corp');
  const [dateRange, setDateRange] = useState('Last 30 days');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };

  const isRTL = language === 'he';

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        isRTL,
        selectedWorkspace,
        setSelectedWorkspace,
        dateRange,
        setDateRange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
