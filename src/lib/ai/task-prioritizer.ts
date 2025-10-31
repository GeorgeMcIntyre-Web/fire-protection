import { supabase } from '../supabase'

export interface PrioritizedTask {
  task_id: string
  task_name: string
  priority_score: number
  suggested_priority: 'low' | 'medium' | 'high' | 'critical'
  reasoning: string[]
  recommended_assignee?: string
  estimated_hours?: number
}

/**
 * Intelligent Task Prioritization
 * Uses AI algorithms to determine optimal task priority and execution order
 */
export class TaskPrioritizer {
  
  /**
   * Prioritize all tasks in a project
   */
  async prioritizeProjectTasks(projectId: string): Promise<PrioritizedTask[]> {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*), project_metrics(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return []
      
      const tasks = project.tasks || []
      const metrics = project.project_metrics?.[0]
      
      // Calculate priority scores for each task
      const prioritizedTasks = await Promise.all(
        tasks
          .filter(t => t.status !== 'completed')
          .map(task => this.calculateTaskPriority(task, tasks, project, metrics))
      )
      
      // Sort by priority score (highest first)
      prioritizedTasks.sort((a, b) => b.priority_score - a.priority_score)
      
      // Save predictions to database
      await this.savePredictions(prioritizedTasks)
      
      return prioritizedTasks
      
    } catch (error) {
      console.error('Error prioritizing tasks:', error)
      return []
    }
  }
  
  /**
   * Calculate priority score for a single task
   */
  private async calculateTaskPriority(
    task: any,
    allTasks: any[],
    project: any,
    metrics: any
  ): Promise<PrioritizedTask> {
    let score = 50 // Base score
    const reasoning: string[] = []
    
    // Factor 1: Current Priority (20 points)
    const priorityPoints = {
      'high': 20,
      'medium': 10,
      'low': 0
    }
    const priorityScore = priorityPoints[task.priority as keyof typeof priorityPoints] || 0
    score += priorityScore
    if (priorityScore > 10) {
      reasoning.push(`Marked as ${task.priority} priority`)
    }
    
    // Factor 2: Due Date Urgency (25 points)
    if (task.due_date) {
      const now = new Date()
      const dueDate = new Date(task.due_date)
      const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysUntilDue < 0) {
        score += 25 // Overdue - highest urgency
        reasoning.push(`OVERDUE by ${Math.abs(Math.round(daysUntilDue))} days`)
      } else if (daysUntilDue < 1) {
        score += 25
        reasoning.push('Due today')
      } else if (daysUntilDue < 3) {
        score += 20
        reasoning.push('Due within 3 days')
      } else if (daysUntilDue < 7) {
        score += 15
        reasoning.push('Due within a week')
      } else if (daysUntilDue < 14) {
        score += 10
        reasoning.push('Due within 2 weeks')
      } else {
        score += 5
      }
    }
    
    // Factor 3: Dependencies (15 points)
    // In a real system, would check task dependencies
    const blockedTasks = allTasks.filter(t => {
      // Simplified: check if task names suggest dependency
      const otherName = (t.name || '').toLowerCase()
      const thisName = (task.name || '').toLowerCase()
      return otherName.includes(thisName) || thisName.includes('prerequisite')
    })
    
    if (blockedTasks.length > 0) {
      score += 15
      reasoning.push(`${blockedTasks.length} tasks depend on this`)
    }
    
    // Factor 4: Impact on Project Timeline (15 points)
    if (metrics) {
      const scheduleHealth = metrics.schedule_health
      if (scheduleHealth === 'delayed') {
        score += 15
        reasoning.push('Project is delayed - high urgency')
      } else if (scheduleHealth === 'at-risk') {
        score += 10
        reasoning.push('Project at risk - increased urgency')
      }
    }
    
    // Factor 5: Task Age (10 points)
    const createdDate = new Date(task.created_at)
    const now = new Date()
    const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (ageInDays > 30) {
      score += 10
      reasoning.push(`Task is ${Math.round(ageInDays)} days old`)
    } else if (ageInDays > 14) {
      score += 5
    }
    
    // Factor 6: Customer Impact (10 points)
    const taskText = `${task.name} ${task.description || ''}`.toLowerCase()
    if (taskText.includes('client') || taskText.includes('customer') || taskText.includes('deadline')) {
      score += 10
      reasoning.push('Customer-facing task')
    }
    
    // Factor 7: Risk Mitigation (10 points)
    if (taskText.includes('risk') || taskText.includes('critical') || taskText.includes('urgent')) {
      score += 10
      reasoning.push('Risk mitigation task')
    }
    
    // Factor 8: Quick Wins (small effort, high value)
    // Estimate complexity from task name/description
    const isQuickWin = taskText.split(' ').length < 10 && !taskText.includes('complex')
    if (isQuickWin && task.priority !== 'low') {
      score += 5
      reasoning.push('Quick win opportunity')
    }
    
    // Factor 9: Assignee Availability
    let recommendedAssignee: string | undefined
    if (!task.assigned_to) {
      // Task is unassigned - increase priority
      score += 5
      reasoning.push('Unassigned task needs attention')
      
      // Find best assignee based on workload
      recommendedAssignee = await this.findBestAssignee(task, allTasks)
    }
    
    // Factor 10: Project Health
    if (metrics) {
      if (metrics.budget_health === 'critical') {
        score += 5
        reasoning.push('Budget critical - need efficiency')
      }
      if (metrics.risk_level === 'high' || metrics.risk_level === 'critical') {
        score += 5
        reasoning.push('High project risk')
      }
    }
    
    // Normalize score to 0-100
    score = Math.min(100, Math.max(0, score))
    
    // Determine suggested priority
    let suggestedPriority: 'low' | 'medium' | 'high' | 'critical'
    if (score >= 80) suggestedPriority = 'critical'
    else if (score >= 60) suggestedPriority = 'high'
    else if (score >= 40) suggestedPriority = 'medium'
    else suggestedPriority = 'low'
    
    // Estimate hours (placeholder logic)
    const estimatedHours = this.estimateTaskHours(task)
    
    return {
      task_id: task.id,
      task_name: task.name,
      priority_score: Math.round(score),
      suggested_priority: suggestedPriority,
      reasoning: reasoning,
      recommended_assignee: recommendedAssignee,
      estimated_hours: estimatedHours
    }
  }
  
  /**
   * Find best assignee for a task based on workload and skills
   */
  private async findBestAssignee(task: any, allTasks: any[]): Promise<string | undefined> {
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('*')
    
    if (!teamMembers || teamMembers.length === 0) return undefined
    
    // Calculate current workload for each team member
    const workloads = teamMembers.map(member => {
      const assignedTasks = allTasks.filter(t => 
        t.assigned_to === member.id && t.status !== 'completed'
      )
      return {
        user_id: member.id,
        user_name: member.full_name,
        task_count: assignedTasks.length,
        role: member.role
      }
    })
    
    // Sort by workload (ascending)
    workloads.sort((a, b) => a.task_count - b.task_count)
    
    // Return team member with least workload
    return workloads[0]?.user_id
  }
  
  /**
   * Estimate hours required for a task
   */
  private estimateTaskHours(task: any): number {
    const taskText = `${task.name} ${task.description || ''}`.toLowerCase()
    
    // Simple heuristic based on keywords
    let hours = 4 // Base estimate
    
    if (taskText.includes('install')) hours += 4
    if (taskText.includes('inspect')) hours += 2
    if (taskText.includes('complex') || taskText.includes('comprehensive')) hours += 8
    if (taskText.includes('quick') || taskText.includes('simple')) hours -= 2
    if (taskText.includes('large') || taskText.includes('major')) hours += 6
    if (task.priority === 'high') hours += 2 // High priority tasks tend to be more complex
    
    return Math.max(1, Math.min(40, hours)) // Between 1 and 40 hours
  }
  
  /**
   * Save task predictions to database
   */
  private async savePredictions(prioritizedTasks: PrioritizedTask[]): Promise<void> {
    try {
      for (const task of prioritizedTasks) {
        await supabase
          .from('task_predictions')
          .upsert({
            task_id: task.task_id,
            priority_score: task.priority_score,
            suggested_priority: task.suggested_priority,
            predicted_hours: task.estimated_hours,
            recommended_assignee: task.recommended_assignee,
            confidence_score: 75, // Base confidence
            model_version: '1.0'
          }, { onConflict: 'task_id' })
      }
    } catch (error) {
      console.error('Error saving task predictions:', error)
    }
  }
  
  /**
   * Get recommended task execution order for today
   */
  async getRecommendedTaskOrder(userId: string): Promise<PrioritizedTask[]> {
    try {
      // Get user's assigned tasks
      const { data: userTasks } = await supabase
        .from('tasks')
        .select('*, projects!inner(*)')
        .eq('assigned_to', userId)
        .neq('status', 'completed')
      
      if (!userTasks) return []
      
      // Calculate priority for each task
      const prioritized: PrioritizedTask[] = []
      
      for (const task of userTasks) {
        const { data: project } = await supabase
          .from('projects')
          .select('*, tasks(*), project_metrics(*)')
          .eq('id', task.project_id)
          .single()
        
        if (project) {
          const allTasks = project.tasks || []
          const metrics = project.project_metrics?.[0]
          
          const prioritizedTask = await this.calculateTaskPriority(
            task,
            allTasks,
            project,
            metrics
          )
          prioritized.push(prioritizedTask)
        }
      }
      
      // Sort by priority
      prioritized.sort((a, b) => b.priority_score - a.priority_score)
      
      return prioritized
      
    } catch (error) {
      console.error('Error getting recommended task order:', error)
      return []
    }
  }
}

export const taskPrioritizer = new TaskPrioritizer()
