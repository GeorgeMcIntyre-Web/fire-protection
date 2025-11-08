# Authentication Guide

Complete guide to authentication and user management in the Fire Protection Tracker application.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [User Registration](#user-registration)
- [User Login](#user-login)
- [Password Management](#password-management)
- [Session Management](#session-management)
- [Email Verification](#email-verification)
- [Multi-Factor Authentication](#multi-factor-authentication)
- [Role-Based Access](#role-based-access)
- [Security Features](#security-features)
- [API Reference](#api-reference)

## Overview

The application uses Supabase Auth for authentication with enhanced security features including:

- Password strength validation
- Email verification
- Rate limiting
- Session timeout management
- Role-based access control
- MFA support (prepared)

## Authentication Flow

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │
       ├─> Validate Email & Password
       ├─> Create User Account
       ├─> Send Verification Email
       └─> Create User Profile
              │
              ▼
       ┌─────────────┐
       │   Verify    │
       │   Email     │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │    Login    │
       └──────┬──────┘
              │
              ├─> Check Rate Limit
              ├─> Validate Credentials
              ├─> Create Session
              └─> Load User Context
                     │
                     ▼
              ┌─────────────┐
              │ Authenticated│
              │    Session   │
              └─────────────┘
```

## User Registration

### Basic Registration

```typescript
import { useAuth } from './contexts/AuthContext';

function RegisterForm() {
  const { signUp } = useAuth();

  const handleRegister = async (email: string, password: string, fullName: string) => {
    const { error, requiresEmailVerification } = await signUp(email, password, fullName);
    
    if (error) {
      console.error('Registration failed:', error);
      return;
    }
    
    if (requiresEmailVerification) {
      // Show message to check email
      console.log('Please check your email to verify your account');
    }
  };
}
```

### Password Requirements

Passwords must meet the following criteria:

- Minimum 8 characters
- At least 3 of the following:
  - Lowercase letters (a-z)
  - Uppercase letters (A-Z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)
- No common patterns or dictionary words
- Not sequential characters

### Email Validation

Emails are validated using RFC 5322 compliant regex:
- Valid format: `user@domain.com`
- Maximum length: 254 characters
- No whitespace allowed

## User Login

### Standard Login

```typescript
import { useAuth } from './contexts/AuthContext';

function LoginForm() {
  const { signIn } = useAuth();

  const handleLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    const { error, requiresMFA } = await signIn(email, password, rememberMe);
    
    if (error) {
      console.error('Login failed:', error);
      return;
    }
    
    if (requiresMFA) {
      // Redirect to MFA verification
    }
  };
}
```

### Rate Limiting

Login attempts are rate-limited to prevent brute force attacks:
- **Limit**: 5 attempts per 15 minutes
- **Block Duration**: 30 minutes after exceeding limit
- **Scope**: Per email address

When rate limit is exceeded:
```typescript
const { error } = await signIn(email, password);
// error: "Too many login attempts. Please try again in X seconds."
```

### Remember Me

The "Remember Me" feature:
- **Enabled**: Session persists for 30 days
- **Disabled**: Session expires after 1 hour of inactivity

```typescript
await signIn(email, password, true); // Remember me enabled
```

## Password Management

### Password Reset Flow

```typescript
import { useAuth } from './contexts/AuthContext';

function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  const handleReset = async (email: string) => {
    const { success, error } = await resetPassword(email);
    
    if (success) {
      // Show success message
      console.log('Password reset email sent');
    }
  };
}
```

### Change Password (Authenticated)

```typescript
import { useAuth } from './contexts/AuthContext';

function ChangePasswordForm() {
  const { changeUserPassword } = useAuth();

  const handleChange = async (currentPassword: string, newPassword: string) => {
    const { success, error } = await changeUserPassword(currentPassword, newPassword);
    
    if (success) {
      console.log('Password changed successfully');
    }
  };
}
```

### Update Password (From Reset Email)

```typescript
import { useAuth } from './contexts/AuthContext';

function ResetPasswordForm() {
  const { updateUserPassword } = useAuth();

  const handleUpdate = async (newPassword: string) => {
    const { success, error } = await updateUserPassword(newPassword);
    
    if (success) {
      console.log('Password updated successfully');
    }
  };
}
```

### Password Security

- Passwords are never stored in plain text
- Passwords are hashed using bcrypt
- Password history prevents reuse (when implemented)
- Passwords expire after 90 days (recommended)

## Session Management

### Session Lifecycle

```typescript
// Session is automatically created on login
const { signIn } = useAuth();
await signIn(email, password, rememberMe);

// Session is validated on each request
const { user, session } = useAuth();

// Session is automatically refreshed when needed
// Session expires on:
// - Manual logout
// - Inactivity timeout (1 hour without remember me)
// - Token expiration
```

### Inactivity Timeout

Sessions timeout after inactivity:
- **Without Remember Me**: 1 hour
- **With Remember Me**: No timeout

Activity is tracked on:
- Mouse movement
- Keyboard input
- Touch events
- Scrolling

### Manual Logout

```typescript
import { useAuth } from './contexts/AuthContext';

function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // User is now logged out
    // Redirect to login page
  };
}
```

## Email Verification

### Sending Verification Email

```typescript
import { useAuth } from './contexts/AuthContext';

function ResendVerificationButton() {
  const { resendVerificationEmail } = useAuth();

  const handleResend = async () => {
    const { success, error } = await resendVerificationEmail();
    
    if (success) {
      console.log('Verification email sent');
    }
  };
}
```

### Checking Verification Status

```typescript
import { useAuth } from './contexts/AuthContext';

function VerificationStatus() {
  const { checkEmailVerified } = useAuth();

  const checkStatus = async () => {
    const isVerified = await checkEmailVerified();
    
    if (isVerified) {
      console.log('Email is verified');
    } else {
      console.log('Email is not verified');
    }
  };
}
```

### Rate Limiting

Email verification requests are rate-limited:
- **Limit**: 3 attempts per 10 minutes
- **Block Duration**: 30 minutes after exceeding

## Multi-Factor Authentication

### MFA Overview

MFA support is prepared but requires additional setup:
- TOTP (Time-based One-Time Password) support
- QR code generation for authenticator apps
- Backup codes (to be implemented)

### Enable MFA (Future)

```typescript
import { enrollMFA, verifyMFAEnrollment } from './lib/auth-helpers';

// Step 1: Enroll in MFA
const { qrCode, secret, factorId } = await enrollMFA();

// Display QR code to user
// User scans with authenticator app

// Step 2: Verify enrollment
const code = '123456'; // From authenticator app
const { success } = await verifyMFAEnrollment(factorId, code);
```

### MFA Login Flow

```typescript
// After initial login
const { requiresMFA } = await signIn(email, password);

if (requiresMFA) {
  // Prompt user for MFA code
  const code = getUserMFACode();
  
  // Verify MFA code
  const { success } = await verifyMFACode(code);
}
```

## Role-Based Access

### User Roles

| Role | Level | Description |
|------|-------|-------------|
| **Admin** | 4 | Full system access, user management, settings |
| **Manager** | 3 | Project management, team oversight, reporting |
| **Technician** | 2 | Field work, time logging, task updates |
| **Read-Only** | 1 | View-only access for reporting |

### Checking User Role

```typescript
import { useAuth } from './contexts/AuthContext';
import { getUserContext, isAdmin, isManagerOrHigher } from './lib/rbac';

function AdminPanel() {
  const { user } = useAuth();
  const userContext = getUserContext();

  if (!isAdmin()) {
    return <div>Access denied</div>;
  }

  return <div>Admin panel content</div>;
}
```

### Role Assignment

Roles are assigned:
- **On Registration**: Default role is 'technician'
- **By Admin**: Only admins can change user roles
- **Via Profile**: Role is stored in user profile table

## Security Features

### Implemented Security Measures

1. **Input Validation**
   - Email format validation
   - Password strength checking
   - XSS prevention
   - SQL injection prevention

2. **Rate Limiting**
   - Login attempts
   - Password reset requests
   - Email verification
   - API requests

3. **Session Security**
   - Automatic timeout
   - Activity tracking
   - Secure token storage
   - CSRF protection

4. **Data Protection**
   - No sensitive data in localStorage
   - Encrypted communication (HTTPS)
   - Secure cookie settings
   - RLS policies enforced

### Best Practices

✅ **DO:**
- Use the auth context hooks
- Validate user input
- Check permissions before actions
- Handle errors gracefully
- Log security events

❌ **DON'T:**
- Store passwords in localStorage
- Trust client-side validation only
- Expose sensitive data in URLs
- Skip rate limit checks
- Ignore security warnings

## API Reference

### Auth Context Methods

```typescript
interface AuthContextType {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;

  // Authentication
  signUp: (email: string, password: string, fullName: string, rememberMe?: boolean) => Promise<{
    error: any;
    requiresEmailVerification?: boolean;
  }>;
  
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{
    error: any;
    requiresMFA?: boolean;
  }>;
  
  signOut: () => Promise<void>;

  // Password Management
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Email Verification
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  checkEmailVerified: () => Promise<boolean>;

  // Validation
  validateCredentials: (email: string, password: string) => { valid: boolean; errors: string[] };
}
```

### Auth Helper Functions

```typescript
// Session Management
createSession(rememberMe: boolean): void
clearSessionInfo(): void
isSessionTimedOut(): boolean
updateLastActivity(): void

// Email Verification
sendEmailVerification(email: string): Promise<{ success: boolean; error?: string }>
isEmailVerified(): Promise<boolean>

// Password Management
sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }>
updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }>
changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }>

// MFA (Prepared)
enrollMFA(): Promise<{ success: boolean; qrCode?: string; secret?: string; error?: string }>
verifyMFAEnrollment(factorId: string, code: string): Promise<{ success: boolean; error?: string }>
isMFAEnabled(): Promise<boolean>
```

## Troubleshooting

### Common Issues

**"Too many login attempts"**
- Wait for the block duration to expire
- Check if rate limit is configured correctly
- Contact admin if locked out

**"Email not verified"**
- Check spam folder for verification email
- Use resend verification button
- Contact support if not receiving emails

**"Password doesn't meet requirements"**
- Ensure password is at least 8 characters
- Include mix of character types
- Avoid common patterns

**"Session expired"**
- Re-authenticate
- Enable "Remember Me" for longer sessions
- Check for inactivity timeout

## Examples

See the `/examples` directory for complete examples:
- Registration form with validation
- Login form with rate limiting
- Password reset flow
- Role-based component rendering
- Protected route implementation

## Support

For authentication-related issues:
- Review this guide
- Check security documentation
- Review audit logs
- Contact support team

---

**Last Updated**: 2024-10-31
**Version**: 1.0.0
