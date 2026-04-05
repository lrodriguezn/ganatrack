import { injectable } from 'tsyringe'
import type { IJobQueue, ExportJob } from '../../domain/services/job-queue.service.js'
import type { ReporteTipo, ExportFormato, ReporteFiltros } from '../../domain/entities/reporte-exportacion.entity.js'

// In-memory job storage (in production, use Redis or BullMQ)
const jobs = new Map<string, ExportJob>()

@injectable()
export class InMemoryJobQueueService implements IJobQueue {
  enqueue(job: Omit<ExportJob, 'id' | 'status' | 'progress' | 'createdAt'>): string {
    const id = this.generateId()
    const fullJob: ExportJob = {
      ...job,
      id,
      status: 'pendiente',
      progress: 0,
      createdAt: new Date(),
    }
    jobs.set(id, fullJob)
    return id
  }

  getJob(jobId: string): ExportJob | undefined {
    return jobs.get(jobId)
  }

  listJobs(usuarioId: number, page: number, limit: number): { data: ExportJob[]; total: number } {
    const allJobs = Array.from(jobs.values())
      .filter(j => j.usuarioId === usuarioId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const total = allJobs.length
    const start = (page - 1) * limit
    const data = allJobs.slice(start, start + limit)

    return { data, total }
  }

  listJobsByPredio(predioId: number, page: number, limit: number): { data: ExportJob[]; total: number } {
    const allJobs = Array.from(jobs.values())
      .filter(j => j.predioId === predioId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const total = allJobs.length
    const start = (page - 1) * limit
    const data = allJobs.slice(start, start + limit)

    return { data, total }
  }

  updateStatus(
    jobId: string,
    status: ExportJob['status'],
    progress?: number,
    rutaArchivo?: string,
    error?: string
  ): void {
    const job = jobs.get(jobId)
    if (job) {
      job.status = status
      if (progress !== undefined) {
        job.progress = progress
      }
      if (rutaArchivo !== undefined) {
        job.rutaArchivo = rutaArchivo
      }
      if (error !== undefined) {
        job.error = error
      }
      jobs.set(jobId, job)
    }
  }

  dequeue(jobId: string): boolean {
    return jobs.delete(jobId)
  }

  private generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
