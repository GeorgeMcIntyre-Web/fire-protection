import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  PlayIcon, 
  StopIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

interface TimeLog {
  id: string
  task_id: string | null
  project_id: string | null
  user_id: string
  start_time: string
  end_time: string | null
  description: string | null
  created_at: string
  updated_at: string
  tasks?: {
    name: string
  }
  projects?: {
    name: string
  }
}

interface Project {
  id: string
  name: string
}

interface Task {
  id: string
  name: string
  project_id: string
}

export const TimeTrackingPage: React.FC = () => {
  const { user } = useAuth()
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  const [currentLog, setCurrentLog] = useState<TimeLog | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    description: ''
  })

  useEffect(() => {
    fetchTimeLogs()
    fetchProjects()
    fetchTasks()
    checkActiveTracking()
  }, [])

  const fetchTimeLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select(`
          *,
          tasks (
            name
          ),
          projects (
            name
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTimeLogs(data || [])
    } catch (error) {
      console.error('Error fetching time logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name')

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, name, project_id')
        .order('name')

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const checkActiveTracking = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', user.id)
        .is('end_time', null)
        .single()

      if (data && !error) {
        setIsTracking(true)
        setCurrentLog(data)
      }
    } catch (error) {
      // No active tracking session
      setIsTracking(false)
      setCurrentLog(null)
    }
  }

  const startTracking = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('time_logs')
        .insert({
          user_id: user.id,
          project_id: formData.project_id || null,
          task_id: formData.task_id || null,
          start_time: new Date().toISOString(),
          description: formData.description || null
        })
        .select()
        .single()

      if (error) throw error

      setIsTracking(true)
      setCurrentLog(data)
      setShowModal(false)
      setFormData({ project_id: '', task_id: '', description: '' })
      fetchTimeLogs()
    } catch (error) {
      console.error('Error starting tracking:', error)
    }
  }

  const stopTracking = async () => {
    if (!currentLog) return

    try {
      const { error } = await supabase
        .from('time_logs')
        .update({ end_time: new Date().toISOString() })
        .eq('id', currentLog.id)

      if (error) throw error

      setIsTracking(false)
      setCurrentLog(null)
      fetchTimeLogs()
    } catch (error) {
      console.error('Error stopping tracking:', error)
    }
  }

  const formatDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString()
  }

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString()
  }

  const getTotalTimeToday = () => {
    const today = new Date().toDateString()
    return timeLogs
      .filter(log => {
        const logDate = new Date(log.start_time).toDateString()
        return logDate === today && log.end_time
      })
      .reduce((total, log) => {
        const start = new Date(log.start_time)
        const end = new Date(log.end_time!)
        return total + (end.getTime() - start.getTime())
      }, 0)
  }

  const formatTotalTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const filteredTasks = formData.project_id 
    ? tasks.filter(task => task.project_id === formData.project_id)
    : tasks

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track time spent on projects and tasks
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Today: {formatTotalTime(getTotalTimeToday())}
          </div>
          {!isTracking ? (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
            >
              <StopIcon className="h-4 w-4 mr-2" />
              Stop Tracking
            </button>
          )}
        </div>
      </div>

      {/* Current Tracking Status */}
      {isTracking && currentLog && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">
                Currently Tracking Time
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Started: {formatTime(currentLog.start_time)}
                </div>
                <div className="flex items-center mt-1">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Duration: {formatDuration(currentLog.start_time, null)}
                </div>
                {currentLog.projects?.name && (
                  <div className="flex items-center mt-1">
                    <FolderIcon className="h-4 w-4 mr-1" />
                    Project: {currentLog.projects.name}
                  </div>
                )}
                {currentLog.tasks?.name && (
                  <div className="flex items-center mt-1">
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                    Task: {currentLog.tasks.name}
                  </div>
                )}
                {currentLog.description && (
                  <div className="mt-1">
                    Description: {currentLog.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Logs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Time Logs</h3>
        </div>
        {timeLogs.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time logs</h3>
            <p className="mt-1 text-sm text-gray-500">Start tracking time to see your logs here.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project/Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(log.start_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {log.projects?.name && (
                          <div className="flex items-center">
                            <FolderIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {log.projects.name}
                          </div>
                        )}
                        {log.tasks?.name && (
                          <div className="flex items-center mt-1">
                            <ClipboardDocumentListIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {log.tasks.name}
                          </div>
                        )}
                        {!log.projects?.name && !log.tasks?.name && (
                          <span className="text-gray-500">General time</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {formatTime(log.start_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.end_time ? (
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {formatTime(log.end_time)}
                        </div>
                      ) : (
                        <span className="text-blue-600 font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">
                        {formatDuration(log.start_time, log.end_time)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Start Tracking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Start Time Tracking
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); startTracking(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project (Optional)
                  </label>
                  <select
                    className="input-field mt-1"
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value, task_id: '' })}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Task (Optional)
                  </label>
                  <select
                    className="input-field mt-1"
                    value={formData.task_id}
                    onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                    disabled={!formData.project_id}
                  >
                    <option value="">Select a task</option>
                    {filteredTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="input-field mt-1"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What are you working on?"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setFormData({ project_id: '', task_id: '', description: '' })
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Start Tracking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}