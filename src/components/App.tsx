import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { useState } from 'react';

import { routes } from '@/navigation/routes.tsx';
import { UserProvider } from '@/context/UserContext';

import { createContext, Dispatch, SetStateAction } from 'react';

type SupportedLanguage = 'ru' | 'de';

type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: Dispatch<SetStateAction<SupportedLanguage>>;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'de', // значение по умолчанию
  setLanguage: () => {}, // заглушка для функции
});

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const [language, setLanguage] = useState<SupportedLanguage>('de');

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <UserProvider>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        <HashRouter>
          <Routes>
            {routes.map((route) => <Route key={route.path} {...route} />)}
            <Route path="*" element={<Navigate to="/"/>}/>
          </Routes>
        </HashRouter>
        </LanguageContext.Provider>
      </UserProvider>
    </AppRoot>
  );
}
