// apps/web/src/tests/mocks/handlers/maestros.handlers.ts
/**
 * MSW Handlers for Maestros API.
 *
 * Provides mock handlers for:
 * - GET /api/v1/maestros/:tipo
 * - POST /api/v1/maestros
 * - PUT /api/v1/maestros/:id
 * - DELETE /api/v1/maestros/:id
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

// Seed data for different maestro types
const SEED_MAESTROS: Record<string, Array<{ id: number; nombre: string; descripcion?: string; activo: boolean }>> = {
  razas: [
    { id: 1, nombre: 'Brahman', descripcion: 'Raza cebuina de carne', activo: true },
    { id: 2, nombre: 'Holstein', descripcion: 'Raza lechera', activo: true },
    { id: 3, nombre: 'Romosinuano', descripcion: 'Raza criolla colombiana', activo: true },
    { id: 4, nombre: 'Nelore', descripcion: 'Raza cebuina de carne', activo: true },
    { id: 5, nombre: 'Simmental', descripcion: 'Raza doble proposito', activo: true },
    { id: 6, nombre: 'Gyr', descripcion: 'Raza cebuina lechera', activo: true },
    { id: 7, nombre: 'Criollo', descripcion: 'Raza criolla', activo: true },
  ],
  estados_animal: [
    { id: 0, nombre: 'Activo', activo: true },
    { id: 1, nombre: 'Vendido', activo: true },
    { id: 2, nombre: 'Muerto', activo: true },
    { id: 3, nombre: 'En tratamiento', activo: true },
    { id: 99, nombre: 'Inactivo', activo: false },
  ],
  tipos_ingreso: [
    { id: 0, nombre: 'Nacido en el Predio', activo: true },
    { id: 1, nombre: 'Comprado', activo: true },
    { id: 2, nombre: 'Transferido', activo: true },
  ],
  tipos_padre: [
    { id: 0, nombre: 'Natural', activo: true },
    { id: 1, nombre: 'Inseminación Artificial', activo: true },
  ],
  salud_animal: [
    { id: 0, nombre: 'Sano', activo: true },
    { id: 1, nombre: 'En tratamiento', activo: true },
    { id: 2, nombre: 'En cuarentena', activo: true },
  ],
  diagnosticos: [
    { id: 1, nombre: 'Enfermedad respiratoria', activo: true },
    { id: 2, nombre: 'Parásitos', activo: true },
    { id: 3, nombre: 'Herida', activo: true },
    { id: 4, nombre: 'Infección', activo: true },
    { id: 5, nombre: 'Muerte natural', activo: true },
  ],
  causas_muerte: [
    { id: 1, nombre: 'Enfermedad', activo: true },
    { id: 2, nombre: 'Accidente', activo: true },
    { id: 3, nombre: 'Depredación', activo: true },
  ],
  lugares_venta: [
    { id: 1, nombre: 'Subasta Ganadera', activo: true },
    { id: 2, nombre: 'Venta Directa', activo: true },
    { id: 3, nombre: 'Feria Ganadera', activo: true },
  ],
};

const storeMaestros = JSON.parse(JSON.stringify(SEED_MAESTROS));
let idCounter = 100;

export const maestrosHandlers = [
  // GET /api/v1/maestros/:tipo — list maestros by type
  http.get(`${BASE_URL}/api/v1/maestros/:tipo`, ({ params }) => {
    const tipo = params.tipo as string;
    const data = storeMaestros[tipo];

    if (!data) {
      return HttpResponse.json(
        { message: `Tipo de maestro "${tipo}" no encontrado` },
        { status: 404 }
      );
    }

    return HttpResponse.json(data.filter((m: { activo: boolean }) => m.activo));
  }),

  // POST /api/v1/maestros — create maestro
  http.post(`${BASE_URL}/api/v1/maestros`, async ({ request }) => {
    const body = await request.json() as { tipo: string; nombre: string; descripcion?: string };

    if (!storeMaestros[body.tipo]) {
      return HttpResponse.json(
        { message: `Tipo de maestro "${body.tipo}" no encontrado` },
        { status: 400 }
      );
    }

    const newMaestro = {
      id: idCounter++,
      nombre: body.nombre,
      descripcion: body.descripcion,
      activo: true,
    };

    storeMaestros[body.tipo].push(newMaestro);
    return HttpResponse.json(newMaestro, { status: 201 });
  }),

  // PUT /api/v1/maestros/:id — update maestro
  http.put(`${BASE_URL}/api/v1/maestros/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json() as Record<string, unknown>;

    // Search across all types
    for (const tipo of Object.keys(storeMaestros)) {
      const index = storeMaestros[tipo].findIndex((m: { id: number }) => m.id === id);
      if (index !== -1) {
        storeMaestros[tipo][index] = { ...storeMaestros[tipo][index], ...body };
        return HttpResponse.json(storeMaestros[tipo][index]);
      }
    }

    return HttpResponse.json(
      { message: `Maestro con ID ${id} no encontrado` },
      { status: 404 }
    );
  }),

  // DELETE /api/v1/maestros/:id — deactivate maestro
  http.delete(`${BASE_URL}/api/v1/maestros/:id`, ({ params }) => {
    const id = Number(params.id);

    for (const tipo of Object.keys(storeMaestros)) {
      const index = storeMaestros[tipo].findIndex((m: { id: number }) => m.id === id);
      if (index !== -1) {
        storeMaestros[tipo][index].activo = false;
        return new HttpResponse(null, { status: 204 });
      }
    }

    return HttpResponse.json(
      { message: `Maestro con ID ${id} no encontrado` },
      { status: 404 }
    );
  }),
];
