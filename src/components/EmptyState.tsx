/**
 * Empty State Component
 * 
 * Reusable component for displaying empty states
 */

import React from 'react'
import { 
  DocumentTextIcon, 
  FolderIcon, 
  CurrencyDollarIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <div className="mt-6">
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  )
}

// Pre-configured empty states
export const EmptyJobs: React.FC<{ onCreateJob?: () => void }> = ({ onCreateJob }) => (
  <EmptyState
    icon={<BriefcaseIcon />}
    title="No jobs found"
    description="Get started by creating your first fire protection design job."
    action={onCreateJob ? {
      label: "Create New Job",
      onClick: onCreateJob
    } : undefined}
  />
)

export const EmptyQuotes: React.FC = () => (
  <EmptyState
    icon={<CurrencyDollarIcon />}
    title="No quotes found"
    description="Quotes will appear here once you generate them from job details."
  />
)

export const EmptyDocuments: React.FC<{ onUpload?: () => void }> = ({ onUpload }) => (
  <EmptyState
    icon={<DocumentTextIcon />}
    title="No documents found"
    description="Upload your first document to get started."
    action={onUpload ? {
      label: "Upload Document",
      onClick: onUpload
    } : undefined}
  />
)

export const EmptySearch: React.FC<{ query: string }> = ({ query }) => (
  <EmptyState
    icon={<MagnifyingGlassIcon />}
    title="No results found"
    description={`No results found for "${query}". Try adjusting your search terms.`}
  />
)
