/**
 * Email Service - Resend API Integration
 * 
 * Handles sending emails for quotes, design requests, and notifications
 */

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || '')

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Send email using Resend API
 */
export async function sendEmail(template: EmailTemplate) {
  try {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      console.warn('Resend API key not configured. Email will not be sent.')
      return { id: 'mock-email-id', error: null }
    }

    const { data, error } = await resend.emails.send({
      from: template.from || 'Fire Protection <noreply@fireprotection.co.za>',
      to: template.to,
      subject: template.subject,
      html: template.html
    })

    if (error) {
      console.error('Email send error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

/**
 * Quote email template
 */
export function quoteEmailTemplate(
  clientName: string,
  clientEmail: string,
  quotePdfUrl: string,
  projectName: string,
  quoteNumber: string,
  totalAmount: number
): EmailTemplate {
  const formattedAmount = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(totalAmount)

  return {
    to: clientEmail,
    subject: `Fire Protection Quote - ${projectName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header { 
            background: #1e40af; 
            color: white; 
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .button { 
            background: #1e40af; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            display: inline-block;
            border-radius: 4px;
            margin: 10px 0;
          }
          .footer {
            padding: 20px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
            color: #6b7280;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Fire Protection Quote</h1>
        </div>
        <div class="content">
          <p>Dear ${clientName},</p>
          
          <p>Thank you for your inquiry. Please find attached our quote for the <strong>${projectName}</strong> fire protection system.</p>
          
          <div class="amount">
            Total: ${formattedAmount}
          </div>
          
          <p><strong>Quote Number:</strong> ${quoteNumber}</p>
          
          <p>
            <a href="${quotePdfUrl}" class="button">View Quote PDF</a>
          </p>
          
          <p>This quote is valid for 30 days from the date of issue. If you have any questions or would like to discuss the quote, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br><strong>Fire Protection Services</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>If you have questions, please contact us through our website or phone.</p>
        </div>
      </body>
      </html>
    `
  }
}

/**
 * Design request email to engineer
 */
export function designRequestEmailTemplate(
  engineerEmail: string,
  engineerName: string,
  projectName: string,
  designRequestUrl: string,
  jobNumber: string
): EmailTemplate {
  return {
    to: engineerEmail,
    subject: `Design Request - ${projectName} (${jobNumber})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header { 
            background: #dc2626; 
            color: white; 
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .button { 
            background: #dc2626; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            display: inline-block;
            border-radius: 4px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Design Request</h1>
        </div>
        <div class="content">
          <p>Hi ${engineerName},</p>
          
          <p>You have a new design request for:</p>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Job Number:</strong> ${jobNumber}</p>
          
          <p>
            <a href="${designRequestUrl}" class="button">View Design Request</a>
          </p>
          
          <p>Please review the design request and sign off when complete. If you have any questions, please contact the consultant.</p>
          
          <p>Thanks!</p>
        </div>
      </body>
      </html>
    `
  }
}

/**
 * Accreditation expiry warning email
 */
export function accreditationExpiryEmailTemplate(
  engineerEmail: string,
  engineerName: string,
  accreditationType: string,
  expiryDate: string,
  daysUntilExpiry: number
): EmailTemplate {
  return {
    to: engineerEmail,
    subject: `⚠️ Accreditation Expiring Soon - ${accreditationType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header { 
            background: #f59e0b; 
            color: white; 
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px;
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-top: none;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ Accreditation Expiry Warning</h1>
        </div>
        <div class="content">
          <p>Hi ${engineerName},</p>
          
          <div class="warning">
            <p><strong>Your ${accreditationType} accreditation expires in ${daysUntilExpiry} days</strong></p>
            <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString('en-ZA')}</p>
          </div>
          
          <p>Please renew your accreditation as soon as possible to avoid any disruption to your work. If you need assistance with the renewal process, please contact us.</p>
          
          <p>Thanks!</p>
        </div>
      </body>
      </html>
    `
  }
}

/**
 * Quote accepted notification
 */
export function quoteAcceptedEmailTemplate(
  consultantEmail: string,
  projectName: string,
  quoteNumber: string,
  clientName: string
): EmailTemplate {
  return {
    to: consultantEmail,
    subject: `✅ Quote Accepted - ${projectName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header { 
            background: #10b981; 
            color: white; 
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px;
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-top: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Quote Accepted!</h1>
        </div>
        <div class="content">
          <p>Great news! Your quote has been accepted.</p>
          
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Quote Number:</strong> ${quoteNumber}</p>
          <p><strong>Client:</strong> ${clientName}</p>
          
          <p>Please contact the client to proceed with the project.</p>
        </div>
      </body>
      </html>
    `
  }
}

