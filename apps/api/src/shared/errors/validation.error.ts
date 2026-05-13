import { DomainError } from './domain.error.js'

export class ValidationError extends DomainError {
  constructor(messageOrDetails: string | Record<string, string[]>, details?: Record<string, string[]>) {
    if (typeof messageOrDetails === 'string') {
      super('VALIDATION_ERROR', messageOrDetails, 422, details ?? {})
    } else {
      super('VALIDATION_ERROR', 'Datos de entrada inválidos', 422, messageOrDetails)
    }
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
