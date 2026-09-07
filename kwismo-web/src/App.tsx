import { Providers } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { ToastContainer } from '@/shared/ui/toast';


export default function App() {
  return (
    <Providers>
      <AppRouter />
      <ToastContainer />
    </Providers>
  );
}
