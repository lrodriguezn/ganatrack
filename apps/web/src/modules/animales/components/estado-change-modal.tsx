// apps/web/src/modules/animales/components/estado-change-modal.tsx
/**
 * EstadoChangeModal — modal for changing animal state.
 *
 * - VENDIDO: fecha, motivoVentaId (select), lugarVentaId (select), precioVenta
 * - MUERTO: fecha, causaMuerteId (select), diagnosticoId (select)
 * Uses PATCH /animales/:id/estado
 *
 * Usage:
 *   <EstadoChangeModal
 *     animalId={123}
 *     currentEstado={0}
 *     open={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     onSuccess={() => refetch()}
 *   />
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { FormField } from '@/shared/components/ui/form-field';
import { Input } from '@/shared/components/ui/input';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { useMaestro } from '@/modules/maestros/hooks';
import type { CambioEstadoDto } from '../types/animal.types';
import { animalService } from '../services';
import { EstadoAnimalEnum } from '@ganatrack/shared-types';

interface EstadoChangeModalProps {
  animalId: number;
  currentEstado: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EstadoChangeModal({
  animalId,
  currentEstado,
  open,
  onClose,
  onSuccess,
}: EstadoChangeModalProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<EstadoAnimalEnum>(EstadoAnimalEnum.ACTIVO);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [precioVenta, setPrecioVenta] = useState<string>('');

  // Load maestro data for selects
  const { items: motivosVenta } = useMaestro('motivos-ventas');
  const { items: lugaresVenta } = useMaestro('lugares-ventas');
  const { items: causasMuerte } = useMaestro('causas-muerte');
  const { items: diagnosticos } = useMaestro('diagnosticos');

  useEffect(() => {
    if (open) {
      setSelectedEstado(currentEstado === EstadoAnimalEnum.ACTIVO ? EstadoAnimalEnum.VENDIDO : EstadoAnimalEnum.MUERTO);
      setFecha(new Date());
      setPrecioVenta('');
      setError(null);
    }
  }, [open, currentEstado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);

      const dto: CambioEstadoDto = {
        estadoAnimalKey: selectedEstado,
        fecha: fecha.toISOString(),
      };

      if (selectedEstado === EstadoAnimalEnum.VENDIDO) {
        // Get values from form
        const formData = new FormData(e.target as HTMLFormElement);
        dto.motivoVentaId = Number(formData.get('motivoVentaId')) || undefined;
        dto.lugarVentaId = Number(formData.get('lugarVentaId')) || undefined;
        dto.precioVenta = precioVenta ? Number(precioVenta) : undefined;
      } else if (selectedEstado === EstadoAnimalEnum.MUERTO) {
        const formData = new FormData(e.target as HTMLFormElement);
        dto.causaId = Number(formData.get('causaMuerteId')) || undefined;
        dto.motivoId = Number(formData.get('diagnosticoId')) || undefined;
      }

      // Call API via service
      await animalService.cambiarEstado(animalId, dto);

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isVendido = selectedEstado === EstadoAnimalEnum.VENDIDO;
  const isMuerto = selectedEstado === EstadoAnimalEnum.MUERTO;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cambiar Estado del Animal"
      description="Selecciona el nuevo estado y completa la información requerida"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="estado-form" isLoading={isLoading}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="estado-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-500/10 p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Estado selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Nuevo Estado
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="estado"
                value={EstadoAnimalEnum.VENDIDO}
                checked={selectedEstado === EstadoAnimalEnum.VENDIDO}
                onChange={() => setSelectedEstado(EstadoAnimalEnum.VENDIDO)}
                className="h-4 w-4 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Vendido</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="estado"
                value={EstadoAnimalEnum.MUERTO}
                checked={selectedEstado === EstadoAnimalEnum.MUERTO}
                onChange={() => setSelectedEstado(EstadoAnimalEnum.MUERTO)}
                className="h-4 w-4 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Muerto</span>
            </label>
          </div>
        </div>

        {/* Fecha */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Fecha
          </label>
          <DatePicker
            value={fecha}
            onChange={(date) => date && setFecha(date)}
            maxDate={new Date()}
            placeholder="Seleccionar fecha"
          />
        </div>

        {/* VENDIDO fields */}
        {isVendido && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Motivo de Venta
              </label>
              <select
                name="motivoVentaId"
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Seleccionar...</option>
                {motivosVenta.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Lugar de Venta
              </label>
              <select
                name="lugarVentaId"
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Seleccionar...</option>
                {lugaresVenta.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Precio de Venta (COP)
              </label>
              <Input
                type="number"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                placeholder="3500000"
              />
            </div>
          </>
        )}

        {/* MUERTO fields */}
        {isMuerto && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Causa de Muerte
              </label>
              <select
                name="causaMuerteId"
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Seleccionar...</option>
                {causasMuerte.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Diagnóstico
              </label>
              <select
                name="diagnosticoId"
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Seleccionar...</option>
                {diagnosticos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}