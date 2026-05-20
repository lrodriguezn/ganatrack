import { describe, expect, it } from 'vitest'
import { ConflictError, VersionConflictError } from '../index.js'

describe('VersionConflictError', () => {
  it('should extend ConflictError (REQ-6)', () => {
    const error = new VersionConflictError(4, 2)
    expect(error).toBeInstanceOf(ConflictError)
    expect(error).toBeInstanceOf(Error)
  })

  it('should have code VERSION_CONFLICT (REQ-6, REQ-20)', () => {
    const error = new VersionConflictError(4, 2)
    expect(error.code).toBe('VERSION_CONFLICT')
  })

  it('should have status code 409 (REQ-6)', () => {
    const error = new VersionConflictError(4, 2)
    expect(error.statusCode).toBe(409)
  })

  it('should include currentVersion and expectedVersion in details (REQ-20)', () => {
    const error = new VersionConflictError(4, 2)
    expect(error.details.currentVersion).toBe('4')
    expect(error.details.expectedVersion).toBe('2')
  })

  it('should have human-readable Spanish message (REQ-6)', () => {
    const error = new VersionConflictError(4, 2)
    expect(error.message).toContain('modificado')
  })
})
