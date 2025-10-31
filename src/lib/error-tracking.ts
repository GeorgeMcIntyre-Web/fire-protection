/**
 * Error Tracking and Monitoring Integration
 * 
 * Provides integration with Sentry for error tracking and monitoring.
 * Can be easily adapted to other services like Rollbar, Bugsnag, etc.
 */

import { logger } from './logger';

export interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context?: ErrorContext;
  userAgent: string;
  url: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private initialized = false;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Initialize error tracking with Sentry or other service
   */
  initialize(config?: { dsn?: string; environment?: string }): void {
    if (this.initialized) return;

    logger.info('Initializing error tracking', { component: 'ErrorTracker' });

    // In production, initialize Sentry here
    if (import.meta.env.PROD && config?.dsn) {
      // Example Sentry initialization (requires @sentry/react package):
      // Sentry.init({
      //   dsn: config.dsn,
      //   environment: config.environment || 'production',
      //   integrations: [
      //     new Sentry.BrowserTracing(),
      //     new Sentry.Replay(),
      //   ],
      //   tracesSampleRate: 0.1,
      //   replaysSessionSampleRate: 0.1,
      //   replaysOnErrorSampleRate: 1.0,
      // });
      
      logger.info('Error tracking service initialized', { component: 'ErrorTracker' });
    }

    this.initialized = true;
  }

  /**
   * Set user context for error reports
   */
  setUser(userId: string, _email?: string, _username?: string): void {
    this.userId = userId;
    logger.setContext({ userId });

    // Set user in Sentry
    // if (import.meta.env.PROD) {
    //   Sentry.setUser({ id: userId, email: _email, username: _username });
    // }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    this.userId = undefined;
    logger.clearContext();

    // Clear user in Sentry
    // if (import.meta.env.PROD) {
    //   Sentry.setUser(null);
    // }
  }

  /**
   * Capture an error
   */
  captureError(
    error: Error,
    context?: ErrorContext,
  ): string {
    const errorId = this.generateErrorId();
    
    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        userId: context?.userId || this.userId,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log error locally
    logger.error(
      error.message,
      error,
      {
        component: context?.component,
        action: context?.action,
      },
      {
        errorId,
        severity: context?.severity || 'medium',
        tags: context?.tags,
        ...context?.extra,
      }
    );

    // Send to Sentry in production
    if (import.meta.env.PROD) {
      // Sentry.captureException(error, {
      //   tags: context?.tags,
      //   extra: context?.extra,
      //   level: this.mapSeverityToLevel(context?.severity),
      // });
      
      // Queue for backup storage
      this.queueError(report);
    }

    return errorId;
  }

  /**
   * Capture a message (non-error)
   */
  captureMessage(
    message: string,
    context?: ErrorContext,
  ): void {
    logger.warn(message, {
      component: context?.component,
      action: context?.action,
    });

    if (import.meta.env.PROD) {
      // Sentry.captureMessage(message, {
      //   tags: context?.tags,
      //   extra: context?.extra,
      //   level: this.mapSeverityToLevel(context?.severity),
      // });
    }
  }

  /**
   * Add breadcrumb for error context
   */
  addBreadcrumb(
    message: string,
    category?: string,
    data?: Record<string, any>
  ): void {
    logger.debug(`Breadcrumb: ${message}`, { action: 'breadcrumb' }, { category, ...data });

    // if (import.meta.env.PROD) {
    //   Sentry.addBreadcrumb({
    //     message,
    //     category,
    //     data,
    //     timestamp: Date.now() / 1000,
    //   });
    // }
  }

  /**
   * Set custom context/tags for all future errors
   */
  setTag(_key: string, _value: string): void {
    // if (import.meta.env.PROD) {
    //   Sentry.setTag(_key, _value);
    // }
  }

  /**
   * Set extra data for all future errors
   */
  setExtra(_key: string, _value: any): void {
    // if (import.meta.env.PROD) {
    //   Sentry.setExtra(_key, _value);
    // }
  }

  /**
   * Manually flush queued errors
   */
  async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    logger.info('Flushing error queue', { component: 'ErrorTracker' }, { count: this.errorQueue.length });

    // Send errors to your backend endpoint
    try {
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ errors: this.errorQueue }),
      // });
      
      this.errorQueue = [];
    } catch (error) {
      logger.error('Failed to flush error queue', error as Error);
    }
  }

  /**
   * Get error reports from queue
   */
  getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(
        event.error || new Error(event.message),
        {
          component: 'GlobalErrorHandler',
          severity: 'high',
          extra: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        }
      );
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));

      this.captureError(error, {
        component: 'UnhandledPromiseRejection',
        severity: 'high',
      });
    });
  }

  private queueError(report: ErrorReport): void {
    this.errorQueue.push(report);

    // Keep only last 50 errors in queue
    if (this.errorQueue.length > 50) {
      this.errorQueue.shift();
    }

    // Store in localStorage as backup
    try {
      localStorage.setItem('error_queue', JSON.stringify(this.errorQueue));
    } catch (e) {
      // Ignore storage errors
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Export convenience functions
export const captureError = (error: Error, context?: ErrorContext) => 
  errorTracker.captureError(error, context);

export const captureMessage = (message: string, context?: ErrorContext) => 
  errorTracker.captureMessage(message, context);

export const addBreadcrumb = (message: string, category?: string, data?: Record<string, any>) => 
  errorTracker.addBreadcrumb(message, category, data);

export const setUser = (userId: string, email?: string, username?: string) => 
  errorTracker.setUser(userId, email, username);

export const clearUser = () => 
  errorTracker.clearUser();
