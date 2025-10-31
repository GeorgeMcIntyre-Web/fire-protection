import { supabase } from '../supabase'
import type { 
  KPI, 
  ProjectMetrics, 
  AnalyticsSnapshot,
  ChartData
} from '../../types/analytics'

export class AnalyticsService {
  
  // ============================================
  // BUSINESS METRICS (40+ KPIs)
  // ============================================
  
  /**
   * Calculate all business KPIs for the dashboard
   */
  async calculateBusinessKPIs(dateRange?: { start: string; end: string }): Promise<KPI[]> {
    const kpis: KPI[] = []
    
    try {
      // Financial KPIs
      const financialKPIs = await this.calculateFinancialKPIs(dateRange)
      kpis.push(...financialKPIs)
      
      // Project Performance KPIs
      const projectKPIs = await this.calculateProjectKPIs(dateRange)
      kpis.push(...projectKPIs)
      
      // Team Performance KPIs
      const teamKPIs = await this.calculateTeamKPIs(dateRange)
      kpis.push(...teamKPIs)
      
      // Quality KPIs
      const qualityKPIs = await this.calculateQualityKPIs(dateRange)
      kpis.push(...qualityKPIs)
      
      // Operational KPIs
      const operationalKPIs = await this.calculateOperationalKPIs(dateRange)
      kpis.push(...operationalKPIs)
      
    } catch (error) {
      console.error('Error calculating KPIs:', error)
    }
    
    return kpis
  }
  
