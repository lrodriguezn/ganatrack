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
    nombre: 'Finca La Esperanza',
    departamento: 'Cundinamarca',
    municipio: 'Guatavita',
    vereda: 'El Pantano',
    areaHectareas: 120,
    tipo: 'cría',
    estado: 'activo',
  },
  {
    id: 2,
    nombre: 'Hacienda San Pedro',
    departamento: 'Boyacá',
    municipio: 'Duitama',
    areaHectareas: 85,
    tipo: 'lechería',
    estado: 'activo',
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
    const body = await request.json() as Omit<Predio, 'id' | 'estado'>;
    const newPredio: Predio = {
      ...body,
      id: nextId++,
      estado: 'activo',
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

    prediosMock[index] = { ...prediosMock[index], ...body, id };
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
      nombre: 'Finca La Esperanza',
      departamento: 'Cundinamarca',
      municipio: 'Guatavita',
      vereda: 'El Pantano',
      areaHectareas: 120,
      tipo: 'cría',
      estado: 'activo',
    },
    {
      id: 2,
      nombre: 'Hacienda San Pedro',
      departamento: 'Boyacá',
      municipio: 'Duitama',
      areaHectareas: 85,
      tipo: 'lechería',
      estado: 'activo',
    },
  ];
  nextId = 3;
}
