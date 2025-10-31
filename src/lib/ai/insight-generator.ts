import { supabase } from '../supabase'
import type { AIInsight } from '../../types/analytics'
import { completionPredictor } from '../predictions/completion-predictor'
import { budgetPredictor } from '../predictions/budget-predictor'
import { riskScorer } from '../predictions/risk-scorer'

/**
 * AI Insight Generator
 * Generates human-readable, actionable insights from project data and predictions
 */
export class InsightGenerator {
  
  /**
   * Generate insights for a project
   */
  async generateProjectInsights(projectId: string): Promise<AIInsight[]> {
    const insights: AIInsight[] = []
    
    try {
      // Get project data
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*), project_metrics(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return insights
      
      const metrics = project.project_metrics?.[0]
      const tasks = project.tasks || []
      
      // Generate various types of insights
      const completionInsights = await this.generateCompletionInsights(projectId, project, metrics)
      const budgetInsights = await this.generateBudgetInsights(projectId, metrics)
      const riskInsights = await this.generateRiskInsights(projectId, project, metrics, tasks)
      const performanceInsights = this.generatePerformanceInsights(project, metrics, tasks)
      const trendInsights = this.generateTrendInsights(project, metrics)
      
      insights.push(...completionInsights)
      insights.push(...budgetInsights)
      insights.push(...riskInsights)
      insights.push(...performanceInsights)
      insights.push(...trendInsights)
      
      // Save insights to database
      await this.saveInsights(insights)
      
    } catch (error) {
      console.error('Error generating insights:', error)
    }
    
    return insights
  }
  
