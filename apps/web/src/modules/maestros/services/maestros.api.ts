// apps/web/src/modules/maestros/services/maestros.api.ts
/**
 * Real Maestros Service — production stub.
 *
 * All methods throw "Not implemented" until API endpoints are ready.
 * Replace with actual API calls when backend is available.
 */

import type { CreateMaestroDto, MaestroBase, MaestroTipo } from '../types/maestro.types';
import type { MaestrosService } from './maestros.service';

export class RealMaestrosService implements MaestrosService {
  async getAll(_tipo: MaestroTipo): Promise<MaestroBase[]> {
    throw new Error('Not implemented');
  }

  async create(_tipo: MaestroTipo, _data: CreateMaestroDto): Promise<MaestroBase> {
    throw new Error('Not implemented');
  }

  async update(_tipo: MaestroTipo, _id: number, _data: Partial<CreateMaestroDto>): Promise<MaestroBase> {
    throw new Error('Not implemented');
  }

  async remove(_tipo: MaestroTipo, _id: number): Promise<void> {
    throw new Error('Not implemented');
  }
}
