// apps/web/src/app/dashboard/servicios/veterinarios/nuevo/page.tsx
/**
 * Nuevo Servicio Veterinario page — wizard de 3 pasos para crear evento veterinario.
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import { usePredioStore } from '@/store/predio.store';
import { useCreateServicioVeterinario } from '@/modules/servicios';
import {
  ServicioVeterinarioEventoForm,
  ServicioVeterinarioAnimalesStep,
  ServicioVeterinarioResultadosStep,
  type ServicioVeterinarioEventoFormRef,
} from '@/modules/servicios/components/servicio-veterinario-form';
import { ServicioGrupalWizard } from '@/modules/servicios/components/servicio-grupal-wizard';
import type { ServicioVeterinarioEventoFormData } from '@/modules/servicios/schemas/servicio-veterinario.schema';
import type { CreateServicioVeterinarioAnimalDto, CreateServicioVeterinarioEventoDto } from '@/modules/servicios/types/servicios.types';

export default function NuevoServicioVeterinarioPage(): JSX.Element {
  const { predioActivo } = usePredioStore();
  const { mutateAsync, isPending } = useCreateServicioVeterinario();
  const formRef = useRef<ServicioVeterinarioEventoFormRef>(null);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventoData, setEventoData] = useState<ServicioVeterinarioEventoFormData | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [resultados, setResultados] = useState<Record<number, CreateServicioVeterinarioAnimalDto>>({});

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

  const handleResultadoChange = useCallback((animalId: number, data: CreateServicioVeterinarioAnimalDto) => {
    setResultados((prev) => ({ ...prev, [animalId]: data }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!eventoData) return;

    const dto: CreateServicioVeterinarioEventoDto = {
      predioId: eventoData.predioId,
      codigo: eventoData.codigo,
      fecha: eventoData.fecha.toISOString(),
      veterinariosId: eventoData.veterinariosId,
      observaciones: eventoData.observaciones,
      animales: selectedAnimals.map((id) => resultados[id] ?? {
        animalesId: id,
        diagnosticosVeterinariosId: 0,
        medicamentos: '',
        dosis: '',
        proximaAplicacion: undefined,
        observaciones: '',
      }),
    };

    await mutateAsync(dto);
  }, [eventoData, selectedAnimals, resultados, mutateAsync]);

  return (
    <ServicioGrupalWizard
      type="veterinario"
      step={step}
      onStepChange={setStep}
      onNextFromStep1={handleNextStep1}
      onNextFromStep2={() => setStep(3)}
      step1Form={
        step === 1 ? (
          <ServicioVeterinarioEventoForm
            ref={formRef}
            onSubmit={() => {}} // Validation handled by onNextFromStep1
          />
        ) : null
      }
      step3Form={
        step === 2 ? (
          <ServicioVeterinarioAnimalesStep
            predioId={predioActivo?.id ?? 0}
            selected={selectedAnimals}
            onChange={setSelectedAnimals}
          />
        ) : step === 3 ? (
          <ServicioVeterinarioResultadosStep
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
