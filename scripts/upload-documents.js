/**
 * Document Upload Script for Fire Protection App
 * 
 * Uploads all documents from QuintensDocs to Supabase Storage
 * 
 * Usage: 
 *   1. Make sure your .env file has SUPABASE_URL and SUPABASE_ANON_KEY
 *   2. Run: npm run upload-docs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const QUINTENS_DOCS_PATH = path.join(__dirname, '../../FirePm/QuintensDocs')
const DOCUMENTS_TO_UPLOAD = []

// Load environment variables from .env file
function loadEnvVars() {
  const envPath = path.join(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const envVars = {}
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    })
    return envVars
  }
  return process.env
}

const env = loadEnvVars()
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
  console.error('Or export them as environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Connected to Supabase')
console.log(`📍 Scanning: ${QUINTENS_DOCS_PATH}\n`)

// Supported file types
const SUPPORTED_EXTS = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt']

/**
 * Parse document information from filename
 */
function parseDocumentInfo(filename) {
  // Extract CFM code (e.g., CFM-OPS-FRM-004)
  const codeMatch = filename.match(/(CFM-[A-Z]+-[A-Z]+-\d+)/i)
  
  // Extract version (e.g., Rev 14)
  const versionMatch = filename.match(/Rev\s*(\d+|A|B|C)/i)
  
  // Category code mapping from filename
  const categoryMap = {
    'APP': 1, // Appointments
    'CER': 2, // Certificates
    'CKL': 3, // Checklists
    'FRM': 4, // Forms
    'IND': 5, // Index
    'POL': 6, // Policies
    'PRO': 7, // Processes
    'REP': 8, // Reports
    'WKI': 9  // Work Instructions
  }

  let categoryId = null
  if (codeMatch) {
    const parts = codeMatch[1].split('-')
    const categoryCode = parts.length > 2 ? parts[2] : null
    categoryId = categoryMap[categoryCode] || null
  }

  // Clean up name (remove code and version)
  let cleanName = filename
    .replace(/CFM-[A-Z]+-[A-Z]+-\d+\s*-\s*/i, '')
    .replace(/\s*-\s*Rev.*$/i, '')
    .replace(/\s*Rev.*$/i, '')
    .trim()

  if (!cleanName || cleanName === filename) {
    cleanName = path.basename(filename, path.extname(filename))
  }

  return {
    code: codeMatch ? codeMatch[1] : null,
    version: versionMatch ? versionMatch[1] : null,
    name: cleanName,
    categoryId
  }
}

/**
 * Get all files recursively
 */
function getAllFiles(dirPath, allFiles = []) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`)
    return allFiles
  }

  try {
    const items = fs.readdirSync(dirPath)

    items.forEach(item => {
      const itemPath = path.join(dirPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        getAllFiles(itemPath, allFiles)
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase()
        if (SUPPORTED_EXTS.includes(ext)) {
          allFiles.push(itemPath)
        }
      }
    })
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message)
  }

  return allFiles
}

/**
 * Upload single document
 */
async function uploadDocument(filePath) {
  const fileName = path.basename(filePath)
  const ext = path.extname(fileName)
  
  try {
    console.log(`📄 Uploading: ${fileName}`)

    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    
    // Parse document info
    const info = parseDocumentInfo(fileName)
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company-documents')
      .upload(fileName, fileBuffer, {
        contentType: `application/octet-stream`,
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ Upload failed: ${fileName} - ${uploadError.message}`)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('company-documents')
      .getPublicUrl(uploadData.path)

    // Create database record
    const documentRecord = {
      name: info.name,
      document_code: info.code,
      category_id: info.categoryId,
      file_url: publicUrl,
      file_type: ext.substring(1),
      version: info.version
    }

    const { data: dbData, error: dbError } = await supabase
      .from('document_library')
      .insert(documentRecord)
      .select()
      .single()

    if (dbError) {
      console.error(`❌ Database error for ${fileName}: ${dbError.message}`)
      return null
    }

    console.log(`✅ Success: ${fileName}${info.code ? ' (' + info.code + ')' : ''}`)
    return dbData
  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message)
    return null
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting document upload...\n')

  // Find all files
  console.log('📂 Scanning for documents...')
  const allFiles = getAllFiles(QUINTENS_DOCS_PATH)
  
  console.log(`📊 Found ${allFiles.length} documents\n`)

  if (allFiles.length === 0) {
    console.log('⚠️  No documents found to upload')
    console.log(`   Searched in: ${QUINTENS_DOCS_PATH}`)
    return
  }

  // Upload each file
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i]
    const result = await uploadDocument(file)
    
    if (result) {
      successCount++
    } else {
      errorCount++
    }

    // Progress
    if ((i + 1) % 5 === 0 || i === allFiles.length - 1) {
      const progress = ((i + 1) / allFiles.length * 100).toFixed(1)
      console.log(`\n📊 Progress: ${progress}% (${i + 1}/${allFiles.length})\n`)
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Upload Complete!')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log('='.repeat(50))
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
