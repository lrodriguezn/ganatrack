// apps/web/src/modules/maestros/services/maestros.mock.ts
/**
 * Mock Maestros Service — simulates maestros API for development.
 *
 * Provides realistic Colombian cattle farm data with 3-5 items per entity.
 * In-memory arrays support full CRUD operations.
 *
 * Simulated delays: 300ms for all operations.
 */

import { ApiError } from '@/shared/lib/errors';
import type {
  CreateMaestroDto,
  MaestroBase,
  MaestroTipo,
  Veterinario,
  Propietario,
  Hierro,
  Diagnostico,
  MotivoVenta,
  CausaMuerte,
  LugarCompra,
  LugarVenta,
} from '../types/maestro.types';
import type { MaestrosService } from './maestros.service';

// ============================================================================
// Seed Data — Colombian Cattle Farm Maestros
// ============================================================================

const SEED_VETERINARIOS: Veterinario[] = [
  { id: 1, nombre: 'Dr. Carlos Rodríguez Pérez', especialidad: 'Medicina Interna Bovina', telefono: '3101234567', email: 'c.rodriguez@vetcol.com', activo: true },
  { id: 2, nombre: 'Dra. Ana María Gómez', especialidad: 'Reproducción Animal', telefono: '3152345678', email: 'a.gomez@clinicaveterinaria.co', activo: true },
  { id: 3, nombre: 'Dr. Luis Fernando Torres', especialidad: 'Cirugía Veterinaria', telefono: '3003456789', email: 'lf.torres@vet.com', activo: true },
  { id: 4, nombre: 'Dra. Marcela Ospina Vargas', especialidad: 'Sanidad Animal', telefono: '3204567890', email: 'm.ospina@agropecuaria.com', activo: false },
];

const SEED_PROPIETARIOS: Propietario[] = [
  { id: 1, nombre: 'Hernando Martínez Suárez', documento: '17234567', telefono: '3105678901', email: 'hmartinez@gmail.com', activo: true },
  { id: 2, nombre: 'María Elena Castillo Rojas', documento: '52345678', telefono: '3116789012', email: 'mecastillo@hotmail.com', activo: true },
  { id: 3, nombre: 'José Alirio Restrepo Montoya', documento: '98765432', telefono: '3127890123', email: 'jarestrepo@yahoo.com', activo: true },
  { id: 4, nombre: 'Agroganadería La Palma S.A.S.', documento: '900123456', telefono: '6014567890', email: 'info@lapalma.com.co', activo: true },
  { id: 5, nombre: 'Pedro Antonio Acosta Herrera', documento: '11223344', telefono: '3138901234', email: 'pacosta@correo.co', activo: false },
];

const SEED_HIERROS: Hierro[] = [
  { id: 1, nombre: 'Hierro Principal Finca La Esperanza', codigo: 'HFE-001', descripcion: 'Marca oficial de la finca para ganado Brahman', activo: true },
  { id: 2, nombre: 'Hierro Hacienda El Roble', codigo: 'HER-002', descripcion: 'Hierro de identificación para hembras reproductoras', activo: true },
  { id: 3, nombre: 'Hierro San José Levante', codigo: 'HSJ-003', descripcion: 'Hierro para animales en etapa de levante', activo: true },
  { id: 4, nombre: 'Hierro Santa María Engorde', codigo: 'HSM-004', descripcion: 'Identificación de lotes de engorde', activo: true },
];

const SEED_DIAGNOSTICOS: Diagnostico[] = [
  { id: 1, nombre: 'Brucelosis', descripcion: 'Infección bacteriana causada por Brucella abortus', tipo: 'Enfermedad Infecciosa', activo: true },
  { id: 2, nombre: 'Fiebre Aftosa', descripcion: 'Enfermedad viral altamente contagiosa de pezuñas y boca', tipo: 'Enfermedad Viral', activo: true },
  { id: 3, nombre: 'Mastitis Crónica', descripcion: 'Inflamación crónica de la glándula mamaria', tipo: 'Enfermedad de la Ubre', activo: true },
  { id: 4, nombre: 'Carbón Sintomático', descripcion: 'Enfermedad bacteriana causada por Clostridium chauvoei', tipo: 'Enfermedad Clostridial', activo: true },
  { id: 5, nombre: 'Estomatitis Vesicular', descripcion: 'Enfermedad viral que afecta mucosas y pezuñas', tipo: 'Enfermedad Viral', activo: false },
];

