/**
 * Quote PDF Generator
 * 
 * Generates professional quote documents for clients
 */

import type { QuoteResult } from './fireconsult-quotes'
import type { FireConsultJob } from './fireconsult-types'
import { formatCurrency } from './fireconsult-quotes'

export interface QuotePDFData {
  quote: QuoteResult
  job: FireConsultJob
  quoteNumber: string
  consultantName?: string
  consultantCompany?: string
  consultantEmail?: string
  consultantPhone?: string
  terms?: string[]
}

/**
 * Generate Quote PDF HTML content
 */
export function generateQuoteHTML(data: QuotePDFData): string {
  const { quote, job, quoteNumber, consultantName, consultantCompany, consultantEmail, consultantPhone, terms } = data
  
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)
  
  const defaultTerms = [
    'Quote valid for 30 days from date of issue',
    'Payment terms: 50% on acceptance, 50% on completion',
    'All work to be completed in accordance with ASIB Rule Book 2024',
    'Prices exclude any site-specific access requirements',
    'Final pricing subject to site survey confirmation'
  ]
  
  const quoteTerms = terms || defaultTerms
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fire Protection Quote - ${quoteNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #16a34a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #16a34a;
      margin: 0;
      font-size: 28px;
    }
    .header .quote-number {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .company-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      background-color: #f3f4f6;
      padding: 10px 15px;
      font-weight: bold;
      border-left: 4px solid #16a34a;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 10px 20px;
      margin-bottom: 15px;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .cost-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .cost-table th,
    .cost-table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    .cost-table th {
      background-color: #f9fafb;
      font-weight: bold;
    }
    .cost-table .total-row {
      background-color: #f0fdf4;
      font-weight: bold;
    }
    .cost-table .subtotal-row {
      background-color: #f9fafb;
      font-weight: 600;
    }
    .pricing-summary {
      background-color: #f0fdf4;
      padding: 20px;
      border-left: 4px solid #16a34a;
      margin: 20px 0;
    }
    .pricing-summary .total {
      font-size: 24px;
      font-weight: bold;
      color: #16a34a;
      margin-top: 10px;
    }
    .terms-list {
      list-style: none;
      padding: 0;
    }
    .terms-list li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    .terms-list li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #16a34a;
      font-weight: bold;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
    .signature-block {
      margin-top: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 50px;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fire Protection System Quote</h1>
    <div class="quote-number">Quote Number: ${quoteNumber}</div>
    <div style="margin-top: 10px; font-size: 12px; color: #666;">
      Date: ${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
      | Valid Until: ${validUntil.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  </div>

  <div class="company-info">
    <div>
      <h3 style="margin-top: 0;">To:</h3>
      <p><strong>${job.site_name}</strong></p>
      ${job.site_address ? `<p>${job.site_address}</p>` : ''}
      ${job.contact_person ? `<p>Attn: ${job.contact_person}</p>` : ''}
      ${job.contact_email ? `<p>${job.contact_email}</p>` : ''}
      ${job.contact_phone ? `<p>${job.contact_phone}</p>` : ''}
    </div>
    <div>
      <h3 style="margin-top: 0;">From:</h3>
      <p><strong>${consultantCompany || 'Fire Protection Services'}</strong></p>
      ${consultantName ? `<p>${consultantName}</p>` : ''}
      ${consultantEmail ? `<p>${consultantEmail}</p>` : ''}
      ${consultantPhone ? `<p>${consultantPhone}</p>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Project Summary</div>
    <div class="info-grid">
      <div class="info-label">Job Number:</div>
      <div class="info-value">${job.job_number}</div>
      
      <div class="info-label">Site Name:</div>
      <div class="info-value">${job.site_name}</div>
      
      ${job.commodity_class ? `
      <div class="info-label">Hazard Classification:</div>
      <div class="info-value">${job.commodity_class}</div>
      ` : ''}
      
      ${job.estimated_sprinkler_count ? `
      <div class="info-label">Estimated Sprinklers:</div>
      <div class="info-value">${job.estimated_sprinkler_count} heads</div>
      ` : ''}
      
      ${job.estimated_tank_size_m3 ? `
      <div class="info-label">Water Supply:</div>
      <div class="info-value">${job.estimated_tank_size_m3} m³ tank + pump system</div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Cost Breakdown</div>
    <table class="cost-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: right;">Amount (ZAR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Engineering & Design</td>
          <td style="text-align: right;">${formatCurrency(quote.breakdown.engineeringCost)}</td>
        </tr>
        ${quote.breakdown.fabricationCost > 0 ? `
        <tr>
          <td>Fabrication (Pipe Cutting & Threading)</td>
          <td style="text-align: right;">${formatCurrency(quote.breakdown.fabricationCost)}</td>
        </tr>
        ` : ''}
        ${quote.breakdown.installationLabour > 0 ? `
        <tr>
          <td>Installation Labour</td>
          <td style="text-align: right;">${formatCurrency(quote.breakdown.installationLabour)}</td>
        </tr>
        ` : ''}
        ${quote.breakdown.hardwareCost > 0 ? `
        <tr>
          <td>Hardware (Sprinklers, Pipes, Valves)</td>
          <td style="text-align: right;">${formatCurrency(quote.breakdown.hardwareCost)}</td>
        </tr>
        ` : ''}
        ${quote.breakdown.waterSupplyCost > 0 ? `
        <tr>
          <td>Water Supply (Pumps & Tanks)</td>
          <td style="text-align: right;">${formatCurrency(quote.breakdown.waterSupplyCost)}</td>
        </tr>
        ` : ''}
        <tr class="subtotal-row">
          <td><strong>Subtotal (Cost)</strong></td>
          <td style="text-align: right;"><strong>${formatCurrency(quote.breakdown.subtotalCost)}</strong></td>
        </tr>
        <tr>
          <td>Gross Profit (${quote.grossMarginPercent.toFixed(1)}%)</td>
          <td style="text-align: right;">${formatCurrency(quote.grossProfit)}</td>
        </tr>
        <tr class="subtotal-row">
          <td><strong>Total (Excl. VAT)</strong></td>
          <td style="text-align: right;"><strong>${formatCurrency(quote.finalQuoteExVat)}</strong></td>
        </tr>
        <tr>
          <td>VAT (15%)</td>
          <td style="text-align: right;">${formatCurrency(quote.vatAmount)}</td>
        </tr>
        <tr class="total-row">
          <td><strong>TOTAL (Incl. VAT)</strong></td>
          <td style="text-align: right; font-size: 18px;"><strong>${formatCurrency(quote.finalQuoteIncVat)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="pricing-summary">
    <div style="font-size: 14px; color: #666;">Total Quote Amount</div>
    <div class="total">${formatCurrency(quote.finalQuoteIncVat)}</div>
    <div style="font-size: 12px; color: #666; margin-top: 5px;">Including VAT</div>
  </div>

  <div class="section">
    <div class="section-title">Terms & Conditions</div>
    <ul class="terms-list">
      ${quoteTerms.map(term => `<li>${term}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Scope of Work</div>
    <p>This quote includes:</p>
    <ul class="terms-list">
      ${quote.breakdown.engineeringCost > 0 ? '<li>Fire protection system design and engineering</li>' : ''}
      ${quote.breakdown.fabricationCost > 0 ? '<li>Pipe fabrication and preparation</li>' : ''}
      ${quote.breakdown.installationLabour > 0 ? '<li>On-site installation by certified technicians</li>' : ''}
      ${quote.breakdown.hardwareCost > 0 ? '<li>Supply of all sprinkler heads, pipes, valves, and fittings</li>' : ''}
      ${quote.breakdown.waterSupplyCost > 0 ? '<li>Fire pump and water storage tank installation</li>' : ''}
      <li>ASIB approval and compliance documentation</li>
      <li>System testing and commissioning</li>
    </ul>
  </div>

  <div class="footer">
    <div class="signature-block">
      <div>
        <div class="signature-line"></div>
        <p style="margin-top: 5px; font-size: 11px;">Authorized Signature</p>
        <p style="margin-top: 5px; font-size: 11px;">${consultantName || 'Fire Consultant'}</p>
      </div>
      <div>
        <div class="signature-line"></div>
        <p style="margin-top: 5px; font-size: 11px;">Client Acceptance</p>
        <p style="margin-top: 5px; font-size: 11px;">Date: _______________</p>
      </div>
    </div>
    <p style="margin-top: 30px; font-size: 11px; color: #999;">
      This quote is generated automatically. For questions, please contact ${consultantEmail || 'the consultant'}.
    </p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate Quote PDF (opens browser print dialog)
 */
export function generateQuotePDF(data: QuotePDFData): void {
  const html = generateQuoteHTML(data)
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Please allow pop-ups to generate PDF')
    return
  }
  
  printWindow.document.write(html)
  printWindow.document.close()
  
  // Wait for content to load, then trigger print
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

/**
 * Download Quote as HTML file
 */
export function downloadQuoteHTML(data: QuotePDFData, filename?: string): void {
  const html = generateQuoteHTML(data)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `quote-${data.quoteNumber}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

