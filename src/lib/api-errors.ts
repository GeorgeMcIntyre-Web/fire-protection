/**
 * API Error Handling Utilities
 * 
 * Provides consistent error handling, user-friendly messages,
 * and utilities for working with Supabase and API errors.
 */

import { PostgrestError } from '@supabase/supabase-js'

/**
 * Standard API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Error types for categorization
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyMessage(errorType: ErrorType, customMessage?: string): string {
  if (customMessage) return customMessage

  const messages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Unable to connect. Please check your internet connection.',
    [ErrorType.AUTHENTICATION]: 'Please sign in to continue.',
    [ErrorType.AUTHORIZATION]: "You don't have permission to perform this action.",
    [ErrorType.VALIDATION]: 'Please check your input and try again.',
    [ErrorType.NOT_FOUND]: 'The requested item could not be found.',
    [ErrorType.CONFLICT]: 'This action conflicts with existing data.',
    [ErrorType.SERVER]: 'Something went wrong on our end. Please try again later.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  }

  return messages[errorType]
}

/**
 * Categorize PostgreSQL error codes
 */
function categorizePostgresError(code: string): ErrorType {
  // Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  
  // Authentication errors (28xxx)
  if (code.startsWith('28')) return ErrorType.AUTHENTICATION
  
  // Insufficient privilege (42501)
  if (code === '42501') return ErrorType.AUTHORIZATION
  
  // Unique violation (23505)
  if (code === '23505') return ErrorType.CONFLICT
  
  // Foreign key violation (23503)
  if (code === '23503') return ErrorType.VALIDATION
  
  // Not null violation (23502)
  if (code === '23502') return ErrorType.VALIDATION
  
  // Check violation (23514)
  if (code === '23514') return ErrorType.VALIDATION
  
  // Undefined table/column (42P01, 42703)
  if (code === '42P01' || code === '42703') return ErrorType.SERVER

  return ErrorType.UNKNOWN
}

/**
 * Parse Supabase/Postgrest error into ApiError
 */
export function parseSupabaseError(error: PostgrestError | Error | unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error
  }

  // Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError(
      getUserFriendlyMessage(ErrorType.NETWORK),
      ErrorType.NETWORK,
      error
    )
  }

  // Postgrest error
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError
    const errorType = pgError.code ? categorizePostgresError(pgError.code) : ErrorType.UNKNOWN
    
    return new ApiError(
      pgError.message || getUserFriendlyMessage(errorType),
      pgError.code,
      pgError.details
    )
  }

  // Generic Error
  if (error instanceof Error) {
    return new ApiError(
      error.message || getUserFriendlyMessage(ErrorType.UNKNOWN),
      ErrorType.UNKNOWN,
      error
    )
  }

  // Unknown error type
  return new ApiError(
    getUserFriendlyMessage(ErrorType.UNKNOWN),
    ErrorType.UNKNOWN,
    error
  )
}

/**
 * Handle API error with consistent logging and user feedback
 */
export function handleApiError(
  error: unknown,
  options?: {
    context?: string
    silent?: boolean
    rethrow?: boolean
  }
): ApiError {
  const apiError = parseSupabaseError(error)

  // Log error for debugging
  if (!options?.silent) {
    console.error(
      `[API Error]${options?.context ? ` ${options.context}:` : ''}`,
      {
        message: apiError.message,
        code: apiError.code,
        details: apiError.details,
      }
    )
  }

  // Rethrow if requested
  if (options?.rethrow) {
    throw apiError
  }

  return apiError
}

/**
 * Create a retry wrapper for API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number
    delay?: number
    backoff?: boolean
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3
  const delay = options?.delay ?? 1000
  const backoff = options?.backoff ?? true

  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on auth or validation errors
      const apiError = parseSupabaseError(error)
      if (
        apiError.code === ErrorType.AUTHENTICATION ||
        apiError.code === ErrorType.AUTHORIZATION ||
        apiError.code === ErrorType.VALIDATION
      ) {
        throw apiError
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break
      }

      // Calculate delay with optional exponential backoff
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw handleApiError(lastError, { context: 'Retry failed', rethrow: true })
}

/**
 * Type guard for checking if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Extract error message safely from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return getUserFriendlyMessage(ErrorType.UNKNOWN)
}

/**
 * Create a success/error result type for API responses
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }

/**
 * Wrap async function to return ApiResult instead of throwing
 */
export async function toApiResult<T>(
  promise: Promise<T>
): Promise<ApiResult<T>> {
  try {
    const data = await promise
    return { success: true, data }
  } catch (error) {
    return { success: false, error: parseSupabaseError(error) }
  }
}

/**
 * Common error messages for reuse
 */
export const ErrorMessages = {
  NETWORK_ERROR: getUserFriendlyMessage(ErrorType.NETWORK),
  AUTH_REQUIRED: getUserFriendlyMessage(ErrorType.AUTHENTICATION),
  PERMISSION_DENIED: getUserFriendlyMessage(ErrorType.AUTHORIZATION),
  NOT_FOUND: getUserFriendlyMessage(ErrorType.NOT_FOUND),
  VALIDATION_ERROR: getUserFriendlyMessage(ErrorType.VALIDATION),
  SERVER_ERROR: getUserFriendlyMessage(ErrorType.SERVER),
  UNKNOWN_ERROR: getUserFriendlyMessage(ErrorType.UNKNOWN),
} as const
