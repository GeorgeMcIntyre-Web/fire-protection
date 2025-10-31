import React, { useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastStyles = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-700',
    icon: CheckCircleIcon,
    iconColor: 'text-green-400'
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-700',
    icon: XCircleIcon,
    iconColor: 'text-red-400'
  },
  warning: {
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-700',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-400'
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-700',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-400'
  }
}

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000,
  onClose 
}) => {
  const style = toastStyles[type]
  const Icon = style.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 mb-4 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${style.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-white">
            {title}
          </p>
          {message && (
            <p className="mt-1 text-sm text-gray-300">
              {message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onClose(id)}
            className="inline-flex text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 rounded transition-colors"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div 
      className="fixed top-4 right-4 z-50 w-full max-w-md space-y-4 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}

// Toast Hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message })
  }
}
