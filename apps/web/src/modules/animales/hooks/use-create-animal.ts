// apps/web/src/modules/animales/hooks/use-create-animal.ts
/**
 * useCreateAnimal — mutation hook for creating an animal.
 *
 * @example
 * const { mutateAsync: createAnimal, isPending } = useCreateAnimal();
 * await createAnimal(data);
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { CreateAnimalDto } from '../types/animal.types';

export function useCreateAnimal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateAnimalDto) => animalService.create(data),
    onSuccess: () => {
      // Invalidate all animal lists
      queryClient.invalidateQueries({ queryKey: queryKeys.animales.all });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}