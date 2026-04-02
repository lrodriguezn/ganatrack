// apps/web/src/modules/predios/components/grupo-form.tsx
/**
 * GrupoForm — RHF + Zod form for creating/editing grupos.
 *
 * Fields: nombre, descripcion
 *
 * Usage:
 *   <GrupoForm onSubmit={handleSubmit} isLoading={isLoading} />
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  CreateGrupoSchema,
  UpdateGrupoSchema,
  type CreateGrupoDto,
  type UpdateGrupoDto,
} from '@ganatrack/shared-types';

type GrupoFormData = CreateGrupoDto | UpdateGrupoDto;

interface GrupoFormProps {
  initialData?: UpdateGrupoDto | null;
  onSubmit: (data: GrupoFormData) => void;
  isLoading?: boolean;
}

export function GrupoForm({
  initialData,
  onSubmit,
  isLoading = false,
}: GrupoFormProps): JSX.Element {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GrupoFormData>({
    resolver: zodResolver(isEdit ? UpdateGrupoSchema : CreateGrupoSchema),
    defaultValues: initialData ?? {
      nombre: '',
      descripcion: '',
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        nombre: '',
        descripcion: '',
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: GrupoFormData) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4"
    >
      {/* Nombre */}
      <Input
        label="Nombre"
        placeholder="Vacas VIP"
        error={errors.nombre?.message}
        {...register('nombre')}
      />

      {/* Descripción */}
      <Textarea
        label="Descripción"
        placeholder="Mejores productoras del hato"
        rows={3}
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />

      {/* Submit button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => reset()}
          disabled={isLoading}
        >
          Limpiar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Guardar cambios' : 'Crear grupo'}
        </Button>
      </div>
    </form>
  );
}
