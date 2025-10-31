import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import type { ExportOptions, ExportResult } from '../../types/analytics'

/**
 * Export Service
 * Handles exporting analytics data and reports to various formats
 */
export class ExportService {
  
  /**
   * Export data to specified format
   */
  async exportData(
    data: any,
    format: 'pdf' | 'excel' | 'csv' | 'google_sheets',
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      switch (format) {
        case 'pdf':
          return await this.exportToPDF(data, options)
        case 'excel':
          return await this.exportToExcel(data, options)
        case 'csv':
          return await this.exportToCSV(data, options)
        case 'google_sheets':
          return await this.exportToGoogleSheets(data, options)
        default:
          return { success: false, error: 'Unsupported format' }
      }
    } catch (error) {
      console.error('Export error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      }
    }
  }
  
  /**
   * Export to PDF
   */
  private async exportToPDF(data: any, options: Partial<ExportOptions>): Promise<ExportResult> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20
      
      // Add header
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Analytics Report', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
      
      // Add date
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      pdf.text(`Generated on: ${dateStr}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
      
      // Add KPIs section
      if (data.kpis && data.kpis.length > 0) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Key Performance Indicators', 14, yPosition)
        yPosition += 10
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        
        data.kpis.forEach((kpi: any, index: number) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          
          const text = `${kpi.label}: ${kpi.value}`
          pdf.text(text, 14, yPosition)
          yPosition += 7
        })
        
        yPosition += 10
      }
      
      // Add charts (if HTML elements are provided)
      if (options.includeCharts && data.chartElements) {
        for (const element of data.chartElements) {
          if (yPosition > pageHeight / 2) {
            pdf.addPage()
            yPosition = 20
          }
          
          try {
            const canvas = await html2canvas(element, {
              scale: 2,
              logging: false,
              backgroundColor: '#ffffff'
            })
            
            const imgData = canvas.toDataURL('image/png')
            const imgWidth = pageWidth - 28
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            
            pdf.addImage(imgData, 'PNG', 14, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 10
          } catch (error) {
            console.error('Error adding chart to PDF:', error)
          }
        }
      }
      
      // Add insights section
      if (data.insights && data.insights.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('AI Insights & Recommendations', 14, yPosition)
        yPosition += 10
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        
        data.insights.slice(0, 10).forEach((insight: any) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          
          // Insight title
          pdf.setFont('helvetica', 'bold')
          pdf.text(`• ${insight.title}`, 14, yPosition)
          yPosition += 5
          
          // Insight description (wrap text)
          pdf.setFont('helvetica', 'normal')
          const lines = pdf.splitTextToSize(insight.description, pageWidth - 32)
          pdf.text(lines, 18, yPosition)
          yPosition += lines.length * 4 + 5
        })
      }
      
      // Add footer to all pages
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'italic')
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
        pdf.text(
          'Fire Protection Tracker - Analytics Report',
          14,
          pageHeight - 10
        )
      }
      
      // Save PDF
      const filename = `analytics-report-${Date.now()}.pdf`
      pdf.save(filename)
      
      return {
        success: true,
        filename: filename,
        url: 'local'
      }
      
    } catch (error) {
      console.error('PDF export error:', error)
      return {
        success: false,
        error: 'Failed to generate PDF'
      }
    }
  }
  
  /**
   * Export to Excel
   */
  private async exportToExcel(data: any, options: Partial<ExportOptions>): Promise<ExportResult> {
    try {
      const workbook = XLSX.utils.book_new()
      
      // KPIs Sheet
      if (data.kpis && data.kpis.length > 0) {
        const kpiData = data.kpis.map((kpi: any) => ({
          'Metric': kpi.label,
          'Value': kpi.value,
          'Change': kpi.change || '',
          'Trend': kpi.trend || ''
        }))
        
        const kpiSheet = XLSX.utils.json_to_sheet(kpiData)
        XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs')
      }
      
      // Projects Sheet
      if (data.projects && data.projects.length > 0) {
        const projectData = data.projects.map((project: any) => ({
          'Project Name': project.name,
          'Status': project.status,
          'Completion %': project.completion_percentage || 0,
          'Budget Allocated': project.budget_allocated || 0,
          'Budget Spent': project.budget_spent || 0,
          'Risk Level': project.risk_level || 'N/A',
          'Due Date': project.due_date || ''
        }))
        
        const projectSheet = XLSX.utils.json_to_sheet(projectData)
        XLSX.utils.book_append_sheet(workbook, projectSheet, 'Projects')
      }
      
      // Tasks Sheet
      if (data.tasks && data.tasks.length > 0) {
        const taskData = data.tasks.map((task: any) => ({
          'Task Name': task.name,
          'Project': task.project_name || '',
          'Status': task.status,
          'Priority': task.priority,
          'Assigned To': task.assigned_to_name || '',
          'Due Date': task.due_date || ''
        }))
        
        const taskSheet = XLSX.utils.json_to_sheet(taskData)
        XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tasks')
      }
      
      // Insights Sheet
      if (data.insights && data.insights.length > 0) {
        const insightData = data.insights.map((insight: any) => ({
          'Type': insight.insight_type,
          'Severity': insight.severity,
          'Title': insight.title,
          'Description': insight.description,
          'Action': insight.suggested_action || '',
          'Confidence': insight.confidence_score || 0
        }))
        
        const insightSheet = XLSX.utils.json_to_sheet(insightData)
        XLSX.utils.book_append_sheet(workbook, insightSheet, 'Insights')
      }
      
      // Time Logs Sheet
      if (data.timeLogs && data.timeLogs.length > 0) {
        const timeData = data.timeLogs.map((log: any) => ({
          'User': log.user_name || '',
          'Project': log.project_name || '',
          'Task': log.task_name || '',
          'Start Time': log.start_time,
          'End Time': log.end_time || '',
          'Duration (hours)': log.duration_hours || 0,
          'Description': log.description || ''
        }))
        
        const timeSheet = XLSX.utils.json_to_sheet(timeData)
        XLSX.utils.book_append_sheet(workbook, timeSheet, 'Time Logs')
      }
      
      // Generate Excel file
      const filename = `analytics-data-${Date.now()}.xlsx`
      XLSX.writeFile(workbook, filename)
      
      return {
        success: true,
        filename: filename,
        url: 'local'
      }
      
    } catch (error) {
      console.error('Excel export error:', error)
      return {
        success: false,
        error: 'Failed to generate Excel file'
      }
    }
  }
  
  /**
   * Export to CSV
   */
  private async exportToCSV(data: any, options: Partial<ExportOptions>): Promise<ExportResult> {
    try {
      // Convert data to CSV format
      let csv = ''
      
      // If data is an array of objects
      if (Array.isArray(data) && data.length > 0) {
        // Get headers
        const headers = Object.keys(data[0])
        csv += headers.join(',') + '\n'
        
        // Add rows
        data.forEach((row: any) => {
          const values = headers.map(header => {
            const value = row[header]
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          csv += values.join(',') + '\n'
        })
      } else if (data.kpis) {
        // Export KPIs
        csv += 'Metric,Value,Change,Trend\n'
        data.kpis.forEach((kpi: any) => {
          csv += `"${kpi.label}","${kpi.value}","${kpi.change || ''}","${kpi.trend || ''}"\n`
        })
      }
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const filename = `analytics-export-${Date.now()}.csv`
      
      // Create download link
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      return {
        success: true,
        filename: filename,
        url: 'local'
      }
      
    } catch (error) {
      console.error('CSV export error:', error)
      return {
        success: false,
        error: 'Failed to generate CSV file'
      }
    }
  }
  
  /**
   * Export to Google Sheets
   */
  private async exportToGoogleSheets(data: any, options: Partial<ExportOptions>): Promise<ExportResult> {
    // This would require Google Sheets API integration
    // For now, return a placeholder
    console.warn('Google Sheets export not yet implemented')
    
    // In a real implementation:
    // 1. Authenticate with Google Sheets API
    // 2. Create new spreadsheet
    // 3. Add data to sheets
    // 4. Return shareable link
    
    return {
      success: false,
      error: 'Google Sheets export not yet implemented. Please use Excel or CSV export.'
    }
  }
  
  /**
   * Export chart as image
   */
  async exportChartAsImage(chartElement: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error exporting chart:', error)
      throw error
    }
  }
  
  /**
   * Quick export current page as PDF
   */
  async quickExportPage(elementId: string, title: string): Promise<ExportResult> {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        return { success: false, error: 'Element not found' }
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Add title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(title, pageWidth / 2, 15, { align: 'center' })
      
      // Add image
      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, Math.min(imgHeight, pageHeight - 35))
      
      // Save
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
      pdf.save(filename)
      
      return {
        success: true,
        filename: filename,
        url: 'local'
      }
    } catch (error) {
      console.error('Quick export error:', error)
      return {
        success: false,
        error: 'Failed to export page'
      }
    }
  }
}

export const exportService = new ExportService()