const SEED_MOTIVOS_VENTAS: MotivoVenta[] = [
  { id: 1, nombre: 'Descarte por Edad', descripcion: 'Animal supera la edad productiva recomendada', activo: true },
  { id: 2, nombre: 'Baja Producción', descripcion: 'Producción de leche o carne por debajo del umbral rentable', activo: true },
  { id: 3, nombre: 'Problemas Reproductivos', descripcion: 'Fallas repetidas en ciclos reproductivos', activo: true },
  { id: 4, nombre: 'Venta Comercial', descripcion: 'Venta planificada al mercado de carne o leche', activo: true },
];

const SEED_CAUSAS_MUERTE: CausaMuerte[] = [
  { id: 1, nombre: 'Septicemia', descripcion: 'Infección bacteriana generalizada en sangre', activo: true },
  { id: 2, nombre: 'Timpanismo Espumoso', descripcion: 'Acumulación excesiva de gas en rumen', activo: true },
  { id: 3, nombre: 'Distorsión Abomasal', descripcion: 'Desplazamiento del abomaso de su posición normal', activo: true },
  { id: 4, nombre: 'Complicaciones de Parto', descripcion: 'Muerte relacionada con parto distócico o complicaciones post-parto', activo: true },
  { id: 5, nombre: 'Accidente', descripcion: 'Muerte por causa accidental: caída, traumatismo, etc.', activo: true },
];

const SEED_LUGARES_COMPRAS: LugarCompra[] = [
  { id: 1, nombre: 'Subasta Ganadera de Medellín', municipio: 'Medellín', departamento: 'Antioquia', activo: true },
  { id: 2, nombre: 'Feria de Ganado de Montería', municipio: 'Montería', departamento: 'Córdoba', activo: true },
  { id: 3, nombre: 'Subasta San Martín', municipio: 'San Martín', departamento: 'Meta', activo: true },
  { id: 4, nombre: 'Finca El Paraíso - Proveedor', municipio: 'La Ceja', departamento: 'Antioquia', activo: true },
];

const SEED_LUGARES_VENTAS: LugarVenta[] = [
  { id: 1, nombre: 'Frigorífico Guadalupe', municipio: 'Bogotá', departamento: 'Cundinamarca', activo: true },
  { id: 2, nombre: 'Frigorífico Concasa', municipio: 'Medellín', departamento: 'Antioquia', activo: true },
  { id: 3, nombre: 'Cooperativa Lechera de Antioquia - Colanta', municipio: 'Don Matías', departamento: 'Antioquia', activo: true },
  { id: 4, nombre: 'Subasta Ganadera de Montería', municipio: 'Montería', departamento: 'Córdoba', activo: true },
  { id: 5, nombre: 'Mercado Ganadero Regional', municipio: 'Villavicencio', departamento: 'Meta', activo: false },
];

// ============================================================================
// In-Memory State (mutable for CRUD operations)
// ============================================================================

type DataStore = {
  veterinarios: Veterinario[];
  propietarios: Propietario[];
  hierros: Hierro[];
  diagnosticos: Diagnostico[];
  'motivos-ventas': MotivoVenta[];
  'causas-muerte': CausaMuerte[];
  'lugares-compras': LugarCompra[];
  'lugares-ventas': LugarVenta[];
};

let store: DataStore = {
  veterinarios: [...SEED_VETERINARIOS],
  propietarios: [...SEED_PROPIETARIOS],
  hierros: [...SEED_HIERROS],
  diagnosticos: [...SEED_DIAGNOSTICOS],
  'motivos-ventas': [...SEED_MOTIVOS_VENTAS],
  'causas-muerte': [...SEED_CAUSAS_MUERTE],
  'lugares-compras': [...SEED_LUGARES_COMPRAS],
  'lugares-ventas': [...SEED_LUGARES_VENTAS],
};

