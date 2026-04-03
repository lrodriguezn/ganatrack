// apps/web/src/modules/servicios/components/parto-form.tsx
/**
 * PartoForm — simple form for registering a parto (NO wizard).
 *
 * Fields: animal (hembras gestantes), fecha, machos, hembras, muertos, tipo parto, observaciones
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePredioStore } from '@/store/predio.store';
import { useAnimales } from '@/modules/animales';
import { partoSchema, TIPO_PARTO_OPTIONS, type PartoFormValues } from '../schemas/parto.schema';
import type { CreatePartoDto } from '../types/servicios.types';

interface PartoFormProps {
  onSubmit: (data: CreatePartoDto) => void | Promise<void>;
  isLoading?: boolean;
}

export function PartoForm({ onSubmit, isLoading }: PartoFormProps): JSX.Element {
  const { predioActivo } = usePredioStore();

  const { data: animalesData } = useAnimales({
    predioId: predioActivo?.id ?? 0,
    page: 1,
    limit: 100,
    sexoKey: 1, // Solo hembras
    estadoAnimalKey: 0, // Solo activas
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PartoFormValues>({
    resolver: zodResolver(partoSchema),
    defaultValues: {
      predioId: predioActivo?.id ?? 0,
      animalesId: 0,
      fecha: new Date().toISOString().split('T')[0],
      machos: 0,
      hembras: 0,
      muertos: 0,
      tipoParto: 'Normal',
      observaciones: '',
    },
  });

  const machos = watch('machos');
  const hembras = watch('hembras');
  const muertos = watch('muertos');
  const totalCrias = machos + hembras + muertos;

  const hembrasActivas = animalesData?.data ?? [];

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
      <div className="mx-auto max-w-2xl">
        {/* Animal */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Animal *
          </label>
          <select
            {...register('animalesId', { valueAsNumber: true })}
            className={`
              w-full rounded-md border px-3 py-2 text-sm
              ${errors.animalesId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              dark:bg-gray-800 dark:text-gray-100
            `}
          >
            <option value={0}>Seleccionar hembra...</option>
            {hembrasActivas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.codigo} {a.nombre ? `- ${a.nombre}` : ''}
              </option>
            ))}
          </select>
          {errors.animalesId && (
            <p className="mt-1 text-sm text-red-500">{errors.animalesId.message}</p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha del Parto *
          </label>
          <input
            type="date"
            {...register('fecha')}
            className={`
              w-full rounded-md border px-3 py-2 text-sm
              ${errors.fecha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              dark:bg-gray-800 dark:text-gray-100
            `}
          />
          {errors.fecha && (
            <p className="mt-1 text-sm text-red-500">{errors.fecha.message}</p>
          )}
        </div>

        {/* Crías */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Crías Nacidas
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Machos</label>
              <input
                type="number"
                {...register('machos', { valueAsNumber: true })}
                min={0}
                className={`
                  w-full rounded-md border px-3 py-2 text-sm
                  ${errors.machos ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  dark:bg-gray-800 dark:text-gray-100
                `}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Hembras</label>
              <input
                type="number"
                {...register('hembras', { valueAsNumber: true })}
                min={0}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Muertos</label>
              <input
                type="number"
                {...register('muertos', { valueAsNumber: true })}
                min={0}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
          {totalCrias > 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total: {totalCrias} cría(s)
            </p>
          )}
          {errors.machos && (
            <p className="mt-1 text-sm text-red-500">{errors.machos.message}</p>
          )}
        </div>

        {/* Tipo de Parto */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Parto *
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIPO_PARTO_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors
                  has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700
                  border-gray-300 text-gray-700 hover:bg-gray-50
                  dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700
                  dark:has-[:checked]:border-blue-400 dark:has-[:checked]:bg-blue-500/10 dark:has-[:checked]:text-blue-300
                `}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register('tipoParto')}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.tipoParto && (
            <p className="mt-1 text-sm text-red-500">{errors.tipoParto.message}</p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Observaciones
          </label>
          <textarea
            {...register('observaciones')}
            rows={3}
            placeholder="Notas adicionales..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Hidden predioId */}
        <input type="hidden" {...register('predioId', { valueAsNumber: true })} />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="
            rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white
            hover:bg-blue-700 disabled:opacity-50
            transition-colors
          "
        >
          {isLoading ? 'Guardando...' : 'Registrar Parto'}
        </button>
      </div>
    </form>
  );
}
