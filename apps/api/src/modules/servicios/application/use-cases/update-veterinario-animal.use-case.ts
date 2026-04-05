import { injectable, inject } from 'tsyringe'
import { VETERINARIO_ANIMAL_REPOSITORY } from '../../domain/repositories/veterinario-animal.repository.js'
import { VETERINARIO_PRODUCTO_REPOSITORY } from '../../domain/repositories/veterinario-producto.repository.js'
import type { IVeterinarioAnimalRepository } from '../../domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioProductoRepository } from '../../domain/repositories/veterinario-producto.repository.js'
import type { UpdateVeterinarioAnimalDto, VeterinarioAnimalResponseDto } from '../dtos/veterinario.dto.js'
import { VeterinarioAnimalMapper, VeterinarioProductoMapper } from '../../infrastructure/mappers/veterinario.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'
import type { VeterinarioAnimalEntity } from '../../domain/entities/veterinario.entity.js'

@injectable()
export class UpdateVeterinarioAnimalUseCase {
  constructor(
    @inject(VETERINARIO_ANIMAL_REPOSITORY) private readonly repo: IVeterinarioAnimalRepository,
    @inject(VETERINARIO_PRODUCTO_REPOSITORY) private readonly productoRepo: IVeterinarioProductoRepository,
  ) {}

  async execute(id: number, dto: UpdateVeterinarioAnimalDto, predioId: number): Promise<VeterinarioAnimalResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('VeterinarioAnimal', id)
    }

    const updateData: Partial<VeterinarioAnimalEntity> = { updatedAt: new Date() }
    if (dto.veterinarioId !== undefined) updateData.veterinarioId = dto.veterinarioId
    if (dto.diagnosticoId !== undefined) updateData.diagnosticoId = dto.diagnosticoId
    if (dto.fecha !== undefined) updateData.fecha = new Date(dto.fecha)
    if (dto.tipoDiagnosticoKey !== undefined) updateData.tipoDiagnosticoKey = dto.tipoDiagnosticoKey
    if (dto.tratamiento !== undefined) updateData.tratamiento = dto.tratamiento
    if (dto.medicamentos !== undefined) updateData.medicamentos = dto.medicamentos
    if (dto.dosis !== undefined) updateData.dosis = dto.dosis
    if (dto.comentarios !== undefined) updateData.comentarios = dto.comentarios

    const updated = await this.repo.update(id, updateData, predioId)
    if (!updated) {
      throw new NotFoundError('VeterinarioAnimal', id)
    }

    const productos = await this.productoRepo.findByAnimalId(id)

    return {
      ...VeterinarioAnimalMapper.toResponse(updated),
      productos: productos.map(VeterinarioProductoMapper.toResponse),
    }
  }
}
