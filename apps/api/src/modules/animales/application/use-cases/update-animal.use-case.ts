import { inject, injectable } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { AnimalResponseDto, UpdateAnimalDto } from '../dtos/animal.dto.js'
import { AnimalMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateAnimalUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly repo: IAnimalRepository,
  ) {}

  async execute(id: number, predioId: number, dto: UpdateAnimalDto): Promise<AnimalResponseDto> {
    // Verify animal exists
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Animal', id)
    }

    const updateData: Record<string, unknown> = {}
    if (dto.nombre !== undefined) updateData.nombre = dto.nombre
    if (dto.fechaNacimiento !== undefined) updateData.fechaNacimiento = dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null
    if (dto.fechaCompra !== undefined) updateData.fechaCompra = dto.fechaCompra ? new Date(dto.fechaCompra) : null
    if (dto.sexoKey !== undefined) updateData.sexoKey = dto.sexoKey
    if (dto.tipoIngresoId !== undefined) updateData.tipoIngresoId = dto.tipoIngresoId
    if (dto.madreId !== undefined) updateData.madreId = dto.madreId
    if (dto.codigoMadre !== undefined) updateData.codigoMadre = dto.codigoMadre
    if (dto.indTransferenciaEmb !== undefined) updateData.indTransferenciaEmb = dto.indTransferenciaEmb
    if (dto.codigoDonadora !== undefined) updateData.codigoDonadora = dto.codigoDonadora
    if (dto.tipoPadreKey !== undefined) updateData.tipoPadreKey = dto.tipoPadreKey
    if (dto.padreId !== undefined) updateData.padreId = dto.padreId
    if (dto.codigoPadre !== undefined) updateData.codigoPadre = dto.codigoPadre
    if (dto.codigoPajuela !== undefined) updateData.codigoPajuela = dto.codigoPajuela
    if (dto.configRazasId !== undefined) updateData.configRazasId = dto.configRazasId
    if (dto.potreroId !== undefined) updateData.potreroId = dto.potreroId
    if (dto.precioCompra !== undefined) updateData.precioCompra = dto.precioCompra
    if (dto.pesoCompra !== undefined) updateData.pesoCompra = dto.pesoCompra
    if (dto.codigoRfid !== undefined) updateData.codigoRfid = dto.codigoRfid
    if (dto.codigoArete !== undefined) updateData.codigoArete = dto.codigoArete
    if (dto.codigoQr !== undefined) updateData.codigoQr = dto.codigoQr
    if (dto.saludAnimalKey !== undefined) updateData.saludAnimalKey = dto.saludAnimalKey
    if (dto.estadoAnimalKey !== undefined) updateData.estadoAnimalKey = dto.estadoAnimalKey
    if (dto.indDescartado !== undefined) updateData.indDescartado = dto.indDescartado

    const entity = await this.repo.update(id, updateData)
    if (!entity) {
      throw new NotFoundError('Animal', id)
    }
    return AnimalMapper.toResponse(entity)
  }
}
