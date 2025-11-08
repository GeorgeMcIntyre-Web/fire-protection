/**
 * Quotes Management Page
 * 
 * View and manage all quotes across jobs
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DocumentArrowDownIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { getQuotes, updateQuote, type Quote } from '../../lib/fireconsult'
import { generateQuotePDF } from '../../lib/quote-pdf'
import { sendEmail, quoteEmailTemplate } from '../../lib/email'
import { formatCurrency } from '../../lib/fireconsult-quotes'

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all')
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const data = await getQuotes()
      setQuotes(data)
    } catch (error) {
      console.error('Failed to load quotes:', error)
      alert('Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      await updateQuote(quoteId, { status: newStatus })
      await loadQuotes()
    } catch (error) {
      console.error('Failed to update quote status:', error)
      alert('Failed to update quote status')
    }
  }

  const handleSendEmail = async (quote: Quote) => {
    // For now, we'll need job data - this is a simplified version
    // In production, you'd fetch the job details
    if (!quote.job_id) {
      alert('Job information not available')
      return
    }

    try {
      setSendingEmail(quote.id)
      
      // Generate PDF URL (in production, this would be stored)
      const quotePdfUrl = quote.pdf_url || '#'
      
      // For now, we'll use placeholder data
      // In production, fetch job details to get client email
      const template = quoteEmailTemplate(
        'Client Name', // Would come from job
        'client@example.com', // Would come from job
        quotePdfUrl,
        'Project Name', // Would come from job
        quote.quote_number,
        quote.quote_inc_vat
      )

      await sendEmail(template)
      
      // Update quote status
      await updateQuote(quote.id, { 
        status: 'sent',
        // In production, store sent_at timestamp
      })
      
      await loadQuotes()
      alert('Quote sent successfully!')
    } catch (error) {
      console.error('Failed to send quote:', error)
      alert('Failed to send quote email')
    } finally {
      setSendingEmail(null)
    }
  }

  const handleGeneratePDF = (quote: Quote) => {
    // This would need job data - simplified for now
    // In production, fetch job and generate PDF
    alert('PDF generation requires job data. Use the job detail page.')
  }

  const filteredQuotes = filter === 'all' 
    ? quotes 
    : quotes.filter(q => q.status === filter)

  const getStatusBadge = (status: Quote['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-purple-100 text-purple-800'
    }

    const icons = {
      draft: ClockIcon,
      sent: EnvelopeIcon,
      accepted: CheckCircleIcon,
      rejected: XCircleIcon,
      expired: ClockIcon,
      converted: CheckCircleIcon
    }

    const Icon = icons[status] || ClockIcon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all quotes across fire consultancy jobs
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {(['all', 'draft', 'sent', 'accepted', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              filter === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All Quotes' : status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {quotes.filter(q => q.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quotes Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Create your first quote from a job detail page'
                : `No quotes with status "${filter}"`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quote.quote_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/fireconsult/jobs/${quote.job_id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Job
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {quote.quote_type === 'design_only' ? 'Design Only' : 'Full Installation'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(quote.quote_inc_vat)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(quote.valid_until).toLocaleDateString()}
                      </div>
                      {new Date(quote.valid_until) < new Date() && quote.status !== 'accepted' && (
                        <div className="text-xs text-red-600">Expired</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <select
                          value={quote.status}
                          onChange={(e) => handleStatusChange(quote.id, e.target.value as Quote['status'])}
                          className="text-xs border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="expired">Expired</option>
                          <option value="converted">Converted</option>
                        </select>
                        
                        {quote.status === 'draft' && (
                          <button
                            onClick={() => handleSendEmail(quote)}
                            disabled={sendingEmail === quote.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Send email"
                          >
                            <EnvelopeIcon className="h-5 w-5" />
                          </button>
                        )}
                        
                        <Link
                          to={`/fireconsult/jobs/${quote.job_id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="View job"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

