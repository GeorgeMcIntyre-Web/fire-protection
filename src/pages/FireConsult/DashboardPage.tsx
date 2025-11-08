/**
 * Fire Consultancy Dashboard Page
 * 
 * Main landing page for Fire Consultancy module
 */

import { Link } from 'react-router-dom'
import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import FireConsultDashboard from '../../components/FireConsultDashboard'
import AccreditationTracker from '../../components/AccreditationTracker'

export default function FireConsultDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fire Consultancy</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fire protection design projects from site visit to engineer sign-off
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/fireconsult/jobs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Job
          </Link>
          <Link
            to="/fireconsult/engineers"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Engineers
          </Link>
        </div>
      </div>

      {/* Accreditation Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Accreditation Alerts</h2>
        </div>
        <div className="p-6">
          <AccreditationTracker />
        </div>
      </div>

      {/* Main Dashboard */}
      <FireConsultDashboard />
    </div>
  )
}

