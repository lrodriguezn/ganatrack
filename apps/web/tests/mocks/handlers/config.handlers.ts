// apps/web/tests/mocks/handlers/config.handlers.ts
/**
 * MSW Handlers for Configuración API (catálogo endpoints).
 */

import { http, HttpResponse } from 'msw';

const mockCatalogos: Record<string, { id: number; nombre: string; descripcion?: string }[]> = {
  razas: [
    { id: 1, nombre: 'Brahman', descripcion: 'Raza cebuína' },
    { id: 2, nombre: 'Holstein', descripcion: 'Raza lechera' },
    { id: 3, nombre: 'Romosinuano', descripcion: 'Raza criolla colombiana' },
    { id: 4, nombre: 'Nelore', descripcion: 'Raza cebuína' },
    { id: 5, nombre: 'Simmental', descripcion: 'Raza doble propósito' },
    { id: 6, nombre: 'Gyr', descripcion: 'Raza cebuína lechera' },
    { id: 7, nombre: 'Criollo', descripcion: 'Raza criolla' },
  ],
  estados_animal: [
    { id: 0, nombre: 'Activo' },
    { id: 1, nombre: 'Vendido' },
    { id: 2, nombre: 'Muerto' },
  ],
  sexos: [
    { id: 0, nombre: 'Macho' },
    { id: 1, nombre: 'Hembra' },
  ],
  tipos_ingreso: [
    { id: 0, nombre: 'Nacido en el Predio' },
    { id: 1, nombre: 'Comprado' },
  ],
  departamentos: [
    { id: 1, nombre: 'Antioquia' },
    { id: 2, nombre: 'Cundinamarca' },
    { id: 3, nombre: 'Valle del Cauca' },
  ],
};

export const configHandlers = [
  http.get('*/api/v1/configuracion/:tipo', ({ params }) => {
    const tipo = params.tipo as string;
    const data = mockCatalogos[tipo];
    if (!data) {
      return HttpResponse.json({ message: `Catálogo "${tipo}" no encontrado` }, { status: 404 });
    }
    return HttpResponse.json(data);
  }),
];
