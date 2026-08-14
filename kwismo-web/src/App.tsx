import { Providers } from '@/app/providers';
import { AppRouter } from '@/app/router';

/**
 * Racine de l'application.
 * Providers (Query, Theme, i18n, Auth) + Router.
 */
export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
