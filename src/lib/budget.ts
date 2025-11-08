/**
 * Budget Tracker - Real Data Integration
 * 
 * Connects budget tracking to actual project and task data from Supabase
 */

import { supabase } from './supabase'

export interface ProjectBudget {
  id: string
  name: string
  budget: number
  spent: number
  variance: number
  variancePercent: number
  status: 'green' | 'yellow' | 'red'
  taskCount: number
}

export interface ProjectCostBreakdown {
  tasks: Array<{
    id: string
    name: string
    estimated_cost: number | null
    actual_cost: number | null
    status: string
  }>
  totalEstimated: number
  totalActual: number
}

/**
 * Get all project budgets for a user
 */
export async function getProjectBudgets(userId: string): Promise<ProjectBudget[]> {
  try {
    // Get projects with tasks
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        estimated_cost,
        tasks (
          id,
          actual_cost,
          estimated_cost
        )
      `)
      .eq('user_id', userId)

    if (error) throw error

    if (!projects) return []

    // Calculate budget vs actual for each project
    return projects.map(project => {
      const budget = project.estimated_cost || 0
      const tasks = project.tasks || []
      
      const spent = tasks.reduce((sum: number, task: any) => 
        sum + (task.actual_cost || task.estimated_cost || 0), 0
      )
      
      const variance = budget - spent
      const variancePercent = budget > 0 ? (variance / budget) * 100 : 0

      // Determine status
      let status: 'green' | 'yellow' | 'red' = 'green'
      if (variancePercent < -10) {
        status = 'red' // Over budget by more than 10%
      } else if (variancePercent < 0) {
        status = 'yellow' // Over budget but less than 10%
      }

      return {
        id: project.id,
        name: project.name,
        budget,
        spent,
        variance,
        variancePercent,
        status,
        taskCount: tasks.length
      }
    })
  } catch (error) {
    console.error('Error fetching project budgets:', error)
    throw error
  }
}

/**
 * Get detailed cost breakdown for a specific project
 */
export async function getProjectCostBreakdown(projectId: string): Promise<ProjectCostBreakdown> {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, estimated_cost, actual_cost, status')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const taskList = tasks || []

    return {
      tasks: taskList.map(task => ({
        id: task.id,
        name: task.name,
        estimated_cost: task.estimated_cost,
        actual_cost: task.actual_cost,
        status: task.status
      })),
      totalEstimated: taskList.reduce((sum, t) => sum + (t.estimated_cost || 0), 0),
      totalActual: taskList.reduce((sum, t) => sum + (t.actual_cost || 0), 0)
    }
  } catch (error) {
    console.error('Error fetching project breakdown:', error)
    throw error
  }
}

/**
 * Get overall budget summary across all projects
 */
export async function getBudgetSummary(userId: string) {
  const budgets = await getProjectBudgets(userId)
  
  const totalBudget = budgets.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = budgets.reduce((sum, p) => sum + p.spent, 0)
  const totalVariance = totalBudget - totalSpent
  const totalVariancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0

  return {
    totalBudget,
    totalSpent,
    totalVariance,
    totalVariancePercent,
    projectCount: budgets.length,
    overBudgetCount: budgets.filter(p => p.status === 'red').length,
    onTrackCount: budgets.filter(p => p.status === 'green').length
  }
}

