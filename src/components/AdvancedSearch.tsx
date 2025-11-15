/**
 * Advanced Search Component
 * 
 * Reusable search and filter component
 */

import React, { useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { searchJobs, exportJobsToCSV, type SearchFilters } from '../lib/search'
import type { FireConsultJob } from '../lib/fireconsult-types'

export interface AdvancedSearchProps {
  onResults: (results: FireConsultJob[]) => void
  onExport?: (results: FireConsultJob[]) => void
  placeholder?: string
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onResults,
  onExport,
  placeholder = 'Search jobs...'
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<FireConsultJob[]>([])

  const handleSearch = async () => {
    try {
      setSearching(true)
      const searchFilters: SearchFilters = {
        query: searchQuery || undefined,
        ...filters
      }
      const data = await searchJobs(searchFilters)
      setResults(data)
      onResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      alert('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilters({})
    setResults([])
    onResults([])
  }

  const handleExport = () => {
    if (results.length === 0) {
      alert('No results to export')
      return
    }
    if (onExport) {
      onExport(results)
    } else {
      exportJobsToCSV(results)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-md border ${
            showFilters
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
        </button>
        {results.length > 0 && (
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            title="Export to CSV"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        )}
        {(searchQuery || Object.keys(filters).length > 0) && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="pending_engineer">Pending Engineer</option>
                <option value="design_in_progress">Design In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commodity Class
              </label>
              <select
                value={filters.commodity_class || ''}
                onChange={(e) => setFilters({ ...filters, commodity_class: e.target.value || undefined })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              >
                <option value="">All Classes</option>
                <option value="Class I">Class I</option>
                <option value="Class II">Class II</option>
                <option value="Class II/III">Class II/III</option>
                <option value="Class III">Class III</option>
                <option value="Class IV">Class IV</option>
                <option value="Group A Plastics">Group A Plastics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Number
              </label>
              <input
                type="text"
                placeholder="FC-2025-001"
                value={filters.job_number || ''}
                onChange={(e) => setFilters({ ...filters, job_number: e.target.value || undefined })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              />
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}



