-- Notifications table to track email alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('task_deadline', 'budget_alert', 'project_update')),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  related_entity_type TEXT, -- 'task', 'project', 'budget'
  related_entity_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update notifications"
  ON notifications FOR UPDATE
  USING (true);

-- Function to check for tasks due within 24 hours
CREATE OR REPLACE FUNCTION check_task_deadlines()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_record RECORD;
  notification_body TEXT;
  notification_subject TEXT;
BEGIN
  -- Find tasks due within 24 hours that haven't been notified about recently
  FOR task_record IN
    SELECT 
      t.id,
      t.name,
      t.description,
      t.due_date,
      t.priority,
      t.assigned_to,
      p.name as project_name,
      prof.email as assignee_email
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN profiles prof ON t.assigned_to = prof.id
    WHERE t.status != 'completed'
      AND t.due_date IS NOT NULL
      AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
      AND t.assigned_to IS NOT NULL
      -- Don't send duplicate notifications within 6 hours
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.notification_type = 'task_deadline'
          AND n.related_entity_id = t.id
          AND n.created_at > NOW() - INTERVAL '6 hours'
      )
  LOOP
    -- Create notification subject and body
    notification_subject := format('⚠️ Task Due Soon: %s', task_record.name);
    notification_body := format(
      E'Task "%s" is due within 24 hours.\n\n' ||
      E'Project: %s\n' ||
      E'Due Date: %s\n' ||
      E'Priority: %s\n\n' ||
      E'Description: %s\n\n' ||
      E'Please ensure this task is completed on time.',
      task_record.name,
      task_record.project_name,
      to_char(task_record.due_date, 'YYYY-MM-DD HH24:MI'),
      UPPER(task_record.priority),
      COALESCE(task_record.description, 'No description provided')
    );

    -- Insert notification record
    INSERT INTO notifications (
      notification_type,
      recipient_id,
      subject,
      body,
      related_entity_type,
      related_entity_id,
      status
    ) VALUES (
      'task_deadline',
      task_record.assigned_to,
      notification_subject,
      notification_body,
      'task',
      task_record.id,
      'pending'
    );

    RAISE NOTICE 'Created deadline notification for task: %', task_record.name;
  END LOOP;
END;
$$;

-- Function to check for projects over budget
CREATE OR REPLACE FUNCTION check_budget_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  notification_body TEXT;
  notification_subject TEXT;
  budget_variance NUMERIC;
  variance_percentage NUMERIC;
BEGIN
  -- Find projects over budget (>10% variance)
  FOR project_record IN
    SELECT 
      p.id,
      p.name,
      p.created_by,
      prof.email as manager_email,
      -- Calculate budget from time logs (assuming hourly rate)
      COALESCE(SUM(
        EXTRACT(EPOCH FROM (tl.end_time - tl.start_time)) / 3600
      ), 0) as hours_spent,
      -- For demo, assume R500/hour rate and R50000 budget per project
      COALESCE(SUM(
        EXTRACT(EPOCH FROM (tl.end_time - tl.start_time)) / 3600 * 500
      ), 0) as actual_cost,
      50000 as estimated_budget
    FROM projects p
    LEFT JOIN time_logs tl ON tl.project_id = p.id AND tl.end_time IS NOT NULL
    LEFT JOIN profiles prof ON p.created_by = prof.id
    WHERE p.status IN ('in_progress', 'pending')
    GROUP BY p.id, p.name, p.created_by, prof.email
    HAVING COALESCE(SUM(
      EXTRACT(EPOCH FROM (tl.end_time - tl.start_time)) / 3600 * 500
    ), 0) > 50000 * 1.1 -- More than 10% over budget
  LOOP
    budget_variance := project_record.actual_cost - project_record.estimated_budget;
    variance_percentage := (budget_variance / project_record.estimated_budget) * 100;

    -- Create notification subject and body
    notification_subject := format('🚨 Budget Alert: %s', project_record.name);
    notification_body := format(
      E'Project "%s" is over budget!\n\n' ||
      E'Estimated Budget: R %.2f\n' ||
      E'Actual Cost: R %.2f\n' ||
      E'Variance: R %.2f (%.1f%% over budget)\n' ||
      E'Hours Spent: %.1f hours\n\n' ||
      E'Please review the project costs and take corrective action.',
      project_record.name,
      project_record.estimated_budget,
      project_record.actual_cost,
      budget_variance,
      variance_percentage,
      project_record.hours_spent
    );

    -- Insert notification record (only if not notified in last 24 hours)
    INSERT INTO notifications (
      notification_type,
      recipient_id,
      subject,
      body,
      related_entity_type,
      related_entity_id,
      status
    )
    SELECT
      'budget_alert',
      project_record.created_by,
      notification_subject,
      notification_body,
      'project',
      project_record.id,
      'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.notification_type = 'budget_alert'
        AND n.related_entity_id = project_record.id
        AND n.created_at > NOW() - INTERVAL '24 hours'
    );

    RAISE NOTICE 'Created budget alert for project: %', project_record.name;
  END LOOP;
END;
$$;

-- Function to send pending notifications (called by Edge Function)
CREATE OR REPLACE FUNCTION get_pending_notifications(limit_count INT DEFAULT 10)
RETURNS TABLE (
  notification_id UUID,
  notification_type TEXT,
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  related_entity_type TEXT,
  related_entity_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.notification_type,
    p.email,
    n.subject,
    n.body,
    n.related_entity_type,
    n.related_entity_id
  FROM notifications n
  JOIN profiles p ON n.recipient_id = p.id
  WHERE n.status = 'pending'
    AND n.created_at > NOW() - INTERVAL '1 day' -- Don't send old notifications
  ORDER BY n.created_at ASC
  LIMIT limit_count;
END;
$$;

-- Function to mark notification as sent
CREATE OR REPLACE FUNCTION mark_notification_sent(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET 
    status = 'sent',
    sent_at = NOW(),
    updated_at = NOW()
  WHERE id = notification_id;
END;
$$;

-- Function to mark notification as failed
CREATE OR REPLACE FUNCTION mark_notification_failed(notification_id UUID, error_msg TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET 
    status = 'failed',
    error_message = error_msg,
    updated_at = NOW()
  WHERE id = notification_id;
END;
$$;

COMMENT ON TABLE notifications IS 'Stores email notification history for task deadlines and budget alerts';
COMMENT ON FUNCTION check_task_deadlines() IS 'Checks for tasks due within 24 hours and creates notifications';
COMMENT ON FUNCTION check_budget_alerts() IS 'Checks for projects >10% over budget and creates notifications';
