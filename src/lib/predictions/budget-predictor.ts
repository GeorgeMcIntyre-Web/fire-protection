import { supabase } from '../supabase'
import type { BudgetPrediction, PredictionFactor } from '../../types/analytics'

/**
 * Budget Overrun Predictor
 * Predicts probability of budget overruns and final project cost
 */
export class BudgetPredictor {
  
  /**
   * Predict budget outcome for a project
   */
  async predictBudgetOutcome(projectId: string): Promise<BudgetPrediction | null> {
    try {
      // Get project and metrics
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*), project_metrics(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return null
      
      const metrics = project.project_metrics?.[0]
      if (!metrics) return null
      
      // Get time logs for actual costs
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('*')
        .eq('project_id', projectId)
      
      // Calculate current burn rate
      const burnRate = this.calculateBurnRate(timeLogs || [], metrics)
      
      // Get historical budget data
      const historicalData = await this.getHistoricalBudgetData()
      
      // Calculate factors affecting budget
      const factors = this.calculateBudgetFactors(project, metrics, burnRate, historicalData)
      
      // Predict final cost
      const predictedFinalCost = this.predictFinalCost(metrics, burnRate, factors)
      
      // Calculate overrun probability
      const probabilityOverrun = this.calculateOverrunProbability(
        metrics.budget_allocated,
        predictedFinalCost,
        factors
      )
      
      // Determine if early warning needed
      const earlyWarning = this.shouldTriggerEarlyWarning(metrics, probabilityOverrun)
      
      // Generate cost-saving recommendations
      const recommendations = this.generateCostSavingRecommendations(factors, metrics, burnRate)
      
      const result: BudgetPrediction = {
        project_id: projectId,
        predicted_final_cost: predictedFinalCost,
        predicted_overrun: Math.max(0, predictedFinalCost - metrics.budget_allocated),
        probability_overrun: probabilityOverrun,
        early_warning: earlyWarning,
        factors: factors,
        cost_saving_recommendations: recommendations
      }
      
      return result
      
    } catch (error) {
      console.error('Error predicting budget:', error)
      return null
    }
  }
  
