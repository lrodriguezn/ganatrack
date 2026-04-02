// apps/web/src/shared/lib/query-keys.ts
/**
 * Query Keys Factory — Type-safe query key generation for TanStack Query.
 *
 * Provides centralized key management following TanStack Query best practices.
 * Each module gets its own key factory with list/detail granularity.
 *
 * Usage:
 *   const keys = createQueryKeys('animals');
 *   keys.list()           // ['animals', 'list']
 *   keys.list({ page: 1 }) // ['animals', 'list', { page: 1 }]
 *   keys.detail(123)       // ['animals', 'detail', 123]
 */

export type QueryKeys = {
  all: readonly string[];
  lists: () => readonly string[];
  list: (filters?: Record<string, unknown>) => readonly (string | Record<string, unknown>)[];
  details: () => readonly string[];
  detail: (id: string | number) => readonly (string | number)[];
};

export function createQueryKeys<T extends string>(module: T): QueryKeys {
  return {
    all: [module] as const,
    lists: () => [...module, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? ([module, 'list', filters] as const) : ([module, 'list'] as const),
    details: () => [...module, 'detail'] as const,
    detail: (id: string | number) => [...module, 'detail', id] as const,
  };
}

/**
 * Query key factories for all entities.
 */
export const queryKeys = {
  animales: createQueryKeys('animales'),
  sitios: createQueryKeys('sitios'),
  predios: {
    ...createQueryKeys('predios'),
    // Sub-recursos — nested under predioId
    potreros: (predioId: number) => ['predios', predioId, 'potreros'] as const,
    sectores: (predioId: number) => ['predios', predioId, 'sectores'] as const,
    lotes: (predioId: number) => ['predios', predioId, 'lotes'] as const,
    grupos: (predioId: number) => ['predios', predioId, 'grupos'] as const,
  },
} as const;
