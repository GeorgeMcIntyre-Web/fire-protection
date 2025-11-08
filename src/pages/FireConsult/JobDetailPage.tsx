/**
 * Fire Consultancy Job Detail Page
 * 
 * Detailed view of a single fire protection design job
 */

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, DocumentArrowDownIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useJob } from '../../lib/fireconsult-hooks'
import { updateFireConsultJob, createDesignRequest } from '../../lib/fireconsult'
import { generateDesignRequestPDF } from '../../lib/design-request-pdf'
import { useFireConsult } from '../../contexts/FireConsultContext'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { job, loading, error } = useJob(id || null)
  const { refreshAll } = useFireConsult()
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const handleGeneratePDF = () => {
    if (!job) return
    setGeneratingPDF(true)
    try {
      generateDesignRequestPDF({
        job,
        engineer: job.engineer || undefined,
        consultantName: 'Fire Consultant',
        consultantCompany: 'Fire Protection Services'
      })
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleCreateDesignRequest = async () => {
    if (!job || !job.assigned_engineer_id) {
      alert('Please assign an engineer first')
      return
    }

    try {
      await createDesignRequest({
        job_id: job.id,
        engineer_id: job.assigned_engineer_id,
        status: 'pending'
      })
      await refreshAll()
      alert('Design request created successfully')
    } catch (err) {
      console.error('Error creating design request:', err)
      alert('Failed to create design request')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Job not found'}</p>
        <Link to="/fireconsult" className="mt-4 text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/fireconsult"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.job_number}</h1>
            <p className="text-gray-500">{job.site_name}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleGeneratePDF}
            disabled={generatingPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            {generatingPDF ? 'Generating...' : 'Generate PDF'}
          </button>
          {job.status === 'data_collection' && job.assigned_engineer_id && (
            <button
              onClick={handleCreateDesignRequest}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Create Design Request
            </button>
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Job Information</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Site Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.site_address || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.contact_person || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.contact_email || 'N/A'}</dd>
            </div>
            {job.engineer && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Engineer</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.engineer.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Engineer Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.engineer.email}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Design Parameters */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Design Parameters</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Commodity Class</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.commodity_class || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Storage Method</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.storage_method || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Design Density</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.design_density_mm_per_min ? `${job.design_density_mm_per_min} mm/min` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Design Area</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.design_area_m2 ? `${job.design_area_m2} m²` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Estimated Sprinklers</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.estimated_sprinkler_count || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Flow Required</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.estimated_flow_required_lpm ? `${job.estimated_flow_required_lpm} L/min` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tank Size</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.estimated_tank_size_m3 ? `${job.estimated_tank_size_m3} m³` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Pump Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.pump_type || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.estimated_duration_minutes ? `${job.estimated_duration_minutes} min` : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Billing */}
      {job.billing_split && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Billing</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Design Fee</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(job.billing_split.total_design_fee)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Your Share ({job.billing_split.consultant_percentage}%)</dt>
                <dd className="mt-1 text-lg font-semibold text-green-600">
                  {formatCurrency(job.billing_split.consultant_amount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Engineer Share ({job.billing_split.engineer_percentage}%)</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatCurrency(job.billing_split.engineer_amount)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Design Request */}
      {job.design_request && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Design Request</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{job.design_request.status}</dd>
              </div>
              {job.design_request.completed_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(job.design_request.completed_at).toLocaleDateString('en-ZA')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

