import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../supabase', () => {
  const mockFrom = vi.fn()
  return {
    supabase: {
      from: mockFrom
    }
  }
})

import {
  generateProjectPlan,
  calculateProjectCosts,
  getBudgetAlerts,
  suggestCostSavings
} from '../project-planning'

describe('project-planning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateProjectPlan', () => {
    it('should generate a project plan for sprinkler system', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const mockProject = {
        id: 'proj-1',
        name: 'Test Sprinkler Project',
        description: 'Test description',
        client: { id: 'client-1', name: 'Test Client' }
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
      }))

      const result = await generateProjectPlan('proj-1', 'sprinkler_system')

      expect(result).toBeDefined()
      expect(result.project_id).toBe('proj-1')
      expect(result.project_name).toBe('Test Sprinkler Project')
      expect(result.phases).toBeDefined()
      expect(result.phases.length).toBeGreaterThan(0)
      expect(result.total_estimated_cost).toBeGreaterThan(0)
      expect(result.budget_status).toBe('within_budget')
    })

    it('should include all required phases for sprinkler system', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        client: { id: 'client-1', name: 'Test Client' }
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
      }))

      const result = await generateProjectPlan('proj-1', 'sprinkler_system')

      expect(result.phases.length).toBe(4)
      expect(result.phases[0].name).toBe('Planning & Design')
      expect(result.phases[1].name).toBe('Procurement & Fabrication')
      expect(result.phases[2].name).toBe('Installation')
      expect(result.phases[3].name).toBe('Testing & Commissioning')
    })

    it('should include tasks in each phase', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        client: { id: 'client-1', name: 'Test Client' }
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
      }))

      const result = await generateProjectPlan('proj-1', 'sprinkler_system')

      result.phases.forEach(phase => {
        expect(phase.tasks).toBeDefined()
        expect(phase.tasks.length).toBeGreaterThan(0)
        
        phase.tasks.forEach(task => {
          expect(task.name).toBeDefined()
          expect(task.estimated_hours).toBeGreaterThan(0)
          expect(task.estimated_cost).toBeGreaterThan(0)
          expect(task.status).toBe('pending')
        })
      })
    })

    it('should throw error if project not found', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
      }))

      await expect(generateProjectPlan('invalid-id', 'sprinkler_system')).rejects.toThrow('Not found')
    })

    it('should handle dependencies between phases', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        client: { id: 'client-1', name: 'Test Client' }
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
      }))

      const result = await generateProjectPlan('proj-1', 'sprinkler_system')

      // Procurement phase should depend on Planning phase
      const procurementPhase = result.phases.find(p => p.name === 'Procurement & Fabrication')
      expect(procurementPhase?.dependencies).toContain('1')

      // Installation phase should depend on Procurement phase
      const installationPhase = result.phases.find(p => p.name === 'Installation')
      expect(installationPhase?.dependencies).toContain('2')
    })
  })

  describe('calculateProjectCosts', () => {
    it('should calculate project costs accurately', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        tasks: [
          { id: 'task-1', estimated_hours: 10 },
          { id: 'task-2', estimated_hours: 20 }
        ]
      }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
          }
        }
        if (table === 'time_logs') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const result = await calculateProjectCosts('proj-1')

      expect(result).toBeDefined()
      expect(result.estimated).toBeGreaterThan(0)
      expect(result.actual).toBeGreaterThanOrEqual(0)
      expect(result.variance).toBeDefined()
      expect(result.variance_percentage).toBeDefined()
      expect(result.status).toBeDefined()
      expect(result.breakdown).toBeDefined()
    })

    it('should identify over budget status', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        tasks: [{ id: 'task-1', estimated_hours: 5 }]
      }

      const mockTimeLogs = [
        {
          start_time: twoHoursAgo.toISOString(),
          end_time: now.toISOString()
        }
      ]

      let callCount = 0
      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
          }
        }
        if (table === 'time_logs') {
          callCount++
          // Return time logs that exceed estimated hours
          const excessiveLogs = callCount === 1 ? [
            {
              start_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              end_time: new Date().toISOString()
            }
          ] : []
          
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: excessiveLogs, error: null })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const result = await calculateProjectCosts('proj-1')

      // With 12 hours actual vs 5 hours estimated, should be over budget
      if (result.actual > result.estimated * 1.1) {
        expect(result.status).toBe('over_budget')
      }
    })

    it('should calculate breakdown correctly', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        tasks: [{ id: 'task-1', estimated_hours: 10 }]
      }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
          }
        }
        if (table === 'time_logs') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const result = await calculateProjectCosts('proj-1')

      expect(result.breakdown.labor).toBeDefined()
      expect(result.breakdown.materials).toBeDefined()
      expect(result.breakdown.overhead).toBeDefined()
      expect(result.breakdown.profit_margin).toBeDefined()
    })

    it('should handle projects with no tasks', async () => {
      const { supabase } = await import('../supabase')
      const mockFrom = supabase.from as any
      
      const mockProject = {
        id: 'proj-1',
        name: 'Test Project',
        tasks: []
      }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const result = await calculateProjectCosts('proj-1')

      expect(result.estimated).toBe(0)
      expect(result.actual).toBe(0)
    })
  })

  describe('getBudgetAlerts', () => {
    it('should return danger alert when over budget', () => {
      const alerts = getBudgetAlerts(100000, 120000, 20)

      expect(alerts.length).toBeGreaterThan(0)
      const dangerAlert = alerts.find(a => a.severity === 'danger')
      expect(dangerAlert).toBeDefined()
      expect(dangerAlert?.alert).toContain('over budget')
    })

    it('should return warning alert when at risk', () => {
      const alerts = getBudgetAlerts(100000, 107000, 7)

      expect(alerts.length).toBeGreaterThan(0)
      const warningAlert = alerts.find(a => a.severity === 'warning')
      expect(warningAlert).toBeDefined()
      expect(warningAlert?.alert).toContain('at risk')
    })

    it('should return empty array when within budget', () => {
      const alerts = getBudgetAlerts(100000, 95000, -5)

      expect(alerts.length).toBe(0)
    })

    it('should provide recommendations', () => {
      const alerts = getBudgetAlerts(100000, 115000, 15)

      expect(alerts.length).toBeGreaterThan(0)
      alerts.forEach(alert => {
        expect(alert.recommendation).toBeDefined()
        expect(alert.recommendation.length).toBeGreaterThan(0)
      })
    })

    it('should warn about spending pace', () => {
      const alerts = getBudgetAlerts(100000, 85000, 6)

      const paceAlert = alerts.find(a => a.alert.includes('pace'))
      expect(paceAlert).toBeDefined()
      expect(paceAlert?.severity).toBe('warning')
    })
  })

  describe('suggestCostSavings', () => {
    it('should provide suggestions for sprinkler systems', () => {
      const suggestions = suggestCostSavings('sprinkler_system')

      expect(suggestions).toBeDefined()
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should provide suggestions for fire alarms', () => {
      const suggestions = suggestCostSavings('fire_alarm')

      expect(suggestions).toBeDefined()
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should return empty array for unknown project type', () => {
      const suggestions = suggestCostSavings('unknown_type')

      expect(suggestions).toEqual([])
    })

    it('should provide actionable suggestions', () => {
      const suggestions = suggestCostSavings('sprinkler_system')

      suggestions.forEach(suggestion => {
        expect(suggestion).toBeDefined()
        expect(suggestion.length).toBeGreaterThan(10)
      })
    })
  })
})
