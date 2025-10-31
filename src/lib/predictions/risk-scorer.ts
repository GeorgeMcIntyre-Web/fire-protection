import { supabase } from '../supabase'
import type { RiskAssessment, RiskFactor } from '../../types/analytics'

/**
 * Risk Scoring System
 * Calculates comprehensive risk scores for projects
 */
export class RiskScorer {
  
  /**
   * Assess project risk
   */
  async assessProjectRisk(projectId: string): Promise<RiskAssessment | null> {
    try {
      // Get project data
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*), project_metrics(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return null
      
      const metrics = project.project_metrics?.[0]
      const tasks = project.tasks || []
      
      // Calculate risk breakdown
      const scheduleRisk = await this.calculateScheduleRisk(project, metrics, tasks)
      const budgetRisk = await this.calculateBudgetRisk(metrics)
      const qualityRisk = await this.calculateQualityRisk(project, tasks)
      const resourceRisk = await this.calculateResourceRisk(project, tasks, metrics)
      
      // Calculate overall risk score (weighted average)
      const overallRiskScore = 
        (scheduleRisk * 0.30) +
        (budgetRisk * 0.30) +
        (qualityRisk * 0.20) +
        (resourceRisk * 0.20)
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
      if (overallRiskScore >= 70) riskLevel = 'critical'
      else if (overallRiskScore >= 50) riskLevel = 'high'
      else if (overallRiskScore >= 30) riskLevel = 'medium'
      
      // Identify top risks
      const topRisks = await this.identifyTopRisks(project, metrics, tasks)
      
      // Generate mitigation strategies
      const mitigationStrategies = this.generateMitigationStrategies(topRisks, riskLevel)
      
      const result: RiskAssessment = {
        project_id: projectId,
        overall_risk_score: Math.round(overallRiskScore),
        risk_level: riskLevel,
        risk_breakdown: {
          schedule_risk: Math.round(scheduleRisk),
          budget_risk: Math.round(budgetRisk),
          quality_risk: Math.round(qualityRisk),
          resource_risk: Math.round(resourceRisk)
        },
        top_risks: topRisks,
        mitigation_strategies: mitigationStrategies
      }
      
      return result
      
    } catch (error) {
      console.error('Error assessing project risk:', error)
      return null
    }
  }
  
  /**
   * Calculate schedule risk (0-100)
   */
  private async calculateScheduleRisk(project: any, metrics: any, tasks: any[]): Promise<number> {
    let riskScore = 0
    
    // Factor 1: Days behind schedule
    if (metrics?.schedule_health === 'delayed') {
      riskScore += 40
    } else if (metrics?.schedule_health === 'at-risk') {
      riskScore += 20
    }
    
    // Factor 2: Completion rate trend
    const completionRate = metrics?.completion_percentage || 0
    const daysElapsed = metrics?.days_elapsed || 1
    const daysRemaining = metrics?.days_remaining || 30
    
    const expectedCompletion = (daysElapsed / (daysElapsed + daysRemaining)) * 100
    const completionGap = expectedCompletion - completionRate
    
    if (completionGap > 20) riskScore += 30
    else if (completionGap > 10) riskScore += 15
    
    // Factor 3: Overdue tasks
    const now = new Date()
    const overdueTasks = tasks.filter(t => {
      return t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
    }).length
    
    const overdueRatio = tasks.length > 0 ? overdueTasks / tasks.length : 0
    if (overdueRatio > 0.3) riskScore += 20
    else if (overdueRatio > 0.1) riskScore += 10
    
    // Factor 4: Upcoming critical deadlines
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const upcomingCriticalTasks = tasks.filter(t => {
      if (t.status === 'completed') return false
      if (!t.due_date) return false
      const dueDate = new Date(t.due_date)
      return dueDate <= sevenDaysFromNow && t.priority === 'high'
    }).length
    
    if (upcomingCriticalTasks > 5) riskScore += 15
    else if (upcomingCriticalTasks > 2) riskScore += 8
    
    return Math.min(100, riskScore)
  }
  
