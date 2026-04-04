// apps/web/src/tests/mocks/handlers/servicios.handlers.ts
/**
 * MSW Handlers for Servicios API (palpaciones, inseminaciones, partos, servicios/veterinarios).
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

const mockPalpaciones = [
  { id: 1, animalId: 1, animalCodigo: 'GAN-001', fecha: '2026-03-15', resultado: 'positivo', mesesGestacion: 3, veterinarioId: 2, observaciones: 'Preñada confirmada' },
  { id: 2, animalId: 14, animalCodigo: 'GAN-014', fecha: '2026-03-20', resultado: 'negativo', mesesGestacion: null, veterinarioId: 2, observaciones: 'No preñada' },
];

const mockInseminaciones = [
  { id: 1, animalId: 14, animalCodigo: 'GAN-014', fecha: '2026-02-10', toroId: 1, toroCodigo: 'GAN-001', tecnica: 'IA convencional', resultado: 'pendiente' },
];

const mockPartos = [
  { id: 1, animalId: 14, animalCodigo: 'GAN-014', fecha: '2026-01-05', tipoParto: 'normal', sexoCria: 0, pesoCria: 35, observaciones: 'Parto sin complicaciones' },
];

const mockServiciosVeterinarios: Array<{
  id: number;
  predioId: number;
  codigo: string;
  fecha: string;
  veterinariosId: number;
  observaciones: string;
  totalAnimales: number;
  createdAt: string;
}> = [
  {
    id: 1, predioId: 1, codigo: 'SV-2025-001', fecha: '2025-03-15',
    veterinariosId: 1, observaciones: 'Campaña de desparasitación',
    totalAnimales: 3, createdAt: '2025-03-15T08:00:00Z',
  },
  {
    id: 2, predioId: 1, codigo: 'SV-2025-002', fecha: '2025-04-01',
    veterinariosId: 1, observaciones: 'Vacunación aftosa',
    totalAnimales: 4, createdAt: '2025-04-01T08:00:00Z',
  },
];

let palpId = mockPalpaciones.length + 1;
let insId = mockInseminaciones.length + 1;
let partoId = mockPartos.length + 1;
let servicioVetId = mockServiciosVeterinarios.length + 1;

export const serviciosHandlers = [
  // Palpaciones
  http.get(`${BASE_URL}/api/v1/servicios/palpaciones`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const total = mockPalpaciones.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = mockPalpaciones.slice(start, start + limit);
    return HttpResponse.json({ data, page, limit, total, totalPages });
  }),
  http.post(`${BASE_URL}/api/v1/servicios/palpaciones`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newPalp = { id: palpId++, ...body };
    mockPalpaciones.push(newPalp);
    return HttpResponse.json(newPalp, { status: 201 });
  }),
  http.put(`${BASE_URL}/api/v1/servicios/palpaciones/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockPalpaciones.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    mockPalpaciones[index] = { ...mockPalpaciones[index], ...body };
    return HttpResponse.json(mockPalpaciones[index]);
  }),
  http.delete(`${BASE_URL}/api/v1/servicios/palpaciones/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = mockPalpaciones.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    mockPalpaciones.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Inseminaciones
  http.get(`${BASE_URL}/api/v1/servicios/inseminaciones`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const total = mockInseminaciones.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = mockInseminaciones.slice(start, start + limit);
    return HttpResponse.json({ data, page, limit, total, totalPages });
  }),
  http.post(`${BASE_URL}/api/v1/servicios/inseminaciones`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newIns = { id: insId++, ...body };
    mockInseminaciones.push(newIns);
    return HttpResponse.json(newIns, { status: 201 });
  }),
  http.put(`${BASE_URL}/api/v1/servicios/inseminaciones/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockInseminaciones.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    mockInseminaciones[index] = { ...mockInseminaciones[index], ...body };
    return HttpResponse.json(mockInseminaciones[index]);
  }),
  http.delete(`${BASE_URL}/api/v1/servicios/inseminaciones/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = mockInseminaciones.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    mockInseminaciones.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Partos
  http.get(`${BASE_URL}/api/v1/servicios/partos`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const total = mockPartos.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = mockPartos.slice(start, start + limit);
    return HttpResponse.json({ data, page, limit, total, totalPages });
  }),
  http.post(`${BASE_URL}/api/v1/servicios/partos`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newParto = { id: partoId++, ...body };
    mockPartos.push(newParto);
    return HttpResponse.json(newParto, { status: 201 });
  }),
  http.put(`${BASE_URL}/api/v1/servicios/partos/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockPartos.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    mockPartos[index] = { ...mockPartos[index], ...body };
    return HttpResponse.json(mockPartos[index]);
  }),
  http.delete(`${BASE_URL}/api/v1/servicios/partos/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = mockPartos.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    mockPartos.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Servicios Veterinarios
  http.get(`${BASE_URL}/api/v1/servicios/veterinarios`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const predioId = parseInt(url.searchParams.get('predioId') || '0', 10);
    const filtered = predioId > 0 ? mockServiciosVeterinarios.filter(e => e.predioId === predioId) : mockServiciosVeterinarios;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return HttpResponse.json({ data, page, limit, total, totalPages });
  }),
  http.get(`${BASE_URL}/api/v1/servicios/veterinarios/:id`, ({ params }) => {
    const id = Number(params.id);
    const evento = mockServiciosVeterinarios.find(e => e.id === id);
    if (!evento) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    return HttpResponse.json(evento);
  }),
  http.post(`${BASE_URL}/api/v1/servicios/veterinarios`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newSvc = { id: servicioVetId++, ...body };
    mockServiciosVeterinarios.push(newSvc as typeof mockServiciosVeterinarios[number]);
    return HttpResponse.json(newSvc, { status: 201 });
  }),
  http.put(`${BASE_URL}/api/v1/servicios/veterinarios/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockServiciosVeterinarios.findIndex(e => e.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    mockServiciosVeterinarios[index] = { ...mockServiciosVeterinarios[index], ...body } as typeof mockServiciosVeterinarios[number];
    return HttpResponse.json(mockServiciosVeterinarios[index]);
  }),
  http.delete(`${BASE_URL}/api/v1/servicios/veterinarios/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = mockServiciosVeterinarios.findIndex(e => e.id === id);
    if (index === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    mockServiciosVeterinarios.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
