/**
 * Structured Logging Utility
 * 
 * Provides consistent logging across the application with:
 * - Log levels (debug, info, warn, error)
 * - Structured data
 * - User context
 * - Request tracking
 * - Performance metrics
 */

export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  action?: string;
  component?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private minLevel: LogLevel = LogLevel.INFO;
  private context: LogContext = {};

  private constructor() {
    // Set log level based on environment
    if (import.meta.env.DEV) {
      this.minLevel = LogLevel.DEBUG;
    } else if (import.meta.env.PROD) {
      this.minLevel = LogLevel.INFO;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set global context that will be included in all logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatLog(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
    ];

    if (entry.context?.component) {
      parts.push(`[${entry.context.component}]`);
    }

    parts.push(entry.message);

    return parts.join(' ');
  }

  private log(level: LogLevel, message: string, context?: LogContext, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      metadata,
    };

    const formatted = this.formatLog(entry);

    // Console output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted, entry);
        break;
      case LogLevel.INFO:
        console.info(formatted, entry);
        break;
      case LogLevel.WARN:
        console.warn(formatted, entry);
        break;
      case LogLevel.ERROR:
        console.error(formatted, entry);
        break;
    }

    // Send to external logging service in production
    if (import.meta.env.PROD) {
      this.sendToLoggingService(entry);
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // This would send logs to a service like LogRocket, Datadog, etc.
    // For now, we'll just store it in a buffer that could be sent to an endpoint
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Keep only last 100 logs in localStorage
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Fail silently to not break the app
      console.error('Failed to store log:', error);
    }
  }

  /**
   * Debug level logging - verbose information for development
   */
  debug(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Info level logging - general informational messages
   */
  info(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  /**
   * Warning level logging - potentially harmful situations
   */
  warn(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Error level logging - error events
   */
  error(message: string, error?: Error, context?: LogContext, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context: { ...this.context, ...context },
      error,
      metadata,
    };

    const formatted = this.formatLog(entry);
    console.error(formatted, entry, error);

    if (import.meta.env.PROD) {
      this.sendToLoggingService(entry);
    }
  }

  /**
   * Log user action for audit trail
   */
  logUserAction(action: string, details?: Record<string, any>): void {
    this.info(`User action: ${action}`, { action }, details);
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, endpoint: string, duration?: number): void {
    this.info(`API ${method} ${endpoint}`, 
      { action: 'api_request' },
      { method, endpoint, duration }
    );
  }

  /**
   * Log performance metric
   */
  logPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.debug(`Performance: ${metric} = ${value}${unit}`,
      { action: 'performance' },
      { metric, value, unit }
    );
  }

  /**
   * Get stored logs (useful for debugging or sending to support)
   */
  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    localStorage.removeItem('app_logs');
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const debug = (message: string, context?: LogContext, metadata?: Record<string, any>) => 
  logger.debug(message, context, metadata);

export const info = (message: string, context?: LogContext, metadata?: Record<string, any>) => 
  logger.info(message, context, metadata);

export const warn = (message: string, context?: LogContext, metadata?: Record<string, any>) => 
  logger.warn(message, context, metadata);

export const error = (message: string, err?: Error, context?: LogContext, metadata?: Record<string, any>) => 
  logger.error(message, err, context, metadata);

export const logUserAction = (action: string, details?: Record<string, any>) => 
  logger.logUserAction(action, details);

export const logApiRequest = (method: string, endpoint: string, duration?: number) => 
  logger.logApiRequest(method, endpoint, duration);

export const logPerformance = (metric: string, value: number, unit?: string) => 
  logger.logPerformance(metric, value, unit);
