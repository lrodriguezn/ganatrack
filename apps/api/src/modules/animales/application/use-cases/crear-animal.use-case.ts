import { injectable, inject } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { CreateAnimalDto, AnimalResponseDto } from '../dtos/animal.dto.js'
import { AnimalMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearAnimalUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly repo: IAnimalRepository,
  ) {}

  async execute(dto: CreateAnimalDto, predioId: number): Promise<AnimalResponseDto> {
    // Check if codigo already exists in this predio
    const existing = await this.repo.findByCodigo(dto.codigo, predioId)
    if (existing) {
      throw new ConflictError(`El animal con código '${dto.codigo}' ya existe en este predio`)
    }

    // Note: predioId parameter matches entity field name
    const createData = {
      predioId,
      codigo: dto.codigo,
      nombre: dto.nombre ?? null,
      fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null,
      fechaCompra: dto.fechaCompra ? new Date(dto.fechaCompra) : null,
      sexoKey: dto.sexoKey ?? null,
      tipoIngresoId: dto.tipoIngresoId ?? null,
      madreId: dto.madreId ?? null,
      codigoMadre: dto.codigoMadre ?? null,
      indTransferenciaEmb: dto.indTransferenciaEmb ?? null,
      codigoDonadora: dto.codigoDonadora ?? null,
      tipoPadreKey: dto.tipoPadreKey ?? null,
      padreId: dto.padreId ?? null,
      codigoPadre: dto.codigoPadre ?? null,
      codigoPajuela: dto.codigoPajuela ?? null,
      configRazasId: dto.configRazasId ?? null,
      potreroId: dto.potreroId ?? null,
      precioCompra: dto.precioCompra ?? null,
      pesoCompra: dto.pesoCompra ?? null,
      codigoRfid: dto.codigoRfid ?? null,
      codigoArete: dto.codigoArete ?? null,
      codigoQr: dto.codigoQr ?? null,
      saludAnimalKey: dto.saludAnimalKey ?? null,
      estadoAnimalKey: dto.estadoAnimalKey ?? null,
      indDescartado: dto.indDescartado ?? null,
      activo: 1,
    }

    const entity = await this.repo.create(createData as any)

    return AnimalMapper.toResponse(entity)
  }
}
