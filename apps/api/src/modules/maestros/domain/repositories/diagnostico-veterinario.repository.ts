import type { DiagnosticoVeterinarioEntity } from '../entities/diagnostico-veterinario.entity.js'

export interface IDiagnosticoVeterinarioRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: DiagnosticoVeterinarioEntity[]; total: number }>
  findById(id: number): Promise<DiagnosticoVeterinarioEntity | null>
  create(data: Omit<DiagnosticoVeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiagnosticoVeterinarioEntity>
  update(id: number, data: Partial<Omit<DiagnosticoVeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DiagnosticoVeterinarioEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const DIAGNOSTICO_VETERINARIO_REPOSITORY = Symbol('IDiagnosticoVeterinarioRepository')
