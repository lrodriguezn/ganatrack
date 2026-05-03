// apps/web/src/modules/servicios/services/servicios.mock.ts
/**
 * Mock Servicios Service — simulates API for development.
 *
 * Provides realistic seed data for palpaciones, inseminaciones, and partos.
 * In-memory store supports all operations.
 * Simulated delay: 300ms.
 */

import type {
  PalpacionEvento,
  PalpacionAnimal,
  CreatePalpacionEventoDto,
  InseminacionEvento,
  InseminacionAnimal,
  CreateInseminacionEventoDto,
  Parto,
  CreatePartoDto,
  PaginationParams,
  PaginatedEventos,
  ServicioVeterinarioEvento,
  CreateServicioVeterinarioEventoDto,
  PaginatedServiciosVeterinarios,
} from '../types/servicios.types';
import type { ServiciosService } from './servicios.service';
import { ApiError } from '@/shared/lib/errors';

// ============================================================================
// Diagnosticos & Condiciones Corporales lookup maps
// ============================================================================

const DIAGNOSTICO_MAP: Record<number, string> = {
  1: 'Positiva',
  2: 'Negativa',
  3: 'Desparasitación',
  4: 'Vacunación',
  5: 'Vitaminas',
  6: 'Tratamiento',
};

const CONDICION_MAP: Record<number, string> = {
  1: '1.0',
  2: '2.0',
  3: '3.0',
  4: '4.0',
  5: '5.0',
};

// ============================================================================
// Seed Data — Palpaciones
// ============================================================================

