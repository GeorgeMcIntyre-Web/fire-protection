/**
 * Authentication Helper Utilities
 * 
 * Enhanced authentication features including:
 * - Email verification
 * - Password reset
 * - Session management
 * - Remember Me functionality
 * - MFA preparation
 */

import { supabase } from './supabase';
import { validateEmail, validatePassword } from './validation';

// ============================================
// SESSION MANAGEMENT
// ============================================

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

interface SessionInfo {
  lastActivity: number;
  rememberMe: boolean;
  expiresAt: number;
}

/**
 * Gets session info from localStorage
 */
export function getSessionInfo(): SessionInfo | null {
  const sessionData = localStorage.getItem('session_info');
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

/**
 * Sets session info in localStorage
 */
export function setSessionInfo(info: SessionInfo): void {
  localStorage.setItem('session_info', JSON.stringify(info));
}

/**
 * Clears session info
 */
export function clearSessionInfo(): void {
  localStorage.removeItem('session_info');
}

/**
 * Updates last activity timestamp
 */
export function updateLastActivity(): void {
  const sessionInfo = getSessionInfo();
  if (sessionInfo) {
    sessionInfo.lastActivity = Date.now();
    setSessionInfo(sessionInfo);
  }
}

/**
 * Checks if session has timed out
 */
export function isSessionTimedOut(): boolean {
  const sessionInfo = getSessionInfo();
  if (!sessionInfo) return false;
  
  // If remember me is enabled, don't timeout
  if (sessionInfo.rememberMe) return false;
  
  const now = Date.now();
  const timeSinceLastActivity = now - sessionInfo.lastActivity;
  
  return timeSinceLastActivity > SESSION_TIMEOUT;
}

/**
 * Initializes session monitoring
 */
export function initializeSessionMonitoring(onTimeout: () => void): () => void {
  // Update activity on user interactions
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  const handleActivity = () => {
    updateLastActivity();
  };
  
  events.forEach(event => {
    window.addEventListener(event, handleActivity);
  });
  
  // Check for timeout periodically
  const intervalId = setInterval(() => {
    if (isSessionTimedOut()) {
      onTimeout();
    }
  }, ACTIVITY_CHECK_INTERVAL);
  
  // Return cleanup function
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    clearInterval(intervalId);
  };
}

/**
 * Creates a new session with optional remember me
 */
export function createSession(rememberMe: boolean = false): void {
  const now = Date.now();
  const sessionInfo: SessionInfo = {
    lastActivity: now,
    rememberMe,
    expiresAt: rememberMe ? now + (REMEMBER_ME_DURATION * 1000) : now + SESSION_TIMEOUT,
  };
  
  setSessionInfo(sessionInfo);
}

// ============================================
// EMAIL VERIFICATION
// ============================================

/**
 * Sends email verification to user
 */
export async function sendEmailVerification(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate email first
    const validation = validateEmail(email);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send verification email' };
  }
}

/**
 * Checks if user's email is verified
 */
export async function isEmailVerified(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email_confirmed_at != null;
  } catch {
    return false;
  }
}

/**
 * Verifies email with token from email link
 */
export async function verifyEmail(token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to verify email' };
  }
}

// ============================================
// PASSWORD RESET
// ============================================

/**
 * Sends password reset email
 */
export async function sendPasswordReset(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate email first
    const validation = validateEmail(email);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send password reset email' };
  }
}

/**
 * Updates password with new password
 */
export async function updatePassword(newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.feedback.join('. '),
      };
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update password' };
  }
}

/**
 * Changes password for authenticated user (requires current password)
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return { success: false, error: 'No authenticated user found' };
    }
    
    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    
    if (signInError) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.feedback.join('. '),
      };
    }
    
    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to change password' };
  }
}

// ============================================
// MULTI-FACTOR AUTHENTICATION (MFA) PREPARATION
// ============================================

/**
 * Enrolls user in MFA (Time-based One-Time Password)
 */
export async function enrollMFA(): Promise<{
  success: boolean;
  qrCode?: string;
  secret?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    };
  } catch (error) {
    return { success: false, error: 'Failed to enroll in MFA' };
  }
}

/**
 * Verifies MFA code and completes enrollment
 */
export async function verifyMFAEnrollment(
  factorId: string,
  code: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.mfa.challenge({
      factorId,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: factorId,
      code,
    });
    
    if (verifyError) {
      return { success: false, error: verifyError.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to verify MFA code' };
  }
}

/**
 * Checks if user has MFA enabled
 */
export async function isMFAEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return false;
    
    return data.totp.length > 0;
  } catch {
    return false;
  }
}

