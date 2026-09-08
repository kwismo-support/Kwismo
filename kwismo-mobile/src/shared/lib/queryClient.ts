export const queryClient = {
  fetchQuery: async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    return await fetcher();
  },
};
