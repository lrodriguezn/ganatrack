// apps/web/src/modules/servicios/hooks/use-create-servicio-veterinario.ts
/**
 * useCreateServicioVeterinario — mutation hook for creating a servicio veterinario event.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { toast } from '@/shared/components/feedback';
import type { CreateServicioVeterinarioEventoDto } from '../types/servicios.types';

export function useCreateServicioVeterinario() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: CreateServicioVeterinarioEventoDto) => serviciosService.createServicioVeterinario(data),
    onSuccess: (data) => {
      // Verificar si el response body indica errores (200 OK con errores de validación)
      // El backend puede retornar { success: false, message: string, errors?: ... }
      const response = data as unknown as Record<string, unknown> | undefined;
      if (response && response.success === false) {
        const message = typeof response.message === 'string' ? response.message : 'Errores de validación';
        toast.error('Error al crear servicio veterinario', message);
        return;
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.servicios.veterinarios.all });
      router.push('/dashboard/servicios/veterinarios');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al crear servicio veterinario', message);
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