const SEED_PALPACION_ANIMALES: PalpacionAnimal[] = [
  // Evento 1 — 5 animales
  { id: 1, eventoId: 1, animalesId: 14, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 3, diasGestacion: 45, fechaParto: '2026-06-15', animalCodigo: 'GAN-014', animalNombre: 'La Negra', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.0' },
  { id: 2, eventoId: 1, animalesId: 15, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 4, diasGestacion: 60, fechaParto: '2026-05-20', animalCodigo: 'GAN-015', animalNombre: 'Bella', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.5' },
  { id: 3, eventoId: 1, animalesId: 16, diagnosticosVeterinariosId: 2, configCondicionesCorporalesId: 2, animalCodigo: 'GAN-016', animalNombre: 'Luna', diagnosticoNombre: 'Negativa', condicionCorporalNombre: '2.5' },
  { id: 4, eventoId: 1, animalesId: 17, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 3, diasGestacion: 30, fechaParto: '2026-07-10', animalCodigo: 'GAN-017', animalNombre: 'Estrella', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.0' },
  { id: 5, eventoId: 1, animalesId: 18, diagnosticosVeterinariosId: 2, configCondicionesCorporalesId: 3, animalCodigo: 'GAN-018', animalNombre: 'Margarita', diagnosticoNombre: 'Negativa', condicionCorporalNombre: '3.0' },

  // Evento 2 — 4 animales
  { id: 6, eventoId: 2, animalesId: 19, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 4, diasGestacion: 90, fechaParto: '2026-04-20', animalCodigo: 'GAN-019', animalNombre: 'Blanca', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.5' },
  { id: 7, eventoId: 2, animalesId: 20, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 3, diasGestacion: 75, fechaParto: '2026-05-05', animalCodigo: 'GAN-020', animalNombre: 'Paloma', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.0' },
  { id: 8, eventoId: 2, animalesId: 21, diagnosticosVeterinariosId: 2, configCondicionesCorporalesId: 2, animalCodigo: 'GAN-021', animalNombre: 'Cereza', diagnosticoNombre: 'Negativa', condicionCorporalNombre: '2.5' },
  { id: 9, eventoId: 2, animalesId: 22, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 3, diasGestacion: 50, fechaParto: '2026-06-25', animalCodigo: 'GAN-022', animalNombre: 'Azucena', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.0' },

  // Evento 3 — 3 animales
  { id: 10, eventoId: 3, animalesId: 23, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 3, diasGestacion: 120, fechaParto: '2026-03-28', animalCodigo: 'GAN-023', animalNombre: 'Nube', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.0' },
  { id: 11, eventoId: 3, animalesId: 14, diagnosticosVeterinariosId: 2, configCondicionesCorporalesId: 2, animalCodigo: 'GAN-014', animalNombre: 'La Negra', diagnosticoNombre: 'Negativa', condicionCorporalNombre: '2.5' },
  { id: 12, eventoId: 3, animalesId: 15, diagnosticosVeterinariosId: 1, configCondicionesCorporalesId: 4, diasGestacion: 35, fechaParto: '2026-07-20', animalCodigo: 'GAN-015', animalNombre: 'Bella', diagnosticoNombre: 'Positiva', condicionCorporalNombre: '3.5' },
];

const SEED_PALPACIONES: PalpacionEvento[] = [
  { id: 1, predioId: 1, codigo: 'PAL-2026-001', fecha: '2026-01-15', veterinariosId: 1, veterinarioNombre: 'Dr. Carlos Méndez', observaciones: 'Palpación de rutina - lote principal', totalAnimales: 5, createdAt: '2026-01-15T08:00:00Z', animales: SEED_PALPACION_ANIMALES.filter(a => a.eventoId === 1) },
  { id: 2, predioId: 1, codigo: 'PAL-2026-002', fecha: '2026-02-10', veterinariosId: 2, veterinarioNombre: 'Dra. María López', observaciones: 'Seguimiento post-inseminación', totalAnimales: 4, createdAt: '2026-02-10T09:00:00Z', animales: SEED_PALPACION_ANIMALES.filter(a => a.eventoId === 2) },
  { id: 3, predioId: 1, codigo: 'PAL-2026-003', fecha: '2026-03-05', veterinariosId: 1, veterinarioNombre: 'Dr. Carlos Méndez', observaciones: 'Revisión general potrero sur', totalAnimales: 3, createdAt: '2026-03-05T07:30:00Z', animales: SEED_PALPACION_ANIMALES.filter(a => a.eventoId === 3) },
  { id: 4, predioId: 1, codigo: 'PAL-2025-012', fecha: '2025-12-20', veterinariosId: 3, veterinarioNombre: 'Dr. Pedro Gómez', observaciones: 'Palpación fin de año', totalAnimales: 6, createdAt: '2025-12-20T08:00:00Z', animales: [] },
  { id: 5, predioId: 1, codigo: 'PAL-2025-011', fecha: '2025-11-15', veterinariosId: 2, veterinarioNombre: 'Dra. María López', observaciones: 'Control reproductivo noviembre', totalAnimales: 4, createdAt: '2025-11-15T09:00:00Z', animales: [] },
];

// ============================================================================
// Seed Data — Inseminaciones
// ============================================================================

const SEED_INSEMINACION_ANIMALES: InseminacionAnimal[] = [
  { id: 1, eventoId: 1, animalesId: 14, fecha: '2026-01-10', toro: 'GAN-001 (Don Toro)', pajuela: 'PJ-2025-001', dosis: 1, animalCodigo: 'GAN-014', animalNombre: 'La Negra' },
  { id: 2, eventoId: 1, animalesId: 15, fecha: '2026-01-10', toro: 'GAN-002 (El Bravo)', pajuela: 'PJ-2025-002', dosis: 1, animalCodigo: 'GAN-015', animalNombre: 'Bella' },
  { id: 3, eventoId: 1, animalesId: 16, fecha: '2026-01-10', toro: 'GAN-001 (Don Toro)', pajuela: 'PJ-2025-001', dosis: 1, animalCodigo: 'GAN-016', animalNombre: 'Luna' },
  { id: 4, eventoId: 1, animalesId: 17, fecha: '2026-01-10', toro: 'GAN-003 (Matambo)', pajuela: 'PJ-2025-003', dosis: 1, animalCodigo: 'GAN-017', animalNombre: 'Estrella' },

  { id: 5, eventoId: 2, animalesId: 18, fecha: '2026-02-05', toro: 'GAN-001 (Don Toro)', pajuela: 'PJ-2025-004', dosis: 1, animalCodigo: 'GAN-018', animalNombre: 'Margarita' },
  { id: 6, eventoId: 2, animalesId: 19, fecha: '2026-02-05', toro: 'GAN-004 (Cupido)', pajuela: 'PJ-2025-005', dosis: 1, animalCodigo: 'GAN-019', animalNombre: 'Blanca' },
  { id: 7, eventoId: 2, animalesId: 20, fecha: '2026-02-05', toro: 'GAN-002 (El Bravo)', pajuela: 'PJ-2025-002', dosis: 1, animalCodigo: 'GAN-020', animalNombre: 'Paloma' },

  { id: 8, eventoId: 3, animalesId: 21, fecha: '2026-03-01', toro: 'GAN-001 (Don Toro)', pajuela: 'PJ-2025-006', dosis: 1, animalCodigo: 'GAN-021', animalNombre: 'Cereza' },
  { id: 9, eventoId: 3, animalesId: 22, fecha: '2026-03-01', toro: 'GAN-003 (Matambo)', pajuela: 'PJ-2025-003', dosis: 1, animalCodigo: 'GAN-022', animalNombre: 'Azucena' },
  { id: 10, eventoId: 3, animalesId: 23, fecha: '2026-03-01', toro: 'GAN-004 (Cupido)', pajuela: 'PJ-2025-007', dosis: 1, animalCodigo: 'GAN-023', animalNombre: 'Nube' },
];

const SEED_INSEMINACIONES: InseminacionEvento[] = [
  { id: 1, predioId: 1, codigo: 'INS-2026-001', fecha: '2026-01-10', veterinariosId: 1, veterinarioNombre: 'Dr. Carlos Méndez', observaciones: 'Inseminación programada lote norte', totalAnimales: 4, createdAt: '2026-01-10T07:00:00Z', animales: SEED_INSEMINACION_ANIMALES.filter(a => a.eventoId === 1) },
  { id: 2, predioId: 1, codigo: 'INS-2026-002', fecha: '2026-02-05', veterinariosId: 2, veterinarioNombre: 'Dra. María López', observaciones: 'Seguimiento reproductivo', totalAnimales: 3, createdAt: '2026-02-05T08:00:00Z', animales: SEED_INSEMINACION_ANIMALES.filter(a => a.eventoId === 2) },
  { id: 3, predioId: 1, codigo: 'INS-2026-003', fecha: '2026-03-01', veterinariosId: 1, veterinarioNombre: 'Dr. Carlos Méndez', observaciones: 'Inseminación otoño', totalAnimales: 3, createdAt: '2026-03-01T07:30:00Z', animales: SEED_INSEMINACION_ANIMALES.filter(a => a.eventoId === 3) },
  { id: 4, predioId: 1, codigo: 'INS-2025-015', fecha: '2025-12-15', veterinariosId: 3, veterinarioNombre: 'Dr. Pedro Gómez', observaciones: 'Inseminación fin de año', totalAnimales: 5, createdAt: '2025-12-15T08:00:00Z', animales: [] },
  { id: 5, predioId: 1, codigo: 'INS-2025-014', fecha: '2025-11-20', veterinariosId: 2, veterinarioNombre: 'Dra. María López', observaciones: 'Control reproductivo', totalAnimales: 3, createdAt: '2025-11-20T09:00:00Z', animales: [] },
];

// ============================================================================
// Seed Data — Servicios Veterinarios
// ============================================================================

const SEED_SERVICIOS_VETERINARIOS: ServicioVeterinarioEvento[] = [
  {
    id: 1, predioId: 1, codigo: 'SV-2025-001', fecha: '2025-03-15',
    veterinariosId: 1, observaciones: 'Campaña de desparasitación trimestral',
    veterinarioNombre: 'Dr. Carlos Méndez', totalAnimales: 3, createdAt: '2025-03-15T08:00:00Z',
    animales: [
      { id: 1, eventoId: 1, animalesId: 1, diagnosticosVeterinariosId: 2, medicamentos: 'Ivermectina 1%', dosis: '1ml/50kg', proximaAplicacion: '2025-06-15', observaciones: '', animalCodigo: 'GAN-001', diagnosticoNombre: 'Desparasitación' },
      { id: 2, eventoId: 1, animalesId: 2, diagnosticosVeterinariosId: 2, medicamentos: 'Ivermectina 1%', dosis: '1ml/50kg', proximaAplicacion: '2025-06-15', observaciones: '', animalCodigo: 'GAN-002', diagnosticoNombre: 'Desparasitación' },
      { id: 3, eventoId: 1, animalesId: 3, diagnosticosVeterinariosId: 2, medicamentos: 'Ivermectina 1%', dosis: '1ml/50kg', proximaAplicacion: '2025-06-15', observaciones: 'Animal con parásitos visibles', animalCodigo: 'GAN-003', diagnosticoNombre: 'Desparasitación' },
    ],
  },
  {
    id: 2, predioId: 1, codigo: 'SV-2025-002', fecha: '2025-04-01',
    veterinariosId: 1, observaciones: 'Vacunación contra aftosa',
    veterinarioNombre: 'Dr. Carlos Méndez', totalAnimales: 4, createdAt: '2025-04-01T08:00:00Z',
    animales: [
      { id: 4, eventoId: 2, animalesId: 4, diagnosticosVeterinariosId: 4, medicamentos: 'Vacuna Aftosa', dosis: '2ml IM', proximaAplicacion: '2025-10-01', observaciones: '', animalCodigo: 'GAN-004', diagnosticoNombre: 'Vacunación' },
      { id: 5, eventoId: 2, animalesId: 5, diagnosticosVeterinariosId: 4, medicamentos: 'Vacuna Aftosa', dosis: '2ml IM', proximaAplicacion: '2025-10-01', observaciones: '', animalCodigo: 'GAN-005', diagnosticoNombre: 'Vacunación' },
      { id: 6, eventoId: 2, animalesId: 6, diagnosticosVeterinariosId: 4, medicamentos: 'Vacuna Aftosa', dosis: '2ml IM', proximaAplicacion: '2025-10-01', observaciones: '', animalCodigo: 'GAN-006', diagnosticoNombre: 'Vacunación' },
      { id: 7, eventoId: 2, animalesId: 7, diagnosticosVeterinariosId: 4, medicamentos: 'Vacuna Aftosa', dosis: '2ml IM', proximaAplicacion: '2025-10-01', observaciones: '', animalCodigo: 'GAN-007', diagnosticoNombre: 'Vacunación' },
    ],
  },
  {
    id: 3, predioId: 2, codigo: 'SV-2025-003', fecha: '2025-04-10',
    veterinariosId: 2, observaciones: 'Suplemento vitamínico pre-parto',
    veterinarioNombre: 'Dra. María López', totalAnimales: 3, createdAt: '2025-04-10T08:00:00Z',
    animales: [
      { id: 8, eventoId: 3, animalesId: 8, diagnosticosVeterinariosId: 1, medicamentos: 'Vitamina AD3E', dosis: '5ml IM', proximaAplicacion: '2025-05-10', observaciones: '', animalCodigo: 'GAN-008', diagnosticoNombre: 'Vitaminas' },
      { id: 9, eventoId: 3, animalesId: 9, diagnosticosVeterinariosId: 1, medicamentos: 'Vitamina AD3E', dosis: '5ml IM', proximaAplicacion: '2025-05-10', observaciones: '', animalCodigo: 'GAN-009', diagnosticoNombre: 'Vitaminas' },
      { id: 10, eventoId: 3, animalesId: 10, diagnosticosVeterinariosId: 1, medicamentos: 'Vitamina AD3E', dosis: '5ml IM', proximaAplicacion: '2025-05-10', observaciones: 'Ganado delgado', animalCodigo: 'GAN-010', diagnosticoNombre: 'Vitaminas' },
    ],
  },
  {
    id: 4, predioId: 1, codigo: 'SV-2025-004', fecha: '2025-05-01',
    veterinariosId: 1, observaciones: 'Tratamiento mastitis',
    veterinarioNombre: 'Dr. Carlos Méndez', totalAnimales: 2, createdAt: '2025-05-01T08:00:00Z',
    animales: [
      { id: 11, eventoId: 4, animalesId: 11, diagnosticosVeterinariosId: 3, medicamentos: 'Cefalexina intramamaria', dosis: '1 tubo/cuarto', proximaAplicacion: '2025-05-04', observaciones: 'Mastitis clínica grado 2', animalCodigo: 'GAN-011', diagnosticoNombre: 'Tratamiento' },
      { id: 12, eventoId: 4, animalesId: 12, diagnosticosVeterinariosId: 3, medicamentos: 'Cefalexina intramamaria', dosis: '1 tubo/cuarto', proximaAplicacion: '2025-05-04', observaciones: '', animalCodigo: 'GAN-012', diagnosticoNombre: 'Tratamiento' },
    ],
  },
];

// ============================================================================
// Seed Data — Partos
// ============================================================================

const SEED_PARTOS: Parto[] = [
  { id: 1, predioId: 1, animalesId: 14, fecha: '2026-01-20', machos: 1, hembras: 0, muertos: 0, tipoParto: 'Normal', animalCodigo: 'GAN-014', animalNombre: 'La Negra', totalCrias: 1 },
  { id: 2, predioId: 1, animalesId: 15, fecha: '2026-01-25', machos: 0, hembras: 1, muertos: 0, tipoParto: 'Normal', animalCodigo: 'GAN-015', animalNombre: 'Bella', totalCrias: 1 },
  { id: 3, predioId: 1, animalesId: 17, fecha: '2026-02-08', machos: 1, hembras: 1, muertos: 0, tipoParto: 'Con Ayuda', animalCodigo: 'GAN-017', animalNombre: 'Estrella', totalCrias: 2 },
  { id: 4, predioId: 1, animalesId: 18, fecha: '2026-02-14', machos: 0, hembras: 1, muertos: 0, tipoParto: 'Normal', animalCodigo: 'GAN-018', animalNombre: 'Margarita', totalCrias: 1 },
  { id: 5, predioId: 1, animalesId: 20, fecha: '2026-02-28', machos: 1, hembras: 0, muertos: 1, tipoParto: 'Distocico', observaciones: 'Parto distócico, cría nació muerta', animalCodigo: 'GAN-020', animalNombre: 'Paloma', totalCrias: 2 },
  { id: 6, predioId: 1, animalesId: 19, fecha: '2026-03-05', machos: 0, hembras: 1, muertos: 0, tipoParto: 'Normal', animalCodigo: 'GAN-019', animalNombre: 'Blanca', totalCrias: 1 },
  { id: 7, predioId: 1, animalesId: 22, fecha: '2026-03-18', machos: 1, hembras: 0, muertos: 0, tipoParto: 'Normal', animalCodigo: 'GAN-022', animalNombre: 'Azucena', totalCrias: 1 },
  { id: 8, predioId: 1, animalesId: 16, fecha: '2026-03-25', machos: 0, hembras: 0, muertos: 1, tipoParto: 'Mortinato', observaciones: 'Mortinato, cría no viable', animalCodigo: 'GAN-016', animalNombre: 'Luna', totalCrias: 1 },
  { id: 9, predioId: 1, animalesId: 21, fecha: '2025-12-10', machos: 1, hembras: 1, muertos: 0, tipoParto: 'Con Ayuda', animalCodigo: 'GAN-021', animalNombre: 'Cereza', totalCrias: 2 },
  { id: 10, predioId: 1, animalesId: 23, fecha: '2025-11-15', machos: 0, hembras: 1, muertos: 0, tipoParto: 'Normal', animalCodigo: 'GAN-023', animalNombre: 'Nube', totalCrias: 1 },
];

// ============================================================================
// Helpers
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory stores
let palpacionIdCounter = SEED_PALPACIONES.length + 1;
let palpacionAnimalIdCounter = SEED_PALPACION_ANIMALES.length + 1;
let inseminacionIdCounter = SEED_INSEMINACIONES.length + 1;
let inseminacionAnimalIdCounter = SEED_INSEMINACION_ANIMALES.length + 1;
let partoIdCounter = SEED_PARTOS.length + 1;

let storeServiciosVeterinarios: ServicioVeterinarioEvento[] = SEED_SERVICIOS_VETERINARIOS.map(e => ({ ...e, animales: [...e.animales] }));
let idCounterVeterinarios = Math.max(...SEED_SERVICIOS_VETERINARIOS.map(e => e.id)) + 1;
let servicioVeterinarioAnimalIdCounter = Math.max(...SEED_SERVICIOS_VETERINARIOS.flatMap(e => e.animales.map(a => a.id))) + 1;

const storePalpaciones: PalpacionEvento[] = SEED_PALPACIONES.map(p => ({ ...p, animales: [...p.animales] }));
const storeInseminaciones: InseminacionEvento[] = SEED_INSEMINACIONES.map(i => ({ ...i, animales: [...i.animales] }));
const storePartos: Parto[] = SEED_PARTOS.map(p => ({ ...p }));

function paginate<T>(data: T[], page: number, limit: number): PaginatedEventos<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { data: data.slice(start, start + limit), page, limit, total, totalPages };
}

// ============================================================================
// MockServiciosService
// ============================================================================

export class MockServiciosService implements ServiciosService {
  // Palpaciones
  async getPalpaciones(params: PaginationParams): Promise<PaginatedEventos<PalpacionEvento>> {
    await delay(300);
    const filtered = storePalpaciones.filter(p => p.predioId === params.predioId);
    // Return without animales array for list view (lighter payload)
    const light = filtered.map(({ animales: _, ...rest }) => ({ ...rest, animales: [] }));
    return paginate(light, params.page, params.limit);
  }

  async getPalpacionById(id: number): Promise<PalpacionEvento> {
    await delay(300);
    const evento = storePalpaciones.find(p => p.id === id);
    if (!evento) {
      throw new ApiError(404, 'NOT_FOUND', `Palpación con ID ${id} no encontrada`);
    }
    return { ...evento, animales: [...evento.animales] };
  }

  async createPalpacion(data: CreatePalpacionEventoDto): Promise<PalpacionEvento> {
    await delay(300);
    const newPalpacionId = palpacionIdCounter++;
    const newEvento: PalpacionEvento = {
      id: newPalpacionId,
      predioId: data.predioId,
      codigo: data.codigo,
      fecha: data.fecha,
      veterinariosId: data.veterinariosId,
      observaciones: data.observaciones,
      veterinarioNombre: 'Veterinario Mock',
      totalAnimales: data.animales.length,
      createdAt: new Date().toISOString(),
      animales: data.animales.map((a, idx) => ({
        id: palpacionAnimalIdCounter++,
        eventoId: newPalpacionId,
        animalesId: a.animalesId,
        diagnosticosVeterinariosId: a.diagnosticosVeterinariosId,
        configCondicionesCorporalesId: a.configCondicionesCorporalesId,
        diasGestacion: a.diasGestacion,
        fechaParto: a.fechaParto,
        comentarios: a.comentarios,
        animalCodigo: `GAN-${String(a.animalesId).padStart(3, '0')}`,
        animalNombre: `Animal ${a.animalesId}`,
        diagnosticoNombre: DIAGNOSTICO_MAP[a.diagnosticosVeterinariosId] ?? 'Sin diagnóstico',
        condicionCorporalNombre: CONDICION_MAP[a.configCondicionesCorporalesId] ?? 'Sin condición',
      })),
    };
    storePalpaciones.unshift(newEvento);
    return { ...newEvento };
  }

  // Inseminaciones
  async getInseminaciones(params: PaginationParams): Promise<PaginatedEventos<InseminacionEvento>> {
    await delay(300);
    const filtered = storeInseminaciones.filter(i => i.predioId === params.predioId);
    const light = filtered.map(({ animales: _, ...rest }) => ({ ...rest, animales: [] }));
    return paginate(light, params.page, params.limit);
  }

  async getInseminacionById(id: number): Promise<InseminacionEvento> {
    await delay(300);
    const evento = storeInseminaciones.find(i => i.id === id);
    if (!evento) {
      throw new ApiError(404, 'NOT_FOUND', `Inseminación con ID ${id} no encontrada`);
    }
    return { ...evento, animales: [...evento.animales] };
  }

  async createInseminacion(data: CreateInseminacionEventoDto): Promise<InseminacionEvento> {
    await delay(300);
    const newInseminacionId = inseminacionIdCounter++;
    const newEvento: InseminacionEvento = {
      id: newInseminacionId,
      predioId: data.predioId,
      codigo: data.codigo,
      fecha: data.fecha,
      veterinariosId: data.veterinariosId,
      observaciones: data.observaciones,
      veterinarioNombre: 'Veterinario Mock',
      totalAnimales: data.animales.length,
      createdAt: new Date().toISOString(),
      animales: data.animales.map((a) => ({
        id: inseminacionAnimalIdCounter++,
        eventoId: newInseminacionId,
        animalesId: a.animalesId,
        fecha: a.fecha,
        toro: a.toro,
        pajuela: a.pajuela,
        dosis: a.dosis,
        observaciones: a.observaciones,
        animalCodigo: `GAN-${String(a.animalesId).padStart(3, '0')}`,
        animalNombre: `Animal ${a.animalesId}`,
      })),
    };
    storeInseminaciones.unshift(newEvento);
    return { ...newEvento };
  }

  // Partos
  async getPartos(params: PaginationParams): Promise<PaginatedEventos<Parto>> {
    await delay(300);
    const filtered = storePartos.filter(p => p.predioId === params.predioId);
    return paginate(filtered, params.page, params.limit);
  }

  async getPartoById(id: number): Promise<Parto> {
    await delay(300);
    const parto = storePartos.find(p => p.id === id);
    if (!parto) {
      throw new ApiError(404, 'NOT_FOUND', `Parto con ID ${id} no encontrado`);
    }
    return { ...parto };
  }

  async createParto(data: CreatePartoDto): Promise<Parto> {
    await delay(300);
    const newParto: Parto = {
      id: partoIdCounter++,
      ...data,
      animalCodigo: `GAN-${String(data.animalesId).padStart(3, '0')}`,
      animalNombre: `Animal ${data.animalesId}`,
      totalCrias: data.machos + data.hembras + data.muertos,
    };
    storePartos.unshift(newParto);
    return { ...newParto };
  }

  // Servicios Veterinarios
  async getServiciosVeterinarios(filters: { predioId: number; page: number; limit: number }): Promise<PaginatedServiciosVeterinarios> {
    await delay(300);
    const filtered = storeServiciosVeterinarios.filter(e => e.predioId === filters.predioId);
    const start = (filters.page - 1) * filters.limit;
    const pageData = filtered.slice(start, start + filters.limit);
    return {
      data: pageData,
      total: filtered.length,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(filtered.length / filters.limit),
    };
  }

  async getServicioVeterinarioById(id: number): Promise<ServicioVeterinarioEvento> {
    await delay(300);
    const evento = storeServiciosVeterinarios.find(e => e.id === id);
    if (!evento) {
      throw new ApiError(404, 'NOT_FOUND', `Servicio veterinario con ID ${id} no encontrado`);
    }
    return { ...evento, animales: [...evento.animales] };
  }

  async createServicioVeterinario(data: CreateServicioVeterinarioEventoDto): Promise<ServicioVeterinarioEvento> {
    await delay(300);
    const newEvento: ServicioVeterinarioEvento = {
      id: idCounterVeterinarios++,
      predioId: data.predioId,
      codigo: data.codigo,
      fecha: data.fecha,
      veterinariosId: data.veterinariosId,
      observaciones: data.observaciones,
      veterinarioNombre: 'Veterinario Mock',
      totalAnimales: data.animales.length,
      createdAt: new Date().toISOString(),
      animales: data.animales.map((a) => ({
        id: servicioVeterinarioAnimalIdCounter++,
        eventoId: 0, // Will be set after creation
        ...a,
      })),
    };
    newEvento.animales.forEach(a => { a.eventoId = newEvento.id; });
    storeServiciosVeterinarios.unshift(newEvento);
    return { ...newEvento, animales: [...newEvento.animales] };
  }
}

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetServiciosMock(): void {
  storePalpaciones.length = 0;
  storePalpaciones.push(...SEED_PALPACIONES.map(p => ({ ...p, animales: [...p.animales] })));
  storeInseminaciones.length = 0;
  storeInseminaciones.push(...SEED_INSEMINACIONES.map(i => ({ ...i, animales: [...i.animales] })));
  storePartos.length = 0;
  storePartos.push(...SEED_PARTOS.map(p => ({ ...p })));
  storeServiciosVeterinarios = SEED_SERVICIOS_VETERINARIOS.map(e => ({ ...e, animales: [...e.animales] }));
  palpacionIdCounter = SEED_PALPACIONES.length + 1;
  palpacionAnimalIdCounter = SEED_PALPACION_ANIMALES.length + 1;
  inseminacionIdCounter = SEED_INSEMINACIONES.length + 1;
  inseminacionAnimalIdCounter = SEED_INSEMINACION_ANIMALES.length + 1;
  partoIdCounter = SEED_PARTOS.length + 1;
  idCounterVeterinarios = Math.max(...SEED_SERVICIOS_VETERINARIOS.map(e => e.id)) + 1;
  servicioVeterinarioAnimalIdCounter = Math.max(...SEED_SERVICIOS_VETERINARIOS.flatMap(e => e.animales.map(a => a.id))) + 1;
}

export function resetServiciosVeterinariosMock(): void {
  storeServiciosVeterinarios = SEED_SERVICIOS_VETERINARIOS.map(e => ({ ...e, animales: [...e.animales] }));
  idCounterVeterinarios = Math.max(...SEED_SERVICIOS_VETERINARIOS.map(e => e.id)) + 1;
  servicioVeterinarioAnimalIdCounter = Math.max(...SEED_SERVICIOS_VETERINARIOS.flatMap(e => e.animales.map(a => a.id))) + 1;
}
