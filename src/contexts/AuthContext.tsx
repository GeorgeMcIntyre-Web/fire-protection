import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, DEMO_MODE } from '../lib/supabase'
import {
  secureSignIn,
  secureSignUp,
  sendPasswordReset,
  updatePassword,
  changePassword,
  sendEmailVerification,
  isEmailVerified,
  createSession,
  clearSessionInfo,
  initializeSessionMonitoring,
  recordPasswordChange,
} from '../lib/auth-helpers'
import { loadUserContext, clearUserContext } from '../lib/rbac'
import { loginRateLimiter, getRateLimitKey } from '../lib/rate-limiting'
import { validateEmail, validatePassword } from '../lib/validation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, rememberMe?: boolean) => Promise<{ 
    error: any; 
    requiresEmailVerification?: boolean 
  }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ 
    error: any;
    requiresMFA?: boolean 
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>
  checkEmailVerified: () => Promise<boolean>
  validateCredentials: (email: string, password: string) => { valid: boolean; errors: string[] }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Load user context for RBAC if session exists
      if (session?.user) {
        await loadUserContext()
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Create or update user profile
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email!,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating/updating profile:', error)
        }

        // Load user context for RBAC
        await loadUserContext()
      }

      if (event === 'SIGNED_OUT') {
        // Clear user context
        clearUserContext()
        clearSessionInfo()
      }
    })

    // Initialize session timeout monitoring
    const cleanupSessionMonitoring = initializeSessionMonitoring(async () => {
      console.log('Session timed out due to inactivity')
      await signOut()
    })

    return () => {
      subscription.unsubscribe()
      cleanupSessionMonitoring()
    }
  }, [])

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string,
    rememberMe: boolean = false
  ) => {
    if (DEMO_MODE) {
      // Demo mode - simulate successful signup
      const demoUser = {
        id: 'demo-user-id',
        email: email,
        user_metadata: { full_name: fullName },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        identities: []
      } as User

      setUser(demoUser)
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: demoUser
      } as Session)

      createSession(rememberMe)

      return { error: null, requiresEmailVerification: false }
    }

    // Use secure sign up with validation
    const result = await secureSignUp(email, password, fullName)
    
    if (result.success) {
      createSession(rememberMe)
      return { error: null, requiresEmailVerification: result.requiresEmailVerification }
    }

    return { error: result.error || 'Sign up failed' }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    if (DEMO_MODE) {
      // Demo mode - simulate successful signin
      const demoUser = {
        id: 'demo-user-id',
        email: email,
        user_metadata: { full_name: 'Demo User' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        identities: []
      } as User

      setUser(demoUser)
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: demoUser
      } as Session)

      createSession(rememberMe)

      return { error: null, requiresMFA: false }
    }

    // Check rate limit before attempting sign in
    const rateLimitKey = getRateLimitKey(null, 'login')
    const rateLimitResult = loginRateLimiter.check(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return { 
        error: `Too many login attempts. Please try again in ${rateLimitResult.retryAfter} seconds.`,
        requiresMFA: false
      }
    }

    // Use secure sign in with validation and rate limiting
    const result = await secureSignIn(email, password, rememberMe)
    
    if (result.success) {
      return { error: null, requiresMFA: result.requiresMFA }
    }

    return { error: result.error || 'Sign in failed', requiresMFA: false }
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      // Demo mode - just clear local state
      setUser(null)
      setSession(null)
      clearUserContext()
      clearSessionInfo()
      return
    }
    
    clearUserContext()
    clearSessionInfo()
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    return await sendPasswordReset(email)
  }

  const updateUserPassword = async (newPassword: string) => {
    const result = await updatePassword(newPassword)
    
    if (result.success) {
      await recordPasswordChange()
    }
    
    return result
  }

  const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    const result = await changePassword(currentPassword, newPassword)
    
    if (result.success) {
      await recordPasswordChange()
    }
    
    return result
  }

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      return { success: false, error: 'No user email found' }
    }
    
    return await sendEmailVerification(user.email)
  }

  const checkEmailVerified = async () => {
    return await isEmailVerified()
  }

  const validateCredentials = (email: string, password: string) => {
    const errors: string[] = []
    
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      errors.push(emailValidation.error || 'Invalid email')
    }
    
    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.feedback)
    }
    
    return {
      valid: errors.length === 0,
      errors,
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserPassword,
    changeUserPassword,
    resendVerificationEmail,
    checkEmailVerified,
    validateCredentials,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
