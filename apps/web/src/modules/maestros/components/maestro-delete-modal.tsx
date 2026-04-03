// apps/web/src/modules/maestros/components/maestro-delete-modal.tsx
/**
 * MaestroDeleteModal — generic confirmation dialog for deleting any maestro.
 *
 * Usage:
 *   <MaestroDeleteModal
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     onConfirm={() => remove(item.id)}
 *     itemName={item.nombre}
 *     isLoading={isRemoving}
 *   />
 */

'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';

interface MaestroDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}

export function MaestroDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading = false,
}: MaestroDeleteModalProps): JSX.Element {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Confirmar eliminación"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Eliminar
          </Button>
        </div>
      }
    >
      <p className="text-gray-700 dark:text-gray-300 py-2">
        ¿Está seguro de eliminar{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {itemName}
        </span>
        ? Esta acción no se puede deshacer.
      </p>
    </Modal>
  );
}
