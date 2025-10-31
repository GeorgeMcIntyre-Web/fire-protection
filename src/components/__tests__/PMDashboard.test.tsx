import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../__tests__/utils/testUtils'
import { PMDashboard } from '../PMDashboard'
import * as pmWorkflow from '../../lib/pm-workflow'
import { mockDailyWorkItems, mockClientUpdates, mockDocumentationStatus } from '../../__tests__/utils/mockData'

vi.mock('../../lib/pm-workflow', () => ({
  getDailyWorkItems: vi.fn(),
  getProjectsNeedingClientUpdates: vi.fn(),
  getDocumentationStatus: vi.fn(),
  generateClientUpdate: vi.fn(),
  getQuickActions: vi.fn()
}))

describe('PMDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue(mockDailyWorkItems)
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue(mockClientUpdates)
    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue(mockDocumentationStatus)
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue([])
    vi.mocked(pmWorkflow.generateClientUpdate).mockReturnValue('Test update message')
  })

  it('should render loading state initially', () => {
    renderWithProviders(<PMDashboard />)
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
  })

  it('should fetch PM data on mount', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(pmWorkflow.getDailyWorkItems).toHaveBeenCalled()
      expect(pmWorkflow.getProjectsNeedingClientUpdates).toHaveBeenCalled()
      expect(pmWorkflow.getDocumentationStatus).toHaveBeenCalled()
    })
  })

  it('should display daily work items', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Daily Work')).toBeInTheDocument()
    })
  })

  it('should display client updates section', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Client Updates')).toBeInTheDocument()
    })
  })

  it('should show quick actions when available', async () => {
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue([
      {
        title: '2 urgent items need attention',
        action: 'Review urgent tasks',
        urgency: 'high'
      }
    ])

    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('2 urgent items need attention')).toBeInTheDocument()
    })
  })

  it('should display urgent work items with correct styling', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      const urgentItem = screen.getByText('Project deadline in TODAY')
      expect(urgentItem).toBeInTheDocument()
    })
  })

  it('should show empty state when no work items', async () => {
    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue([])
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue([])

    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/All caught up/i)).toBeInTheDocument()
    })
  })

  it('should display documentation status when required', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Documentation Status')).toBeInTheDocument()
    })
  })

  it('should handle copy client update', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Shoprite Warehouse')).toBeInTheDocument()
    })

    const copyButton = screen.getAllByText('Copy Update Message')[0]
    await userEvent.click(copyButton)

    await waitFor(() => {
      expect(pmWorkflow.generateClientUpdate).toHaveBeenCalled()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test update message')
    })
  })

  it('should show copied confirmation', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Shoprite Warehouse')).toBeInTheDocument()
    })

    const copyButton = screen.getAllByText('Copy Update Message')[0]
    await userEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument()
    })
  })

  it('should display progress bars for client updates', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('65%')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument()
    })
  })

  it('should handle errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(pmWorkflow.getDailyWorkItems).mockRejectedValue(new Error('API Error'))

    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })

    consoleError.mockRestore()
  })

  it('should apply custom className', () => {
    const { container } = renderWithProviders(<PMDashboard className="custom-class" />)
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should display days since last update', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('5 days ago')).toBeInTheDocument()
      expect(screen.getByText('7 days ago')).toBeInTheDocument()
    })
  })

  it('should show next action for client updates', async () => {
    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Complete installation phase/i)).toBeInTheDocument()
      expect(screen.getByText(/ASIB inspection/i)).toBeInTheDocument()
    })
  })

  it('should limit documentation items displayed', async () => {
    const manyDocs = Array.from({ length: 10 }, (_, i) => ({
      document_type: 'form',
      document_name: `Document ${i}`,
      project_id: 'proj-1',
      project_name: 'Test Project',
      status: 'required' as const
    }))

    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue(manyDocs)

    renderWithProviders(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/\+ 5 more documents needed/i)).toBeInTheDocument()
    })
  })
})
