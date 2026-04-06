// apps/web/src/tests/mocks/server.ts
/**
 * MSW v2 server setup.
 * Combines all handlers and exports a single server instance.
 */
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth.handlers';
import { prediosHandlers } from './handlers/predios.handlers';
import { animalesHandlers } from './handlers/animales.handlers';
import { serviciosHandlers } from './handlers/servicios.handlers';
import { configHandlers } from './handlers/config.handlers';
import { imagenesHandlers } from './handlers/imagenes.handlers';
import { productosHandlers } from './handlers/productos.handlers';
import { rolesHandlers } from './handlers/roles.handlers';
import { usuariosHandlers } from './handlers/usuarios.handlers';
import { maestrosHandlers } from './handlers/maestros.handlers';
import { reportesHandlers } from './handlers/reportes.handlers';
import { notificacionesHandlers } from './handlers/notificaciones.handlers';
import { syncHandlers } from './handlers/sync.handlers';

export const server = setupServer(
  ...authHandlers,
  ...prediosHandlers,
  ...animalesHandlers,
  ...serviciosHandlers,
  ...configHandlers,
  ...imagenesHandlers,
  ...productosHandlers,
  ...rolesHandlers,
  ...usuariosHandlers,
  ...maestrosHandlers,
  ...reportesHandlers,
  ...notificacionesHandlers,
  ...syncHandlers,
);
