// apps/web/src/shared/hooks/use-url-state.ts
/**
 * useUrlState — Syncs a state value with URL search params (query string).
 *
 * Reads initial value from the URL, and updates the URL when state changes.
 * Supports string, number, boolean, and string[] types via type parameter.
 * Uses Next.js useRouter + useSearchParams for client-side navigation.
 *
 * @param key - The URL search param key
 * @param options - Configuration (default value, serializer)
 * @returns [value, setValue] tuple (like useState)
 *
 * @example
 * const [search, setSearch] = useUrlState('q', { defaultValue: '' });
 * const [page, setPage] = useUrlState('page', { defaultValue: 1, parse: Number });
 * const [status, setStatus] = useUrlState<string[]>('status', { defaultValue: [] });
 */
'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface UseUrlStateOptions<T> {
  defaultValue: T;
  parse?: (value: string) => T;
  serialize?: (value: T) => string;
}

function defaultSerialize(value: unknown): string {
  if (Array.isArray(value)) return value.join(',');
  return String(value);
}

function defaultParse<T>(value: string, defaultValue: T): T {
  if (typeof defaultValue === 'number') return Number(value) as T;
  if (typeof defaultValue === 'boolean') return (value === 'true') as T;
  if (Array.isArray(defaultValue)) return (value ? value.split(',') : []) as T;
  return value as T;
}

/**
 * Checks if two values are equal, handling arrays by shallow comparison.
 */
function isEqual<T>(a: T, b: T): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index]);
  }
  return a === b;
}

export function useUrlState<T extends string | number | boolean | string[]>(
  key: string,
  options: UseUrlStateOptions<T>,
): [T, (value: T) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { defaultValue, parse, serialize = defaultSerialize } = options;

  const searchParamsStr = searchParams.toString();

  const value = useMemo((): T => {
    const raw = searchParams.get(key);
    if (raw === null) return defaultValue;
    const parser = parse ?? ((v: string) => defaultParse<T>(v, defaultValue));
    return parser(raw);
  }, [searchParamsStr, key, defaultValue, parse]);

  const setValue = useCallback((newValue: T) => {
    const params = new URLSearchParams(searchParams.toString());

    if (isEqual(newValue, defaultValue)) {
      params.delete(key);
    } else {
      params.set(key, serialize(newValue));
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  }, [key, defaultValue, serialize, pathname, router]);

  return [value, setValue];
}
