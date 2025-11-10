/**
 * Fire Consultancy Context
 * 
 * Global state management for FireConsult module
 */

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type {
  FireConsultJob,
  Engineer,
  FireConsultDashboardStats
} from '../lib/fireconsult-types'
import {
  getFireConsultJobs,
  getEngineers,
  getFireConsultDashboardStats
} from '../lib/fireconsult'

interface FireConsultContextType {
  // State
  jobs: FireConsultJob[]
  engineers: Engineer[]
  stats: FireConsultDashboardStats | null
  loading: boolean
  error: string | null

  // Actions
  refreshJobs: () => Promise<void>
  refreshEngineers: () => Promise<void>
  refreshStats: () => Promise<void>
  refreshAll: () => Promise<void>
}

const FireConsultContext = createContext<FireConsultContextType | undefined>(undefined)

export function FireConsultProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<FireConsultJob[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [stats, setStats] = useState<FireConsultDashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshJobs = async () => {
    if (!user?.id) return
    
    try {
      setError(null)
      const data = await getFireConsultJobs(user.id)
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
      console.error('Error refreshing jobs:', err)
    }
  }

  const refreshEngineers = async () => {
    try {
      setError(null)
      const data = await getEngineers(true) // Active only
      setEngineers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load engineers')
      console.error('Error refreshing engineers:', err)
    }
  }

  const refreshStats = async () => {
    if (!user?.id) return
    
    try {
      setError(null)
      const data = await getFireConsultDashboardStats(user.id)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
      console.error('Error refreshing stats:', err)
    }
  }

  const refreshAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        refreshJobs(),
        refreshEngineers(),
        refreshStats()
      ])
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refreshAll()
    }
  }, [user?.id])

  return (
    <FireConsultContext.Provider
      value={{
        jobs,
        engineers,
        stats,
        loading,
        error,
        refreshJobs,
        refreshEngineers,
        refreshStats,
        refreshAll
      }}
    >
      {children}
    </FireConsultContext.Provider>
  )
}

export function useFireConsult() {
  const context = useContext(FireConsultContext)
  if (context === undefined) {
    throw new Error('useFireConsult must be used within a FireConsultProvider')
  }
  return context
}

