/**
 * Database Backup Utility
 *
 * Creates a backup of the Supabase database schema and data.
 * Can be used to create snapshots before migrations or for disaster recovery.
 *
 * Usage:
 *   npx tsx scripts/database-backup.ts
 *
 * Environment Variables:
 *   VITE_SUPABASE_URL - Supabase project URL
 *   VITE_SUPABASE_ANON_KEY - Supabase anon key (or use service role key for full backup)
 *   SUPABASE_SERVICE_ROLE_KEY - Optional: Service role key for complete backup
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface BackupOptions {
  includeData?: boolean
  includeSchema?: boolean
  tables?: string[]
  outputDir?: string
}

/**
 * Gets all tables from the public schema
 */
async function getTables(): Promise<string[]> {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE')

  if (error) {
    console.error('Error fetching tables:', error)
    return []
  }

  return data.map(row => row.table_name)
}

/**
 * Backs up table schema
 */
async function backupTableSchema(tableName: string): Promise<string> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        'CREATE TABLE IF NOT EXISTS ' || quote_ident(table_name) || ' (' ||
        string_agg(
          quote_ident(column_name) || ' ' || data_type ||
          CASE 
            WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')'
            ELSE ''
          END ||
          CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
          ', '
        ) || ');'
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      GROUP BY table_name;
    `,
    params: [tableName]
  })

  // Fallback: simple CREATE TABLE statement
  const { data: columns } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, character_maximum_length')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)

  if (!columns || columns.length === 0) {
    return `-- Table ${tableName} schema not found`
  }

  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`
  sql += columns.map(col => {
    let def = `  ${col.column_name} ${col.data_type}`
    if (col.character_maximum_length) {
      def += `(${col.character_maximum_length})`
    }
    if (col.is_nullable === 'NO') {
      def += ' NOT NULL'
    }
    return def
  }).join(',\n')
  sql += '\n);\n'

  return sql
}

/**
 * Backs up table data
 */
async function backupTableData(tableName: string): Promise<string> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')

  if (error) {
    return `-- Error backing up ${tableName}: ${error.message}\n`
  }

  if (!data || data.length === 0) {
    return `-- Table ${tableName} is empty\n`
  }

  let sql = `-- Data for ${tableName}\n`
  sql += `INSERT INTO ${tableName} VALUES\n`

  const values = data.map(row => {
    const vals = Object.values(row).map(val => {
      if (val === null) return 'NULL'
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
      return String(val)
    })
    return `(${vals.join(', ')})`
  })

  sql += values.join(',\n') + ';\n\n'

  return sql
}

/**
 * Creates a database backup
 */
async function createBackup(options: BackupOptions = {}): Promise<void> {
  const {
    includeData = true,
    includeSchema = true,
    tables,
    outputDir = './backups'
  } = options

  console.log('📦 Starting database backup...\n')

  // Create output directory
  mkdirSync(outputDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = join(outputDir, `backup-${timestamp}.sql`)

  let backupContent = `-- Database Backup\n`
  backupContent += `-- Created: ${new Date().toISOString()}\n`
  backupContent += `-- Supabase URL: ${supabaseUrl}\n\n`

  // Get tables to backup
  const allTables = tables || await getTables()

  if (allTables.length === 0) {
    console.error('❌ No tables found to backup')
    return
  }

  console.log(`📋 Found ${allTables.length} tables`)

  for (const table of allTables) {
    console.log(`  Processing: ${table}`)

    if (includeSchema) {
      const schema = await backupTableSchema(table)
      backupContent += `\n-- Schema for ${table}\n${schema}\n`
    }

    if (includeData) {
      const data = await backupTableData(table)
      backupContent += data
    }
  }

  // Write backup file
  writeFileSync(backupFile, backupContent)
  console.log(`\n✅ Backup created: ${backupFile}`)
  console.log(`   Size: ${(backupContent.length / 1024).toFixed(2)} KB`)
}

/**
 * Main function
 */
async function main() {
  try {
    await createBackup({
      includeSchema: true,
      includeData: true
    })
  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { createBackup, BackupOptions }
