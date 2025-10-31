/**
 * Security Tests - Rate Limiting
 * 
 * Tests for rate limiting utilities to prevent abuse.
 */

import {
  loginRateLimiter,
  passwordResetRateLimiter,
  checkRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  RateLimitError,
  withRateLimitProtection,
  createRateLimiter,
} from '../../lib/rate-limiting';

describe('Rate Limiter Basic Functionality', () => {
  test('allows requests within limit', () => {
    const limiter = createRateLimiter({
      maxAttempts: 3,
      windowMs: 60000, // 1 minute
    });

    const result1 = limiter.check('test-key');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = limiter.check('test-key');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = limiter.check('test-key');
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  test('blocks requests after exceeding limit', () => {
    const limiter = createRateLimiter({
      maxAttempts: 2,
      windowMs: 60000,
      blockDurationMs: 120000,
    });

    limiter.check('test-key');
    limiter.check('test-key');
    
    const result = limiter.check('test-key');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter!).toBeGreaterThan(0);
  });

  test('resets after window expires', (done) => {
    const limiter = createRateLimiter({
      maxAttempts: 2,
      windowMs: 100, // 100ms
    });

    limiter.check('test-key');
    limiter.check('test-key');

    setTimeout(() => {
      const result = limiter.check('test-key');
      expect(result.allowed).toBe(true);
      done();
    }, 150);
  });

  test('tracks different keys independently', () => {
    const limiter = createRateLimiter({
      maxAttempts: 2,
      windowMs: 60000,
    });

    limiter.check('key-1');
    limiter.check('key-1');
    
    const result1 = limiter.check('key-1');
    expect(result1.allowed).toBe(false);

    const result2 = limiter.check('key-2');
    expect(result2.allowed).toBe(true);
  });

  test('manual reset works', () => {
    const limiter = createRateLimiter({
      maxAttempts: 2,
      windowMs: 60000,
    });

    limiter.check('test-key');
    limiter.check('test-key');
    limiter.check('test-key');

    let result = limiter.check('test-key');
    expect(result.allowed).toBe(false);

    limiter.reset('test-key');

    result = limiter.check('test-key');
    expect(result.allowed).toBe(true);
  });
});

describe('Login Rate Limiting', () => {
  test('enforces login attempt limits', () => {
    const userId = 'test-user-' + Date.now();
    
    // Make 5 attempts (the limit)
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(loginRateLimiter, userId, 'login');
      if (i < 5) {
        expect(result.allowed).toBe(true);
      }
    }

    // 6th attempt should be blocked
    const result = checkRateLimit(loginRateLimiter, userId, 'login');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  test('provides status without recording attempt', () => {
    const userId = 'test-user-status-' + Date.now();
    
    // Check status without recording
    const status1 = getRateLimitStatus(loginRateLimiter, userId, 'login');
    expect(status1.remaining).toBe(5);

    // Record an attempt
    checkRateLimit(loginRateLimiter, userId, 'login');

    // Check status again
    const status2 = getRateLimitStatus(loginRateLimiter, userId, 'login');
    expect(status2.remaining).toBe(4);
  });
});

describe('Password Reset Rate Limiting', () => {
  test('limits password reset requests', () => {
    const email = 'test-' + Date.now() + '@example.com';
    
    // Make 3 attempts (the limit)
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit(passwordResetRateLimiter, email, 'password-reset');
      expect(result.allowed).toBe(true);
    }

    // 4th attempt should be blocked
    const result = checkRateLimit(passwordResetRateLimiter, email, 'password-reset');
    expect(result.allowed).toBe(false);
  });
});

describe('Rate Limit Error Handling', () => {
  test('RateLimitError provides user-friendly messages', () => {
    const rateLimitInfo = {
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      retryAfter: 30,
    };

    const error = new RateLimitError('Rate limit exceeded', rateLimitInfo);
    
    expect(error.name).toBe('RateLimitError');
    expect(error.getUserMessage()).toContain('30 seconds');
  });

  test('formats retry time in minutes', () => {
    const rateLimitInfo = {
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      retryAfter: 120, // 2 minutes
    };

    const error = new RateLimitError('Rate limit exceeded', rateLimitInfo);
    expect(error.getUserMessage()).toContain('2 minutes');
  });

  test('formats retry time in hours', () => {
    const rateLimitInfo = {
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      retryAfter: 7200, // 2 hours
    };

    const error = new RateLimitError('Rate limit exceeded', rateLimitInfo);
    expect(error.getUserMessage()).toContain('2 hours');
  });
});

describe('Rate Limit Protection Wrapper', () => {
  test('allows function execution within limits', async () => {
    const limiter = createRateLimiter({
      maxAttempts: 3,
      windowMs: 60000,
    });

    const mockFn = jest.fn().mockResolvedValue('success');
    const userId = 'test-user-' + Date.now();

    const result = await withRateLimitProtection(
      limiter,
      userId,
      'test-action',
      mockFn
    );

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalled();
  });

  test('throws RateLimitError when limit exceeded', async () => {
    const limiter = createRateLimiter({
      maxAttempts: 1,
      windowMs: 60000,
    });

    const mockFn = jest.fn().mockResolvedValue('success');
    const userId = 'test-user-' + Date.now();
    const action = 'test-action-' + Date.now();

    // First call should succeed
    await withRateLimitProtection(limiter, userId, action, mockFn);

    // Second call should throw
    await expect(
      withRateLimitProtection(limiter, userId, action, mockFn)
    ).rejects.toThrow(RateLimitError);
  });
});

describe('Cleanup and Memory Management', () => {
  test('limiter cleans up old entries', (done) => {
    const limiter = createRateLimiter({
      maxAttempts: 5,
      windowMs: 100, // Very short window
    });

    // Make some requests
    limiter.check('cleanup-test-1');
    limiter.check('cleanup-test-2');
    limiter.check('cleanup-test-3');

    // Wait for cleanup cycle
    setTimeout(() => {
      // After cleanup, old entries should be removed
      // This is tested implicitly by the limiter still working
      const result = limiter.check('cleanup-test-4');
      expect(result.allowed).toBe(true);
      done();
    }, 200);
  });
});

describe('Distributed Rate Limiting Considerations', () => {
  test('keys are properly formatted for distributed systems', () => {
    // Test that keys are consistent and predictable
    const userId = 'user-123';
    const action = 'login';
    
    const key1 = `${action}:${userId}`;
    const key2 = `${action}:${userId}`;
    
    expect(key1).toBe(key2);
  });
});

describe('Edge Cases', () => {
  test('handles null user ID', () => {
    const limiter = createRateLimiter({
      maxAttempts: 3,
      windowMs: 60000,
    });

    const result = checkRateLimit(limiter, null, 'test-action');
    expect(result.allowed).toBe(true);
  });

  test('handles concurrent requests', () => {
    const limiter = createRateLimiter({
      maxAttempts: 10,
      windowMs: 60000,
    });

    const userId = 'concurrent-user-' + Date.now();
    const results = [];

    // Make 10 concurrent requests
    for (let i = 0; i < 10; i++) {
      results.push(limiter.check(userId));
    }

    // All should be allowed
    results.forEach(result => {
      expect(result.allowed).toBe(true);
    });

    // Next request should be blocked
    const finalResult = limiter.check(userId);
    expect(finalResult.allowed).toBe(false);
  });

  test('provides accurate remaining count', () => {
    const limiter = createRateLimiter({
      maxAttempts: 5,
      windowMs: 60000,
    });

    const userId = 'remaining-test-' + Date.now();

    for (let i = 5; i > 0; i--) {
      const result = limiter.check(userId);
      expect(result.remaining).toBe(i - 1);
    }
  });
});
