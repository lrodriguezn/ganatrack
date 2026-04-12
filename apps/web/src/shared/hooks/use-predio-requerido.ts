'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePredioStore, selectPredioActivo, selectIsLoading } from '@/store/predio.store';
import type { Predio } from '@ganatrack/shared-types';

interface IUsePredioRequeridoResult {
  predioActivo: Predio | null;
  isLoading: boolean;
}

export function usePredioRequerido(): IUsePredioRequeridoResult {
  const router = useRouter();
  const predioActivo = usePredioStore(selectPredioActivo);
  const isLoading = usePredioStore(selectIsLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!predioActivo) {
      router.replace('/dashboard/predios');
    }
  }, [isLoading, predioActivo, router]);

  return { predioActivo, isLoading };
}