  /**
   * Calculate budget risk (0-100)
   */
  private async calculateBudgetRisk(metrics: any): Promise<number> {
    let riskScore = 0
    
    if (!metrics) return 0
    
    // Factor 1: Current budget health
    if (metrics.budget_health === 'critical') {
      riskScore += 40
    } else if (metrics.budget_health === 'warning') {
      riskScore += 20
    }
    
    // Factor 2: Budget variance
    const budgetVariance = metrics.budget_spent - metrics.budget_allocated
    const variancePercentage = (budgetVariance / metrics.budget_allocated) * 100
    
    if (variancePercentage > 20) riskScore += 30
    else if (variancePercentage > 10) riskScore += 20
    else if (variancePercentage > 0) riskScore += 10
    
    // Factor 3: Burn rate vs completion rate
    const spendRate = (metrics.budget_spent / metrics.budget_allocated) * 100
    const completionRate = metrics.completion_percentage
    
    const spendGap = spendRate - completionRate
    if (spendGap > 20) riskScore += 20
    else if (spendGap > 10) riskScore += 10
    
    // Factor 4: Budget remaining vs work remaining
    const budgetRemaining = metrics.budget_remaining
    const workRemaining = 100 - completionRate
    
    if (workRemaining > 20 && budgetRemaining < metrics.budget_allocated * 0.1) {
      riskScore += 15
    }
    
    return Math.min(100, riskScore)
  }
  
  /**
   * Calculate quality risk (0-100)
   */
  private async calculateQualityRisk(project: any, tasks: any[]): Promise<number> {
    let riskScore = 0
    
    // Factor 1: Rework rate
    const metrics = project.project_metrics?.[0]
    if (metrics) {
      const reworkRate = metrics.rework_rate || 0
      if (reworkRate > 15) riskScore += 30
      else if (reworkRate > 10) riskScore += 20
      else if (reworkRate > 5) riskScore += 10
    }
    
    // Factor 2: Task reopening rate
    // (In a real system, would track tasks that were completed then reopened)
    const reopenedTasks = 0 // Placeholder
    const reopenRate = tasks.length > 0 ? reopenedTasks / tasks.length : 0
    if (reopenRate > 0.1) riskScore += 20
    
    // Factor 3: High priority tasks overdue
    const now = new Date()
    const highPriorityOverdue = tasks.filter(t => {
      return t.priority === 'high' && 
             t.status !== 'completed' && 
             t.due_date && 
             new Date(t.due_date) < now
    }).length
    
    if (highPriorityOverdue > 3) riskScore += 25
    else if (highPriorityOverdue > 0) riskScore += 15
    
    // Factor 4: Defect rate
    if (metrics) {
      const defectRate = metrics.defect_rate || 0
      if (defectRate > 10) riskScore += 20
      else if (defectRate > 5) riskScore += 10
    }
    
    // Factor 5: Quality score trend
    if (metrics) {
      const qualityScore = metrics.quality_score || 0
      if (qualityScore < 6) riskScore += 15
      else if (qualityScore < 7.5) riskScore += 8
    }
    
    return Math.min(100, riskScore)
  }
  
  /**
   * Calculate resource risk (0-100)
   */
  private async calculateResourceRisk(project: any, tasks: any[], metrics: any): Promise<number> {
    let riskScore = 0
    
    // Factor 1: Team capacity
    const teamSize = metrics?.team_size || 0
    const optimalTeamSize = Math.ceil(tasks.length / 20)
    
    if (teamSize < optimalTeamSize * 0.5) riskScore += 30
    else if (teamSize < optimalTeamSize * 0.75) riskScore += 15
    
    // Factor 2: Team utilization
    const utilization = metrics?.team_utilization || 0
    if (utilization > 95) riskScore += 25 // Overworked team
    else if (utilization > 85) riskScore += 10
    else if (utilization < 50) riskScore += 15 // Underutilized
    
    // Factor 3: Unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assigned_to && t.status !== 'completed').length
    const unassignedRatio = tasks.length > 0 ? unassignedTasks / tasks.length : 0
    
    if (unassignedRatio > 0.3) riskScore += 20
    else if (unassignedRatio > 0.1) riskScore += 10
    
    // Factor 4: Task distribution imbalance
    const assignedCounts: Record<string, number> = {}
    tasks.forEach(t => {
      if (t.assigned_to) {
        assignedCounts[t.assigned_to] = (assignedCounts[t.assigned_to] || 0) + 1
      }
    })
    
    const taskCounts = Object.values(assignedCounts)
    if (taskCounts.length > 1) {
      const maxTasks = Math.max(...taskCounts)
      const avgTasks = taskCounts.reduce((sum, c) => sum + c, 0) / taskCounts.length
      
      const imbalance = (maxTasks - avgTasks) / avgTasks
      if (imbalance > 1.5) riskScore += 15 // One person has 150% more than average
      else if (imbalance > 1.0) riskScore += 8
    }
    
    // Factor 5: Skill availability (placeholder)
    // In a real system, would check if required skills are available
    const criticalSkillGap = false // Placeholder
    if (criticalSkillGap) riskScore += 20
    
    return Math.min(100, riskScore)
  }
  
