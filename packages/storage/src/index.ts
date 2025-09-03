export interface StorageDriver {
  upload(file: File, path: string): Promise<{ url: string; path: string }>
  download(path: string): Promise<Blob>
  delete(path: string): Promise<void>
  exists(path: string): Promise<boolean>
  getPublicUrl(path: string): string
}

export interface FileInfo {
  name: string
  size: number
  type: string
  path: string
  url: string
  createdAt: Date
}

export class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'StorageError'
  }
}

export interface UploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  path?: string
}

export class StorageService {
  constructor(private driver: StorageDriver) {}

  async uploadFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<FileInfo> {
    const { maxSize = 25 * 1024 * 1024, allowedTypes, path = '' } = options

    // Validate file size
    if (file.size > maxSize) {
      throw new StorageError(
        `File size exceeds maximum allowed size of ${maxSize} bytes`,
        'FILE_TOO_LARGE'
      )
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new StorageError(
        `File type ${file.type} is not allowed`,
        'INVALID_FILE_TYPE'
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || ''
    const filename = `${timestamp}_${randomId}.${extension}`
    const fullPath = path ? `${path}/${filename}` : filename

    // Upload file
    const result = await this.driver.upload(file, fullPath)

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      path: result.path,
      url: result.url,
      createdAt: new Date(),
    }
  }

  async deleteFile(path: string): Promise<void> {
    await this.driver.delete(path)
  }

  async fileExists(path: string): Promise<boolean> {
    return await this.driver.exists(path)
  }

  getPublicUrl(path: string): string {
    return this.driver.getPublicUrl(path)
  }
}