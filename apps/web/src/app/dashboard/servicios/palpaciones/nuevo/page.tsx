// apps/web/src/app/dashboard/servicios/palpaciones/nuevo/page.tsx
/**
 * Nueva Palpación page — wizard de 3 pasos para crear evento grupal.
 *
 * Supports offline submission: when offline, the final assembled DTO
 * is queued to IndexedDB and synced when connectivity returns.
 * Only the final submit (step 3) is queued — mid-wizard data is not stored.
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePredioRequerido } from '@/shared/hooks';
import { useCreatePalpacion } from '@/modules/servicios';
import {
  PalpacionEventoForm,
  PalpacionAnimalesStep,
  PalpacionResultadosStep,
  type PalpacionEventoFormRef,
} from '@/modules/servicios/components/palpacion-form';
import { ServicioGrupalWizard } from '@/modules/servicios/components/servicio-grupal-wizard';
import { submitFormWithOfflineSupport } from '@/shared/lib/offline/submit-form';
import type { PalpacionEventoFormValues } from '@/modules/servicios/schemas/palpacion.schema';
import type { CreatePalpacionAnimalDto, CreatePalpacionEventoDto } from '@/modules/servicios/types/servicios.types';

export default function NuevaPalpacionPage(): JSX.Element | null {
  const router = useRouter();
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  const { mutateAsync, isPending, error } = useCreatePalpacion();
  const formRef = useRef<PalpacionEventoFormRef>(null);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventoData, setEventoData] = useState<PalpacionEventoFormValues | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [resultados, setResultados] = useState<Record<number, CreatePalpacionAnimalDto>>({});
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  if (predioLoading || !predioActivo) return null;

  const handleNextStep1 = async () => {
    const isValid = await formRef.current?.trigger();
    if (isValid) {
      const values = formRef.current?.getValues();
      if (values) {
        setEventoData(values);
        setStep(2);
      }
    }
  };

  const handleResultadoChange = (animalId: number, data: CreatePalpacionAnimalDto) => {
    setResultados((prev) => ({ ...prev, [animalId]: data }));
  };

  const handleSubmit = useCallback(async () => {
    if (!eventoData) return;

    const dto: CreatePalpacionEventoDto = {
      predioId: eventoData.predioId,
      codigo: eventoData.codigo,
      fecha: eventoData.fecha,
      veterinariosId: eventoData.veterinariosId,
      observaciones: eventoData.observaciones,
      animales: selectedAnimals.map((id) => resultados[id] ?? {
        animalesId: id,
        diagnosticosVeterinariosId: 0,
        configCondicionesCorporalesId: 0,
      }),
    };

    const isOnline = navigator.onLine;

    try {
      const result = await submitFormWithOfflineSupport({
        formType: 'palpacion',
        payload: dto as unknown as Record<string, unknown>,
        endpoint: '/api/v1/servicios/palpaciones',
        predioId: eventoData.predioId,
        submitFn: async (headers) => {
          return mutateAsync(dto as Parameters<typeof mutateAsync>[0], headers);
        },
        isOnline,
      });

      if (result.mode === 'online') {
        router.push('/dashboard/servicios/palpaciones');
      } else {
        setIsOfflineQueued(true);
      }
    } catch (err) {
      console.error('Error creating palpacion:', err);
    }
  }, [eventoData, selectedAnimals, resultados, mutateAsync, router]);

  return (
    <div className="space-y-4">
      {/* Offline queued message */}
      {isOfflineQueued && (
        <div className="mx-auto max-w-4xl rounded-md bg-blue-50 dark:bg-blue-500/10 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Guardado offline — se sincronizará cuando haya conexión.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && !isOfflineQueued && (
        <div className="mx-auto max-w-4xl rounded-md bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al crear la palpación: {(error as Error).message}
          </p>
        </div>
      )}

      <ServicioGrupalWizard
        type="palpacion"
        step={step}
        onStepChange={setStep}
        onNextFromStep1={handleNextStep1}
        onNextFromStep2={() => setStep(3)}
        step1Form={
          step === 1 ? (
            <PalpacionEventoForm
              ref={formRef}
              onSubmit={() => {}} // Validation handled by onNextFromStep1
            />
          ) : null
        }
        step3Form={
          step === 2 ? (
            <PalpacionAnimalesStep
              predioId={predioActivo.id}
              selected={selectedAnimals}
              onChange={setSelectedAnimals}
            />
          ) : step === 3 ? (
            <PalpacionResultadosStep
              animalIds={selectedAnimals}
              resultados={resultados}
              onChange={handleResultadoChange}
            />
          ) : null
        }
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
}