  /**
   * Identify top risk factors
   */
  private async identifyTopRisks(project: any, metrics: any, tasks: any[]): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = []
    
    // Schedule risks
    if (metrics?.schedule_health === 'delayed') {
      risks.push({
        category: 'Schedule',
        description: 'Project is behind schedule',
        likelihood: 90,
        impact: 80,
        risk_score: 72,
        mitigation: 'Add resources, reduce scope, or extend deadline'
      })
    }
    
    const now = new Date()
    const overdueTasks = tasks.filter(t => {
      return t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
    }).length
    
    if (overdueTasks > 5) {
      risks.push({
        category: 'Schedule',
        description: `${overdueTasks} tasks are overdue`,
        likelihood: 85,
        impact: 70,
        risk_score: 59.5,
        mitigation: 'Prioritize overdue tasks and reallocate resources'
      })
    }
    
    // Budget risks
    if (metrics?.budget_health === 'critical') {
      risks.push({
        category: 'Budget',
        description: 'Budget has been exceeded',
        likelihood: 100,
        impact: 90,
        risk_score: 90,
        mitigation: 'Immediate cost reduction measures and stakeholder communication'
      })
    }
    
    const spendRate = metrics ? (metrics.budget_spent / metrics.budget_allocated) * 100 : 0
    const completionRate = metrics?.completion_percentage || 0
    
    if (spendRate > completionRate + 15) {
      risks.push({
        category: 'Budget',
        description: 'Spending faster than progress',
        likelihood: 80,
        impact: 75,
        risk_score: 60,
        mitigation: 'Review and optimize resource allocation'
      })
    }
    
    // Resource risks
    const unassignedTasks = tasks.filter(t => !t.assigned_to && t.status !== 'completed').length
    
    if (unassignedTasks > tasks.length * 0.2) {
      risks.push({
        category: 'Resource',
        description: `${unassignedTasks} tasks are unassigned`,
        likelihood: 70,
        impact: 65,
        risk_score: 45.5,
        mitigation: 'Assign tasks to available team members immediately'
      })
    }
    
    const teamSize = metrics?.team_size || 0
    if (teamSize < 2 && tasks.length > 30) {
      risks.push({
        category: 'Resource',
        description: 'Team size insufficient for workload',
        likelihood: 75,
        impact: 70,
        risk_score: 52.5,
        mitigation: 'Hire additional team members or contract resources'
      })
    }
    
    // Quality risks
    if (metrics?.rework_rate > 10) {
      risks.push({
        category: 'Quality',
        description: 'High rework rate affecting efficiency',
        likelihood: 80,
        impact: 60,
        risk_score: 48,
        mitigation: 'Implement quality checks and improve initial specifications'
      })
    }
    
    // Sort by risk score (likelihood * impact)
    risks.sort((a, b) => b.risk_score - a.risk_score)
    
    // Return top 5 risks
    return risks.slice(0, 5)
  }
  
  /**
   * Generate mitigation strategies
   */
  private generateMitigationStrategies(topRisks: RiskFactor[], riskLevel: string): string[] {
    const strategies: string[] = []
    
    // Add risk-specific mitigations
    topRisks.forEach(risk => {
      if (risk.mitigation) {
        strategies.push(risk.mitigation)
      }
    })
    
    // Add general strategies based on risk level
    if (riskLevel === 'critical') {
      strategies.push('Schedule immediate risk review meeting with all stakeholders')
      strategies.push('Implement daily standup meetings to monitor progress')
      strategies.push('Consider activating project contingency plans')
    } else if (riskLevel === 'high') {
      strategies.push('Increase monitoring frequency to weekly reviews')
      strategies.push('Document and communicate risks to stakeholders')
      strategies.push('Prepare contingency plans for top risks')
    } else if (riskLevel === 'medium') {
      strategies.push('Monitor identified risks during regular project meetings')
      strategies.push('Update risk register bi-weekly')
    } else {
      strategies.push('Continue monitoring standard risk indicators')
      strategies.push('Maintain current risk management practices')
    }
    
    // Remove duplicates
    return Array.from(new Set(strategies))
  }
}

export const riskScorer = new RiskScorer()
