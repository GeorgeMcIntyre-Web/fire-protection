/**
 * Storage Configuration and Policies
 *
 * Defines storage bucket structures, file validation utilities,
 * and storage policy configurations for Supabase Storage.
 */

export const STORAGE_BUCKETS = {
  COMPANY_DOCUMENTS: 'company-documents'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

/**
 * Supported file types and their MIME types
 */
export const SUPPORTED_FILE_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  csv: 'text/csv'
} as const

export type SupportedFileExtension = keyof typeof SUPPORTED_FILE_TYPES

/**
 * Maximum file size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  default: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024,   // 10MB
  document: 50 * 1024 * 1024 // 50MB
} as const

export interface FileValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates file type based on extension
 */
export function validateFileType(
  fileName: string,
  allowedExtensions?: SupportedFileExtension[]
): boolean {
  const extension = getFileExtension(fileName)
  
  if (!extension || !(extension in SUPPORTED_FILE_TYPES)) {
    return false
  }

  if (allowedExtensions && !allowedExtensions.includes(extension)) {
    return false
  }

  return true
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(fileName: string): SupportedFileExtension | null {
  const match = fileName.toLowerCase().match(/\.([^.]+)$/)
  if (!match) return null
  
  const ext = match[1] as SupportedFileExtension
  return ext in SUPPORTED_FILE_TYPES ? ext : null
}

/**
 * Gets MIME type from file extension
 */
export function getMimeType(fileName: string): string {
  const extension = getFileExtension(fileName)
  if (!extension) return 'application/octet-stream'
  
  return SUPPORTED_FILE_TYPES[extension]
}

/**
 * Gets appropriate file size limit based on file type
 */
export function getFileSizeLimit(fileName: string): number {
  const extension = getFileExtension(fileName)
  
  if (extension && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return FILE_SIZE_LIMITS.image
  }
  
  if (extension && ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
    return FILE_SIZE_LIMITS.document
  }
  
  return FILE_SIZE_LIMITS.default
}

/**
 * Validates file upload before sending to Supabase
 */
export function validateFileUpload(
  file: File,
  allowedExtensions?: SupportedFileExtension[]
): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check file type
  if (!validateFileType(file.name, allowedExtensions)) {
    const extension = getFileExtension(file.name)
    if (!extension) {
      errors.push(`File has no extension: ${file.name}`)
    } else {
      errors.push(`File type not supported: ${extension}. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(', ')}`)
    }
  }

  // Check file size
  const sizeLimit = getFileSizeLimit(file.name)
  if (file.size > sizeLimit) {
    errors.push(
      `File size (${formatFileSize(file.size)}) exceeds limit (${formatFileSize(sizeLimit)})`
    )
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push('File is empty')
  }

  // Warnings for large files (over 80% of limit)
  if (file.size > sizeLimit * 0.8) {
    warnings.push(`File size is close to limit: ${formatFileSize(file.size)} / ${formatFileSize(sizeLimit)}`)
  }

  // Warning for very long filenames
  if (file.name.length > 255) {
    warnings.push('Filename is very long and may cause issues')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Formats file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Generates a safe storage path for file uploads
 */
export function generateStoragePath(
  fileName: string,
  prefix?: string,
  userId?: string
): string {
  // Sanitize filename
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')

  const timestamp = Date.now()
  const parts: string[] = []

  if (prefix) {
    parts.push(prefix)
  }

  if (userId) {
    parts.push(userId)
  }

  parts.push(`${timestamp}_${sanitized}`)

  return parts.join('/')
}

/**
 * Storage bucket configuration
 */
export interface StorageBucketConfig {
  id: string
  public: boolean
  allowedMimeTypes?: string[]
  fileSizeLimit: number
  retentionDays?: number
}

/**
 * Storage bucket configurations
 */
export const BUCKET_CONFIGS: Record<StorageBucket, StorageBucketConfig> = {
  [STORAGE_BUCKETS.COMPANY_DOCUMENTS]: {
    id: STORAGE_BUCKETS.COMPANY_DOCUMENTS,
    public: true,
    allowedMimeTypes: Object.values(SUPPORTED_FILE_TYPES),
    fileSizeLimit: FILE_SIZE_LIMITS.document,
    retentionDays: undefined // Keep indefinitely
  }
}

/**
 * Checks if a bucket name is valid
 */
export function isValidBucket(bucket: string): bucket is StorageBucket {
  return Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)
}

/**
 * Gets bucket configuration
 */
export function getBucketConfig(bucket: string): StorageBucketConfig | null {
  if (!isValidBucket(bucket)) {
    return null
  }
  return BUCKET_CONFIGS[bucket]
}

/**
 * Validates storage path format
 */
export function validateStoragePath(path: string): boolean {
  // Path should not be empty, not start/end with slash (except root)
  if (!path || path.trim() === '') {
    return false
  }

  // Should not contain dangerous patterns
  const dangerousPatterns = ['..', '//', '~', '$']
  if (dangerousPatterns.some(pattern => path.includes(pattern))) {
    return false
  }

  // Should be reasonable length
  if (path.length > 1024) {
    return false
  }

  return true
}
