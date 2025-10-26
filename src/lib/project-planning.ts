import { supabase } from './supabase'

/**
 * Project Planning Helper for Quinten
 * Addresses: Structure, Planning, Budgeting
 */

export interface ProjectPlan {
  project_id: string
  project_name: string
  phases: ProjectPhase[]
  total_estimated_cost: number
  budget_status: 'within_budget' | 'over_budget' | 'at_risk'
}

export interface ProjectPhase {
  id: string
  name: string
  description: string
  tasks: PlannedTask[]
  estimated_cost: number
  actual_cost: number
  start_date?: string
  completion_date?: string
  status: 'not_started' | 'in_progress' | 'completed'
  dependencies?: string[]
}

export interface PlannedTask {
  id: string
  name: string
  description: string
  estimated_hours: number
  actual_hours: number
  hourly_rate: number
  materials_cost: number
  estimated_cost: number
  actual_cost: number
  status: 'pending' | 'in_progress' | 'completed'
  assigned_to?: string
  due_date?: string
}

/**
 * Generate structured project plan from template
 */
export async function generateProjectPlan(
  projectId: string,
  projectType: 'sprinkler_system' | 'fire_alarm' | 'maintenance' | 'inspection'
): Promise<ProjectPlan> {
  // Fetch project details
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, client:clients(*)')
    .eq('id', projectId)
    .single()

  if (error) throw error

  // Get phase structure based on project type
  const phases = getPhasesForProjectType(projectType)
  
  // Calculate costs
  const totalEstimated = phases.reduce((sum, phase) => sum + phase.estimated_cost, 0)

  return {
    project_id: projectId,
    project_name: project.name,
    phases,
    total_estimated_cost: totalEstimated,
    budget_status: 'within_budget'
  }
}

/**
 * Get structured phases for fire sprinkler project
 */
function getPhasesForProjectType(projectType: string): ProjectPhase[] {
  const phases: Record<string, ProjectPhase[]> = {
    sprinkler_system: [
      {
        id: '1',
        name: 'Planning & Design',
        description: 'Site survey, design, ASIB approval',
        tasks: [
          { 
            id: '1-1', 
            name: 'Site Survey & Assessment', 
            estimated_hours: 4, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 0,
            estimated_cost: 600, 
            actual_cost: 0, 
            status: 'pending', 
            description: 'Measure site, assess requirements'
          },
          { 
            id: '1-2', 
            name: 'System Design', 
            estimated_hours: 8, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 0,
            estimated_cost: 1200, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Create sprinkler system design'
          },
          { 
            id: '1-3', 
            name: 'ASIB Submission', 
            estimated_hours: 2, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 500,
            estimated_cost: 800, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Submit design for ASIB approval'
          }
        ],
        estimated_cost: 2600,
        actual_cost: 0,
        status: 'not_started'
      },
      {
        id: '2',
        name: 'Procurement & Fabrication',
        description: 'Order materials, fabricate pipework',
        tasks: [
          { 
            id: '2-1', 
            name: 'Material Procurement', 
            estimated_hours: 4, 
            actual_hours: 0, 
            hourly_rate: 120,
            materials_cost: 25000,
            estimated_cost: 25480, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Order pipes, fittings, valves, sprinkler heads'
          },
          { 
            id: '2-2', 
            name: 'Fabrication - Pipework', 
            estimated_hours: 16, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 5000,
            estimated_cost: 7400, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Fabricate pipe sections off-site'
          },
          { 
            id: '2-3', 
            name: 'Fabrication - Mounting Brackets', 
            estimated_hours: 8, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 500,
            estimated_cost: 1700, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Fabricate mounting brackets'
          }
        ],
        estimated_cost: 34580,
        actual_cost: 0,
        status: 'not_started',
        dependencies: ['1']
      },
      {
        id: '3',
        name: 'Installation',
        description: 'Install sprinkler system on site',
        tasks: [
          { 
            id: '3-1', 
            name: 'Pipe Installation', 
            estimated_hours: 32, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 2000,
            estimated_cost: 6800, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Install main and branch pipework'
          },
          { 
            id: '3-2', 
            name: 'Sprinkler Head Installation', 
            estimated_hours: 16, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 1500,
            estimated_cost: 3900, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Install and position all sprinkler heads'
          },
          { 
            id: '3-3', 
            name: 'Valve Installation', 
            estimated_hours: 8, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 3000,
            estimated_cost: 4200, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Install control valves and check valves'
          }
        ],
        estimated_cost: 14900,
        actual_cost: 0,
        status: 'not_started',
        dependencies: ['2']
      },
      {
        id: '4',
        name: 'Testing & Commissioning',
        description: 'Pressure tests, final inspections, handover',
        tasks: [
          { 
            id: '4-1', 
            name: 'Pressure Testing', 
            estimated_hours: 4, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 0,
            estimated_cost: 600, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Hydraulic pressure test per ASIB requirements'
          },
          { 
            id: '4-2', 
            name: 'System Commissioning', 
            estimated_hours: 8, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 0,
            estimated_cost: 1200, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Commission and test entire system'
          },
          { 
            id: '4-3', 
            name: 'Final Documentation', 
            estimated_hours: 4, 
            actual_hours: 0, 
            hourly_rate: 150,
            materials_cost: 0,
            estimated_cost: 600, 
            actual_cost: 0, 
            status: 'pending',
            description: 'Complete certificates and handover docs'
          }
        ],
        estimated_cost: 2400,
        actual_cost: 0,
        status: 'not_started',
        dependencies: ['3']
      }
    ],
    // Add other project types as needed
    fire_alarm: [],
    maintenance: [],
    inspection: []
  }

  return phases[projectType] || []
}