const idCounters: Record<MaestroTipo, number> = {
  veterinarios: Math.max(...SEED_VETERINARIOS.map(v => v.id)) + 1,
  propietarios: Math.max(...SEED_PROPIETARIOS.map(v => v.id)) + 1,
  hierros: Math.max(...SEED_HIERROS.map(v => v.id)) + 1,
  diagnosticos: Math.max(...SEED_DIAGNOSTICOS.map(v => v.id)) + 1,
  'motivos-ventas': Math.max(...SEED_MOTIVOS_VENTAS.map(v => v.id)) + 1,
  'causas-muerte': Math.max(...SEED_CAUSAS_MUERTE.map(v => v.id)) + 1,
  'lugares-compras': Math.max(...SEED_LUGARES_COMPRAS.map(v => v.id)) + 1,
  'lugares-ventas': Math.max(...SEED_LUGARES_VENTAS.map(v => v.id)) + 1,
};

// ============================================================================
// Delay helper
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// MockMaestrosService
// ============================================================================

export class MockMaestrosService implements MaestrosService {
  async getAll(tipo: MaestroTipo): Promise<MaestroBase[]> {
    await delay(300);
    return [...(store[tipo] as MaestroBase[])];
  }

  async create(tipo: MaestroTipo, data: CreateMaestroDto): Promise<MaestroBase> {
    await delay(300);
    const newItem = {
      id: idCounters[tipo]++,
      activo: true,
      ...data,
    } as MaestroBase;
    (store[tipo] as MaestroBase[]).push(newItem);
    return { ...newItem };
  }

  async update(tipo: MaestroTipo, id: number, data: Partial<CreateMaestroDto>): Promise<MaestroBase> {
    await delay(300);
    const items = store[tipo] as MaestroBase[];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Registro con ID ${id} no encontrado`);
    }
    items[index] = { ...items[index], ...data } as MaestroBase;
    return { ...items[index] };
  }

  async remove(tipo: MaestroTipo, id: number): Promise<void> {
    await delay(300);
    const items = store[tipo] as MaestroBase[];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Registro con ID ${id} no encontrado`);
    }
    items.splice(index, 1);
  }
}

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetMaestrosMock(): void {
  store = {
    veterinarios: [...SEED_VETERINARIOS],
    propietarios: [...SEED_PROPIETARIOS],
    hierros: [...SEED_HIERROS],
    diagnosticos: [...SEED_DIAGNOSTICOS],
    'motivos-ventas': [...SEED_MOTIVOS_VENTAS],
    'causas-muerte': [...SEED_CAUSAS_MUERTE],
    'lugares-compras': [...SEED_LUGARES_COMPRAS],
    'lugares-ventas': [...SEED_LUGARES_VENTAS],
  };
  idCounters.veterinarios = Math.max(...SEED_VETERINARIOS.map(v => v.id)) + 1;
  idCounters.propietarios = Math.max(...SEED_PROPIETARIOS.map(v => v.id)) + 1;
  idCounters.hierros = Math.max(...SEED_HIERROS.map(v => v.id)) + 1;
  idCounters.diagnosticos = Math.max(...SEED_DIAGNOSTICOS.map(v => v.id)) + 1;
  idCounters['motivos-ventas'] = Math.max(...SEED_MOTIVOS_VENTAS.map(v => v.id)) + 1;
  idCounters['causas-muerte'] = Math.max(...SEED_CAUSAS_MUERTE.map(v => v.id)) + 1;
  idCounters['lugares-compras'] = Math.max(...SEED_LUGARES_COMPRAS.map(v => v.id)) + 1;
  idCounters['lugares-ventas'] = Math.max(...SEED_LUGARES_VENTAS.map(v => v.id)) + 1;
}
