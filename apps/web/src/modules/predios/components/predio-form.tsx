// apps/web/src/modules/predios/components/predio-form.tsx
/**
 * PredioForm — RHF + Zod form for creating and editing Predios.
 *
 * Fields:
 * - codigo (required, max 20 chars)
 * - nombre (required, max 100 chars)
 * - departamento (optional)
 * - municipio (optional)
 * - vereda (optional)
 * - hectáreas (optional, number)
 *
 * This component is purely presentational:
 * - Receives form instance and handlers via props
 * - Does NOT call any services directly
 *
 * Usage:
 *   <PredioForm
 *     form={form}
 *     onSubmit={handleSubmit}
 *     isLoading={isLoading}
 *   />
 *
 * For create: pass default values or empty
 * For edit: pass existing Predio data as defaultValues to useForm
 */

'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { CreatePredioDto, Predio } from '@ganatrack/shared-types';
import { FormField } from '@/shared/components/ui/form-field';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface PredioFormProps {
  form: UseFormReturn<CreatePredioDto>;
  onSubmit: (data: CreatePredioDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PredioForm({
  form,
  onSubmit,
  isLoading = false,
  submitLabel = 'Guardar',
}: PredioFormProps): JSX.Element {
  const {
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
    >
      {/* Código */}
      <FormField
        name="codigo"
        label="Código del Predio"
        control={form.control}
        render={(fieldProps) => (
          <Input
            {...fieldProps}
            type="text"
            placeholder="FE001"
            error={errors.codigo?.message}
            disabled={isLoading}
            maxLength={20}
          />
        )}
      />

      {/* Nombre */}
      <FormField
        name="nombre"
        label="Nombre del Predio"
        control={form.control}
        render={(fieldProps) => (
          <Input
            {...fieldProps}
            type="text"
            placeholder="Finca La Esperanza"
            error={errors.nombre?.message}
            disabled={isLoading}
            maxLength={100}
          />
        )}
      />

      {/* Departamento */}
      <FormField
        name="departamento"
        label="Departamento"
        control={form.control}
        render={(fieldProps) => (
          <Input
            {...fieldProps}
            type="text"
            placeholder="Antioquia"
            error={errors.departamento?.message}
            disabled={isLoading}
          />
        )}
      />

      {/* Municipio */}
      <FormField
        name="municipio"
        label="Municipio"
        control={form.control}
        render={(fieldProps) => (
          <Input
            {...fieldProps}
            type="text"
            placeholder="Rionegro"
            error={errors.municipio?.message}
            disabled={isLoading}
          />
        )}
      />

      {/* Vereda (optional) */}
      <FormField
        name="vereda"
        label="Vereda (opcional)"
        control={form.control}
        render={(fieldProps) => (
          <Input
            {...fieldProps}
            type="text"
            placeholder="La Palma"
            error={errors.vereda?.message}
            disabled={isLoading}
          />
        )}
      />

      {/* Hectáreas */}
      <FormField
        name="areaHectareas"
        label="Hectáreas"
        control={form.control}
        render={(fieldProps) => (
          <Input
            {...fieldProps}
            type="number"
            placeholder="50"
            min={0}
            step={0.01}
            error={errors.areaHectareas?.message}
            disabled={isLoading}
            onChange={(e) => {
              const value = e.target.value;
              fieldProps.onChange(value === '' ? undefined : parseFloat(value));
            }}
          />
        )}
      />

      {/* Submit button */}
      <div className="flex items-center justify-end gap-2 pt-4">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Helper to prepare form default values from an existing Predio.
 */
export function predioToFormDefaults(predio: Predio): Partial<CreatePredioDto> {
  return {
    codigo: predio.codigo,
    nombre: predio.nombre,
    departamento: predio.departamento ?? undefined,
    municipio: predio.municipio ?? undefined,
    vereda: predio.vereda ?? undefined,
    areaHectareas: predio.areaHectareas ?? undefined,
  };
}
