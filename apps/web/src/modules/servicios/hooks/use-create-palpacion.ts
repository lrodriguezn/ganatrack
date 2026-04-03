// apps/web/src/modules/servicios/hooks/use-create-palpacion.ts
/**
 * useCreatePalpacion — mutation hook for creating a palpación event.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { CreatePalpacionEventoDto } from '../types/servicios.types';

export function useCreatePalpacion() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: CreatePalpacionEventoDto) => serviciosService.createPalpacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servicios.palpaciones.all });
      router.push('/dashboard/servicios/palpaciones');
    },
    onError: (error) => {
      console.error('Error creating palpacion:', error);
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
