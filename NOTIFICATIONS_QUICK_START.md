# 🚀 Notifications System - Quick Start Guide

Get your email notifications and realtime updates running in 15 minutes!

## Prerequisites

- ✅ Supabase project created
- ✅ Email service account (we recommend Resend)
- ✅ Node.js and npm installed

---

## Step 1: Database Setup (5 minutes)

### 1.1 Run the SQL Script

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database/notifications-complete.sql`
3. Click "Run" to execute
4. Verify tables created in Table Editor

```sql
-- Verify installation
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%notification%';

-- Should show:
-- notifications
-- notification_preferences
-- notification_analytics
-- user_presence
-- notification_digest_queue
```

### 1.2 Enable Realtime

```sql
-- Enable realtime for notification tables
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
```

---

## Step 2: Email Service Setup (3 minutes)

### Option A: Resend (Recommended)

1. **Create Account**
   - Go to https://resend.com
   - Sign up (free tier available)

2. **Get API Key**
   - Dashboard → API Keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Verify Domain (Optional for Testing)**
   - For production: Add your domain
   - For testing: Use `resend.dev`

### Option B: SendGrid

1. Go to https://sendgrid.com
2. Create API key with "Mail Send" permission
3. Copy the key (starts with `SG.`)

---

## Step 3: Configure Environment (2 minutes)

### 3.1 Add Environment Variables

Create or update your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=resend
EMAIL_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Fire Protection Tracker
APP_URL=https://your-app-url.com

# Supabase (should already exist)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
```

### 3.2 Set Supabase Secrets

In Supabase Dashboard → Settings → API:

```bash
# Using Supabase CLI
supabase secrets set EMAIL_SERVICE=resend
supabase secrets set EMAIL_API_KEY=re_your_key
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
supabase secrets set EMAIL_FROM_NAME="Fire Protection Tracker"
supabase secrets set APP_URL=https://your-app.com
```

---

## Step 4: Deploy Edge Functions (3 minutes)

### 4.1 Install Supabase CLI

```bash
# If not already installed
npm install -g supabase
```

### 4.2 Deploy Functions

```bash
# Navigate to your project root
cd /workspace

# Deploy all notification functions
supabase functions deploy send-email
supabase functions deploy check-task-deadlines
supabase functions deploy check-budget-alerts
supabase functions deploy send-digest-emails
```

