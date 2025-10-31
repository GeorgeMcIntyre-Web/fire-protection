/**
 * Input Validation & Sanitization Utilities
 * 
 * This module provides comprehensive validation for all user inputs
 * to prevent security vulnerabilities like XSS, SQL injection, and invalid data.
 */

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Validates email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { valid: false, error: 'Email is required' };
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true };
}

// ============================================
// PASSWORD VALIDATION
// ============================================

export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  valid: boolean;
}

/**
 * Validates password strength and returns detailed feedback
 */
export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  // Minimum length requirement
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
    return { score: 0, feedback, valid: false };
  }
  
  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (varietyCount < 3) {
    feedback.push('Password should include at least 3 of: lowercase, uppercase, numbers, special characters');
  }
  
  score += varietyCount - 1; // 0-3 points for variety
  
  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|234|345|456|567|678|789/, // Sequential numbers
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, // Sequential letters
    /password|admin|user|login|pass/i, // Common words
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push('Avoid common patterns, sequential characters, or dictionary words');
      score = Math.max(0, score - 1);
      break;
    }
  }
  
  // Maximum score is 4
  score = Math.min(4, score);
  
  // Determine if password meets minimum requirements
  const valid = password.length >= 8 && varietyCount >= 3 && score >= 2;
  
  if (valid && feedback.length === 0) {
    if (score === 4) {
      feedback.push('Very strong password!');
    } else if (score === 3) {
      feedback.push('Strong password');
    } else {
      feedback.push('Password meets minimum requirements');
    }
  }
  
  return { score, feedback, valid };
}

// ============================================
// XSS PROTECTION
// ============================================

/**
 * Sanitizes HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Removes all HTML tags from input
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes user input for safe display
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  
  // First strip HTML tags
  let sanitized = stripHtml(input);
  
  // Then escape remaining special characters
  sanitized = sanitizeHtml(sanitized);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

// ============================================
// FILE UPLOAD VALIDATION
// ============================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Validates image file upload
 */
export function validateImageUpload(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }
  
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }
  
  // Check file name
  const fileNameRegex = /^[a-zA-Z0-9_\-. ]+$/;
  if (!fileNameRegex.test(file.name)) {
    return {
      valid: false,
      error: 'File name contains invalid characters',
    };
  }
  
  return { valid: true };
}

/**
 * Validates document file upload
 */
