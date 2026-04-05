import { injectable } from 'tsyringe'
import { eq, and, desc } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { usuariosRoles, rolesPermisos, usuariosPermisos } from '@ganatrack/database/schema'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import type { RolEntity } from '../../domain/entities/rol.entity.js'
import type { PermisoEntity } from '../../domain/entities/permiso.entity.js'

@injectable()
export class DrizzleRolRepository implements IRolRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(): Promise<RolEntity[]> {
    const rows = await this.db
      .select()
      .from(usuariosRoles)
      .where(eq(usuariosRoles.activo, 1))
      .orderBy(desc(usuariosRoles.createdAt))

    return rows
  }

  async findById(id: number): Promise<RolEntity | null> {
    const [row] = await this.db
      .select()
      .from(usuariosRoles)
      .where(and(eq(usuariosRoles.id, id), eq(usuariosRoles.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: { nombre: string; descripcion?: string }): Promise<RolEntity> {
    const [row] = await this.db
      .insert(usuariosRoles)
      .values({
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        esSistema: 0,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: { nombre?: string; descripcion?: string }): Promise<void> {
    const updateData: Record<string, unknown> = {}

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion ?? null

    await this.db
      .update(usuariosRoles)
      .set(updateData)
      .where(eq(usuariosRoles.id, id))
  }

  async getPermisosByRol(rolId: number): Promise<PermisoEntity[]> {
    const rows = await this.db
      .select({
        id: usuariosPermisos.id,
        modulo: usuariosPermisos.modulo,
        accion: usuariosPermisos.accion,
        nombre: usuariosPermisos.nombre,
      })
      .from(rolesPermisos)
      .innerJoin(usuariosPermisos, eq(rolesPermisos.permisoId, usuariosPermisos.id))
      .where(and(eq(rolesPermisos.rolId, rolId), eq(rolesPermisos.activo, 1), eq(usuariosPermisos.activo, 1)))

    return rows
  }

  async assignPermisos(rolId: number, permisosIds: number[]): Promise<void> {
    // First, deactivate all existing permissions for this role
    await this.db
      .update(rolesPermisos)
      .set({ activo: 0 })
      .where(eq(rolesPermisos.rolId, rolId))

    // Then, create new assignments
    for (const permisoId of permisosIds) {
      await this.db.insert(rolesPermisos).values({
        rolId,
        permisoId,
        activo: 1,
      })
    }
  }
}
