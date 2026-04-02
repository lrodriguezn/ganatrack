// apps/web/src/modules/predios/components/lote-form.tsx
/**
 * LoteForm — RHF + Zod form for creating/editing lotes.
 *
 * Fields: nombre, descripcion, tipo
 *
 * Usage:
 *   <LoteForm onSubmit={handleSubmit} isLoading={isLoading} />
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  CreateLoteSchema,
  UpdateLoteSchema,
  type CreateLoteDto,
  type UpdateLoteDto,
  type LoteTipo,
} from '@ganatrack/shared-types';

type LoteFormData = CreateLoteDto | UpdateLoteDto;

interface LoteFormProps {
  initialData?: UpdateLoteDto | null;
  onSubmit: (data: LoteFormData) => void;
  isLoading?: boolean;
}

const TIPO_OPTIONS: { value: LoteTipo; label: string }[] = [
  { value: 'producción', label: 'Producción' },
  { value: 'levante', label: 'Levante' },
  { value: 'engorde', label: 'Engorde' },
  { value: 'cría', label: 'Cría' },
];

export function LoteForm({
  initialData,
  onSubmit,
  isLoading = false,
}: LoteFormProps): JSX.Element {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoteFormData>({
    resolver: zodResolver(isEdit ? UpdateLoteSchema : CreateLoteSchema),
    defaultValues: initialData ?? {
      nombre: '',
      descripcion: '',
      tipo: 'producción',
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
        tipo: 'producción',
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: LoteFormData) => {
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
        placeholder="Vacas en Producción"
        error={errors.nombre?.message}
        {...register('nombre')}
      />

      {/* Descripción */}
      <Textarea
        label="Descripción"
        placeholder="Grupo de vacas actuales en ordeño"
        rows={3}
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />

      {/* Tipo */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="tipo"
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Tipo
        </label>
        <select
          id="tipo"
          {...register('tipo')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-gray-100"
        >
          {TIPO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.tipo && (
          <span className="text-sm text-red-500 dark:text-red-400">
            {errors.tipo.message}
          </span>
        )}
      </div>

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
          {isEdit ? 'Guardar cambios' : 'Crear lote'}
        </Button>
      </div>
    </form>
  );
}
