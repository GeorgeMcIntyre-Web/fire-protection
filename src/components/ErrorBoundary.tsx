/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { errorTracker } from '../lib/error-tracking';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error tracking service
    const errorId = errorTracker.captureError(error, {
      component: 'ErrorBoundary',
      severity: 'high',
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Log to console in development
    logger.error(
      'Error caught by ErrorBoundary',
      error,
      { component: 'ErrorBoundary' },
      { errorId, componentStack: errorInfo.componentStack }
    );

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Oops! Something went wrong
              </h2>

              <p className="text-gray-600 text-center mb-6">
                We're sorry for the inconvenience. The error has been logged and we'll look into it.
              </p>

              {this.state.errorId && (
                <div className="bg-gray-50 rounded p-3 mb-6">
                  <p className="text-sm text-gray-600 text-center">
                    Error ID: <span className="font-mono font-semibold">{this.state.errorId}</span>
                  </p>
                </div>
              )}

              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-red-50 border border-red-200 rounded p-3 overflow-auto max-h-48">
                    <pre className="text-xs text-red-800 whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {this.state.error.stack && `\n\n${this.state.error.stack}`}
                    </pre>
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 overflow-auto max-h-48 mt-2">
                      <pre className="text-xs text-orange-800 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}

              <div className="space-y-2">
                <button
                  onClick={this.handleReset}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-200"
                >
                  Go to Home
                </button>
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 px-4 rounded transition duration-200"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
