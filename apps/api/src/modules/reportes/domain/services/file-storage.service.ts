// Domain service interface for file storage operations
export interface IFileStorage {
  // Save a file and return the path
  save(fileName: string, buffer: Buffer): Promise<string>

  // Get a file path for reading
  getPath(fileName: string): string

  // Check if a file exists
  exists(fileName: string): Promise<boolean>

  // Delete a file
  delete(fileName: string): Promise<boolean>

  // Get file as buffer for download
  getBuffer(fileName: string): Promise<Buffer>
}

export const FILE_STORAGE = Symbol('IFileStorage')
