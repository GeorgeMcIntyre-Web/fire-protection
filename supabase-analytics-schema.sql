-- ============================================
-- ADVANCED ANALYTICS & AI FEATURES
-- Database Schema for Analytics System
-- ============================================

-- Create analytics_snapshots table for historical tracking
CREATE TABLE analytics_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Performance KPIs
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  cancelled_projects INTEGER DEFAULT 0,
  
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  
  total_hours DECIMAL(10,2) DEFAULT 0,
  billable_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Budget & Cost KPIs
  total_budget DECIMAL(12,2) DEFAULT 0,
  spent_budget DECIMAL(12,2) DEFAULT 0,
  budget_variance DECIMAL(12,2) DEFAULT 0,
  
  -- Team KPIs
  active_users INTEGER DEFAULT 0,
  avg_task_completion_time DECIMAL(10,2) DEFAULT 0,
  
  -- Quality KPIs
  quality_score DECIMAL(5,2) DEFAULT 0,
  client_satisfaction DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(snapshot_date, project_id)
);

-- Create project_metrics table for real-time metrics
CREATE TABLE project_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  
  -- Progress metrics
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,
  
  -- Time metrics
  estimated_hours DECIMAL(10,2) DEFAULT 0,
  actual_hours DECIMAL(10,2) DEFAULT 0,
  remaining_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Budget metrics
  budget_allocated DECIMAL(12,2) DEFAULT 0,
  budget_spent DECIMAL(12,2) DEFAULT 0,
  budget_remaining DECIMAL(12,2) DEFAULT 0,
  budget_health TEXT CHECK (budget_health IN ('healthy', 'warning', 'critical')),
  
  -- Schedule metrics
  days_remaining INTEGER,
  days_elapsed INTEGER,
  schedule_health TEXT CHECK (schedule_health IN ('on-track', 'at-risk', 'delayed')),
  predicted_completion_date DATE,
  
  -- Risk metrics
  risk_score DECIMAL(5,2) DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Team metrics
  team_size INTEGER DEFAULT 0,
  avg_team_velocity DECIMAL(5,2) DEFAULT 0,
  team_utilization DECIMAL(5,2) DEFAULT 0,
  
  -- Quality metrics
  quality_score DECIMAL(5,2) DEFAULT 0,
  defect_rate DECIMAL(5,2) DEFAULT 0,
  rework_rate DECIMAL(5,2) DEFAULT 0,
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_insights table for AI-generated recommendations
CREATE TABLE ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'risk_alert',
    'optimization',
    'recommendation',
    'prediction',
    'anomaly',
    'trend',
    'milestone_alert',
    'resource_alert',
    'budget_alert',
    'quality_alert'
  )),
  
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  suggested_action TEXT,
  
  -- AI metadata
  confidence_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  model_version TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB, -- Additional data specific to insight type
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_predictions table for ML predictions
CREATE TABLE task_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  predicted_completion_date DATE,
  predicted_hours DECIMAL(10,2),
  predicted_risk_score DECIMAL(5,2),
  
  priority_score DECIMAL(10,2), -- AI-calculated priority
  suggested_priority TEXT CHECK (suggested_priority IN ('low', 'medium', 'high', 'critical')),
  
  recommended_assignee UUID REFERENCES auth.users(id),
  
  confidence_score DECIMAL(5,2) DEFAULT 0,
  model_version TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(task_id)
);

-- Create custom_reports table for saved report configurations
CREATE TABLE custom_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  report_type TEXT NOT NULL CHECK (report_type IN (
    'performance',
    'financial',
    'resource',
    'quality',
    'executive',
    'custom'
  )),
  
  -- Report configuration (widget layout, filters, date ranges)
  config JSONB NOT NULL,
  
  -- Scheduling
  schedule TEXT CHECK (schedule IN ('none', 'daily', 'weekly', 'monthly')),
  last_generated TIMESTAMP WITH TIME ZONE,
  next_scheduled TIMESTAMP WITH TIME ZONE,
  
  -- Recipients for automated reports
  recipients TEXT[], -- email addresses
  
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anomaly_detections table for tracking detected anomalies
CREATE TABLE anomaly_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN (
    'budget_spike',
    'time_overrun',
    'velocity_drop',
    'quality_decline',
    'resource_bottleneck',
    'schedule_slip',
    'unusual_pattern'
  )),
  
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  detected_value DECIMAL(12,2),
  expected_value DECIMAL(12,2),
  deviation_percentage DECIMAL(5,2),
  
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  description TEXT NOT NULL,
  recommended_action TEXT,
  
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolution_notes TEXT,
  
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create ml_model_metrics table for tracking model performance
CREATE TABLE ml_model_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  
  -- Performance metrics
  accuracy DECIMAL(5,2),
  precision_score DECIMAL(5,2),
  recall_score DECIMAL(5,2),
  f1_score DECIMAL(5,2),
  
  -- Training metadata
  training_date TIMESTAMP WITH TIME ZONE,
  training_samples INTEGER,
  validation_samples INTEGER,
  
  -- Model configuration
  hyperparameters JSONB,
  features_used TEXT[],
  
  is_active BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all analytics tables
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view all analytics snapshots" ON analytics_snapshots FOR SELECT USING (true);
CREATE POLICY "System can insert analytics snapshots" ON analytics_snapshots FOR INSERT WITH CHECK (true);

-- RLS Policies for project_metrics
CREATE POLICY "Users can view all project metrics" ON project_metrics FOR SELECT USING (true);
CREATE POLICY "System can manage project metrics" ON project_metrics FOR ALL USING (true);

