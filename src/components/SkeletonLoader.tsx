import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular' | 'card'
  width?: string | number
  height?: string | number
  lines?: number
}

/**
 * Skeleton loader component for better loading states
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-700'
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    card: 'h-32 rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{ ...style, width: i === lines - 1 ? '80%' : '100%' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

/**
 * Skeleton for dashboard cards
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton width={120} height={24} />
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <Skeleton lines={3} />
  </div>
)

/**
 * Skeleton for table rows
 */
export const TableRowSkeleton: React.FC<{ columns?: number; className?: string }> = ({
  columns = 4,
  className = '',
}) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height={16} />
      </td>
    ))}
  </tr>
)

/**
 * Skeleton for list items
 */
export const ListItemSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
    <Skeleton variant="circular" width={48} height={48} />
    <div className="flex-1">
      <Skeleton width="60%" height={20} className="mb-2" />
      <Skeleton width="40%" height={16} />
    </div>
  </div>
)

/**
 * Skeleton for the PM Dashboard
 */
export const PMDashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Quick Actions Skeleton */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6">
      <Skeleton width={150} height={24} className="mb-4" />
      <div className="space-y-2">
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    </div>

    {/* Two Column Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>

    {/* Documentation Section */}
    <CardSkeleton />
  </div>
)

/**
 * Skeleton for document list
 */
export const DocumentListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <ListItemSkeleton key={i} />
    ))}
  </div>
)
