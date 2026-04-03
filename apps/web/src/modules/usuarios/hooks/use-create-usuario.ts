// apps/web/src/modules/usuarios/hooks/use-create-usuario.ts
/**
 * useCreateUsuario — mutation hook for creating a usuario.
 *
 * @example
 * const { mutateAsync: createUsuario, isPending } = useCreateUsuario();
 * await createUsuario(data);
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { CreateUsuarioDto } from '../types/usuarios.types';

export function useCreateUsuario() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateUsuarioDto) => usuariosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
