// apps/web/src/app/dashboard/servicios/inseminaciones/nuevo/page.tsx
/**
 * Nueva Inseminación page — wizard de 3 pasos para crear evento grupal.
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import { usePredioRequerido } from '@/shared/hooks';
import { useCreateInseminacion } from '@/modules/servicios';
import {
  InseminacionEventoForm,
  InseminacionResultadosStep,
  type InseminacionEventoFormRef,
} from '@/modules/servicios/components/inseminacion-form';
import { AnimalSelector } from '@/modules/servicios/components/animal-selector';
import { ServicioGrupalWizard } from '@/modules/servicios/components/servicio-grupal-wizard';
import type { InseminacionEventoFormValues } from '@/modules/servicios/schemas/inseminacion.schema';
import type { CreateInseminacionAnimalDto, CreateInseminacionEventoDto } from '@/modules/servicios/types/servicios.types';

export default function NuevaInseminacionPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  const { mutateAsync, isPending } = useCreateInseminacion();
  const formRef = useRef<InseminacionEventoFormRef>(null);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventoData, setEventoData] = useState<InseminacionEventoFormValues | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [resultados, setResultados] = useState<Record<number, CreateInseminacionAnimalDto>>({});

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

  const handleResultadoChange = (animalId: number, data: CreateInseminacionAnimalDto) => {
    setResultados((prev) => ({ ...prev, [animalId]: data }));
  };

  const handleSubmit = async () => {
    if (!eventoData) return;

    const dto: CreateInseminacionEventoDto = {
      predioId: eventoData.predioId,
      codigo: eventoData.codigo,
      fecha: eventoData.fecha,
      veterinariosId: eventoData.veterinariosId,
      observaciones: eventoData.observaciones,
      animales: selectedAnimals.map((id) => resultados[id] ?? {
        animalesId: id,
        fecha: eventoData.fecha,
      }),
    };

    await mutateAsync(dto);
  };

  return (
    <ServicioGrupalWizard
      type="inseminacion"
      step={step}
      onStepChange={setStep}
      onNextFromStep1={handleNextStep1}
      onNextFromStep2={() => setStep(3)}
      step1Form={
        step === 1 ? (
          <InseminacionEventoForm
            ref={formRef}
            onSubmit={() => {}} // Validation handled by onNextFromStep1
          />
        ) : null
      }
      step3Form={
        step === 2 ? (
          <AnimalSelector
            predioId={predioActivo.id}
            selected={selectedAnimals}
            onChange={setSelectedAnimals}
          />
        ) : step === 3 ? (
          <InseminacionResultadosStep
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
