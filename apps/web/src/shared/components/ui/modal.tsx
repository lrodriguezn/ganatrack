// apps/web/src/shared/components/ui/modal.tsx
/**
 * Modal — Radix Dialog wrapper with size variants.
 *
 * Provides accessible modal dialogs with structured layout.
 * Traps focus, handles Escape key, closes on backdrop click.
 *
 * @example
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar acción"
 *   description="¿Está seguro de que desea continuar?"
 *   footer={<Button onClick={confirm}>Confirmar</Button>}
 * >
 *   <p>Contenido del modal</p>
 * </Modal>
 */

'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const overlayClasses =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

const contentClasses =
  'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]';

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeButton = true,
}: ModalProps): JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClasses} />
        <Dialog.Content
          className={twMerge(contentClasses, sizeClasses[size])}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description
                  id="modal-description"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {description}
                </Dialog.Description>
              )}
            </div>

            {closeButton && (
              <Dialog.Close
                className="
                  flex h-8 w-8 items-center justify-center rounded-md
                  text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10
                  focus:outline-none focus:ring-2 focus:ring-brand-500
                "
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto py-2 text-gray-700 dark:text-gray-300">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
