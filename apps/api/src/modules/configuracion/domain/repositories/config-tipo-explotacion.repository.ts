import type { ConfigTipoExplotacionEntity } from '../entities/config-tipo-explotacion.entity.js'

export interface IConfigTipoExplotacionRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigTipoExplotacionEntity[]; total: number }>
  findById(id: number): Promise<ConfigTipoExplotacionEntity | null>
  create(data: Omit<ConfigTipoExplotacionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigTipoExplotacionEntity>
  update(id: number, data: Partial<Omit<ConfigTipoExplotacionEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigTipoExplotacionEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CONFIG_TIPO_EXPLOTACION_REPOSITORY = Symbol('IConfigTipoExplotacionRepository')
