/**
 * Document Migration Script
 *
 * This script helps migrate existing documents from your file system to Supabase
 *
 * Usage:
 *   npm install --save-dev tsx
 *   npx tsx scripts/migrate-documents.ts <path-to-documents>
 *
 * Example:
 *   npx tsx scripts/migrate-documents.ts "C:\Users\George\source\repos\fire-protection_data\fire-pro-docs\OneDrive_1_10-26-2025"
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Category mapping based on folder names
const categoryMap: Record<string, number> = {
  'appointments': 1,
  'organograms': 1,
  'certificates': 2,
  'checklists': 3,
  'forms': 4,
  'templates': 4,
  'index': 5,
  'registers': 5,
  'policies': 6,
  'processes': 7,
  'reports': 8,
  'work instructions': 9,
  'instructions': 9,
}

// Supported file extensions
const supportedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']

/**
 * Parse document code from filename
 */
function parseDocumentCode(filename: string): {
  code: string | null
  version: string | null
  name: string
} {
  const codeMatch = filename.match(/(CFM-[A-Z]+-[A-Z]+-\d+)/)
  const versionMatch = filename.match(/Rev\s*(\d+)/i)

  let name = filename.replace(/\.[^/.]+$/, '') // Remove extension
  if (codeMatch) {
    name = name.replace(codeMatch[0], '').replace(/^[\s-]+|[\s-]+$/g, '')
  }
  if (versionMatch) {
    name = name.replace(/Rev\s*\d+/i, '').trim()
  }

  return {
    code: codeMatch ? codeMatch[1] : null,
    version: versionMatch ? versionMatch[1] : null,
    name: name || basename(filename)
  }
}

/**
 * Determine category from folder path
 */
function getCategoryFromPath(path: string): number | null {
  const lowerPath = path.toLowerCase()

  for (const [keyword, categoryId] of Object.entries(categoryMap)) {
    if (lowerPath.includes(keyword)) {
      return categoryId
    }
  }

  return null
}

/**
 * Upload a file to Supabase storage
 */
async function uploadFile(
  filePath: string,
  fileName: string,
  bucket: string = 'company-documents'
): Promise<string | null> {
  try {
    const fileBuffer = readFileSync(filePath)
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${Date.now()}_${sanitizedName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: getContentType(fileName),
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error(`Upload error for ${fileName}:`, error.message)
      return null
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath)

    return data.publicUrl
  } catch (error) {
    console.error(`Failed to upload ${fileName}:`, error)
    return null
  }
}

/**
 * Get content type from file extension
 */
function getContentType(filename: string): string {
  const ext = extname(filename).toLowerCase()
  const types: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain'
  }
  return types[ext] || 'application/octet-stream'
}

/**
 * Create document record in database
 */
async function createDocumentRecord(
  name: string,
  fileUrl: string,
  fileType: string,
  categoryId: number | null,
  documentCode: string | null,
  version: string | null,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_library')
      .insert({
        name,
        file_url: fileUrl,
        file_type: fileType,
        category_id: categoryId,
        document_code: documentCode,
        version: version,
        created_by: userId
      })

    if (error) {
      console.error(`Database error for ${name}:`, error.message)
      return false
    }

    return true
  } catch (error) {
    console.error(`Failed to create record for ${name}:`, error)
    return false
  }
}

/**
 * Process a directory recursively
 */
async function processDirectory(
  dirPath: string,
  userId: string,
  stats: { processed: number; success: number; failed: number }
): Promise<void> {
  try {
    const items = readdirSync(dirPath)

    for (const item of items) {
      const fullPath = join(dirPath, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        // Skip certain directories
        if (item.toLowerCase().includes('old rev') ||
            item.toLowerCase().includes('signed pdf') ||
            item.toLowerCase() === 'question') {
          console.log(`Skipping directory: ${item}`)
          continue
        }

        // Recursively process subdirectory
        await processDirectory(fullPath, userId, stats)
      } else if (stat.isFile()) {
        const ext = extname(item).toLowerCase()

        // Only process supported file types
        if (!supportedExtensions.includes(ext)) {
          continue
        }

        stats.processed++
        console.log(`\nProcessing: ${item}`)

        // Parse document information
        const parsed = parseDocumentCode(item)
        const categoryId = getCategoryFromPath(dirPath)

        console.log(`  Name: ${parsed.name}`)
        console.log(`  Code: ${parsed.code || 'N/A'}`)
        console.log(`  Version: ${parsed.version || 'N/A'}`)
        console.log(`  Category: ${categoryId || 'Auto-detect'}`)

        // Upload file
        const fileUrl = await uploadFile(fullPath, item)
        if (!fileUrl) {
          stats.failed++
          continue
        }

        // Create database record
        const success = await createDocumentRecord(
          parsed.name,
          fileUrl,
          getContentType(item),
          categoryId,
          parsed.code,
          parsed.version,
          userId
        )

        if (success) {
          stats.success++
          console.log(`  ✓ Successfully migrated`)
        } else {
          stats.failed++
          console.log(`  ✗ Failed to create database record`)
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error)
  }
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/migrate-documents.ts <path-to-documents>')
    console.log('Example: npx tsx scripts/migrate-documents.ts "C:\\Users\\George\\source\\repos\\fire-protection_data\\fire-pro-docs\\OneDrive_1_10-26-2025"')
    process.exit(1)
  }

  const sourcePath = args[0]

  console.log('Document Migration Script')
  console.log('=========================\n')
  console.log(`Source: ${sourcePath}\n`)

  // Authenticate (you'll need to sign in first or provide a service role key)
  console.log('Checking authentication...')
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('Error: Not authenticated. Please sign in first or set SUPABASE_SERVICE_ROLE_KEY')
    console.error('For now, you\'ll need to upload documents through the web interface')
    process.exit(1)
  }

  console.log(`Authenticated as: ${user.email}`)
  console.log(`User ID: ${user.id}\n`)

  const stats = {
    processed: 0,
    success: 0,
    failed: 0
  }

  console.log('Starting migration...\n')
  await processDirectory(sourcePath, user.id, stats)

  console.log('\n=========================')
  console.log('Migration Complete!')
  console.log(`Processed: ${stats.processed}`)
  console.log(`Success: ${stats.success}`)
  console.log(`Failed: ${stats.failed}`)
  console.log('=========================\n')
}

main().catch(console.error)
