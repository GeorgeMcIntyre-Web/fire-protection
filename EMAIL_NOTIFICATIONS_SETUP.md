# Email Notifications & Realtime Setup Guide

This guide covers the implementation of email notifications for task deadlines and budget alerts, plus realtime subscriptions for TasksPage and TimeTrackingPage.

## ✅ What's Been Implemented

### 1. Realtime Subscriptions
- ✅ **TasksPage.tsx**: Now subscribes to `tasks` table changes
- ✅ **TimeTrackingPage.tsx**: Now subscribes to `time_logs` table changes
- Both pages automatically refresh when data changes in another tab or from the Supabase dashboard
- Properly cleanup subscriptions on unmount
- Skip realtime in DEMO_MODE

### 2. Email Notification System
- ✅ **Notifications table**: Tracks all email notifications
- ✅ **SQL functions**: Check for task deadlines (24h) and budget alerts (>10%)
- ✅ **Supabase Edge Function**: Sends emails via Resend/SendGrid
- ✅ **Cloudflare Worker**: Alternative deployment option

## 🚀 Deployment Options

You can choose between **Supabase Edge Functions** or **Cloudflare Workers** for sending notifications.

---

## Option 1: Supabase Edge Functions (Recommended)

### Step 1: Set Up Database

Run the SQL setup in your Supabase dashboard:

```bash
# Connect to your Supabase project
supabase db reset  # If starting fresh
# Or apply the migrations manually in SQL Editor
```

Copy and execute `/workspace/supabase-notifications.sql` in the Supabase SQL Editor.

### Step 2: Get Email Service API Key

Choose one email provider:

#### Option A: Resend (Recommended - Easy Setup)
1. Sign up at https://resend.com
2. Create an API key
3. Verify your domain (or use their test domain for development)

#### Option B: SendGrid
1. Sign up at https://sendgrid.com
2. Create an API key with "Mail Send" permissions
3. Verify your sender email

### Step 3: Deploy Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set FROM_EMAIL=notifications@yourdomain.com
supabase secrets set FUNCTION_SECRET=your_random_secret_here

# Deploy the function
supabase functions deploy send-notifications
```

### Step 4: Set Up Scheduled Invocation

You have two options:

#### Option A: Using Supabase Edge Function Cron (pg_cron)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule notification check every hour
SELECT cron.schedule(
  'check-notifications-hourly',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_FUNCTION_SECRET'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Check scheduled jobs
SELECT * FROM cron.job;
```

#### Option B: Using External Cron Service

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (if your repo is on GitHub)

Example curl command to add to your cron service:

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -H "Content-Type: application/json"
```

---

## Option 2: Cloudflare Workers

### Step 1: Set Up Database

Same as Option 1 - run `/workspace/supabase-notifications.sql` in Supabase SQL Editor.

### Step 2: Deploy Worker

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to workers directory
cd workers

# Set secrets
wrangler secret put SUPABASE_URL
# Enter: https://YOUR_PROJECT_REF.supabase.co

wrangler secret put SUPABASE_SERVICE_KEY
# Enter your service role key from Supabase settings

wrangler secret put RESEND_API_KEY
# Enter your Resend API key

wrangler secret put FROM_EMAIL
# Enter: notifications@yourdomain.com

wrangler secret put WORKER_SECRET
# Enter a random secret string

# Deploy the worker
wrangler deploy
```

The worker will automatically run every hour based on the cron trigger in `wrangler.toml`.

---

## 📧 Email Notification Types

### 1. Task Deadline Alerts
- **Trigger**: Task due within 24 hours
- **Recipients**: Assigned user
- **Frequency**: Max once per 6 hours per task
- **Example**:
  ```
  Subject: ⚠️ Task Due Soon: Install fire suppression system
  
  Task "Install fire suppression system" is due within 24 hours.
  
  Project: Shoprite Warehouse
  Due Date: 2024-10-29 14:00
  Priority: HIGH
  
  Description: Install main fire suppression system in warehouse area
  
  Please ensure this task is completed on time.
  ```

### 2. Budget Alerts
- **Trigger**: Project >10% over budget
- **Recipients**: Project manager (creator)
- **Frequency**: Max once per 24 hours per project
- **Example**:
  ```
  Subject: 🚨 Budget Alert: Shoprite Warehouse
  
  Project "Shoprite Warehouse" is over budget!
  
  Estimated Budget: R 50,000.00
  Actual Cost: R 55,500.00
  Variance: R 5,500.00 (11.0% over budget)
  Hours Spent: 111.0 hours
  
  Please review the project costs and take corrective action.
  ```

---

## 🧪 Testing

### Test Realtime Subscriptions

1. Open TasksPage in two browser tabs
2. In tab 1, create a new task
3. In tab 2, the task list should automatically update
4. Do the same for TimeTrackingPage

