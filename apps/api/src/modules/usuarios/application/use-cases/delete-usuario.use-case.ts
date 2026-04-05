import { inject, injectable } from 'tsyringe'
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteUsuarioUseCase {
  constructor(
    @inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Find usuario by id (NotFoundError if not found)
    const usuario = await this.usuarioRepo.findById(id)
    if (!usuario) {
      throw new NotFoundError('Usuario', id)
    }

    // 2. Soft delete: set activo=0
    await this.usuarioRepo.softDelete(id)
  }
}
