/**
 * Environment Variable Validation
 *
 * Validates required environment variables and provides type-safe
 * access to configuration values for different environments.
 */

export type Environment = 'development' | 'staging' | 'production'

export interface EnvConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  environment: Environment
  isDemoMode: boolean
}

interface ValidatedEnv {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_ENVIRONMENT?: Environment
}

class EnvironmentValidationError extends Error {
  missingVars: string[] = []
  constructor(message: string, missingVars: string[] = []) {
    super(message)
    this.name = 'EnvironmentValidationError'
    this.missingVars = missingVars
  }
}

/**
 * Validates required environment variables
 */
function validateEnvironment(): ValidatedEnv {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const environment = import.meta.env.VITE_ENVIRONMENT as Environment | undefined

  const missingVars: string[] = []

  if (!supabaseUrl || supabaseUrl.trim() === '' || supabaseUrl.includes('your-project-id')) {
    missingVars.push('VITE_SUPABASE_URL')
  }

  if (!supabaseAnonKey || supabaseAnonKey.trim() === '' || supabaseAnonKey.includes('your-key')) {
    missingVars.push('VITE_SUPABASE_ANON_KEY')
  }

  if (missingVars.length > 0) {
    throw new EnvironmentValidationError(
      `Missing or invalid required environment variables: ${missingVars.join(', ')}`,
      missingVars
    )
  }

  return {
    VITE_SUPABASE_URL: supabaseUrl.trim(),
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey.trim(),
    VITE_ENVIRONMENT: environment
  }
}

/**
 * Determines the current environment
 */
function getEnvironment(): Environment {
  const env = import.meta.env.MODE || import.meta.env.VITE_ENVIRONMENT || 'development'

  if (env === 'production' || env === 'prod') {
    return 'production'
  }
  if (env === 'staging' || env === 'stage') {
    return 'staging'
  }
  return 'development'
}

/**
 * Validates Supabase URL format
 */
function validateSupabaseUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname.includes('supabase')
  } catch {
    return false
  }
}

/**
 * Gets validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const validated = validateEnvironment()

  if (!validateSupabaseUrl(validated.VITE_SUPABASE_URL)) {
    console.warn('Supabase URL format may be invalid:', validated.VITE_SUPABASE_URL)
  }

  const environment = validated.VITE_ENVIRONMENT || getEnvironment()
  const isDemoMode = !validated.VITE_SUPABASE_URL || !validated.VITE_SUPABASE_ANON_KEY ||
                     validated.VITE_SUPABASE_URL.includes('your-project-id') ||
                     validated.VITE_SUPABASE_ANON_KEY.includes('your-key')

  return {
    supabaseUrl: validated.VITE_SUPABASE_URL,
    supabaseAnonKey: validated.VITE_SUPABASE_ANON_KEY,
    environment,
    isDemoMode
  }
}

/**
 * Health check for environment variables
 */
export function checkEnvironmentHealth(): {
  healthy: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const config = getEnvConfig()

    if (config.isDemoMode) {
      warnings.push('Running in demo mode - Supabase credentials not properly configured')
    }

    if (config.environment === 'production' && config.isDemoMode) {
      errors.push('Production environment requires valid Supabase credentials')
    }

    if (!validateSupabaseUrl(config.supabaseUrl)) {
      warnings.push(`Supabase URL format may be invalid: ${config.supabaseUrl}`)
    }

    return {
      healthy: errors.length === 0,
      errors,
      warnings
    }
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      return {
        healthy: false,
        errors: [error.message, ...error.missingVars.map(v => `Missing: ${v}`)],
        warnings
      }
    }
    return {
      healthy: false,
      errors: [`Unexpected error: ${error instanceof Error ? error.message : String(error)}`],
      warnings
    }
  }
}

/**
 * Get environment-specific configuration values
 */
export function getEnvironmentConfig(): Record<string, unknown> {
  const env = getEnvironment()
  const config = getEnvConfig()

  const baseConfig = {
    environment: env,
    supabaseUrl: config.supabaseUrl,
    isDemoMode: config.isDemoMode
  }

  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        enableLogging: false,
        enableDebug: false,
        apiTimeout: 30000
      }
    case 'staging':
      return {
        ...baseConfig,
        enableLogging: true,
        enableDebug: true,
        apiTimeout: 20000
      }
    case 'development':
    default:
      return {
        ...baseConfig,
        enableLogging: true,
        enableDebug: true,
        apiTimeout: 10000
      }
  }
}

/**
 * Logs environment health status to console
 */
export function logEnvironmentHealth(): void {
  const health = checkEnvironmentHealth()
  const config = getEnvironmentConfig()

  console.group('🔍 Environment Health Check')
  console.log('Environment:', config.environment)
  console.log('Status:', health.healthy ? '✅ Healthy' : '❌ Unhealthy')

  if (health.errors.length > 0) {
    console.error('Errors:', health.errors)
  }

  if (health.warnings.length > 0) {
    console.warn('Warnings:', health.warnings)
  }

  if (health.healthy && health.warnings.length === 0) {
    console.log('All checks passed! ✅')
  }

  console.groupEnd()
}