### Test Task Deadline Notifications

```sql
-- Create a test task due in 23 hours
INSERT INTO tasks (
  project_id, 
  name, 
  priority, 
  assigned_to, 
  created_by,
  due_date,
  status
) VALUES (
  (SELECT id FROM projects LIMIT 1),
  'Test Urgent Task',
  'high',
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '23 hours',
  'pending'
);

-- Manually trigger notification check
SELECT check_task_deadlines();

-- View pending notifications
SELECT * FROM notifications WHERE status = 'pending';

-- Manually trigger the send function (or wait for cron)
-- Then check if notification was marked as sent
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
```

### Test Budget Alert Notifications

```sql
-- Create time logs to push a project over budget
-- (Assumes R500/hour rate and R50,000 budget)
-- Add 110+ hours to trigger >10% over budget

INSERT INTO time_logs (
  project_id,
  user_id,
  start_time,
  end_time,
  description
) VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM profiles LIMIT 1),
  NOW() - INTERVAL '110 hours',
  NOW(),
  'Test time log to trigger budget alert'
);

-- Manually trigger budget check
SELECT check_budget_alerts();

-- View notifications
SELECT * FROM notifications WHERE notification_type = 'budget_alert' ORDER BY created_at DESC;
```

### Manual Email Send Test

Trigger the notification sender manually:

```bash
# For Supabase Edge Function
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -H "Content-Type: application/json"

# For Cloudflare Worker
curl -X POST \
  https://pm-email-notifications.YOUR_SUBDOMAIN.workers.dev \
  -H "Authorization: Bearer YOUR_WORKER_SECRET" \
  -H "Content-Type: application/json"
```

---

## 🔧 Configuration

### Environment Variables

**Supabase Edge Function:**
- `RESEND_API_KEY` or `SENDGRID_API_KEY`: Email service API key
- `FROM_EMAIL`: Sender email (e.g., notifications@yourdomain.com)
- `FUNCTION_SECRET`: Secret for authenticating scheduled calls
- `SUPABASE_URL`: Automatically available
- `SUPABASE_SERVICE_ROLE_KEY`: Automatically available

**Cloudflare Worker:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `RESEND_API_KEY` or `SENDGRID_API_KEY`: Email service API key
- `FROM_EMAIL`: Sender email
- `WORKER_SECRET`: Secret for authentication

### Customizing Notification Logic

Edit `/workspace/supabase-notifications.sql`:

**Change deadline window** (currently 24 hours):
```sql
AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '48 hours'  -- Change to 48 hours
```

**Change budget threshold** (currently 10%):
```sql
HAVING ... > 50000 * 1.15  -- Change to 15% over budget
```

**Change notification frequency**:
```sql
AND n.created_at > NOW() - INTERVAL '12 hours'  -- Change from 6 to 12 hours
```

---

## 📊 Monitoring

### View Notification History

```sql
-- All notifications
SELECT 
  notification_type,
  subject,
  status,
  sent_at,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 20;

-- Failed notifications
SELECT * FROM notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Notification stats
SELECT 
  notification_type,
  status,
  COUNT(*) as count
FROM notifications
GROUP BY notification_type, status;
```

### Check Scheduled Jobs

```sql
-- View active cron jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check notification records**:
   ```sql
   SELECT * FROM notifications WHERE status = 'failed';
   ```

2. **Verify API keys** are set correctly in secrets

3. **Check email service dashboard** for delivery status

4. **Verify sender email** is verified with your email provider

5. **Check function logs**:
   - Supabase: Go to Edge Functions → send-notifications → Logs
   - Cloudflare: Go to Workers → pm-email-notifications → Logs

### Realtime Not Working

1. **Check DEMO_MODE**: Realtime is disabled in demo mode
2. **Verify Supabase credentials** are set in `.env`
3. **Check browser console** for errors
4. **Verify RLS policies** allow realtime subscriptions

### Scheduled Jobs Not Running

1. **For pg_cron**:
   ```sql
   -- Check if extension is enabled
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   
   -- Check job status
   SELECT * FROM cron.job;
   ```

2. **For Cloudflare Workers**: Check Workers → Triggers → Cron Triggers

3. **For external cron**: Check your cron service dashboard

---

## 📝 Next Steps

1. **Set up email service** (Resend or SendGrid)
2. **Deploy notification function** (Supabase or Cloudflare)
3. **Configure scheduled job** (hourly checks)
4. **Test with sample data**
5. **Monitor notification logs**

## 🎉 Complete!

You now have:
- ✅ Realtime updates on TasksPage and TimeTrackingPage
- ✅ Email notifications for task deadlines (24h warning)
- ✅ Email notifications for budget overruns (>10%)
- ✅ Notification history tracking
- ✅ Professional email templates

Users will automatically receive timely alerts about urgent tasks and budget issues!
