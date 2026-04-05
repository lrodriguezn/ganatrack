import { inject, injectable } from 'tsyringe'
import { PARTO_ANIMAL_REPOSITORY } from '../../domain/repositories/parto-animal.repository.js'
import { PARTO_CRIA_REPOSITORY } from '../../domain/repositories/parto-cria.repository.js'
import type { IPartoAnimalRepository } from '../../domain/repositories/parto-animal.repository.js'
import type { IPartoCriaRepository } from '../../domain/repositories/parto-cria.repository.js'
import type { CreatePartoAnimalDto, CreatePartoCriaDto, PartoAnimalResponseDto } from '../dtos/parto.dto.js'
import { PartoAnimalMapper, PartoCriaMapper } from '../../infrastructure/mappers/parto.mapper.js'
import type { ITransactionManager } from '../../../../shared/types/transaction.js'

@injectable()
export class CrearPartoUseCase {
  constructor(
    @inject(PARTO_ANIMAL_REPOSITORY) private readonly repo: IPartoAnimalRepository,
    @inject(PARTO_CRIA_REPOSITORY) private readonly criaRepo: IPartoCriaRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager,
  ) {}

  async execute(dto: CreatePartoAnimalDto, predioId: number): Promise<PartoAnimalResponseDto> {
    const result = await this.txManager.execute(async () => {
      const parto = await this.repo.create({
        predioId,
        animalId: dto.animalId,
        fecha: new Date(dto.fecha),
        macho: dto.macho ?? null,
        hembra: dto.hembra ?? null,
        muertos: dto.muertos ?? null,
        peso: dto.peso ?? null,
        tipoPartoKey: dto.tipoPartoKey ?? null,
        observaciones: dto.observaciones ?? null,
        activo: 1,
      })

      const criasData = (dto.crias || []).map((c: CreatePartoCriaDto) => ({
        partoId: parto.id,
        criaId: c.criaId ?? null,
        sexoKey: c.sexoKey ?? null,
        pesoNacimiento: c.pesoNacimiento ?? null,
        observaciones: c.observaciones ?? null,
        activo: 1,
      }))

      const crias = await this.criaRepo.createMany(criasData)

      return { ...parto, crias }
    })

    return {
      ...PartoAnimalMapper.toResponse(result),
      crias: result.crias.map(PartoCriaMapper.toResponse),
    }
  }
}
