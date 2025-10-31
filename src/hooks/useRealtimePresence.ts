import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface UserPresence {
  user_id: string
  user_name: string
  status: 'online' | 'away' | 'busy' | 'offline'
  current_page?: string
  last_seen: string
}

/**
 * Hook to track user presence in realtime
 * 
 * @example
 * ```tsx
 * const { onlineUsers, updateStatus } = useRealtimePresence('project-123')
 * 
 * // Update your status
 * updateStatus('online', '/projects/123')
 * ```
 */
export function useRealtimePresence(channelName: string = 'global') {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const updateStatus = useCallback((
    status: UserPresence['status'],
    currentPage?: string
  ) => {
    if (!channel) return

    const user = supabase.auth.getUser()
    
    user.then(({ data }) => {
      if (data.user) {
        channel.track({
          user_id: data.user.id,
          user_name: data.user.email || 'Unknown',
          status,
          current_page: currentPage,
          last_seen: new Date().toISOString(),
        })

        // Also update database
        supabase.rpc('update_user_presence', {
          p_status: status,
          p_current_page: currentPage,
        }).catch(console.error)
      }
    })
  }, [channel])

  useEffect(() => {
    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create presence channel
      const presenceChannel = supabase.channel(`presence:${channelName}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      })

      // Listen to presence changes
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState()
          const users: UserPresence[] = []

          Object.keys(state).forEach((key) => {
            const presences = state[key] as any[]
            presences.forEach((presence) => {
              users.push({
                user_id: presence.user_id,
                user_name: presence.user_name,
                status: presence.status || 'online',
                current_page: presence.current_page,
                last_seen: presence.last_seen,
              })
            })
          })

          setOnlineUsers(users)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            // Track current user as online
            presenceChannel.track({
              user_id: user.id,
              user_name: user.email || 'Unknown',
              status: 'online',
              last_seen: new Date().toISOString(),
            })
          } else {
            setIsConnected(false)
          }
        })

      setChannel(presenceChannel)

      // Update status in database
      supabase.rpc('update_user_presence', {
        p_status: 'online',
        p_current_page: window.location.pathname,
      }).catch(console.error)
    }

    setupPresence()

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away')
      } else {
        updateStatus('online', window.location.pathname)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (channel) {
        // Set offline before unsubscribing
        supabase.rpc('update_user_presence', {
          p_status: 'offline',
        }).catch(console.error)

        channel.unsubscribe()
      }
    }
  }, [channelName])

  return {
    onlineUsers,
    isConnected,
    updateStatus,
  }
}
