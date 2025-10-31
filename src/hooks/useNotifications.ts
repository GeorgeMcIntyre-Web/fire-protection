import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useRealtimeSubscription } from './useRealtimeSubscription'

export interface Notification {
  id: string
  notification_type: 'task_deadline' | 'budget_alert' | 'project_update' | 'system_alert'
  subject: string
  body: string
  related_entity_type?: string
  related_entity_id?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_read: boolean
  read_at?: string
  created_at: string
  metadata?: Record<string, any>
}

/**
 * Hook to manage user notifications with realtime updates
 * 
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   markAsRead,
 *   markAllAsRead,
 *   deleteNotification,
 *   isLoading
 * } = useNotifications()
 * ```
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.is_read).length)
      setError(null)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Subscribe to realtime updates
  useRealtimeSubscription({
    table: 'notifications',
    onInsert: (payload) => {
      const newNotification = payload.new as Notification
      setNotifications(prev => [newNotification, ...prev])
      if (!newNotification.is_read) {
        setUnreadCount(prev => prev + 1)
      }
    },
    onUpdate: (payload) => {
      const updatedNotification = payload.new as Notification
      setNotifications(prev => 
        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
      )
      // Recalculate unread count
      setUnreadCount(notifications.filter(n => !n.is_read).length)
    },
    onDelete: (payload) => {
      const deletedId = payload.old.id
      setNotifications(prev => prev.filter(n => n.id !== deletedId))
      setUnreadCount(prev => {
        const wasUnread = notifications.find(n => n.id === deletedId)?.is_read === false
        return wasUnread ? prev - 1 : prev
      })
    },
  })

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
      })

      if (error) throw error

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
      throw err
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read')

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)

      return data
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      throw err
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      throw err
    }
  }, [notifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  }
}
