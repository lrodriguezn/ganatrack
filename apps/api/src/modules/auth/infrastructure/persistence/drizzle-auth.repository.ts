import { injectable } from 'tsyringe'
import { eq, and, desc } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import type { DbClient } from '@ganatrack/database'
import {
  usuarios,
  usuariosContrasena,
  usuariosHistorialContrasenas,
  usuariosLogin,
  usuariosAutenticacionDosFactores,
  usuariosRoles,
  usuariosRolesAsignacion,
  usuariosPermisos,
  rolesPermisos,
  usuariosPredios,
} from '@ganatrack/database/schema'
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.js'
import type { IAuthRepository } from '../../domain/repositories/auth.repository.js'

// Use type assertion to handle the dual-database union type
type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleAuthRepository implements IAuthRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findUsuarioById(id: number): Promise<{ id: number; nombre: string; email: string; activo: number } | null> {
    const [row] = await this.db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        activo: usuarios.activo,
      })
      .from(usuarios)
      .where(and(eq(usuarios.id, id), eq(usuarios.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findUsuarioByEmail(email: string): Promise<{ id: number; nombre: string; email: string; activo: number } | null> {
    const [row] = await this.db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        activo: usuarios.activo,
      })
      .from(usuarios)
      .where(and(eq(usuarios.email, email), eq(usuarios.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async getContrasenaHash(usuarioId: number): Promise<string | null> {
    const [row] = await this.db
      .select({ contrasenaHash: usuariosContrasena.contrasenaHash })
      .from(usuariosContrasena)
      .where(and(eq(usuariosContrasena.usuarioId, usuarioId), eq(usuariosContrasena.activo, 1)))
      .limit(1)

    return row?.contrasenaHash ?? null
  }

  async getRoles(usuarioId: number): Promise<string[]> {
    const rows = await this.db
      .select({ nombre: usuariosRoles.nombre })
      .from(usuariosRolesAsignacion)
      .innerJoin(usuariosRoles, eq(usuariosRolesAsignacion.rolId, usuariosRoles.id))
      .where(and(eq(usuariosRolesAsignacion.usuarioId, usuarioId), eq(usuariosRolesAsignacion.activo, 1), eq(usuariosRoles.activo, 1)))

    return rows.map((r: { nombre: string }) => r.nombre)
  }

  async getPermisos(usuarioId: number): Promise<string[]> {
    // Get permissions from user's roles via roles_permisos
    const rows = await this.db
      .select({ nombre: usuariosPermisos.nombre })
      .from(usuariosRolesAsignacion)
      .innerJoin(usuariosRoles, eq(usuariosRolesAsignacion.rolId, usuariosRoles.id))
      .innerJoin(rolesPermisos, eq(rolesPermisos.rolId, usuariosRoles.id))
      .innerJoin(usuariosPermisos, eq(rolesPermisos.permisoId, usuariosPermisos.id))
      .where(and(
        eq(usuariosRolesAsignacion.usuarioId, usuarioId),
        eq(usuariosRolesAsignacion.activo, 1),
        eq(usuariosRoles.activo, 1),
        eq(rolesPermisos.activo, 1),
        eq(usuariosPermisos.activo, 1),
      ))

    return rows.map((r: { nombre: string }) => r.nombre)
  }

  async getPredioIds(usuarioId: number): Promise<number[]> {
    const rows = await this.db
      .select({ predioId: usuariosPredios.predioId })
      .from(usuariosPredios)
      .where(and(eq(usuariosPredios.usuarioId, usuarioId), eq(usuariosPredios.activo, 1)))

    return rows.map((r: { predioId: number }) => r.predioId).filter((id: number) => id !== undefined && id !== null)
  }

  async getTwoFactor(usuarioId: number): Promise<{
    habilitado: number
    metodo: string
    codigo: string | null
    fechaExpiracion: Date | null
    intentosFallidos: number
  } | null> {
    const [row] = await this.db
      .select({
        habilitado: usuariosAutenticacionDosFactores.habilitado,
        metodo: usuariosAutenticacionDosFactores.metodo,
        codigo: usuariosAutenticacionDosFactores.codigo,
        fechaExpiracion: usuariosAutenticacionDosFactores.fechaExpiracion,
        intentosFallidos: usuariosAutenticacionDosFactores.intentosFallidos,
      })
      .from(usuariosAutenticacionDosFactores)
      .where(and(eq(usuariosAutenticacionDosFactores.usuarioId, usuarioId), eq(usuariosAutenticacionDosFactores.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async saveTwoFactorCode(usuarioId: number, code: string, expiresAt: Date): Promise<void> {
    const hashedCode = await bcrypt.hash(code, 10)
    await this.db
      .update(usuariosAutenticacionDosFactores)
      .set({
        codigo: hashedCode,
        fechaExpiracion: expiresAt,
        intentosFallidos: 0,
        updatedAt: new Date(),
      })
      .where(eq(usuariosAutenticacionDosFactores.usuarioId, usuarioId))
  }

  async incrementTwoFactorAttempts(usuarioId: number): Promise<void> {
    const twoFactor = await this.getTwoFactor(usuarioId)
    if (twoFactor) {
      await this.db
        .update(usuariosAutenticacionDosFactores)
        .set({
          intentosFallidos: twoFactor.intentosFallidos + 1,
          updatedAt: new Date(),
        })
        .where(eq(usuariosAutenticacionDosFactores.usuarioId, usuarioId))
    }
  }

  async resetTwoFactorAttempts(usuarioId: number): Promise<void> {
    await this.db
      .update(usuariosAutenticacionDosFactores)
      .set({
        intentosFallidos: 0,
        updatedAt: new Date(),
      })
      .where(eq(usuariosAutenticacionDosFactores.usuarioId, usuarioId))
  }

  async saveRefreshToken(usuarioId: number, refreshToken: string, expiresAt: Date): Promise<void> {
    await this.db.insert(usuariosLogin).values({
      usuarioId,
      refreshToken,
      exitoso: 1,
      fechaExpiracion: expiresAt,
      activo: 1,
    })
  }

  async findRefreshToken(refreshToken: string): Promise<{ usuarioId: number; activo: number } | null> {
    const [row] = await this.db
      .select({
        usuarioId: usuariosLogin.usuarioId,
        activo: usuariosLogin.activo,
      })
      .from(usuariosLogin)
      .where(eq(usuariosLogin.refreshToken, refreshToken))
      .limit(1)

    return row ?? null
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.db
      .update(usuariosLogin)
      .set({ activo: 0 })
      .where(eq(usuariosLogin.refreshToken, refreshToken))
  }

  async savePasswordHistory(usuarioId: number, hash: string): Promise<void> {
    await this.db.insert(usuariosHistorialContrasenas).values({
      usuarioId,
      contrasenaHash: hash,
      activo: 1,
    })
  }

  async getPasswordHistory(usuarioId: number, limit: number): Promise<string[]> {
    const rows = await this.db
      .select({ contrasenaHash: usuariosHistorialContrasenas.contrasenaHash })
      .from(usuariosHistorialContrasenas)
      .where(and(eq(usuariosHistorialContrasenas.usuarioId, usuarioId), eq(usuariosHistorialContrasenas.activo, 1)))
      .orderBy(desc(usuariosHistorialContrasenas.createdAt))
      .limit(limit)

    return rows.map((r: { contrasenaHash: string | null }) => r.contrasenaHash).filter((h: string | null) => h !== null) as string[]
  }

  async updatePassword(usuarioId: number, newHash: string): Promise<void> {
    await this.db
      .update(usuariosContrasena)
      .set({
        contrasenaHash: newHash,
        updatedAt: new Date(),
      })
      .where(eq(usuariosContrasena.usuarioId, usuarioId))
  }

  async revokeAllUserTokens(usuarioId: number): Promise<void> {
    await this.db
      .update(usuariosLogin)
      .set({ activo: 0 })
      .where(eq(usuariosLogin.usuarioId, usuarioId))
  }
}
