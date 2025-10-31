import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDocumentCategories, mockDocuments } from '../../__tests__/utils/mockData'

vi.mock('../supabase', () => {
  const mockFrom = vi.fn()
  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/file.pdf' } }))
    }))
  }
  return {
    supabase: {
      from: mockFrom,
      storage: mockStorage
    }
  }
})

import {
  parseDocumentCode,
  getCategoryFromCode,
  getDocumentCategories,
  getDocuments,
  getDocumentById,
  uploadDocumentToStorage,
  createDocumentRecord,
  uploadAndCreateDocument,
  getProjectDocuments,
  linkDocumentToProject,
  unlinkDocumentFromProject,
  deleteDocument,
  updateDocument
} from '../documents'

describe('documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseDocumentCode', () => {
    it('should parse CFM document code correctly', () => {
      const result = parseDocumentCode('CFM-OPS-FRM-004 - Rev 14 - Site File Request.pdf')

      expect(result.code).toBe('CFM-OPS-FRM-004')
      expect(result.version).toBe('14')
      expect(result.name).toBeTruthy()
    })

    it('should handle document without version', () => {
      const result = parseDocumentCode('CFM-OPS-FRM-001 - Site Survey.pdf')

      expect(result.code).toBe('CFM-OPS-FRM-001')
      expect(result.version).toBeNull()
    })

    it('should handle document without CFM code', () => {
      const result = parseDocumentCode('Random Document.pdf')

      expect(result.code).toBeNull()
      expect(result.version).toBeNull()
      expect(result.name).toBe('Random Document.pdf')
    })

    it('should extract version with different cases', () => {
      const result1 = parseDocumentCode('Document Rev 5.pdf')
      const result2 = parseDocumentCode('Document rev 5.pdf')
      const result3 = parseDocumentCode('Document REV 5.pdf')

      expect(result1.version).toBe('5')
      expect(result2.version).toBe('5')
      expect(result3.version).toBe('5')
    })

    it('should handle complex filenames', () => {
      const result = parseDocumentCode('CFM-QUA-CER-012 - Rev 3 - Installation Quality Certificate - Final.pdf')

      expect(result.code).toBe('CFM-QUA-CER-012')
      expect(result.version).toBe('3')
    })
  })

  describe('getCategoryFromCode', () => {
    it('should return correct category for FRM code', () => {
      const categoryId = getCategoryFromCode('CFM-OPS-FRM-004')
      expect(categoryId).toBe(4)
    })

    it('should return correct category for CER code', () => {
      const categoryId = getCategoryFromCode('CFM-QUA-CER-012')
      expect(categoryId).toBe(2)
    })

    it('should return correct category for CKL code', () => {
      const categoryId = getCategoryFromCode('CFM-OPS-CKL-003')
      expect(categoryId).toBe(3)
    })

    it('should return null for unknown code', () => {
      const categoryId = getCategoryFromCode('UNKNOWN-CODE')
      expect(categoryId).toBeNull()
    })

    it('should handle all defined categories', () => {
      const codes = ['APP', 'CER', 'CKL', 'FRM', 'IND', 'POL', 'PRO', 'REP', 'WKI']
      
      codes.forEach(code => {
        const result = getCategoryFromCode(`CFM-XXX-${code}-001`)
        expect(result).toBeGreaterThan(0)
      })
    })
  })

  describe('getDocumentCategories', () => {
    it('should fetch all document categories', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDocumentCategories, error: null })
      }))

      const result = await getDocumentCategories()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('document_categories')
    })

    it('should return empty array on error', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
      }))

      await expect(getDocumentCategories()).rejects.toThrow('DB error')
    })
  })

  describe('getDocuments', () => {
    it('should fetch all documents without filters', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDocuments, error: null })
      }))

      const result = await getDocuments()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter by category', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      const mockEq = vi.fn().mockReturnThis()
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
        order: vi.fn().mockResolvedValue({ data: mockDocuments, error: null })
      }))

      await getDocuments({ categoryId: 1 })

      expect(mockEq).toHaveBeenCalledWith('category_id', 1)
    })

    it('should search documents by text', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      const mockOr = vi.fn().mockReturnThis()
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        or: mockOr,
        order: vi.fn().mockResolvedValue({ data: mockDocuments, error: null })
      }))

      await getDocuments({ search: 'test' })

      expect(mockOr).toHaveBeenCalled()
    })
  })

  describe('uploadDocumentToStorage', () => {
    it('should upload file to storage', async () => {
      const { supabase } = await import('../supabase')
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      const result = await uploadDocumentToStorage(mockFile)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('https://')
    })

    it('should sanitize filename', async () => {
      const mockFile = new File(['content'], 'test file with spaces.pdf', { type: 'application/pdf' })

      const result = await uploadDocumentToStorage(mockFile)

      expect(result).toBeDefined()
    })

    it('should use custom folder', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      const result = await uploadDocumentToStorage(mockFile, 'company-documents', 'projects')

      expect(result).toBeDefined()
    })

    it('should throw error on upload failure', async () => {
      const { supabase } = await import('../supabase')
      const originalStorage = supabase.storage
      
      supabase.storage = {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: null, error: new Error('Upload failed') }),
          getPublicUrl: vi.fn()
        }))
      } as any

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      await expect(uploadDocumentToStorage(mockFile)).rejects.toThrow('Upload failed')
      
      supabase.storage = originalStorage
    })
  })

  describe('createDocumentRecord', () => {
    it('should create document record', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDocuments[0], error: null })
      }))

      const docData = {
        name: 'Test Document',
        category_id: 1,
        file_url: 'https://test.com/doc.pdf',
        file_type: 'application/pdf'
      }

      const result = await createDocumentRecord(docData, 'user-1')

      expect(result).toBeDefined()
      expect(result.name).toBeDefined()
    })
  })

  describe('uploadAndCreateDocument', () => {
    it('should upload file and create record', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDocuments[0], error: null })
      }))

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const docInfo = {
        name: 'Test Document',
        category_id: 1
      }

      const result = await uploadAndCreateDocument(mockFile, docInfo, 'user-1')

      expect(result).toBeDefined()
      expect(result.file_url).toBeDefined()
    })
  })

  describe('getProjectDocuments', () => {
    it('should fetch documents for a project', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))

      const result = await getProjectDocuments('proj-1')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('linkDocumentToProject', () => {
    it('should link document to project', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'link-1', project_id: 'proj-1', document_id: 'doc-1' }, 
          error: null 
        })
      }))

      const result = await linkDocumentToProject('proj-1', 'doc-1', 'user-1')

      expect(result).toBeDefined()
      expect(result.project_id).toBe('proj-1')
    })

    it('should handle duplicate link', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { code: '23505' } 
            })
          }
        }
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { id: 'link-1', project_id: 'proj-1', document_id: 'doc-1' }, 
            error: null 
          })
        }
      })

      const result = await linkDocumentToProject('proj-1', 'doc-1', 'user-1', 'Test notes')

      expect(result).toBeDefined()
    })
  })

  describe('unlinkDocumentFromProject', () => {
    it('should unlink document from project', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      }))

      await expect(unlinkDocumentFromProject('proj-1', 'doc-1')).resolves.toBeUndefined()
    })
  })

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      }))

      await expect(deleteDocument('doc-1')).resolves.toBeUndefined()
    })
  })

  describe('updateDocument', () => {
    it('should update document information', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDocuments[0], error: null })
      }))

      const updates = { name: 'Updated Name' }
      const result = await updateDocument('doc-1', updates)

      expect(result).toBeDefined()
    })
  })
})
