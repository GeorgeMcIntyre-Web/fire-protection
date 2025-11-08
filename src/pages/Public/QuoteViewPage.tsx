/**
 * Public Quote View Page
 * 
 * Allows clients to view quotes via secure token (no login required)
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { getQuoteTokenByToken, markTokenAsViewed, isTokenValid } from '../../lib/quote-tokens'
import { getQuote } from '../../lib/fireconsult'
import { formatCurrency } from '../../lib/fireconsult-quotes'
import { generateQuotePDF } from '../../lib/quote-pdf'
import type { Quote } from '../../lib/fireconsult-types'
import type { FireConsultJob } from '../../lib/fireconsult-types'

export default function QuoteViewPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [job, setJob] = useState<FireConsultJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [responseReason, setResponseReason] = useState('')

  useEffect(() => {
    if (token) {
      loadQuote()
    }
  }, [token])

  const loadQuote = async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      // Get token record
      const tokenRecord = await getQuoteTokenByToken(token)

      if (!tokenRecord) {
        setError('Invalid or expired link')
        return
      }

      // Check if expired
      if (!isTokenValid(tokenRecord)) {
        setError('This quote link has expired. Please contact us for a new link.')
        return
      }

      // Load quote details
      const quoteData = await getQuote(tokenRecord.quote_id)
      if (!quoteData) {
        setError('Quote not found')
        return
      }

      setQuote(quoteData)

      // Load job details (optional - quote can be viewed without job)
      try {
        const { supabase } = await import('../../lib/supabase')
        const { data: jobData } = await supabase
          .from('fire_consult_jobs')
          .select('*')
          .eq('id', quoteData.job_id)
          .single()
        
        if (jobData) {
          setJob(jobData as FireConsultJob)
        }
      } catch (err) {
        console.warn('Could not load job details:', err)
        // Continue without job data - quote can still be viewed
      }

      // Mark as viewed
      await markTokenAsViewed(token)
    } catch (err) {
      console.error('Failed to load quote:', err)
      setError('Failed to load quote. Please try again or contact us.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!quote || !confirm('Accept this quote? We will contact you shortly to proceed.')) {
      return
    }

    try {
      setSubmitting(true)

      // Update quote status
      const { supabase } = await import('../../lib/supabase')
      await supabase
        .from('quotes')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', quote.id)

      // Reload quote
      await loadQuote()
      alert('Thank you! Your quote acceptance has been recorded. We will contact you shortly.')
    } catch (error) {
      console.error('Failed to accept quote:', error)
      alert('Failed to submit acceptance. Please contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!quote) return

    const reason = prompt('Please tell us why you\'re declining this quote (optional):')
    if (reason === null) return // User cancelled

    try {
      setSubmitting(true)

      // Update quote status
      const { supabase } = await import('../../lib/supabase')
      await supabase
        .from('quotes')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', quote.id)

      // Reload quote
      await loadQuote()
      alert('Thank you for your feedback. We appreciate you letting us know.')
    } catch (error) {
      console.error('Failed to reject quote:', error)
      alert('Failed to submit response. Please contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!quote || !job) {
      alert('Quote information not available')
      return
    }

    try {
      // Reconstruct quote result from stored data
      const quoteResult = {
        breakdown: quote.cost_breakdown,
        grossProfit: quote.gross_profit,
        grossMarginPercent: quote.gross_margin_percent,
        finalQuoteExVat: quote.quote_ex_vat,
        vatAmount: quote.vat_amount,
        finalQuoteIncVat: quote.quote_inc_vat
      }

      generateQuotePDF({
        quote: quoteResult,
        job,
        quoteNumber: quote.quote_number,
        consultantName: 'Fire Protection Services',
        consultantCompany: 'Fire Protection Services'
      })
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF. Please contact us.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  if (!quote) {
    return null
  }

  const canRespond = quote.status === 'sent' || quote.status === 'viewed'
  const isExpired = new Date(quote.valid_until) < new Date()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fire Protection Quote</h1>
              <p className="text-sm text-gray-600 mt-1">Quote Number: {quote.quote_number}</p>
            </div>
            {quote.status === 'accepted' && (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-6 w-6 mr-2" />
                <span className="font-semibold">Accepted</span>
              </div>
            )}
            {quote.status === 'rejected' && (
              <div className="flex items-center text-red-600">
                <XCircleIcon className="h-6 w-6 mr-2" />
                <span className="font-semibold">Declined</span>
              </div>
            )}
          </div>

          {job && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.site_name}</h2>
              {job.site_address && <p className="text-gray-600">{job.site_address}</p>}
            </div>
          )}
        </div>

        {/* Quote Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Quote Type:</span>
              <span className="font-medium text-gray-900">
                {quote.quote_type === 'design_only' ? 'Design Only' : 'Full Installation'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Sprinkler Count:</span>
              <span className="font-medium text-gray-900">{quote.sprinkler_count} heads</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Hazard Category:</span>
              <span className="font-medium text-gray-900">{quote.hazard_category}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Valid Until:</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(quote.valid_until).toLocaleDateString('en-ZA')}
                {isExpired && ' (Expired)'}
              </span>
            </div>

            {/* Cost Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (Excl. VAT):</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quote.quote_ex_vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (15%):</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quote.vat_amount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total (Incl. VAT):</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(quote.quote_inc_vat)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canRespond && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Response</h2>
            <p className="text-gray-600 mb-6">
              Please review the quote above. You can accept or decline this quote.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAccept}
                disabled={submitting || isExpired}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {submitting ? 'Submitting...' : 'Accept Quote'}
              </button>

              <button
                onClick={handleReject}
                disabled={submitting || isExpired}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-red-600 rounded-md shadow-sm text-base font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                {submitting ? 'Submitting...' : 'Decline Quote'}
              </button>
            </div>

            {isExpired && (
              <p className="mt-4 text-sm text-red-600">
                This quote has expired. Please contact us for a new quote.
              </p>
            )}
          </div>
        )}

        {/* Download PDF */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Download Quote</h3>
              <p className="text-sm text-gray-600 mt-1">Download a PDF copy of this quote</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Questions? Contact us at info@fireprotection.co.za</p>
          <p className="mt-2">This is a secure quote link. Do not share this URL.</p>
        </div>
      </div>
    </div>
  )
}

