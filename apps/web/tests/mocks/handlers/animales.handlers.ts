// apps/web/tests/mocks/handlers/animales.handlers.ts
/**
 * MSW Handlers for Animales API.
 */

import { http, HttpResponse } from 'msw';

const mockAnimales = [
  { id: 1, predioId: 1, codigo: 'GAN-001', nombre: 'Don Toro', fechaNacimiento: '2020-03-15', sexoKey: 0, tipoIngresoId: 0, configRazasId: 1, potreroId: 1, madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0, razaNombre: 'Brahman', potreroNombre: 'Potrero Norte' },
  { id: 2, predioId: 1, codigo: 'GAN-002', nombre: 'El Bravo', fechaNacimiento: '2020-05-20', sexoKey: 0, tipoIngresoId: 0, configRazasId: 4, potreroId: 1, madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0, razaNombre: 'Nelore', potreroNombre: 'Potrero Norte' },
  { id: 3, predioId: 1, codigo: 'GAN-003', nombre: 'Matambo', fechaNacimiento: '2019-08-10', sexoKey: 0, tipoIngresoId: 0, configRazasId: 3, potreroId: 2, madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0, razaNombre: 'Romosinuano', potreroNombre: 'Potrero Sur' },
  { id: 14, predioId: 1, codigo: 'GAN-014', nombre: 'La Negra', fechaNacimiento: '2019-06-15', sexoKey: 1, tipoIngresoId: 0, configRazasId: 1, potreroId: 2, madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0, razaNombre: 'Brahman', potreroNombre: 'Potrero Sur' },
  { id: 15, predioId: 1, codigo: 'GAN-015', nombre: 'Bella', fechaNacimiento: '2020-02-10', sexoKey: 1, tipoIngresoId: 0, configRazasId: 6, potreroId: 3, madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0, razaNombre: 'Gyr', potreroNombre: 'Potrero Este' },
];

let idCounter = mockAnimales.length + 1;

export const animalesHandlers = [
  http.get('*/api/v1/animales', ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search');

    let filtered = mockAnimales;
    if (predioId) filtered = filtered.filter(a => a.predioId === Number(predioId));
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a => a.codigo.toLowerCase().includes(s) || (a.nombre && a.nombre.toLowerCase().includes(s)));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({ data, page, limit, total, totalPages });
  }),

  http.get('*/api/v1/animales/:id', ({ params }) => {
    const id = Number(params.id);
    const animal = mockAnimales.find(a => a.id === id);
    if (!animal) return HttpResponse.json({ message: `Animal con ID ${id} no encontrado` }, { status: 404 });
    return HttpResponse.json(animal);
  }),

  http.post('*/api/v1/animales', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newAnimal = { id: idCounter++, predioId: 1, ...body, estadoAnimalKey: 0, saludAnimalKey: 0 };
    mockAnimales.push(newAnimal);
    return HttpResponse.json(newAnimal, { status: 201 });
  }),

  http.put('*/api/v1/animales/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockAnimales.findIndex(a => a.id === id);
    if (index === -1) return HttpResponse.json({ message: `Animal con ID ${id} no encontrado` }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    mockAnimales[index] = { ...mockAnimales[index], ...body };
    return HttpResponse.json(mockAnimales[index]);
  }),

  http.delete('*/api/v1/animales/:id', ({ params }) => {
    const id = Number(params.id);
    const index = mockAnimales.findIndex(a => a.id === id);
    if (index === -1) return HttpResponse.json({ message: `Animal con ID ${id} no encontrado` }, { status: 404 });
    mockAnimales[index].estadoAnimalKey = 99;
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('*/api/v1/animales/:id/estado', async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockAnimales.findIndex(a => a.id === id);
    if (index === -1) return HttpResponse.json({ message: `Animal con ID ${id} no encontrado` }, { status: 404 });
    const body = await request.json() as { estadoAnimalKey: number };
    mockAnimales[index].estadoAnimalKey = body.estadoAnimalKey;
    return HttpResponse.json(mockAnimales[index]);
  }),

  http.get('*/api/v1/animales/:id/genealogia', ({ params }) => {
    const id = Number(params.id);
    const animal = mockAnimales.find(a => a.id === id);
    if (!animal) return HttpResponse.json({ message: `Animal con ID ${id} no encontrado` }, { status: 404 });
    return HttpResponse.json({ id: animal.id, codigo: animal.codigo, nombre: animal.nombre, sexoKey: animal.sexoKey, razaNombre: animal.razaNombre, madre: undefined, padre: undefined });
  }),

  http.get('*/api/v1/animales/estadisticas', ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');
    const animals = mockAnimales.filter(a => a.predioId === Number(predioId) && a.estadoAnimalKey !== 99);
    return HttpResponse.json({
      total: animals.length,
      activos: animals.filter(a => a.estadoAnimalKey === 0).length,
      vendidos: animals.filter(a => a.estadoAnimalKey === 1).length,
      muertos: animals.filter(a => a.estadoAnimalKey === 2).length,
      machos: animals.filter(a => a.sexoKey === 0).length,
      hembras: animals.filter(a => a.sexoKey === 1).length,
    });
  }),
];
