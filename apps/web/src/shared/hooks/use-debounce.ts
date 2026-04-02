// apps/web/src/shared/hooks/use-debounce.ts
/**
 * useDebounce — Debounces a value by the specified delay.
 *
 * Delays updating the returned value until after the specified delay
 * since the last change to the input value. Useful for search inputs
 * to avoid triggering too many requests.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns The debounced value
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * // debouncedSearch only updates after 300ms of no typing
 */
'use client';

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