  /**
   * Financial KPIs (10 KPIs)
   */
  private async calculateFinancialKPIs(dateRange?: { start: string; end: string }): Promise<KPI[]> {
    const kpis: KPI[] = []
    
    // Get all projects with their metrics
    const { data: projects } = await supabase
      .from('projects')
      .select('*, project_metrics(*)')
      .order('created_at', { ascending: false })
    
    if (!projects) return kpis
    
    // 1. Total Revenue
    const totalRevenue = projects.reduce((sum, p: any) => {
      return sum + (p.project_metrics?.[0]?.budget_allocated || 0)
    }, 0)
    
    kpis.push({
      label: 'Total Revenue',
      value: totalRevenue,
      format: 'currency',
      icon: 'CurrencyDollarIcon',
      color: 'green'
    })
    
    // 2. Total Costs
    const totalCosts = projects.reduce((sum, p: any) => {
      return sum + (p.project_metrics?.[0]?.budget_spent || 0)
    }, 0)
    
    kpis.push({
      label: 'Total Costs',
      value: totalCosts,
      format: 'currency',
      icon: 'BanknotesIcon',
      color: 'red'
    })
    
    // 3. Profit Margin
    const profitMargin = totalRevenue > 0 
      ? ((totalRevenue - totalCosts) / totalRevenue) * 100 
      : 0
    
    kpis.push({
      label: 'Profit Margin',
      value: profitMargin.toFixed(1) + '%',
      format: 'percentage',
      trend: profitMargin > 20 ? 'up' : profitMargin > 10 ? 'stable' : 'down',
      color: profitMargin > 20 ? 'green' : 'yellow'
    })
    
    // 4. Revenue Per Project
    const activeProjects = projects.filter((p: any) => p.status === 'in_progress').length
    const revenuePerProject = activeProjects > 0 ? totalRevenue / activeProjects : 0
    
    kpis.push({
      label: 'Revenue Per Project',
      value: revenuePerProject,
      format: 'currency',
      icon: 'ChartBarIcon'
    })
    
    // 5. Average Project Value
    const avgProjectValue = projects.length > 0 ? totalRevenue / projects.length : 0
    
    kpis.push({
      label: 'Avg Project Value',
      value: avgProjectValue,
      format: 'currency',
      icon: 'CalculatorIcon'
    })
    
    // 6. Budget Variance
    const budgetVariance = totalRevenue - totalCosts
    
    kpis.push({
      label: 'Budget Variance',
      value: budgetVariance,
      format: 'currency',
      trend: budgetVariance > 0 ? 'up' : 'down',
      color: budgetVariance > 0 ? 'green' : 'red'
    })
    
    // 7. Gross Profit
    const grossProfit = totalRevenue - totalCosts
    
    kpis.push({
      label: 'Gross Profit',
      value: grossProfit,
      format: 'currency',
      color: 'green'
    })
    
    // 8. Cost Per Hour
    const { data: timeLogs } = await supabase
      .from('time_logs')
      .select('start_time, end_time')
      .not('end_time', 'is', null)
    
    const totalHours = timeLogs?.reduce((sum, log) => {
      const start = new Date(log.start_time)
      const end = new Date(log.end_time!)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0) || 0
    
    const costPerHour = totalHours > 0 ? totalCosts / totalHours : 0
    
    kpis.push({
      label: 'Cost Per Hour',
      value: costPerHour,
      format: 'currency',
      icon: 'ClockIcon'
    })
    
    // 9. Budget Utilization Rate
    const budgetUtilization = totalRevenue > 0 
      ? (totalCosts / totalRevenue) * 100 
      : 0
    
    kpis.push({
      label: 'Budget Utilization',
      value: budgetUtilization.toFixed(1) + '%',
      format: 'percentage',
      trend: budgetUtilization < 80 ? 'up' : budgetUtilization < 95 ? 'stable' : 'down'
    })
    
    // 10. ROI (Return on Investment)
    const roi = totalCosts > 0 
      ? ((totalRevenue - totalCosts) / totalCosts) * 100 
      : 0
    
    kpis.push({
      label: 'ROI',
      value: roi.toFixed(1) + '%',
      format: 'percentage',
      trend: roi > 20 ? 'up' : 'stable',
      color: 'green'
    })
    
    return kpis
  }
  
  /**
   * Project Performance KPIs (12 KPIs)
   */
  private async calculateProjectKPIs(dateRange?: { start: string; end: string }): Promise<KPI[]> {
    const kpis: KPI[] = []
    
    const { data: projects } = await supabase
      .from('projects')
      .select('*, project_metrics(*)')
    
    if (!projects) return kpis
    
    // 11. Total Projects
    kpis.push({
      label: 'Total Projects',
      value: projects.length,
      format: 'number',
      icon: 'FolderIcon'
    })
    
    // 12. Active Projects
    const activeProjects = projects.filter((p: any) => p.status === 'in_progress')
    kpis.push({
      label: 'Active Projects',
      value: activeProjects.length,
      format: 'number',
      icon: 'PlayIcon',
      color: 'blue'
    })
    
    // 13. Completed Projects
    const completedProjects = projects.filter((p: any) => p.status === 'completed')
    kpis.push({
      label: 'Completed Projects',
      value: completedProjects.length,
      format: 'number',
      icon: 'CheckCircleIcon',
      color: 'green'
    })
    
    // 14. Projects At Risk
    const projectsAtRisk = projects.filter((p: any) => {
      const metrics = p.project_metrics?.[0]
      return metrics?.risk_level === 'high' || metrics?.risk_level === 'critical'
    }).length
    
    kpis.push({
      label: 'Projects At Risk',
      value: projectsAtRisk,
      format: 'number',
      icon: 'ExclamationTriangleIcon',
      color: 'red'
    })
    
    // 15. On-Time Completion Rate
    const projectsWithMetrics = projects.filter((p: any) => p.project_metrics?.[0])
    const onTimeProjects = projectsWithMetrics.filter((p: any) => {
      return p.project_metrics[0].schedule_health === 'on-track'
    }).length
    
    const onTimeRate = projectsWithMetrics.length > 0 
      ? (onTimeProjects / projectsWithMetrics.length) * 100 
      : 0
    
    kpis.push({
      label: 'On-Time Rate',
      value: onTimeRate.toFixed(1) + '%',
      format: 'percentage',
      trend: onTimeRate > 80 ? 'up' : 'down',
      color: onTimeRate > 80 ? 'green' : 'yellow'
    })
    
    // 16. Average Project Duration
    const durations = completedProjects.map((p: any) => {
      const start = new Date(p.created_at)
      const end = new Date(p.updated_at)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    })
    
    const avgDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0
    
    kpis.push({
      label: 'Avg Project Duration',
      value: Math.round(avgDuration) + ' days',
      format: 'duration',
      icon: 'CalendarIcon'
    })
    
    // 17. Average Completion Percentage
    const avgCompletion = projectsWithMetrics.length > 0
      ? projectsWithMetrics.reduce((sum, p: any) => {
          return sum + (p.project_metrics[0].completion_percentage || 0)
        }, 0) / projectsWithMetrics.length
      : 0
    
    kpis.push({
      label: 'Avg Completion',
      value: avgCompletion.toFixed(1) + '%',
      format: 'percentage',
      icon: 'ChartPieIcon'
    })
    
    // 18. Project Success Rate
    const successRate = projects.length > 0 
      ? (completedProjects.length / projects.length) * 100 
      : 0
    
    kpis.push({
      label: 'Success Rate',
      value: successRate.toFixed(1) + '%',
      format: 'percentage',
      color: 'green'
    })
    
    // 19. Average Budget Variance
    const avgBudgetVariance = projectsWithMetrics.length > 0
      ? projectsWithMetrics.reduce((sum, p: any) => {
          const metrics = p.project_metrics[0]
          const variance = ((metrics.budget_allocated - metrics.budget_spent) / metrics.budget_allocated) * 100
          return sum + (variance || 0)
        }, 0) / projectsWithMetrics.length
      : 0
    
    kpis.push({
      label: 'Avg Budget Variance',
      value: avgBudgetVariance.toFixed(1) + '%',
      format: 'percentage',
      trend: avgBudgetVariance > 0 ? 'up' : 'down'
    })
    
    // 20. Projects Over Budget
    const overBudget = projectsWithMetrics.filter((p: any) => {
      return p.project_metrics[0].budget_health === 'critical'
    }).length
    
    kpis.push({
      label: 'Projects Over Budget',
      value: overBudget,
      format: 'number',
      color: 'red'
    })
    
    // 21. Projects Behind Schedule
    const behindSchedule = projectsWithMetrics.filter((p: any) => {
      return p.project_metrics[0].schedule_health === 'delayed'
    }).length
    
    kpis.push({
      label: 'Projects Delayed',
      value: behindSchedule,
      format: 'number',
      color: 'orange'
    })
    
    // 22. Average Risk Score
    const avgRiskScore = projectsWithMetrics.length > 0
      ? projectsWithMetrics.reduce((sum, p: any) => {
          return sum + (p.project_metrics[0].risk_score || 0)
        }, 0) / projectsWithMetrics.length
      : 0
    
    kpis.push({
      label: 'Avg Risk Score',
      value: avgRiskScore.toFixed(1),
      format: 'number',
      trend: avgRiskScore < 30 ? 'up' : avgRiskScore < 60 ? 'stable' : 'down',
      color: avgRiskScore < 30 ? 'green' : avgRiskScore < 60 ? 'yellow' : 'red'
    })
    
    return kpis
  }
  
  /**
   * Team Performance KPIs (10 KPIs)
   */
  private async calculateTeamKPIs(dateRange?: { start: string; end: string }): Promise<KPI[]> {
    const kpis: KPI[] = []
    
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
    
    const { data: timeLogs } = await supabase
      .from('time_logs')
      .select('*')
    
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
    
    if (!tasks || !users) return kpis
    
    // 23. Total Team Members
    kpis.push({
      label: 'Team Members',
      value: users.length,
      format: 'number',
      icon: 'UsersIcon'
    })
    
    // 24. Active Team Members (worked in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const activeUsers = new Set(
      timeLogs?.filter(log => new Date(log.created_at) > sevenDaysAgo)
        .map(log => log.user_id)
    ).size
    
    kpis.push({
      label: 'Active Members',
      value: activeUsers,
      format: 'number',
      icon: 'UserGroupIcon',
      color: 'blue'
    })
    
    // 25. Tasks Completed (Total)
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    kpis.push({
      label: 'Tasks Completed',
      value: completedTasks,
      format: 'number',
      icon: 'CheckBadgeIcon',
      color: 'green'
    })
    
    // 26. Tasks Per Day
    const daysActive = 30 // Last 30 days
    const tasksPerDay = completedTasks / daysActive
    
    kpis.push({
      label: 'Tasks Per Day',
      value: tasksPerDay.toFixed(1),
      format: 'number',
      icon: 'BoltIcon'
    })
    
    // 27. Average Time Per Task
    const completedTasksWithLogs = tasks.filter(t => t.status === 'completed')
    const taskHours = completedTasksWithLogs.map(task => {
      const logs = timeLogs?.filter(log => log.task_id === task.id) || []
      return logs.reduce((sum, log) => {
        if (!log.end_time) return sum
        const start = new Date(log.start_time)
        const end = new Date(log.end_time)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0)
    })
    
    const avgTimePerTask = taskHours.length > 0 
      ? taskHours.reduce((sum, h) => sum + h, 0) / taskHours.length 
      : 0
    
    kpis.push({
      label: 'Avg Time Per Task',
      value: avgTimePerTask.toFixed(1) + 'h',
      format: 'duration',
      icon: 'ClockIcon'
    })
    
    // 28. Team Utilization Rate
    const totalHours = timeLogs?.reduce((sum, log) => {
      if (!log.end_time) return sum
      const start = new Date(log.start_time)
      const end = new Date(log.end_time)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0) || 0
    
    const availableHours = activeUsers * 8 * daysActive // 8 hours per day
    const utilization = availableHours > 0 ? (totalHours / availableHours) * 100 : 0
    
    kpis.push({
      label: 'Team Utilization',
      value: utilization.toFixed(1) + '%',
      format: 'percentage',
      trend: utilization > 70 ? 'up' : 'stable'
    })
    
    // 29. Average Tasks Per Person
    const tasksPerPerson = users.length > 0 ? tasks.length / users.length : 0
    
    kpis.push({
      label: 'Tasks Per Person',
      value: tasksPerPerson.toFixed(1),
      format: 'number'
    })
    
    // 30. Team Velocity (tasks completed per week)
    const weeksActive = daysActive / 7
    const teamVelocity = completedTasks / weeksActive
    
    kpis.push({
      label: 'Team Velocity',
      value: teamVelocity.toFixed(1) + ' tasks/week',
      format: 'number',
      icon: 'RocketLaunchIcon',
      color: 'purple'
    })
    
    // 31. Overdue Tasks
    const now = new Date()
    const overdueTasks = tasks.filter(t => {
      return t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
    }).length
    
    kpis.push({
      label: 'Overdue Tasks',
      value: overdueTasks,
      format: 'number',
      color: 'red',
      icon: 'ExclamationCircleIcon'
    })
    
    // 32. Task Completion Rate
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
    
    kpis.push({
      label: 'Completion Rate',
      value: completionRate.toFixed(1) + '%',
      format: 'percentage',
      trend: completionRate > 80 ? 'up' : 'stable',
      color: completionRate > 80 ? 'green' : 'yellow'
    })
    
    return kpis
  }
  
  /**
   * Quality KPIs (5 KPIs)
   */
  private async calculateQualityKPIs(dateRange?: { start: string; end: string }): Promise<KPI[]> {
    const kpis: KPI[] = []
    
    const { data: projects } = await supabase
      .from('projects')
      .select('*, project_metrics(*)')
    
    if (!projects) return kpis
    
    // 33. Average Quality Score
    const projectsWithMetrics = projects.filter((p: any) => p.project_metrics?.[0])
    const avgQualityScore = projectsWithMetrics.length > 0
      ? projectsWithMetrics.reduce((sum, p: any) => {
          return sum + (p.project_metrics[0].quality_score || 0)
        }, 0) / projectsWithMetrics.length
      : 0
    
    kpis.push({
      label: 'Avg Quality Score',
      value: avgQualityScore.toFixed(1),
      format: 'number',
      trend: avgQualityScore > 8 ? 'up' : 'stable',
      color: 'green'
    })
    
    // 34. Average Defect Rate
    const avgDefectRate = projectsWithMetrics.length > 0
      ? projectsWithMetrics.reduce((sum, p: any) => {
          return sum + (p.project_metrics[0].defect_rate || 0)
        }, 0) / projectsWithMetrics.length
      : 0
    
    kpis.push({
      label: 'Defect Rate',
      value: avgDefectRate.toFixed(2) + '%',
      format: 'percentage',
      trend: avgDefectRate < 5 ? 'up' : 'down',
      color: avgDefectRate < 5 ? 'green' : 'yellow'
    })
    
    // 35. Average Rework Rate
    const avgReworkRate = projectsWithMetrics.length > 0
      ? projectsWithMetrics.reduce((sum, p: any) => {
          return sum + (p.project_metrics[0].rework_rate || 0)
        }, 0) / projectsWithMetrics.length
      : 0
    
    kpis.push({
      label: 'Rework Rate',
      value: avgReworkRate.toFixed(2) + '%',
      format: 'percentage',
      trend: avgReworkRate < 10 ? 'up' : 'down',
      color: avgReworkRate < 10 ? 'green' : 'red'
    })
    
    // 36. Client Satisfaction Score (placeholder - would come from surveys)
    const clientSatisfaction = 4.5 // Out of 5
    
    kpis.push({
      label: 'Client Satisfaction',
      value: clientSatisfaction.toFixed(1) + '/5',
      format: 'number',
      icon: 'StarIcon',
      color: 'yellow'
    })
    
    // 37. First-Time Success Rate
    const firstTimeSuccess = avgReworkRate > 0 ? (100 - avgReworkRate) : 100
    
    kpis.push({
      label: 'First-Time Success',
      value: firstTimeSuccess.toFixed(1) + '%',
      format: 'percentage',
      trend: firstTimeSuccess > 90 ? 'up' : 'stable',
      color: 'green'
    })
    
    return kpis
  }
  
  /**
   * Operational KPIs (5 KPIs)
   */
  private async calculateOperationalKPIs(dateRange?: { start: string; end: string }): Promise<KPI[]> {
    const kpis: KPI[] = []
    
    const { data: workDocs } = await supabase
      .from('work_documentation')
      .select('*')
    
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
    
    // 38. Total Work Documentation
    kpis.push({
      label: 'Work Documents',
      value: workDocs?.length || 0,
      format: 'number',
      icon: 'DocumentTextIcon'
    })
    
    // 39. Total Clients
    kpis.push({
      label: 'Total Clients',
      value: clients?.length || 0,
      format: 'number',
      icon: 'BuildingOfficeIcon'
    })
    
    // 40. Active Clients (with ongoing projects)
    const { data: activeProjectClients } = await supabase
      .from('projects')
      .select('client_id')
      .eq('status', 'in_progress')
    
    const activeClientCount = new Set(
      activeProjectClients?.map(p => p.client_id).filter(Boolean)
    ).size
    
    kpis.push({
      label: 'Active Clients',
      value: activeClientCount,
      format: 'number',
      color: 'blue'
    })
    
    // 41. Average Projects Per Client
    const { data: allProjects } = await supabase
      .from('projects')
      .select('client_id')
    
    const projectsPerClient = clients && clients.length > 0 
      ? (allProjects?.length || 0) / clients.length 
      : 0
    
    kpis.push({
      label: 'Projects Per Client',
      value: projectsPerClient.toFixed(1),
      format: 'number'
    })
    
    // 42. Response Time (placeholder - would come from communications)
    kpis.push({
      label: 'Avg Response Time',
      value: '2.5 hours',
      format: 'duration',
      icon: 'ClockIcon',
      color: 'green'
    })
    
    return kpis
  }
  
  // ============================================
  // PROJECT METRICS
  // ============================================
  
  /**
   * Calculate detailed metrics for a specific project
   */
  async calculateProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('*, tasks(*)')
        .eq('id', projectId)
        .single()
      
      if (!project) return null
      
      const tasks = project.tasks || []
      const completedTasks = tasks.filter((t: any) => t.status === 'completed')
      
      // Get time logs for this project
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('*')
        .eq('project_id', projectId)
      
      const actualHours = timeLogs?.reduce((sum, log) => {
        if (!log.end_time) return sum
        const start = new Date(log.start_time)
        const end = new Date(log.end_time)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0) || 0
      
      // Calculate metrics
      const completionPercentage = tasks.length > 0 
        ? (completedTasks.length / tasks.length) * 100 
        : 0
      
      const estimatedHours = tasks.length * 8 // Estimate 8 hours per task
      const remainingHours = Math.max(0, estimatedHours - actualHours)
      
      // Budget metrics (placeholder - would come from actual budget data)
      const budgetAllocated = 50000
      const budgetSpent = actualHours * 75 // $75 per hour
      const budgetRemaining = budgetAllocated - budgetSpent
      
      let budgetHealth: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (budgetSpent > budgetAllocated) budgetHealth = 'critical'
      else if (budgetSpent > budgetAllocated * 0.9) budgetHealth = 'warning'
      
      // Schedule metrics
      const dueDate = project.due_date ? new Date(project.due_date) : null
      const now = new Date()
      const createdDate = new Date(project.created_at)
      
      const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
      const daysElapsed = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      
      let scheduleHealth: 'on-track' | 'at-risk' | 'delayed' = 'on-track'
      if (daysRemaining !== null) {
        if (completionPercentage < 50 && daysRemaining < 7) scheduleHealth = 'delayed'
        else if (completionPercentage < 75 && daysRemaining < 14) scheduleHealth = 'at-risk'
      }
      
      // Risk score (0-100)
      let riskScore = 0
      if (scheduleHealth === 'delayed') riskScore += 30
      else if (scheduleHealth === 'at-risk') riskScore += 15
      if (budgetHealth === 'critical') riskScore += 30
      else if (budgetHealth === 'warning') riskScore += 15
      if (completionPercentage < 20 && daysElapsed > 30) riskScore += 20
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
      if (riskScore >= 70) riskLevel = 'critical'
      else if (riskScore >= 50) riskLevel = 'high'
      else if (riskScore >= 30) riskLevel = 'medium'
      
      // Team metrics
      const uniqueAssignees = new Set(tasks.map((t: any) => t.assigned_to).filter(Boolean))
      const teamSize = uniqueAssignees.size
      
      const metrics: ProjectMetrics = {
        id: '',
        project_id: projectId,
        completion_percentage: completionPercentage,
        tasks_completed: completedTasks.length,
        tasks_total: tasks.length,
        estimated_hours: estimatedHours,
        actual_hours: actualHours,
        remaining_hours: remainingHours,
        budget_allocated: budgetAllocated,
        budget_spent: budgetSpent,
        budget_remaining: budgetRemaining,
        budget_health: budgetHealth,
        days_remaining: daysRemaining,
        days_elapsed: daysElapsed,
        schedule_health: scheduleHealth,
        predicted_completion_date: null,
        risk_score: riskScore,
        risk_level: riskLevel,
        team_size: teamSize,
        avg_team_velocity: completedTasks.length / Math.max(1, daysElapsed / 7),
        team_utilization: 0,
        quality_score: 8.5,
        defect_rate: 2.5,
        rework_rate: 5.0,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      return metrics
      
    } catch (error) {
      console.error('Error calculating project metrics:', error)
      return null
    }
  }
  
  /**
   * Save project metrics to database
   */
  async saveProjectMetrics(metrics: Partial<ProjectMetrics>): Promise<void> {
    try {
      await supabase
        .from('project_metrics')
        .upsert(metrics, { onConflict: 'project_id' })
    } catch (error) {
      console.error('Error saving project metrics:', error)
    }
  }
  
  // ============================================
  // CHART DATA
  // ============================================
  
  /**
   * Get revenue trend chart data
   */
  async getRevenueTrendData(months: number = 12): Promise<ChartData> {
    // This would query analytics_snapshots table for historical data
    const labels: string[] = []
    const revenue: number[] = []
    const costs: number[] = []
    
    // Generate last N months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
      
      // Placeholder data - would come from analytics_snapshots
      revenue.push(Math.random() * 100000 + 50000)
      costs.push(Math.random() * 80000 + 30000)
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenue,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true
        },
        {
          label: 'Costs',
          data: costs,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true
        }
      ]
    }
  }
  
  /**
   * Get project status distribution chart data
   */
  async getProjectStatusData(): Promise<ChartData> {
    const { data: projects } = await supabase
      .from('projects')
      .select('status')
    
    const statusCounts: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    }
    
    projects?.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    })
    
    return {
      labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      datasets: [{
        label: 'Projects',
        data: [
          statusCounts.pending,
          statusCounts.in_progress,
          statusCounts.completed,
          statusCounts.cancelled
        ],
        backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#ef4444']
      }]
    }
  }
  
  /**
   * Get team performance chart data
   */
  async getTeamPerformanceData(): Promise<ChartData> {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name')
    
    const { data: tasks } = await supabase
      .from('tasks')
      .select('assigned_to, status')
    
    const userTaskCounts: Record<string, { name: string; completed: number; total: number }> = {}
    
    users?.forEach(user => {
      const userTasks = tasks?.filter(t => t.assigned_to === user.id) || []
      const completed = userTasks.filter(t => t.status === 'completed').length
      
      userTaskCounts[user.id] = {
        name: user.full_name || 'Unknown',
        completed,
        total: userTasks.length
      }
    })
    
    const labels = Object.values(userTaskCounts).map(u => u.name).slice(0, 10)
    const completedData = Object.values(userTaskCounts).map(u => u.completed).slice(0, 10)
    const pendingData = Object.values(userTaskCounts).map(u => u.total - u.completed).slice(0, 10)
    
    return {
      labels,
      datasets: [
        {
          label: 'Completed',
          data: completedData,
          backgroundColor: '#10b981'
        },
        {
          label: 'Pending',
          data: pendingData,
          backgroundColor: '#fbbf24'
        }
      ]
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
