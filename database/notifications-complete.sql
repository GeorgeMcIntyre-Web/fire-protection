-- ============================================
-- COMPREHENSIVE NOTIFICATION SYSTEM
-- Email Notifications & Realtime Updates
-- ============================================

-- Create notifications table with full feature set
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'task_deadline', 'budget_alert', 'project_update', 'system_alert'
  )),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT, -- Rich HTML email content
  related_entity_type TEXT, -- 'task', 'project', 'client', 'document'
  related_entity_id UUID,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Email notification preferences
  email_enabled BOOLEAN DEFAULT true,
  task_deadline_email BOOLEAN DEFAULT true,
  budget_alert_email BOOLEAN DEFAULT true,
  project_update_email BOOLEAN DEFAULT true,
  system_alert_email BOOLEAN DEFAULT true,
  
  -- In-app notification preferences
  in_app_enabled BOOLEAN DEFAULT true,
  task_deadline_in_app BOOLEAN DEFAULT true,
  budget_alert_in_app BOOLEAN DEFAULT true,
  project_update_in_app BOOLEAN DEFAULT true,
  system_alert_in_app BOOLEAN DEFAULT true,
  
  -- Digest preferences
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  digest_day TEXT DEFAULT 'monday' CHECK (digest_day IN (
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  )),
  digest_time TIME DEFAULT '09:00:00',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  quiet_hours_timezone TEXT DEFAULT 'Africa/Johannesburg',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification analytics table
CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'
  )),
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user presence table for online tracking
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification digest queue
CREATE TABLE IF NOT EXISTS notification_digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_type TEXT NOT NULL CHECK (digest_type IN ('daily', 'weekly')),
  notification_ids UUID[] DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_digest_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notification_analytics
CREATE POLICY "Service role can manage analytics"
  ON notification_analytics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can view analytics for their notifications"
  ON notification_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.id = notification_analytics.notification_id
      AND n.recipient_id = auth.uid()
    )
  );

-- RLS Policies for user_presence
CREATE POLICY "Users can view all presence"
  ON user_presence FOR SELECT
  USING (true);

CREATE POLICY "Users can update own presence"
  ON user_presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presence"
  ON user_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_digest_queue
CREATE POLICY "Service role can manage digest queue"
  ON notification_digest_queue FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification ON notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_digest_queue_scheduled ON notification_digest_queue(scheduled_for, status);

-- Add updated_at triggers
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at 
  BEFORE UPDATE ON user_presence 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR NOTIFICATION MANAGEMENT
-- ============================================

