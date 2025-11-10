/**
 * Fire Consultancy Custom Hooks
 * 
 * React hooks for data fetching and mutations
 */

import { useState, useEffect } from 'react'
import type {
  JobWithRelations,
  Engineer,
  DesignRequest,
  FireSystem,
  BillingSplit,
  AccreditationAlert
} from './fireconsult-types'
import {
  getFireConsultJob,
  getEngineer,
  getDesignRequests,
  getFireSystems,
  getBillingSplitByJobId,
  getAccreditationAlerts
} from './fireconsult'

/**
 * Hook to fetch a single job with relations
 */
export function useJob(jobId: string | null) {
  const [job, setJob] = useState<JobWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setJob(null)
      return
    }

    setLoading(true)
    setError(null)
    getFireConsultJob(jobId)
      .then(data => {
        setJob(data)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load job')
        console.error('Error loading job:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [jobId])

  return { job, loading, error }
}

/**
 * Hook to fetch an engineer with accreditations
 */
export function useEngineer(engineerId: string | null) {
  const [engineer, setEngineer] = useState<Engineer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!engineerId) {
      setEngineer(null)
      return
    }

    setLoading(true)
    setError(null)
    getEngineer(engineerId)
      .then(data => {
        setEngineer(data)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load engineer')
        console.error('Error loading engineer:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [engineerId])

  return { engineer, loading, error }
}

/**
 * Hook to fetch design requests for a job
 */
export function useDesignRequests(jobId: string | null) {
  const [requests, setRequests] = useState<DesignRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setRequests([])
      return
    }

    setLoading(true)
    setError(null)
    getDesignRequests(jobId)
      .then(data => {
        setRequests(data)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load design requests')
        console.error('Error loading design requests:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [jobId])

  return { requests, loading, error }
}

/**
 * Hook to fetch fire systems for a job
 */
export function useFireSystems(jobId: string | null) {
  const [systems, setSystems] = useState<FireSystem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setSystems([])
      return
    }

    setLoading(true)
    setError(null)
    getFireSystems(jobId)
      .then(data => {
        setSystems(data)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load fire systems')
        console.error('Error loading fire systems:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [jobId])

  return { systems, loading, error }
}

/**
 * Hook to fetch billing split for a job
 */
export function useBillingSplit(jobId: string | null) {
  const [billingSplit, setBillingSplit] = useState<BillingSplit | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setBillingSplit(null)
      return
    }

    setLoading(true)
    setError(null)
    getBillingSplitByJobId(jobId)
      .then(data => {
        setBillingSplit(data)
      })
      .catch(err => {
        // Not an error if no billing split exists yet
        if (err instanceof Error && err.message.includes('PGRST116')) {
          setBillingSplit(null)
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load billing split')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [jobId])

  return { billingSplit, loading, error }
}

/**
 * Hook to fetch accreditation alerts
 */
export function useAccreditationAlerts(daysAhead: number = 30) {
  const [alerts, setAlerts] = useState<AccreditationAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAccreditationAlerts(daysAhead)
      .then(data => {
        setAlerts(data)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load accreditation alerts')
        console.error('Error loading accreditation alerts:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [daysAhead])

  return { alerts, loading, error }
}

/**
 * Generic mutation hook for FireConsult operations
 */
export function useFireConsultMutation<T, P = void>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (mutationFn: (params: P) => Promise<T>, params: P): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFn(params)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed'
      setError(message)
      console.error('Mutation error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

