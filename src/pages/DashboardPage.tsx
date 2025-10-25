import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  FolderIcon, 
  ClipboardDocumentListIcon, 
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalTimeLogged: number
  recentActivity: Array<{
    type: 'project' | 'task' | 'time' | 'doc'
    message: string
    timestamp: string
  }>
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalTimeLogged: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch project stats
      const { data: projects } = await supabase
        .from('projects')
        .select('status, created_at')

      // Fetch task stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status, created_at')

      // Fetch time logs
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('start_time, end_time')
        .eq('user_id', user?.id)

      // Fetch recent work docs
      const { data: workDocs } = await supabase
        .from('work_documentation')
        .select('created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const projectStats = projects?.reduce((acc, project) => {
        acc.total++
        if (project.status === 'in_progress') acc.active++
        if (project.status === 'completed') acc.completed++
        return acc
      }, { total: 0, active: 0, completed: 0 }) || { total: 0, active: 0, completed: 0 }

      const taskStats = tasks?.reduce((acc, task) => {
        acc.total++
        if (task.status === 'completed') acc.completed++
        if (task.status === 'pending') acc.pending++
        return acc
      }, { total: 0, completed: 0, pending: 0 }) || { total: 0, completed: 0, pending: 0 }

      const totalTime = timeLogs?.reduce((acc, log) => {
        if (log.end_time) {
          const start = new Date(log.start_time)
          const end = new Date(log.end_time)
          return acc + (end.getTime() - start.getTime())
        }
        return acc
      }, 0) || 0

      // Create recent activity
      const recentActivity: Array<{
        type: 'project' | 'task' | 'time' | 'doc'
        message: string
        timestamp: string
      }> = []
      
      // Add recent projects
      const recentProjects = projects?.slice(0, 3) || []
      recentProjects.forEach(project => {
        recentActivity.push({
          type: 'project' as const,
          message: `Project "${project.status}" status updated`,
          timestamp: project.created_at
        })
      })

      // Add recent tasks
      const recentTasks = tasks?.slice(0, 3) || []
      recentTasks.forEach(task => {
        recentActivity.push({
          type: 'task' as const,
          message: `Task "${task.status}" status updated`,
          timestamp: task.created_at
        })
      })

      // Add recent work docs
      workDocs?.forEach(doc => {
        recentActivity.push({
          type: 'doc' as const,
          message: 'Work documentation added',
          timestamp: doc.created_at
        })
      })

      // Sort by timestamp and take latest 5
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      recentActivity.splice(5)

      setStats({
        totalProjects: projectStats.total,
        activeProjects: projectStats.active,
        completedProjects: projectStats.completed,
        totalTasks: taskStats.total,
        completedTasks: taskStats.completed,
        pendingTasks: taskStats.pending,
        totalTimeLogged: Math.round(totalTime / (1000 * 60 * 60)), // Convert to hours
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return '< 1 hour'
    if (hours === 1) return '1 hour'
    return `${hours} hours`
  }

  const formatActivityTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Projects */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Projects
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">
                {stats.completedProjects} completed
              </span>
              <span className="text-gray-500"> • </span>
              <span className="font-medium text-blue-600">
                {stats.activeProjects} active
              </span>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tasks
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">
                {stats.completedTasks} completed
              </span>
              <span className="text-gray-500"> • </span>
              <span className="font-medium text-yellow-600">
                {stats.pendingTasks} pending
              </span>
            </div>
          </div>
        </div>

        {/* Time Logged */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Time Logged
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatTime(stats.totalTimeLogged)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completion Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalTasks > 0 
                      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              New Project
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
              New Task
            </Link>
            <Link
              to="/time-tracking"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Clock In
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-5">
              <div className="flow-root">
                <ul className="-mb-8">
                  {stats.recentActivity.map((activity, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== stats.recentActivity.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              {activity.type === 'project' && <FolderIcon className="h-4 w-4 text-white" />}
                              {activity.type === 'task' && <ClipboardDocumentListIcon className="h-4 w-4 text-white" />}
                              {activity.type === 'time' && <ClockIcon className="h-4 w-4 text-white" />}
                              {activity.type === 'doc' && <CheckCircleIcon className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">{activity.message}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatActivityTime(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}