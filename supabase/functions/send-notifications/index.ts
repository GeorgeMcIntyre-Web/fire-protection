// Supabase Edge Function to send email notifications
// Deploy with: supabase functions deploy send-notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'notifications@yourdomain.com'

interface NotificationRecord {
  notification_id: string
  notification_type: string
  recipient_email: string
  subject: string
  body: string
  related_entity_type: string | null
  related_entity_id: string | null
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Send email via Resend API
async function sendEmailResend(to: string, subject: string, body: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
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

    const data = await response.json()
    console.log('Email sent successfully:', data)
    return true
  } catch (error) {
    console.error('Error sending email via Resend:', error)
    return false
  }
}

// Alternative: Send email via SendGrid API
async function sendEmailSendGrid(to: string, subject: string, body: string): Promise<boolean> {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
  
  if (!SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY not configured')
    return false
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: { email: FROM_EMAIL },
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

    console.log('Email sent successfully via SendGrid')
    return true
  } catch (error) {
    console.error('Error sending email via SendGrid:', error)
    return false
  }
}

// Main function to process and send notifications
async function processNotifications(): Promise<{ success: number; failed: number }> {
  let successCount = 0
  let failedCount = 0

  try {
    // Get pending notifications from database
    const { data: notifications, error } = await supabase
      .rpc('get_pending_notifications', { limit_count: 10 })

    if (error) {
      console.error('Error fetching notifications:', error)
      return { success: 0, failed: 0 }
    }

    if (!notifications || notifications.length === 0) {
      console.log('No pending notifications to send')
      return { success: 0, failed: 0 }
    }

    console.log(`Processing ${notifications.length} notifications...`)

    // Process each notification
    for (const notification of notifications as NotificationRecord[]) {
      console.log(`Sending notification ${notification.notification_id} to ${notification.recipient_email}`)

      // Try Resend first, fall back to SendGrid
      let emailSent = await sendEmailResend(
        notification.recipient_email,
        notification.subject,
        notification.body
      )

      if (!emailSent) {
        console.log('Resend failed, trying SendGrid...')
        emailSent = await sendEmailSendGrid(
          notification.recipient_email,
          notification.subject,
          notification.body
        )
      }

      // Update notification status in database
      if (emailSent) {
        await supabase.rpc('mark_notification_sent', {
          notification_id: notification.notification_id
        })
        successCount++
      } else {
        await supabase.rpc('mark_notification_failed', {
          notification_id: notification.notification_id,
          error_msg: 'Failed to send email via all providers'
        })
        failedCount++
      }
    }

    console.log(`Notifications processed: ${successCount} sent, ${failedCount} failed`)
  } catch (error) {
    console.error('Error processing notifications:', error)
  }

  return { success: successCount, failed: failedCount }
}

// Main handler
serve(async (req) => {
  // Verify this is a POST request or scheduled invocation
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Check for authorization header (for scheduled invocations)
    const authHeader = req.headers.get('Authorization')
    const functionSecret = Deno.env.get('FUNCTION_SECRET')
    
    if (functionSecret && authHeader !== `Bearer ${functionSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // First, check for tasks due within 24 hours
    console.log('Checking for task deadlines...')
    await supabase.rpc('check_task_deadlines')

    // Then, check for projects over budget
    console.log('Checking for budget alerts...')
    await supabase.rpc('check_budget_alerts')

    // Finally, send pending notifications
    const result = await processNotifications()

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
    console.error('Error in send-notifications function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
