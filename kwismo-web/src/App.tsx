import { Providers } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { ToastContainer } from '@/shared/ui/toast';

/**
 * Racine de l'application.
 * Providers (Query, Theme, i18n, Auth) + Router + ToastContainer.
 */
export default function App() {
  return (
    <Providers>
      <AppRouter />
      <ToastContainer />
    </Providers>
  );
}
