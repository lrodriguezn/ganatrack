// apps/web/src/modules/servicios/hooks/use-create-inseminacion.ts
/**
 * useCreateInseminacion — mutation hook for creating an inseminación event.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { CreateInseminacionEventoDto } from '../types/servicios.types';

export function useCreateInseminacion() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: CreateInseminacionEventoDto) => serviciosService.createInseminacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servicios.inseminaciones.all });
      router.push('/dashboard/servicios/inseminaciones');
    },
    onError: (error) => {
      console.error('Error creating inseminacion:', error);
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
