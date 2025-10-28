# 🚀 Quick Start: Email Notifications

Get email notifications running in under 10 minutes!

## Option 1: Supabase Edge Function (Recommended)

### 1. Set Up Database (2 minutes)
```bash
# Copy the SQL file content
cat supabase-notifications.sql

# Paste into Supabase SQL Editor
# Execute the script
```

### 2. Get Resend API Key (3 minutes)
1. Go to https://resend.com and sign up (free)
2. Create an API key
3. Copy the key (starts with `re_`)

### 3. Deploy Edge Function (3 minutes)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project (get ref from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set RESEND_API_KEY=re_your_actual_key_here
supabase secrets set FROM_EMAIL=notifications@yourdomain.com
supabase secrets set FUNCTION_SECRET=any-random-string-here

# Deploy
supabase functions deploy send-notifications
```

### 4. Set Up Hourly Cron (2 minutes)

**Option A: Use free cron-job.org**
1. Go to https://cron-job.org and sign up
2. Create new cron job:
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications`
   - Schedule: Every 1 hour
   - Headers: Add `Authorization: Bearer YOUR_FUNCTION_SECRET`
3. Save and enable

**Option B: Use Supabase pg_cron**
Run this in SQL Editor:
```sql
SELECT cron.schedule(
  'check-notifications-hourly',
  '0 * * * *',
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
```

### 5. Test (1 minute)
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

-- Check for notifications
SELECT check_task_deadlines();

-- View notification
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
```

Trigger manually:
```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET"
```

Check your email! 📧

---

## Option 2: Cloudflare Worker

### 1. Set Up Database (same as above)
Run `supabase-notifications.sql` in Supabase SQL Editor.

### 2. Deploy Worker (5 minutes)
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to workers directory
cd workers

# Set all 5 secrets
wrangler secret put SUPABASE_URL
# Enter: https://YOUR_PROJECT_REF.supabase.co

wrangler secret put SUPABASE_SERVICE_KEY
# Get from: Supabase Dashboard → Settings → API → service_role

wrangler secret put RESEND_API_KEY
# Get from: https://resend.com

wrangler secret put FROM_EMAIL
# Enter: notifications@yourdomain.com

wrangler secret put WORKER_SECRET
# Enter: any-random-string

# Deploy (cron is automatic!)
wrangler deploy
```

### 3. Test
```bash
# Get your worker URL from deploy output
curl -X POST \
  https://pm-email-notifications.YOUR_SUBDOMAIN.workers.dev \
  -H "Authorization: Bearer YOUR_WORKER_SECRET"
```

---

## ✅ Verification Checklist

- [ ] Database migrations applied (`notifications` table exists)
- [ ] Email service configured (Resend or SendGrid)
- [ ] Function/Worker deployed
- [ ] Secrets configured
- [ ] Cron job scheduled
- [ ] Test email received

---

## 🧪 Quick Test Commands

```sql
-- See all notifications
SELECT * FROM notifications ORDER BY created_at DESC;

-- See failed sends
SELECT * FROM notifications WHERE status = 'failed';

-- Stats
SELECT 
  notification_type,
  status,
  COUNT(*) 
FROM notifications 
GROUP BY notification_type, status;

-- Manually trigger checks
SELECT check_task_deadlines();
SELECT check_budget_alerts();
```

---

## 🆘 Troubleshooting

**No notifications created?**
- Check if you have tasks due within 24 hours
- Check if task has `assigned_to` user
- Verify task status is not 'completed'

**Notification created but not sent?**
- Check Edge Function/Worker logs
- Verify email API key is correct
- Check sender email is verified

**Email not received?**
- Check spam folder
- Verify recipient email in profiles table
- Check Resend/SendGrid dashboard for delivery status

---

## 📚 Full Documentation

For detailed setup, customization, and advanced features, see:
- **EMAIL_NOTIFICATIONS_SETUP.md** - Complete guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details

---

## 🎉 You're Done!

Your PM app now sends automatic email alerts for:
- ⚠️ Tasks due within 24 hours
- 🚨 Projects over budget (>10%)

Users will receive professional, actionable notifications!
