import { supabase } from '../supabase'
import type { CompletionPrediction, PredictionFactor } from '../../types/analytics'

/**
 * Completion Date Predictor
 * Predicts when a project will be completed based on historical data and current progress
 */
export class CompletionPredictor {
  
  /**
   * Predict completion date for a project
   */
  async predictCompletionDate(projectId: string): Promise<CompletionPrediction | null> {
    try {
      // Get project details
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*), project_metrics(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return null
      
      const tasks = project.tasks || []
      const metrics = project.project_metrics?.[0]
      
      // Get historical completion data from similar projects
      const historicalData = await this.getHistoricalCompletionData(project)
      
      // Calculate factors affecting completion
      const factors = this.calculateFactors(project, tasks, metrics, historicalData)
      
      // Calculate base prediction
      const baseDays = this.calculateBasePrediction(tasks, metrics, historicalData)
      
      // Apply factor adjustments
      const adjustedDays = this.applyFactorAdjustments(baseDays, factors)
      
      // Calculate confidence intervals
      const predictions = this.calculateConfidenceIntervals(adjustedDays, factors)
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(factors, predictions)
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(historicalData, factors)
      
      const result: CompletionPrediction = {
        project_id: projectId,
        predicted_date: predictions.likely,
        confidence_interval: predictions,
        confidence_score: confidenceScore,
        factors: factors,
        recommendations: recommendations
      }
      
      return result
      
    } catch (error) {
      console.error('Error predicting completion date:', error)
      return null
    }
  }
  
  /**
   * Get historical completion data from similar projects
   */
  private async getHistoricalCompletionData(project: any): Promise<any[]> {
    // Query completed projects with similar characteristics
    const { data: historicalProjects } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .eq('status', 'completed')
      .limit(20)
    
    if (!historicalProjects) return []
    
    return historicalProjects.map(p => {
      const tasks = p.tasks || []
      const startDate = new Date(p.created_at)
      const endDate = new Date(p.updated_at)
      const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      
      return {
        project_id: p.id,
        task_count: tasks.length,
        duration_days: durationDays,
        completion_rate: tasks.filter((t: any) => t.status === 'completed').length / tasks.length
      }
    })
  }
  
  /**
   * Calculate factors affecting completion
   */
  private calculateFactors(
    project: any, 
    tasks: any[], 
    metrics: any,
    historical: any[]
  ): PredictionFactor[] {
    const factors: PredictionFactor[] = []
    
    // Factor 1: Current Progress Rate
    const completionRate = metrics?.completion_percentage || 0
    const daysElapsed = metrics?.days_elapsed || 1
    const progressRate = completionRate / daysElapsed
    
    const avgHistoricalRate = historical.length > 0
      ? historical.reduce((sum, h) => sum + (h.completion_rate / h.duration_days) * 100, 0) / historical.length
      : progressRate
    
    const progressImpact = ((progressRate - avgHistoricalRate) / avgHistoricalRate) * 100
    
    factors.push({
      name: 'Progress Rate',
      impact: Math.round(progressImpact),
      description: progressRate > avgHistoricalRate
        ? 'Project is progressing faster than historical average'
        : 'Project is progressing slower than historical average'
    })
    
    // Factor 2: Team Capacity
    const teamSize = metrics?.team_size || 1
    const optimalTeamSize = Math.ceil(tasks.length / 20) // 1 person per 20 tasks
    const capacityImpact = ((teamSize - optimalTeamSize) / optimalTeamSize) * 50
    
    factors.push({
      name: 'Team Capacity',
      impact: Math.round(capacityImpact),
      description: teamSize >= optimalTeamSize
        ? 'Team size is adequate for project scope'
        : 'Team may be understaffed for project requirements'
    })
    
    // Factor 3: Task Complexity
    const highPriorityTasks = tasks.filter((t: any) => t.priority === 'high').length
    const complexityRatio = tasks.length > 0 ? highPriorityTasks / tasks.length : 0
    const complexityImpact = complexityRatio * -30 // High complexity slows down
    
    factors.push({
      name: 'Task Complexity',
      impact: Math.round(complexityImpact),
      description: complexityRatio > 0.3
        ? 'High proportion of complex tasks may extend timeline'
        : 'Task complexity is manageable'
    })
    
    // Factor 4: Schedule Health
    const scheduleHealth = metrics?.schedule_health || 'on-track'
    let scheduleImpact = 0
    if (scheduleHealth === 'delayed') scheduleImpact = -40
    else if (scheduleHealth === 'at-risk') scheduleImpact = -20
    
    factors.push({
      name: 'Schedule Status',
      impact: scheduleImpact,
      description: scheduleHealth === 'on-track'
        ? 'Project is on schedule'
        : `Project is ${scheduleHealth}`
    })
    
    // Factor 5: Historical Performance
    const avgHistoricalDuration = historical.length > 0
      ? historical.reduce((sum, h) => sum + h.duration_days, 0) / historical.length
      : daysElapsed
    
    const similarTaskCount = historical.filter(h => 
      Math.abs(h.task_count - tasks.length) < tasks.length * 0.2
    )
    
    const historicalImpact = similarTaskCount.length > 3 ? 20 : -10
    
    factors.push({
      name: 'Historical Data',
      impact: historicalImpact,
      description: similarTaskCount.length > 3
        ? `Based on ${similarTaskCount.length} similar completed projects`
        : 'Limited historical data for similar projects'
    })
    
    // Factor 6: Season/Time of Year (fire protection work affected by weather)
    const month = new Date().getMonth()
    const isWinterSeason = month >= 10 || month <= 2 // Nov-Feb
    const seasonImpact = isWinterSeason ? -15 : 5
    
    factors.push({
      name: 'Seasonal Factors',
      impact: seasonImpact,
      description: isWinterSeason
        ? 'Winter weather may cause delays in fire protection installations'
        : 'Favorable season for fire protection work'
    })
    
    return factors
  }
  
