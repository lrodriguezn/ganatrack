// apps/web/src/tests/mocks/handlers/predios.handlers.ts
/**
 * MSW v2 handlers for predios endpoints.
 * Covers: GET list, POST create, PUT update, DELETE remove
 */
import { http, HttpResponse } from 'msw';
import type { Predio } from '@ganatrack/shared-types';

const BASE_URL = 'http://localhost:3000';

// In-memory predios dataset para tests
let prediosMock: Predio[] = [
  {
    id: 1,
    codigo: 'P001',
    nombre: 'Finca La Esperanza',
    departamento: 'Cundinamarca',
    municipio: 'Guatavita',
    vereda: 'El Pantano',
    areaHectareas: 120,
    tipoExplotacionId: 1,
    activo: 1,
  },
  {
    id: 2,
    codigo: 'P002',
    nombre: 'Hacienda San Pedro',
    departamento: 'Boyacá',
    municipio: 'Duitama',
    areaHectareas: 85,
    tipoExplotacionId: 2,
    activo: 1,
  },
];

let nextId = 3;

export const prediosHandlers = [
  /**
   * GET /api/v1/predios
   * Returns list of predios.
   */
  http.get(`${BASE_URL}/api/v1/predios`, () => {
    return HttpResponse.json(prediosMock);
  }),

  /**
   * POST /api/v1/predios
   * Creates a new predio.
   */
  http.post(`${BASE_URL}/api/v1/predios`, async ({ request }) => {
    const body = await request.json() as Omit<Predio, 'id'>;
    const newPredio: Predio = {
      ...body,
      id: nextId++,
      activo: 1,
    };
    prediosMock.push(newPredio);
    return HttpResponse.json(newPredio, { status: 201 });
  }),

  /**
   * PUT /api/v1/predios/:id
   * Updates an existing predio.
   */
  http.put(`${BASE_URL}/api/v1/predios/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json() as Partial<Predio>;

    const index = prediosMock.findIndex((p) => p.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Predio no encontrado', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    prediosMock[index] = { ...prediosMock[index], ...body, id } as Predio;
    return HttpResponse.json(prediosMock[index]);
  }),

  /**
   * DELETE /api/v1/predios/:id
   * Removes a predio.
   */
  http.delete(`${BASE_URL}/api/v1/predios/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = prediosMock.findIndex((p) => p.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Predio no encontrado', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    prediosMock.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

/**
 * Reset mock data to initial state (use in tests' beforeEach).
 */
export function resetPrediosMock(): void {
  prediosMock = [
    {
      id: 1,
      codigo: 'P001',
      nombre: 'Finca La Esperanza',
      departamento: 'Cundinamarca',
      municipio: 'Guatavita',
      vereda: 'El Pantano',
      areaHectareas: 120,
      tipoExplotacionId: 1,
      activo: 1,
    },
    {
      id: 2,
      codigo: 'P002',
      nombre: 'Hacienda San Pedro',
      departamento: 'Boyacá',
      municipio: 'Duitama',
      areaHectareas: 85,
      tipoExplotacionId: 2,
      activo: 1,
    },
  ];
  nextId = 3;
}
