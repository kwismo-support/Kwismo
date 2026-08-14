import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME } from '@/config/constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          QUERY_STALE_TIME,
      retry:              1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