-- Function to check if user is in quiet hours
CREATE OR REPLACE FUNCTION is_in_quiet_hours(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefs RECORD;
  v_current_time TIME;
BEGIN
  -- Get user preferences
  SELECT quiet_hours_enabled, quiet_hours_start, quiet_hours_end
  INTO v_prefs
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences or quiet hours disabled, return false
  IF v_prefs IS NULL OR NOT v_prefs.quiet_hours_enabled THEN
    RETURN false;
  END IF;
  
  -- Get current time
  v_current_time := CURRENT_TIME;
  
  -- Check if current time is within quiet hours
  IF v_prefs.quiet_hours_start < v_prefs.quiet_hours_end THEN
    -- Normal case: 22:00 to 08:00 same day
    RETURN v_current_time >= v_prefs.quiet_hours_start 
       AND v_current_time <= v_prefs.quiet_hours_end;
  ELSE
    -- Overnight case: 22:00 to 08:00 next day
    RETURN v_current_time >= v_prefs.quiet_hours_start 
        OR v_current_time <= v_prefs.quiet_hours_end;
  END IF;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_type TEXT,
  p_recipient_id UUID,
  p_subject TEXT,
  p_body TEXT,
  p_html_body TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_prefs RECORD;
  v_in_quiet_hours BOOLEAN;
BEGIN
  -- Get user preferences
  SELECT * INTO v_prefs
  FROM notification_preferences
  WHERE user_id = p_recipient_id;
  
  -- Check if in quiet hours
  v_in_quiet_hours := is_in_quiet_hours(p_recipient_id);
  
  -- If in quiet hours and not urgent, add to digest queue
  IF v_in_quiet_hours AND p_priority != 'urgent' THEN
    -- Add to digest queue instead
    -- (Implementation depends on digest strategy)
    NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (
    notification_type,
    recipient_id,
    subject,
    body,
    html_body,
    related_entity_type,
    related_entity_id,
    priority,
    metadata,
    status
  ) VALUES (
    p_type,
    p_recipient_id,
    p_subject,
    p_body,
    p_html_body,
    p_entity_type,
    p_entity_id,
    p_priority,
    p_metadata,
    'pending'
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    read_at = NOW(),
    status = CASE WHEN status = 'sent' THEN 'read' ELSE status END,
    updated_at = NOW()
  WHERE id = p_notification_id
    AND recipient_id = auth.uid();
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    read_at = NOW(),
    status = CASE WHEN status = 'sent' THEN 'read' ELSE status END,
    updated_at = NOW()
  WHERE recipient_id = auth.uid()
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE recipient_id = p_user_id
    AND is_read = false;
  
  RETURN v_count;
END;
$$;

-- Function to check for task deadlines
CREATE OR REPLACE FUNCTION check_task_deadlines()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_record RECORD;
  notification_id UUID;
BEGIN
  FOR task_record IN
    SELECT 
      t.id,
      t.name,
      t.description,
      t.due_date,
      t.priority,
      t.assigned_to,
      p.name as project_name,
      prof.email as assignee_email,
      prof.full_name as assignee_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN profiles prof ON t.assigned_to = prof.id
    WHERE t.status != 'completed'
      AND t.due_date IS NOT NULL
      AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
      AND t.assigned_to IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.notification_type = 'task_deadline'
          AND n.related_entity_id = t.id
          AND n.created_at > NOW() - INTERVAL '12 hours'
      )
  LOOP
    -- Create notification using the function
    notification_id := create_notification(
      'task_deadline',
      task_record.assigned_to,
      format('⚠️ Task Due Soon: %s', task_record.name),
      format(
        E'Task "%s" is due within 24 hours.\n\n' ||
        E'Project: %s\n' ||
        E'Due Date: %s\n' ||
        E'Priority: %s\n\n' ||
        E'Description: %s',
        task_record.name,
        task_record.project_name,
        to_char(task_record.due_date, 'YYYY-MM-DD HH24:MI'),
        UPPER(task_record.priority),
        COALESCE(task_record.description, 'No description provided')
      ),
      NULL, -- HTML body will be generated by template
      'task',
      task_record.id,
      CASE task_record.priority
        WHEN 'high' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'task_name', task_record.name,
        'project_name', task_record.project_name,
        'due_date', task_record.due_date
      )
    );
    
    RAISE NOTICE 'Created deadline notification % for task: %', notification_id, task_record.name;
  END LOOP;
END;
$$;

-- Function to check budget alerts
CREATE OR REPLACE FUNCTION check_budget_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  notification_id UUID;
  budget_variance NUMERIC;
  variance_percentage NUMERIC;
BEGIN
  FOR project_record IN
    SELECT 
      p.id,
      p.name,
      p.created_by,
      prof.email as manager_email,
      prof.full_name as manager_name,
      COALESCE(SUM(
        EXTRACT(EPOCH FROM (tl.end_time - tl.start_time)) / 3600
      ), 0) as hours_spent,
      COALESCE(SUM(
        EXTRACT(EPOCH FROM (tl.end_time - tl.start_time)) / 3600 * 500
      ), 0) as actual_cost,
      50000 as estimated_budget
    FROM projects p
    LEFT JOIN time_logs tl ON tl.project_id = p.id AND tl.end_time IS NOT NULL
    LEFT JOIN profiles prof ON p.created_by = prof.id
    WHERE p.status IN ('in_progress', 'pending')
    GROUP BY p.id, p.name, p.created_by, prof.email, prof.full_name
    HAVING COALESCE(SUM(
      EXTRACT(EPOCH FROM (tl.end_time - tl.start_time)) / 3600 * 500
    ), 0) > 50000 * 1.1
  LOOP
    budget_variance := project_record.actual_cost - project_record.estimated_budget;
    variance_percentage := (budget_variance / project_record.estimated_budget) * 100;

    notification_id := create_notification(
      'budget_alert',
      project_record.created_by,
      format('🚨 Budget Alert: %s', project_record.name),
      format(
        E'Project "%s" is over budget!\n\n' ||
        E'Estimated Budget: R %.2f\n' ||
        E'Actual Cost: R %.2f\n' ||
        E'Variance: R %.2f (%.1f%% over budget)\n' ||
        E'Hours Spent: %.1f hours',
        project_record.name,
        project_record.estimated_budget,
        project_record.actual_cost,
        budget_variance,
        variance_percentage,
        project_record.hours_spent
      ),
      NULL,
      'project',
      project_record.id,
      'urgent',
      jsonb_build_object(
        'project_name', project_record.name,
        'estimated_budget', project_record.estimated_budget,
        'actual_cost', project_record.actual_cost,
        'variance', budget_variance,
        'variance_percentage', variance_percentage
      )
    );
    
    RAISE NOTICE 'Created budget alert % for project: %', notification_id, project_record.name;
  END LOOP;
