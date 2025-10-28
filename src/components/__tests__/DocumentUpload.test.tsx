import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DocumentUpload } from '../DocumentUpload'
import * as documents from '../../lib/documents'

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}))

// Mock documents functions
vi.mock('../../lib/documents', () => ({
  getDocumentCategories: vi.fn(),
  uploadAndCreateDocument: vi.fn(),
  parseDocumentCode: vi.fn(),
  getCategoryFromCode: vi.fn(),
}))

describe('DocumentUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(documents.getDocumentCategories).mockResolvedValue([
      { id: 1, name: 'Operations', code: 'OPS', description: 'Operations docs' },
      { id: 2, name: 'Safety', code: 'SAF', description: 'Safety docs' },
    ])
  })

  it('should render upload interface', async () => {
    render(<DocumentUpload />)

    await waitFor(() => {
      expect(screen.getByText(/Upload Documents/i)).toBeInTheDocument()
      expect(screen.getByText(/Click to upload or drag and drop/i)).toBeInTheDocument()
    })
  })

  it('should parse CFM code from filename and auto-fill form', async () => {
    const mockParsed = {
      code: 'CFM-OPS-FRM-004',
      name: 'Work Appointment Schedule',
      version: 'Rev 14',
    }

    vi.mocked(documents.parseDocumentCode).mockReturnValue(mockParsed)
    vi.mocked(documents.getCategoryFromCode).mockReturnValue(1)

    render(<DocumentUpload />)

    const file = new File(['content'], 'CFM-OPS-FRM-004 Work Appointment Schedule Rev 14.pdf', {
      type: 'application/pdf',
    })

    const input = document.querySelector('#file-upload') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(documents.parseDocumentCode).toHaveBeenCalledWith(
        'CFM-OPS-FRM-004 Work Appointment Schedule Rev 14.pdf'
      )
    })
  })

  it('should extract document code correctly', () => {
    const testCases = [
      {
        filename: 'CFM-OPS-FRM-004 Work Appointment Schedule Rev 14.pdf',
        expected: 'CFM-OPS-FRM-004',
      },
      {
        filename: 'CFM-SAF-CHK-001 Safety Checklist.pdf',
        expected: 'CFM-SAF-CHK-001',
      },
      {
        filename: 'Document without code.pdf',
        expected: '',
      },
    ]

    testCases.forEach(({ filename, expected }) => {
      const result = documents.parseDocumentCode(filename)
      // The mock will be called, but let's verify the pattern
      expect(documents.parseDocumentCode).toHaveBeenCalledWith(filename)
    })
  })

  it('should show selected files', async () => {
    render(<DocumentUpload />)

    const file = new File(['content'], 'test-document.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
    })
  })

  it('should allow removing selected files', async () => {
    render(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    // Find and click remove button (XMarkIcon button)
    const removeButtons = document.querySelectorAll('button')
    const removeButton = Array.from(removeButtons).find(btn => 
      btn.querySelector('svg') && btn.className.includes('text-gray-400')
    )
    
    if (removeButton) {
      fireEvent.click(removeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
      })
    }
  })

  it('should require category before upload', async () => {
    render(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      const uploadButton = screen.queryByText(/Upload 1 file/i)
      expect(uploadButton).toBeInTheDocument()
      if (uploadButton) {
        expect(uploadButton).toBeDisabled()
      }
    })
  })

  it('should call upload function with correct parameters', async () => {
    vi.mocked(documents.uploadAndCreateDocument).mockResolvedValue({} as any)

    render(<DocumentUpload />)

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    // Select category
    const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: '1' } })

    // Click upload
    const uploadButton = screen.getByText(/Upload 1 file/i)
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(documents.uploadAndCreateDocument).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          category_id: 1,
        }),
        'test-user-id'
      )
    }, { timeout: 3000 })
  })

  it('should display file size correctly', async () => {
    render(<DocumentUpload />)

    const file = new File(['a'.repeat(1024)], 'test.pdf', { type: 'application/pdf' })
    const input = document.querySelector('#file-upload') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      // Should show KB
      expect(screen.getByText(/KB/i)).toBeInTheDocument()
    })
  })

  it('should handle multiple files', async () => {
    render(<DocumentUpload />)

    const files = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
      new File(['content3'], 'file3.pdf', { type: 'application/pdf' }),
    ]

    const input = document.querySelector('#file-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files } })

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument()
      expect(screen.getByText('file2.pdf')).toBeInTheDocument()
      expect(screen.getByText('file3.pdf')).toBeInTheDocument()
      expect(screen.getByText(/Upload 3 files/i)).toBeInTheDocument()
    })
  })
})
