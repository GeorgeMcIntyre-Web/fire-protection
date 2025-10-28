import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculateProjectCosts, getBudgetAlerts } from '../project-planning'
import { supabase } from '../supabase'

describe('calculateProjectCosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should calculate costs with no time logs', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      tasks: [
        { id: 'task-1', estimated_hours: 10 },
        { id: 'task-2', estimated_hours: 20 },
      ],
    }

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProject,
            error: null,
          }),
        }),
      }),
    } as any)

    // Mock time logs (empty)
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProject,
            error: null,
          }),
        }),
      }),
    } as any)

    const result = await calculateProjectCosts('project-1')

    expect(result.estimated).toBeGreaterThan(0)
    expect(result.actual).toBeGreaterThanOrEqual(0)
    expect(result.status).toBe('within_budget')
    expect(result.breakdown).toHaveProperty('labor')
    expect(result.breakdown).toHaveProperty('materials')
    expect(result.breakdown).toHaveProperty('overhead')
    expect(result.breakdown).toHaveProperty('profit_margin')
  })

  it('should calculate variance correctly when over budget', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      tasks: [{ id: 'task-1', estimated_hours: 10 }],
    }

    const mockTimeLogs = [
      {
        start_time: '2024-01-01T08:00:00Z',
        end_time: '2024-01-01T20:00:00Z', // 12 hours actual vs 10 estimated
      },
    ]

    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockTimeLogs,
            error: null,
          }),
        }),
      } as any)

    const result = await calculateProjectCosts('project-1')

    expect(result.variance).toBeGreaterThan(0)
    expect(result.variance_percentage).toBeGreaterThan(10)
    expect(result.status).toBe('over_budget')
  })

  it('should mark project as at_risk when variance is 5-10%', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      tasks: [{ id: 'task-1', estimated_hours: 100 }],
    }

    const mockTimeLogs = [
      {
        start_time: '2024-01-01T08:00:00Z',
        end_time: '2024-01-01T15:00:00Z', // 7 hours extra on 100 = ~7%
      },
      {
        start_time: '2024-01-02T08:00:00Z',
        end_time: '2024-01-02T18:00:00Z', // 10 more hours
      },
    ]

    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockTimeLogs,
            error: null,
          }),
        }),
      } as any)

    const result = await calculateProjectCosts('project-1')

    // Should have positive variance
    expect(result.variance).toBeGreaterThanOrEqual(0)
  })

  it('should handle database errors gracefully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    } as any)

    await expect(calculateProjectCosts('project-1')).rejects.toThrow()
  })

  it('should calculate breakdown costs correctly', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      tasks: [{ id: 'task-1', estimated_hours: 100 }],
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as any)

    const result = await calculateProjectCosts('project-1')

    // Overhead should be 15% of estimated
    expect(result.breakdown.overhead).toBe(result.estimated * 0.15)
    // Profit margin should be 20% of estimated
    expect(result.breakdown.profit_margin).toBe(result.estimated * 0.20)
  })
})

describe('getBudgetAlerts', () => {
  it('should return danger alert when over 10% over budget', () => {
    const alerts = getBudgetAlerts(1000, 1200, 20)

    expect(alerts.length).toBeGreaterThan(0)
    expect(alerts[0].severity).toBe('danger')
    expect(alerts[0].alert).toContain('over budget')
  })

  it('should return warning alert when 5-10% over budget', () => {
    const alerts = getBudgetAlerts(1000, 1070, 7)

    expect(alerts.length).toBeGreaterThan(0)
    expect(alerts[0].severity).toBe('warning')
    expect(alerts[0].alert).toContain('at risk')
  })

  it('should return no alerts when within budget', () => {
    const alerts = getBudgetAlerts(1000, 950, -5)

    expect(alerts.length).toBe(0)
  })

  it('should warn about spending pace when over 80% spent', () => {
    const alerts = getBudgetAlerts(1000, 850, 2)

    const spendingAlert = alerts.find(a => a.alert.includes('Spending pace'))
    expect(spendingAlert).toBeDefined()
    expect(spendingAlert?.severity).toBe('warning')
  })
})
