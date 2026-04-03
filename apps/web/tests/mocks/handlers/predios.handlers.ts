// apps/web/tests/mocks/handlers/predios.handlers.ts
/**
 * MSW Handlers for Predios API.
 */

import { http, HttpResponse } from 'msw';

const mockPredios = [
  { id: 1, nombre: 'Finca La Esperanza', departamento: 'Antioquia', municipio: 'Jerusalén', vereda: 'El Centro', hectares: 150, tipo: 'doble propósito', estado: 'activo' },
  { id: 2, nombre: 'Finca El Progreso', departamento: 'Cundinamarca', municipio: 'Villeta', vereda: 'La Mesa', hectares: 200, tipo: 'lechería', estado: 'activo' },
];

let idCounter = mockPredios.length + 1;

export const prediosHandlers = [
  http.get('*/api/v1/predios', () => HttpResponse.json(mockPredios)),

  http.get('*/api/v1/predios/:id', ({ params }) => {
    const id = Number(params.id);
    const predio = mockPredios.find(p => p.id === id);
    if (!predio) return HttpResponse.json({ message: `Predio con ID ${id} no encontrado` }, { status: 404 });
    return HttpResponse.json(predio);
  }),

  http.post('*/api/v1/predios', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newPredio = { id: idCounter++, ...body, estado: 'activo' };
    mockPredios.push(newPredio);
    return HttpResponse.json(newPredio, { status: 201 });
  }),

  http.put('*/api/v1/predios/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockPredios.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: `Predio con ID ${id} no encontrado` }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    mockPredios[index] = { ...mockPredios[index], ...body };
    return HttpResponse.json(mockPredios[index]);
  }),

  http.delete('*/api/v1/predios/:id', ({ params }) => {
    const id = Number(params.id);
    const index = mockPredios.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: `Predio con ID ${id} no encontrado` }, { status: 404 });
    mockPredios[index].estado = 'inactivo';
    return new HttpResponse(null, { status: 204 });
  }),

  // Sub-resources
  http.get('*/api/v1/predios/:predioId/potreros', () => HttpResponse.json([
    { id: 1, predioId: 1, codigo: 'POT-001', nombre: 'Potrero Norte', hectares: 30, tipoPasto: 'Brachiaria', capacidadMaxima: 50, estado: 'activo' },
    { id: 2, predioId: 1, codigo: 'POT-002', nombre: 'Potrero Sur', hectares: 25, tipoPasto: 'Estrella', capacidadMaxima: 40, estado: 'activo' },
  ])),

  http.get('*/api/v1/predios/:predioId/sectores', () => HttpResponse.json([])),
  http.get('*/api/v1/predios/:predioId/lotes', () => HttpResponse.json([])),
  http.get('*/api/v1/predios/:predioId/grupos', () => HttpResponse.json([])),
];

export function resetPrediosMock(): void {
  mockPredios.length = 0;
  mockPredios.push(
    { id: 1, nombre: 'Finca La Esperanza', departamento: 'Antioquia', municipio: 'Jerusalén', vereda: 'El Centro', hectares: 150, tipo: 'doble propósito', estado: 'activo' },
    { id: 2, nombre: 'Finca El Progreso', departamento: 'Cundinamarca', municipio: 'Villeta', vereda: 'La Mesa', hectares: 200, tipo: 'lechería', estado: 'activo' },
  );
  idCounter = 3;
}
