/**
 * PDF Export Utilities for Reports
 * 
 * To use this module, install the required dependencies:
 * npm install jspdf jspdf-autotable
 * npm install --save-dev @types/jspdf
 * 
 * Then uncomment the imports and use the functions below.
 */

// Uncomment these imports after installing jspdf
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'

interface PDFExportOptions {
  title: string
  filename: string
  companyName?: string
  companyLogo?: string
  orientation?: 'portrait' | 'landscape'
}

/**
 * Export Project Progress Report to PDF
 * 
 * @example
 * exportProjectProgressPDF(progressData, {
 *   title: 'Project Progress Report',
 *   filename: 'project-progress',
 *   companyName: 'Fire Protection Services'
 * })
 */
export function exportProjectProgressPDF(data: any[], options: PDFExportOptions): void {
  console.warn('PDF export requires jsPDF library. Install with: npm install jspdf jspdf-autotable')
  
  // Uncomment the implementation below after installing jspdf
  
  /*
  const doc = new jsPDF({
    orientation: options.orientation || 'landscape'
  })

  // Add company branding
  doc.setFontSize(20)
  doc.text(options.title, 14, 20)
  
  if (options.companyName) {
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(options.companyName, 14, 28)
  }

  // Add date
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35)

  // Create table
  autoTable(doc, {
    startY: 45,
    head: [['Project', 'Client', 'Status', 'Progress %', 'Tasks', 'Due Date', 'On Track']],
    body: data.map(p => [
      p.name,
      p.client_name,
      p.status,
      `${p.progress}%`,
      `${p.completed_tasks}/${p.total_tasks}`,
      p.due_date ? new Date(p.due_date).toLocaleDateString() : 'Not set',
      p.on_track ? 'Yes' : 'No'
    ]),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  })

  // Save PDF
  doc.save(`${options.filename}_${new Date().toISOString().split('T')[0]}.pdf`)
  */
}

/**
 * Export Budget Summary Report to PDF
 * 
 * Includes color coding for over-budget projects
 */
export function exportBudgetSummaryPDF(data: any[], options: PDFExportOptions): void {
  console.warn('PDF export requires jsPDF library. Install with: npm install jspdf jspdf-autotable')
  
  /*
  const doc = new jsPDF({
    orientation: options.orientation || 'landscape'
  })

  // Add header
  doc.setFontSize(20)
  doc.text(options.title, 14, 20)
  
  if (options.companyName) {
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(options.companyName, 14, 28)
  }

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35)

  // Calculate totals
  const totalEstimated = data.reduce((sum, b) => sum + b.estimated, 0)
  const totalActual = data.reduce((sum, b) => sum + b.actual, 0)
  const totalVariance = data.reduce((sum, b) => sum + b.variance, 0)

  // Add summary
  doc.setFontSize(12)
  doc.text('Summary', 14, 45)
  doc.setFontSize(10)
  doc.text(`Total Estimated: $${totalEstimated.toFixed(2)}`, 14, 52)
  doc.text(`Total Actual: $${totalActual.toFixed(2)}`, 14, 58)
  doc.text(`Total Variance: $${totalVariance.toFixed(2)}`, 14, 64)

  // Create table with conditional formatting
  autoTable(doc, {
    startY: 75,
    head: [['Project', 'Client', 'Estimated', 'Actual', 'Variance', 'Variance %', 'Status']],
    body: data.map(b => [
      b.project_name,
      b.client_name,
      `$${b.estimated.toFixed(2)}`,
      `$${b.actual.toFixed(2)}`,
      `$${b.variance.toFixed(2)}`,
      `${b.variance_percentage.toFixed(2)}%`,
      b.status.replace('_', ' ')
    ]),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [34, 197, 94], // Green
      textColor: 255,
      fontStyle: 'bold'
    },
    // Color code rows based on status
    didParseCell: (data) => {
      const rowData = data.row.raw as any[]
      const status = rowData[6]
      
      if (status && status.includes('over budget')) {
        data.cell.styles.fillColor = [254, 202, 202] // Red background
      } else if (status && status.includes('at risk')) {
        data.cell.styles.fillColor = [254, 243, 199] // Yellow background
      }
    }
  })

  doc.save(`${options.filename}_${new Date().toISOString().split('T')[0]}.pdf`)
  */
}

/**
 * Export Client Communications Report to PDF
 */
export function exportCommunicationsPDF(data: any[], options: PDFExportOptions): void {
  console.warn('PDF export requires jsPDF library. Install with: npm install jspdf jspdf-autotable')
  
  /*
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait'
  })

  // Add header
  doc.setFontSize(20)
  doc.text(options.title, 14, 20)
  
  if (options.companyName) {
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(options.companyName, 14, 28)
  }

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35)
  doc.text(`Total Communications: ${data.length}`, 14, 41)

  // Create table
  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Project', 'Client', 'Sent By', 'Message']],
    body: data.map(c => [
      new Date(c.sent_date).toLocaleDateString(),
      c.project_name,
      c.client_name,
      c.sent_by,
      c.message.substring(0, 80) + (c.message.length > 80 ? '...' : '')
    ]),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [139, 92, 246], // Purple
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      4: { cellWidth: 80 } // Message column wider
    }
  })

  doc.save(`${options.filename}_${new Date().toISOString().split('T')[0]}.pdf`)
  */
}

/**
 * Example usage in ReportsPage.tsx:
 * 
 * import { exportProjectProgressPDF, exportBudgetSummaryPDF } from '../lib/pdf-export'
 * 
 * // In your component:
 * const handleExportPDF = () => {
 *   exportProjectProgressPDF(projectProgress, {
 *     title: 'Project Progress Report',
 *     filename: 'project-progress-report',
 *     companyName: 'Fire Protection Services',
 *     orientation: 'landscape'
 *   })
 * }
 */
