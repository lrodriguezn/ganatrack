import 'reflect-metadata'
import { config } from 'dotenv'

// Load .env file for tests
config({ path: '.env' })

import { vi } from 'vitest'

// Increase default timeout for integration tests
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000,
})

// Mock console.warn to reduce noise in test output
// Uncomment if needed:
// vi.spyOn(console, 'warn').mockImplementation(() => {})

// Clean up after each test file
afterEach(() => {
  vi.clearAllMocks()
})
