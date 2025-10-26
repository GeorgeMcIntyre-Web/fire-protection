import { supabase } from './supabase'

// Document category interface
export interface DocumentCategory {
  id: number
  name: string
  code: string
  display_order: number
  description: string | null
}

// Document library interface
export interface Document {
  id: string
  name: string
  document_code: string | null
  category_id: number | null
  category?: DocumentCategory
  description: string | null
  file_url: string
  file_type: string | null
  version: string | null
  tags: string[] | null
  created_by: string
  created_at: string
  updated_at: string
}

// Project document interface
export interface ProjectDocument {
  id: string
  project_id: string
  document_id: string
  status: 'active' | 'archived'
  notes: string | null
  uploaded_at: string
  uploaded_by: string | null
  document?: Document
}

/**
 * Fetch all document categories
 */
export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  const { data, error } = await supabase
    .from('document_categories')
    .select('*')
    .order('display_order')

  if (error) throw error
  return data || []
}

/**
 * Fetch all documents
 */
export async function getDocuments(filters?: {
  categoryId?: number
  search?: string
  tag?: string
}): Promise<Document[]> {
  let query = supabase.from('document_library').select('*, category:document_categories(*)')

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,document_code.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Fetch a single document by ID
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('document_library')
    .select('*, category:document_categories(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Upload a document to Supabase Storage
 */
export async function uploadDocumentToStorage(
  file: File,
  bucket: string = 'company-documents',
  folder: string = ''
): Promise<string> {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Create a document record in the database
 */
export async function createDocumentRecord(
  document: {
    name: string
    document_code?: string
    category_id: number | null
    description?: string
    file_url: string
    file_type: string
    version?: string
    tags?: string[]
  },
  userId: string
): Promise<Document> {
  const { data, error } = await supabase
    .from('document_library')
    .insert({
      ...document,
      created_by: userId
    })
    .select('*, category:document_categories(*)')
    .single()

  if (error) throw error
  return data
}

/**
 * Upload and create document in one step
 */
export async function uploadAndCreateDocument(
  file: File,
  documentInfo: {
    name?: string
    document_code?: string
    category_id: number | null
    description?: string
    version?: string
    tags?: string[]
  },
  userId: string,
  bucket: string = 'company-documents'
): Promise<Document> {
  // Upload file to storage
  const fileUrl = await uploadDocumentToStorage(file, bucket)

  // Create database record
  const document = await createDocumentRecord(
    {
      name: documentInfo.name || file.name,
      document_code: documentInfo.document_code,
      category_id: documentInfo.category_id,
      description: documentInfo.description,
      file_url: fileUrl,
      file_type: file.type,
      version: documentInfo.version,
      tags: documentInfo.tags
    },
    userId
  )

  return document
}

/**
 * Fetch documents linked to a project
 */
export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  const { data, error } = await supabase
    .from('project_documents')
    .select(`
      *,
      document:document_library(
        *,
        category:document_categories(*)
      )
    `)
    .eq('project_id', projectId)
    .eq('status', 'active')
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Link a document to a project
 */
export async function linkDocumentToProject(
  projectId: string,
  documentId: string,
  userId: string,
  notes?: string
): Promise<ProjectDocument> {
  const { data, error } = await supabase
    .from('project_documents')
    .insert({
      project_id: projectId,
      document_id: documentId,
      uploaded_by: userId,
      notes: notes || null
    })
    .select()
    .single()

  if (error) {
    // If already linked, update it
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('project_documents')
        .update({ status: 'active', notes: notes || null })
        .eq('project_id', projectId)
        .eq('document_id', documentId)
        .select()
        .single()

      if (existing) return existing
    }
    throw error
  }

  return data
}

/**
 * Unlink a document from a project
 */
export async function unlinkDocumentFromProject(
  projectId: string,
  documentId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_documents')
    .update({ status: 'archived' })
    .eq('project_id', projectId)
    .eq('document_id', documentId)

  if (error) throw error
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('document_library')
    .delete()
    .eq('id', documentId)

  if (error) throw error
}

/**
 * Update document information
 */
export async function updateDocument(
  documentId: string,
  updates: Partial<Pick<Document, 'name' | 'description' | 'document_code' | 'version' | 'tags' | 'category_id'>>
): Promise<Document> {
  const { data, error } = await supabase
    .from('document_library')
    .update(updates)
    .eq('id', documentId)
    .select('*, category:document_categories(*)')
    .single()

  if (error) throw error
  return data
}

/**
 * Parse document code from filename
 * Extracts codes like "CFM-OPS-FRM-004 - Rev 14" 
 */
export function parseDocumentCode(filename: string): {
  code: string | null
  version: string | null
  name: string
} {
  // Try to extract CFM code pattern
  const codeMatch = filename.match(/(CFM-[A-Z]+-[A-Z]+-\d+)/)
  const versionMatch = filename.match(/Rev\s*(\d+)/i)
  
  return {
    code: codeMatch ? codeMatch[1] : null,
    version: versionMatch ? versionMatch[1] : null,
    name: filename.replace(/^.*?-\s*/, '').replace(/\s*Rev.*$/, '').trim()
  }
}

/**
 * Determine category from document code
 */
export function getCategoryFromCode(code: string): number | null {
  const categoryMap: Record<string, number> = {
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

  // Extract category code from CFM-PREFIX-CATEGORY format
  const parts = code.split('-')
  const categoryCode = parts[parts.length - 2]
  return categoryMap[categoryCode] || null
}

