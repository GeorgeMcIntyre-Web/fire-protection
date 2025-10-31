/**
 * Rate Limiting Utilities
 * 
 * Client-side rate limiting to prevent abuse and protect against:
 * - Brute force attacks
 * - API spam
 * - Resource exhaustion
 * 
 * Note: This is client-side rate limiting. For production, implement
 * server-side rate limiting as well (e.g., using Supabase Edge Functions).
 */

// ============================================
// RATE LIMITER CLASS
// ============================================

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // How long to block after exceeding limit
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // Seconds until can retry
}

interface AttemptRecord {
  timestamps: number[];
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      blockDurationMs: config.windowMs * 2,
      ...config,
    };
    
    // Clean up old entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Checks if an action is allowed and records the attempt
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const record = this.attempts.get(key) || { timestamps: [] };

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.blockedUntil),
        retryAfter,
      };
    }

    // Remove timestamps outside the window
    const windowStart = now - this.config.windowMs;
    record.timestamps = record.timestamps.filter(ts => ts > windowStart);

    // Check if limit exceeded
    if (record.timestamps.length >= this.config.maxAttempts) {
      record.blockedUntil = now + this.config.blockDurationMs!;
      this.attempts.set(key, record);

      const retryAfter = Math.ceil(this.config.blockDurationMs! / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.blockedUntil),
        retryAfter,
      };
    }

    // Record this attempt
    record.timestamps.push(now);
    this.attempts.set(key, record);

    const remaining = this.config.maxAttempts - record.timestamps.length;
    const resetAt = new Date(now + this.config.windowMs);

    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  /**
   * Resets the rate limit for a specific key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Cleans up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.attempts.entries()) {
      // Remove if block has expired and no recent attempts
      if (
        (!record.blockedUntil || now > record.blockedUntil) &&
        record.timestamps.length === 0
      ) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * Gets current status for a key without recording an attempt
   */
  getStatus(key: string): RateLimitResult {
    const now = Date.now();
    const record = this.attempts.get(key) || { timestamps: [] };

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.blockedUntil),
        retryAfter,
      };
    }

    // Remove timestamps outside the window
    const windowStart = now - this.config.windowMs;
    const validTimestamps = record.timestamps.filter(ts => ts > windowStart);

    const remaining = Math.max(0, this.config.maxAttempts - validTimestamps.length);
    const resetAt = new Date(now + this.config.windowMs);

    return {
      allowed: remaining > 0,
      remaining,
      resetAt,
    };
  }
}

// ============================================
// PRECONFIGURED RATE LIMITERS
// ============================================

/**
 * Login rate limiter - prevents brute force attacks
 * 5 attempts per 15 minutes
 */
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes after exceeding
});

/**
 * Password reset rate limiter
 * 3 attempts per hour
 */
export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 2 * 60 * 60 * 1000, // Block for 2 hours
});

/**
 * Email verification rate limiter
 * 3 attempts per 10 minutes
 */
export const emailVerificationRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 10 * 60 * 1000, // 10 minutes
  blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
});

/**
 * API request rate limiter
 * 100 requests per minute
 */
export const apiRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
});

/**
 * File upload rate limiter
 * 10 uploads per hour
 */
export const fileUploadRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 2 * 60 * 60 * 1000, // Block for 2 hours
});

/**
 * Search rate limiter
 * 30 searches per minute
 */
