/**
 * Create Fire Consultancy Job Page
 * 
 * Form to create a new fire protection design job
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useFireConsult } from '../../contexts/FireConsultContext'
import { createFireConsultJob } from '../../lib/fireconsult'
import { estimateDesignParameters, estimateWaterSupply } from '../../lib/water-supply-estimator'
import type { FireConsultJobInsert, CommodityClass, StorageMethod, SprinklerStrategy } from '../../lib/fireconsult-types'
import { supabase } from '../../lib/supabase'

interface Client {
  id: string
  name: string
}

export default function CreateJobPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { engineers, refreshAll } = useFireConsult()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [estimates, setEstimates] = useState<any>(null)

  const [formData, setFormData] = useState<Partial<FireConsultJobInsert>>({
    site_name: '',
    site_address: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    client_id: null,
    assigned_engineer_id: null,
    commodity_class: null,
    storage_method: null,
    storage_height_m: null,
    ceiling_height_m: null,
    sprinkler_strategy: null,
    municipal_pressure_bar: null,
    municipal_flow_lpm: null,
    design_fee_per_head: 150,
    consultant_id: user?.id || ''
  })

  useEffect(() => {
    // Load clients
    supabase
      .from('clients')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setClients(data)
      })

    // Auto-calculate when relevant fields change
    if (formData.commodity_class && formData.storage_method) {
      const params = estimateDesignParameters(
        formData.commodity_class,
        formData.storage_method,
        formData.storage_height_m || undefined,
        formData.ceiling_height_m || undefined
      )
      
      if (formData.design_density_mm_per_min && formData.design_area_m2) {
        const waterSupply = estimateWaterSupply({
          designDensityMmPerMin: formData.design_density_mm_per_min,
          designAreaM2: formData.design_area_m2,
          commodityClass: formData.commodity_class,
          storageMethod: formData.storage_method,
          municipalPressureBar: formData.municipal_pressure_bar || undefined,
          municipalFlowLpm: formData.municipal_flow_lpm || undefined
        })
        setEstimates({ ...params, ...waterSupply })
      } else {
        setEstimates(params)
      }
    }
  }, [formData.commodity_class, formData.storage_method, formData.storage_height_m, formData.ceiling_height_m, formData.design_density_mm_per_min, formData.design_area_m2, formData.municipal_pressure_bar, formData.municipal_flow_lpm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      const jobData: FireConsultJobInsert = {
        ...formData,
        consultant_id: user.id,
        site_name: formData.site_name || '',
        design_density_mm_per_min: estimates?.densityMmPerMin || formData.design_density_mm_per_min || null,
        design_area_m2: estimates?.designAreaM2 || formData.design_area_m2 || null,
        sprinkler_spacing_m2: estimates?.sprinklerSpacingM2 || null,
        estimated_flow_required_lpm: estimates?.flowRequiredLpm || null,
        estimated_tank_size_m3: estimates?.tankSizeM3 || null,
        requires_tank: estimates?.requiresTank ?? true,
        requires_pump: estimates?.requiresPump ?? true,
        pump_type: estimates?.recommendedPumpType || null,
        estimated_duration_minutes: estimates?.durationMinutes || 60
      } as FireConsultJobInsert

      const job = await createFireConsultJob(jobData)
      await refreshAll()
      navigate(`/fireconsult/jobs/${job.id}`)
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Failed to create job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Fire Consultancy Job</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter site information to create a new fire protection design job
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name *</label>
              <input
                type="text"
                required
                value={formData.site_name || ''}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                value={formData.client_id || ''}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Select client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Site Address</label>
              <input
                type="text"
                value={formData.site_address || ''}
                onChange={(e) => setFormData({ ...formData, site_address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                value={formData.contact_person || ''}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <input
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Engineer</label>
              <select
                value={formData.assigned_engineer_id || ''}
                onChange={(e) => setFormData({ ...formData, assigned_engineer_id: e.target.value || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Select engineer...</option>
                {engineers.map(eng => (
                  <option key={eng.id} value={eng.id}>{eng.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Design Fee per Head (R)</label>
              <input
                type="number"
                step="0.01"
                value={formData.design_fee_per_head || 150}
                onChange={(e) => setFormData({ ...formData, design_fee_per_head: parseFloat(e.target.value) || 150 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Storage Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Storage Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Commodity Class</label>
              <select
                value={formData.commodity_class || ''}
                onChange={(e) => setFormData({ ...formData, commodity_class: e.target.value as CommodityClass || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Select...</option>
                <option value="Class I">Class I</option>
                <option value="Class II">Class II</option>
                <option value="Class III">Class III</option>
                <option value="Class IV">Class IV</option>
                <option value="Group A Plastics">Group A Plastics</option>
                <option value="Group B Plastics">Group B Plastics</option>
                <option value="Group C Plastics">Group C Plastics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Storage Method</label>
              <select
                value={formData.storage_method || ''}
                onChange={(e) => setFormData({ ...formData, storage_method: e.target.value as StorageMethod || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Select...</option>
                <option value="floor_stack">Floor Stack</option>
                <option value="palletized">Palletized</option>
                <option value="racked">Racked</option>
                <option value="shelving">Shelving</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Storage Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={formData.storage_height_m || ''}
                onChange={(e) => setFormData({ ...formData, storage_height_m: parseFloat(e.target.value) || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ceiling Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={formData.ceiling_height_m || ''}
                onChange={(e) => setFormData({ ...formData, ceiling_height_m: parseFloat(e.target.value) || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sprinkler Strategy</label>
              <select
                value={formData.sprinkler_strategy || ''}
                onChange={(e) => setFormData({ ...formData, sprinkler_strategy: e.target.value as SprinklerStrategy || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Select...</option>
                <option value="ceiling_only">Ceiling Only</option>
                <option value="in_rack">In-Rack</option>
                <option value="combined">Combined</option>
                <option value="esfr">ESFR</option>
                <option value="cmsa">CMSA</option>
                <option value="cmda">CMDA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Municipal Pressure (bar)</label>
              <input
                type="number"
                step="0.1"
                value={formData.municipal_pressure_bar || ''}
                onChange={(e) => setFormData({ ...formData, municipal_pressure_bar: parseFloat(e.target.value) || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Municipal Flow (L/min)</label>
              <input
                type="number"
                step="1"
                value={formData.municipal_flow_lpm || ''}
                onChange={(e) => setFormData({ ...formData, municipal_flow_lpm: parseFloat(e.target.value) || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Estimated Parameters */}
        {estimates && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Estimated Parameters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Design Density:</span>
                <p className="font-semibold">{estimates.densityMmPerMin} mm/min</p>
              </div>
              <div>
                <span className="text-gray-600">Design Area:</span>
                <p className="font-semibold">{estimates.designAreaM2} m²</p>
              </div>
              {estimates.flowRequiredLpm && (
                <>
                  <div>
                    <span className="text-gray-600">Flow Required:</span>
                    <p className="font-semibold">{estimates.flowRequiredLpm} L/min</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tank Size:</span>
                    <p className="font-semibold">{estimates.tankSizeM3} m³</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/fireconsult')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  )
}