  /**
   * Calculate burn rate (cost per day)
   */
  private calculateBurnRate(timeLogs: any[], metrics: any): number {
    if (!timeLogs.length) return 0
    
    const hourlyRate = 75 // $75 per hour
    
    const totalHours = timeLogs.reduce((sum, log) => {
      if (!log.end_time) return sum
      const start = new Date(log.start_time)
      const end = new Date(log.end_time)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)
    
    const daysElapsed = metrics?.days_elapsed || 1
    
    return (totalHours * hourlyRate) / daysElapsed
  }
  
  /**
   * Get historical budget performance data
   */
  private async getHistoricalBudgetData(): Promise<any[]> {
    const { data: projects } = await supabase
      .from('projects')
      .select('*, project_metrics(*)')
      .eq('status', 'completed')
      .limit(20)
    
    if (!projects) return []
    
    return projects
      .filter((p: any) => p.project_metrics?.[0])
      .map((p: any) => {
        const metrics = p.project_metrics[0]
        return {
          budget_allocated: metrics.budget_allocated,
          budget_spent: metrics.budget_spent,
          variance: metrics.budget_spent - metrics.budget_allocated,
          variance_percentage: ((metrics.budget_spent - metrics.budget_allocated) / metrics.budget_allocated) * 100
        }
      })
  }
  
  /**
   * Calculate factors affecting budget
   */
  private calculateBudgetFactors(
    project: any,
    metrics: any,
    burnRate: number,
    historical: any[]
  ): PredictionFactor[] {
    const factors: PredictionFactor[] = []
    
    // Factor 1: Current Budget Health
    const budgetHealth = metrics.budget_health
    let healthImpact = 0
    if (budgetHealth === 'critical') healthImpact = -50
    else if (budgetHealth === 'warning') healthImpact = -25
    else healthImpact = 10
    
    factors.push({
      name: 'Budget Health',
      impact: healthImpact,
      description: budgetHealth === 'healthy'
        ? 'Budget is healthy with comfortable margin'
        : `Budget status is ${budgetHealth}`
    })
    
    // Factor 2: Burn Rate Trend
    const avgHistoricalBudget = historical.length > 0
      ? historical.reduce((sum, h) => sum + h.budget_spent, 0) / historical.length
      : metrics.budget_spent
    
    const daysRemaining = metrics.days_remaining || 30
    const projectedSpend = metrics.budget_spent + (burnRate * daysRemaining)
    const burnRateImpact = ((projectedSpend - avgHistoricalBudget) / avgHistoricalBudget) * -100
    
    factors.push({
      name: 'Burn Rate',
      impact: Math.round(burnRateImpact),
      description: burnRate > (avgHistoricalBudget / 30)
        ? 'Current spending rate is higher than historical average'
        : 'Current spending rate is sustainable'
    })
    
    // Factor 3: Scope Changes
    const tasks = project.tasks || []
    const recentTasks = tasks.filter((t: any) => {
      const created = new Date(t.created_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return created > thirtyDaysAgo
    }).length
    
    const scopeChangeImpact = (recentTasks / tasks.length) * -30
    
    factors.push({
      name: 'Scope Changes',
      impact: Math.round(scopeChangeImpact),
      description: recentTasks > tasks.length * 0.2
        ? 'Recent scope additions may increase costs'
        : 'Project scope is stable'
    })
    
    // Factor 4: Completion Progress
    const completionRate = metrics.completion_percentage
    const spendRate = (metrics.budget_spent / metrics.budget_allocated) * 100
    
    const progressAlignmentImpact = completionRate - spendRate
    
    factors.push({
      name: 'Progress vs Spend',
      impact: Math.round(progressAlignmentImpact),
      description: completionRate > spendRate
        ? 'Good value - more progress than spending'
        : 'Warning - spending faster than progress'
    })
    
    // Factor 5: Historical Variance
    const avgVariancePercentage = historical.length > 0
      ? historical.reduce((sum, h) => sum + (h.variance_percentage || 0), 0) / historical.length
      : 0
    
    const historicalImpact = avgVariancePercentage * -0.5
    
    factors.push({
      name: 'Historical Performance',
      impact: Math.round(historicalImpact),
      description: avgVariancePercentage > 10
        ? `Historical projects averaged ${avgVariancePercentage.toFixed(1)}% over budget`
        : 'Historical budget performance is good'
    })
    
    // Factor 6: Material Cost Volatility
    // In a real system, this would track material price changes
    const materialVolatility = Math.random() * 20 - 10 // Simulated
    
    factors.push({
      name: 'Material Costs',
      impact: Math.round(materialVolatility),
      description: materialVolatility > 5
        ? 'Material prices are increasing'
        : 'Material prices are stable'
    })
    
    return factors
  }
  
  /**
   * Predict final project cost
   */
  private predictFinalCost(metrics: any, burnRate: number, factors: PredictionFactor[]): number {
    const completionRate = metrics.completion_percentage
    
    if (completionRate === 0) {
      // No progress, use budget allocation
      return metrics.budget_allocated
    }
    
    // Linear projection
    const projectedCost = (metrics.budget_spent / completionRate) * 100
    
    // Apply factor adjustments
    let adjusted = projectedCost
    factors.forEach(factor => {
      const adjustment = (projectedCost * factor.impact) / 100
      adjusted += adjustment
    })
    
    // Add contingency based on project completion stage
    const contingencyRate = completionRate < 25 ? 0.15 : completionRate < 50 ? 0.10 : 0.05
    adjusted = adjusted * (1 + contingencyRate)
    
    return Math.round(adjusted)
  }
  
  /**
   * Calculate probability of budget overrun (0-100)
   */
  private calculateOverrunProbability(
    budgetAllocated: number,
    predictedCost: number,
    factors: PredictionFactor[]
  ): number {
    // Base probability based on predicted cost
    let probability = 0
    
    const overrunAmount = predictedCost - budgetAllocated
    const overrunPercentage = (overrunAmount / budgetAllocated) * 100
    
    if (overrunPercentage > 20) probability = 90
    else if (overrunPercentage > 10) probability = 70
    else if (overrunPercentage > 5) probability = 50
    else if (overrunPercentage > 0) probability = 30
    else probability = 10
    
    // Adjust based on factors
    const negativeFactors = factors.filter(f => f.impact < -10).length
    probability += negativeFactors * 5
    
    const positiveFactors = factors.filter(f => f.impact > 10).length
    probability -= positiveFactors * 5
    
    return Math.max(0, Math.min(100, probability))
  }
  
  /**
   * Determine if early warning should be triggered
   */
  private shouldTriggerEarlyWarning(metrics: any, probabilityOverrun: number): boolean {
    // Trigger if:
    // 1. High probability of overrun
    if (probabilityOverrun > 60) return true
    
    // 2. Budget health is critical
    if (metrics.budget_health === 'critical') return true
    
    // 3. More than 50% complete but budget health warning
    if (metrics.completion_percentage > 50 && metrics.budget_health === 'warning') return true
    
    // 4. Spending faster than progress
    const spendRate = (metrics.budget_spent / metrics.budget_allocated) * 100
    if (spendRate > metrics.completion_percentage + 10) return true
    
    return false
  }
  
  /**
   * Generate cost-saving recommendations
   */
  private generateCostSavingRecommendations(
    factors: PredictionFactor[],
    metrics: any,
    burnRate: number
  ): string[] {
    const recommendations: string[] = []
    
    factors.forEach(factor => {
      if (factor.impact < -15) {
        if (factor.name === 'Burn Rate') {
          recommendations.push('Reduce daily spending by optimizing resource allocation and eliminating non-essential activities')
        } else if (factor.name === 'Scope Changes') {
          recommendations.push('Implement strict change control process and evaluate ROI of all new scope additions')
        } else if (factor.name === 'Progress vs Spend') {
          recommendations.push('Accelerate task completion to align progress with spending, or reduce resource costs')
        } else if (factor.name === 'Material Costs') {
          recommendations.push('Lock in material prices with suppliers or seek alternative vendors')
        }
      }
    })
    
    // Budget health specific recommendations
    if (metrics.budget_health === 'warning' || metrics.budget_health === 'critical') {
      recommendations.push('Conduct immediate cost review meeting with stakeholders')
      recommendations.push('Consider reducing project scope or securing additional budget')
    }
    
    // Burn rate specific recommendations
    const dailyBudgetRate = metrics.budget_allocated / (metrics.days_elapsed + metrics.days_remaining || 1)
    if (burnRate > dailyBudgetRate * 1.2) {
      recommendations.push('Current spending rate is 20%+ over plan. Review team size and hourly rates')
    }
    
    // General recommendations
    recommendations.push('Order materials in bulk for upcoming projects to negotiate better rates')
    recommendations.push('Review task estimates and eliminate low-value activities')
    
    if (recommendations.length === 0) {
      recommendations.push('Budget is on track. Continue monitoring spending rates weekly')
    }
    
    return recommendations
  }
}

export const budgetPredictor = new BudgetPredictor()