export const searchRateLimiter = new RateLimiter({
  maxAttempts: 30,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generates a rate limit key based on user ID and action
 */
export function getRateLimitKey(userId: string | null, action: string): string {
  // Use IP or session ID as fallback if no user ID
  const identifier = userId || getClientIdentifier();
  return `${action}:${identifier}`;
}

/**
 * Gets a unique client identifier (for non-authenticated users)
 */
function getClientIdentifier(): string {
  // Try to get from localStorage
  let identifier = localStorage.getItem('client_identifier');
  
  if (!identifier) {
    // Generate a new one
    identifier = generateIdentifier();
    localStorage.setItem('client_identifier', identifier);
  }
  
  return identifier;
}

/**
 * Generates a unique identifier
 */
function generateIdentifier(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// RATE LIMIT DECORATORS
// ============================================

/**
 * Decorator to add rate limiting to a function
 */
export function withRateLimit(
  rateLimiter: RateLimiter,
  action: string,
  getUserId?: () => string | null
) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const userId = getUserId ? getUserId() : null;
      const key = getRateLimitKey(userId, action);
      const result = rateLimiter.check(key);

      if (!result.allowed) {
        const error: any = new Error('Rate limit exceeded');
        error.rateLimitInfo = result;
        throw error;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// ============================================
// RATE LIMIT CHECKING
// ============================================

/**
 * Checks if an action is rate limited
 */
export function checkRateLimit(
  rateLimiter: RateLimiter,
  userId: string | null,
  action: string
): RateLimitResult {
  const key = getRateLimitKey(userId, action);
  return rateLimiter.check(key);
}

/**
 * Gets rate limit status without recording an attempt
 */
export function getRateLimitStatus(
  rateLimiter: RateLimiter,
  userId: string | null,
  action: string
): RateLimitResult {
  const key = getRateLimitKey(userId, action);
  return rateLimiter.getStatus(key);
}

/**
 * Resets rate limit for a user and action
 */
export function resetRateLimit(
  rateLimiter: RateLimiter,
  userId: string | null,
  action: string
): void {
  const key = getRateLimitKey(userId, action);
  rateLimiter.reset(key);
}

// ============================================
// RATE LIMIT ERROR HANDLING
// ============================================

export class RateLimitError extends Error {
  public rateLimitInfo: RateLimitResult;

  constructor(message: string, rateLimitInfo: RateLimitResult) {
    super(message);
    this.name = 'RateLimitError';
    this.rateLimitInfo = rateLimitInfo;
  }

  /**
   * Gets a user-friendly error message
   */
  getUserMessage(): string {
    const { retryAfter } = this.rateLimitInfo;
    
    if (retryAfter) {
      if (retryAfter < 60) {
        return `Too many attempts. Please try again in ${retryAfter} seconds.`;
      } else if (retryAfter < 3600) {
        const minutes = Math.ceil(retryAfter / 60);
        return `Too many attempts. Please try again in ${minutes} minutes.`;
      } else {
        const hours = Math.ceil(retryAfter / 3600);
        return `Too many attempts. Please try again in ${hours} hours.`;
      }
    }
    
    return 'Too many attempts. Please try again later.';
  }
}

/**
 * Wraps a function with rate limiting and error handling
 */
export async function withRateLimitProtection<T>(
  rateLimiter: RateLimiter,
  userId: string | null,
  action: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = getRateLimitKey(userId, action);
  const result = rateLimiter.check(key);

  if (!result.allowed) {
    throw new RateLimitError('Rate limit exceeded', result);
  }

  return fn();
}

// ============================================
// DISTRIBUTED RATE LIMITING (Future Enhancement)
// ============================================

/**
 * Interface for distributed rate limiting (using Redis or similar)
 * This is a placeholder for future server-side implementation
 */
export interface DistributedRateLimiter {
  check(key: string): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
  increment(key: string): Promise<RateLimitResult>;
}

// ============================================
// USAGE TRACKING
// ============================================

interface UsageStats {
  totalAttempts: number;
  blockedAttempts: number;
  lastAttempt: Date;
}

class UsageTracker {
  private stats: Map<string, UsageStats> = new Map();

  record(action: string, blocked: boolean): void {
    const stats = this.stats.get(action) || {
      totalAttempts: 0,
      blockedAttempts: 0,
      lastAttempt: new Date(),
    };

    stats.totalAttempts++;
    if (blocked) {
      stats.blockedAttempts++;
    }
    stats.lastAttempt = new Date();

    this.stats.set(action, stats);
  }

  getStats(action: string): UsageStats | null {
    return this.stats.get(action) || null;
  }

  getAllStats(): Map<string, UsageStats> {
    return new Map(this.stats);
  }

  reset(action?: string): void {
    if (action) {
      this.stats.delete(action);
    } else {
      this.stats.clear();
    }
  }
}

export const usageTracker = new UsageTracker();

// ============================================
// RATE LIMIT MIDDLEWARE
// ============================================

/**
 * Express-like middleware for rate limiting
 */
export function createRateLimitMiddleware(
  rateLimiter: RateLimiter,
  action: string
) {
  return async (userId: string | null): Promise<void> => {
    const key = getRateLimitKey(userId, action);
    const result = rateLimiter.check(key);

    usageTracker.record(action, !result.allowed);

    if (!result.allowed) {
      throw new RateLimitError('Rate limit exceeded', result);
    }
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Formats rate limit info for display
 */
export function formatRateLimitInfo(result: RateLimitResult): string {
  if (result.allowed) {
    return `${result.remaining} attempts remaining. Resets at ${result.resetAt.toLocaleTimeString()}`;
  } else {
    return `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`;
  }
}

/**
 * Creates a custom rate limiter with specific config
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  RateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter,
  apiRateLimiter,
  fileUploadRateLimiter,
  searchRateLimiter,
  checkRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  withRateLimitProtection,
  RateLimitError,
  usageTracker,
  createRateLimitMiddleware,
  formatRateLimitInfo,
  createRateLimiter,
};
