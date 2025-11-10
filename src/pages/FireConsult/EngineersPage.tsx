/**
 * Engineers Management Page
 * 
 * Manage fire protection engineers and their accreditations
 */

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useFireConsult } from '../../contexts/FireConsultContext'
import { createEngineer, updateEngineer, deleteEngineer, getAccreditations } from '../../lib/fireconsult'
import { useAuth } from '../../contexts/AuthContext'
import type { Engineer, EngineerInsert, Accreditation } from '../../lib/fireconsult-types'

export default function EngineersPage() {
  const { user } = useAuth()
  const { engineers, refreshEngineers } = useFireConsult()
  const [showModal, setShowModal] = useState(false)
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null)
  const [accreditations, setAccreditations] = useState<Record<string, Accreditation[]>>({})
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<EngineerInsert>>({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    registration_number: '',
    consultant_split_percentage: 90.00,
    engineer_split_percentage: 10.00,
    is_active: true,
    created_by: user?.id || ''
  })

  useEffect(() => {
    // Load accreditations for each engineer
    const loadAccreditations = async () => {
      const accMap: Record<string, Accreditation[]> = {}
      for (const eng of engineers) {
        try {
          const accs = await getAccreditations(eng.id)
          accMap[eng.id] = accs
        } catch (err) {
          accMap[eng.id] = []
        }
      }
      setAccreditations(accMap)
    }
    if (engineers.length > 0) {
      loadAccreditations()
    }
  }, [engineers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      if (editingEngineer) {
        await updateEngineer(editingEngineer.id, formData)
      } else {
        await createEngineer(formData as EngineerInsert)
      }
      await refreshEngineers()
      setShowModal(false)
      setEditingEngineer(null)
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        company_name: '',
        registration_number: '',
        consultant_split_percentage: 90.00,
        engineer_split_percentage: 10.00,
        is_active: true,
        created_by: user.id
      })
    } catch (error) {
      console.error('Error saving engineer:', error)
      alert('Failed to save engineer')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (engineer: Engineer) => {
    setEditingEngineer(engineer)
    setFormData({
      full_name: engineer.full_name,
      email: engineer.email,
      phone: engineer.phone || '',
      company_name: engineer.company_name || '',
      registration_number: engineer.registration_number || '',
      consultant_split_percentage: engineer.consultant_split_percentage,
      engineer_split_percentage: engineer.engineer_split_percentage,
      is_active: engineer.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this engineer?')) return

    try {
      await deleteEngineer(id)
      await refreshEngineers()
    } catch (error) {
      console.error('Error deleting engineer:', error)
      alert('Failed to delete engineer')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engineers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fire protection engineers and their accreditations
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEngineer(null)
            setFormData({
              full_name: '',
              email: '',
              phone: '',
              company_name: '',
              registration_number: '',
              consultant_split_percentage: 90.00,
              engineer_split_percentage: 10.00,
              is_active: true,
              created_by: user?.id || ''
            })
            setShowModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Engineer
        </button>
      </div>

      {/* Engineers List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
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
                Fee Split
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accreditations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {engineers.map((engineer) => (
              <tr key={engineer.id}>
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
                  {engineer.consultant_split_percentage}% / {engineer.engineer_split_percentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {accreditations[engineer.id]?.length || 0} active
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    engineer.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {engineer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(engineer)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(engineer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">
              {editingEngineer ? 'Edit Engineer' : 'Add Engineer'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={formData.company_name || ''}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <input
                  type="text"
                  value={formData.registration_number || ''}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultant Split (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consultant_split_percentage || 90}
                    onChange={(e) => {
                      const consultant = parseFloat(e.target.value) || 90
                      setFormData({
                        ...formData,
                        consultant_split_percentage: consultant,
                        engineer_split_percentage: 100 - consultant
                      })
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Engineer Split (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.engineer_split_percentage || 10}
                    onChange={(e) => {
                      const engineer = parseFloat(e.target.value) || 10
                      setFormData({
                        ...formData,
                        engineer_split_percentage: engineer,
                        consultant_split_percentage: 100 - engineer
                      })
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingEngineer(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

