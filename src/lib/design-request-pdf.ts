/**
 * Design Request PDF Generator
 * 
 * Generates PDF documents for fire protection design requests
 * to be sent to engineers for sign-off
 */

import type { FireConsultJob, Engineer } from './fireconsult-types'

// Note: This uses a simple text-based approach. For production, you may want to use:
// - jsPDF (client-side)
// - @react-pdf/renderer (React-based)
// - Or generate on server-side with Puppeteer/Playwright

export interface DesignRequestPDFData {
  job: FireConsultJob
  engineer?: Engineer | null
  consultantName?: string
  consultantCompany?: string
}

/**
 * Generate Design Request PDF content
 * Returns HTML that can be converted to PDF or displayed
 */
export function generateDesignRequestHTML(data: DesignRequestPDFData): string {
  const { job, engineer, consultantName, consultantCompany } = data
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fire Protection Design Request - ${job.job_number}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #dc2626;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #dc2626;
      margin: 0;
      font-size: 24px;
    }
    .header .job-number {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      background-color: #f3f4f6;
      padding: 10px 15px;
      font-weight: bold;
      border-left: 4px solid #dc2626;
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
    .hazard-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .hazard-table th,
    .hazard-table td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    .hazard-table th {
      background-color: #f9fafb;
      font-weight: bold;
    }
    .design-params {
      background-color: #fef3c7;
      padding: 15px;
      border-left: 4px solid #f59e0b;
      margin: 15px 0;
    }
    .water-supply {
      background-color: #dbeafe;
      padding: 15px;
      border-left: 4px solid #3b82f6;
      margin: 15px 0;
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
    <h1>Fire Protection Design Request</h1>
    <div class="job-number">Job Number: ${job.job_number}</div>
  </div>

  <div class="section">
    <div class="section-title">Project Information</div>
    <div class="info-grid">
      <div class="info-label">Site Name:</div>
      <div class="info-value">${job.site_name}</div>
      
      <div class="info-label">Site Address:</div>
      <div class="info-value">${job.site_address || 'N/A'}</div>
      
      <div class="info-label">Contact Person:</div>
      <div class="info-value">${job.contact_person || 'N/A'}</div>
      
      <div class="info-label">Contact Email:</div>
      <div class="info-value">${job.contact_email || 'N/A'}</div>
      
      <div class="info-label">Contact Phone:</div>
      <div class="info-value">${job.contact_phone || 'N/A'}</div>
      
      <div class="info-label">Site Visit Date:</div>
      <div class="info-value">${formatDate(job.site_visit_date)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Storage Hazard Classification</div>
    <table class="hazard-table">
      <tr>
        <th>Parameter</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Commodity Class</td>
        <td>${job.commodity_class || 'N/A'}</td>
      </tr>
      <tr>
        <td>Storage Method</td>
        <td>${job.storage_method ? formatStorageMethod(job.storage_method) : 'N/A'}</td>
      </tr>
      <tr>
        <td>Storage Height</td>
        <td>${job.storage_height_m ? `${job.storage_height_m} m` : 'N/A'}</td>
      </tr>
      <tr>
        <td>Ceiling Height</td>
        <td>${job.ceiling_height_m ? `${job.ceiling_height_m} m` : 'N/A'}</td>
      </tr>
      <tr>
        <td>Flue Spacing (if racked)</td>
        <td>${job.flue_spacing_m ? `${job.flue_spacing_m} m` : 'N/A'}</td>
      </tr>
      <tr>
        <td>Sprinkler Strategy</td>
        <td>${job.sprinkler_strategy ? formatSprinklerStrategy(job.sprinkler_strategy) : 'N/A'}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Design Parameters (Baseline Assumptions)</div>
    <div class="design-params">
      <div class="info-grid">
        <div class="info-label">Design Density:</div>
        <div class="info-value">${job.design_density_mm_per_min ? `${job.design_density_mm_per_min} mm/min` : 'N/A'}</div>
        
        <div class="info-label">Design Area:</div>
        <div class="info-value">${job.design_area_m2 ? `${job.design_area_m2} m²` : 'N/A'}</div>
        
        <div class="info-label">Estimated Sprinkler Count:</div>
        <div class="info-value">${job.estimated_sprinkler_count || 'N/A'}</div>
        
        <div class="info-label">Sprinkler Spacing:</div>
        <div class="info-value">${job.sprinkler_spacing_m2 ? `${job.sprinkler_spacing_m2} m² per head` : 'N/A'}</div>
      </div>
      <p style="margin-top: 10px; font-size: 12px; color: #666;">
        <strong>Note:</strong> These are baseline assumptions based on site assessment. 
        Engineer may adjust based on hydraulic calculations and standards compliance.
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Water Supply Information</div>
    <div class="water-supply">
      <div class="info-grid">
        <div class="info-label">Municipal Pressure:</div>
        <div class="info-value">${job.municipal_pressure_bar ? `${job.municipal_pressure_bar} bar` : 'N/A'}</div>
        
        <div class="info-label">Municipal Flow:</div>
        <div class="info-value">${job.municipal_flow_lpm ? `${job.municipal_flow_lpm} L/min` : 'N/A'}</div>
        
        <div class="info-label">Estimated Flow Required:</div>
        <div class="info-value">${job.estimated_flow_required_lpm ? `${job.estimated_flow_required_lpm} L/min` : 'N/A'}</div>
        
        <div class="info-label">Tank Required:</div>
        <div class="info-value">${job.requires_tank ? 'Yes' : 'No'}</div>
        
        <div class="info-label">Estimated Tank Size:</div>
        <div class="info-value">${job.estimated_tank_size_m3 ? `${job.estimated_tank_size_m3} m³` : 'N/A'}</div>
        
        <div class="info-label">Pump Required:</div>
        <div class="info-value">${job.requires_pump ? 'Yes' : 'No'}</div>
        
        <div class="info-label">Pump Type:</div>
        <div class="info-value">${job.pump_type ? formatPumpType(job.pump_type) : 'N/A'}</div>
        
        <div class="info-label">Duration:</div>
        <div class="info-value">${job.estimated_duration_minutes ? `${job.estimated_duration_minutes} minutes` : 'N/A'}</div>
      </div>
    </div>
  </div>

  ${job.site_notes ? `
  <div class="section">
    <div class="section-title">Site Notes</div>
    <p>${job.site_notes.replace(/\n/g, '<br>')}</p>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Request Details</div>
    <p>
      This design request is for the fire protection system design and hydraulic calculations 
      for the above site. Please review the provided information and:
    </p>
    <ul>
      <li>Perform hydraulic calculations using AutoSPRINK, HydraCALC, or equivalent software</li>
      <li>Verify design parameters meet SANS 10252 / NFPA 13 requirements</li>
      <li>Provide signed fire plan drawings</li>
      <li>Upload hydraulic calculation files</li>
      <li>Note any adjustments to baseline assumptions</li>
    </ul>
  </div>

  ${engineer ? `
  <div class="section">
    <div class="section-title">Assigned Engineer</div>
    <div class="info-grid">
      <div class="info-label">Name:</div>
      <div class="info-value">${engineer.full_name}</div>
      
      <div class="info-label">Company:</div>
      <div class="info-value">${engineer.company_name || 'N/A'}</div>
      
      <div class="info-label">Email:</div>
      <div class="info-value">${engineer.email}</div>
      
      <div class="info-label">Phone:</div>
      <div class="info-value">${engineer.phone || 'N/A'}</div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>Generated:</strong> ${new Date().toLocaleString('en-ZA')}</p>
    ${consultantName ? `<p><strong>Consultant:</strong> ${consultantName}${consultantCompany ? ` (${consultantCompany})` : ''}</p>` : ''}
    <p style="margin-top: 20px; font-size: 11px; color: #999;">
      This document is generated automatically. For questions, please contact the consultant.
    </p>
  </div>
</body>
</html>
  `.trim()
}

function formatStorageMethod(method: string): string {
  const map: Record<string, string> = {
    'floor_stack': 'Floor Stack',
    'palletized': 'Palletized',
    'racked': 'Racked',
    'shelving': 'Shelving',
    'mixed': 'Mixed'
  }
  return map[method] || method
}

function formatSprinklerStrategy(strategy: string): string {
  const map: Record<string, string> = {
    'ceiling_only': 'Ceiling Only',
    'in_rack': 'In-Rack',
    'combined': 'Combined (Ceiling + In-Rack)',
    'esfr': 'ESFR (Early Suppression Fast Response)',
    'cmsa': 'CMSA (Control Mode Specific Application)',
    'cmda': 'CMDA (Control Mode Density Area)'
  }
  return map[strategy] || strategy
}

function formatPumpType(pumpType: string): string {
  const map: Record<string, string> = {
    'diesel': 'Diesel Fire Pump',
    'electric': 'Electric Fire Pump',
    'jockey': 'Jockey Pump',
    'none': 'No Pump Required'
  }
  return map[pumpType] || pumpType
}

/**
 * Generate Design Request PDF (client-side using browser print)
 * Opens print dialog for user to save as PDF
 */
export function generateDesignRequestPDF(data: DesignRequestPDFData): void {
  const html = generateDesignRequestHTML(data)
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
 * Download Design Request as HTML file
 */
export function downloadDesignRequestHTML(data: DesignRequestPDFData, filename?: string): void {
  const html = generateDesignRequestHTML(data)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `design-request-${data.job.job_number}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

