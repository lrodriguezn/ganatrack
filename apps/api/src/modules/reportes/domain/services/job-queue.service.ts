import type { ReporteTipo, ExportFormato, ReporteFiltros } from '../entities/reporte-exportacion.entity.js'

// Represents a job in the queue
export interface ExportJob {
  id: string
  tipo: ReporteTipo
  formato: ExportFormato
  filtros: ReporteFiltros
  usuarioId: number
  predioId: number
  status: 'pendiente' | 'procesando' | 'completado' | 'fallido'
  progress: number  // 0-100
  rutaArchivo?: string
  error?: string
  createdAt: Date
}

// Domain service interface for job queue operations
export interface IJobQueue {
  // Enqueue a new export job
  enqueue(job: Omit<ExportJob, 'id' | 'status' | 'progress' | 'createdAt'>): string

  // Get a specific job by ID
  getJob(jobId: string): ExportJob | undefined

  // List jobs for a user
  listJobs(usuarioId: number, page: number, limit: number): { data: ExportJob[]; total: number }

  // List jobs for a tenant
  listJobsByPredio(predioId: number, page: number, limit: number): { data: ExportJob[]; total: number }

  // Update job status
  updateStatus(jobId: string, status: ExportJob['status'], progress?: number, rutaArchivo?: string, error?: string): void

  // Remove a job from the queue
  dequeue(jobId: string): boolean
}

export const JOB_QUEUE = Symbol('IJobQueue')
