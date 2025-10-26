import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  type DailyWorkItem, 
  type ClientUpdate, 
  type DocumentationStatus, 
  getDailyWorkItems,
  getProjectsNeedingClientUpdates,
  getDocumentationStatus,
  generateClientUpdate,
  getQuickActions
} from '../lib/pm-workflow'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon
} from '@heroicons/react/24/outline'

interface Props {
  className?: string
}

export const PMDashboard: React.FC<Props> = ({ className }) => {
  const { user } = useAuth()
  const [dailyWork, setDailyWork] = useState<DailyWorkItem[]>([])
  const [clientUpdates, setClientUpdates] = useState<ClientUpdate[]>([])
  const [documentation, setDocumentation] = useState<DocumentationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPMData()
  }, [user])

  const fetchPMData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [workItems, updates, docs] = await Promise.all([
        getDailyWorkItems(user.id),
        getProjectsNeedingClientUpdates(),
        getDocumentationStatus()
      ])

      setDailyWork(workItems)
      setClientUpdates(updates)
      setDocumentation(docs)
    } catch (error) {
      console.error('Error fetching PM data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUpdate = (project: ClientUpdate) => {
    const message = generateClientUpdate(project)
    navigator.clipboard.writeText(message)
    setCopySuccess(project.project_id)
    setTimeout(() => setCopySuccess(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const quickActions = getQuickActions(dailyWork, clientUpdates)
  const requiredDocs = documentation.filter(doc => doc.status === 'required' || doc.status === 'overdue')

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg text-white p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{action.title}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {action.urgency === 'high' ? '🔥 Priority' : '⚡ Important'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Work Items */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Daily Work</h3>
            </div>
            <span className="text-sm text-gray-500">
              {dailyWork.length} {dailyWork.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {dailyWork.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>All caught up! Nothing urgent to do.</p>
              </div>
            ) : (
              dailyWork.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    item.type === 'urgent'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {item.type === 'urgent' && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2" />
                        )}
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.project_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <UserIcon className="h-3 w-3 inline mr-1" />
                        {item.client_name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client Updates Needed */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Client Updates</h3>
            </div>
            <span className="text-sm text-gray-500">
              {clientUpdates.length} {clientUpdates.length === 1 ? 'client' : 'clients'}
            </span>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {clientUpdates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>All clients are up to date!</p>
              </div>
            ) : (
              clientUpdates.map((update) => (
                <div
                  key={update.project_id}
                  className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{update.project_name}</h4>
                      <p className="text-sm text-gray-600">{update.client_name}</p>
                    </div>
                    <span className="text-xs text-orange-600 font-medium">
                      {update.days_since_update} {update.days_since_update === 1 ? 'day' : 'days'} ago
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{update.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${update.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {update.next_action && (
                    <p className="text-xs text-gray-600 mb-2">
                      Next: {update.next_action}
                    </p>
                  )}

                  <button
                    onClick={() => handleCopyUpdate(update)}
                    className="w-full mt-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    {copySuccess === update.project_id ? (
                      <span className="text-green-600">✓ Copied!</span>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        Copy Update Message
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Documentation Status */}
      {requiredDocs.length > 0 && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Documentation Status</h3>
            </div>
            <span className="text-sm text-red-600 font-medium">
              {requiredDocs.length} {requiredDocs.length === 1 ? 'item' : 'items'} needed
            </span>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {requiredDocs.slice(0, 5).map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <FolderIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.document_name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.project_name} • {doc.document_type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === 'overdue'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {doc.status === 'overdue' ? 'Overdue' : 'Required'}
                  </span>
                </div>
              ))}
            </div>
            {requiredDocs.length > 5 && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                + {requiredDocs.length - 5} more documents needed
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

