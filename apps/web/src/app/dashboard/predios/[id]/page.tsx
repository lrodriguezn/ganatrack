// apps/web/src/app/dashboard/predios/[id]/page.tsx
/**
 * Predio detail page — displays a single Predio with tabs for sub-recursos.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { PredioDetail } from '@/modules/predios/components/predio-detail';
import { Skeleton } from '@/shared/components/ui/skeleton';

function PredioDetailContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);

  // Parse ID - params can be string or string[] in Next.js 15
  useEffect(() => {
    const id = Number(params.id) || 0;
    
    if (id > 0) {
      setId(id);
    }
  }, [params.id]);

  const handleEdit = (predioId: number) => {
    router.push(`/dashboard/predios/${predioId}/edit`);
  };

  // Loading while resolving params
  if (id === null) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Invalid ID
  if (id <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          ID de predio inválido
        </p>
      </div>
    );
  }

  return <PredioDetail predioId={id} onEdit={handleEdit} />;
}

export default function PredioDetailPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <PredioDetailContent />
    </Suspense>
  );
}