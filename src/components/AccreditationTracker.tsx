/**
 * Accreditation Tracker
 * 
 * Tracks engineer accreditations (ASIB, SAQCC, SABS, ECSA)
 * with expiry alerts and renewal reminders
 */

import { useState, useEffect } from 'react'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import type { Accreditation, Engineer, AccreditationAlert } from '../lib/fireconsult-types'
import {
  getAccreditations,
  getAccreditationAlerts,
  getEngineers
} from '../lib/fireconsult'

// Engineer Row Component (handles async accreditation loading)
function EngineerRow({ engineer }: { engineer: Engineer }) {
  const [accreditations, setAccreditations] = useState<Accreditation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAccreditations() {
      try {
        const accs = await getAccreditations(engineer.id)
        setAccreditations(accs)
      } catch (error) {
        console.error('Error loading accreditations:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAccreditations()
  }, [engineer.id])

  const activeAccreditations = accreditations.filter(a => a.is_active)
  const hasExpired = accreditations.some(a => {
    const expiryDate = new Date(a.expiry_date)
    return expiryDate < new Date() && a.is_active
  })

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {engineer.full_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {engineer.company_name || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {engineer.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {loading ? 'Loading...' : `${activeAccreditations.length} active`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {loading ? (
          <span className="text-sm text-gray-400">Loading...</span>
        ) : hasExpired ? (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Expired
          </span>
        ) : (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        )}
      </td>
    </tr>
  )
}

export default function AccreditationTracker() {
  const [alerts, setAlerts] = useState<AccreditationAlert[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [alertsData, engineersData] = await Promise.all([
        getAccreditationAlerts(30), // 30 days ahead
        getEngineers(true) // Active only
      ])
      setAlerts(alertsData)
      setEngineers(engineersData)
    } catch (error) {
      console.error('Error loading accreditation data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getAlertSeverity(alert: AccreditationAlert): 'expired' | 'critical' | 'warning' | 'info' {
    if (alert.isExpired) return 'expired'
    if (alert.daysUntilExpiry <= 7) return 'critical'
    if (alert.daysUntilExpiry <= 14) return 'warning'
    return 'info'
  }

  function getAlertColor(severity: string): string {
    const colors: Record<string, string> = {
      'expired': 'bg-red-50 border-red-200 text-red-800',
      'critical': 'bg-orange-50 border-orange-200 text-orange-800',
      'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'info': 'bg-blue-50 border-blue-200 text-blue-800'
    }
    return colors[severity] || colors.info
  }

  function getAlertIcon(severity: string) {
    switch (severity) {
      case 'expired':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const expiredAlerts = alerts.filter(a => a.isExpired)
  const expiringSoon = alerts.filter(a => !a.isExpired && a.isExpiringSoon)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expired</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expiredAlerts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expiringSoon.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Engineers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {engineers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expired Accreditations */}
      {expiredAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {expiredAlerts.length} Expired Accreditation{expiredAlerts.length !== 1 ? 's' : ''}
              </h3>
              <div className="mt-2 space-y-2">
                {expiredAlerts.map((alert) => (
                  <div key={alert.accreditation.id} className="text-sm text-red-700">
                    <strong>{alert.engineer.full_name}</strong> - {alert.accreditation.accreditation_type} 
                    {' '}({alert.accreditation.certificate_number}) expired 
                    {Math.abs(alert.daysUntilExpiry)} day{Math.abs(alert.daysUntilExpiry) !== 1 ? 's' : ''} ago
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Alerts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Accreditation Alerts (Next 30 Days)
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-2">No accreditations expiring in the next 30 days</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const severity = getAlertSeverity(alert)
              const colorClass = getAlertColor(severity)
              
              return (
                <div
                  key={alert.accreditation.id}
                  className={`px-6 py-4 border-l-4 ${colorClass}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getAlertIcon(severity)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">
                            {alert.engineer.full_name}
                          </h3>
                          <p className="text-sm mt-1">
                            <span className="font-medium">{alert.accreditation.accreditation_type}</span>
                            {' '}- Certificate #{alert.accreditation.certificate_number}
                          </p>
                        </div>
                        <div className="text-right">
                          {alert.isExpired ? (
                            <span className="text-sm font-medium text-red-600">
                              Expired
                            </span>
                          ) : (
                            <span className="text-sm font-medium">
                              {alert.daysUntilExpiry} day{alert.daysUntilExpiry !== 1 ? 's' : ''} remaining
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>
                          <span className="font-medium">Issued:</span>{' '}
                          {new Date(alert.accreditation.issued_date).toLocaleDateString('en-ZA')}
                        </p>
                        <p>
                          <span className="font-medium">Expires:</span>{' '}
                          {new Date(alert.accreditation.expiry_date).toLocaleDateString('en-ZA')}
                        </p>
                        {alert.accreditation.issuing_authority && (
                          <p>
                            <span className="font-medium">Issuing Authority:</span>{' '}
                            {alert.accreditation.issuing_authority}
                          </p>
                        )}
                      </div>
                      {alert.accreditation.document_url && (
                        <div className="mt-2">
                          <a
                            href={alert.accreditation.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            View Certificate
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Engineers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Engineers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accreditations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {engineers.map((engineer) => (
                <EngineerRow key={engineer.id} engineer={engineer} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

