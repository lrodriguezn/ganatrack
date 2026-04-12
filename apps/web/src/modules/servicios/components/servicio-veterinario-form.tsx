// apps/web/src/modules/servicios/components/servicio-veterinario-form.tsx
/**
 * ServicioVeterinarioForm — form for veterinary service event (step 1 and step 3 of wizard).
 *
 * Step 1: Event data (código, fecha, veterinario, observaciones)
 * Step 2: Animal selection (via AnimalSelector wrapper)
 * Step 3: Results per animal (diagnóstico, medicamentos, dosis, próxima aplicación, observaciones)
 */

'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePredioStore } from '@/store/predio.store';
import { maestrosService } from '@/modules/maestros/services';
import { servicioVeterinarioEventoSchema, type ServicioVeterinarioEventoFormData } from '../schemas/servicio-veterinario.schema';
import { AnimalSelector } from './animal-selector';
import type { CreateServicioVeterinarioAnimalDto } from '../types/servicios.types';

// ============================================================================
// Step 1 — Event Form
// ============================================================================

export interface ServicioVeterinarioEventoFormRef {
  trigger: () => Promise<boolean>;
  getValues: () => ServicioVeterinarioEventoFormData;
}

interface ServicioVeterinarioEventoFormProps {
  onSubmit: (data: ServicioVeterinarioEventoFormData) => void;
  formRef?: React.RefObject<ServicioVeterinarioEventoFormRef | null>;
  initialData?: Partial<ServicioVeterinarioEventoFormData>;
}

interface Veterinario {
  id: number;
  nombre: string;
}

interface Diagnostico {
  id: number;
  nombre: string;
}

export const ServicioVeterinarioEventoForm = forwardRef<ServicioVeterinarioEventoFormRef, ServicioVeterinarioEventoFormProps>(
  function ServicioVeterinarioEventoForm({ onSubmit, formRef, initialData }: ServicioVeterinarioEventoFormProps, ref): JSX.Element {
    const { predioActivo } = usePredioStore();
    const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
    const [isLoadingVets, setIsLoadingVets] = useState(true);
    const [errorVets, setErrorVets] = useState<string | null>(null);

    // Parse fecha for defaultValues: schema uses z.coerce.date, so default should be a Date
    const defaultFecha = initialData?.fecha
      ? typeof initialData.fecha === 'string'
        ? new Date(initialData.fecha)
        : initialData.fecha
      : new Date();

    const form = useForm<ServicioVeterinarioEventoFormData>({
      resolver: zodResolver(servicioVeterinarioEventoSchema),
        defaultValues: {
          predioId: initialData?.predioId ?? (predioActivo?.id ?? undefined),
          codigo: initialData?.codigo ?? '',
          fecha: defaultFecha,
          veterinariosId: initialData?.veterinariosId ?? undefined,
          observaciones: initialData?.observaciones ?? '',
          animales: initialData?.animales ?? [],
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
            placeholder="Ej: VET-2026-001"
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
            {...register('fecha', {
              setValueAs: (v: string) => v ? new Date(v) : undefined,
            })}
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
            <option value="">Seleccionar veterinario...</option>
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

interface ServicioVeterinarioAnimalesStepProps {
  predioId: number;
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function ServicioVeterinarioAnimalesStep({ predioId, selected, onChange }: ServicioVeterinarioAnimalesStepProps): JSX.Element {
  return <AnimalSelector predioId={predioId} selected={selected} onChange={onChange} />;
}

// ============================================================================
// Step 3 — Results per Animal
// ============================================================================

interface ServicioVeterinarioResultadosStepProps {
  animalIds: number[];
  resultados: Record<number, CreateServicioVeterinarioAnimalDto>;
  onChange: (animalId: number, data: CreateServicioVeterinarioAnimalDto) => void;
}

export function ServicioVeterinarioResultadosStep({ animalIds, resultados, onChange }: ServicioVeterinarioResultadosStepProps): JSX.Element {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCatalogs() {
      try {
        setIsLoading(true);
        const { data: diagData } = await maestrosService.getAll('diagnosticos');
        setDiagnosticos(diagData);
      } catch {
        setDiagnosticos([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalogs();
  }, []);

  // Initialize defaults for new animals - use useCallback to avoid stale closure
  const handleOnChange = useCallback((id: number, data: CreateServicioVeterinarioAnimalDto) => {
    onChange(id, data);
  }, [onChange]);

  useEffect(() => {
    animalIds.forEach((id) => {
      if (!resultados[id]) {
        handleOnChange(id, {
          animalesId: id,
          medicamentos: '',
          dosis: '',
          observaciones: '',
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalIds]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Cargando catálogos...</p>;
  }

  return (
    <div className="space-y-6">
      {animalIds.map((animalId) => {
        const resultado = resultados[animalId] ?? {
          animalesId: animalId,
          medicamentos: '',
          dosis: '',
          observaciones: '',
        } as CreateServicioVeterinarioAnimalDto;

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
                  value={resultado.diagnosticosVeterinariosId ?? ''}
                  onChange={(e) => {
                    const target = e.target as unknown as { value: string };
                    const val = target.value === '' ? undefined : Number(target.value);
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      diagnosticosVeterinariosId: val,
                    });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Seleccionar...</option>
                  {diagnosticos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicamentos */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Medicamentos
                </label>
                <input
                  type="text"
                  value={resultado.medicamentos ?? ''}
                  onChange={(e) => {
                    const target = e.target as unknown as { value: string };
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      medicamentos: target.value,
                    });
                  }}
                  placeholder="Ej: Ivermectina, Albendazol"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Dosis */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Dosis
                </label>
                <input
                  type="text"
                  value={resultado.dosis ?? ''}
                  onChange={(e) => {
                    const target = e.target as unknown as { value: string };
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      dosis: target.value,
                    });
                  }}
                  placeholder="Ej: 1ml/10kg, 5ml IM"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Próxima Aplicación */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Próxima Aplicación
                </label>
                <input
                  type="date"
                  value={resultado.proximaAplicacion ?? ''}
                  onChange={(e) => {
                    const target = e.target as unknown as { value: string };
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      proximaAplicacion: target.value || undefined,
                    });
                  }}
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
                  onChange={(e) => {
                    const target = e.target as unknown as { value: string };
                    onChange(animalId, {
                      ...resultado,
                      animalesId: animalId,
                      observaciones: target.value === '' ? undefined : target.value,
                    });
                  }}
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