  /**
   * Generate completion-related insights
   */
  private async generateCompletionInsights(
    projectId: string,
    project: any,
    metrics: any
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []
    
    try {
      const prediction = await completionPredictor.predictCompletionDate(projectId)
      
      if (prediction) {
        const likelyDate = new Date(prediction.predicted_date)
        const dueDate = project.due_date ? new Date(project.due_date) : null
        
        if (dueDate) {
          const daysDifference = Math.ceil(
            (likelyDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          
          if (daysDifference > 7) {
            // Project likely to be late
            insights.push({
              id: '',
              project_id: projectId,
              insight_type: 'prediction',
              severity: daysDifference > 14 ? 'high' : 'medium',
              title: 'Project Completion Delayed',
              description: `Project is predicted to complete ${daysDifference} days after the deadline on ${prediction.predicted_date}. ` +
                          `Main contributing factors: ${prediction.factors.slice(0, 2).map(f => f.name).join(', ')}.`,
              impact: `Potential impact: Client dissatisfaction, penalty clauses, resource reallocation conflicts.`,
              suggested_action: prediction.recommendations[0] || 'Review timeline and resources',
              confidence_score: prediction.confidence_score,
              model_version: '1.0',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          } else if (daysDifference < -7) {
            // Project likely to finish early
            insights.push({
              id: '',
              project_id: projectId,
              insight_type: 'recommendation',
              severity: 'low',
              title: 'Early Completion Opportunity',
              description: `Project is trending to complete ${Math.abs(daysDifference)} days ahead of schedule. ` +
                          `Consider leveraging this extra time for quality improvements or starting next phase early.`,
              suggested_action: 'Conduct thorough quality review or advance to next project phase',
              confidence_score: prediction.confidence_score,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        }
        
        // Check for negative factors
        const negativeFactors = prediction.factors.filter(f => f.impact < -15)
        if (negativeFactors.length > 0) {
          insights.push({
            id: '',
            project_id: projectId,
            insight_type: 'recommendation',
            severity: negativeFactors.length > 2 ? 'high' : 'medium',
            title: 'Multiple Factors Impacting Timeline',
            description: `${negativeFactors.length} factors are negatively impacting completion timeline: ` +
                        negativeFactors.map(f => f.name).join(', ') + '. ' +
                        negativeFactors[0].description,
            suggested_action: 'Address top blocking factors immediately',
            confidence_score: 85,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Error generating completion insights:', error)
    }
    
    return insights
  }
  
  /**
   * Generate budget-related insights
   */
  private async generateBudgetInsights(
    projectId: string,
    metrics: any
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []
    
    if (!metrics) return insights
    
    try {
      const prediction = await budgetPredictor.predictBudgetOutcome(projectId)
      
      if (prediction) {
        // Budget overrun warning
        if (prediction.probability_overrun > 60) {
          const overrunAmount = prediction.predicted_overrun
          const overrunPercentage = (overrunAmount / metrics.budget_allocated) * 100
          
          insights.push({
            id: '',
            project_id: projectId,
            insight_type: 'budget_alert',
            severity: prediction.probability_overrun > 80 ? 'critical' : 'high',
            title: 'High Probability of Budget Overrun',
            description: `Project has ${prediction.probability_overrun}% probability of exceeding budget. ` +
                        `Predicted overrun: $${overrunAmount.toLocaleString()} (${overrunPercentage.toFixed(1)}%). ` +
                        `Key factors: ${prediction.factors.slice(0, 2).map(f => f.name).join(', ')}.`,
            impact: `Financial impact: Additional $${overrunAmount.toLocaleString()} may be required`,
            suggested_action: prediction.cost_saving_recommendations[0] || 'Review and reduce spending immediately',
            confidence_score: 80,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
        
        // Early warning triggered
        if (prediction.early_warning) {
          insights.push({
            id: '',
            project_id: projectId,
            insight_type: 'budget_alert',
            severity: 'high',
            title: 'Budget Early Warning System Activated',
            description: 'Project budget health indicators have triggered early warning. ' +
                        'Immediate attention required to prevent budget overrun. ' +
                        `Current budget health: ${metrics.budget_health}.`,
            suggested_action: 'Schedule budget review meeting with stakeholders today',
            confidence_score: 90,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }
      
      // Good budget performance
      if (metrics.budget_health === 'healthy' && metrics.completion_percentage > 50) {
        const variance = ((metrics.budget_allocated - metrics.budget_spent) / metrics.budget_allocated) * 100
        
        if (variance > 15) {
          insights.push({
            id: '',
            project_id: projectId,
            insight_type: 'recommendation',
            severity: 'low',
            title: 'Excellent Budget Performance',
            description: `Project is ${variance.toFixed(1)}% under budget at ${metrics.completion_percentage.toFixed(0)}% completion. ` +
                        'Consider investing savings in quality improvements or additional features.',
            suggested_action: 'Review opportunities to enhance deliverables with remaining budget',
            confidence_score: 85,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }
      
    } catch (error) {
      console.error('Error generating budget insights:', error)
    }
    
    return insights
  }
  
  /**
   * Generate risk-related insights
   */
  private async generateRiskInsights(
    projectId: string,
    project: any,
    metrics: any,
    tasks: any[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []
    
    try {
      const riskAssessment = await riskScorer.assessProjectRisk(projectId)
      
      if (riskAssessment) {
        // Overall risk alert
        if (riskAssessment.risk_level === 'critical' || riskAssessment.risk_level === 'high') {
          insights.push({
            id: '',
            project_id: projectId,
            insight_type: 'risk_alert',
            severity: riskAssessment.risk_level,
            title: `${riskAssessment.risk_level.toUpperCase()} Risk Level Detected`,
            description: `Project risk score is ${riskAssessment.overall_risk_score}/100. ` +
                        `Primary risk areas: ${Object.entries(riskAssessment.risk_breakdown)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 2)
                          .map(([key, value]) => `${key.replace('_', ' ')} (${value})`)
                          .join(', ')}.`,
            impact: `Top risks: ${riskAssessment.top_risks.slice(0, 2).map(r => r.description).join('; ')}`,
            suggested_action: riskAssessment.mitigation_strategies[0] || 'Implement risk mitigation immediately',
            confidence_score: 85,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
        
        // Specific risk category alerts
        if (riskAssessment.risk_breakdown.schedule_risk > 70) {
          insights.push({
            id: '',
            project_id: projectId,
            insight_type: 'risk_alert',
            severity: 'high',
            title: 'Critical Schedule Risk',
            description: `Schedule risk score is ${riskAssessment.risk_breakdown.schedule_risk}/100. ` +
                        'Project timeline is in jeopardy.',
            suggested_action: 'Add resources or reduce scope to protect timeline',
            confidence_score: 90,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }
      
    } catch (error) {
      console.error('Error generating risk insights:', error)
    }
    
    return insights
  }
  
  /**
   * Generate performance insights
   */
  private generatePerformanceInsights(
    project: any,
    metrics: any,
    tasks: any[]
  ): AIInsight[] {
    const insights: AIInsight[] = []
    
    if (!metrics) return insights
    
    // Team productivity insight
    if (metrics.avg_team_velocity > 0) {
      const velocity = metrics.avg_team_velocity.toFixed(1)
      
      if (metrics.avg_team_velocity > 15) {
        insights.push({
          id: '',
          project_id: project.id,
          insight_type: 'trend',
          severity: 'low',
          title: 'Outstanding Team Performance',
          description: `Your team's velocity is ${velocity} tasks per week, significantly above average. ` +
                      `Team size: ${metrics.team_size}. Great job!`,
          suggested_action: 'Document and share successful practices with other teams',
          confidence_score: 95,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } else if (metrics.avg_team_velocity < 5) {
        insights.push({
          id: '',
          project_id: project.id,
          insight_type: 'recommendation',
          severity: 'medium',
          title: 'Low Team Velocity Detected',
          description: `Team velocity is ${velocity} tasks per week, below expected performance. ` +
                      'Consider investigating blockers or resource constraints.',
          suggested_action: 'Conduct team retrospective to identify and remove blockers',
          confidence_score: 85,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }
    
    // Quality insight
    if (metrics.quality_score < 7 || metrics.rework_rate > 10) {
      insights.push({
        id: '',
        project_id: project.id,
        insight_type: 'quality_alert',
        severity: 'medium',
        title: 'Quality Concerns Detected',
        description: `Quality score is ${metrics.quality_score}/10 with ${metrics.rework_rate}% rework rate. ` +
                    'Quality issues are affecting efficiency.',
        suggested_action: 'Implement quality gates and increase review frequency',
        confidence_score: 80,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Task completion milestone
    const completionPercentage = metrics.completion_percentage
    const milestones = [25, 50, 75, 90]
    
    milestones.forEach(milestone => {
      if (completionPercentage >= milestone && completionPercentage < milestone + 5) {
        insights.push({
          id: '',
          project_id: project.id,
          insight_type: 'milestone_alert',
          severity: 'low',
          title: `${milestone}% Project Milestone Reached`,
          description: `Congratulations! Project is ${completionPercentage.toFixed(1)}% complete. ` +
                      `${tasks.filter((t: any) => t.status === 'completed').length} of ${tasks.length} tasks completed.`,
          suggested_action: milestone === 50 ? 'Conduct mid-project review' : 'Keep up the momentum!',
          confidence_score: 100,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    })
    
    return insights
  }
  
  /**
   * Generate trend insights
   */
  private generateTrendInsights(project: any, metrics: any): AIInsight[] {
    const insights: AIInsight[] = []
    
    if (!metrics) return insights
    
    // Resource utilization trends
    if (metrics.team_utilization > 95) {
      insights.push({
        id: '',
        project_id: project.id,
        insight_type: 'resource_alert',
        severity: 'medium',
        title: 'Team Over-Utilization Warning',
        description: `Team utilization is at ${metrics.team_utilization}%, indicating potential burnout risk. ` +
                    'Sustained over-utilization can lead to quality issues and turnover.',
        impact: 'Risk of decreased productivity, quality issues, and team burnout',
        suggested_action: 'Add team members or extend timeline to reduce workload',
        confidence_score: 85,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } else if (metrics.team_utilization < 50) {
      insights.push({
        id: '',
        project_id: project.id,
        insight_type: 'optimization',
        severity: 'low',
        title: 'Team Under-Utilization Detected',
        description: `Team utilization is only ${metrics.team_utilization}%. ` +
                    'Resources could be better allocated or team size reduced.',
        suggested_action: 'Assign additional tasks or reallocate team members to other projects',
        confidence_score: 80,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    return insights
  }
  
  /**
   * Save insights to database
   */
  private async saveInsights(insights: AIInsight[]): Promise<void> {
    try {
      // Filter out duplicates by checking existing insights
      for (const insight of insights) {
        const { data: existing } = await supabase
          .from('ai_insights')
          .select('id')
          .eq('project_id', insight.project_id)
          .eq('title', insight.title)
          .eq('status', 'active')
          .single()
        
        if (!existing) {
          // Insert new insight
          await supabase
            .from('ai_insights')
            .insert({
              project_id: insight.project_id,
              task_id: insight.task_id,
              insight_type: insight.insight_type,
              severity: insight.severity,
              title: insight.title,
              description: insight.description,
              impact: insight.impact,
              suggested_action: insight.suggested_action,
              confidence_score: insight.confidence_score,
              model_version: insight.model_version,
              status: 'active'
            })
        }
      }
    } catch (error) {
      console.error('Error saving insights:', error)
    }
  }
  
  /**
   * Generate insights for all active projects
   */
  async generateAllProjectInsights(): Promise<void> {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .in('status', ['pending', 'in_progress'])
    
    if (!projects) return
    
    for (const project of projects) {
      await this.generateProjectInsights(project.id)
    }
  }
}

export const insightGenerator = new InsightGenerator()
