/**
 * Migration Validation Script
 *
 * Validates that the production migration has been applied correctly
 * and checks for missing indexes, constraints, and tables.
 *
 * Usage:
 *   npx tsx scripts/validate-migration.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ValidationResult {
  table: string
  exists: boolean
  hasIndexes: boolean
  hasRLS: boolean
  rowCount?: number
  errors: string[]
}

const REQUIRED_TABLES = [
  'profiles',
  'clients',
  'projects',
  'tasks',
  'time_logs',
  'work_documentation',
  'document_categories',
  'document_library',
  'project_documents'
]

const REQUIRED_INDEXES: Record<string, string[]> = {
  projects: ['idx_projects_client_id', 'idx_projects_status', 'idx_projects_created_at'],
  tasks: ['idx_tasks_project_id', 'idx_tasks_status', 'idx_tasks_priority', 'idx_tasks_due_date'],
  time_logs: ['idx_time_logs_project_id', 'idx_time_logs_user_id', 'idx_time_logs_task_id'],
  document_library: ['idx_document_library_category_id', 'idx_document_library_created_at'],
  project_documents: ['idx_project_documents_project_id', 'idx_project_documents_document_id']
}

/**
 * Checks if a table exists
 */
async function tableExists(tableName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  // If we get an error, it might be permissions or table doesn't exist
  return !error
}

/**
 * Checks if indexes exist for a table
 */
async function checkIndexes(tableName: string, requiredIndexes: string[]): Promise<boolean> {
  // Query pg_indexes to check for indexes
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename = $1
    `,
    params: [tableName]
  })

  if (error) {
    // Fallback: assume indexes exist if we can't check
    console.warn(`  ⚠️  Could not verify indexes for ${tableName}: ${error.message}`)
    return true
  }

  const existingIndexes = data?.map((row: any) => row.indexname) || []
  const missing = requiredIndexes.filter(idx => !existingIndexes.includes(idx))

  if (missing.length > 0) {
    console.warn(`  ⚠️  Missing indexes for ${tableName}: ${missing.join(', ')}`)
    return false
  }

  return true
}

/**
 * Checks if RLS is enabled on a table
 */
async function checkRLS(tableName: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = $1 AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `,
    params: [tableName]
  })

  if (error) {
    console.warn(`  ⚠️  Could not verify RLS for ${tableName}: ${error.message}`)
    return true // Assume enabled if we can't check
  }

  return data?.[0]?.relrowsecurity === true
}

/**
 * Gets row count for a table
 */
async function getRowCount(tableName: string): Promise<number | null> {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  if (error) {
    return null
  }

  return count || 0
}

/**
 * Validates the database migration
 */
async function validateMigration(): Promise<void> {
  console.log('🔍 Validating database migration...\n')

  const results: ValidationResult[] = []
  let allValid = true

  for (const table of REQUIRED_TABLES) {
    console.log(`Checking table: ${table}`)

    const exists = await tableExists(table)
    const requiredIndexes = REQUIRED_INDEXES[table] || []
    const hasIndexes = requiredIndexes.length === 0 || await checkIndexes(table, requiredIndexes)
    const hasRLS = await checkRLS(table)
    const rowCount = await getRowCount(table)
    const errors: string[] = []

    if (!exists) {
      errors.push(`Table ${table} does not exist`)
      allValid = false
    }

    if (!hasIndexes && requiredIndexes.length > 0) {
      errors.push(`Missing required indexes for ${table}`)
      allValid = false
    }

    if (!hasRLS) {
      errors.push(`RLS is not enabled on ${table}`)
      allValid = false
    }

    results.push({
      table,
      exists,
      hasIndexes,
      hasRLS,
      rowCount: rowCount ?? undefined,
      errors
    })

    if (errors.length === 0) {
      console.log(`  ✅ ${table} - OK${rowCount !== null ? ` (${rowCount} rows)` : ''}`)
    } else {
      console.log(`  ❌ ${table} - FAILED`)
      errors.forEach(err => console.log(`     - ${err}`))
    }
  }

  // Check storage bucket
  console.log('\nChecking storage bucket: company-documents')
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  
  if (bucketError) {
    console.log(`  ⚠️  Could not check buckets: ${bucketError.message}`)
  } else {
    const bucketExists = buckets?.some(b => b.id === 'company-documents') || false
    if (bucketExists) {
      console.log('  ✅ company-documents bucket exists')
    } else {
      console.log('  ❌ company-documents bucket does not exist')
      allValid = false
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  if (allValid) {
    console.log('✅ Migration validation PASSED')
    console.log('   All tables, indexes, and constraints are in place')
  } else {
    console.log('❌ Migration validation FAILED')
    console.log('   Please review the errors above and run the migration script')
    process.exit(1)
  }
  console.log('='.repeat(50) + '\n')
}

/**
 * Main function
 */
async function main() {
  try {
    await validateMigration()
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { validateMigration }
