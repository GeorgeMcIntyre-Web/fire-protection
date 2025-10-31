// Supabase Edge Function: check-budget-alerts
// Cron job that checks for projects over budget and creates notifications
// Schedule: Run daily at 9:00 AM

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

    console.log('Starting budget alert check...')

    // Call the database function to check budgets
    const { data, error } = await supabase.rpc('check_budget_alerts')

    if (error) {
      console.error('Error checking budget alerts:', error)
      throw error
    }

    console.log('Budget alert check completed')

    // Now get pending budget alert notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        id,
        notification_type,
        recipient_id,
        subject,
        body,
        metadata,
        profiles:recipient_id (
          email,
          full_name
        )
      `)
      .eq('status', 'pending')
      .eq('notification_type', 'budget_alert')
      .order('created_at', { ascending: true })
      .limit(50)

    if (fetchError) {
      console.error('Error fetching pending budget alerts:', fetchError)
      throw fetchError
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending budget alerts`)

    // Send emails for pending notifications
    const emailResults = []
    const functionsUrl = Deno.env.get('SUPABASE_FUNCTIONS_URL') ?? ''

    for (const notification of pendingNotifications || []) {
      try {
        const profile = notification.profiles as any
        
        // Call send-email function
        const response = await fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: profile?.email,
            subject: notification.subject,
            template: 'budget_alert',
            templateData: {
              project_name: notification.metadata?.project_name || 'Project',
              project_id: notification.related_entity_id,
              estimated_budget: notification.metadata?.estimated_budget || 0,
              actual_cost: notification.metadata?.actual_cost || 0,
              variance: notification.metadata?.variance || 0,
              variance_percentage: notification.metadata?.variance_percentage || 0,
              hours_spent: notification.metadata?.hours_spent || 0,
              user_name: profile?.full_name || 'User',
            },
            notificationId: notification.id,
          }),
        })

        if (response.ok) {
          emailResults.push({ id: notification.id, success: true })
          console.log(`Budget alert email sent successfully for notification: ${notification.id}`)
        } else {
          const errorText = await response.text()
          emailResults.push({ id: notification.id, success: false, error: errorText })
          console.error(`Failed to send budget alert email for notification ${notification.id}:`, errorText)
        }
      } catch (emailError) {
        emailResults.push({ id: notification.id, success: false, error: emailError.message })
        console.error(`Error sending budget alert email for notification ${notification.id}:`, emailError)
      }
    }

    const successCount = emailResults.filter(r => r.success).length
    const failureCount = emailResults.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Budget alert check completed',
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
    console.error('Error in check-budget-alerts:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
