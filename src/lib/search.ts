/**
 * Advanced Search & Filtering
 * 
 * Enhanced search functionality for jobs, quotes, and documents
 */

import { supabase } from './supabase'
import type { FireConsultJob } from './fireconsult-types'
import type { Quote } from './fireconsult-types'

export interface SearchFilters {
  query?: string
  status?: string
  engineer_id?: string
  date_from?: string
  date_to?: string
  commodity_class?: string
  min_value?: number
  max_value?: number
  job_number?: string
}

/**
 * Search Fire Consultancy jobs with advanced filters
 */
export async function searchJobs(filters: SearchFilters): Promise<FireConsultJob[]> {
  let query = supabase
    .from('fire_consult_jobs')
    .select('*, engineer:engineers(name, email)')
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.engineer_id) {
    query = query.eq('assigned_engineer_id', filters.engineer_id)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  if (filters.commodity_class) {
    query = query.eq('commodity_class', filters.commodity_class)
  }

  if (filters.job_number) {
    query = query.ilike('job_number', `%${filters.job_number}%`)
  }

  if (filters.query) {
    query = query.or(
      `job_number.ilike.%${filters.query}%,` +
      `site_name.ilike.%${filters.query}%,` +
      `client_name.ilike.%${filters.query}%,` +
      `contact_person.ilike.%${filters.query}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Search quotes with filters
 */
export async function searchQuotes(filters: SearchFilters & {
  quote_type?: 'design_only' | 'full_installation'
  quote_status?: string
}): Promise<Quote[]> {
  let query = supabase
    .from('quotes')
    .select('*, job:fire_consult_jobs(site_name, job_number)')
    .order('created_at', { ascending: false })

  if (filters.quote_status) {
    query = query.eq('status', filters.quote_status)
  }

  if (filters.quote_type) {
    query = query.eq('quote_type', filters.quote_type)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  if (filters.min_value) {
    query = query.gte('quote_inc_vat', filters.min_value)
  }

  if (filters.max_value) {
    query = query.lte('quote_inc_vat', filters.max_value)
  }

  if (filters.query) {
    query = query.ilike('quote_number', `%${filters.query}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; label: string }>
): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Use provided columns or auto-detect from first row
  const headers = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    label: String(key).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }))

  // Build CSV content
  const csvRows = [
    // Header row
    headers.map(h => h.label).join(','),
    // Data rows
    ...data.map(row =>
      headers.map(h => {
        const value = row[h.key]
        // Handle null/undefined
        if (value === null || value === undefined) return ''
        // Handle objects/arrays
        if (typeof value === 'object') return JSON.stringify(value)
        // Escape commas and quotes
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ]

  const csv = csvRows.join('\n')

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Export jobs to CSV
 */
export function exportJobsToCSV(jobs: FireConsultJob[]): void {
  exportToCSV(jobs, 'fire-consultancy-jobs', [
    { key: 'job_number', label: 'Job Number' },
    { key: 'site_name', label: 'Site Name' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'status', label: 'Status' },
    { key: 'commodity_class', label: 'Commodity Class' },
    { key: 'estimated_sprinkler_count', label: 'Sprinkler Count' },
    { key: 'total_design_fee', label: 'Design Fee' },
    { key: 'created_at', label: 'Created Date' }
  ])
}

/**
 * Export quotes to CSV
 */
export function exportQuotesToCSV(quotes: Quote[]): void {
  exportToCSV(quotes, 'quotes', [
    { key: 'quote_number', label: 'Quote Number' },
    { key: 'quote_type', label: 'Quote Type' },
    { key: 'sprinkler_count', label: 'Sprinkler Count' },
    { key: 'hazard_category', label: 'Hazard Category' },
    { key: 'quote_inc_vat', label: 'Total (Inc. VAT)' },
    { key: 'status', label: 'Status' },
    { key: 'valid_until', label: 'Valid Until' },
    { key: 'created_at', label: 'Created Date' }
  ])
}

