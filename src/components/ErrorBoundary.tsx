/**
 * Error Boundary Component
 * 
 * Catches React errors and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                An unexpected error occurred. Please try again.
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              {this.state.error && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Error Details
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800 font-mono break-all">
                      {this.state.error.toString()}
                    </p>
                  </div>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Stack Trace
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-48 overflow-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
