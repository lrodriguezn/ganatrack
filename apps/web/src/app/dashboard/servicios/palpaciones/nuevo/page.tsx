// apps/web/src/app/dashboard/servicios/palpaciones/nuevo/page.tsx
/**
 * Nueva Palpación page — wizard de 3 pasos para crear evento grupal.
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import { usePredioStore } from '@/store/predio.store';
import { useCreatePalpacion } from '@/modules/servicios';
import {
  PalpacionEventoForm,
  PalpacionAnimalesStep,
  PalpacionResultadosStep,
  type PalpacionEventoFormRef,
} from '@/modules/servicios/components/palpacion-form';
import { ServicioGrupalWizard } from '@/modules/servicios/components/servicio-grupal-wizard';
import type { PalpacionEventoFormValues } from '@/modules/servicios/schemas/palpacion.schema';
import type { CreatePalpacionAnimalDto, CreatePalpacionEventoDto } from '@/modules/servicios/types/servicios.types';

export default function NuevaPalpacionPage(): JSX.Element {
  const { predioActivo } = usePredioStore();
  const { mutateAsync, isPending } = useCreatePalpacion();
  const formRef = useRef<PalpacionEventoFormRef>(null);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventoData, setEventoData] = useState<PalpacionEventoFormValues | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [resultados, setResultados] = useState<Record<number, CreatePalpacionAnimalDto>>({});

  const handleNextStep1 = useCallback(async () => {
    const isValid = await formRef.current?.trigger();
    if (isValid) {
      const values = formRef.current?.getValues();
      if (values) {
        setEventoData(values);
        setStep(2);
      }
    }
  }, []);

  const handleResultadoChange = useCallback((animalId: number, data: CreatePalpacionAnimalDto) => {
    setResultados((prev) => ({ ...prev, [animalId]: data }));
  }, []);

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

    await mutateAsync(dto);
  }, [eventoData, selectedAnimals, resultados, mutateAsync]);

  return (
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
            predioId={predioActivo?.id ?? 0}
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
  );
}
