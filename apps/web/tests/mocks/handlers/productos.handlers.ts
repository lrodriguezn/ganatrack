// apps/web/tests/mocks/handlers/productos.handlers.ts
/**
 * MSW Handlers for Productos API.
 *
 * Provides mock handlers for all producto CRUD endpoints.
 * Compatible with the RealProductoService contract.
 */

import { http, HttpResponse } from 'msw';

// Seed data
const mockProductos = [
  {
    id: 1, predioId: 1, nombre: 'Ivermectina 1%', descripcion: 'Antiparasitario de amplio espectro',
    tipoKey: 1, unidadMedida: 'ml', precioUnitario: 45000, stockActual: 25, stockMinimo: 10,
    estadoKey: 1, fechaVencimiento: '2027-06-15', proveedorId: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Medicamento', proveedorNombre: 'VetColombia',
  },
  {
    id: 2, predioId: 1, nombre: 'Mineral Premix B', descripcion: 'Suplemento mineral para ganado bovino',
    tipoKey: 2, unidadMedida: 'kg', precioUnitario: 85000, stockActual: 8, stockMinimo: 10,
    estadoKey: 1, fechaVencimiento: '2026-12-01', proveedorId: 2,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Suplemento', proveedorNombre: 'NutriGan SAS',
  },
  {
    id: 3, predioId: 1, nombre: 'Guantes de Nitrilo', descripcion: 'Guantes para palpación rectal, caja x100',
    tipoKey: 3, unidadMedida: 'unidad', precioUnitario: 32000, stockActual: 15, stockMinimo: 5,
    estadoKey: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Insumo', proveedorNombre: 'VetColombia',
  },
  {
    id: 4, predioId: 1, nombre: 'Oxitocina', descripcion: 'Hormona para inducción del parto',
    tipoKey: 1, unidadMedida: 'ml', precioUnitario: 28000, stockActual: 12, stockMinimo: 5,
    estadoKey: 1, fechaVencimiento: '2027-03-20', proveedorId: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Medicamento', proveedorNombre: 'VetColombia',
  },
  {
    id: 5, predioId: 1, nombre: 'Electrolitos Orales', descripcion: 'Solución rehidratante para becerros',
    tipoKey: 2, unidadMedida: 'kg', precioUnitario: 55000, stockActual: 3, stockMinimo: 5,
    estadoKey: 1, fechaVencimiento: '2027-01-10', proveedorId: 2,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Suplemento', proveedorNombre: 'NutriGan SAS',
  },
  {
    id: 6, predioId: 1, nombre: 'Jeringa 20ml', descripcion: 'Jeringas desechables con aguja 18G',
    tipoKey: 3, unidadMedida: 'unidad', precioUnitario: 3500, stockActual: 50, stockMinimo: 20,
    estadoKey: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Insumo', proveedorNombre: 'MediVet',
  },
  {
    id: 7, predioId: 1, nombre: 'Penicilina G Procaínica', descripcion: 'Antibiótico de amplio espectro',
    tipoKey: 1, unidadMedida: 'ml', precioUnitario: 62000, stockActual: 0, stockMinimo: 5,
    estadoKey: 2, fechaVencimiento: '2026-08-30', proveedorId: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Medicamento', proveedorNombre: 'VetColombia',
  },
  {
    id: 8, predioId: 1, nombre: 'Sal Mineralizada', descripcion: 'Sal con minerales para libre consumo',
    tipoKey: 2, unidadMedida: 'kg', precioUnitario: 22000, stockActual: 100, stockMinimo: 30,
    estadoKey: 1, proveedorId: 2,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tipoNombre: 'Suplemento', proveedorNombre: 'NutriGan SAS',
  },
];

let idCounter = mockProductos.length + 1;

export const productosHandlers = [
  // GET /api/v1/productos — paginated list with filters
  http.get('*/api/v1/productos', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const search = url.searchParams.get('search') ?? '';
    const tipoKey = url.searchParams.get('tipo_key');
    const estadoKey = url.searchParams.get('estado_key');
    const predioId = url.searchParams.get('predio_id');

    let filtered = mockProductos;

    // Filter by predio
    if (predioId) {
      filtered = filtered.filter(p => p.predioId === Number(predioId));
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(s) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(s))
      );
    }

    // Filter by tipo
    if (tipoKey) {
      filtered = filtered.filter(p => p.tipoKey === Number(tipoKey));
    }

    // Filter by estado
    if (estadoKey) {
      filtered = filtered.filter(p => p.estadoKey === Number(estadoKey));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      page,
      limit,
      total,
      totalPages,
    });
  }),

  // GET /api/v1/productos/:id — single product
  http.get('*/api/v1/productos/:id', ({ params }) => {
    const id = Number(params.id);
    const producto = mockProductos.find(p => p.id === id);

    if (!producto) {
      return HttpResponse.json(
        { message: `Producto con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    return HttpResponse.json(producto);
  }),

  // POST /api/v1/productos — create product
  http.post('*/api/v1/productos', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    const newProducto = {
      id: idCounter++,
      predioId: Number(body.predioId ?? 1),
      nombre: body.nombre as string,
      descripcion: body.descripcion as string | undefined,
      tipoKey: Number(body.tipoKey),
      unidadMedida: body.unidadMedida as string,
      precioUnitario: body.precioUnitario ? Number(body.precioUnitario) : undefined,
      stockActual: Number(body.stockActual ?? 0),
      stockMinimo: body.stockMinimo ? Number(body.stockMinimo) : undefined,
      estadoKey: Number(body.estadoKey ?? 1),
      fechaVencimiento: body.fechaVencimiento as string | undefined,
      proveedorId: body.proveedorId ? Number(body.proveedorId) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tipoNombre: ['Medicamento', 'Suplemento', 'Insumo'][Number(body.tipoKey) - 1] ?? 'Desconocido',
      proveedorNombre: 'Mock Proveedor',
    };

    mockProductos.push(newProducto);

    return HttpResponse.json(newProducto, { status: 201 });
  }),

  // PUT /api/v1/productos/:id — update product
  http.put('*/api/v1/productos/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockProductos.findIndex(p => p.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: `Producto con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    const body = await request.json() as Record<string, unknown>;

    mockProductos[index] = {
      ...mockProductos[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(mockProductos[index]);
  }),

  // DELETE /api/v1/productos/:id — delete product (soft delete)
  http.delete('*/api/v1/productos/:id', ({ params }) => {
    const id = Number(params.id);
    const index = mockProductos.findIndex(p => p.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: `Producto con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    // Soft delete
    mockProductos[index].estadoKey = 2;

    return new HttpResponse(null, { status: 204 });
  }),
];
