// apps/web/src/modules/servicios/hooks/use-create-parto.ts
/**
 * useCreateParto — mutation hook for creating a parto record.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { CreatePartoDto } from '../types/servicios.types';

export function useCreateParto() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: CreatePartoDto) => serviciosService.createParto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servicios.partos.all });
      router.push('/dashboard/servicios/partos');
    },
    onError: (error) => {
      console.error('Error creating parto:', error);
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
