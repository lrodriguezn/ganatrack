// apps/web/src/app/dashboard/servicios/partos/nuevo/page.tsx
/**
 * Nuevo Parto page — formulario simple (NO wizard) para registrar un parto.
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePredioRequerido } from '@/shared/hooks';
import { useCreateParto } from '@/modules/servicios';
import { PartoForm } from '@/modules/servicios/components/parto-form';
import { Button } from '@/shared/components/ui/button';
import type { CreatePartoDto } from '@/modules/servicios/types/servicios.types';

export default function NuevoPartoPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  const { mutateAsync, isPending } = useCreateParto();

  if (predioLoading || !predioActivo) return null;

  const handleSubmit = async (data: CreatePartoDto) => {
    await mutateAsync({
      ...data,
      predioId: predioActivo.id,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/servicios/partos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Registrar Parto
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Registre un nuevo evento de parto individual
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <PartoForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
