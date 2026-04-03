// apps/web/src/store/reportes.store.ts
/**
 * Reportes Filtros Store — Zustand store for report filter state.
 *
 * State shape:
 * - fechaInicio: string (ISO date, YYYY-MM-DD)
 * - fechaFin: string (ISO date, YYYY-MM-DD)
 *
 * PredioId comes from the existing predio.store.ts — not duplicated here.
 *
 * Actions:
 * - setFechas(inicio, fin) — update both dates
 * - resetFiltros() — reset to defaults (last 12 months)
 */

import { create } from 'zustand';

// ============================================================================
// Helpers
// ============================================================================

function getDefaultDates(): { fechaInicio: string; fechaFin: string } {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const formatDate = (d: Date): string => d.toISOString().split('T')[0]!;

  return {
    fechaInicio: formatDate(oneYearAgo),
    fechaFin: formatDate(now),
  };
}

// ============================================================================
// Store
// ============================================================================

interface ReportesFiltrosState {
  fechaInicio: string;
  fechaFin: string;
  setFechas: (inicio: string, fin: string) => void;
  resetFiltros: () => void;
}

const defaults = getDefaultDates();

export const useReportesStore = create<ReportesFiltrosState>((set) => ({
  fechaInicio: defaults.fechaInicio,
  fechaFin: defaults.fechaFin,

  setFechas: (inicio, fin) => {
    set({ fechaInicio: inicio, fechaFin: fin });
  },

  resetFiltros: () => {
    set(defaults);
  },
}));
