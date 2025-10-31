import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeSubscriptionOptions {
  table: string
  event?: RealtimeEvent
  filter?: string
  schema?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void
  onChange?: (payload: RealtimePostgresChangesPayload<any>) => void
}

/**
 * Hook to subscribe to realtime changes on a Supabase table
 * 
 * @example
 * ```tsx
 * useRealtimeSubscription({
 *   table: 'tasks',
 *   filter: 'assigned_to=eq.user-id',
 *   onInsert: (payload) => console.log('New task:', payload.new),
 *   onUpdate: (payload) => console.log('Task updated:', payload.new),
 * })
 * ```
 */
export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  schema = 'public',
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Create unique channel name
    const channelName = `${schema}:${table}:${filter || 'all'}:${Date.now()}`

    try {
      // Create channel
      channelRef.current = supabase.channel(channelName)

      // Subscribe to changes
      channelRef.current
        .on(
          'postgres_changes' as any,
          {
            event: event as any,
            schema,
            table,
            filter,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            // Call generic onChange handler
            if (onChange) {
              onChange(payload)
            }

            // Call specific event handlers
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload)
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload)
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true)
            setError(null)
          } else if (status === 'CLOSED') {
            setIsSubscribed(false)
          } else if (status === 'CHANNEL_ERROR') {
            setIsSubscribed(false)
            setError(new Error('Channel subscription error'))
          }
        })
    } catch (err) {
      setError(err as Error)
    }

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      setIsSubscribed(false)
    }
  }, [table, event, filter, schema, onInsert, onUpdate, onDelete, onChange])

  return { isSubscribed, error }
}