export function validateDocumentUpload(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: PDF, Word, Excel, Text, CSV`,
    };
  }
  
  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
    };
  }
  
  // Check file name
  const fileNameRegex = /^[a-zA-Z0-9_\-. ]+$/;
  if (!fileNameRegex.test(file.name)) {
    return {
      valid: false,
      error: 'File name contains invalid characters',
    };
  }
  
  return { valid: true };
}

// ============================================
// TEXT INPUT VALIDATION
// ============================================

/**
 * Validates text length
 */
export function validateTextLength(
  text: string,
  options: { min?: number; max?: number; fieldName?: string } = {}
): { valid: boolean; error?: string } {
  const { min = 0, max = 10000, fieldName = 'Field' } = options;
  
  if (text.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  
  if (text.length > max) {
    return { valid: false, error: `${fieldName} must not exceed ${max} characters` };
  }
  
  return { valid: true };
}

/**
 * Validates required field
 */
export function validateRequired(value: any, fieldName: string = 'Field'): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  return { valid: true };
}

// ============================================
// UUID VALIDATION
// ============================================

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string): { valid: boolean; error?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' };
  }
  
  return { valid: true };
}

// ============================================
// URL VALIDATION
// ============================================

/**
 * Validates URL format and safety
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    
    // Check for localhost or private IPs in production
    const hostname = urlObj.hostname.toLowerCase();
    const privateIPPattern = /^(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
    
    if (import.meta.env.PROD && privateIPPattern.test(hostname)) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// ============================================
// PHONE NUMBER VALIDATION
// ============================================

/**
 * Validates phone number format (international format)
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it's a valid international format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format. Use international format (e.g., +1234567890)' };
  }
  
  return { valid: true };
}

// ============================================
// DATE VALIDATION
// ============================================

/**
 * Validates date string and checks if it's within reasonable range
 */
export function validateDate(dateString: string): { valid: boolean; error?: string } {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  // Check if date is within reasonable range (1900 to 2100)
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) {
    return { valid: false, error: 'Date must be between 1900 and 2100' };
  }
  
  return { valid: true };
}

/**
 * Validates that a date is in the future
 */
export function validateFutureDate(dateString: string): { valid: boolean; error?: string } {
  const dateValidation = validateDate(dateString);
  if (!dateValidation.valid) {
    return dateValidation;
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date <= now) {
    return { valid: false, error: 'Date must be in the future' };
  }
  
  return { valid: true };
}

// ============================================
// SQL INJECTION PREVENTION
// ============================================

/**
 * Detects potential SQL injection patterns
 * Note: This is a secondary defense. Primary defense is using parameterized queries.
 */
export function detectSQLInjection(input: string): { safe: boolean; warning?: string } {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
    /--/, // SQL comment
    /;/, // Query separator
    /\/\*/, // Multi-line comment
    /\*\//, // Multi-line comment end
    /'.*OR.*'.*=.*'/i, // Classic SQL injection
    /\bOR\b.*\b=\b/i, // OR condition
    /\bAND\b.*\b=\b/i, // AND condition
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return {
        safe: false,
        warning: 'Input contains potentially dangerous SQL patterns',
      };
    }
  }
  
  return { safe: true };
}

// ============================================
// COMPREHENSIVE FORM VALIDATION
// ============================================

export interface ValidationRule {
  type: 'required' | 'email' | 'password' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

/**
 * Validates form data against a schema
 */
export function validateForm(data: Record<string, any>, schema: ValidationSchema): {
  valid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};
  
  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];
    
    for (const rule of rules) {
      switch (rule.type) {
        case 'required': {
          const result = validateRequired(value, fieldName);
          if (!result.valid) {
            errors[fieldName] = rule.message || result.error || `${fieldName} is required`;
          }
          break;
        }
        
        case 'email': {
          if (value) {
            const result = validateEmail(value);
            if (!result.valid) {
              errors[fieldName] = rule.message || result.error || 'Invalid email';
            }
          }
          break;
        }
        
        case 'password': {
          if (value) {
            const result = validatePassword(value);
            if (!result.valid) {
              errors[fieldName] = rule.message || result.feedback.join('. ');
            }
          }
          break;
        }
        
        case 'minLength': {
          if (value && value.length < (rule.value || 0)) {
            errors[fieldName] = rule.message || `Minimum length is ${rule.value}`;
          }
          break;
        }
        
        case 'maxLength': {
          if (value && value.length > (rule.value || 0)) {
            errors[fieldName] = rule.message || `Maximum length is ${rule.value}`;
          }
          break;
        }
        
        case 'pattern': {
          if (value && rule.value instanceof RegExp && !rule.value.test(value)) {
            errors[fieldName] = rule.message || 'Invalid format';
          }
          break;
        }
        
        case 'custom': {
          if (rule.validator && !rule.validator(value)) {
            errors[fieldName] = rule.message || 'Validation failed';
          }
          break;
        }
      }
      
      // Stop at first error for this field
      if (errors[fieldName]) break;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================
// PRESET VALIDATION SCHEMAS
// ============================================

export const loginSchema: ValidationSchema = {
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' },
  ],
  password: [
    { type: 'required', message: 'Password is required' },
  ],
};

export const registerSchema: ValidationSchema = {
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' },
  ],
  password: [
    { type: 'required', message: 'Password is required' },
    { type: 'password', message: 'Password does not meet requirements' },
  ],
  fullName: [
    { type: 'required', message: 'Full name is required' },
    { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
    { type: 'maxLength', value: 100, message: 'Name must not exceed 100 characters' },
  ],
};

export const projectSchema: ValidationSchema = {
  name: [
    { type: 'required', message: 'Project name is required' },
    { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' },
    { type: 'maxLength', value: 200, message: 'Name must not exceed 200 characters' },
  ],
  description: [
    { type: 'maxLength', value: 5000, message: 'Description must not exceed 5000 characters' },
  ],
};

export const clientSchema: ValidationSchema = {
  name: [
    { type: 'required', message: 'Client name is required' },
    { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
    { type: 'maxLength', value: 200, message: 'Name must not exceed 200 characters' },
  ],
  email: [
    { type: 'email', message: 'Invalid email format' },
  ],
  phone: [
    {
      type: 'custom',
      validator: (value) => !value || validatePhoneNumber(value).valid,
      message: 'Invalid phone number format',
    },
  ],
};
