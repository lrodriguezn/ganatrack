import { DomainError } from './domain.error.js'

export class NotFoundError extends DomainError {
  constructor(resource: string, id: number | string) {
    super('NOT_FOUND', `${resource} con id ${id} no existe`, 404)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}
