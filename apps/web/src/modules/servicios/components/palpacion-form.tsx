// apps/web/src/modules/servicios/components/palpacion-form.tsx
/**
 * PalpacionForm — form for palpación event (step 1 and step 3 of wizard).
 *
 * Step 1: Event data (predio, código, fecha, veterinario, observaciones)
 * Step 3: Results per animal (diagnóstico, condición corporal, días gestación, fecha parto)
 */

'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePredioStore } from '@/store/predio.store';
import { maestrosService } from '@/modules/maestros/services';
import { catalogoService } from '@/modules/configuracion/services';
import { palpacionEventoSchema, type PalpacionEventoFormValues } from '../schemas/palpacion.schema';
import { AnimalSelector } from './animal-selector';
import type { CreatePalpacionAnimalDto } from '../types/servicios.types';

// ============================================================================
// Step 1 — Event Form
// ============================================================================

export interface PalpacionEventoFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => PalpacionEventoFormValues;
}

interface PalpacionEventoFormProps {
  onSubmit: (data: PalpacionEventoFormValues) => void;
  formRef?: React.RefObject<PalpacionEventoFormRef | null>;
}

interface Veterinario {
  id: number;
  nombre: string;
}

export interface Diagnostico {
  id: number;
  nombre: string;
}

interface CondicionCorporal {
  id: number;
  nombre: string;
}

// Constant: diagnóstico "positiva" name match (not hardcoded ID)
export const DIAGNOSTICO_POSITIVA_KEYWORDS = ['positiva', 'positivo', 'preñada', 'prenada'];

export function isDiagnosticoPositiva(nombre: string): boolean {
  const lower = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return DIAGNOSTICO_POSITIVA_KEYWORDS.some(kw => lower.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
}

export const PalpacionEventoForm = forwardRef<PalpacionEventoFormRef, PalpacionEventoFormProps>(
  function PalpacionEventoForm({ onSubmit, formRef }: PalpacionEventoFormProps, ref): JSX.Element {
    const { predioActivo } = usePredioStore();
    const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
    const [isLoadingVets, setIsLoadingVets] = useState(true);
    const [errorVets, setErrorVets] = useState<string | null>(null);

    const form = useForm<PalpacionEventoFormValues>({
      resolver: zodResolver(palpacionEventoSchema),
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
        const data = await maestrosService.getAll('veterinarios');
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
          placeholder="Ej: PAL-2026-004"
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

      {/* predioId hidden */}
      <input type="hidden" {...register('predioId', { valueAsNumber: true })} />
    </form>
  );
  });

// ============================================================================
// Step 2 — Animal Selection (wrapper)
// ============================================================================

interface PalpacionAnimalesStepProps {
  predioId: number;
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function PalpacionAnimalesStep({ predioId, selected, onChange }: PalpacionAnimalesStepProps): JSX.Element {
  return <AnimalSelector predioId={predioId} selected={selected} onChange={onChange} />;
}

// ============================================================================
// Step 3 — Results per Animal
// ============================================================================

interface PalpacionResultadosStepProps {
  animalIds: number[];
  resultados: Record<number, CreatePalpacionAnimalDto>;
  onChange: (animalId: number, data: CreatePalpacionAnimalDto) => void;
}

export function PalpacionResultadosStep({ animalIds, resultados, onChange }: PalpacionResultadosStepProps): JSX.Element {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [condiciones, setCondiciones] = useState<CondicionCorporal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCatalogs() {
      try {
        setIsLoading(true);
        const [diagData, condData] = await Promise.all([
          maestrosService.getAll('diagnosticos'),
          catalogoService.getAll('condiciones-corporales'),
        ]);
        setDiagnosticos(diagData);
        setCondiciones(condData);
      } catch {
        setDiagnosticos([]);
        setCondiciones([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalogs();
  }, []);

  // Initialize defaults for new animals
  useEffect(() => {
    animalIds.forEach((id) => {
      if (!resultados[id]) {
        onChange(id, {
          animalesId: id,
          diagnosticosVeterinariosId: 0,
          configCondicionesCorporalesId: 0,
          diasGestacion: undefined,
          fechaParto: undefined,
          comentarios: '',
        });
      }
    });
  }, [animalIds, resultados, onChange]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Cargando catálogos...</p>;
  }

  return (
    <div className="space-y-6">
      {animalIds.map((animalId) => {
        const resultado = resultados[animalId] ?? {
          animalesId: animalId,
          diagnosticosVeterinariosId: 0,
          configCondicionesCorporalesId: 0,
        };
        // Check if diagnosis is positive by name, not hardcoded ID
        const diag = diagnosticos.find(d => d.id === resultado.diagnosticosVeterinariosId);
        const isPositivo = diag ? isDiagnosticoPositiva(diag.nombre) : false;

        return (
          <div
            key={animalId}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Animal #{animalId}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Diagnóstico */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Diagnóstico *
                </label>
                <select
                  value={resultado.diagnosticosVeterinariosId}
                  onChange={(e) =>
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      diagnosticosVeterinariosId: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value={0}>Seleccionar...</option>
                  {diagnosticos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condición Corporal */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Condición Corporal *
                </label>
                <select
                  value={resultado.configCondicionesCorporalesId}
                  onChange={(e) =>
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      configCondicionesCorporalesId: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value={0}>Seleccionar...</option>
                  {condiciones.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Días de Gestación — solo si positivo */}
              {isPositivo && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Días de Gestación
                  </label>
                  <input
                    type="number"
                    value={resultado.diasGestacion ?? ''}
                    onChange={(e) =>
                      onChange(animalId, {
                        ...resultado,
                        animalesId: animalId,
                        diasGestacion: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              )}

              {/* Fecha Parto Estimado — solo si positivo */}
              {isPositivo && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Fecha Parto Estimado
                  </label>
                  <input
                    type="date"
                    value={resultado.fechaParto ?? ''}
                    onChange={(e) =>
                      onChange(animalId, {
                        ...resultado,
                        animalesId: animalId,
                        fechaParto: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              )}

              {/* Comentarios */}
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Comentarios
                </label>
                <input
                  type="text"
                  value={resultado.comentarios ?? ''}
                  onChange={(e) =>
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      comentarios: e.target.value,
                    })
                  }
                  placeholder="Observaciones del animal..."
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
