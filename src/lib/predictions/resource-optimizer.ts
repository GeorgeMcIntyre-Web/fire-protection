import { supabase } from '../supabase'
import type { ResourceOptimization, ResourceAllocation } from '../../types/analytics'

/**
 * Resource Optimization Engine
 * Optimizes team member assignments to minimize delays and maximize efficiency
 */
export class ResourceOptimizer {
  
  /**
   * Optimize resource allocation for a project
   */
  async optimizeProjectResources(projectId: string): Promise<ResourceOptimization | null> {
    try {
      // Get project, tasks, and team members
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return null
      
      const tasks = project.tasks || []
      
      // Get all team members
      const { data: teamMembers } = await supabase
        .from('profiles')
        .select('*')
      
      if (!teamMembers) return null
      
      // Get current time logs to calculate utilization
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('*')
        .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      
      // Build current allocation
      const currentAllocation = this.buildCurrentAllocation(teamMembers, tasks, timeLogs || [])
      
      // Calculate optimal allocation
      const suggestedAllocation = this.calculateOptimalAllocation(
        teamMembers,
        tasks,
        currentAllocation,
        timeLogs || []
      )
      
      // Calculate improvements
      const improvements = this.calculateImprovements(currentAllocation, suggestedAllocation, tasks)
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        currentAllocation,
        suggestedAllocation,
        improvements
      )
      
      const result: ResourceOptimization = {
        current_allocation: currentAllocation,
        suggested_allocation: suggestedAllocation,
        improvements: improvements,
        recommendations: recommendations
      }
      
      return result
      
    } catch (error) {
      console.error('Error optimizing resources:', error)
      return null
    }
  }
  
  /**
   * Build current resource allocation
   */
  private buildCurrentAllocation(
    teamMembers: any[],
    tasks: any[],
    timeLogs: any[]
  ): ResourceAllocation[] {
    return teamMembers.map(member => {
      // Find tasks assigned to this member
      const memberTasks = tasks.filter(t => t.assigned_to === member.id)
      
      // Calculate utilization from time logs
      const memberLogs = timeLogs.filter(log => log.user_id === member.id)
      const hoursWorked = memberLogs.reduce((sum, log) => {
        if (!log.end_time) return sum
        const start = new Date(log.start_time)
        const end = new Date(log.end_time)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0)
      
      const availableHours = 40 // 40 hours per week
      const utilization = (hoursWorked / availableHours) * 100
      
      // Extract skills from profile or use defaults
      const skills = this.extractSkills(member)
      
      return {
        user_id: member.id,
        user_name: member.full_name || 'Unknown',
        current_tasks: memberTasks.map(t => t.id),
        suggested_tasks: [], // Will be filled by optimization
        utilization: Math.round(utilization),
        skills: skills,
        availability: Math.max(0, availableHours - hoursWorked)
      }
    })
  }
  
  /**
   * Extract skills from team member profile
   */
  private extractSkills(member: any): string[] {
    // In a real system, skills would be stored in profile
    // For now, derive from role
    const skillsByRole: Record<string, string[]> = {
      'admin': ['management', 'planning', 'oversight', 'quality_control'],
      'manager': ['planning', 'coordination', 'oversight', 'reporting'],
      'technician': ['installation', 'inspection', 'maintenance', 'documentation']
    }
    
    return skillsByRole[member.role] || ['general']
  }
  
  /**
   * Calculate optimal resource allocation
   */
  private calculateOptimalAllocation(
    teamMembers: any[],
    tasks: any[],
    currentAllocation: ResourceAllocation[],
    timeLogs: any[]
  ): ResourceAllocation[] {
    const optimized = JSON.parse(JSON.stringify(currentAllocation)) as ResourceAllocation[]
    
    // Get unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assigned_to && t.status !== 'completed')
    
    // Get overdue tasks
    const now = new Date()
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && 
      t.due_date && 
      new Date(t.due_date) < now
    )
    
    // Sort tasks by priority and due date
    const sortedTasks = [...tasks].sort((a, b) => {
      // Priority order: high > medium > low
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      
      return 0
    })
    
    // Optimization Algorithm: Assign tasks based on:
    // 1. Skill match
    // 2. Current workload
    // 3. Task priority
    // 4. Due dates
    
    sortedTasks.forEach(task => {
      if (task.status === 'completed') return
      
      // Find best team member for this task
      const scores = optimized.map(member => {
        let score = 100
        
        // Prefer members with availability
        score -= Math.max(0, 100 - member.availability * 2)
        
        // Prefer members with matching skills
        const taskRequiredSkills = this.inferTaskSkills(task)
        const skillMatch = taskRequiredSkills.filter(s => member.skills.includes(s)).length
        score += skillMatch * 20
        
        // Prefer members with lower current workload
        score -= member.current_tasks.length * 5
        
        // Penalize overutilized members
        if (member.utilization > 90) score -= 50
        if (member.utilization > 80) score -= 25
        
        return { member, score }
      })
      
      // Sort by score and pick best
      scores.sort((a, b) => b.score - a.score)
      
      const bestMember = scores[0]?.member
      if (bestMember && bestMember.availability > 0) {
        // Only add if not already in suggested tasks
        if (!bestMember.suggested_tasks.includes(task.id)) {
          bestMember.suggested_tasks.push(task.id)
          bestMember.availability -= 4 // Assume 4 hours per task
        }
      }
    })
    
    return optimized
  }
  
  /**
   * Infer required skills for a task
   */
  private inferTaskSkills(task: any): string[] {
    const name = (task.name || '').toLowerCase()
    const description = (task.description || '').toLowerCase()
    const text = `${name} ${description}`
    
    const skills: string[] = []
    
    if (text.includes('install') || text.includes('setup')) skills.push('installation')
    if (text.includes('inspect') || text.includes('check')) skills.push('inspection')
    if (text.includes('maintain') || text.includes('repair')) skills.push('maintenance')
    if (text.includes('document') || text.includes('report')) skills.push('documentation')
    if (text.includes('plan') || text.includes('design')) skills.push('planning')
    if (text.includes('manage') || text.includes('coordinate')) skills.push('management')
    
    // If no specific skills identified, add general
    if (skills.length === 0) skills.push('general')
    
    return skills
  }
  
  /**
   * Calculate improvements from optimization
   */
  private calculateImprovements(
    current: ResourceAllocation[],
    suggested: ResourceAllocation[],
    tasks: any[]
  ): {
    reduced_delays: number
    cost_savings: number
    improved_utilization: number
  } {
    // Calculate current vs suggested utilization
    const currentAvgUtil = current.reduce((sum, a) => sum + a.utilization, 0) / current.length
    const suggestedAvgUtil = suggested.reduce((sum, a) => sum + (a.suggested_tasks.length / (a.current_tasks.length || 1)) * a.utilization, 0) / suggested.length
    
    const utilImprovement = suggestedAvgUtil - currentAvgUtil
    
    // Estimate delay reduction
    const unassignedCount = tasks.filter(t => !t.assigned_to && t.status !== 'completed').length
    const nowAssignedCount = suggested.reduce((sum, a) => {
      return sum + a.suggested_tasks.filter(id => {
        const task = tasks.find(t => t.id === id)
        return task && !task.assigned_to
      }).length
    }, 0)
    
    const delayReduction = Math.min(nowAssignedCount * 2, 14) // Max 2 weeks reduction
    
    // Estimate cost savings from better utilization
    const costSavings = utilImprovement > 0 ? utilImprovement * 100 : 0 // $100 per % improvement
    
    return {
      reduced_delays: Math.round(delayReduction),
      cost_savings: Math.round(costSavings),
      improved_utilization: Math.round(Math.abs(utilImprovement))
    }
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(
    current: ResourceAllocation[],
    suggested: ResourceAllocation[],
    improvements: any
  ): string[] {
    const recommendations: string[] = []
    
    // Check for overutilized team members
    const overutilized = current.filter(a => a.utilization > 90)
    if (overutilized.length > 0) {
      recommendations.push(
        `${overutilized.length} team member(s) are overutilized (>90%). Redistribute workload to prevent burnout`
      )
    }
    
    // Check for underutilized team members
    const underutilized = current.filter(a => a.utilization < 50)
    if (underutilized.length > 0) {
      recommendations.push(
        `${underutilized.length} team member(s) are underutilized (<50%). Assign more tasks to improve efficiency`
      )
    }
    
    // Check for skill gaps
    const allRequiredSkills = new Set<string>()
    suggested.forEach(a => {
      a.suggested_tasks.forEach(() => {
        allRequiredSkills.add('general') // Placeholder
      })
    })
    
    const availableSkills = new Set(current.flatMap(a => a.skills))
    const missingSkills = Array.from(allRequiredSkills).filter(s => !availableSkills.has(s))
    
    if (missingSkills.length > 0) {
      recommendations.push(
        `Consider hiring or training team members in: ${missingSkills.join(', ')}`
      )
    }
    
    // Check for task reallocation opportunities
    const reallocationCount = suggested.reduce((count, s) => {
      const current Alloc = current.find(c => c.user_id === s.user_id)
      if (!currentAlloc) return count
      
      const changedTasks = s.suggested_tasks.filter(id => !currentAlloc.current_tasks.includes(id))
      return count + changedTasks.length
    }, 0)
    
    if (reallocationCount > 0) {
      recommendations.push(
        `Reallocate ${reallocationCount} task(s) to optimize workload distribution`
      )
    }
    
    // Overall improvement summary
    if (improvements.reduced_delays > 0) {
      recommendations.push(
        `Optimization could reduce project delays by approximately ${improvements.reduced_delays} days`
      )
    }
    
    if (improvements.improved_utilization > 5) {
      recommendations.push(
        `Improve average team utilization by ${improvements.improved_utilization}%`
      )
    }
    
    // If no recommendations, add default
    if (recommendations.length === 0) {
      recommendations.push('Current resource allocation is optimal. No changes recommended')
    }
    
    return recommendations
  }
}

export const resourceOptimizer = new ResourceOptimizer()
