# Security Test Suite

This directory contains comprehensive security tests for the Fire Protection Tracker application.

## Test Files

### `validation.test.ts`
Tests for input validation utilities including:
- Email validation
- Password strength validation
- XSS protection (HTML sanitization)
- File upload validation
- SQL injection detection
- UUID, URL, phone number validation
- Form validation schemas

### `rbac.test.ts`
Tests for Role-Based Access Control including:
- Role definitions and hierarchy
- Permission assignments
- User context management
- Permission checking
- Resource ownership
- Action authorization
- Security boundaries

### `rate-limiting.test.ts`
Tests for rate limiting utilities including:
- Basic rate limiter functionality
- Login attempt limiting
- Password reset limiting
- Rate limit error handling
- Memory management and cleanup
- Edge cases and concurrent requests

## Running Tests

### Run all security tests
```bash
npm test -- src/__tests__/security
```

### Run specific test file
```bash
npm test -- src/__tests__/security/validation.test.ts
```

### Run with coverage
```bash
npm test -- --coverage src/__tests__/security
```

## Test Coverage Goals

- **Validation**: 100% coverage of all validation functions
- **RBAC**: 100% coverage of permission checking logic
- **Rate Limiting**: 95%+ coverage including edge cases

## Security Test Principles

1. **Test Attack Vectors**: Each test should simulate a potential security vulnerability
2. **Positive and Negative Cases**: Test both valid and invalid inputs
3. **Edge Cases**: Test boundary conditions and unusual inputs
4. **Real-World Scenarios**: Base tests on actual attack patterns

## Adding New Tests

When adding new security features, ensure:
1. Create corresponding test file
2. Test all security boundaries
3. Include both success and failure scenarios
4. Document the security risk being tested
5. Update this README

## Test Data

Use realistic test data that represents actual attack patterns:
- SQL injection attempts
- XSS payloads
- Malformed inputs
- Boundary conditions
- Race conditions

## Continuous Integration

These tests should run:
- On every commit
- Before every deployment
- As part of security audit process
- After any security-related code changes

## Security Test Checklist

- [ ] All validation functions tested
- [ ] All RBAC permissions tested
- [ ] Rate limiting enforced for all sensitive operations
- [ ] XSS protection verified
- [ ] SQL injection prevention tested
- [ ] File upload security verified
- [ ] Session management tested
- [ ] Error handling doesn't leak sensitive information

## Reporting Security Issues

If tests reveal security vulnerabilities:
1. Do not commit the vulnerability
2. Report to security team immediately
3. Create private issue/ticket
4. Fix before public disclosure
5. Add regression test

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
