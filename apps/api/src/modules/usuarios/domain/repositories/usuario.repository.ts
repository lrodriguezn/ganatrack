import type { UsuarioEntity } from '../entities/usuario.entity.js'

export interface IUsuarioRepository {
  findAll(opts: { page: number; limit: number; search?: string; activo?: number }): Promise<{ data: UsuarioEntity[]; total: number }>
  findById(id: number): Promise<UsuarioEntity | null>
  findByEmail(email: string): Promise<UsuarioEntity | null>
  create(data: { nombre: string; email: string }): Promise<UsuarioEntity>
  update(id: number, data: { nombre?: string; email?: string; activo?: number }): Promise<void>
  softDelete(id: number): Promise<void>
}

export const USUARIO_REPOSITORY = Symbol('IUsuarioRepository')
