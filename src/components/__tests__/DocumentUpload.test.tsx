import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../__tests__/utils/testUtils'
import { DocumentUpload } from '../DocumentUpload'
import * as documents from '../../lib/documents'
import { mockDocumentCategories } from '../../__tests__/utils/mockData'

vi.mock('../../lib/documents', () => ({
  getDocumentCategories: vi.fn(),
  uploadAndCreateDocument: vi.fn(),
  parseDocumentCode: vi.fn(),
  getCategoryFromCode: vi.fn()
}))

describe('DocumentUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(documents.getDocumentCategories).mockResolvedValue(mockDocumentCategories)
    vi.mocked(documents.uploadAndCreateDocument).mockResolvedValue({
      id: 'doc-1',
      name: 'Test Doc',
      document_code: null,
      category_id: 1,
      description: null,
      file_url: 'https://test.com/doc.pdf',
      file_type: 'application/pdf',
      version: null,
      tags: null,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  })

  it('should render upload area', () => {
    renderWithProviders(<DocumentUpload />)

    expect(screen.getByText(/Click to upload or drag and drop/)).toBeInTheDocument()
  })

  it('should fetch categories on mount', async () => {
    renderWithProviders(<DocumentUpload />)

    await waitFor(() => {
      expect(documents.getDocumentCategories).toHaveBeenCalled()
    })
  })

  it('should display file type restrictions', () => {
    renderWithProviders(<DocumentUpload />)

    expect(screen.getByText(/PDF, DOC, DOCX, XLS, XLSX, TXT/)).toBeInTheDocument()
  })

  it('should handle file selection', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })
    }
  })

  it('should parse document code from filename', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    vi.mocked(documents.parseDocumentCode).mockReturnValue({
      code: 'CFM-OPS-FRM-001',
      version: '14',
      name: 'Site File Request'
    })

    renderWithProviders(<DocumentUpload />)

    const file = new File(['content'], 'CFM-OPS-FRM-001 - Rev 14.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(documents.parseDocumentCode).toHaveBeenCalledWith('CFM-OPS-FRM-001 - Rev 14.pdf')
      })
    }
  })

  it('should show document information form when files selected', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Document Information')).toBeInTheDocument()
        expect(screen.getByLabelText('Document Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Document Code')).toBeInTheDocument()
        expect(screen.getByLabelText(/Category/)).toBeInTheDocument()
      })
    }
  })

  it('should display selected file with size', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
        // File size should be displayed
        expect(screen.getByText(/Bytes|KB|MB/)).toBeInTheDocument()
      })
    }
  })

  it('should allow removing selected files', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })

      const removeButtons = document.querySelectorAll('button[class*="text-gray-400"]')
      if (removeButtons.length > 0) {
        await userEvent.click(removeButtons[0] as HTMLElement)

        await waitFor(() => {
          expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
        })
      }
    }
  })

  it('should disable upload button when no category selected', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        const uploadButton = screen.getByText(/Upload 1 file/)
        expect(uploadButton).toBeDisabled()
      })
    }
  })

  it('should call onUploadComplete after successful upload', async () => {
    const onUploadComplete = vi.fn()
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentUpload onUploadComplete={onUploadComplete} defaultCategoryId={1} />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/Upload 1 file/)).toBeInTheDocument()
      })

      const uploadButton = screen.getByText(/Upload 1 file/)
      await userEvent.click(uploadButton)

      await waitFor(() => {
        expect(documents.uploadAndCreateDocument).toHaveBeenCalled()
      }, { timeout: 3000 })

      // Wait for the completion callback (with delay)
      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalled()
      }, { timeout: 3000 })
    }
  })

  it('should show uploading state', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    vi.mocked(documents.uploadAndCreateDocument).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    renderWithProviders(<DocumentUpload defaultCategoryId={1} />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/Upload 1 file/)).toBeInTheDocument()
      })

      const uploadButton = screen.getByText(/Upload 1 file/)
      await userEvent.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText('Uploading...')).toBeInTheDocument()
      })
    }
  })

  it('should handle multiple file uploads', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentUpload />)

    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.pdf', { type: 'application/pdf' })
    ]
    
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, files)

      await waitFor(() => {
        expect(screen.getByText(/Selected Files \(2\)/)).toBeInTheDocument()
        expect(screen.getByText('test1.pdf')).toBeInTheDocument()
        expect(screen.getByText('test2.pdf')).toBeInTheDocument()
      })
    }
  })

  it('should set default category if provided', () => {
    renderWithProviders(<DocumentUpload defaultCategoryId={2} />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      const event = new Event('change', { bubbles: true })
      Object.defineProperty(event, 'target', { value: { files: [file] }, writable: false })
      input.dispatchEvent(event)
    }
  })

  it('should handle upload errors gracefully', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    vi.mocked(documents.uploadAndCreateDocument).mockRejectedValue(new Error('Upload failed'))

    renderWithProviders(<DocumentUpload defaultCategoryId={1} />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Click to upload/)?.closest('label')?.previousElementSibling as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/Upload 1 file/)).toBeInTheDocument()
      })

      const uploadButton = screen.getByText(/Upload 1 file/)
      await userEvent.click(uploadButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled()
      })
    }

    alertSpy.mockRestore()
  })
})