  /**
   * Calculate base prediction without adjustments
   */
  private calculateBasePrediction(tasks: any[], metrics: any, historical: any[]): number {
    const completionRate = metrics?.completion_percentage || 0
    const daysElapsed = metrics?.days_elapsed || 1
    
    if (completionRate === 0) {
      // No progress yet, use historical average
      const avgDuration = historical.length > 0
        ? historical.reduce((sum, h) => sum + h.duration_days, 0) / historical.length
        : tasks.length * 1.5 // Default: 1.5 days per task
      
      return avgDuration
    }
    
    // Linear projection based on current progress
    const projectedTotalDays = (daysElapsed / completionRate) * 100
    const remainingDays = projectedTotalDays - daysElapsed
    
    return Math.max(0, remainingDays)
  }
  
  /**
   * Apply factor adjustments to base prediction
   */
  private applyFactorAdjustments(baseDays: number, factors: PredictionFactor[]): number {
    let adjusted = baseDays
    
    factors.forEach(factor => {
      const adjustment = (baseDays * factor.impact) / 100
      adjusted += adjustment
    })
    
    return Math.max(1, adjusted) // At least 1 day
  }
  
  /**
   * Calculate confidence intervals
   */
  private calculateConfidenceIntervals(baseDays: number, factors: PredictionFactor[]): {
    optimistic: string
    likely: string
    pessimistic: string
  } {
    const today = new Date()
    
    // Optimistic: 10% faster than predicted
    const optimisticDays = Math.ceil(baseDays * 0.9)
    const optimisticDate = new Date(today)
    optimisticDate.setDate(optimisticDate.getDate() + optimisticDays)
    
    // Likely: Base prediction
    const likelyDays = Math.ceil(baseDays)
    const likelyDate = new Date(today)
    likelyDate.setDate(likelyDate.getDate() + likelyDays)
    
    // Pessimistic: 25% slower (considering risks)
    const pessimisticDays = Math.ceil(baseDays * 1.25)
    const pessimisticDate = new Date(today)
    pessimisticDate.setDate(pessimisticDate.getDate() + pessimisticDays)
    
    return {
      optimistic: optimisticDate.toISOString().split('T')[0],
      likely: likelyDate.toISOString().split('T')[0],
      pessimistic: pessimisticDate.toISOString().split('T')[0]
    }
  }
  
  /**
   * Generate recommendations based on factors
   */
  private generateRecommendations(factors: PredictionFactor[], predictions: any): string[] {
    const recommendations: string[] = []
    
    factors.forEach(factor => {
      if (factor.impact < -20) {
        if (factor.name === 'Progress Rate') {
          recommendations.push('Consider increasing team size or reducing scope to improve progress rate')
        } else if (factor.name === 'Team Capacity') {
          recommendations.push('Add more team members or redistribute tasks to improve capacity')
        } else if (factor.name === 'Task Complexity') {
          recommendations.push('Break down complex tasks into smaller, manageable subtasks')
        } else if (factor.name === 'Schedule Status') {
          recommendations.push('Review and adjust project timeline or add resources to get back on track')
        } else if (factor.name === 'Seasonal Factors') {
          recommendations.push('Plan for weather delays and schedule indoor work during winter months')
        }
      }
    })
    
    // Calculate days until predicted completion
    const today = new Date()
    const likelyDate = new Date(predictions.likely)
    const daysUntilCompletion = Math.ceil((likelyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilCompletion > 60) {
      recommendations.push('Project timeline is extended. Consider phased delivery approach')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Project is on track. Maintain current pace and resource allocation')
    }
    
    return recommendations
  }
  
  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidenceScore(historical: any[], factors: PredictionFactor[]): number {
    let score = 50 // Base confidence
    
    // More historical data = higher confidence
    if (historical.length > 10) score += 20
    else if (historical.length > 5) score += 10
    else score -= 10
    
    // Fewer extreme factors = higher confidence
    const extremeFactors = factors.filter(f => Math.abs(f.impact) > 30).length
    score -= extremeFactors * 5
    
    // Positive factors increase confidence
    const positiveFactors = factors.filter(f => f.impact > 10).length
    score += positiveFactors * 5
    
    return Math.max(0, Math.min(100, score))
  }
}

export const completionPredictor = new CompletionPredictor()
