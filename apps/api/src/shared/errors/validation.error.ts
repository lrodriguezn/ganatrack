import { DomainError } from './domain.error.js'

export class ValidationError extends DomainError {
  constructor(details: Record<string, string[]>) {
    super('VALIDATION_ERROR', 'Datos de entrada inválidos', 422, details)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
