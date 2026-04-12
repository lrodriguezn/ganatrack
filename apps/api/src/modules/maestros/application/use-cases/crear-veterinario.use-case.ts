import { inject, injectable } from 'tsyringe'
import { VETERINARIO_REPOSITORY } from '../../domain/repositories/veterinario.repository.js'
import type { IVeterinarioRepository } from '../../domain/repositories/veterinario.repository.js'
import type { CreateVeterinarioDto, VeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { VeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearVeterinarioUseCase {
  constructor(@inject(VETERINARIO_REPOSITORY) private readonly repo: IVeterinarioRepository) {}
  async execute(dto: CreateVeterinarioDto, predicates: number): Promise<VeterinarioResponseDto> {
    console.log('[CrearVeterinarioUseCase] dto:', dto, 'predioId:', predicates)
    // Drizzle convierte predicatesId -> predicates_id automaticamente
    const createData = {
      ...dto,
      predicatesId: predicates,
      telefono: dto.telefono ?? null,
      email: dto.email ?? null,
      direccion: dto.direccion ?? null,
      numeroRegistro: dto.numeroRegistro ?? null,
      especialidad: dto.especialidad ?? null,
      activo: 1,
      // Asegurar que siempre tenga un valor para required fields
      nombre: dto.nombre || '',
    }
    console.log('[CrearVeterinarioUseCase] createData:', createData)
    try {
      const entity = await this.repo.create(createData as any)
      return VeterinarioMapper.toResponse(entity)
    } catch (err) {
      console.error('[CrearVeterinarioUseCase] Error:', err)
      throw err
    }
  }
}