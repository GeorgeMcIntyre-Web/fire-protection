import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PMDashboard } from '../PMDashboard'
import * as pmWorkflow from '../../lib/pm-workflow'

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}))

// Mock pm-workflow functions
vi.mock('../../lib/pm-workflow', () => ({
  getDailyWorkItems: vi.fn(),
  getProjectsNeedingClientUpdates: vi.fn(),
  getDocumentationStatus: vi.fn(),
  generateClientUpdate: vi.fn(),
  getQuickActions: vi.fn(),
}))

describe('PMDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(pmWorkflow.getDailyWorkItems).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockImplementation(
      () => new Promise(() => {})
    )
    vi.mocked(pmWorkflow.getDocumentationStatus).mockImplementation(
      () => new Promise(() => {})
    )

    render(<PMDashboard />)

    // Check for skeleton loader (animated pulse elements)
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('should render urgent tasks with red badges', async () => {
    const mockUrgentItem = {
      id: 'urgent-1',
      type: 'urgent' as const,
      title: 'Critical Deadline',
      project_name: 'Fire Sprinkler Project',
      client_name: 'Test Client',
      status: 'in_progress',
      priority: 'high' as const,
      due_date: new Date().toISOString(),
    }

    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue([mockUrgentItem])
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue([])
    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue([])
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue([])

    render(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Critical Deadline')).toBeInTheDocument()
    }, { timeout: 5000 })

    // Check for red badge styling (high priority)
    const priorityBadge = screen.getByText('high')
    expect(priorityBadge).toBeInTheDocument()
    expect(priorityBadge.className).toContain('red')
  })

  it('should display all urgent items', async () => {
    const mockItems = [
      {
        id: 'urgent-1',
        type: 'urgent' as const,
        title: 'Urgent Task 1',
        project_name: 'Project 1',
        client_name: 'Client 1',
        status: 'pending',
        priority: 'high' as const,
      },
      {
        id: 'urgent-2',
        type: 'urgent' as const,
        title: 'Urgent Task 2',
        project_name: 'Project 2',
        client_name: 'Client 2',
        status: 'pending',
        priority: 'high' as const,
      },
    ]

    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue(mockItems)
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue([])
    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue([])
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue([])

    render(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Urgent Task 1')).toBeInTheDocument()
      expect(screen.getByText('Urgent Task 2')).toBeInTheDocument()
    })
  })

  it('should display client updates section', async () => {
    const mockUpdate = {
      project_id: 'project-1',
      project_name: 'Sprinkler Installation',
      client_name: 'ABC Corp',
      status: 'in_progress',
      last_update: '2024-01-01',
      days_since_update: 5,
      progress_percentage: 60,
      next_action: 'Complete testing',
    }

    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue([])
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue([mockUpdate])
    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue([])
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue([])
    vi.mocked(pmWorkflow.generateClientUpdate).mockReturnValue('Test update message')

    render(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Sprinkler Installation')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    expect(screen.getByText('ABC Corp')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('should show empty state when no work items', async () => {
    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue([])
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue([])
    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue([])
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue([])

    render(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/All caught up/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should display quick actions when available', async () => {
    const mockActions = [
      {
        title: '3 urgent items need attention',
        action: 'Review urgent tasks',
        urgency: 'high' as const,
      },
    ]

    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue([])
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue([])
    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue([])
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue(mockActions)

    render(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('3 urgent items need attention')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should display documentation status for required docs', async () => {
    const mockDocs = [
      {
        document_type: 'form',
        document_name: 'Work Appointment Schedule',
        project_id: 'project-1',
        project_name: 'Test Project',
        status: 'required' as const,
      },
      {
        document_type: 'certificate',
        document_name: 'Pressure Test Certificate',
        project_id: 'project-1',
        project_name: 'Test Project',
        status: 'overdue' as const,
      },
    ]

    vi.mocked(pmWorkflow.getDailyWorkItems).mockResolvedValue([])
    vi.mocked(pmWorkflow.getProjectsNeedingClientUpdates).mockResolvedValue([])
    vi.mocked(pmWorkflow.getDocumentationStatus).mockResolvedValue(mockDocs)
    vi.mocked(pmWorkflow.getQuickActions).mockReturnValue([])

    render(<PMDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Work Appointment Schedule')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    expect(screen.getByText('Pressure Test Certificate')).toBeInTheDocument()
  })
})
