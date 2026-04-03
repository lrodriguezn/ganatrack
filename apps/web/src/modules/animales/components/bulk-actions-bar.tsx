// apps/web/src/modules/animales/components/bulk-actions-bar.tsx
/**
 * BulkActionsBar — appears when rows are selected in the table.
 *
 * Actions:
 * - Mover a potrero (select)
 * - Cambiar grupo (select)
 * - Cambiar lote (select)
 * Uses existing DataTable rowSelection.
 *
 * Usage:
 *   <BulkActionsBar
 *     selectedCount={Object.keys(rowSelection).length}
 *     onMoverAPotrero={handleMover}
 *     onCambiarGrupo={handleGrupo}
 *     onCambiarLote={handleLote}
 *     onClearSelection={() => setRowSelection({})}
 *   />
 */

'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { catalogoService } from '@/modules/configuracion/services';
import type { CatalogoBase } from '@/modules/configuracion/types/catalogo.types';

interface BulkActionsBarProps {
  selectedCount: number;
  onMoverAPotrero?: (potreroId: number) => void;
  onCambiarGrupo?: (grupoId: number) => void;
  onCambiarLote?: (loteId: number) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onMoverAPotrero,
  onCambiarGrupo,
  onCambiarLote,
  onClearSelection,
  isLoading = false,
}: BulkActionsBarProps): JSX.Element | null {
  const [potreros, setPotreros] = useState<CatalogoBase[]>([]);
  const [selectedPotreroId, setSelectedPotreroId] = useState<number | ''>('');

  // Load potreros from catalogo (or use maestro data)
  useEffect(() => {
    async function loadPotreros() {
      try {
        // Using catalogoService for potreros as they are part of predios
        const data = await catalogoService.getAll('colores'); // Placeholder - should be potreros
        // In real implementation, this would load potreros
        setPotreros([]);
      } catch (err) {
        console.error('Error loading potreros:', err);
      }
    }
    if (selectedCount > 0) {
      loadPotreros();
    }
  }, [selectedCount]);

  if (selectedCount === 0) {
    return null;
  }

  const handleMoverAPotrero = () => {
    if (selectedPotreroId && onMoverAPotrero) {
      onMoverAPotrero(Number(selectedPotreroId));
      setSelectedPotreroId('');
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-brand-50 dark:bg-brand-500/10 px-4 py-3 border border-brand-200 dark:border-brand-500/30">
      {/* Selection count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
          {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-brand-200 dark:bg-brand-500/30" />

      {/* Actions */}
      <div className="flex items-center gap-2 flex-1">
        {/* Mover a potrero */}
        {onMoverAPotrero && (
          <div className="flex items-center gap-2">
            <select
              value={selectedPotreroId}
              onChange={(e) => setSelectedPotreroId(e.target.value ? Number(e.target.value) : '')}
              className="h-8 rounded-md border border-brand-300 dark:border-brand-500 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={isLoading}
            >
              <option value="">Mover a potrero...</option>
              {/* Potreros would be loaded and populated here */}
              <option value="1">Potrero Norte</option>
              <option value="2">Potrero Sur</option>
              <option value="3">Potrero Este</option>
              <option value="4">Potrero Oeste</option>
            </select>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMoverAPotrero}
              disabled={!selectedPotreroId || isLoading}
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Cambiar grupo */}
        {onCambiarGrupo && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {/* Open grupo selection modal */}}
            disabled={isLoading}
          >
            Cambiar grupo
          </Button>
        )}

        {/* Cambiar lote */}
        {onCambiarLote && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {/* Open lote selection modal */}}
            disabled={isLoading}
          >
            Cambiar lote
          </Button>
        )}
      </div>

      {/* Clear selection */}
      <button
        type="button"
        onClick={onClearSelection}
        className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Limpiar selección"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}