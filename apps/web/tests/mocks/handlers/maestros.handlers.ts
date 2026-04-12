// apps/web/tests/mocks/handlers/maestros.handlers.ts
/**
 * MSW Handlers for Maestros API — all 8 entity types.
 *
 * Provides mock handlers for:
 * - GET /api/v1/maestros/:tipo?page=&limit=&search=
 * - POST /api/v1/maestros/:tipo
 * - PUT /api/v1/maestros/:tipo/:id
 * - DELETE /api/v1/maestros/:tipo/:id
 *
 * Entities:
 * - veterinarios, propietarios, hierros, diagnosticos
 * - motivos-ventas, causas-muerte, lugares-compras, lugares-ventas
 */

import { http, HttpResponse } from 'msw';

// ============================================================================
// Seed data — matches maestros.mock.ts
// ============================================================================

const SEED_VETERINARIOS = [
  { id: 1, nombre: 'Dr. Carlos Rodríguez Pérez', especialidad: 'Medicina Interna Bovina', telefono: '3101234567', email: 'c.rodriguez@vetcol.com', direccion: null, numeroRegistro: 'RV-001', activo: true },
  { id: 2, nombre: 'Dra. Ana María Gómez', especialidad: 'Reproducción Animal', telefono: '3152345678', email: 'a.gomez@clinicaveterinaria.co', direccion: null, numeroRegistro: 'RV-002', activo: true },
  { id: 3, nombre: 'Dr. Luis Fernando Torres', especialidad: 'Cirugía Veterinaria', telefono: '3003456789', email: 'lf.torres@vet.com', direccion: null, numeroRegistro: 'RV-003', activo: true },
];

const SEED_PROPIETARIOS = [
  { id: 1, nombre: 'Hernando Martínez Suárez', tipoDocumento: 'CC', numeroDocumento: '17234567', telefono: '3105678901', email: 'hmartinez@gmail.com', direccion: null, activo: true },
  { id: 2, nombre: 'María Elena Castillo Rojas', tipoDocumento: 'CC', numeroDocumento: '52345678', telefono: '3116789012', email: 'mecastillo@hotmail.com', direccion: null, activo: true },
  { id: 3, nombre: 'José Alirio Restrepo Montoya', tipoDocumento: 'CC', numeroDocumento: '98765432', telefono: '3127890123', email: 'jarestrepo@yahoo.com', direccion: null, activo: true },
];

const SEED_HIERROS = [
  { id: 1, nombre: 'Hierro Principal Finca La Esperanza', descripcion: 'Marca oficial de la finca para ganado Brahman', activo: true },
  { id: 2, nombre: 'Hierro Hacienda El Roble', descripcion: 'Hierro de identificación para hembras reproductoras', activo: true },
  { id: 3, nombre: 'Hierro San José Levante', descripcion: 'Hierro para animales en etapa de levante', activo: true },
];

const SEED_DIAGNOSTICOS = [
  { id: 1, nombre: 'Brucelosis', descripcion: 'Infección bacteriana causada por Brucella abortus', categoria: 'Enfermedad Infecciosa', activo: true },
  { id: 2, nombre: 'Fiebre Aftosa', descripcion: 'Enfermedad viral altamente contagiosa', categoria: 'Enfermedad Viral', activo: true },
  { id: 3, nombre: 'Mastitis Crónica', descripcion: 'Inflamación crónica de la glándula mamaria', categoria: 'Enfermedad de la Ubre', activo: true },
];

const SEED_MOTIVOS_VENTAS = [
  { id: 1, nombre: 'Descarte por Edad', descripcion: 'Animal supera la edad productiva recomendada', activo: true },
  { id: 2, nombre: 'Baja Producción', descripcion: 'Producción por debajo del umbral rentable', activo: true },
  { id: 3, nombre: 'Problemas Reproductivos', descripcion: 'Fallas repetidas en ciclos reproductivos', activo: true },
];

const SEED_CAUSAS_MUERTE = [
  { id: 1, nombre: 'Septicemia', descripcion: 'Infección bacteriana generalizada en sangre', activo: true },
  { id: 2, nombre: 'Timpanismo Espumoso', descripcion: 'Acumulación excesiva de gas en rumen', activo: true },
  { id: 3, nombre: 'Complicaciones de Parto', descripcion: 'Muerte relacionada con parto distócico', activo: true },
];

