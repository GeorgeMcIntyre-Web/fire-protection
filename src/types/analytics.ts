// Analytics Types and Interfaces

export interface AnalyticsSnapshot {
  id: string
  snapshot_date: string
  project_id?: string
  
  // Performance KPIs
  total_projects: number
  active_projects: number
  completed_projects: number
  cancelled_projects: number
  
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  
  total_hours: number
  billable_hours: number
  
  // Budget & Cost KPIs
  total_budget: number
  spent_budget: number
  budget_variance: number
  
  // Team KPIs
  active_users: number
  avg_task_completion_time: number
  
  // Quality KPIs
  quality_score: number
  client_satisfaction: number
  
  created_at: string
}

export interface ProjectMetrics {
  id: string
  project_id: string
  
  // Progress metrics
  completion_percentage: number
  tasks_completed: number
  tasks_total: number
  
  // Time metrics
  estimated_hours: number
  actual_hours: number
  remaining_hours: number
  
  // Budget metrics
  budget_allocated: number
  budget_spent: number
  budget_remaining: number
  budget_health: 'healthy' | 'warning' | 'critical'
  
  // Schedule metrics
  days_remaining: number | null
  days_elapsed: number | null
  schedule_health: 'on-track' | 'at-risk' | 'delayed'
  predicted_completion_date: string | null
  
  // Risk metrics
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  
  // Team metrics
  team_size: number
  avg_team_velocity: number
  team_utilization: number
  
  // Quality metrics
  quality_score: number
  defect_rate: number
  rework_rate: number
  
  last_updated: string
  created_at: string
}

export interface AIInsight {
  id: string
  project_id?: string
  task_id?: string
  
  insight_type: 
    | 'risk_alert'
    | 'optimization'
    | 'recommendation'
    | 'prediction'
    | 'anomaly'
    | 'trend'
    | 'milestone_alert'
    | 'resource_alert'
    | 'budget_alert'
    | 'quality_alert'
  
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  title: string
  description: string
  impact?: string
  suggested_action?: string
  
  // AI metadata
  confidence_score: number // 0-100
  model_version?: string
  
  // Status tracking
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed'
  acknowledged_by?: string
  acknowledged_at?: string
  resolved_at?: string
  
  metadata?: Record<string, any>
  
  created_at: string
  updated_at: string
}

export interface TaskPrediction {
  id: string
  task_id: string
  project_id: string
  
  predicted_completion_date?: string
  predicted_hours?: number
  predicted_risk_score?: number
  
  priority_score: number
  suggested_priority?: 'low' | 'medium' | 'high' | 'critical'
  
  recommended_assignee?: string
  
  confidence_score: number
  model_version?: string
  
  created_at: string
  updated_at: string
}

export interface CustomReport {
  id: string
  name: string
  description?: string
  
  report_type: 'performance' | 'financial' | 'resource' | 'quality' | 'executive' | 'custom'
  
  config: {
    widgets: ReportWidget[]
    filters?: ReportFilters
    dateRange?: DateRange
  }
  
  schedule?: 'none' | 'daily' | 'weekly' | 'monthly'
  last_generated?: string
  next_scheduled?: string
  
  recipients?: string[]
  
  created_by: string
  is_public: boolean
  
  created_at: string
  updated_at: string
}

export interface ReportWidget {
  id: string
  type: 
    | 'kpi_card'
    | 'line_chart'
    | 'bar_chart'
    | 'pie_chart'
    | 'area_chart'
    | 'scatter_chart'
    | 'heatmap'
    | 'gauge'
    | 'table'
    | 'funnel'
  
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
}

export interface ReportFilters {
  projectIds?: string[]
  clientIds?: string[]
  statuses?: string[]
  priorities?: string[]
  assignees?: string[]
  tags?: string[]
}

export interface DateRange {
  start: string
  end: string
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

export interface AnomalyDetection {
  id: string
  
  anomaly_type:
    | 'budget_spike'
    | 'time_overrun'
    | 'velocity_drop'
    | 'quality_decline'
    | 'resource_bottleneck'
    | 'schedule_slip'
    | 'unusual_pattern'
  
  project_id?: string
  task_id?: string
  
  detected_value: number
  expected_value: number
  deviation_percentage: number
  
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  description: string
  recommended_action?: string
  
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  resolution_notes?: string
  
  detected_at: string
  resolved_at?: string
}

export interface MLModelMetrics {
  id: string
  
  model_name: string
  model_version: string
  
  // Performance metrics
  accuracy?: number
  precision_score?: number
  recall_score?: number
  f1_score?: number
  
  // Training metadata
  training_date?: string
  training_samples?: number
  validation_samples?: number
  
  // Model configuration
  hyperparameters?: Record<string, any>
  features_used?: string[]
  
  is_active: boolean
  
  created_at: string
}

// KPI Types
export interface KPI {
  label: string
  value: number | string
  change?: number // percentage change
  changeType?: 'increase' | 'decrease'
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'currency' | 'percentage' | 'duration'
  icon?: string
  color?: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  fill?: boolean
}

// Analytics Dashboard State
export interface AnalyticsDashboardState {
  kpis: KPI[]
  charts: {
    revenue: ChartData
    projectStatus: ChartData
    teamPerformance: ChartData
    budgetPerformance: ChartData
    taskCompletion: ChartData
  }
  insights: AIInsight[]
  anomalies: AnomalyDetection[]
  loading: boolean
  error?: string
}

// Prediction Results
export interface CompletionPrediction {
  project_id: string
  predicted_date: string
  confidence_interval: {
    optimistic: string  // 10% probability
    likely: string      // 50% probability
    pessimistic: string // 90% probability
  }
  confidence_score: number
  factors: PredictionFactor[]
  recommendations: string[]
}

export interface BudgetPrediction {
  project_id: string
  predicted_final_cost: number
  predicted_overrun: number
  probability_overrun: number
  early_warning: boolean
  factors: PredictionFactor[]
  cost_saving_recommendations: string[]
}

export interface RiskAssessment {
  project_id: string
  overall_risk_score: number // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_breakdown: {
    schedule_risk: number
    budget_risk: number
    quality_risk: number
    resource_risk: number
  }
  top_risks: RiskFactor[]
  mitigation_strategies: string[]
}

export interface PredictionFactor {
  name: string
  impact: number // -100 to 100
  description: string
}

export interface RiskFactor {
  category: string
  description: string
  likelihood: number // 0-100
  impact: number // 0-100
  risk_score: number // likelihood * impact
  mitigation?: string
}

// Resource Optimization
export interface ResourceOptimization {
  current_allocation: ResourceAllocation[]
  suggested_allocation: ResourceAllocation[]
  improvements: {
    reduced_delays: number // days
    cost_savings: number
    improved_utilization: number // percentage
  }
  recommendations: string[]
}

export interface ResourceAllocation {
  user_id: string
  user_name: string
  current_tasks: string[]
  suggested_tasks: string[]
  utilization: number // percentage
  skills: string[]
  availability: number // hours per week
}

// Export Options
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'google_sheets'
  includeCha rts: boolean
  includeDetails: boolean
  dateRange?: DateRange
  filters?: ReportFilters
}

export interface ExportResult {
  success: boolean
  url?: string
  filename?: string
  error?: string
}
