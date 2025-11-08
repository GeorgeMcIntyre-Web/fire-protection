/**
 * Fire Consultancy Job Detail Page
 * 
 * Detailed view of a single fire protection design job
 */

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, DocumentArrowDownIcon, PencilIcon, CurrencyDollarIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { useJob } from '../../lib/fireconsult-hooks'
import { updateFireConsultJob, createDesignRequest } from '../../lib/fireconsult'
import { generateDesignRequestPDF } from '../../lib/design-request-pdf'
import { useFireConsult } from '../../contexts/FireConsultContext'
import { 
  generateQuoteFromJob, 
  formatCurrency, 
  generateQuoteNumber,
  type QuoteResult,
  mapCommodityToHazard
} from '../../lib/fireconsult-quotes'
import { generateQuotePDF } from '../../lib/quote-pdf'
import { createQuote, updateQuote } from '../../lib/fireconsult'
import { generateQuoteToken, generateQuoteUrl } from '../../lib/quote-tokens'
import { sendEmail, quoteEmailTemplate } from '../../lib/email'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { job, loading, error } = useJob(id || null)
  const { refreshAll } = useFireConsult()
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [quoteType, setQuoteType] = useState<'design_only' | 'full_installation'>('design_only')
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [customMargin, setCustomMargin] = useState<number | undefined>(undefined)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [quoteToken, setQuoteToken] = useState<string | null>(null)

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

  const handleGenerateQuote = () => {
    if (!job) return
    
    try {
      const result = generateQuoteFromJob(
        {
          estimated_sprinkler_count: job.estimated_sprinkler_count,
          commodity_class: job.commodity_class,
          requires_tank: job.requires_tank,
          requires_pump: job.requires_pump
        },
        quoteType,
        customMargin
      )
      setQuote(result)
    } catch (err) {
      console.error('Error generating quote:', err)
      alert(err instanceof Error ? err.message : 'Failed to generate quote')
    }
  }

  const handleSaveQuote = async () => {
    if (!quote || !job) return
    
    try {
      const quoteNumber = generateQuoteNumber(job.job_number)
      const hazardCategory = mapCommodityToHazard(job.commodity_class)
      
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 30)
      
      await createQuote({
        job_id: job.id,
        quote_type: quoteType,
        sprinkler_count: job.estimated_sprinkler_count || 0,
        hazard_category: hazardCategory,
        custom_margin_percent: customMargin || null,
        cost_breakdown: quote.breakdown,
        subtotal_cost: quote.breakdown.subtotalCost,
        gross_profit: quote.grossProfit,
        gross_margin_percent: quote.grossMarginPercent,
        quote_ex_vat: quote.finalQuoteExVat,
        vat_amount: quote.vatAmount,
        quote_inc_vat: quote.finalQuoteIncVat,
        status: 'draft',
        valid_until: validUntil.toISOString().split('T')[0],
        created_by: job.consultant_id
      })
      
      alert('Quote saved successfully!')
      await refreshAll()
    } catch (err) {
      console.error('Error saving quote:', err)
      alert('Failed to save quote')
    }
  }

  const handleGenerateQuotePDF = () => {
    if (!quote || !job) return
    
    const quoteNumber = generateQuoteNumber(job.job_number)
    generateQuotePDF({
      quote,
      job,
      quoteNumber,
      consultantName: 'Fire Consultant',
      consultantCompany: 'Fire Protection Services'
    })
  }

  const handleSendQuoteEmail = async () => {
    if (!quote || !job) return

    if (!job.contact_email) {
      alert('Client email not set. Please update job details first.')
      return
    }

    try {
      setSendingEmail(true)

      // First, save quote if not already saved
      let savedQuote
      try {
        const quoteNumber = generateQuoteNumber(job.job_number)
        const hazardCategory = mapCommodityToHazard(job.commodity_class)
        
        const validUntil = new Date()
        validUntil.setDate(validUntil.getDate() + 30)
        
        savedQuote = await createQuote({
          job_id: job.id,
          quote_type: quoteType,
          sprinkler_count: job.estimated_sprinkler_count || 0,
          hazard_category: hazardCategory,
          custom_margin_percent: customMargin || null,
          cost_breakdown: quote.breakdown,
          subtotal_cost: quote.breakdown.subtotalCost,
          gross_profit: quote.grossProfit,
          gross_margin_percent: quote.grossMarginPercent,
          quote_ex_vat: quote.finalQuoteExVat,
          vat_amount: quote.vatAmount,
          quote_inc_vat: quote.finalQuoteIncVat,
          status: 'draft',
          valid_until: validUntil.toISOString().split('T')[0],
          created_by: job.consultant_id
        })
      } catch (err) {
        // Quote might already exist - that's okay, we'll generate token anyway
        console.warn('Quote may already exist:', err)
      }

      // Generate secure token for the quote
      // If quote wasn't saved, we need to save it first or get existing
      if (!savedQuote) {
        // Try to get existing quote for this job
        const { getQuotes } = await import('../../lib/fireconsult')
        const existingQuotes = await getQuotes(job.id)
        savedQuote = existingQuotes[0] // Get most recent
      }

      if (!savedQuote) {
        alert('Please save the quote first before sending email')
        return
      }

      const token = await generateQuoteToken(savedQuote.id, 30)
      const quoteUrl = generateQuoteUrl(token)
      
      // Send email
      const template = quoteEmailTemplate(
        job.contact_person || job.site_name,
        job.contact_email,
        quoteUrl, // Secure link instead of PDF
        job.site_name,
        savedQuote.quote_number,
        quote.finalQuoteIncVat
      )

      await sendEmail(template)

      // Update quote status
      await updateQuote(savedQuote.id, { status: 'sent' })

      setQuoteToken(token)
      alert('Quote email sent successfully! Client can view and respond via the secure link.')
      await refreshAll()
    } catch (err) {
      console.error('Error sending quote email:', err)
      alert('Failed to send quote email. Please try again.')
    } finally {
      setSendingEmail(false)
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

      {/* Quote Generator */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generate Quote</h2>
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* Quote Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quote Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="design_only"
                  checked={quoteType === 'design_only'}
                  onChange={(e) => setQuoteType(e.target.value as 'design_only' | 'full_installation')}
                  className="mr-2"
                />
                <span className="text-sm">Design Only (50% margin)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full_installation"
                  checked={quoteType === 'full_installation'}
                  onChange={(e) => setQuoteType(e.target.value as 'design_only' | 'full_installation')}
                  className="mr-2"
                />
                <span className="text-sm">Full Installation (25% margin)</span>
              </label>
            </div>
          </div>

          {/* Custom Margin (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Margin % (Optional - leave blank for default)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={customMargin || ''}
              onChange={(e) => setCustomMargin(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder={quoteType === 'design_only' ? '50 (default)' : '25 (default)'}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            />
          </div>

          {/* Generate Button */}
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateQuote}
              disabled={!job.estimated_sprinkler_count || job.estimated_sprinkler_count === 0}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Generate Quote
            </button>
          </div>

          {/* Quote Results */}
          {quote && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Quote: {generateQuoteNumber(job.job_number)}
              </h3>
              
              {/* Cost Breakdown */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Cost Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Engineering:</span>
                    <span className="font-medium">{formatCurrency(quote.breakdown.engineeringCost)}</span>
                  </div>
                  {quote.breakdown.fabricationCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fabrication:</span>
                      <span className="font-medium">{formatCurrency(quote.breakdown.fabricationCost)}</span>
                    </div>
                  )}
                  {quote.breakdown.installationLabour > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Installation Labour:</span>
                      <span className="font-medium">{formatCurrency(quote.breakdown.installationLabour)}</span>
                    </div>
                  )}
                  {quote.breakdown.hardwareCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hardware:</span>
                      <span className="font-medium">{formatCurrency(quote.breakdown.hardwareCost)}</span>
                    </div>
                  )}
                  {quote.breakdown.waterSupplyCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water Supply (Pumps & Tanks):</span>
                      <span className="font-medium">{formatCurrency(quote.breakdown.waterSupplyCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-green-300">
                    <span className="text-gray-700 font-medium">Subtotal (Cost):</span>
                    <span className="font-semibold">{formatCurrency(quote.breakdown.subtotalCost)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span className="font-medium">Gross Profit ({quote.grossMarginPercent.toFixed(1)}%):</span>
                    <span className="font-semibold">{formatCurrency(quote.grossProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Final Pricing */}
              <div className="pt-4 border-t border-green-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Quote (Excl. VAT):</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(quote.finalQuoteExVat)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">VAT (15%):</span>
                  <span className="text-lg font-semibold text-gray-700">{formatCurrency(quote.vatAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-green-400">
                  <span className="text-base font-semibold text-gray-900">Total (Incl. VAT):</span>
                  <span className="text-2xl font-bold text-green-700">{formatCurrency(quote.finalQuoteIncVat)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4 pt-4 border-t border-green-300">
                <p className="text-xs text-gray-600 mb-3">
                  Quote valid for 30 days. Based on ASIB Rule Book 2024 parameters.
                </p>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveQuote}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                  >
                    Save Quote
                  </button>
                  <button
                    onClick={handleGenerateQuotePDF}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Generate PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {!job.estimated_sprinkler_count && (
            <p className="text-sm text-yellow-600">
              ⚠️ Sprinkler count required to generate quote. Please update job details first.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

