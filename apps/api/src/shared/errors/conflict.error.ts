import { DomainError } from './domain.error.js'

export class ConflictError extends DomainError {
  constructor(message: string) {
    super('DUPLICATE_CODE', message, 409)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}
