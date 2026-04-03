// apps/web/src/app/dashboard/animales/[id]/page.tsx
/**
 * Animal detail page — displays animal info with tabbed interface.
 *
 * Route: /dashboard/animales/[id]
 * Tabs: Información General, Genealogía, Historial Salud, Servicios
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { useAnimal } from '@/modules/animales/hooks';
import { AnimalDetailTabs } from '@/modules/animales/components/animal-detail-tabs';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface AnimalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AnimalDetailPage({ params }: AnimalDetailPageProps): JSX.Element {
  const resolvedParams = use(params);
  const router = useRouter();
  const animalId = parseInt(resolvedParams.id, 10);

  const { data: animal, isLoading, error } = useAnimal(animalId);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Error al cargar el animal
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {(error as Error).message}
        </p>
        <Link href="/dashboard/animales" className="mt-4">
          <Button variant="secondary">Volver a la lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/animales">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {animal?.nombre ?? animal?.codigo ?? 'Detalle del Animal'}
            </h1>
            {animal && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Código: {animal.codigo}
              </p>
            )}
          </div>
        </div>
        {animal && (
          <Link href={`/dashboard/animales/${animal.id}/editar`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <AnimalDetailTabs animalId={animalId} animal={animal} isLoading={isLoading} />
      )}
    </div>
  );
}