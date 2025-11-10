/**
 * Quote Tokens - Secure Public Access
 * 
 * Generates secure tokens for clients to view quotes without authentication
 */

import { supabase } from './supabase'
import { nanoid } from 'nanoid'

export interface QuoteToken {
  id: string
  quote_id: string
  token: string
  expires_at: string
  viewed_at: string | null
  viewed_count: number
  created_at: string
}

/**
 * Generate a secure token for a quote
 */
export async function generateQuoteToken(
  quoteId: string,
  daysValid: number = 30
): Promise<string> {
  const token = nanoid(32) // 32-character secure token
  const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from('quote_tokens')
    .insert({
      quote_id: quoteId,
      token,
      expires_at: expiresAt.toISOString()
    })

  if (error) throw error

  return token
}

/**
 * Get quote token by token value
 */
export async function getQuoteTokenByToken(tokenValue: string): Promise<QuoteToken | null> {
  const { data, error } = await supabase
    .from('quote_tokens')
    .select('*')
    .eq('token', tokenValue)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * Get quote token by quote ID
 */
export async function getQuoteTokenByQuoteId(quoteId: string): Promise<QuoteToken | null> {
  const { data, error } = await supabase
    .from('quote_tokens')
    .select('*')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * Mark token as viewed (increment view count)
 */
export async function markTokenAsViewed(tokenValue: string): Promise<void> {
  try {
    // Try RPC first (if it exists)
    const { error: rpcError } = await supabase.rpc('mark_quote_token_viewed', {
      token_value: tokenValue
    })

    if (!rpcError) return
  } catch (err) {
    // RPC doesn't exist, use fallback
  }

  // Fallback: Update directly
  const { data: existing } = await supabase
    .from('quote_tokens')
    .select('viewed_count')
    .eq('token', tokenValue)
    .single()

  const newCount = (existing?.viewed_count || 0) + 1

  const { error: updateError } = await supabase
    .from('quote_tokens')
    .update({
      viewed_at: new Date().toISOString(),
      viewed_count: newCount
    })
    .eq('token', tokenValue)

  if (updateError) throw updateError
}

/**
 * Generate public quote URL
 */
export function generateQuoteUrl(token: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/quote/${token}`
}

/**
 * Validate token (check if expired)
 */
export function isTokenValid(token: QuoteToken | null): boolean {
  if (!token) return false
  return new Date(token.expires_at) > new Date()
}

