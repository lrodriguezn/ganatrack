// apps/web/src/tests/mocks/handlers/imagenes.handlers.ts
/**
 * MSW Handlers for Imagenes API.
 *
 * Provides mock handlers for image CRUD endpoints.
 * Note: Upload endpoint accepts multipart/form-data but MSW mocks
 * simulate the response without actually processing the file.
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

// Seed data
const mockImagenes = [
  {
    id: 1, url: '/placeholder-product-1.jpg', thumbnailUrl: '/placeholder-product-1-thumb.jpg',
    entidadTipo: 'producto', entidadId: 1, filename: 'ivermectina-frasco.jpg',
    size: 245000, mimeType: 'image/jpeg', createdAt: new Date().toISOString(),
  },
  {
    id: 2, url: '/placeholder-product-2.jpg', thumbnailUrl: '/placeholder-product-2-thumb.jpg',
    entidadTipo: 'producto', entidadId: 1, filename: 'ivermectina-caja.jpg',
    size: 189000, mimeType: 'image/jpeg', createdAt: new Date().toISOString(),
  },
  {
    id: 3, url: '/placeholder-product-3.jpg', thumbnailUrl: '/placeholder-product-3-thumb.jpg',
    entidadTipo: 'producto', entidadId: 2, filename: 'mineral-premix.jpg',
    size: 312000, mimeType: 'image/jpeg', createdAt: new Date().toISOString(),
  },
];

let idCounter = mockImagenes.length + 1;

export const imagenesHandlers = [
  // GET /api/v1/imagenes — list by entity
  http.get(`${BASE_URL}/api/v1/imagenes`, ({ request }) => {
    const url = new URL(request.url);
    const entidadTipo = url.searchParams.get('entidad_tipo');
    const entidadId = url.searchParams.get('entidad_id');

    let filtered = mockImagenes;

    if (entidadTipo) {
      filtered = filtered.filter(img => img.entidadTipo === entidadTipo);
    }

    if (entidadId) {
      filtered = filtered.filter(img => img.entidadId === Number(entidadId));
    }

    return HttpResponse.json(filtered);
  }),

  // GET /api/v1/imagenes/:id — single image
  http.get(`${BASE_URL}/api/v1/imagenes/:id`, ({ params }) => {
    const id = Number(params.id);
    const imagen = mockImagenes.find(img => img.id === id);

    if (!imagen) {
      return HttpResponse.json(
        { message: `Imagen con ID ${id} no encontrada` },
        { status: 404 }
      );
    }

    return HttpResponse.json(imagen);
  }),

  // POST /api/v1/imagenes/upload — upload image (multipart/form-data)
  http.post(`${BASE_URL}/api/v1/imagenes/upload`, async ({ request }) => {
    const contentType = request.headers.get('content-type') ?? '';

    // For MSW, we simulate the upload response
    const entidadTipo = 'producto'; // Default for mock
    const entidadId = 1; // Default for mock

    const newImagen = {
      id: idCounter++,
      url: '/placeholder-upload.jpg',
      thumbnailUrl: '/placeholder-upload-thumb.jpg',
      entidadTipo,
      entidadId,
      filename: 'uploaded-image.jpg',
      size: 250000,
      mimeType: 'image/jpeg',
      createdAt: new Date().toISOString(),
    };

    mockImagenes.push(newImagen);

    return HttpResponse.json(newImagen, { status: 201 });
  }),

  // DELETE /api/v1/imagenes/:id — delete image
  http.delete(`${BASE_URL}/api/v1/imagenes/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = mockImagenes.findIndex(img => img.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: `Imagen con ID ${id} no encontrada` },
        { status: 404 }
      );
    }

    mockImagenes.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