-- RLS Policies for ai_insights
CREATE POLICY "Users can view all AI insights" ON ai_insights FOR SELECT USING (true);
CREATE POLICY "Users can acknowledge insights" ON ai_insights FOR UPDATE USING (auth.uid() = acknowledged_by OR true);
CREATE POLICY "System can insert insights" ON ai_insights FOR INSERT WITH CHECK (true);

-- RLS Policies for task_predictions
CREATE POLICY "Users can view all task predictions" ON task_predictions FOR SELECT USING (true);
CREATE POLICY "System can manage predictions" ON task_predictions FOR ALL USING (true);

-- RLS Policies for custom_reports
CREATE POLICY "Users can view public reports" ON custom_reports FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can manage own reports" ON custom_reports FOR ALL USING (created_by = auth.uid());

-- RLS Policies for anomaly_detections
CREATE POLICY "Users can view all anomalies" ON anomaly_detections FOR SELECT USING (true);
CREATE POLICY "Users can update anomalies" ON anomaly_detections FOR UPDATE USING (true);
CREATE POLICY "System can insert anomalies" ON anomaly_detections FOR INSERT WITH CHECK (true);

-- RLS Policies for ml_model_metrics
CREATE POLICY "Users can view model metrics" ON ml_model_metrics FOR SELECT USING (true);
CREATE POLICY "Admins can manage models" ON ml_model_metrics FOR ALL USING (true); -- In production, restrict to admin role

-- Create indexes for performance
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX idx_analytics_snapshots_project ON analytics_snapshots(project_id);
CREATE INDEX idx_project_metrics_project ON project_metrics(project_id);
CREATE INDEX idx_ai_insights_project ON ai_insights(project_id);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_ai_insights_severity ON ai_insights(severity);
CREATE INDEX idx_task_predictions_task ON task_predictions(task_id);
CREATE INDEX idx_anomaly_detections_status ON anomaly_detections(status);
CREATE INDEX idx_anomaly_detections_project ON anomaly_detections(project_id);

-- Create updated_at triggers
CREATE TRIGGER update_project_metrics_updated_at BEFORE UPDATE ON project_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_predictions_updated_at BEFORE UPDATE ON task_predictions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON custom_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ANALYTICS HELPER FUNCTIONS
-- ============================================

-- Function to calculate project metrics
CREATE OR REPLACE FUNCTION calculate_project_metrics(p_project_id UUID)
RETURNS void AS $$
DECLARE
  v_total_tasks INTEGER;
  v_completed_tasks INTEGER;
  v_completion_pct DECIMAL(5,2);
  v_actual_hours DECIMAL(10,2);
BEGIN
  -- Calculate task metrics
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_tasks, v_completed_tasks
  FROM tasks WHERE project_id = p_project_id;
  
  v_completion_pct := CASE 
    WHEN v_total_tasks > 0 THEN (v_completed_tasks::DECIMAL / v_total_tasks) * 100
    ELSE 0
  END;
  
  -- Calculate time metrics
  SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 0)
  INTO v_actual_hours
  FROM time_logs WHERE project_id = p_project_id AND end_time IS NOT NULL;
  
  -- Upsert project metrics
  INSERT INTO project_metrics (
    project_id,
    completion_percentage,
    tasks_completed,
    tasks_total,
    actual_hours,
    last_updated
  ) VALUES (
    p_project_id,
    v_completion_pct,
    v_completed_tasks,
    v_total_tasks,
    v_actual_hours,
    NOW()
  )
  ON CONFLICT (project_id) DO UPDATE SET
    completion_percentage = v_completion_pct,
    tasks_completed = v_completed_tasks,
    tasks_total = v_total_tasks,
    actual_hours = v_actual_hours,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create daily analytics snapshot
CREATE OR REPLACE FUNCTION create_daily_snapshot()
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_snapshots (
    snapshot_date,
    project_id,
    total_projects,
    active_projects,
    completed_projects,
    cancelled_projects,
    total_tasks,
    completed_tasks,
    overdue_tasks,
    total_hours,
    active_users
  )
  SELECT 
    CURRENT_DATE,
    p.id,
    1,
    CASE WHEN p.status = 'in_progress' THEN 1 ELSE 0 END,
    CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN p.status = 'cancelled' THEN 1 ELSE 0 END,
    COALESCE(t.total_tasks, 0),
    COALESCE(t.completed_tasks, 0),
    COALESCE(t.overdue_tasks, 0),
    COALESCE(tl.total_hours, 0),
    COALESCE(u.active_users, 0)
  FROM projects p
  LEFT JOIN (
    SELECT 
      project_id,
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'completed') as overdue_tasks
    FROM tasks
    GROUP BY project_id
  ) t ON p.id = t.project_id
  LEFT JOIN (
    SELECT 
      project_id,
      SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) / 3600) as total_hours
    FROM time_logs
    WHERE DATE(start_time) = CURRENT_DATE
    GROUP BY project_id
  ) tl ON p.id = tl.project_id
  LEFT JOIN (
    SELECT 
      project_id,
      COUNT(DISTINCT user_id) as active_users
    FROM time_logs
    WHERE DATE(start_time) = CURRENT_DATE
    GROUP BY project_id
  ) u ON p.id = u.project_id
  ON CONFLICT (snapshot_date, project_id) DO UPDATE SET
    total_tasks = EXCLUDED.total_tasks,
    completed_tasks = EXCLUDED.completed_tasks,
    overdue_tasks = EXCLUDED.overdue_tasks,
    total_hours = EXCLUDED.total_hours,
    active_users = EXCLUDED.active_users;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ANALYTICS SCHEMA SETUP COMPLETE!
-- ============================================
