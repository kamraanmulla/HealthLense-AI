import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds fresh window (avoids stale 5-minute freeze)
      gcTime: 10 * 60 * 1000, // 10 minutes cache garbage collection
    },
  },
});

/**
 * Invalidate all health and report-related queries after a report upload, deletion, or update.
 */
export async function invalidateHealthQueries() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['reports'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['insights'] }),
    queryClient.invalidateQueries({ queryKey: ['reports-for-assistant'] }),
  ]);
}
