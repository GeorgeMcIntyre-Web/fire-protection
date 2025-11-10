/**
 * Fire Consultancy Dashboard
 * 
 * Main dashboard for fire consultants showing:
 * - Active jobs
 * - Pending engineer sign-offs
 * - Revenue tracking
 * - Quick actions
 */

import { useState, useEffect } from 'react'
import { 
  FireIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import type { 
  FireConsultJob, 
  JobWithRelations,
  FireConsultDashboardStats 
} from '../lib/fireconsult-types'
import { 
  getFireConsultJobs, 
  getFireConsultDashboardStats,
  getFireConsultJob 
} from '../lib/fireconsult'
import { useAuth } from '../contexts/AuthContext'

export default function FireConsultDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<FireConsultJob[]>([])
  const [stats, setStats] = useState<FireConsultDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<JobWithRelations | null>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadDashboard()
    }
  }, [user?.id])

  async function loadDashboard() {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const [jobsData, statsData] = await Promise.all([
        getFireConsultJobs(user.id),
        getFireConsultDashboardStats(user.id)
      ])
      setJobs(jobsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleJobClick(jobId: string) {
    try {
      const job = await getFireConsultJob(jobId)
      setSelectedJob(job)
      setShowJobDetail(true)
    } catch (error) {
      console.error('Error loading job:', error)
    }
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'site_visit': 'bg-blue-100 text-blue-800',
      'data_collection': 'bg-yellow-100 text-yellow-800',
      'design_request': 'bg-purple-100 text-purple-800',
      'engineer_review': 'bg-orange-100 text-orange-800',
      'design_complete': 'bg-green-100 text-green-800',
      'billing': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  function formatStatus(status: string): string {
    const formatted: Record<string, string> = {
      'site_visit': 'Site Visit',
      'data_collection': 'Data Collection',
      'design_request': 'Design Request Sent',
      'engineer_review': 'Engineer Review',
      'design_complete': 'Design Complete',
      'billing': 'Billing',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    return formatted[status] || status
  }

  function formatCurrency(amount: number | null): string {
    if (!amount) return 'R 0.00'
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const pendingJobs = jobs.filter(j => 
    j.status === 'design_request' || j.status === 'engineer_review'
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FireIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalJobs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.activeJobs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Sign-off</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.pendingEngineerSignOff || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Sign-offs Section */}
      {pendingJobs.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {pendingJobs.length} Job{pendingJobs.length !== 1 ? 's' : ''} Pending Engineer Sign-off
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                {pendingJobs.slice(0, 3).map(job => (
                  <div key={job.id} className="flex items-center justify-between py-1">
                    <span>{job.job_number} - {job.site_name}</span>
                    <button
                      onClick={() => handleJobClick(job.id)}
                      className="text-yellow-800 hover:text-yellow-900 underline"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Design Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.slice(0, 10).map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.job_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.site_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {formatStatus(job.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(job.total_design_fee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.created_at).toLocaleDateString('en-ZA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleJobClick(job.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Detail Modal */}
      {showJobDetail && selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => {
            setShowJobDetail(false)
            setSelectedJob(null)
          }}
          onUpdate={loadDashboard}
        />
      )}
    </div>
  )
}

// Job Detail Modal Component
function JobDetailModal({
  job,
  onClose,
  onUpdate
}: {
  job: JobWithRelations
  onClose: () => void
  onUpdate: () => void
}) {
  function formatCurrency(amount: number | null): string {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {job.job_number} - {job.site_name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Status</h4>
              <p className="text-gray-900">{job.status}</p>
            </div>

            {job.engineer && (
              <div>
                <h4 className="font-medium text-gray-700">Assigned Engineer</h4>
                <p className="text-gray-900">{job.engineer.full_name}</p>
                <p className="text-sm text-gray-500">{job.engineer.email}</p>
              </div>
            )}

            {job.design_request && (
              <div>
                <h4 className="font-medium text-gray-700">Design Request</h4>
                <p className="text-gray-900">Status: {job.design_request.status}</p>
                {job.design_request.completed_at && (
                  <p className="text-sm text-gray-500">
                    Completed: {new Date(job.design_request.completed_at).toLocaleDateString('en-ZA')}
                  </p>
                )}
              </div>
            )}

            {job.billing_split && (
              <div>
                <h4 className="font-medium text-gray-700">Billing</h4>
                <p className="text-gray-900">
                  Total: {formatCurrency(job.billing_split.total_design_fee)}
                </p>
                <p className="text-sm text-gray-500">
                  Consultant: {formatCurrency(job.billing_split.consultant_amount)} ({job.billing_split.consultant_percentage}%)
                </p>
                <p className="text-sm text-gray-500">
                  Engineer: {formatCurrency(job.billing_split.engineer_amount)} ({job.billing_split.engineer_percentage}%)
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

