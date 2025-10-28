/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at app startup and provides
 * type-safe access to environment configuration.
 */

interface EnvConfig {
  supabase: {
    url: string
    anonKey: string
  }
  app: {
    name: string
    version: string
  }
  isDemoMode: boolean
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

/**
 * Validates that required environment variables are present and valid
 */
function validateEnv(): EnvConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const appName = import.meta.env.VITE_APP_NAME || 'Fire Protection Tracker'
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

  // Check if we're in demo mode (missing or placeholder values)
  const isDemoMode = 
    !supabaseUrl || 
    !supabaseAnonKey || 
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('your_supabase_project_url') ||
    supabaseAnonKey.includes('your_supabase_anon_key') ||
    supabaseAnonKey === 'your-anon-key'

  if (isDemoMode) {
    console.warn('⚠️  Running in DEMO MODE')
    console.warn('📋 To use real data, configure these environment variables:')
    console.warn('   - VITE_SUPABASE_URL')
    console.warn('   - VITE_SUPABASE_ANON_KEY')
    console.warn('📖 See START_HERE.md for setup instructions')
  }

  // Validate URL format if not in demo mode
  if (!isDemoMode) {
    try {
      new URL(supabaseUrl)
    } catch (error) {
      throw new EnvValidationError(
        `Invalid VITE_SUPABASE_URL: "${supabaseUrl}" is not a valid URL`
      )
    }

    // Check if URL looks like a Supabase URL
    if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost')) {
      console.warn(
        `⚠️  VITE_SUPABASE_URL doesn't look like a Supabase URL: ${supabaseUrl}`
      )
    }

    // Validate anon key format (JWT)
    if (!supabaseAnonKey.startsWith('eyJ')) {
      throw new EnvValidationError(
        'Invalid VITE_SUPABASE_ANON_KEY: Key should be a JWT token starting with "eyJ"'
      )
    }
  }

  return {
    supabase: {
      url: isDemoMode ? 'https://demo.supabase.co' : supabaseUrl,
      anonKey: isDemoMode ? 'demo-key' : supabaseAnonKey,
    },
    app: {
      name: appName,
      version: appVersion,
    },
    isDemoMode,
  }
}

/**
 * Validated environment configuration
 * Throws an error if required variables are missing or invalid
 */
let envConfig: EnvConfig | null = null

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = validateEnv()
  }
  return envConfig
}

/**
 * Check if app is running in demo mode
 */
export function isDemoMode(): boolean {
  return getEnvConfig().isDemoMode
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  return getEnvConfig().supabase
}

/**
 * Get app configuration
 */
export function getAppConfig() {
  return getEnvConfig().app
}

/**
 * Display environment status in console
 */
export function logEnvStatus() {
  const config = getEnvConfig()
  
  console.group('🔧 Environment Configuration')
  console.log('App Name:', config.app.name)
  console.log('App Version:', config.app.version)
  console.log('Demo Mode:', config.isDemoMode ? '✅ Yes' : '❌ No')
  if (!config.isDemoMode) {
    console.log('Supabase URL:', config.supabase.url)
    console.log('Supabase Key:', config.supabase.anonKey.substring(0, 20) + '...')
  }
  console.groupEnd()
}

// Validate environment on module load
try {
  getEnvConfig()
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error('❌ Environment Configuration Error:')
    console.error(error.message)
    console.error('\n📖 Please check your .env file and see START_HERE.md for setup instructions')
  }
  throw error
}
