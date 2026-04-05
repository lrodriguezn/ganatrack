import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/server.ts'],
      thresholds: {
        global: {
          branches: 55,
          functions: 35,
          lines: 55,
          statements: 55,
        },
        // Critical modules - tested more thoroughly
        './src/modules/auth/**': {
          branches: 65,
          functions: 45,
          lines: 60,
          statements: 60,
        },
        './src/modules/usuarios/**': {
          branches: 55,
          functions: 35,
          lines: 55,
          statements: 55,
        },
        './src/modules/notificaciones/**': {
          branches: 60,
          functions: 40,
          lines: 50,
          statements: 50,
        },
        // New modules - realistic thresholds for use case unit tests
        // Note: Function coverage is low because tests only call execute() method
        './src/modules/animales/**': {
          branches: 55,
          functions: 20,
          lines: 60,
          statements: 60,
        },
        './src/modules/servicios/**': {
          branches: 60,
          functions: 15,
          lines: 40,
          statements: 40,
        },
        './src/modules/predios/**': {
          branches: 55,
          functions: 10,
          lines: 30,
          statements: 30,
        },
        './src/modules/configuracion/**': {
          branches: 55,
          functions: 5,
          lines: 30,
          statements: 30,
        },
        './src/modules/productos/**': {
          branches: 55,
          functions: 25,
          lines: 60,
          statements: 60,
        },
        './src/modules/reportes/**': {
          branches: 55,
          functions: 5,
          lines: 25,
          statements: 25,
        },
        './src/modules/imagenes/**': {
          branches: 60,
          functions: 30,
          lines: 60,
          statements: 60,
        },
        './src/modules/maestros/**': {
          branches: 55,
          functions: 10,
          lines: 35,
          statements: 35,
        },
      },
    },
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
