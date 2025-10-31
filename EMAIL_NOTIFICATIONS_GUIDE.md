# 📧 Email Notifications Guide

Comprehensive guide for the email notification system in Fire Protection Tracker.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Email Service Configuration](#email-service-configuration)
- [Notification Types](#notification-types)
- [Email Templates](#email-templates)
- [Edge Functions](#edge-functions)
- [User Preferences](#user-preferences)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Fire Protection Tracker includes a comprehensive email notification system that keeps users informed about:
- Task deadlines
- Budget alerts
- Project updates
- System notifications

Notifications respect user preferences including quiet hours, email frequency, and notification types.

---

## Features

### ✅ Core Features

1. **Four Notification Types**
   - Task Deadline Reminders (24 hours before due)
   - Budget Alerts (when projects exceed budget)
   - Project Updates (status changes, new tasks)
   - System Alerts (maintenance, updates)

2. **User Preferences**
   - Enable/disable email notifications globally
   - Control each notification type individually
   - Set quiet hours (pause non-urgent notifications)
   - Choose digest frequency (daily/weekly)

3. **Beautiful HTML Templates**
   - Responsive design
   - Fire protection branding
   - Clear call-to-action buttons
   - Mobile-optimized

4. **Smart Delivery**
   - Respects quiet hours
   - Prevents duplicate notifications
   - Priority-based sending
   - Automatic retry on failure

---

## Email Service Configuration

### Supported Services

1. **Resend (Recommended)**
   - Simple API
   - Generous free tier
   - Excellent deliverability
   - Easy setup

2. **SendGrid**
   - Enterprise features
   - Advanced analytics
   - Higher volume support

3. **Supabase (Future)**
   - Built-in email support
   - No external dependencies

### Setup with Resend

1. **Create Resend Account**
   ```bash
   # Visit https://resend.com
   # Sign up for a free account
   # Verify your domain (or use resend.dev for testing)
   ```

2. **Get API Key**
   ```bash
   # Go to Settings > API Keys
   # Create new API key
   # Copy the key
   ```

3. **Configure Environment Variables**
   ```env
   # Add to your .env file
   EMAIL_SERVICE=resend
   EMAIL_API_KEY=re_your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Fire Protection Tracker
   APP_URL=https://your-app-url.com
   ```

4. **Deploy Edge Functions**
   ```bash
   # Deploy to Supabase
   supabase functions deploy send-email
   supabase functions deploy check-task-deadlines
   supabase functions deploy check-budget-alerts
   supabase functions deploy send-digest-emails
   ```

### Setup with SendGrid

1. **Create SendGrid Account**
   ```bash
   # Visit https://sendgrid.com
   # Sign up for account
   ```

2. **Get API Key**
   ```bash
   # Go to Settings > API Keys
   # Create API key with "Mail Send" permissions
   ```

3. **Configure Environment Variables**
   ```env
   EMAIL_SERVICE=sendgrid
   EMAIL_API_KEY=SG.your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Fire Protection Tracker
   APP_URL=https://your-app-url.com
   ```

---

## Notification Types

### 1. Task Deadline Notifications

**Trigger:** Task due within 24 hours

**Recipients:** Assigned user

**Priority:** High (if task priority is high), Normal (otherwise)

**Frequency:** Maximum once per 12 hours per task

**Template:** `task_deadline`

**Data Fields:**
```typescript
{
  task_name: string
  project_name: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  description: string
  app_url: string
}
```

### 2. Budget Alert Notifications

**Trigger:** Project exceeds budget by >10%

**Recipients:** Project manager (created_by)

**Priority:** Urgent

**Frequency:** Maximum once per 24 hours per project

**Template:** `budget_alert`

**Data Fields:**
```typescript
{
  project_name: string
  project_id: string
  estimated_budget: number
  actual_cost: number
  variance: number
  variance_percentage: number
  hours_spent: number
  app_url: string
}
```

### 3. Project Update Notifications

**Trigger:** Manual or automatic project changes

**Recipients:** Project team members

**Priority:** Normal

**Template:** `project_update`

**Data Fields:**
```typescript
{
  project_name: string
  project_id: string
  update_title: string
  update_message: string
  changes: string[]
  app_url: string
}
```

### 4. System Alert Notifications

**Trigger:** System events, maintenance, updates

**Recipients:** All users or specific roles

**Priority:** Normal to High

**Template:** `system_alert`

**Data Fields:**
```typescript
{
  title: string
  message: string
  action_url?: string
  action_text?: string
}
```

---

## Email Templates

### Template Structure

All templates follow a consistent structure:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Responsive styles */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- Branded header -->
    </div>
    <div class="content">
      <!-- Email content -->
    </div>
    <div class="footer">
      <!-- Footer with preferences link -->
    </div>
  </div>
</body>
</html>
```

### Creating Custom Templates

1. **Add template to Edge Function**

```typescript
// In supabase/functions/send-email/index.ts

const templates = {
  my_custom_template: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <!-- Styles -->
    </head>
    <body>
      <div class="container">
        <h1>${data.title}</h1>
        <p>${data.message}</p>
        <!-- Your content -->
      </div>
    </body>
    </html>
  `
}
```

2. **Send notification with template**

```typescript
await supabase.rpc('create_notification', {
  p_type: 'custom_type',
  p_recipient_id: userId,
  p_subject: 'Subject',
  p_body: 'Plain text body',
  p_metadata: jsonb_build_object(
    'title', 'Custom Title',
    'message', 'Custom Message'
  )
})
```

### Template Best Practices

- ✅ Keep under 102KB (Gmail clipping limit)
- ✅ Use inline CSS (better compatibility)
- ✅ Test in multiple email clients
- ✅ Include plain text alternative
- ✅ Make mobile-responsive
- ✅ Include unsubscribe link
- ✅ Use web-safe fonts
- ✅ Optimize images
- ✅ Include clear CTA buttons

---

## Edge Functions

### 1. send-email

**Purpose:** Generic email sending function

**Trigger:** Called by other functions or manually

**Parameters:**
```typescript
{
  to: string              // Recipient email
  subject: string         // Email subject
  html?: string           // HTML content
  text?: string           // Plain text content
  template?: string       // Template name
  templateData?: object   // Template data
  notificationId?: string // Notification ID to update
}
```

**Response:**
```typescript
{
  success: boolean
  message?: string
  error?: string
}
```

### 2. check-task-deadlines

**Purpose:** Check for upcoming task deadlines

**Schedule:** Hourly (via Supabase cron)

**Process:**
1. Query tasks due within 24 hours
2. Filter out recently notified tasks
3. Create notification records
4. Send emails via send-email function

### 3. check-budget-alerts

**Purpose:** Check for budget overruns

**Schedule:** Daily at 9:00 AM

**Process:**
1. Calculate project budgets vs actuals
2. Identify projects >10% over budget
3. Create notification records
4. Send emails via send-email function

### 4. send-digest-emails

**Purpose:** Send daily/weekly digest emails

**Schedule:** Daily at 8:00 AM

**Process:**
1. Query users with digests enabled
2. Aggregate notifications for time period
3. Calculate activity stats
4. Send digest emails
5. Mark notifications as included in digest

### Setting Up Cron Jobs

```sql
-- In Supabase SQL Editor

-- Hourly: Check task deadlines
SELECT cron.schedule(
  'check-task-deadlines-hourly',
  '0 * * * *', -- Every hour
  'https://your-project.supabase.co/functions/v1/check-task-deadlines'
);

-- Daily at 9 AM: Check budget alerts
SELECT cron.schedule(
  'check-budget-alerts-daily',
  '0 9 * * *', -- 9 AM daily
  'https://your-project.supabase.co/functions/v1/check-budget-alerts'
);

-- Daily at 8 AM: Send digests
SELECT cron.schedule(
  'send-digest-emails-daily',
  '0 8 * * *', -- 8 AM daily
  'https://your-project.supabase.co/functions/v1/send-digest-emails'
);
```

---

## User Preferences

### Database Schema

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY,
  
  -- Email preferences
  email_enabled BOOLEAN DEFAULT true,
  task_deadline_email BOOLEAN DEFAULT true,
  budget_alert_email BOOLEAN DEFAULT true,
  project_update_email BOOLEAN DEFAULT true,
  system_alert_email BOOLEAN DEFAULT true,
  
  -- Digest preferences
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  digest_day TEXT DEFAULT 'monday',
  digest_time TIME DEFAULT '09:00:00',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  quiet_hours_timezone TEXT DEFAULT 'Africa/Johannesburg',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Accessing Preferences

Users can manage preferences at `/settings/notifications`

---

## Troubleshooting

### Email Not Sending

**Check:**
1. API key is correct
2. Email service is configured
3. Edge functions are deployed
4. Cron jobs are scheduled
5. User has email notifications enabled
6. User is not in quiet hours

**Debug:**
```sql
-- Check pending notifications
SELECT * FROM notifications WHERE status = 'pending';

-- Check failed notifications
SELECT * FROM notifications WHERE status = 'failed';

-- Check user preferences
SELECT * FROM notification_preferences WHERE user_id = 'user-id';
```

### Email Going to Spam

**Solutions:**
1. Verify your domain with email service
2. Set up SPF, DKIM, and DMARC records
3. Use a consistent "from" address
4. Avoid spam trigger words
5. Include unsubscribe link
6. Monitor bounce rates

### High Bounce Rate

**Check:**
1. Email addresses are valid
2. Domain is verified
3. Not sending too frequently
4. Content is not flagged as spam

### Testing Emails Locally

Use MailCatcher or Mailtrap:

```bash
# Install MailCatcher
gem install mailcatcher

# Start MailCatcher
mailcatcher

# Configure SMTP in Edge Function
# SMTP: localhost:1025
# Web UI: http://localhost:1080
```

---

## Monitoring

### Key Metrics

- **Delivery Rate:** % of emails successfully delivered
- **Open Rate:** % of emails opened
- **Click Rate:** % of emails with link clicks
- **Bounce Rate:** % of emails bounced
- **Complaint Rate:** % of spam complaints

### Alerts

Set up alerts for:
- Delivery rate < 95%
- Bounce rate > 5%
- Any complaint rate > 0.1%

### Analytics Dashboard

View email analytics at `/admin/email-analytics` (admin only)

---

## Best Practices

1. **Respect User Preferences**
   - Always check preferences before sending
   - Honor quiet hours (except urgent)
   - Provide easy unsubscribe

2. **Prevent Spam**
   - Limit notification frequency
   - De-duplicate notifications
   - Use appropriate priorities

3. **Optimize Delivery**
   - Send during business hours
   - Use digest emails for high-volume
   - Monitor engagement metrics

4. **Maintain Quality**
   - Test templates thoroughly
   - Keep content relevant
   - Use clear subject lines
   - Include actionable CTAs

5. **Monitor Performance**
   - Track delivery rates
   - Watch for bounces
   - Respond to complaints quickly
   - Adjust based on engagement

---

## Support

For issues or questions:
- Check documentation
- Review Edge Function logs
- Check Supabase logs
- Contact support

---

**Last Updated:** 2024-10-31
**Version:** 1.0.0
