import { ValidationError } from '../../../../shared/errors/index.js'

export class AuthDomainService {
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

  async validatePasswordNotInHistory(
    password: string,
    history: string[],
  ): Promise<void> {
    for (const oldHash of history) {
      const bcrypt = await import('bcrypt')
      const matches = await bcrypt.compare(password, oldHash)
      if (matches) {
        throw new ValidationError({ password: ['La contraseña ya fue usada recientemente'] })
      }
    }
  }

  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  isOtpExpired(expirationDate: Date | null): boolean {
    if (!expirationDate) return true
    return new Date() > expirationDate
  }

  isOtpLocked(intentosFallidos: number, maxAttempts: number = 3): boolean {
    return intentosFallidos >= maxAttempts
  }
}
