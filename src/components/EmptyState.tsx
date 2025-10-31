import React from 'react'
import { 
  FolderIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export type EmptyStateIcon = 'folder' | 'task' | 'document' | 'users' | 'clock' | 'generic'

export interface EmptyStateProps {
  icon?: EmptyStateIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

const iconMap = {
  folder: FolderIcon,
  task: ClipboardDocumentListIcon,
  document: DocumentTextIcon,
  users: UserGroupIcon,
  clock: ClockIcon,
  generic: FolderIcon
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  const Icon = iconMap[icon]

  return (
    <div 
      className="text-center py-12 px-4"
      role="status"
      aria-label={title}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
        <Icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all shadow-lg hover:shadow-xl"
              aria-label={actionLabel}
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all"
              aria-label={secondaryActionLabel}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
