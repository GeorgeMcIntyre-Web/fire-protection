/**
 * Cloudflare Worker for Email Notifications
 * 
 * This worker sends email notifications for task deadlines and budget alerts.
 * Deploy to Cloudflare Workers and set up a cron trigger.
 * 
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_KEY: Supabase service role key
 * - RESEND_API_KEY: Resend API key (or SENDGRID_API_KEY)
 * - FROM_EMAIL: Sender email address
 * - WORKER_SECRET: Secret for authenticating cron/manual triggers
 */

// Send email via Resend API
async function sendEmailResend(to, subject, body, apiKey, fromEmail) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email via Resend:', error)
    return false
  }
}

// Send email via SendGrid API
async function sendEmailSendGrid(to, subject, body, apiKey, fromEmail) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: { email: fromEmail },
        content: [
          {
            type: 'text/plain',
            value: body
          },
          {
            type: 'text/html',
            value: body.replace(/\n/g, '<br>')
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email via SendGrid:', error)
    return false
  }
}

// Process and send notifications
async function processNotifications(env) {
  let successCount = 0
  let failedCount = 0

  try {
    // Check for task deadlines
    await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/check_task_deadlines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    })

    // Check for budget alerts
    await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/check_budget_alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    })

    // Get pending notifications
    const notificationsResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/get_pending_notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ limit_count: 10 })
      }
    )

    if (!notificationsResponse.ok) {
      console.error('Error fetching notifications:', await notificationsResponse.text())
      return { success: 0, failed: 0 }
    }

    const notifications = await notificationsResponse.json()

    if (!notifications || notifications.length === 0) {
      console.log('No pending notifications')
      return { success: 0, failed: 0 }
    }

    console.log(`Processing ${notifications.length} notifications...`)

    // Send each notification
    for (const notification of notifications) {
      let emailSent = false

      // Try Resend first
      if (env.RESEND_API_KEY) {
        emailSent = await sendEmailResend(
          notification.recipient_email,
          notification.subject,
          notification.body,
          env.RESEND_API_KEY,
          env.FROM_EMAIL
        )
      }

      // Fall back to SendGrid
      if (!emailSent && env.SENDGRID_API_KEY) {
        emailSent = await sendEmailSendGrid(
          notification.recipient_email,
          notification.subject,
          notification.body,
          env.SENDGRID_API_KEY,
          env.FROM_EMAIL
        )
      }

      // Update notification status
      const updateEndpoint = emailSent 
        ? 'mark_notification_sent'
        : 'mark_notification_failed'

      await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${updateEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({
          notification_id: notification.notification_id,
          ...(emailSent ? {} : { error_msg: 'Failed to send email' })
        })
      })

      if (emailSent) {
        successCount++
      } else {
        failedCount++
      }
    }

    console.log(`Notifications processed: ${successCount} sent, ${failedCount} failed`)
  } catch (error) {
    console.error('Error processing notifications:', error)
  }

  return { success: successCount, failed: failedCount }
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${env.WORKER_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const result = await processNotifications(env)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Notifications processed successfully',
          sent: result.success,
          failed: result.failed
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } catch (error) {
      console.error('Error in worker:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  },

  // Scheduled handler for cron triggers
  async scheduled(event, env, ctx) {
    console.log('Running scheduled notification check...')
    await processNotifications(env)
  }
}
