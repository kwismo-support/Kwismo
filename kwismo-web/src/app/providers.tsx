import { type ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { queryClient } from '@/shared/lib/queryClient';
import { i18n } from '@/shared/lib/i18n';
import { useThemeStore } from '@/shared/store/themeStore';

interface ProvidersProps {
  children: ReactNode;
}

/** Applique la classe `.dark` sur <html> en réaction au store de thème. */
function ThemeApplier() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return null;
}

/**
 * Composition de tous les providers globaux :
 *  - BrowserRouter (React Router)
 *  - QueryClientProvider (TanStack Query)
 *  - I18nextProvider (i18next)
 *  - ThemeApplier (classe .dark sur <html>)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeApplier />
          {children}
        </I18nextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  );
}
