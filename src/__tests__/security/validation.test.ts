/**
 * Security Tests - Input Validation
 * 
 * Tests for all validation utilities to ensure they properly
 * prevent security vulnerabilities.
 */

import {
  validateEmail,
  validatePassword,
  sanitizeHtml,
  stripHtml,
  sanitizeUserInput,
  validateImageUpload,
  validateDocumentUpload,
  validateTextLength,
  validateRequired,
  validateUUID,
  validateURL,
  validatePhoneNumber,
  validateDate,
  validateFutureDate,
  detectSQLInjection,
  validateForm,
  loginSchema,
  registerSchema,
} from '../../lib/validation';

describe('Email Validation', () => {
  test('accepts valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@domain.com',
      'admin_123@test-domain.com',
    ];

    validEmails.forEach(email => {
      const result = validateEmail(email);
      expect(result.valid).toBe(true);
    });
  });

  test('rejects invalid email addresses', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
      'user@.com',
      '',
    ];

    invalidEmails.forEach(email => {
      const result = validateEmail(email);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  test('rejects emails that are too long', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    const result = validateEmail(longEmail);
    expect(result.valid).toBe(false);
  });
});

describe('Password Validation', () => {
  test('accepts strong passwords', () => {
    const strongPasswords = [
      'SecurePass123!',
      'MyP@ssw0rd2024',
      'C0mpl3x!Pass',
    ];

    strongPasswords.forEach(password => {
      const result = validatePassword(password);
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(2);
    });
  });

  test('rejects weak passwords', () => {
    const weakPasswords = [
      'short',
      '12345678',
      'password',
      'abcdefgh',
    ];

    weakPasswords.forEach(password => {
      const result = validatePassword(password);
      expect(result.valid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  test('requires minimum length of 8 characters', () => {
    const result = validatePassword('Pass1!');
    expect(result.valid).toBe(false);
    expect(result.feedback.some(f => f.includes('8 characters'))).toBe(true);
  });

  test('detects common patterns', () => {
    const result = validatePassword('password123');
    expect(result.feedback.some(f => f.includes('common patterns'))).toBe(true);
  });
});

describe('XSS Protection', () => {
  test('sanitizes HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  test('strips HTML tags completely', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const stripped = stripHtml(input);
    expect(stripped).toBe('Hello World');
    expect(stripped).not.toContain('<');
  });

  test('sanitizes user input safely', () => {
    const input = '<img src=x onerror=alert(1)> Test';
    const sanitized = sanitizeUserInput(input);
    expect(sanitized).not.toContain('<img');
    expect(sanitized).not.toContain('onerror');
  });

  test('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(stripHtml('')).toBe('');
    expect(sanitizeUserInput('')).toBe('');
  });
});

describe('File Upload Validation', () => {
  test('accepts valid image files', () => {
    const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
    
    const result = validateImageUpload(validFile);
    expect(result.valid).toBe(true);
  });

  test('rejects files that are too large', () => {
    const largeFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 20 * 1024 * 1024 }); // 20MB
    
    const result = validateImageUpload(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  test('rejects invalid file types', () => {
    const invalidFile = new File([''], 'test.exe', { type: 'application/x-msdownload' });
    
    const result = validateImageUpload(invalidFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  test('rejects files with invalid characters in name', () => {
    const invalidFile = new File([''], 'test<script>.jpg', { type: 'image/jpeg' });
    
    const result = validateImageUpload(invalidFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid characters');
  });
});

describe('SQL Injection Detection', () => {
  test('detects SQL injection attempts', () => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin' --",
      "1; DELETE FROM users",
      "UNION SELECT * FROM passwords",
    ];

    sqlInjectionAttempts.forEach(input => {
      const result = detectSQLInjection(input);
      expect(result.safe).toBe(false);
      expect(result.warning).toBeDefined();
    });
  });

  test('allows safe input', () => {
    const safeInputs = [
      'John Doe',
      'test@example.com',
      'My project description',
    ];

    safeInputs.forEach(input => {
      const result = detectSQLInjection(input);
      expect(result.safe).toBe(true);
    });
  });
});

describe('UUID Validation', () => {
  test('accepts valid UUIDs', () => {
    const validUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ];

    validUUIDs.forEach(uuid => {
      const result = validateUUID(uuid);
      expect(result.valid).toBe(true);
    });
  });

  test('rejects invalid UUIDs', () => {
    const invalidUUIDs = [
      'not-a-uuid',
      '550e8400-e29b-41d4-a716',
      '550e8400-e29b-41d4-a716-44665544000g',
      '',
    ];

    invalidUUIDs.forEach(uuid => {
      const result = validateUUID(uuid);
      expect(result.valid).toBe(false);
    });
  });
});

describe('URL Validation', () => {
  test('accepts valid URLs', () => {
    const validURLs = [
      'https://example.com',
      'http://test.com/path?query=value',
      'https://sub.domain.com:8080/path',
    ];

    validURLs.forEach(url => {
      const result = validateURL(url);
      expect(result.valid).toBe(true);
    });
  });

  test('rejects invalid protocols', () => {
    const result = validateURL('javascript:alert(1)');
    expect(result.valid).toBe(false);
  });

  test('rejects malformed URLs', () => {
    const result = validateURL('not a url');
    expect(result.valid).toBe(false);
  });
});

describe('Phone Number Validation', () => {
  test('accepts valid phone numbers', () => {
    const validPhones = [
      '+12345678901',
      '+44 20 7123 4567',
      '+1-234-567-8901',
    ];

    validPhones.forEach(phone => {
      const result = validatePhoneNumber(phone);
      expect(result.valid).toBe(true);
    });
  });

  test('rejects invalid phone numbers', () => {
    const invalidPhones = [
      '123',
      'not-a-phone',
      '00000000000',
    ];

    invalidPhones.forEach(phone => {
      const result = validatePhoneNumber(phone);
      expect(result.valid).toBe(false);
    });
  });
});

describe('Form Validation', () => {
  test('validates login form correctly', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    };

    const result = validateForm(validData, loginSchema);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  test('catches missing required fields', () => {
    const invalidData = {
      email: '',
      password: '',
    };

    const result = validateForm(invalidData, loginSchema);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  test('validates registration form with password strength', () => {
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123!',
      fullName: 'John Doe',
    };

    const result = validateForm(validData, registerSchema);
    expect(result.valid).toBe(true);
  });

  test('rejects weak passwords in registration', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'weak',
      fullName: 'John Doe',
    };

    const result = validateForm(invalidData, registerSchema);
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });
});

describe('Text Length Validation', () => {
  test('accepts text within limits', () => {
    const result = validateTextLength('Hello', { min: 2, max: 10 });
    expect(result.valid).toBe(true);
  });

  test('rejects text that is too short', () => {
    const result = validateTextLength('A', { min: 2, max: 10 });
    expect(result.valid).toBe(false);
  });

  test('rejects text that is too long', () => {
    const result = validateTextLength('A'.repeat(100), { min: 2, max: 10 });
    expect(result.valid).toBe(false);
  });
});

describe('Required Field Validation', () => {
  test('accepts non-empty values', () => {
    const result = validateRequired('value');
    expect(result.valid).toBe(true);
  });

  test('rejects empty strings', () => {
    const result = validateRequired('');
    expect(result.valid).toBe(false);
  });

  test('rejects null and undefined', () => {
    expect(validateRequired(null).valid).toBe(false);
    expect(validateRequired(undefined).valid).toBe(false);
  });

  test('rejects whitespace-only strings', () => {
    const result = validateRequired('   ');
    expect(result.valid).toBe(false);
  });
});

describe('Date Validation', () => {
  test('accepts valid dates', () => {
    const result = validateDate('2024-01-01');
    expect(result.valid).toBe(true);
  });

  test('rejects invalid dates', () => {
    const result = validateDate('not-a-date');
    expect(result.valid).toBe(false);
  });

  test('rejects dates outside reasonable range', () => {
    const result = validateDate('1800-01-01');
    expect(result.valid).toBe(false);
  });

  test('validates future dates correctly', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    const result = validateFutureDate(futureDate.toISOString());
    expect(result.valid).toBe(true);
  });

  test('rejects past dates when future is required', () => {
    const result = validateFutureDate('2020-01-01');
    expect(result.valid).toBe(false);
  });
});
