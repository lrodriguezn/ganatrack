// apps/web/src/modules/predios/components/predio-delete-modal.tsx
/**
 * PredioDeleteModal — confirmation dialog for deleting a Predio.
 *
 * Displays a Modal with:
 * - Warning message about the action
 * - Predio name being deleted
 * - Confirm/Cancel buttons
 *
 * Usage:
 *   <PredioDeleteModal
 *     open={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     onConfirm={() => deletePredio(predio.id)}
 *     predio={predioToDelete}
 *     isLoading={isDeleting}
 *   />
 */

'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { Predio } from '@ganatrack/shared-types';

interface PredioDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  predio: Predio | null;
  isLoading?: boolean;
}

export function PredioDeleteModal({
  open,
  onClose,
  onConfirm,
  predio,
  isLoading = false,
}: PredioDeleteModalProps): JSX.Element {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar Predio"
      description={
        predio
          ? `¿Está seguro de que desea eliminar el predio "${predio.nombre}"? Esta acción no se puede deshacer.`
          : '¿Está seguro de que desea eliminar este predio? Esta acción no se puede deshacer.'
      }
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isLoading}>
            Eliminar
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 py-2">
        <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Se eliminarán todos los datos asociados al predio, incluyendo:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
            <li>Potreros</li>
            <li>Lotes</li>
            <li>Grupos</li>
            <li>Sectores</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
