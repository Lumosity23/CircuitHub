import { promises as fs } from 'fs'
import path from 'path'
import { StorageDriver, StorageError } from './index'
import { v4 as uuidv4 } from 'uuid'

export class LocalStorageDriver implements StorageDriver {
  constructor(private basePath: string) {
    // Ensure base path exists
    this.ensureDirectoryExists(basePath)
  }

  async upload(file: File, filePath: string): Promise<{ url: string; path: string }> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      const directory = path.dirname(fullPath)
      
      // Ensure directory exists
      await this.ensureDirectoryExists(directory)

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Write file
      await fs.writeFile(fullPath, buffer)

      // Return URL (in production, this would be your domain + path)
      const url = `/files/${filePath}`

      return { url, path: filePath }
    } catch (error) {
      throw new StorageError(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPLOAD_FAILED'
      )
    }
  }

  async download(filePath: string): Promise<Blob> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      const buffer = await fs.readFile(fullPath)
      
      return new Blob([buffer])
    } catch (error) {
      throw new StorageError(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DOWNLOAD_FAILED'
      )
    }
  }

  async delete(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      await fs.unlink(fullPath)
    } catch (error) {
      throw new StorageError(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_FAILED'
      )
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  getPublicUrl(filePath: string): string {
    return `/files/${filePath}`
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }
}

// Factory function to create local storage driver
export function createLocalStorageDriver(basePath: string = './storage'): LocalStorageDriver {
  return new LocalStorageDriver(basePath)
}