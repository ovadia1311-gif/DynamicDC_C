
// src/App.tsx
import React from 'react';
import { ConfigProvider, theme } from 'antd';
import heIL from 'antd/lib/locale/he_IL';
import enUS from 'antd/lib/locale/en_US';
import { useTranslation } from './i18n/useTranslations';
import { AppRouter } from './router';

const App: React.FC = () => {
  const { isRTL } = useTranslation();
  // אם יש לך dark mode מה-store אחר—תחליף כאן.
  const isDarkMode = false;
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ConfigProvider
      direction={isRTL ? 'rtl' : 'ltr'}
      locale={isRTL ? heIL : enUS}
      theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}
    >
      <AppRouter />
    </ConfigProvider>
  );
};

export default App;
