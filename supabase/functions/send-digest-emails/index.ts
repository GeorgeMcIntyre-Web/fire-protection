// Supabase Edge Function: send-digest-emails
// Cron job that aggregates notifications and sends daily/weekly digest emails
// Schedule: Run daily at 8:00 AM

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DigestData {
  user_id: string
  user_name: string
  user_email: string
  digest_type: 'daily' | 'weekly'
  notifications: any[]
  tasks_completed: number
  hours_logged: number
  projects_updated: number
  upcoming_deadlines: any[]
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

    console.log('Starting digest email generation...')

    const now = new Date()
    const isMonday = now.getDay() === 1 // Monday for weekly digests

    // Get users who have digest emails enabled
    const { data: users, error: usersError } = await supabase
      .from('notification_preferences')
      .select(`
        user_id,
        daily_digest,
        weekly_digest,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .eq('email_enabled', true)
      .or(`daily_digest.eq.true${isMonday ? ',weekly_digest.eq.true' : ''}`)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    console.log(`Found ${users?.length || 0} users for digest emails`)

    const digestResults = []
    const functionsUrl = Deno.env.get('SUPABASE_FUNCTIONS_URL') ?? ''

    for (const user of users || []) {
      const profile = user.profiles as any
      const digestType = isMonday && user.weekly_digest ? 'weekly' : 'daily'
      
      try {
        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        if (digestType === 'weekly') {
          startDate.setDate(startDate.getDate() - 7)
        } else {
          startDate.setDate(startDate.getDate() - 1)
        }

        // Get notifications for this user in the time period
        const { data: notifications, error: notifsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.user_id)
          .eq('status', 'sent')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: false })

        if (notifsError) throw notifsError

        // Skip if no notifications
        if (!notifications || notifications.length === 0) {
          console.log(`Skipping digest for ${profile?.email} - no notifications`)
          continue
        }

        // Get activity stats
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id')
          .eq('assigned_to', user.user_id)
          .eq('status', 'completed')
          .gte('updated_at', startDate.toISOString())

        const { data: timeLogs, error: timeLogsError } = await supabase
          .from('time_logs')
          .select('start_time, end_time')
          .eq('user_id', user.user_id)
          .gte('created_at', startDate.toISOString())

        const { data: projectUpdates, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .eq('created_by', user.user_id)
          .gte('updated_at', startDate.toISOString())

        // Get upcoming deadlines
        const { data: upcomingTasks, error: upcomingError } = await supabase
          .from('tasks')
          .select('id, name, due_date, priority')
          .eq('assigned_to', user.user_id)
          .neq('status', 'completed')
          .not('due_date', 'is', null)
          .gte('due_date', now.toISOString())
          .lte('due_date', new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('due_date', { ascending: true })
          .limit(5)

        // Calculate total hours logged
        const totalHours = (timeLogs || []).reduce((sum, log) => {
          if (log.start_time && log.end_time) {
            const start = new Date(log.start_time)
            const end = new Date(log.end_time)
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          }
          return sum
        }, 0)

        // Format dates for display
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('en-ZA', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        }

        // Send digest email
        const response = await fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: profile?.email,
            subject: `Your ${digestType === 'weekly' ? 'Weekly' : 'Daily'} Digest - Fire Protection Tracker`,
            template: 'weekly_digest',
            templateData: {
              user_name: profile?.full_name || 'User',
              week_start: formatDate(startDate),
              week_end: formatDate(endDate),
              tasks_completed: tasks?.length || 0,
              hours_logged: totalHours.toFixed(1),
              projects_updated: projectUpdates?.length || 0,
              notifications_count: notifications.length,
              notifications: notifications.slice(0, 10), // Top 10 notifications
              upcoming_deadlines: (upcomingTasks || []).map(task => ({
                name: task.name,
                due_date: formatDate(new Date(task.due_date)),
                priority: task.priority,
              })),
            },
          }),
        })

        if (response.ok) {
          digestResults.push({ user_id: user.user_id, success: true, type: digestType })
          console.log(`${digestType} digest sent successfully to ${profile?.email}`)
        } else {
          const errorText = await response.text()
          digestResults.push({ user_id: user.user_id, success: false, type: digestType, error: errorText })
          console.error(`Failed to send ${digestType} digest to ${profile?.email}:`, errorText)
        }

      } catch (error) {
        digestResults.push({ user_id: user.user_id, success: false, error: error.message })
        console.error(`Error processing digest for user ${user.user_id}:`, error)
      }
    }

    const successCount = digestResults.filter(r => r.success).length
    const failureCount = digestResults.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Digest email generation completed',
        digestsSent: successCount,
        digestsFailed: failureCount,
        results: digestResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-digest-emails:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
