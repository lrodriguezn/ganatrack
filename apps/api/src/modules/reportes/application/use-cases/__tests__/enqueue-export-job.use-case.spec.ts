import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EnqueueExportJobUseCase } from '../enqueue-export-job.use-case'
import type { IJobQueue } from '../../../domain/services/job-queue.service'
import type { IExportJobRepository } from '../../../domain/repositories/export-job.repository'
import type { ReporteTipo, ExportFormato } from '../../../domain/entities/reporte-exportacion.entity'

describe('EnqueueExportJobUseCase', () => {
  let useCase: EnqueueExportJobUseCase
  let mockJobQueue: IJobQueue
  let mockExportJobRepo: IExportJobRepository

  const mockJob = {
    id: 1,
    tipo: 'inventario' as ReporteTipo,
    formato: 'csv' as ExportFormato,
    estado: 'pendiente',
    progreso: 0,
    parametros: '{}',
    rutaArchivo: null,
    usuarioId: 1,
    predioId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockJobQueue = {
      enqueue: vi.fn().mockReturnValue('job-123'),
    }

    mockExportJobRepo = {
      findById: vi.fn(),
      findByUser: vi.fn(),
      create: vi.fn().mockResolvedValue(mockJob),
      updateStatus: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new EnqueueExportJobUseCase(mockJobQueue, mockExportJobRepo)
  })

  it('should create export job and enqueue it', async () => {
    const result = await useCase.execute('inventario', 'csv', {}, 1, 1)

    expect(result.jobId).toBe(1)
    expect(result.estado).toBe('pendiente')
    expect(mockExportJobRepo.create).toHaveBeenCalled()
    expect(mockJobQueue.enqueue).toHaveBeenCalled()
  })

  it('should pass correct parameters to job queue', async () => {
    const filtros = { potreroId: 1 }

    await useCase.execute('inventario', 'csv', filtros, 1, 1)

    expect(mockJobQueue.enqueue).toHaveBeenCalledWith({
      tipo: 'inventario',
      formato: 'csv',
      filtros,
      usuarioId: 1,
      predioId: 1,
    })
  })

  it('should return job with pending status', async () => {
    const result = await useCase.execute('inventario', 'csv', {}, 1, 1)

    expect(result.estado).toBe('pendiente')
    expect(result.progreso).toBe(0)
    expect(result.rutaArchivo).toBeNull()
  })
})
