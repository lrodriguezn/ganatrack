import { describe, it, expect } from 'vitest'
import { AuthDomainService } from '../auth.domain-service.js'

describe('AuthDomainService', () => {
  const domainService = new AuthDomainService()

  describe('validatePasswordStrength', () => {
    it('should accept a valid password with 8+ chars, upper, lower, and number', () => {
      expect(() => domainService.validatePasswordStrength('Admin123!')).not.toThrow()
    })

    it('should throw if password has less than 8 characters', () => {
      expect(() => domainService.validatePasswordStrength('Admin1!')).toThrow(
        'La contraseña debe tener al menos 8 caracteres'
      )
    })

    it('should throw if password has no uppercase letter', () => {
      expect(() => domainService.validatePasswordStrength('admin123!')).toThrow(
        'La contraseña debe tener al menos una mayúscula'
      )
    })

    it('should throw if password has no lowercase letter', () => {
      expect(() => domainService.validatePasswordStrength('ADMIN123!')).toThrow(
        'La contraseña debe tener al menos una minúscula'
      )
    })

    it('should throw if password has no number', () => {
      expect(() => domainService.validatePasswordStrength('AdminTest!')).toThrow(
        'La contraseña debe tener al menos un número'
      )
    })

    it('should accept exactly 8 characters with all requirements', () => {
      expect(() => domainService.validatePasswordStrength('Admin123')).not.toThrow()
    })
  })

  describe('generateOtpCode', () => {
    it('should generate a 6-digit string', () => {
      const code = domainService.generateOtpCode()
      expect(code).toHaveLength(6)
      expect(/^\d{6}$/.test(code)).toBe(true)
    })

    it('should generate codes in valid range (100000-999999)', () => {
      for (let i = 0; i < 100; i++) {
        const code = parseInt(domainService.generateOtpCode(), 10)
        expect(code).toBeGreaterThanOrEqual(100000)
        expect(code).toBeLessThanOrEqual(999999)
      }
    })

    it('should generate different codes on multiple calls', () => {
      const codes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        codes.add(domainService.generateOtpCode())
      }
      // With 900k possible codes, 100 samples should almost always be unique
      expect(codes.size).toBeGreaterThan(90)
    })
  })

  describe('isOtpExpired', () => {
    it('should return true if expiration date is null', () => {
      expect(domainService.isOtpExpired(null)).toBe(true)
    })

    it('should return true if expiration date is in the past', () => {
      const pastDate = new Date(Date.now() - 60000) // 1 minute ago
      expect(domainService.isOtpExpired(pastDate)).toBe(true)
    })

    it('should return false if expiration date is in the future', () => {
      const futureDate = new Date(Date.now() + 60000) // 1 minute from now
      expect(domainService.isOtpExpired(futureDate)).toBe(false)
    })
  })

  describe('isOtpLocked', () => {
    it('should return false if attempts are below max (default 3)', () => {
      expect(domainService.isOtpLocked(0)).toBe(false)
      expect(domainService.isOtpLocked(1)).toBe(false)
      expect(domainService.isOtpLocked(2)).toBe(false)
    })

    it('should return true if attempts equal max (3)', () => {
      expect(domainService.isOtpLocked(3)).toBe(true)
    })

    it('should return true if attempts exceed max', () => {
      expect(domainService.isOtpLocked(4)).toBe(true)
      expect(domainService.isOtpLocked(10)).toBe(true)
    })

    it('should respect custom maxAttempts parameter', () => {
      expect(domainService.isOtpLocked(2, 3)).toBe(false)
      expect(domainService.isOtpLocked(3, 3)).toBe(true)
      expect(domainService.isOtpLocked(5, 5)).toBe(true)
    })
  })
})
