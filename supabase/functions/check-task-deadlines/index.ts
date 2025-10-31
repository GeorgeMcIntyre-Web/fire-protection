// Supabase Edge Function: check-task-deadlines
// Cron job that checks for upcoming task deadlines and creates notifications
// Schedule: Run hourly

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting task deadline check...')

    // Call the database function to check deadlines
    const { data, error } = await supabase.rpc('check_task_deadlines')

    if (error) {
      console.error('Error checking task deadlines:', error)
      throw error
    }

    console.log('Task deadline check completed')

    // Now get pending notifications and send them
    const { data: pendingNotifications, error: fetchError } = await supabase
      .rpc('get_pending_notifications', { limit_count: 50 })

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError)
      throw fetchError
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending notifications`)

    // Send emails for pending notifications
    const emailResults = []
    const functionsUrl = Deno.env.get('SUPABASE_FUNCTIONS_URL') ?? ''

    for (const notification of pendingNotifications || []) {
      try {
        // Call send-email function
        const response = await fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: notification.recipient_email,
            subject: notification.subject,
            template: notification.notification_type,
            templateData: {
              task_name: notification.metadata?.task_name || 'Task',
              project_name: notification.metadata?.project_name || 'Project',
              due_date: notification.metadata?.due_date || new Date().toISOString(),
              priority: notification.metadata?.priority || 'medium',
              description: notification.body,
              user_name: notification.recipient_name || 'User',
            },
            notificationId: notification.notification_id,
          }),
        })

        if (response.ok) {
          emailResults.push({ id: notification.notification_id, success: true })
          console.log(`Email sent successfully for notification: ${notification.notification_id}`)
        } else {
          const errorText = await response.text()
          emailResults.push({ id: notification.notification_id, success: false, error: errorText })
          console.error(`Failed to send email for notification ${notification.notification_id}:`, errorText)
        }
      } catch (emailError) {
        emailResults.push({ id: notification.notification_id, success: false, error: emailError.message })
        console.error(`Error sending email for notification ${notification.notification_id}:`, emailError)
      }
    }

    const successCount = emailResults.filter(r => r.success).length
    const failureCount = emailResults.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Task deadline check completed',
        notificationsCreated: true,
        emailsSent: successCount,
        emailsFailed: failureCount,
        results: emailResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in check-task-deadlines:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
