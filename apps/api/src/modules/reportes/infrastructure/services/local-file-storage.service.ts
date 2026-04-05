import { injectable } from 'tsyringe'
import { promises as fs } from 'fs'
import { join } from 'path'
import type { IFileStorage } from '../../domain/services/file-storage.service.js'

// Base directory for exported files
const EXPORTS_DIR = process.env.EXPORTS_DIR ?? join(process.cwd(), 'exports')

@injectable()
export class LocalFileStorageService implements IFileStorage {
  private initialized = false

  private async ensureDir(): Promise<void> {
    if (!this.initialized) {
      try {
        await fs.mkdir(EXPORTS_DIR, { recursive: true })
        this.initialized = true
      } catch {
        // Directory may already exist
        this.initialized = true
      }
    }
  }

  async save(fileName: string, buffer: Buffer): Promise<string> {
    await this.ensureDir()
    const filePath = join(EXPORTS_DIR, fileName)
    await fs.writeFile(filePath, buffer)
    return filePath
  }

  getPath(fileName: string): string {
    return join(EXPORTS_DIR, fileName)
  }

  async exists(fileName: string): Promise<boolean> {
    try {
      await fs.access(join(EXPORTS_DIR, fileName))
      return true
    } catch {
      return false
    }
  }

  async delete(fileName: string): Promise<boolean> {
    try {
      await fs.unlink(join(EXPORTS_DIR, fileName))
      return true
    } catch {
      return false
    }
  }

  async getBuffer(fileName: string): Promise<Buffer> {
    return fs.readFile(join(EXPORTS_DIR, fileName))
  }
}
