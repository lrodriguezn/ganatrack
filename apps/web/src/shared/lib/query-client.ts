// apps/web/src/shared/lib/query-client.ts
/**
 * QueryClient — TanStack Query client singleton.
 *
 * StaleTime Configuration:
 * - List queries: 30 seconds (frequently changing data)
 * - Detail queries: 5 minutes (relatively stable)
 * - Catalog/static queries: Infinity (never auto-refetch)
 *
 * Retry Strategy:
 * - Queries: 3 retries
 * - Mutations: 0 retries (fail fast)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/reference/queryClient
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds — lists
      gcTime: 24 * 60 * 60 * 1000, // 24 hours — offline persistence
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Stale time constants by data category.
 */
export const StaleTimes = {
  /** List queries — 30 seconds */
  LIST: 30_000,
  /** Detail queries — 5 minutes */
  DETAIL: 5 * 60_000,
  /** Catalog/static data — never refetch unless invalidated */
  CATALOG: Infinity,
} as const;