END;
$$;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
  p_status TEXT,
  p_current_page TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, current_page, last_seen, updated_at)
  VALUES (auth.uid(), p_status, p_current_page, NOW(), NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    current_page = EXCLUDED.current_page,
    last_seen = NOW(),
    updated_at = NOW();
END;
$$;

-- Function to get pending notifications for email sending
CREATE OR REPLACE FUNCTION get_pending_notifications(limit_count INT DEFAULT 10)
RETURNS TABLE (
  notification_id UUID,
  notification_type TEXT,
  recipient_id UUID,
  recipient_email TEXT,
  recipient_name TEXT,
  subject TEXT,
  body TEXT,
  html_body TEXT,
  priority TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.notification_type,
    n.recipient_id,
    p.email,
    p.full_name,
    n.subject,
    n.body,
    n.html_body,
    n.priority,
    n.related_entity_type,
    n.related_entity_id,
    n.metadata
  FROM notifications n
  JOIN profiles p ON n.recipient_id = p.id
  JOIN notification_preferences np ON n.recipient_id = np.user_id
  WHERE n.status = 'pending'
    AND n.created_at > NOW() - INTERVAL '7 days'
    AND np.email_enabled = true
    -- Check notification type preferences
    AND (
      (n.notification_type = 'task_deadline' AND np.task_deadline_email = true) OR
      (n.notification_type = 'budget_alert' AND np.budget_alert_email = true) OR
      (n.notification_type = 'project_update' AND np.project_update_email = true) OR
      (n.notification_type = 'system_alert' AND np.system_alert_email = true)
    )
  ORDER BY 
    CASE n.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'normal' THEN 3
      WHEN 'low' THEN 4
    END,
    n.created_at ASC
  LIMIT limit_count;
END;
$$;

-- Function to mark notification as sent
CREATE OR REPLACE FUNCTION mark_notification_sent(
  p_notification_id UUID,
  p_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET 
    status = 'sent',
    sent_at = p_sent_at,
    updated_at = NOW()
  WHERE id = p_notification_id;
  
  -- Record analytics event
  INSERT INTO notification_analytics (notification_id, event_type, created_at)
  VALUES (p_notification_id, 'sent', NOW());
END;
$$;

-- Function to mark notification as failed
CREATE OR REPLACE FUNCTION mark_notification_failed(
  p_notification_id UUID, 
  p_error_message TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET 
    status = 'failed',
    error_message = p_error_message,
    updated_at = NOW()
  WHERE id = p_notification_id;
END;
$$;

-- Function to clean up old notifications (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete read notifications older than 90 days
  DELETE FROM notifications
  WHERE is_read = true
    AND read_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Delete failed notifications older than 30 days
  DELETE FROM notifications
  WHERE status = 'failed'
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = v_deleted_count + ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- Comments
COMMENT ON TABLE notifications IS 'Stores all notification records with full tracking';
COMMENT ON TABLE notification_preferences IS 'User notification preferences including quiet hours';
COMMENT ON TABLE notification_analytics IS 'Tracks notification engagement and delivery metrics';
COMMENT ON TABLE user_presence IS 'Tracks user online status and presence';
COMMENT ON TABLE notification_digest_queue IS 'Queue for daily/weekly digest emails';
COMMENT ON FUNCTION create_notification IS 'Creates a new notification with preference checking';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a notification as read';
COMMENT ON FUNCTION get_unread_notification_count IS 'Gets count of unread notifications for a user';
COMMENT ON FUNCTION check_task_deadlines IS 'Checks for tasks due within 24 hours';
COMMENT ON FUNCTION check_budget_alerts IS 'Checks for projects over budget';

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
