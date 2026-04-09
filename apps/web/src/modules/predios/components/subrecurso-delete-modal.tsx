// apps/web/src/modules/predios/components/subrecurso-delete-modal.tsx
/**
 * SubRecursoDeleteModal — generic confirmation dialog for deleting a sub-recurso.
 *
 * Reusable for Potreros, Sectores, Lotes, and Grupos.
 *
 * Usage:
 *   <SubRecursoDeleteModal
 *     open={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     onConfirm={() => deletePotrero(potrero.id)}
 *     nombre={potrero.nombre}
 *     tipoRecurso="Potrero"
 *     isLoading={isDeleting}
 *   />
 */

'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface SubRecursoDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nombre: string;
  tipoRecurso: string;
  isLoading?: boolean;
}

export function SubRecursoDeleteModal({
  open,
  onClose,
  onConfirm,
  nombre,
  tipoRecurso,
  isLoading = false,
}: SubRecursoDeleteModalProps): JSX.Element {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Eliminar ${tipoRecurso}`}
      description={`¿Está seguro de que desea eliminar el ${tipoRecurso.toLowerCase()} "${nombre}"? Esta acción no se puede deshacer.`}
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
      <div className="flex items-start gap-3 py-2">
        <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Esta acción eliminará permanentemente el {tipoRecurso.toLowerCase()} y no se puede revertir.
        </p>
      </div>
    </Modal>
  );
}