/**
 * Calculate project costs and compare to budget
 */
export async function calculateProjectCosts(projectId: string): Promise<{
  estimated: number
  actual: number
  variance: number
  variance_percentage: number
  status: 'within_budget' | 'over_budget' | 'at_risk'
  breakdown: {
    labor: number
    materials: number
    overhead: number
    profit_margin: number
  }
}> {
  // Fetch project and tasks
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, tasks(*)')
    .eq('id', projectId)
    .single()

  if (error) throw error

  // Calculate costs
  const tasks = project.tasks || []
  let estimatedTotal = 0
  let actualTotal = 0
  let laborCost = 0
  let materialCost = 0

  for (const task of tasks) {
    // Estimated
    const estimatedHours = (task as any).estimated_hours || 0
    const hourlyRate = 150 // Standard rate
    estimatedTotal += (estimatedHours * hourlyRate)

    // Actual from time logs
    const { data: timeLogs } = await supabase
      .from('time_logs')
      .select('start_time, end_time')
      .eq('task_id', task.id)

    const actualHours = timeLogs?.reduce((sum, log) => {
      if (log.end_time) {
        const start = new Date(log.start_time)
        const end = new Date(log.end_time)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }
      return sum
    }, 0) || 0

    actualTotal += (actualHours * hourlyRate)
    laborCost += (actualHours * hourlyRate)

    // Materials (estimate at 30% of project cost)
    materialCost += (estimatedTotal * 0.3)
  }

  const overhead = estimatedTotal * 0.15 // 15% overhead
  const profitMargin = estimatedTotal * 0.20 // 20% profit

  const variance = actualTotal - estimatedTotal
  const variancePercentage = estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0

  let status: 'within_budget' | 'over_budget' | 'at_risk' = 'within_budget'
  if (variancePercentage > 10) status = 'over_budget'
  else if (variancePercentage > 5) status = 'at_risk'

  return {
    estimated: estimatedTotal,
    actual: actualTotal,
    variance,
    variance_percentage: variancePercentage,
    status,
    breakdown: {
      labor: laborCost,
      materials: materialCost,
      overhead,
      profit_margin: profitMargin
    }
  }
}

/**
 * Get budget alerts and recommendations
 */
export function getBudgetAlerts(
  estimated: number,
  actual: number,
  variancePercentage: number
): {
  alert: string
  recommendation: string
  severity: 'info' | 'warning' | 'danger'
}[] {
  const alerts = []

  if (variancePercentage > 10) {
    alerts.push({
      alert: 'Project is over budget',
      recommendation: 'Review expenses immediately. Consider material alternatives or scope reduction.',
      severity: 'danger' as const
    })
  } else if (variancePercentage > 5) {
    alerts.push({
      alert: 'Project budget at risk',
      recommendation: 'Monitor costs closely. Optimize remaining tasks to stay within budget.',
      severity: 'warning' as const
    })
  }

  if (actual > estimated * 0.8 && variancePercentage > 0) {
    alerts.push({
      alert: 'Spending pace higher than planned',
      recommendation: 'Re-evaluate project timeline and resource allocation.',
      severity: 'warning' as const
    })
  }

  return alerts
}

/**
 * Suggest cost-saving measures
 */
export function suggestCostSavings(projectType: string): string[] {
  const suggestions = {
    sprinkler_system: [
      'Consider pre-fabricated pipe sections to reduce installation time',
      'Bulk order materials at start to get better pricing',
      'Schedule work during off-peak hours to avoid delays',
      'Reuse existing mounting brackets where possible',
      'Negotiate better rates with suppliers for repeat orders'
    ],
    fire_alarm: [
      'Use wireless detectors where possible to reduce installation time',
      'Bulk purchase smoke detectors for better rates',
      'Coordinate with other trades to reduce site visits',
      'Pre-program panels off-site to save time'
    ]
  }

  return suggestions[projectType as keyof typeof suggestions] || []
}

