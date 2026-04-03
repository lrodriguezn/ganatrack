// apps/web/src/modules/reportes/hooks/use-exportacion.ts
/**
 * useExportacion — manages async export with polling.
 *
 * Features:
 * - POST to start export, receive jobId
 * - Poll GET /exportar/{jobId}/status every 3s
 * - Max 60s timeout (20 attempts × 3s)
 * - Max 3 concurrent exports
 * - Auto-download blob on completion
 * - Retry on failure
 *
 * @example
 * const { exports, startExport, cancelExport, retryExport } = useExportacion();
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type {
  ExportRequest,
  ExportFormato,
  ExportacionState,
} from '../types/reportes.types';

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_TIME_MS = 60_000;
const MAX_ATTEMPTS = MAX_POLL_TIME_MS / POLL_INTERVAL_MS; // 20
const MAX_CONCURRENT = 3;

export function useExportacion() {
  const [exports, setExports] = useState<Map<string, ExportacionState>>(
    new Map(),
  );
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  const activeCountRef = useRef(0);
  const queryClient = useQueryClient();

  /**
   * Poll for export status until completed, failed, or timeout.
   */
  const pollExport = useCallback(
    async (jobId: string, tipo: string, formato: ExportFormato) => {
      let attempts = 0;

      const interval = setInterval(async () => {
        attempts++;

        try {
          const status = await reportesService.getExportStatus(jobId);

          setExports((prev) => {
            const next = new Map(prev);
            const existing = next.get(jobId);
            if (!existing) return next;

            next.set(jobId, {
              ...existing,
              status: status.status,
              progress: status.progress,
              attempts,
            });
            return next;
          });

          if (status.status === 'completed' && status.downloadUrl) {
            clearInterval(interval);
            intervalsRef.current.delete(jobId);
            activeCountRef.current = Math.max(0, activeCountRef.current - 1);

            // Auto-download
            const blob = await reportesService.downloadExport(
              status.downloadUrl,
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tipo}_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : formato}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Remove from active exports after short delay
            setTimeout(() => {
              setExports((prev) => {
                const next = new Map(prev);
                next.delete(jobId);
                return next;
              });
            }, 3000);

            // Invalidate export status query
            queryClient.removeQueries({
              queryKey: queryKeys.reportes.exportStatus(jobId),
            });
          }

          if (status.status === 'failed') {
            clearInterval(interval);
            intervalsRef.current.delete(jobId);
            activeCountRef.current = Math.max(0, activeCountRef.current - 1);

            setExports((prev) => {
              const next = new Map(prev);
              const existing = next.get(jobId);
              if (!existing) return next;

              next.set(jobId, {
                ...existing,
                status: 'failed',
                error: status.error || 'Error desconocido',
                attempts,
              });
              return next;
            });
          }

          // Timeout
          if (attempts >= MAX_ATTEMPTS) {
            clearInterval(interval);
            intervalsRef.current.delete(jobId);
            activeCountRef.current = Math.max(0, activeCountRef.current - 1);

            setExports((prev) => {
              const next = new Map(prev);
              const existing = next.get(jobId);
              if (!existing) return next;

              next.set(jobId, {
                ...existing,
                status: 'failed',
                error: 'La exportación tardó demasiado',
                attempts,
              });
              return next;
            });
          }
        } catch {
          // Network error during polling — continue polling
        }
      }, POLL_INTERVAL_MS);

      intervalsRef.current.set(jobId, interval);
    },
    [queryClient],
  );

  /**
   * Start a new export.
   */
  const startExport = useCallback(
    async (tipo: string, request: ExportRequest) => {
      // Check concurrent limit using ref for real-time accuracy
      if (activeCountRef.current >= MAX_CONCURRENT) {
        throw new Error(
          'Máximo 3 exportaciones simultáneas. Espere a que una termine.',
        );
      }

      const result = await reportesService.exportar(tipo, request);
      const jobId = result.jobId;

      const newState: ExportacionState = {
        jobId,
        tipo,
        formato: request.formato,
        status: 'pending',
        progress: 0,
        attempts: 0,
        startedAt: Date.now(),
        filtros: request.filtros,
      };

      setExports((prev) => {
        const next = new Map(prev);
        next.set(jobId, newState);
        return next;
      });
      activeCountRef.current++;

      // Start polling
      pollExport(jobId, tipo, request.formato);

      return jobId;
    },
    [pollExport],
  );

  /**
   * Cancel an active export.
   */
  const cancelExport = useCallback((jobId: string) => {
    const interval = intervalsRef.current.get(jobId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(jobId);
      activeCountRef.current = Math.max(0, activeCountRef.current - 1);
    }

    setExports((prev) => {
      const next = new Map(prev);
      next.delete(jobId);
      return next;
    });
  }, []);

  // Cleanup all polling intervals on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  /**
   * Retry a failed export.
   */
  const retryExport = useCallback(
    async (jobId: string) => {
      const existing = exports.get(jobId);
      if (!existing) return;

      // Remove failed state
      cancelExport(jobId);

      // Restart with stored filtros
      const request: ExportRequest = {
        formato: existing.formato,
        filtros: existing.filtros ?? {
          predioId: 0,
          fechaInicio: '',
          fechaFin: '',
        },
      };

      return startExport(existing.tipo, request);
    },
    [exports, cancelExport, startExport],
  );

  const exportMutation = useMutation({
    mutationFn: ({
      tipo,
      request,
    }: {
      tipo: string;
      request: ExportRequest;
    }) => startExport(tipo, request),
  });

  return {
    exports,
    startExport: exportMutation.mutateAsync,
    cancelExport,
    retryExport,
    isExporting: exports.size > 0,
    canExport: exports.size < MAX_CONCURRENT,
  };
}
