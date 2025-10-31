import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'

type FilterType = 'all' | 'unread' | 'task_deadline' | 'budget_alert' | 'project_update' | 'system_alert'
type SortBy = 'newest' | 'oldest' | 'priority'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotifications()

  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter((n) => !n.is_read)
    } else if (filter !== 'all') {
      filtered = filtered.filter((n) => n.notification_type === filter)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (n) =>
          n.subject.toLowerCase().includes(query) ||
          n.body.toLowerCase().includes(query)
      )
    }

    // Apply sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        default:
          return 0
      }
    })

    return filtered
  }, [notifications, filter, searchQuery, sortBy])

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof filteredNotifications> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    filteredNotifications.forEach((notification) => {
      const notifDate = new Date(notification.created_at)
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate())

      if (notifDay.getTime() === today.getTime()) {
        groups.Today.push(notification)
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notification)
      } else if (notifDate.getTime() >= thisWeek.getTime()) {
        groups['This Week'].push(notification)
      } else {
        groups.Older.push(notification)
      }
    })

    return groups
  }, [filteredNotifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_deadline':
        return { icon: '⏰', bg: 'bg-orange-100', text: 'text-orange-600' }
      case 'budget_alert':
        return { icon: '🚨', bg: 'bg-red-100', text: 'text-red-600' }
      case 'project_update':
        return { icon: '📢', bg: 'bg-blue-100', text: 'text-blue-600' }
      case 'system_alert':
        return { icon: '🔔', bg: 'bg-purple-100', text: 'text-purple-600' }
      default:
        return { icon: '📬', bg: 'bg-gray-100', text: 'text-gray-600' }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    if (notification.related_entity_type && notification.related_entity_id) {
      switch (notification.related_entity_type) {
        case 'project':
          navigate(`/projects`)
          break
        case 'task':
          navigate(`/tasks`)
          break
      }
    }
  }

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteNotification(id)
    }
    setSelectedIds(new Set())
  }

  const handleBulkMarkRead = async () => {
    for (const id of selectedIds) {
      const notification = notifications.find((n) => n.id === id)
      if (notification && !notification.is_read) {
        await markAsRead(id)
      }
    }
    setSelectedIds(new Set())
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">
          Manage your notifications and stay updated on your projects
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="task_deadline">Task Deadlines</option>
            <option value="budget_alert">Budget Alerts</option>
            <option value="project_update">Project Updates</option>
            <option value="system_alert">System Alerts</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
          </select>

          {/* Actions */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedIds.size} selected
            </span>
            <button
              onClick={handleBulkMarkRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark as Read
            </button>
            <button
              onClick={handleBulkDelete}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No matching notifications' : 'No notifications'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([group, groupNotifications]) => {
            if (groupNotifications.length === 0) return null

            return (
              <div key={group}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {group}
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                  {groupNotifications.map((notification) => {
                    const iconInfo = getNotificationIcon(notification.notification_type)
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedIds.has(notification.id)}
                            onChange={() => toggleSelection(notification.id)}
                            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />

                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-lg ${iconInfo.bg} flex items-center justify-center text-2xl`}
                          >
                            {iconInfo.icon}
                          </div>

                          {/* Content */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3
                                className={`text-base font-semibold ${
                                  !notification.is_read
                                    ? 'text-gray-900'
                                    : 'text-gray-600'
                                }`}
                              >
                                {notification.subject}
                                {!notification.is_read && (
                                  <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </h3>
                              <span
                                className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(
                                  notification.priority
                                )}`}
                              >
                                {notification.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {notification.body}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className={iconInfo.text}>
                                {notification.notification_type.replace('_', ' ').toUpperCase()}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(notification.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
