import { injectable } from 'tsyringe'
import { eq, desc } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { usuariosPermisos } from '@ganatrack/database/schema'
import type { IPermisoRepository } from '../../domain/repositories/permiso.repository.js'
import type { PermisoEntity } from '../../domain/entities/permiso.entity.js'

@injectable()
export class DrizzlePermisoRepository implements IPermisoRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(): Promise<PermisoEntity[]> {
    const rows = await this.db
      .select({
        id: usuariosPermisos.id,
        modulo: usuariosPermisos.modulo,
        accion: usuariosPermisos.accion,
        nombre: usuariosPermisos.nombre,
      })
      .from(usuariosPermisos)
      .where(eq(usuariosPermisos.activo, 1))
      .orderBy(usuariosPermisos.modulo, usuariosPermisos.accion)

    return rows
  }
}
