import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../__tests__/utils/testUtils'
import { DocumentLibrary } from '../DocumentLibrary'
import * as documents from '../../lib/documents'
import { mockDocumentCategories, mockDocuments } from '../../__tests__/utils/mockData'

vi.mock('../../lib/documents', () => ({
  getDocumentCategories: vi.fn(),
  getDocuments: vi.fn()
}))

describe('DocumentLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(documents.getDocumentCategories).mockResolvedValue(mockDocumentCategories)
    vi.mocked(documents.getDocuments).mockResolvedValue(mockDocuments)
  })

  it('should render document library title', async () => {
    renderWithProviders(<DocumentLibrary />)

    expect(screen.getByText('Company Document Library')).toBeInTheDocument()
  })

  it('should fetch categories on mount', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(documents.getDocumentCategories).toHaveBeenCalled()
    })
  })

  it('should fetch documents on mount', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(documents.getDocuments).toHaveBeenCalled()
    })
  })

  it('should display search bar', () => {
    renderWithProviders(<DocumentLibrary />)

    const searchInput = screen.getByPlaceholderText('Search documents...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should display categories sidebar', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument()
      expect(screen.getByText('Show All')).toBeInTheDocument()
    })
  })

  it('should display all category options', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('All Documents')).toBeInTheDocument()
      expect(screen.getByText('Forms')).toBeInTheDocument()
      expect(screen.getByText('Certificates')).toBeInTheDocument()
      expect(screen.getByText('Checklists')).toBeInTheDocument()
    })
  })

  it('should filter documents by category', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('Forms')).toBeInTheDocument()
    })

    const formsButton = screen.getByText('Forms')
    await userEvent.click(formsButton)

    await waitFor(() => {
      expect(documents.getDocuments).toHaveBeenCalledWith({
        categoryId: 1,
        search: undefined
      })
    })
  })

  it('should search documents by text', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentLibrary />)

    const searchInput = screen.getByPlaceholderText('Search documents...')
    await userEvent.type(searchInput, 'pressure test')

    await waitFor(() => {
      expect(documents.getDocuments).toHaveBeenCalledWith({
        categoryId: undefined,
        search: 'pressure test'
      })
    })
  })

  it('should display document cards', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('Site File Request')).toBeInTheDocument()
      expect(screen.getByText('Pressure Test Certificate')).toBeInTheDocument()
    })
  })

  it('should show document codes', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('CFM-OPS-FRM-001')).toBeInTheDocument()
      expect(screen.getByText('CFM-OPS-CER-002')).toBeInTheDocument()
    })
  })

  it('should display document versions', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('Rev 14')).toBeInTheDocument()
      expect(screen.getByText('Rev 8')).toBeInTheDocument()
    })
  })

  it('should handle document click', async () => {
    const onSelectDocument = vi.fn()
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentLibrary onSelectDocument={onSelectDocument} />)

    await waitFor(() => {
      expect(screen.getByText('Site File Request')).toBeInTheDocument()
    })

    const docCard = screen.getByText('Site File Request')
    await userEvent.click(docCard.closest('div')!)

    expect(onSelectDocument).toHaveBeenCalledWith(mockDocuments[0])
  })

  it('should show loading state', () => {
    vi.mocked(documents.getDocuments).mockImplementation(() => new Promise(() => {}))
    
    renderWithProviders(<DocumentLibrary />)

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
  })

  it('should display empty state when no documents', async () => {
    vi.mocked(documents.getDocuments).mockResolvedValue([])

    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText(/No documents/)).toBeInTheDocument()
    })
  })

  it('should highlight active category', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('Forms')).toBeInTheDocument()
    })

    const formsButton = screen.getByText('Forms')
    await userEvent.click(formsButton)

    await waitFor(() => {
      expect(formsButton.closest('button')).toHaveClass('bg-blue-500/10')
    })
  })

  it('should display document tags', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('form')).toBeInTheDocument()
      expect(screen.getByText('site')).toBeInTheDocument()
    })
  })

  it('should limit displayed tags to 3', async () => {
    const docWithManyTags = {
      ...mockDocuments[0],
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    }

    vi.mocked(documents.getDocuments).mockResolvedValue([docWithManyTags])

    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      const tags = screen.getAllByText(/tag\d/)
      expect(tags.length).toBeLessThanOrEqual(3)
    })
  })

  it('should display document descriptions', async () => {
    renderWithProviders(<DocumentLibrary />)

    await waitFor(() => {
      expect(screen.getByText('Request form for site file access')).toBeInTheDocument()
      expect(screen.getByText('Certificate for pressure testing')).toBeInTheDocument()
    })
  })
})
