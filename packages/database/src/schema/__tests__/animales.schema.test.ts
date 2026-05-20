import { describe, expect, it } from 'vitest'
import type { NuevoAnimal } from '@ganatrack/database/schema'

describe('animales schema', () => {
  describe('version column (REQ-1)', () => {
    it('should accept version field in insert type', () => {
      // Type-level verification: NuevoAnimal must include version: number
      const insertData: NuevoAnimal = {
        predioId: 1,
        codigo: 'TEST001',
        version: 1,
      }
      expect(insertData.version).toBe(1)
    })
  })
})