/**
 * Unenrolls from MFA
 */
export async function unenrollMFA(factorId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to unenroll from MFA' };
  }
}

// ============================================
// ACCOUNT SECURITY FEATURES
// ============================================

/**
 * Gets user's login history (if available from metadata)
 */
export async function getLoginHistory(): Promise<{
  success: boolean;
  history?: any[];
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }
    
    // Get login history from user metadata
    const history = user.user_metadata?.login_history || [];
    
    return { success: true, history };
  } catch (error) {
    return { success: false, error: 'Failed to get login history' };
  }
}

/**
 * Records login attempt in user metadata
 */
export async function recordLoginAttempt(success: boolean): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const loginHistory = user.user_metadata?.login_history || [];
    const newEntry = {
      timestamp: new Date().toISOString(),
      success,
      ip: 'unknown', // Would need backend support for real IP
      userAgent: navigator.userAgent,
    };
    
    // Keep only last 10 entries
    const updatedHistory = [newEntry, ...loginHistory].slice(0, 10);
    
    await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        login_history: updatedHistory,
      },
    });
  } catch (error) {
    console.error('Failed to record login attempt:', error);
  }
}

/**
 * Locks account after too many failed attempts
 */
export async function checkAccountLockout(): Promise<{
  locked: boolean;
  unlockAt?: Date;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { locked: false };
    
    const lockoutInfo = user.user_metadata?.lockout;
    if (!lockoutInfo) return { locked: false };
    
    const unlockAt = new Date(lockoutInfo.unlockAt);
    const now = new Date();
    
    if (now < unlockAt) {
      return { locked: true, unlockAt };
    }
    
    // Clear lockout if time has passed
    await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        lockout: null,
      },
    });
    
    return { locked: false };
  } catch (error) {
    return { locked: false };
  }
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Refreshes authentication token
 */
export async function refreshAuthToken(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.refreshSession();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to refresh token' };
  }
}

/**
 * Gets current session expiration time
 */
export async function getSessionExpiration(): Promise<Date | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    return new Date(session.expires_at! * 1000);
  } catch {
    return null;
  }
}

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Generates a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if password was recently changed
 */
export async function wasPasswordRecentlyChanged(withinDays: number = 90): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const lastPasswordChange = user.user_metadata?.last_password_change;
    if (!lastPasswordChange) return false;
    
    const changeDate = new Date(lastPasswordChange);
    const now = new Date();
    const daysSinceChange = (now.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceChange <= withinDays;
  } catch {
    return false;
  }
}

/**
 * Records password change timestamp
 */
export async function recordPasswordChange(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        last_password_change: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to record password change:', error);
  }
}

/**
 * Validates session is still valid
 */
export async function validateSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    // Check if session has expired
    const expiresAt = session.expires_at! * 1000;
    const now = Date.now();
    
    if (now >= expiresAt) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// ============================================
// ENHANCED SIGN IN/UP WITH SECURITY
// ============================================

/**
 * Enhanced sign up with validation and security features
 */
export async function secureSignUp(
  email: string,
  password: string,
  fullName: string
): Promise<{
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
}> {
  try {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.feedback.join('. '),
      };
    }
    
    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          last_password_change: new Date().toISOString(),
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Check if email verification is required
    const requiresEmailVerification = data.user?.email_confirmed_at == null;
    
    return {
      success: true,
      requiresEmailVerification,
    };
  } catch (error) {
    return { success: false, error: 'Failed to sign up' };
  }
}

/**
 * Enhanced sign in with security features
 */
export async function secureSignIn(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<{
  success: boolean;
  error?: string;
  requiresMFA?: boolean;
}> {
  try {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }
    
    // Check for account lockout (would need backend support)
    // For now, this is client-side only
    
    // Sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      await recordLoginAttempt(false);
      return { success: false, error: error.message };
    }
    
    // Record successful login
    await recordLoginAttempt(true);
    
    // Create session with remember me option
    createSession(rememberMe);
    
    // Check if MFA is enabled
    const mfaEnabled = await isMFAEnabled();
    
    return {
      success: true,
      requiresMFA: mfaEnabled,
    };
  } catch (error) {
    return { success: false, error: 'Failed to sign in' };
  }
}
