# ⚡ Realtime Updates Guide

Complete guide for realtime features in Fire Protection Tracker using Supabase Realtime.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup](#setup)
- [Hooks](#hooks)
- [Components](#components)
- [Best Practices](#best-practices)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

---

## Overview

Fire Protection Tracker uses Supabase Realtime to provide live updates across the application, ensuring teams stay synchronized and informed in real-time.

### Key Benefits

- 🚀 Instant updates without page refresh
- 👥 See who's online and active
- 📬 Live notification delivery
- 🔄 Automatic data synchronization
- 📱 Works on mobile and desktop

---

## Features

### 1. Live Data Subscriptions

**Supported Tables:**
- `tasks` - Task updates
- `projects` - Project changes
- `time_logs` - Time tracking
- `notifications` - New notifications
- `work_documentation` - Photo uploads

**Events:**
- INSERT - New records created
- UPDATE - Existing records modified
- DELETE - Records removed

### 2. User Presence Tracking

- See who's online
- View current page/location
- Status indicators (online, away, busy, offline)
- Last seen timestamps

### 3. Live Notifications

- Real-time notification bell updates
- Instant unread count changes
- Toast notifications for important events
- No polling required

### 4. Live Toasts

- Success/error messages
- Action buttons
- Auto-dismiss
- Stackable notifications

---

## Setup

### 1. Enable Realtime in Supabase

```sql
-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE time_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE work_documentation;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
```

### 2. Configure RLS for Realtime

Realtime respects Row Level Security policies:

```sql
-- Example: Users can see realtime updates for their assigned tasks
CREATE POLICY "Users can subscribe to own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);
```

### 3. Environment Variables

```env
# Already configured in Supabase client
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Hooks

### useRealtimeSubscription

Subscribe to table changes.

**Usage:**
```typescript
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription'

function MyComponent() {
  const { isSubscribed, error } = useRealtimeSubscription({
    table: 'tasks',
    filter: 'project_id=eq.123',
    onInsert: (payload) => {
      console.log('New task:', payload.new)
      // Update local state, show toast, etc.
    },
    onUpdate: (payload) => {
      console.log('Task updated:', payload.new)
    },
    onDelete: (payload) => {
      console.log('Task deleted:', payload.old)
    },
  })

  return <div>Subscribed: {isSubscribed ? 'Yes' : 'No'}</div>
}
```

**Parameters:**
```typescript
interface UseRealtimeSubscriptionOptions {
  table: string              // Table name
  event?: RealtimeEvent      // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string            // SQL filter (e.g., 'project_id=eq.123')
  schema?: string            // Schema name (default: 'public')
  onInsert?: (payload) => void
  onUpdate?: (payload) => void
  onDelete?: (payload) => void
  onChange?: (payload) => void  // Fires for any event
}
```

**Return Value:**
```typescript
{
  isSubscribed: boolean      // Connection status
  error: Error | null        // Any errors
}
```

### useRealtimePresence

Track online users.

**Usage:**
```typescript
import { useRealtimePresence } from '../hooks/useRealtimePresence'

function ProjectPage({ projectId }) {
  const { onlineUsers, isConnected, updateStatus } = useRealtimePresence(`project-${projectId}`)

  useEffect(() => {
    // Update status when viewing project
    updateStatus('online', `/projects/${projectId}`)
  }, [projectId, updateStatus])

  return (
    <div>
      <h2>Online Users ({onlineUsers.length})</h2>
      {onlineUsers.map(user => (
        <div key={user.user_id}>
          {user.user_name} - {user.status}
        </div>
      ))}
    </div>
  )
}
```

**Return Value:**
```typescript
{
  onlineUsers: UserPresence[]   // List of online users
  isConnected: boolean           // Connection status
  updateStatus: (status, page?) => void  // Update your status
}
```

### useNotifications

Manage notifications with realtime updates.

**Usage:**
```typescript
import { useNotifications } from '../hooks/useNotifications'

function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotifications()

  return (
    <div>
      <button>
        🔔 Notifications ({unreadCount})
      </button>
      {/* Show notifications list */}
    </div>
  )
}
```

**Return Value:**
```typescript
{
  notifications: Notification[]           // All notifications
  unreadCount: number                     // Count of unread
  isLoading: boolean                      // Loading state
  error: Error | null                     // Any errors
  markAsRead: (id) => Promise<void>       // Mark one as read
  markAllAsRead: () => Promise<number>    // Mark all as read
  deleteNotification: (id) => Promise<void>  // Delete notification
  refresh: () => Promise<void>            // Manual refresh
}
```

---

## Components

### NotificationBell

Displays notification bell with unread count and dropdown.

**Location:** `src/components/NotificationBell.tsx`

**Features:**
- Real-time unread count badge
- Dropdown with recent notifications
- Mark as read/delete actions
- Keyboard accessible
- Mobile responsive

**Usage:**
```typescript
import NotificationBell from '../components/NotificationBell'

function Navigation() {
  return (
    <nav>
      <NotificationBell />
    </nav>
  )
}
```

### OnlineUsers

Shows online users with avatars and status.

**Location:** `src/components/OnlineUsers.tsx`

**Features:**
- User avatars with initials
- Status indicators (online/away/busy)
- Hover tooltips
- Configurable display count

**Usage:**
```typescript
import OnlineUsers from '../components/OnlineUsers'

function ProjectHeader({ projectId }) {
  return (
    <div>
      <h1>Project Details</h1>
      <OnlineUsers channelName={`project-${projectId}`} maxDisplay={5} />
    </div>
  )
}
```

**Props:**
```typescript
interface OnlineUsersProps {
  channelName?: string    // Channel name (default: 'global')
  maxDisplay?: number     // Max users to show (default: 5)
}
```

### LiveToast

Toast notifications for realtime events.

**Location:** `src/components/LiveToast.tsx`

**Features:**
- Success/error/warning/info types
- Auto-dismiss (configurable)
- Action buttons
- Stackable
- Portal rendering

**Usage:**
```typescript
import LiveToast, { useToast } from '../components/LiveToast'

function MyComponent() {
  const { toasts, dismissToast, success, error, info } = useToast()

  const handleTaskComplete = () => {
    success(
      'Task Completed!',
      'Great job completing the task.',
      {
        action: {
          label: 'View Task',
          onClick: () => navigate('/tasks/123')
        }
      }
    )
  }

  return (
    <>
      <button onClick={handleTaskComplete}>Complete Task</button>
      <LiveToast toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
```

**Toast Types:**
```typescript
success(title, message, options?)
error(title, message, options?)
warning(title, message, options?)
info(title, message, options?)
```

---

## Best Practices

### 1. Subscription Management

**✅ DO:**
```typescript
// Clean up subscriptions
useEffect(() => {
  const { subscription } = supabase
    .channel('my-channel')
    .on('postgres_changes', {}, handler)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

**❌ DON'T:**
```typescript
// Missing cleanup
useEffect(() => {
  supabase.channel('my-channel')
    .on('postgres_changes', {}, handler)
    .subscribe()
  // Memory leak!
}, [])
```

### 2. Filter Subscriptions

**✅ DO:**
```typescript
// Subscribe only to relevant data
useRealtimeSubscription({
  table: 'tasks',
  filter: `assigned_to=eq.${userId}`,  // Only my tasks
  onUpdate: handleUpdate
})
```

**❌ DON'T:**
```typescript
// Subscribe to all records
useRealtimeSubscription({
  table: 'tasks',  // All tasks! Performance issue
  onUpdate: handleUpdate
})
```

### 3. Handle Reconnections

```typescript
const { isSubscribed, error } = useRealtimeSubscription({
  table: 'tasks',
  onInsert: handleInsert
})

// Show connection status
if (!isSubscribed) {
  return <div>Reconnecting...</div>
}

if (error) {
  return <div>Connection error: {error.message}</div>
}
```

### 4. Batch Updates

```typescript
// Use debounce for high-frequency updates
const debouncedUpdate = useMemo(
  () => debounce((payload) => {
    // Handle update
  }, 300),
  []
)

useRealtimeSubscription({
  table: 'tasks',
  onUpdate: debouncedUpdate
})
```

### 5. Optimistic Updates

```typescript
const updateTask = async (id, changes) => {
  // Update UI immediately
  setTasks(prev => 
    prev.map(t => t.id === id ? { ...t, ...changes } : t)
  )

  // Save to database
  try {
    await supabase
      .from('tasks')
      .update(changes)
      .eq('id', id)
  } catch (error) {
    // Revert on error
    fetchTasks()
  }
}
```

---

## Performance Optimization

### 1. Limit Subscription Scope

```typescript
// Good: Specific filter
filter: `project_id=eq.${projectId} AND status=eq.active`

// Bad: Too broad
filter: `project_id=eq.${projectId}`  // All statuses
```

### 2. Use Presence Wisely

```typescript
// Good: One presence channel per view
const { onlineUsers } = useRealtimePresence(`project-${id}`)

// Bad: Multiple overlapping channels
const presence1 = useRealtimePresence('global')
const presence2 = useRealtimePresence('project')
const presence3 = useRealtimePresence('team')
```

### 3. Debounce High-Frequency Events

```typescript
import { debounce } from 'lodash'

const handleUpdate = useMemo(
  () => debounce((payload) => {
    console.log('Update:', payload)
  }, 500),
  []
)
```

### 4. Monitor Connection Count

```sql
-- Check active connections in Supabase Dashboard
-- Settings > Database > Connection pooling
```

### 5. Use Broadcast for Simple Messages

```typescript
// For simple messages, use broadcast (lighter than postgres_changes)
const channel = supabase.channel('room1')

channel.on('broadcast', { event: 'message' }, (payload) => {
  console.log('Message:', payload)
})

channel.send({
  type: 'broadcast',
  event: 'message',
  payload: { text: 'Hello!' }
})
```

---

## Troubleshooting

### Subscriptions Not Working

**Check:**
1. Realtime enabled for table:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE your_table;
   ```

2. RLS policies allow SELECT:
   ```sql
   CREATE POLICY "Allow realtime"
     ON your_table FOR SELECT
     USING (true);
   ```

3. Supabase project has realtime enabled:
   - Check Dashboard > Settings > API
   - Realtime should be enabled

### Connection Dropping

**Solutions:**
1. Implement reconnection logic
2. Check network stability
3. Monitor Supabase status
4. Reduce subscription count

**Example reconnection:**
```typescript
useEffect(() => {
  let retryCount = 0
  const maxRetries = 5

  const connect = () => {
    const channel = supabase.channel('my-channel')
    
    channel
      .on('postgres_changes', {}, handler)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          retryCount = 0
        } else if (status === 'CLOSED' && retryCount < maxRetries) {
          retryCount++
          setTimeout(connect, 1000 * retryCount)
        }
      })
    
    return channel
  }

  const channel = connect()
  return () => channel.unsubscribe()
}, [])
```

### High Latency

**Check:**
1. Geographic distance to Supabase region
2. Network conditions
3. Number of active subscriptions
4. Filter specificity

**Measure latency:**
```typescript
const startTime = Date.now()

useRealtimeSubscription({
  table: 'tasks',
  onInsert: (payload) => {
    const latency = Date.now() - startTime
    console.log(`Latency: ${latency}ms`)
  }
})
```

### Memory Leaks

**Common causes:**
1. Missing cleanup in useEffect
2. Not unsubscribing channels
3. Accumulating event listeners

**Solution:**
```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel')
  channel.subscribe()
  
  // Always clean up!
  return () => {
    channel.unsubscribe()
  }
}, [])
```

---

## Debugging

### Enable Debug Logging

```typescript
// Add to supabase client initialization
const supabase = createClient(url, key, {
  realtime: {
    params: {
      log_level: 'debug'
    }
  }
})
```

### Monitor Channel Status

```typescript
const channel = supabase.channel('my-channel')

channel.subscribe((status) => {
  console.log('Channel status:', status)
  // SUBSCRIBED, CLOSED, CHANNEL_ERROR, TIMED_OUT
})
```

### Check Active Subscriptions

```typescript
// Get all active channels
const channels = supabase.getChannels()
console.log('Active channels:', channels.length)

// List channel details
channels.forEach(channel => {
  console.log('Channel:', channel.topic, channel.state)
})
```

---

## Advanced Usage

### Custom Broadcast Messages

```typescript
const channel = supabase.channel('custom')

// Send custom events
channel.send({
  type: 'broadcast',
  event: 'cursor-move',
  payload: { x: 100, y: 200 }
})

// Listen for custom events
channel.on('broadcast', { event: 'cursor-move' }, (payload) => {
  console.log('Cursor moved:', payload)
})
```

### Typing Indicators

```typescript
const channel = supabase.channel('chat')
let typingTimeout: NodeJS.Timeout

const handleTyping = () => {
  clearTimeout(typingTimeout)
  
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, isTyping: true }
  })

  typingTimeout = setTimeout(() => {
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping: false }
    })
  }, 3000)
}
```

### Collaborative Editing

```typescript
const channel = supabase.channel('document-123')

// Track user selections
channel.on('broadcast', { event: 'selection' }, ({ payload }) => {
  highlightUserSelection(payload.userId, payload.range)
})

// Broadcast your selection
const handleSelect = (range) => {
  channel.send({
    type: 'broadcast',
    event: 'selection',
    payload: { userId, range }
  })
}
```

---

## Testing Realtime

### Local Testing

```typescript
// Mock realtime in tests
jest.mock('../lib/supabase', () => ({
  supabase: {
    channel: () => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })
  }
}))
```

### Integration Testing

```typescript
describe('Realtime subscriptions', () => {
  it('receives task updates', async () => {
    const { result } = renderHook(() => 
      useRealtimeSubscription({
        table: 'tasks',
        onUpdate: mockHandler
      })
    )

    // Trigger update in database
    await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)

    // Wait for realtime event
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled()
    })
  })
})
```

---

## Support

For issues or questions:
- Check Supabase Dashboard logs
- Review connection status
- Monitor network conditions
- Check RLS policies

---

**Last Updated:** 2024-10-31
**Version:** 1.0.0
