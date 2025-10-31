// Supabase Edge Function: send-email
// Generic email sending function with template rendering

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html?: string
  text?: string
  template?: string
  templateData?: Record<string, any>
  notificationId?: string
}

// Email templates
const templates = {
  task_deadline: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { font-weight: 600; color: #6b7280; }
    .info-value { color: #111827; }
    .priority-high { color: #dc2626; font-weight: bold; }
    .priority-medium { color: #f59e0b; font-weight: bold; }
    .priority-low { color: #10b981; font-weight: bold; }
    .button { display: inline-block; background: #ef4444; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Task Deadline Reminder</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <strong>Attention Required:</strong> Your task is due within 24 hours.
      </div>
      
      <h2>${data.task_name}</h2>
      
      <div class="info-row">
        <span class="info-label">Project:</span>
        <span class="info-value">${data.project_name}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Due Date:</span>
        <span class="info-value">${data.due_date}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Priority:</span>
        <span class="info-value priority-${data.priority.toLowerCase()}">${data.priority}</span>
      </div>
      
      ${data.description ? `
      <div style="margin-top: 20px;">
        <h3 style="color: #374151; margin-bottom: 10px;">Description:</h3>
        <p style="color: #6b7280;">${data.description}</p>
      </div>
      ` : ''}
      
      <a href="${data.app_url}/tasks" class="button">View Task</a>
      
      <p style="color: #6b7280; margin-top: 20px;">
        Please ensure this task is completed on time to keep your project on schedule.
      </p>
    </div>
    <div class="footer">
      <p>Fire Protection Tracker &copy; ${new Date().getFullYear()}</p>
      <p>You're receiving this email because you have notifications enabled for task deadlines.</p>
      <p><a href="${data.app_url}/settings/notifications" style="color: #6b7280;">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `,

  budget_alert: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .urgent-box { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .urgent-box h2 { color: #dc2626; margin: 0 0 10px 0; }
    .metric { text-align: center; padding: 15px; margin: 10px 0; background: #f9fafb; border-radius: 6px; }
    .metric-value { font-size: 32px; font-weight: bold; color: #dc2626; }
    .metric-label { color: #6b7280; font-size: 14px; }
    .comparison { display: flex; justify-content: space-around; margin: 20px 0; }
    .comparison-item { text-align: center; flex: 1; }
    .comparison-value { font-size: 24px; font-weight: bold; }
    .estimated { color: #10b981; }
    .actual { color: #dc2626; }
    .button { display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Budget Alert</h1>
    </div>
    <div class="content">
      <div class="urgent-box">
        <h2>⚠️ Project Over Budget</h2>
        <p style="margin: 0; font-size: 18px;">${data.project_name}</p>
      </div>
      
      <div class="metric">
        <div class="metric-value">+${data.variance_percentage}%</div>
        <div class="metric-label">Over Budget</div>
      </div>
      
      <div class="comparison">
        <div class="comparison-item">
          <div class="comparison-value estimated">R ${data.estimated_budget.toLocaleString()}</div>
          <div style="color: #6b7280; font-size: 14px;">Estimated Budget</div>
        </div>
        <div class="comparison-item">
          <div class="comparison-value actual">R ${data.actual_cost.toLocaleString()}</div>
          <div style="color: #6b7280; font-size: 14px;">Actual Cost</div>
        </div>
      </div>
      
      <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #dc2626;"><strong>Variance:</strong> R ${data.variance.toLocaleString()}</p>
        <p style="margin: 10px 0 0 0; color: #6b7280;"><strong>Hours Spent:</strong> ${data.hours_spent.toFixed(1)} hours</p>
      </div>
      
      <h3 style="color: #374151;">Recommended Actions:</h3>
      <ul style="color: #6b7280;">
        <li>Review project scope and identify cost drivers</li>
        <li>Analyze time logs for inefficiencies</li>
        <li>Consider adjusting resource allocation</li>
        <li>Communicate with client about scope changes</li>
        <li>Review supplier contracts and material costs</li>
      </ul>
      
      <a href="${data.app_url}/projects/${data.project_id}" class="button">View Project Details</a>
    </div>
    <div class="footer">
      <p>Fire Protection Tracker &copy; ${new Date().getFullYear()}</p>
      <p><a href="${data.app_url}/settings/notifications" style="color: #6b7280;">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `,

  project_update: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .update-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 Project Update</h1>
    </div>
    <div class="content">
      <h2>${data.project_name}</h2>
      
      <div class="update-box">
        <h3 style="margin-top: 0; color: #1e40af;">${data.update_title}</h3>
        <p style="margin: 0; color: #374151;">${data.update_message}</p>
      </div>
      
      ${data.changes ? `
      <div style="margin: 20px 0;">
        <h3 style="color: #374151;">What's Changed:</h3>
        <ul style="color: #6b7280;">
          ${data.changes.map((change: string) => `<li>${change}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      <a href="${data.app_url}/projects/${data.project_id}" class="button">View Project</a>
    </div>
    <div class="footer">
      <p>Fire Protection Tracker &copy; ${new Date().getFullYear()}</p>
      <p><a href="${data.app_url}/settings/notifications" style="color: #6b7280;">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `,

  weekly_digest: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .section { margin: 30px 0; }
    .section-title { color: #374151; font-size: 18px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
    .notification-item { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #8b5cf6; }
    .notification-title { font-weight: 600; color: #111827; margin: 0 0 5px 0; }
    .notification-text { color: #6b7280; margin: 0; font-size: 14px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { text-align: center; padding: 20px; background: #f9fafb; border-radius: 6px; }
    .stat-value { font-size: 28px; font-weight: bold; color: #8b5cf6; }
    .stat-label { color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: #8b5cf6; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly Digest</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${data.week_start} - ${data.week_end}</p>
    </div>
    <div class="content">
      <p>Hello ${data.user_name},</p>
      <p>Here's your weekly summary of activity and notifications.</p>
      
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">${data.tasks_completed}</div>
          <div class="stat-label">Tasks Completed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.hours_logged}</div>
          <div class="stat-label">Hours Logged</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.projects_updated}</div>
          <div class="stat-label">Projects Updated</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.notifications_count}</div>
          <div class="stat-label">Notifications</div>
        </div>
      </div>
      
      ${data.notifications && data.notifications.length > 0 ? `
      <div class="section">
        <h2 class="section-title">📬 This Week's Notifications</h2>
        ${data.notifications.slice(0, 5).map((notif: any) => `
          <div class="notification-item">
            <p class="notification-title">${notif.subject}</p>
            <p class="notification-text">${notif.body.substring(0, 100)}...</p>
          </div>
        `).join('')}
        ${data.notifications.length > 5 ? `
          <p style="text-align: center; color: #6b7280;">
            And ${data.notifications.length - 5} more notifications...
          </p>
        ` : ''}
      </div>
      ` : ''}
      
      ${data.upcoming_deadlines && data.upcoming_deadlines.length > 0 ? `
      <div class="section">
        <h2 class="section-title">⏰ Upcoming Deadlines</h2>
        ${data.upcoming_deadlines.map((task: any) => `
          <div class="notification-item">
            <p class="notification-title">${task.name}</p>
            <p class="notification-text">Due: ${task.due_date} | Priority: ${task.priority}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <a href="${data.app_url}/dashboard" class="button">View Dashboard</a>
    </div>
    <div class="footer">
      <p>Fire Protection Tracker &copy; ${new Date().getFullYear()}</p>
      <p><a href="${data.app_url}/settings/notifications" style="color: #6b7280;">Manage digest preferences</a></p>
    </div>
  </div>
</body>
</html>
  `,

  system_alert: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .alert-box { background: #eef2ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 System Notification</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2 style="margin-top: 0; color: #4338ca;">${data.title}</h2>
        <p style="margin: 0; color: #374151;">${data.message}</p>
      </div>
      
      ${data.action_url ? `
        <a href="${data.action_url}" class="button">${data.action_text || 'Learn More'}</a>
      ` : ''}
    </div>
    <div class="footer">
      <p>Fire Protection Tracker &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `,

  welcome: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .welcome-box { text-align: center; padding: 30px; background: #f0fdf4; border-radius: 8px; margin: 20px 0; }
    .feature-grid { display: grid; grid-template-columns: 1fr; gap: 15px; margin: 20px 0; }
    .feature-item { padding: 15px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #10b981; }
    .feature-title { font-weight: 600; color: #111827; margin: 0 0 5px 0; }
    .feature-desc { color: #6b7280; margin: 0; font-size: 14px; }
    .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 35px; border-radius: 6px; margin: 20px 0; font-weight: 600; font-size: 16px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Fire Protection Tracker!</h1>
    </div>
    <div class="content">
      <div class="welcome-box">
        <h2 style="color: #059669; margin: 0 0 10px 0;">Hello ${data.user_name}!</h2>
        <p style="color: #374151; margin: 0;">Your account has been successfully created.</p>
      </div>
      
      <p>We're excited to have you on board! Fire Protection Tracker helps you manage projects, track time, and collaborate with your team efficiently.</p>
      
      <h3 style="color: #374151;">Key Features:</h3>
      <div class="feature-grid">
        <div class="feature-item">
          <p class="feature-title">📊 Project Management</p>
          <p class="feature-desc">Track all your fire protection projects in one place</p>
        </div>
        <div class="feature-item">
          <p class="feature-title">✅ Task Tracking</p>
          <p class="feature-desc">Assign tasks, set deadlines, and monitor progress</p>
        </div>
        <div class="feature-item">
          <p class="feature-title">⏱️ Time Tracking</p>
          <p class="feature-desc">Log hours and track project budgets accurately</p>
        </div>
        <div class="feature-item">
          <p class="feature-title">📁 Document Management</p>
          <p class="feature-desc">Store and organize all your project documents</p>
        </div>
        <div class="feature-item">
          <p class="feature-title">📈 Reports & Analytics</p>
          <p class="feature-desc">Generate insights and track team performance</p>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.app_url}/dashboard" class="button">Get Started</a>
      </div>
      
      <p style="color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        Need help? Check out our <a href="${data.app_url}/help" style="color: #10b981;">documentation</a> or contact our support team.
      </p>
    </div>
    <div class="footer">
      <p>Fire Protection Tracker &copy; ${new Date().getFullYear()}</p>
      <p>This is an automated welcome email.</p>
    </div>
  </div>
</body>
</html>
  `,
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, template, templateData, notificationId }: EmailRequest = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get email service configuration
    const emailService = Deno.env.get('EMAIL_SERVICE') || 'resend' // resend, sendgrid, or supabase
    const apiKey = Deno.env.get('EMAIL_API_KEY') ?? ''
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'noreply@fire-protection-tracker.com'
    const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Fire Protection Tracker'

    // Generate HTML from template if provided
    let emailHtml = html
    if (template && templates[template as keyof typeof templates]) {
      const appUrl = Deno.env.get('APP_URL') || 'https://fire-protection-tracker.com'
      emailHtml = templates[template as keyof typeof templates]({ ...templateData, app_url: appUrl })
    }

    // Send email based on service
    let emailSent = false
    let errorMessage = ''

    if (emailService === 'resend') {
      // Send via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject,
          html: emailHtml,
          text: text || undefined,
        }),
      })

      if (response.ok) {
        emailSent = true
      } else {
        const error = await response.text()
        errorMessage = `Resend API error: ${error}`
      }
    } else if (emailService === 'sendgrid') {
      // Send via SendGrid
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: fromName },
          subject,
          content: [
            { type: 'text/html', value: emailHtml || '' },
            { type: 'text/plain', value: text || '' },
          ],
        }),
      })

      if (response.ok || response.status === 202) {
        emailSent = true
      } else {
        const error = await response.text()
        errorMessage = `SendGrid API error: ${error}`
      }
    } else {
      // Use Supabase built-in email (if configured)
      errorMessage = 'Supabase email not implemented yet'
    }

    // Update notification status in database
    if (notificationId) {
      if (emailSent) {
        await supabase.rpc('mark_notification_sent', {
          p_notification_id: notificationId,
        })
      } else {
        await supabase.rpc('mark_notification_failed', {
          p_notification_id: notificationId,
          p_error_message: errorMessage,
        })
      }
    }

    if (emailSent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      throw new Error(errorMessage)
    }

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
