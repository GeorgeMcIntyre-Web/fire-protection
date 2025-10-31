import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface NotificationStats {
  total_sent: number
  total_failed: number
  total_pending: number
  delivery_rate: number
  by_type: Array<{
    notification_type: string
    count: number
  }>
  recent_failures: Array<{
    id: string
    subject: string
    error_message: string
    created_at: string
  }>
}

export default function EmailAnalyticsPage() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchStats()
  }, [dateRange])

  const fetchStats = async () => {
    try {
      setIsLoading(true)

      // Calculate date range
      const now = new Date()
      const startDate = new Date()
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
      }

      // Fetch statistics
      const { data: allNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      // Calculate stats
      const totalSent = allNotifications.filter((n) => n.status === 'sent').length
      const totalFailed = allNotifications.filter((n) => n.status === 'failed').length
      const totalPending = allNotifications.filter((n) => n.status === 'pending').length
      const deliveryRate = totalSent + totalFailed > 0
        ? (totalSent / (totalSent + totalFailed)) * 100
        : 0

      // Group by type
      const typeMap = new Map<string, number>()
      allNotifications.forEach((n) => {
        typeMap.set(n.notification_type, (typeMap.get(n.notification_type) || 0) + 1)
      })
      const by_type = Array.from(typeMap.entries()).map(([notification_type, count]) => ({
        notification_type,
        count,
      }))

      // Recent failures
      const recent_failures = allNotifications
        .filter((n) => n.status === 'failed')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map((n) => ({
          id: n.id,
          subject: n.subject,
          error_message: n.error_message || 'Unknown error',
          created_at: n.created_at,
        }))

      setStats({
        total_sent: totalSent,
        total_failed: totalFailed,
        total_pending: totalPending,
        delivery_rate: deliveryRate,
        by_type,
        recent_failures,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task_deadline':
        return 'bg-orange-100 text-orange-800'
      case 'budget_alert':
        return 'bg-red-100 text-red-800'
      case 'project_update':
        return 'bg-blue-100 text-blue-800'
      case 'system_alert':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Failed to load analytics. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Analytics</h1>
        <p className="text-gray-600">Monitor email notification delivery and performance</p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${range === '7d' ? 'rounded-l-lg' : ''} ${
                range === '90d' ? 'rounded-r-lg' : ''
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Sent</p>
            <span className="text-2xl">📧</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total_sent.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.delivery_rate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.total_sent} of {stats.total_sent + stats.total_failed} delivered
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Failed</p>
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.total_failed.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.total_pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Notifications by Type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications by Type</h2>
        <div className="space-y-4">
          {stats.by_type.map((item) => {
            const percentage =
              (item.count / stats.by_type.reduce((sum, t) => sum + t.count, 0)) * 100

            return (
              <div key={item.notification_type}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(item.notification_type)}`}>
                      {getTypeLabel(item.notification_type)}
                    </span>
                    <span className="text-sm text-gray-600">{item.count} emails</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Failures */}
      {stats.recent_failures.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Failures</h2>
          <div className="space-y-4">
            {stats.recent_failures.map((failure) => (
              <div
                key={failure.id}
                className="border border-red-200 bg-red-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{failure.subject}</p>
                    <p className="text-sm text-red-700 mb-2">{failure.error_message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(failure.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Could implement retry functionality
                      console.log('Retry:', failure.id)
                    }}
                    className="flex-shrink-0 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Status */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Email System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                stats.delivery_rate >= 95 ? 'bg-green-500' : stats.delivery_rate >= 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            ></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Delivery Status</p>
              <p className="text-xs text-gray-600">
                {stats.delivery_rate >= 95 ? 'Excellent' : stats.delivery_rate >= 90 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.total_pending < 10 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Queue Status</p>
              <p className="text-xs text-gray-600">
                {stats.total_pending < 10 ? 'Normal' : 'Backlog Detected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                stats.total_failed < stats.total_sent * 0.05 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Error Rate</p>
              <p className="text-xs text-gray-600">
                {stats.total_failed < stats.total_sent * 0.05 ? 'Low' : 'Elevated'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
