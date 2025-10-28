import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { calculateProjectCosts, getBudgetAlerts } from '../lib/project-planning'
import { getProjectsNeedingClientUpdates, generateClientUpdate } from '../lib/pm-workflow'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

type TabType = 'progress' | 'budget' | 'communications'

interface ProjectProgress {
  id: string
  name: string
  status: string
  progress: number
  completed_tasks: number
  total_tasks: number
  due_date: string | null
  on_track: boolean
  client_name: string
}

interface BudgetSummary {
  project_id: string
  project_name: string
  client_name: string
  estimated: number
  actual: number
  variance: number
  variance_percentage: number
  status: 'within_budget' | 'over_budget' | 'at_risk'
}

interface ClientCommunication {
  id: string
  project_id: string
  project_name: string
  client_name: string
  message: string
  sent_date: string
  sent_by: string
}

export const ReportsPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('progress')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([])
  const [budgetSummaries, setBudgetSummaries] = useState<BudgetSummary[]>([])
  const [clientCommunications, setClientCommunications] = useState<ClientCommunication[]>([])

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadProjectProgress(),
        loadBudgetSummaries(),
        loadClientCommunications()
      ])
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectProgress = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(name),
          tasks(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const progressData: ProjectProgress[] = (projects || []).map((project) => {
        const tasks = project.tasks || []
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
        const totalTasks = tasks.length
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        // Determine if on track
        const dueDate = project.due_date ? new Date(project.due_date) : null
        const today = new Date()
        const expectedProgress = dueDate ? calculateExpectedProgress(new Date(project.created_at), dueDate, today) : progress
        const onTrack = progress >= expectedProgress || project.status === 'completed'

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          progress,
          completed_tasks: completedTasks,
          total_tasks: totalTasks,
          due_date: project.due_date,
          on_track: onTrack,
          client_name: project.client?.name || 'No Client'
        }
      })

      setProjectProgress(progressData)
    } catch (error) {
      console.error('Error loading project progress:', error)
    }
  }

  const loadBudgetSummaries = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*, client:clients(name)')
        .order('name')

      if (error) throw error

      const summaries: BudgetSummary[] = []

      for (const project of projects || []) {
        try {
          const costs = await calculateProjectCosts(project.id)
          summaries.push({
            project_id: project.id,
            project_name: project.name,
            client_name: project.client?.name || 'No Client',
            estimated: costs.estimated,
            actual: costs.actual,
            variance: costs.variance,
            variance_percentage: costs.variance_percentage,
            status: costs.status
          })
        } catch (err) {
          console.error(`Error calculating costs for project ${project.id}:`, err)
        }
      }

      setBudgetSummaries(summaries)
    } catch (error) {
      console.error('Error loading budget summaries:', error)
    }
  }

  const loadClientCommunications = async () => {
    try {
      // Try to load from client_communications table
      const { data, error } = await supabase
        .from('client_communications')
        .select(`
          *,
          project:projects(name),
          sender:profiles(full_name, email)
        `)
        .order('sent_date', { ascending: false })
        .limit(100)

      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        console.error('Error loading communications:', error)
      }

      const communications: ClientCommunication[] = (data || []).map((comm: any) => ({
        id: comm.id,
        project_id: comm.project_id,
        project_name: comm.project?.name || 'Unknown Project',
        client_name: comm.client_name || 'Unknown Client',
        message: comm.message,
        sent_date: comm.sent_date,
        sent_by: comm.sender?.full_name || comm.sender?.email || 'Unknown'
      }))

      setClientCommunications(communications)
    } catch (error) {
      console.error('Error loading client communications:', error)
    }
  }

  const calculateExpectedProgress = (startDate: Date, dueDate: Date, currentDate: Date): number => {
    const totalDuration = dueDate.getTime() - startDate.getTime()
    const elapsed = currentDate.getTime() - startDate.getTime()
    const expectedProgress = (elapsed / totalDuration) * 100
    return Math.min(Math.max(expectedProgress, 0), 100)
  }

  // CSV Export Functions
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/ /g, '_').replace(/[%()]/g, '')]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportProgressReport = () => {
    const data = projectProgress.map(p => ({
      project: p.name,
      client: p.client_name,
      status: p.status,
      progress_percentage: p.progress,
      completed_tasks: p.completed_tasks,
      total_tasks: p.total_tasks,
      due_date: p.due_date || 'Not set',
      on_track: p.on_track ? 'Yes' : 'No'
    }))
    exportToCSV(data, 'project_progress_report', 
      ['Project', 'Client', 'Status', 'Progress %', 'Completed Tasks', 'Total Tasks', 'Due Date', 'On Track'])
  }

  const exportBudgetReport = () => {
    const data = budgetSummaries.map(b => ({
      project: b.project_name,
      client: b.client_name,
      estimated: b.estimated.toFixed(2),
      actual: b.actual.toFixed(2),
      variance: b.variance.toFixed(2),
      variance_percentage: b.variance_percentage.toFixed(2),
      status: b.status
    }))
    exportToCSV(data, 'budget_summary_report',
      ['Project', 'Client', 'Estimated', 'Actual', 'Variance', 'Variance %', 'Status'])
  }

  const exportCommunicationsReport = () => {
    const data = clientCommunications.map(c => ({
      date: new Date(c.sent_date).toLocaleDateString(),
      project: c.project_name,
      client: c.client_name,
      sent_by: c.sent_by,
      message: c.message.substring(0, 100) + (c.message.length > 100 ? '...' : '')
    }))
    exportToCSV(data, 'client_communications_report',
      ['Date', 'Project', 'Client', 'Sent By', 'Message'])
  }

  const sendClientUpdate = async (projectId: string) => {
    try {
      const needingUpdates = await getProjectsNeedingClientUpdates()
      const project = needingUpdates.find(p => p.project_id === projectId)
      
      if (project) {
        const message = generateClientUpdate(project)
        
        // Save communication to database
        const { error } = await supabase
          .from('client_communications')
          .insert({
            project_id: projectId,
            client_name: project.client_name,
            message: message,
            sent_date: new Date().toISOString(),
            sent_by: user?.id
          })

        if (error) throw error

        // Reload communications
        await loadClientCommunications()
        alert('Client update sent successfully!')
      }
    } catch (error) {
      console.error('Error sending client update:', error)
      alert('Failed to send client update')
    }
  }

  const tabs = [
    { id: 'progress' as TabType, name: 'Project Progress', icon: ChartBarIcon },
    { id: 'budget' as TabType, name: 'Budget Summary', icon: CurrencyDollarIcon },
    { id: 'communications' as TabType, name: 'Client Communications', icon: ChatBubbleLeftRightIcon }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive project insights and client communications</p>
        </div>
        <button
          onClick={loadReportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Project Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Project Progress Overview</h2>
              <button
                onClick={exportProgressReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      On Track
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectProgress.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{project.client_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${project.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          ${project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                          ${project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${project.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 mr-2">{project.progress}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                project.progress >= 75 ? 'bg-green-600' :
                                project.progress >= 50 ? 'bg-blue-600' :
                                project.progress >= 25 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {project.completed_tasks} / {project.total_tasks}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {project.on_track ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {projectProgress.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No projects found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budget Summary Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Budget Analysis</h2>
              <button
                onClick={exportBudgetReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Total Estimated</div>
                <div className="text-2xl font-bold text-blue-900">
                  ${budgetSummaries.reduce((sum, b) => sum + b.estimated, 0).toFixed(2)}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Total Actual</div>
                <div className="text-2xl font-bold text-green-900">
                  ${budgetSummaries.reduce((sum, b) => sum + b.actual, 0).toFixed(2)}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Total Variance</div>
                <div className={`text-2xl font-bold ${
                  budgetSummaries.reduce((sum, b) => sum + b.variance, 0) > 0 ? 'text-red-900' : 'text-green-900'
                }`}>
                  ${budgetSummaries.reduce((sum, b) => sum + b.variance, 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgetSummaries.map((budget) => (
                    <tr key={budget.project_id} className={`hover:bg-gray-50 ${
                      budget.status === 'over_budget' ? 'bg-red-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{budget.project_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{budget.client_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">${budget.estimated.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">${budget.actual.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium ${
                          budget.variance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${budget.variance.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium ${
                          budget.variance_percentage > 10 ? 'text-red-600' :
                          budget.variance_percentage > 5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {budget.variance_percentage.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${budget.status === 'within_budget' ? 'bg-green-100 text-green-800' : ''}
                          ${budget.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${budget.status === 'over_budget' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {budget.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {budgetSummaries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No budget data available
                </div>
              )}
            </div>

            {/* Budget Alerts */}
            {budgetSummaries.some(b => b.status !== 'within_budget') && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Budget Alerts
                </h3>
                <ul className="space-y-1 text-sm text-yellow-700">
                  {budgetSummaries.filter(b => b.status === 'over_budget').map(b => (
                    <li key={b.project_id}>
                      <strong>{b.project_name}:</strong> Over budget by ${Math.abs(b.variance).toFixed(2)} ({b.variance_percentage.toFixed(1)}%)
                    </li>
                  ))}
                  {budgetSummaries.filter(b => b.status === 'at_risk').map(b => (
                    <li key={b.project_id}>
                      <strong>{b.project_name}:</strong> At risk - variance of {b.variance_percentage.toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Client Communications Tab */}
        {activeTab === 'communications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Client Communication History</h2>
              <button
                onClick={exportCommunicationsReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>

            <div className="space-y-3">
              {clientCommunications.map((comm) => (
                <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{comm.project_name}</h3>
                      <p className="text-xs text-gray-500">Client: {comm.client_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(comm.sent_date).toLocaleDateString()} at {new Date(comm.sent_date).toLocaleTimeString()}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">By: {comm.sent_by}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 mt-2">
                    <p className="text-sm text-gray-700">{comm.message}</p>
                  </div>
                </div>
              ))}
              {clientCommunications.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No client communications recorded yet</p>
                  <p className="text-sm mt-2">Communications will appear here when sent from the dashboard</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
