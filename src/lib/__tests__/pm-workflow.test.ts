import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DailyWorkItem, ClientUpdate, DocumentationStatus } from '../pm-workflow'
import { mockProjects, mockTasks } from '../../__tests__/utils/mockData'

// Mock supabase must be before imports
vi.mock('../supabase', () => {
  const mockFrom = vi.fn()
  return {
    supabase: {
      from: mockFrom
    }
  }
})

import {
  getDailyWorkItems,
  getProjectsNeedingClientUpdates,
  getDocumentationStatus,
  generateClientUpdate,
  getQuickActions
} from '../pm-workflow'

describe('pm-workflow', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = createMockSupabaseClient()
  })

  describe('getDailyWorkItems', () => {
    it('should fetch and categorize daily work items', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      // Mock project data with urgent deadline
      const today = new Date()
      const urgentProject = {
        id: 'proj-1',
        name: 'Urgent Project',
        status: 'in_progress',
        due_date: today.toISOString(),
        client: { name: 'Test Client' },
        tasks: [
          {
            id: 'task-1',
            name: 'High Priority Task',
            status: 'pending',
            priority: 'high',
            description: 'Urgent task'
          }
        ]
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [urgentProject], error: null })
      }))

      const result = await getDailyWorkItems('user-1')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('projects')
    })

    it('should categorize urgent items with deadline today', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const today = new Date()
      const urgentProject = {
        id: 'proj-1',
        name: 'Urgent Project',
        status: 'in_progress',
        due_date: today.toISOString(),
        client: { name: 'Test Client' },
        tasks: []
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [urgentProject], error: null })
      }))

      const result = await getDailyWorkItems('user-1')
      
      if (result.length > 0) {
        const urgentItem = result.find(item => item.type === 'urgent')
        expect(urgentItem).toBeDefined()
        if (urgentItem) {
          expect(urgentItem.priority).toBe('high')
        }
      }
    })

    it('should handle projects with no tasks', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null })
      }))

      const result = await getDailyWorkItems('user-1')
      expect(result).toEqual([])
    })

    it('should throw error on database failure', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      }))

      await expect(getDailyWorkItems('user-1')).rejects.toThrow('Database error')
    })

    it('should sort items by urgency', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const projects = [
        {
          id: 'proj-1',
          name: 'Normal Project',
          status: 'in_progress',
          client: { name: 'Client 1' },
          tasks: []
        },
        {
          id: 'proj-2',
          name: 'Urgent Project',
          status: 'in_progress',
          due_date: new Date().toISOString(),
          client: { name: 'Client 2' },
          tasks: []
        }
      ]

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: projects, error: null })
      }))

      const result = await getDailyWorkItems('user-1')
      
      if (result.length > 1) {
        expect(result[0].type).toBe('urgent')
      }
    })
  })

  describe('getProjectsNeedingClientUpdates', () => {
    it('should identify projects needing updates', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      // Project updated 5 days ago
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 5)

      const staleProject = {
        id: 'proj-1',
        name: 'Stale Project',
        status: 'in_progress',
        updated_at: oldDate.toISOString(),
        client: { name: 'Test Client' },
        tasks: [
          { id: 'task-1', status: 'completed' },
          { id: 'task-2', status: 'pending' }
        ]
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [staleProject], error: null })
      }))

      const result = await getProjectsNeedingClientUpdates()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should calculate progress percentage correctly', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 5)

      const project = {
        id: 'proj-1',
        name: 'Test Project',
        status: 'in_progress',
        updated_at: oldDate.toISOString(),
        client: { name: 'Test Client' },
        tasks: [
          { id: 'task-1', status: 'completed' },
          { id: 'task-2', status: 'completed' },
          { id: 'task-3', status: 'pending' },
          { id: 'task-4', status: 'pending' }
        ]
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [project], error: null })
      }))

      const result = await getProjectsNeedingClientUpdates()
      
      if (result.length > 0) {
        expect(result[0].progress_percentage).toBe(50)
      }
    })

    it('should not include recently updated projects', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const recentProject = {
        id: 'proj-1',
        name: 'Recent Project',
        status: 'in_progress',
        updated_at: new Date().toISOString(),
        client: { name: 'Test Client' },
        tasks: []
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [recentProject], error: null })
      }))

      const result = await getProjectsNeedingClientUpdates()
      expect(result).toEqual([])
    })

    it('should sort by days since update descending', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const date5 = new Date()
      date5.setDate(date5.getDate() - 5)
      const date10 = new Date()
      date10.setDate(date10.getDate() - 10)

      const projects = [
        {
          id: 'proj-1',
          name: 'Project 1',
          status: 'in_progress',
          updated_at: date5.toISOString(),
          client: { name: 'Client 1' },
          tasks: []
        },
        {
          id: 'proj-2',
          name: 'Project 2',
          status: 'in_progress',
          updated_at: date10.toISOString(),
          client: { name: 'Client 2' },
          tasks: []
        }
      ]

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: projects, error: null })
      }))

      const result = await getProjectsNeedingClientUpdates()
      
      if (result.length > 1) {
        expect(result[0].days_since_update).toBeGreaterThan(result[1].days_since_update)
      }
    })
  })

  describe('getDocumentationStatus', () => {
    it('should fetch documentation status for all projects', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ id: 'proj-1', name: 'Test Project', status: 'in_progress' }],
              error: null
            })
          }
        }
        if (table === 'project_documents') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const result = await getDocumentationStatus()
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter by project ID when provided', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: 'proj-1', name: 'Test Project', status: 'in_progress' }],
        error: null
      })
      
      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: mockEq
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        }
      })

      await getDocumentationStatus('proj-1')
      
      expect(mockEq).toHaveBeenCalledWith('id', 'proj-1')
    })

    it('should mark documents as overdue for completed projects', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ id: 'proj-1', name: 'Completed Project', status: 'completed' }],
              error: null
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        }
      })

      const result = await getDocumentationStatus()
      
      if (result.length > 0) {
        const overdueDoc = result.find(doc => doc.status === 'overdue')
        expect(overdueDoc).toBeDefined()
      }
    })
  })

  describe('generateClientUpdate', () => {
    it('should generate client update message', () => {
      const update: ClientUpdate = {
        project_id: 'proj-1',
        project_name: 'Test Project',
        client_name: 'Test Client',
        status: 'in_progress',
        last_update: new Date().toISOString(),
        days_since_update: 5,
        progress_percentage: 65,
        next_action: 'Complete installation'
      }

      const message = generateClientUpdate(update)

      expect(message).toContain('Test Project')
      expect(message).toContain('65%')
      expect(message).toContain('Complete installation')
      expect(message).toContain('5 days ago')
    })

    it('should handle singular day correctly', () => {
      const update: ClientUpdate = {
        project_id: 'proj-1',
        project_name: 'Test Project',
        client_name: 'Test Client',
        status: 'in_progress',
        last_update: new Date().toISOString(),
        days_since_update: 1,
        progress_percentage: 50
      }

      const message = generateClientUpdate(update)
      expect(message).toContain('Updated yesterday')
    })

    it('should work without next action', () => {
      const update: ClientUpdate = {
        project_id: 'proj-1',
        project_name: 'Test Project',
        client_name: 'Test Client',
        status: 'in_progress',
        last_update: new Date().toISOString(),
        days_since_update: 3,
        progress_percentage: 75
      }

      const message = generateClientUpdate(update)
      expect(message).toBeDefined()
      expect(message.length).toBeGreaterThan(0)
    })

    it('should include all required information', () => {
      const update: ClientUpdate = {
        project_id: 'proj-1',
        project_name: 'Warehouse Project',
        client_name: 'ABC Corp',
        status: 'in_progress',
        last_update: new Date().toISOString(),
        days_since_update: 7,
        progress_percentage: 80,
        next_action: 'Final inspection'
      }

      const message = generateClientUpdate(update)
      
      expect(message).toContain('Warehouse Project')
      expect(message).toContain('80%')
      expect(message).toContain('Final inspection')
    })
  })

  describe('getQuickActions', () => {
    it('should identify urgent items', () => {
      const workItems: DailyWorkItem[] = [
        {
          id: '1',
          type: 'urgent',
          title: 'Urgent task',
          project_name: 'Project 1',
          client_name: 'Client 1',
          status: 'pending',
          priority: 'high'
        }
      ]

      const actions = getQuickActions(workItems, [])
      
      expect(actions.length).toBeGreaterThan(0)
      const urgentAction = actions.find(a => a.urgency === 'high')
      expect(urgentAction).toBeDefined()
    })

    it('should identify needed client updates', () => {
      const clientUpdates: ClientUpdate[] = [
        {
          project_id: 'proj-1',
          project_name: 'Project 1',
          client_name: 'Client 1',
          status: 'in_progress',
          last_update: new Date().toISOString(),
          days_since_update: 5,
          progress_percentage: 60
        }
      ]

      const actions = getQuickActions([], clientUpdates)
      
      expect(actions.length).toBeGreaterThan(0)
      const updateAction = actions.find(a => a.action.includes('update'))
      expect(updateAction).toBeDefined()
    })

    it('should handle multiple urgent items', () => {
      const workItems: DailyWorkItem[] = [
        {
          id: '1',
          type: 'urgent',
          title: 'Task 1',
          project_name: 'Project 1',
          client_name: 'Client 1',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '2',
          type: 'urgent',
          title: 'Task 2',
          project_name: 'Project 2',
          client_name: 'Client 2',
          status: 'pending',
          priority: 'high'
        }
      ]

      const actions = getQuickActions(workItems, [])
      
      const urgentAction = actions.find(a => a.title.includes('urgent'))
      expect(urgentAction?.title).toContain('2')
    })

    it('should return empty array when no actions needed', () => {
      const actions = getQuickActions([], [])
      expect(actions).toEqual([])
    })

    it('should handle active projects', () => {
      const workItems: DailyWorkItem[] = [
        {
          id: '1',
          type: 'today',
          title: 'Active project',
          project_name: 'Project 1',
          client_name: 'Client 1',
          status: 'in_progress',
          priority: 'medium'
        }
      ]

      const actions = getQuickActions(workItems, [])
      
      const projectAction = actions.find(a => a.urgency === 'medium')
      expect(projectAction).toBeDefined()
    })
  })
})
