// apps/web/src/modules/servicios/components/servicio-grupal-wizard.tsx
/**
 * ServicioGrupalWizard — 3-step wizard layout for creating group service events.
 *
 * Step 1: Create event (rendered by step1Form)
 * Step 2: Select animals (rendered by step3Form when step=2)
 * Step 3: Register results (rendered by step3Form when step=3)
 *
 * The parent component controls the step state via props.
 */

'use client';

interface ServicioGrupalWizardProps {
  type: 'palpacion' | 'inseminacion';
  step: 1 | 2 | 3;
  onStepChange: (step: 1 | 2 | 3) => void;
  onNextFromStep1?: () => void;
  onNextFromStep2?: () => void;
  step1Form: React.ReactNode;
  step3Form: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  isPending: boolean;
}

export function ServicioGrupalWizard({
  type,
  step,
  onStepChange,
  onNextFromStep1,
  onNextFromStep2,
  step1Form,
  step3Form,
  onSubmit,
  isPending,
}: ServicioGrupalWizardProps): JSX.Element {
  const steps = [
    { number: 1, label: 'Crear Evento' },
    { number: 2, label: 'Seleccionar Animales' },
    { number: 3, label: 'Registrar Resultados' },
  ];

  const title = type === 'palpacion' ? 'Nueva Palpación' : 'Nueva Inseminación';

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>

      {/* Stepper */}
      <nav className="mb-8">
        <ol className="flex items-center">
          {steps.map((s, idx) => (
            <li key={s.number} className="flex items-center">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                  ${step === s.number
                    ? 'bg-blue-600 text-white'
                    : step > s.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }
                `}
              >
                {step > s.number ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === s.number
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-16 ${
                    step > s.number ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {step === 1 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Paso 1: Datos del Evento
            </h2>
            {step1Form}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onNextFromStep1}
                className="
                  rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
                  hover:bg-blue-700 disabled:opacity-50
                "
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Paso 2: Seleccionar Animales
            </h2>
            {step3Form}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => onStepChange(1)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={onNextFromStep2}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Paso 3: Registrar Resultados
            </h2>
            {step3Form}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => onStepChange(2)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={isPending}
                className="
                  rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white
                  hover:bg-green-700 disabled:opacity-50
                "
              >
                {isPending ? 'Guardando...' : 'Guardar Evento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
