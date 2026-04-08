// apps/web/src/modules/predios/components/predio-form.tsx
/**
 * PredioForm — RHF + Zod form for creating and editing Predios.
 *
 * Fields:
 * - codigo (required, max 20 chars)
 * - nombre (required, max 100 chars)
 * - departamento (required)
 * - municipio (required)
 * - vereda (optional)
 * - hectáreas (required, positive number)
 * - tipo (required, enum: lechería/cría/doble propósito/engorde)
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

const TIPO_OPTIONS = [
  { value: 'lechería', label: 'Lechería' },
  { value: 'cría', label: 'Cría' },
  { value: 'doble propósito', label: 'Doble Propósito' },
  { value: 'engorde', label: 'Engorde' },
] as const;

export function PredioForm({
  form,
  onSubmit,
  isLoading = false,
  submitLabel = 'Guardar',
}: PredioFormProps): JSX.Element {
  const {
    register,
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

      {/* Tipo */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="tipo"
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Tipo de Predio
        </label>
        <select
          id="tipo"
          {...register('tipo')}
          disabled={isLoading}
          className="
            w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <option value="">Seleccionar tipo...</option>
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.tipo && (
          <span className="text-sm text-red-500 dark:text-red-400" role="alert">
            {errors.tipo.message}
          </span>
        )}
      </div>

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
    departamento: predio.departamento,
    municipio: predio.municipio,
    vereda: predio.vereda,
    areaHectareas: predio.areaHectareas,
    tipo: predio.tipo,
  };
}
