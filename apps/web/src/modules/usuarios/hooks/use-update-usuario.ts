// apps/web/src/modules/usuarios/hooks/use-update-usuario.ts
/**
 * useUpdateUsuario — mutation hook for updating a usuario.
 *
 * @example
 * const { mutateAsync: updateUsuario, isPending } = useUpdateUsuario();
 * await updateUsuario({ id: 1, data: { nombre: 'Nuevo Nombre' } });
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { UpdateUsuarioDto } from '../types/usuarios.types';

export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsuarioDto }) =>
      usuariosService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.usuarios.detail(variables.id),
      });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