const SEED_LUGARES_COMPRAS = [
  { id: 1, nombre: 'Subasta Ganadera de Medellín', tipo: 'Subasta', ubicacion: 'Medellín, Antioquia', contacto: 'Carlos Mario Zapata', telefono: '6042511234', activo: true },
  { id: 2, nombre: 'Feria de Ganado de Montería', tipo: 'Feria', ubicacion: 'Montería, Córdoba', contacto: 'Pedro Luis Mendoza', telefono: '6047861234', activo: true },
  { id: 3, nombre: 'Subasta San Martín', tipo: 'Subasta', ubicacion: 'San Martín, Meta', contacto: 'Jorge Eliecer Rodríguez', telefono: '6086321234', activo: true },
];

const SEED_LUGARES_VENTAS = [
  { id: 1, nombre: 'Frigorífico Guadalupe', tipo: 'Frigorífico', ubicacion: 'Bogotá, Cundinamarca', contacto: 'Javier Hernández', telefono: '6014561234', activo: true },
  { id: 2, nombre: 'Frigorífico Concasa', tipo: 'Frigorífico', ubicacion: 'Medellín, Antioquia', contacto: 'Alberto Torres', telefono: '6042341234', activo: true },
  { id: 3, nombre: 'Cooperativa Lechera de Antioquia', tipo: 'Cooperativa', ubicacion: 'Don Matías, Antioquia', contacto: 'María Elena Guerrero', telefono: '6045111234', activo: true },
];

// ============================================================================
// In-memory store
// ============================================================================

const store: Record<string, Record<string, unknown>[]> = {
  veterinarios: [...SEED_VETERINARIOS],
  propietarios: [...SEED_PROPIETARIOS],
  hierros: [...SEED_HIERROS],
  diagnosticos: [...SEED_DIAGNOSTICOS],
  'motivos-ventas': [...SEED_MOTIVOS_VENTAS],
  'causas-muerte': [...SEED_CAUSAS_MUERTE],
  'lugares-compras': [...SEED_LUGARES_COMPRAS],
  'lugares-ventas': [...SEED_LUGARES_VENTAS],
};

const idCounters: Record<string, number> = {
  veterinarios: 100,
  propietarios: 100,
  hierros: 100,
  diagnosticos: 100,
  'motivos-ventas': 100,
  'causas-muerte': 100,
  'lugares-compras': 100,
  'lugares-ventas': 100,
};

// ============================================================================
// Handlers
// ============================================================================

export const maestrosHandlers = [
  // GET /api/v1/maestros/:tipo — list maestros by type with pagination
  http.get('*/api/v1/maestros/:tipo', ({ params, request }) => {
    const tipo = params.tipo as string;
    const data = store[tipo];

    if (!data) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Tipo de maestro "${tipo}" no encontrado` } },
        { status: 404 },
      );
    }

    // Parse URL for pagination/search
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const search = url.searchParams.get('search') || '';

    let items = [...data];

    // Apply search filter
    if (search) {
      const lower = search.toLowerCase();
      items = items.filter((item) =>
        (item.nombre as string)?.toLowerCase().includes(lower),
      );
    }

    const total = items.length;
    const offset = (page - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    return HttpResponse.json({
      success: true,
      data: paginated,
      meta: { page, limit, total },
    });
  }),

  // POST /api/v1/maestros/:tipo — create maestro
  http.post('*/api/v1/maestros/:tipo', async ({ params, request }) => {
    const tipo = params.tipo as string;
    const data = store[tipo];

    if (!data) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Tipo de maestro "${tipo}" no encontrado` } },
        { status: 404 },
      );
    }

    const body = await request.json() as Record<string, unknown>;
    const newId = idCounters[tipo]!++;

    const newItem = {
      id: newId,
      activo: true,
      ...body,
    };

    data.push(newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),

  // PUT /api/v1/maestros/:tipo/:id — update maestro
  http.put('*/api/v1/maestros/:tipo/:id', async ({ params, request }) => {
    const tipo = params.tipo as string;
    const id = Number(params.id);
    const data = store[tipo];

    if (!data) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Tipo de maestro "${tipo}" no encontrado` } },
        { status: 404 },
      );
    }

    const index = data.findIndex((m: Record<string, unknown>) => m.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Registro con ID ${id} no encontrado` } },
        { status: 404 },
      );
    }

    const body = await request.json() as Record<string, unknown>;
    data[index] = { ...data[index], ...body };
    return HttpResponse.json({ success: true, data: data[index] });
  }),

  // DELETE /api/v1/maestros/:tipo/:id — delete maestro
  http.delete('*/api/v1/maestros/:tipo/:id', ({ params }) => {
    const tipo = params.tipo as string;
    const id = Number(params.id);
    const data = store[tipo];

    if (!data) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Tipo de maestro "${tipo}" no encontrado` } },
        { status: 404 },
      );
    }

    const index = data.findIndex((m: Record<string, unknown>) => m.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Registro con ID ${id} no encontrado` } },
        { status: 404 },
      );
    }

    data.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
