/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner with different sizes
 */

import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-red-600 ${sizeClasses[size]}`}
      />
      {text && (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

// Full page loading
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" text={text} />
  </div>
)

// Inline loading
export const InlineLoading: React.FC = () => (
  <LoadingSpinner size="sm" className="py-2" />
)

