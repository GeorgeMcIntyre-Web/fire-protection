import React from 'react'

export type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'table' | 'stat' | 'button'

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant
  count?: number
  className?: string
}

const SkeletonText: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    className={`h-4 bg-gray-700 rounded animate-pulse ${className}`}
    role="status"
    aria-label="Loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
)

const SkeletonTitle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    <div className="h-8 bg-gray-700 rounded w-1/3 animate-pulse" role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
    <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse" role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
)

const SkeletonAvatar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className="flex items-center space-x-3">
    <div className={`h-12 w-12 bg-gray-700 rounded-full animate-pulse ${className}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse" />
    </div>
  </div>
)

const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
    <div className="space-y-4">
      <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse" role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse" />
      </div>
      <div className="flex space-x-2 pt-2">
        <div className="h-8 bg-gray-700 rounded w-20 animate-pulse" />
        <div className="h-8 bg-gray-700 rounded w-20 animate-pulse" />
      </div>
    </div>
  </div>
)

const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ rows = 5, className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
    {/* Table Header */}
    <div className="border-b border-gray-700 p-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" role="status" aria-label="Loading">
            <span className="sr-only">Loading...</span>
          </div>
        ))}
      </div>
    </div>
    {/* Table Rows */}
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="border-b border-gray-700 p-4 last:border-b-0">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const SkeletonStat: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
    <div className="flex items-center">
      <div className="h-10 w-10 bg-gray-700 rounded animate-pulse" role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="ml-4 flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
        <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  </div>
)

const SkeletonButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`h-10 bg-gray-700 rounded-lg w-24 animate-pulse ${className}`} role="status" aria-label="Loading">
    <span className="sr-only">Loading...</span>
  </div>
)

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text', 
  count = 1,
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'title':
        return <SkeletonTitle className={className} />
      case 'avatar':
        return <SkeletonAvatar className={className} />
      case 'card':
        return <SkeletonCard className={className} />
      case 'table':
        return <SkeletonTable rows={count} className={className} />
      case 'stat':
        return <SkeletonStat className={className} />
      case 'button':
        return <SkeletonButton className={className} />
      case 'text':
      default:
        return <SkeletonText className={className} />
    }
  }

  if (variant === 'table' || variant === 'title' || variant === 'avatar' || variant === 'card' || variant === 'stat' || variant === 'button') {
    return <>{renderSkeleton()}</>
  }

  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}
