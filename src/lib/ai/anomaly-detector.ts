import { supabase } from '../supabase'
import type { AnomalyDetection } from '../../types/analytics'

/**
 * Automated Anomaly Detection System
 * Detects unusual patterns and anomalies in project data
 */
export class AnomalyDetector {
  
  /**
   * Detect anomalies in a project
   */
  async detectProjectAnomalies(projectId: string): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = []
    
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*), project_metrics(*), time_logs(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return anomalies
      
      const metrics = project.project_metrics?.[0]
      const tasks = project.tasks || []
      const timeLogs = project.time_logs || []
      
      // Check various anomaly types
      anomalies.push(...await this.detectBudgetAnomalies(projectId, metrics))
      anomalies.push(...this.detectTimeAnomalies(projectId, tasks, timeLogs))
      anomalies.push(...this.detectVelocityAnomalies(projectId, tasks, metrics))
      anomalies.push(...this.detectQualityAnomalies(projectId, metrics))
      anomalies.push(...this.detectResourceAnomalies(projectId, tasks, timeLogs))
      anomalies.push(...this.detectScheduleAnomalies(projectId, project, tasks))
      
      // Save anomalies to database
      await this.saveAnomalies(anomalies)
      
    } catch (error) {
      console.error('Error detecting anomalies:', error)
    }
    
    return anomalies
  }
  
  /**
   * Detect budget anomalies
   */
  private async detectBudgetAnomalies(
    projectId: string,
    metrics: any
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = []
    
    if (!metrics) return anomalies
    
    // Get historical average budget spend rate
    const { data: historicalMetrics } = await supabase
      .from('project_metrics')
      .select('budget_spent, completion_percentage')
      .neq('project_id', projectId)
    
    if (!historicalMetrics || historicalMetrics.length === 0) return anomalies
    
    const avgHistoricalSpendRate = historicalMetrics.reduce((sum, m) => {
      return sum + (m.completion_percentage > 0 ? m.budget_spent / m.completion_percentage : 0)
    }, 0) / historicalMetrics.length
    
    const currentSpendRate = metrics.completion_percentage > 0 
      ? metrics.budget_spent / metrics.completion_percentage 
      : 0
    
    // Detect budget spike (spending much faster than historical average)
    if (currentSpendRate > avgHistoricalSpendRate * 1.5) {
      const deviation = ((currentSpendRate - avgHistoricalSpendRate) / avgHistoricalSpendRate) * 100
      
      anomalies.push({
        id: '',
        anomaly_type: 'budget_spike',
        project_id: projectId,
        detected_value: currentSpendRate,
        expected_value: avgHistoricalSpendRate,
        deviation_percentage: deviation,
        severity: deviation > 100 ? 'critical' : deviation > 50 ? 'high' : 'medium',
        description: `Budget burn rate is ${deviation.toFixed(1)}% higher than historical average. ` +
                    `Current: $${currentSpendRate.toFixed(0)} per % completion vs expected: $${avgHistoricalSpendRate.toFixed(0)}.`,
        recommended_action: 'Review recent expenses and implement cost controls immediately',
        status: 'open',
        detected_at: new Date().toISOString()
      })
    }
    
    // Detect unusual budget patterns
    const spendRate = (metrics.budget_spent / metrics.budget_allocated) * 100
    const completionRate = metrics.completion_percentage
    
    // Spending much faster than progress
    if (spendRate > completionRate + 30) {
      const deviation = spendRate - completionRate
      
      anomalies.push({
        id: '',
        anomaly_type: 'unusual_pattern',
        project_id: projectId,
        detected_value: spendRate,
        expected_value: completionRate,
        deviation_percentage: deviation,
        severity: 'high',
        description: `Unusual spending pattern detected: ${spendRate.toFixed(1)}% of budget spent but only ${completionRate.toFixed(1)}% complete. ` +
                    'This indicates cost inefficiency or scope issues.',
        recommended_action: 'Conduct immediate budget review and identify cost drivers',
        status: 'open',
        detected_at: new Date().toISOString()
      })
    }
    
    return anomalies
  }
  
  /**
   * Detect time-related anomalies
   */
  private detectTimeAnomalies(
    projectId: string,
    tasks: any[],
    timeLogs: any[]
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    
    // Calculate average time per task
    const completedTasks = tasks.filter(t => t.status === 'completed')
    
    const taskTimes = completedTasks.map(task => {
      const taskLogs = timeLogs.filter(log => log.task_id === task.id)
      return taskLogs.reduce((sum, log) => {
        if (!log.end_time) return sum
        const start = new Date(log.start_time)
        const end = new Date(log.end_time)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0)
    }).filter(t => t > 0)
    
    if (taskTimes.length === 0) return anomalies
    
    const avgTime = taskTimes.reduce((sum, t) => sum + t, 0) / taskTimes.length
    const stdDev = Math.sqrt(
      taskTimes.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / taskTimes.length
    )
    
    // Detect tasks taking unusually long
    completedTasks.forEach(task => {
      const taskLogs = timeLogs.filter(log => log.task_id === task.id)
      const taskTime = taskLogs.reduce((sum, log) => {
        if (!log.end_time) return sum
        const start = new Date(log.start_time)
        const end = new Date(log.end_time)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0)
      
      // Task took more than 2 standard deviations longer than average
      if (taskTime > avgTime + (2 * stdDev) && taskTime > avgTime * 2) {
        const deviation = ((taskTime - avgTime) / avgTime) * 100
        
        anomalies.push({
          id: '',
          anomaly_type: 'time_overrun',
          project_id: projectId,
          task_id: task.id,
          detected_value: taskTime,
          expected_value: avgTime,
          deviation_percentage: deviation,
          severity: deviation > 200 ? 'high' : 'medium',
          description: `Task "${task.name}" took ${taskTime.toFixed(1)} hours, ` +
                      `significantly longer than average (${avgTime.toFixed(1)} hours). ` +
                      `This is ${deviation.toFixed(1)}% above normal.`,
          recommended_action: 'Investigate complexity factors or skill gaps for similar tasks',
          status: 'open',
          detected_at: new Date().toISOString()
        })
      }
    })
    
    return anomalies
  }
  
  /**
   * Detect velocity anomalies
   */
  private detectVelocityAnomalies(
    projectId: string,
    tasks: any[],
    metrics: any
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    
    if (!metrics) return anomalies
    
    // Calculate weekly completion rates over time
    const completedTasks = tasks.filter(t => t.status === 'completed')
    
    // Group by week
    const weeklyCompletions: Record<string, number> = {}
    completedTasks.forEach(task => {
      const date = new Date(task.updated_at)
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      weeklyCompletions[weekKey] = (weeklyCompletions[weekKey] || 0) + 1
    })
    
    const weeks = Object.values(weeklyCompletions)
    if (weeks.length < 2) return anomalies
    
    const avgWeeklyVelocity = weeks.reduce((sum, w) => sum + w, 0) / weeks.length
    const currentVelocity = metrics.avg_team_velocity || 0
    
    // Detect sudden velocity drop
    if (currentVelocity < avgWeeklyVelocity * 0.5 && currentVelocity < 5) {
      const deviation = ((avgWeeklyVelocity - currentVelocity) / avgWeeklyVelocity) * 100
      
      anomalies.push({
        id: '',
        anomaly_type: 'velocity_drop',
        project_id: projectId,
        detected_value: currentVelocity,
        expected_value: avgWeeklyVelocity,
        deviation_percentage: deviation,
        severity: 'high',
        description: `Team velocity has dropped significantly to ${currentVelocity.toFixed(1)} tasks/week ` +
                    `from average of ${avgWeeklyVelocity.toFixed(1)} tasks/week. ` +
                    `This is a ${deviation.toFixed(1)}% decrease.`,
        recommended_action: 'Investigate team blockers, capacity issues, or morale problems',
        status: 'open',
        detected_at: new Date().toISOString()
      })
    }
    
    return anomalies
  }
  
  /**
   * Detect quality anomalies
   */
  private detectQualityAnomalies(projectId: string, metrics: any): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    
    if (!metrics) return anomalies
    
    // Detect sudden quality decline
    if (metrics.quality_score < 6.5) {
      const expectedQuality = 8.0 // Expected baseline
      const deviation = ((expectedQuality - metrics.quality_score) / expectedQuality) * 100
      
      anomalies.push({
        id: '',
        anomaly_type: 'quality_decline',
        project_id: projectId,
        detected_value: metrics.quality_score,
        expected_value: expectedQuality,
        deviation_percentage: deviation,
        severity: metrics.quality_score < 5.5 ? 'critical' : 'high',
        description: `Quality score has declined to ${metrics.quality_score}/10, ` +
                    `below acceptable threshold. Defect rate: ${metrics.defect_rate}%, ` +
                    `Rework rate: ${metrics.rework_rate}%.`,
        recommended_action: 'Implement immediate quality controls and review processes',
        status: 'open',
        detected_at: new Date().toISOString()
      })
    }
    
    // Detect high rework rate
    if (metrics.rework_rate > 15) {
      const expectedRework = 5.0
      const deviation = metrics.rework_rate - expectedRework
      
      anomalies.push({
        id: '',
        anomaly_type: 'quality_decline',
        project_id: projectId,
        detected_value: metrics.rework_rate,
        expected_value: expectedRework,
        deviation_percentage: (deviation / expectedRework) * 100,
        severity: metrics.rework_rate > 25 ? 'critical' : 'high',
        description: `Rework rate is ${metrics.rework_rate}%, significantly higher than acceptable ${expectedRework}%. ` +
                    'This indicates quality issues in initial work.',
        recommended_action: 'Review quality assurance processes and provide additional training',
        status: 'open',
        detected_at: new Date().toISOString()
      })
    }
    
    return anomalies
  }
  
  /**
   * Detect resource bottleneck anomalies
   */
  private detectResourceAnomalies(
    projectId: string,
    tasks: any[],
    timeLogs: any[]
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    
    // Analyze task distribution
    const assignedCounts: Record<string, number> = {}
    tasks.forEach(task => {
      if (task.assigned_to) {
        assignedCounts[task.assigned_to] = (assignedCounts[task.assigned_to] || 0) + 1
      }
    })
    
    const counts = Object.values(assignedCounts)
    if (counts.length < 2) return anomalies
    
    const avgTasks = counts.reduce((sum, c) => sum + c, 0) / counts.length
    const maxTasks = Math.max(...counts)
    
    // Detect severe imbalance
    if (maxTasks > avgTasks * 2.5) {
      const deviation = ((maxTasks - avgTasks) / avgTasks) * 100
      
      anomalies.push({
        id: '',
        anomaly_type: 'resource_bottleneck',
        project_id: projectId,
        detected_value: maxTasks,
        expected_value: avgTasks,
        deviation_percentage: deviation,
        severity: 'medium',
        description: `Severe workload imbalance detected. One team member has ${maxTasks} tasks ` +
                    `while average is ${avgTasks.toFixed(1)}. This creates a bottleneck.`,
        recommended_action: 'Redistribute tasks to balance workload across team',
        status: 'open',
        detected_at: new Date().toISOString()
      })
    }
    
    return anomalies
  }
  
  /**
   * Detect schedule slip anomalies
   */
  private detectScheduleAnomalies(
    projectId: string,
    project: any,
    tasks: any[]
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    
    const now = new Date()
    
    // Detect accumulating overdue tasks
    const overdueTasks = tasks.filter(t => {
      return t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
    })
    
    const overdueRatio = tasks.length > 0 ? overdueTasks.length / tasks.length : 0
    
    if (overdueRatio > 0.2) { // More than 20% tasks overdue
      anomalies.push({
        id: '',
        anomaly_type: 'schedule_slip',
        project_id: projectId,
        detected_value: overdueTasks.length,
        expected_value: 0,
        deviation_percentage: overdueRatio * 100,
        severity: overdueRatio > 0.4 ? 'critical' : 'high',
        description: `${overdueTasks.length} tasks (${(overdueRatio * 100).toFixed(1)}%) are overdue. ` +
                    'Project schedule is slipping significantly.',
        recommended_action: 'Reprioritize overdue tasks and add resources if needed',
        status: 'open',
        detected_at: new Date().toISOString()
      })
    }
    
    return anomalies
  }
  
  /**
   * Save anomalies to database
   */
  private async saveAnomalies(anomalies: AnomalyDetection[]): Promise<void> {
    try {
      for (const anomaly of anomalies) {
        // Check if similar anomaly already exists
        const { data: existing } = await supabase
          .from('anomaly_detections')
          .select('id')
          .eq('project_id', anomaly.project_id)
          .eq('anomaly_type', anomaly.anomaly_type)
          .eq('status', 'open')
          .maybeSingle()
        
        if (!existing) {
          // Insert new anomaly
          await supabase
            .from('anomaly_detections')
            .insert({
              anomaly_type: anomaly.anomaly_type,
              project_id: anomaly.project_id,
              task_id: anomaly.task_id,
              detected_value: anomaly.detected_value,
              expected_value: anomaly.expected_value,
              deviation_percentage: anomaly.deviation_percentage,
              severity: anomaly.severity,
              description: anomaly.description,
              recommended_action: anomaly.recommended_action,
              status: 'open'
            })
        }
      }
    } catch (error) {
      console.error('Error saving anomalies:', error)
    }
  }
  
  /**
   * Run anomaly detection for all active projects
   */
  async detectAllProjectAnomalies(): Promise<void> {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .in('status', ['in_progress'])
    
    if (!projects) return
    
    for (const project of projects) {
      await this.detectProjectAnomalies(project.id)
    }
  }
}

export const anomalyDetector = new AnomalyDetector()
