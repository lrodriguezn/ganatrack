// apps/web/src/modules/servicios/components/inseminacion-form.tsx
/**
 * InseminacionForm — form for inseminación event (step 1 and step 3 of wizard).
 *
 * Step 1: Event data (predio, código, fecha, veterinario, observaciones)
 * Step 3: Results per animal (fecha, toro, pajuela, dosis, observaciones)
 */

'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePredioStore } from '@/store/predio.store';
import { maestrosService } from '@/modules/maestros/services';
import { inseminacionEventoSchema, type InseminacionEventoFormValues } from '../schemas/inseminacion.schema';
import { AnimalSelector } from './animal-selector';
import type { CreateInseminacionAnimalDto } from '../types/servicios.types';

// ============================================================================
// Step 1 — Event Form
// ============================================================================

export interface InseminacionEventoFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => InseminacionEventoFormValues;
}

interface InseminacionEventoFormProps {
  onSubmit: (data: InseminacionEventoFormValues) => void;
  formRef?: React.RefObject<InseminacionEventoFormRef | null>;
}

interface Veterinario {
  id: number;
  nombre: string;
}

export const InseminacionEventoForm = forwardRef<InseminacionEventoFormRef, InseminacionEventoFormProps>(
  function InseminacionEventoForm({ onSubmit, formRef }: InseminacionEventoFormProps, ref): JSX.Element {
    const { predioActivo } = usePredioStore();
    const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
    const [isLoadingVets, setIsLoadingVets] = useState(true);
    const [errorVets, setErrorVets] = useState<string | null>(null);

    const form = useForm<InseminacionEventoFormValues>({
      resolver: zodResolver(inseminacionEventoSchema),
      defaultValues: {
        predioId: predioActivo?.id ?? 0,
        codigo: '',
        fecha: new Date().toISOString().split('T')[0],
        veterinariosId: 0,
        observaciones: '',
      },
    });

    const {
      register,
      handleSubmit,
      trigger,
      getValues,
      formState: { errors },
    } = form;

    // Expose trigger and getValues to parent (wizard)
    useImperativeHandle(ref, () => ({
      trigger: () => trigger(),
      getValues: () => getValues(),
    }));

  useEffect(() => {
    async function loadVeterinarios() {
      try {
        setIsLoadingVets(true);
        const { data } = await maestrosService.getAll('veterinarios');
        setVeterinarios(data);
      } catch (error) {
        setErrorVets(error instanceof Error ? error.message : 'Error al cargar veterinarios');
        setVeterinarios([]);
      } finally {
        setIsLoadingVets(false);
      }
    }
    loadVeterinarios();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Código */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Código del Evento *
        </label>
        <input
          {...register('codigo')}
          placeholder="Ej: INS-2026-004"
          className={`
            w-full rounded-md border px-3 py-2 text-sm
            ${errors.codigo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            dark:bg-gray-800 dark:text-gray-100
          `}
        />
        {errors.codigo && (
          <p className="mt-1 text-sm text-red-500">{errors.codigo.message}</p>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Fecha *
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

      {/* Veterinario */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Veterinario *
        </label>
        <select
          {...register('veterinariosId', { valueAsNumber: true })}
          className={`
            w-full rounded-md border px-3 py-2 text-sm
            ${errors.veterinariosId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            dark:bg-gray-800 dark:text-gray-100
          `}
        >
          <option value={0}>Seleccionar veterinario...</option>
          {isLoadingVets ? (
            <option disabled>Cargando...</option>
          ) : (
            veterinarios.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))
          )}
        </select>
        {errorVets && (
          <p className="mt-1 text-sm text-red-500">{errorVets}</p>
        )}
        {errors.veterinariosId && (
          <p className="mt-1 text-sm text-red-500">{errors.veterinariosId.message}</p>
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
          className="
            w-full rounded-md border border-gray-300 px-3 py-2 text-sm
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
          "
        />
      </div>

      <input type="hidden" {...register('predioId', { valueAsNumber: true })} />
    </form>
  );
  });

// ============================================================================
// Step 3 — Results per Animal
// ============================================================================

interface InseminacionResultadosStepProps {
  animalIds: number[];
  resultados: Record<number, CreateInseminacionAnimalDto>;
  onChange: (animalId: number, data: CreateInseminacionAnimalDto) => void;
}

export function InseminacionResultadosStep({ animalIds, resultados, onChange }: InseminacionResultadosStepProps): JSX.Element {
  const today = new Date().toISOString().split('T')[0]!;

  // Initialize defaults for new animals
  useEffect(() => {
    animalIds.forEach((id) => {
      if (!resultados[id]) {
        onChange(id, {
          animalesId: id,
          fecha: today,
          toro: '',
          pajuela: '',
          dosis: undefined,
          observaciones: '',
        });
      }
    });
  }, [animalIds, resultados, onChange, today]);

  return (
    <div className="space-y-6">
      {animalIds.map((animalId) => {
        const resultado = resultados[animalId] ?? {
          animalesId: animalId,
          fecha: today,
          toro: '',
          pajuela: '',
          dosis: undefined,
          observaciones: '',
        } as CreateInseminacionAnimalDto;

        return (
          <div
            key={animalId}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Animal #{animalId}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={resultado.fecha}
                  onChange={(e) =>
                    onChange(animalId, { ...resultado, animalesId: animalId, fecha: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Toro */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Toro
                </label>
                <input
                  type="text"
                  value={resultado.toro ?? ''}
                  onChange={(e) =>
                    onChange(animalId, { ...resultado, animalesId: animalId, toro: e.target.value })
                  }
                  placeholder="Ej: GAN-001 (Don Toro)"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Pajuela */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Pajuela
                </label>
                <input
                  type="text"
                  value={resultado.pajuela ?? ''}
                  onChange={(e) =>
                    onChange(animalId, { ...resultado, animalesId: animalId, pajuela: e.target.value })
                  }
                  placeholder="Código de pajuela"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Dosis */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Dosis
                </label>
                <input
                  type="number"
                  value={resultado.dosis ?? ''}
                  onChange={(e) =>
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      dosis: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Observaciones */}
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Observaciones
                </label>
                <input
                  type="text"
                  value={resultado.observaciones ?? ''}
                  onChange={(e) =>
                    onChange(animalId, { ...resultado, animalesId: animalId, observaciones: e.target.value })
                  }
                  placeholder="Observaciones..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
