import toast from 'react-hot-toast'

/**
 * Toast utility functions for consistent error and success notifications
 */

export const showError = (message: string, details?: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#1f2937', // gray-800
      color: '#fff',
      border: '1px solid #ef4444', // red-500
    },
  })
  
  if (details) {
    console.error(`Error: ${message}`, details)
  }
}

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#1f2937', // gray-800
      color: '#fff',
      border: '1px solid #10b981', // green-500
    },
  })
}

export const showInfo = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#1f2937', // gray-800
      color: '#fff',
      border: '1px solid #3b82f6', // blue-500
    },
  })
}

export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#1f2937', // gray-800
      color: '#fff',
    },
  })
}

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}

/**
 * Helper to handle async operations with loading/error states
 */
export async function withToast<T>(
  promise: Promise<T>,
  options: {
    loading: string
    success: string
    error: string
  }
): Promise<T> {
  return toast.promise(
    promise,
    {
      loading: options.loading,
      success: options.success,
      error: options.error,
    },
    {
      position: 'top-right',
      style: {
        background: '#1f2937',
        color: '#fff',
      },
    }
  )
}
