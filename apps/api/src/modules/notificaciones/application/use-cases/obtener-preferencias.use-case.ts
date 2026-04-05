import { inject, injectable } from 'tsyringe'
import { PREFERENCIA_REPOSITORY } from '../../domain/repositories/preferencia.repository.js'
import type { IPreferenciaRepository } from '../../domain/repositories/preferencia.repository.js'
import type { PreferenciaResponseDto } from '../dtos/notificacion.dto.js'
import { PreferenciaMapper } from '../../infrastructure/mappers/preferencia.mapper.js'
import { NOTIFICACION_TIPOS } from '../dtos/notificacion.dto.js'

@injectable()
export class ObtenerPreferenciasUseCase {
  constructor(
    @inject(PREFERENCIA_REPOSITORY) private readonly repo: IPreferenciaRepository
  ) {}

  async execute(usuarioId: number): Promise<PreferenciaResponseDto[]> {
    const preferencias = await this.repo.findByUsuario(usuarioId)

    // Return all 5 tipos with their preferences (or defaults if not set)
    const resultado: PreferenciaResponseDto[] = []

    for (const tipo of NOTIFICACION_TIPOS) {
      const pref = preferencias.find(p => p.tipo === tipo)

      if (pref) {
        resultado.push(PreferenciaMapper.toResponseDto(pref))
      } else {
        // Return default preference for this tipo
        resultado.push({
          tipo,
          canal: {
            inapp: true,
            email: true,
            push: false,
          },
          diasAnticipacion: 7,
        })
      }
    }

    return resultado
  }
}
