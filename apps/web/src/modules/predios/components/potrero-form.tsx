// apps/web/src/modules/predios/components/potrero-form.tsx
/**
 * PotreroForm — RHF + Zod form for creating/editing potreros.
 *
 * Fields: nombre, hectares, tipoPasto, capacidadMaxima, estado
 *
 * Usage:
 *   <PotreroForm onSubmit={handleSubmit} isLoading={isLoading} />
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  CreatePotreroSchema,
  UpdatePotreroSchema,
  type CreatePotreroDto,
  type UpdatePotreroDto,
  type PotreroEstado,
} from '@ganatrack/shared-types';

type PotreroFormData = CreatePotreroDto | UpdatePotreroDto;

interface PotreroFormProps {
  initialData?: UpdatePotreroDto | null;
  onSubmit: (data: PotreroFormData) => void;
  isLoading?: boolean;
}

const ESTADO_OPTIONS: { value: PotreroEstado; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'en_descanso', label: 'En descanso' },
];

export function PotreroForm({
  initialData,
  onSubmit,
  isLoading = false,
}: PotreroFormProps): JSX.Element {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PotreroFormData>({
    resolver: zodResolver(isEdit ? UpdatePotreroSchema : CreatePotreroSchema),
    defaultValues: initialData ?? {
      nombre: '',
      hectares: undefined,
      tipoPasto: '',
      capacidadMaxima: undefined,
      estado: 'activo',
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        nombre: '',
        hectares: undefined,
        tipoPasto: '',
        capacidadMaxima: undefined,
        estado: 'activo',
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: PotreroFormData) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4"
    >
      {/* Código */}
      {!isEdit && (
        <Input
          label="Código"
          placeholder="PE-01"
          error={errors.codigo?.message}
          {...register('codigo')}
        />
      )}

      {/* Nombre */}
      <Input
        label="Nombre"
        placeholder="Potrero Norte"
        error={errors.nombre?.message}
        {...register('nombre')}
      />

      {/* Hectáreas */}
      <Input
        label="Hectáreas"
        type="number"
        placeholder="25.0"
        step="0.1"
        min="0"
        error={errors.hectares?.message}
        {...register('hectares', { valueAsNumber: true })}
      />

      {/* Tipo Pasto */}
      <Input
        label="Tipo de Pasto"
        placeholder="Brachiaria Decumbens"
        error={errors.tipoPasto?.message}
        {...register('tipoPasto')}
      />

      {/* Capacidad Máxima */}
      <Input
        label="Capacidad (animales)"
        type="number"
        placeholder="50"
        min="0"
        error={errors.capacidadMaxima?.message}
        {...register('capacidadMaxima', { valueAsNumber: true })}
      />

      {/* Estado */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="estado"
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Estado
        </label>
        <select
          id="estado"
          {...register('estado')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-gray-100"
        >
          {ESTADO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.estado && (
          <span className="text-sm text-red-500 dark:text-red-400">
            {errors.estado.message}
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
          {isEdit ? 'Guardar cambios' : 'Crear potrero'}
        </Button>
      </div>
    </form>
  );
}
