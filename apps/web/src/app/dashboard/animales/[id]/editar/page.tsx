// apps/web/src/app/dashboard/animales/[id]/editar/page.tsx
/**
 * Editar Animal page — edit form for existing animal.
 *
 * Route: /dashboard/animales/[id]/editar
 */

'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AnimalForm } from '@/modules/animales/components/animal-form';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { animalService } from '@/modules/animales/services';
import type { Animal, CreateAnimalDto } from '@/modules/animales/types/animal.types';

interface EditarAnimalPageProps {
  params: Promise<{ id: string }>;
}

export default function EditarAnimalPage({ params }: EditarAnimalPageProps): JSX.Element {
  const resolvedParams = use(params);
  const router = useRouter();
  const animalId = parseInt(resolvedParams.id, 10);

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadAnimal() {
      try {
        const data = await animalService.getById(animalId);
        setAnimal(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnimal();
  }, [animalId]);

  const handleSubmit = async (data: CreateAnimalDto) => {
    try {
      setIsSaving(true);
      await animalService.update(animalId, data);
      router.push(`/dashboard/animales/${animalId}`);
    } catch (err) {
      setError(err as Error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {error ? 'Error al cargar el animal' : 'Animal no encontrado'}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {error?.message}
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
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/animales/${animalId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Editar Animal
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Editando: {animal.codigo} {animal.nombre && `— ${animal.nombre}`}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al guardar: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <AnimalForm
          initialData={{
            codigo: animal.codigo,
            nombre: animal.nombre,
            fechaNacimiento: new Date(animal.fechaNacimiento),
            sexoKey: animal.sexoKey,
            tipoIngresoId: animal.tipoIngresoId,
            configRazasId: animal.configRazasId,
            potreroId: animal.potreroId,
            madreId: animal.madreId,
            padreId: animal.padreId,
            codigoMadre: animal.codigoMadre,
            codigoPadre: animal.codigoPadre,
            tipoPadreKey: animal.tipoPadreKey,
            precioCompra: animal.precioCompra,
            pesoCompra: animal.pesoCompra,
            codigoRfid: animal.codigoRfid,
            codigoArete: animal.codigoArete,
            estadoAnimalKey: animal.estadoAnimalKey,
            saludAnimalKey: animal.saludAnimalKey,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dashboard/animales/${animalId}`)}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}