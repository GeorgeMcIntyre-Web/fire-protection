import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getDailyWorkItems, getQuickActions, generateClientUpdate } from '../pm-workflow'
import { supabase } from '../supabase'
import type { ClientUpdate } from '../pm-workflow'

describe('getDailyWorkItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should classify urgent items correctly based on due date', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const mockProjects = [
      {
        id: 'project-1',
        name: 'Urgent Project',
        status: 'in_progress',
        due_date: today.toISOString(),
        client: { name: 'Test Client' },
        tasks: [],
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: mockProjects,
          error: null,
        }),
      }),
    } as any)

    const result = await getDailyWorkItems('user-1')

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('urgent')
    expect(result[0].priority).toBe('high')
  })

  it('should classify today items for active projects', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Active Project',
        status: 'in_progress',
        due_date: null,
        client: { name: 'Test Client' },
        tasks: [],
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: mockProjects,
          error: null,
        }),
      }),
    } as any)

    const result = await getDailyWorkItems('user-1')

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('today')
    expect(result[0].priority).toBe('medium')
  })

  it('should include high priority tasks as urgent', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Project with Tasks',
        status: 'in_progress',
        due_date: null,
        client: { name: 'Test Client' },
        tasks: [
          {
            id: 'task-1',
            name: 'High Priority Task',
            priority: 'high',
            status: 'pending',
            description: 'Important task',
          },
        ],
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: mockProjects,
          error: null,
        }),
      }),
    } as any)

    const result = await getDailyWorkItems('user-1')

    const urgentTask = result.find(item => item.id === 'task-1')
    expect(urgentTask).toBeDefined()
    expect(urgentTask?.type).toBe('urgent')
    expect(urgentTask?.priority).toBe('high')
  })

  it('should sort items by urgency (urgent first, then today)', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const mockProjects = [
      {
        id: 'project-1',
        name: 'Normal Project',
        status: 'in_progress',
        due_date: null,
        client: { name: 'Client 1' },
        tasks: [],
      },
      {
        id: 'project-2',
        name: 'Urgent Project',
        status: 'in_progress',
        due_date: today.toISOString(),
        client: { name: 'Client 2' },
        tasks: [],
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: mockProjects,
          error: null,
        }),
      }),
    } as any)

    const result = await getDailyWorkItems('user-1')

    // First item should be urgent
    expect(result[0].type).toBe('urgent')
    // Subsequent items should be today
    if (result.length > 1) {
      expect(['today', 'urgent']).toContain(result[1].type)
    }
  })

  it('should exclude completed tasks from urgent list', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Project',
        status: 'in_progress',
        due_date: null,
        client: { name: 'Test Client' },
        tasks: [
          {
            id: 'task-1',
            name: 'Completed Task',
            priority: 'high',
            status: 'completed',
          },
          {
            id: 'task-2',
            name: 'Active Task',
            priority: 'high',
            status: 'pending',
          },
        ],
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: mockProjects,
          error: null,
        }),
      }),
    } as any)

    const result = await getDailyWorkItems('user-1')

    const completedTask = result.find(item => item.id === 'task-1')
    const activeTask = result.find(item => item.id === 'task-2')

    expect(completedTask).toBeUndefined()
    expect(activeTask).toBeDefined()
  })

  it('should handle database errors', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    } as any)

    await expect(getDailyWorkItems('user-1')).rejects.toThrow()
  })
})

describe('generateClientUpdate', () => {
  it('should generate proper update message with progress', () => {
    const update: ClientUpdate = {
      project_id: 'project-1',
      project_name: 'Fire Sprinkler Installation',
      client_name: 'Test Client',
      status: 'in_progress',
      last_update: '2024-01-01',
      days_since_update: 5,
      progress_percentage: 75,
      next_action: 'Complete pressure testing',
    }

    const message = generateClientUpdate(update)

    expect(message).toContain('Fire Sprinkler Installation')
    expect(message).toContain('75%')
    expect(message).toContain('Complete pressure testing')
    expect(message).toContain('5 days ago')
  })

  it('should handle single day since update', () => {
    const update: ClientUpdate = {
      project_id: 'project-1',
      project_name: 'Test Project',
      client_name: 'Test Client',
      status: 'in_progress',
      last_update: '2024-01-01',
      days_since_update: 1,
      progress_percentage: 50,
    }

    const message = generateClientUpdate(update)

    expect(message).toContain('Updated yesterday')
  })
})

describe('getQuickActions', () => {
  it('should suggest urgent action when urgent items exist', () => {
    const workItems = [
      {
        id: '1',
        type: 'urgent' as const,
        title: 'Urgent Task',
        project_name: 'Project',
        client_name: 'Client',
        status: 'pending',
        priority: 'high' as const,
      },
    ]
    const clientUpdates: ClientUpdate[] = []

    const actions = getQuickActions(workItems, clientUpdates)

    const urgentAction = actions.find(a => a.urgency === 'high' && a.title.includes('urgent'))
    expect(urgentAction).toBeDefined()
    expect(urgentAction?.title).toContain('1 urgent item')
  })

  it('should suggest client updates when needed', () => {
    const workItems = []
    const clientUpdates: ClientUpdate[] = [
      {
        project_id: 'project-1',
        project_name: 'Test Project',
        client_name: 'Test Client',
        status: 'in_progress',
        last_update: '2024-01-01',
        days_since_update: 5,
        progress_percentage: 50,
      },
    ]

    const actions = getQuickActions(workItems, clientUpdates)

    const updateAction = actions.find(a => a.title.includes('client'))
    expect(updateAction).toBeDefined()
    expect(updateAction?.urgency).toBe('high')
  })

  it('should show active projects action', () => {
    const workItems = [
      {
        id: '1',
        type: 'today' as const,
        title: 'Active Project',
        project_name: 'Project',
        client_name: 'Client',
        status: 'in_progress',
        priority: 'medium' as const,
      },
    ]
    const clientUpdates: ClientUpdate[] = []

    const actions = getQuickActions(workItems, clientUpdates)

    const activeAction = actions.find(a => a.title.includes('active'))
    expect(activeAction).toBeDefined()
    expect(activeAction?.urgency).toBe('medium')
  })

  it('should pluralize correctly', () => {
    const workItems = [
      {
        id: '1',
        type: 'urgent' as const,
        title: 'Task 1',
        project_name: 'Project',
        client_name: 'Client',
        status: 'pending',
        priority: 'high' as const,
      },
      {
        id: '2',
        type: 'urgent' as const,
        title: 'Task 2',
        project_name: 'Project',
        client_name: 'Client',
        status: 'pending',
        priority: 'high' as const,
      },
    ]
    const clientUpdates: ClientUpdate[] = []

    const actions = getQuickActions(workItems, clientUpdates)

    const urgentAction = actions.find(a => a.urgency === 'high')
    expect(urgentAction?.title).toContain('2 urgent items')
  })
})
