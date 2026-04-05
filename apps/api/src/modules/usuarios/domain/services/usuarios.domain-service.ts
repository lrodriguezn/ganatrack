import { ConflictError, ValidationError } from '../../../../shared/errors/index.js'
import type { IUsuarioRepository } from '../repositories/usuario.repository.js'
import type { IRolRepository } from '../repositories/rol.repository.js'

export class UsuariosDomainService {
  async validateEmailUnique(
    email: string,
    usuarioRepo: IUsuarioRepository,
    existingId?: number,
  ): Promise<void> {
    const existing = await usuarioRepo.findByEmail(email)
    if (existing && existing.id !== existingId) {
      throw new ConflictError(`El email ${email} ya está en uso`)
    }
  }

  async validateRolNotSystem(rolId: number, rolRepo: IRolRepository): Promise<void> {
    const rol = await rolRepo.findById(rolId)
    if (!rol) {
      throw new ConflictError(`El rol con id ${rolId} no existe`)
    }
    if (rol.esSistema === 1) {
      throw new ConflictError('No se puede modificar un rol del sistema')
    }
  }

  validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new ValidationError({ password: ['La contraseña debe tener al menos 8 caracteres'] })
    }
    if (!/[A-Z]/.test(password)) {
      throw new ValidationError({ password: ['La contraseña debe tener al menos una mayúscula'] })
    }
    if (!/[a-z]/.test(password)) {
      throw new ValidationError({ password: ['La contraseña debe tener al menos una minúscula'] })
    }
    if (!/[0-9]/.test(password)) {
      throw new ValidationError({ password: ['La contraseña debe tener al menos un número'] })
    }
  }
}
