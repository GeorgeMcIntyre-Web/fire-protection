import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
    // Example: logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Something went wrong
            </h1>

            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. The error has been logged
              and we'll look into it.
            </p>

            {this.state.error && (
              <details className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Error Details (for developers)
                </summary>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <span className="font-semibold">Error:</span>
                    <pre className="mt-1 overflow-x-auto bg-white p-2 rounded border border-gray-200">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <span className="font-semibold">Component Stack:</span>
                      <pre className="mt-1 overflow-x-auto bg-white p-2 rounded border border-gray-200 text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
            </div>

            <div className="mt-6 text-center">
              <a
                href="mailto:support@example.com"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 * 
 * Usage:
 * const SafeComponent = withErrorBoundary(MyComponent)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