### 4.3 Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test send-email function
supabase functions invoke send-email --data '{
  "to": "your@email.com",
  "subject": "Test Email",
  "text": "This is a test!"
}'
```

---

## Step 5: Set Up Cron Jobs (2 minutes)

### 5.1 In Supabase Dashboard

Go to Database → Cron Jobs → Create New Job

**Job 1: Check Task Deadlines (Hourly)**
```sql
SELECT cron.schedule(
  'check-task-deadlines-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/check-task-deadlines',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Job 2: Check Budget Alerts (Daily at 9 AM)**
```sql
SELECT cron.schedule(
  'check-budget-alerts-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/check-budget-alerts',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Job 3: Send Digest Emails (Daily at 8 AM)**
```sql
SELECT cron.schedule(
  'send-digest-emails-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-digest-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

---

## Step 6: Test the System (5 minutes)

### 6.1 Test Realtime Notifications

1. Open your app in two browser windows
2. Log in as same user in both
3. In window 1, create a new task
4. Window 2 should show notification bell update

### 6.2 Test Email Notifications

**Manual Test:**

In Supabase SQL Editor:

```sql
-- Create a test notification
SELECT create_notification(
  'system_alert',                     -- type
  (SELECT id FROM auth.users LIMIT 1), -- recipient
  'Test Notification',                 -- subject
  'This is a test email notification', -- body
  NULL,                               -- html_body
  NULL,                               -- entity_type
  NULL,                               -- entity_id
  'normal',                           -- priority
  '{}'::jsonb                         -- metadata
);

-- Check if notification was created
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;

-- Manually trigger email send
SELECT net.http_post(
  url:='https://your-project.supabase.co/functions/v1/check-task-deadlines',
  headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
) as request_id;
```

### 6.3 Test Task Deadline Notification

```sql
-- Create a task due in 12 hours
INSERT INTO tasks (
  name,
  description,
  project_id,
  assigned_to,
  created_by,
  due_date,
  priority,
  status
) VALUES (
  'Test Task - Due Soon',
  'This task should trigger a deadline notification',
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  NOW() + INTERVAL '12 hours',
  'high',
  'pending'
);

-- Wait a minute, then check notifications
SELECT * FROM notifications 
WHERE notification_type = 'task_deadline' 
ORDER BY created_at DESC LIMIT 1;
```

---

## Step 7: Configure User Preferences

1. Log in to your app
2. Click your profile → Settings
3. Go to "Notification Preferences"
4. Configure your preferences:
   - ✅ Enable email notifications
   - ✅ Choose notification types
   - ✅ Set digest preferences
   - ✅ Configure quiet hours (optional)
5. Click "Save Preferences"

---

## Verification Checklist

After completing setup, verify:

- [ ] Database tables created
- [ ] Edge functions deployed
- [ ] Cron jobs scheduled
- [ ] Email service configured
- [ ] Test email received
- [ ] Notification bell shows in UI
- [ ] Realtime updates working
- [ ] User preferences saved
- [ ] Analytics dashboard accessible

---

## Common Issues & Fixes

### Issue: Emails Not Sending

**Check:**
```sql
-- View failed notifications
SELECT * FROM notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Check error messages
SELECT id, subject, error_message, created_at 
FROM notifications 
WHERE status = 'failed';
```

**Fix:**
1. Verify EMAIL_API_KEY is correct
2. Check email service account is active
3. Verify domain is verified (for production)
4. Check Edge Function logs in Supabase

### Issue: Realtime Not Working

**Check:**
```sql
-- Verify realtime is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Fix:**
1. Enable realtime on tables (see Step 1.2)
2. Refresh browser
3. Check browser console for errors
4. Verify RLS policies allow SELECT

### Issue: Cron Jobs Not Running

**Check:**
```sql
-- View cron jobs
SELECT * FROM cron.job;

-- View cron job run history
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

**Fix:**
1. Verify URL is correct
2. Check Authorization header has service role key
3. Verify Edge Functions are deployed
4. Check Supabase logs

---

## Quick Commands Reference

### Check System Status

```sql
-- Notification statistics
SELECT 
  status,
  COUNT(*) as count
FROM notifications
GROUP BY status;

-- Recent notifications
SELECT 
  notification_type,
  subject,
  status,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- User preferences
SELECT 
  u.email,
  np.email_enabled,
  np.daily_digest,
  np.weekly_digest
FROM notification_preferences np
JOIN auth.users u ON u.id = np.user_id;
```

### Manual Operations

```sql
-- Mark all as sent (for testing)
UPDATE notifications 
SET status = 'sent', sent_at = NOW()
WHERE status = 'pending';

-- Delete old notifications
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '90 days'
AND is_read = true;

-- Reset user preferences to defaults
DELETE FROM notification_preferences 
WHERE user_id = 'user-id-here';
-- (Will be recreated with defaults on next login)
```

---

## What's Next?

1. **Customize Email Templates**
   - Edit templates in `supabase/functions/send-email/index.ts`
   - Add your branding and styling

2. **Monitor Performance**
   - View analytics at `/admin/email-analytics`
   - Track delivery rates
   - Monitor failures

3. **Add More Notification Types**
   - Define new notification types
   - Create templates
   - Add trigger logic

4. **Optimize Settings**
   - Adjust cron schedules
   - Fine-tune quiet hours
   - Configure digest timing

---

## Support & Resources

- **Documentation:** See `EMAIL_NOTIFICATIONS_GUIDE.md` and `REALTIME_GUIDE.md`
- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs
- **GitHub Issues:** Create issue in your repo

---

## Success! 🎉

Your notification system is now running! Users will receive:

- 📧 Email notifications for important events
- 🔔 In-app notifications in real-time
- 📊 Weekly digest emails
- 👥 Online presence indicators
- ⚡ Instant updates across devices

**Need help?** Check the comprehensive guides in `EMAIL_NOTIFICATIONS_GUIDE.md` and `REALTIME_GUIDE.md`

---

_Setup time: ~15 minutes | Last updated: October 31, 2024_
