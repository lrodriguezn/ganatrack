import { injectable, inject } from 'tsyringe'
import { VETERINARIO_GRUPAL_REPOSITORY } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioGrupalRepository } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { UpdateVeterinarioGrupalDto, VeterinarioGrupalResponseDto } from '../dtos/veterinario.dto.js'
import { VeterinarioGrupalMapper } from '../../infrastructure/mappers/veterinario.mapper.js'
import { NotFoundError, ConflictError } from '../../../../shared/errors/index.js'
import type { VeterinarioGrupalEntity } from '../../domain/entities/veterinario.entity.js'

@injectable()
export class UpdateVeterinarioGrupalUseCase {
  constructor(
    @inject(VETERINARIO_GRUPAL_REPOSITORY) private readonly repo: IVeterinarioGrupalRepository,
  ) {}

  async execute(id: number, dto: UpdateVeterinarioGrupalDto, predioId: number): Promise<VeterinarioGrupalResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('VeterinarioGrupal', id)
    }

    if (dto.codigo && dto.codigo !== existing.codigo) {
      const duplicate = await this.repo.findByCodigo(dto.codigo, predioId)
      if (duplicate) {
        throw new ConflictError(`El servicio veterinario con código '${dto.codigo}' ya existe en este predio`)
      }
    }

    const updateData: Partial<VeterinarioGrupalEntity> = { updatedAt: new Date() }
    if (dto.codigo !== undefined) updateData.codigo = dto.codigo
    if (dto.fecha !== undefined) updateData.fecha = new Date(dto.fecha)
    if (dto.veterinariosId !== undefined) updateData.veterinariosId = dto.veterinariosId
    if (dto.tipoServicio !== undefined) updateData.tipoServicio = dto.tipoServicio
    if (dto.observaciones !== undefined) updateData.observaciones = dto.observaciones

    const updated = await this.repo.update(id, updateData)
    if (!updated) {
      throw new NotFoundError('VeterinarioGrupal', id)
    }

    return { ...VeterinarioGrupalMapper.toResponse(updated), animales: [] }
  }
}
