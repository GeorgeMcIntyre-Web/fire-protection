/**
 * Fire Consultancy Module - Core Library Functions
 * 
 * CRUD operations and business logic for FireConsult module
 */

import { supabase } from './supabase'
import type {
  Engineer,
  EngineerInsert,
  EngineerUpdate,
  Accreditation,
  AccreditationInsert,
  AccreditationUpdate,
  FireConsultJob,
  FireConsultJobInsert,
  FireConsultJobUpdate,
  DesignRequest,
  DesignRequestInsert,
  DesignRequestUpdate,
  BillingSplit,
  FireSystem,
  FireSystemInsert,
  FireSystemUpdate,
  JobWithRelations,
  FireConsultDashboardStats,
  AccreditationAlert,
  PricingEstimate
} from './fireconsult-types'
import { estimateWaterSupply, estimateDesignParameters } from './water-supply-estimator'

// ============================================
// ENGINEERS
// ============================================

export async function getEngineers(activeOnly: boolean = false): Promise<Engineer[]> {
  let query = supabase
    .from('engineers')
    .select('*')
    .order('full_name', { ascending: true })
  
  if (activeOnly) {
    query = query.eq('is_active', true)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getEngineer(id: string): Promise<Engineer | null> {
  const { data, error } = await supabase
    .from('engineers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

export async function createEngineer(engineer: EngineerInsert): Promise<Engineer> {
  const { data, error } = await supabase
    .from('engineers')
    .insert(engineer)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateEngineer(
  id: string,
  updates: EngineerUpdate
): Promise<Engineer> {
  const { data, error } = await supabase
    .from('engineers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteEngineer(id: string): Promise<void> {
  const { error } = await supabase
    .from('engineers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================
// ACCREDITATIONS
// ============================================

export async function getAccreditations(engineerId?: string): Promise<Accreditation[]> {
  let query = supabase
    .from('accreditations')
    .select('*')
    .order('expiry_date', { ascending: true })
  
  if (engineerId) {
    query = query.eq('engineer_id', engineerId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getAccreditation(id: string): Promise<Accreditation | null> {
  const { data, error } = await supabase
    .from('accreditations')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data
}

export async function createAccreditation(
  accreditation: AccreditationInsert
): Promise<Accreditation> {
  const { data, error } = await supabase
    .from('accreditations')
    .insert(accreditation)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateAccreditation(
  id: string,
  updates: AccreditationUpdate
): Promise<Accreditation> {
  const { data, error } = await supabase
    .from('accreditations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAccreditation(id: string): Promise<void> {
  const { error } = await supabase
    .from('accreditations')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Get accreditations that are expiring soon or expired
 */
export async function getAccreditationAlerts(
  daysAhead: number = 30
): Promise<AccreditationAlert[]> {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + daysAhead)
  
  const { data: accreditations, error } = await supabase
    .from('accreditations')
    .select('*, engineers(*)')
    .eq('is_active', true)
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .order('expiry_date', { ascending: true })
  
  if (error) throw error
  
  const alerts: AccreditationAlert[] = (accreditations || []).map((acc: any) => {
    const expiryDate = new Date(acc.expiry_date)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = daysUntilExpiry < 0
    const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= daysAhead
    
    return {
      accreditation: acc,
      engineer: acc.engineers,
      daysUntilExpiry,
      isExpired,
      isExpiringSoon
    }
  })
  
  return alerts
}

// ============================================
// FIRE CONSULT JOBS
// ============================================

export async function getFireConsultJobs(
  consultantId?: string,
  status?: string
): Promise<FireConsultJob[]> {
  let query = supabase
    .from('fire_consult_jobs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (consultantId) {
    query = query.eq('consultant_id', consultantId)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getFireConsultJob(id: string): Promise<JobWithRelations | null> {
  const { data, error } = await supabase
    .from('fire_consult_jobs')
    .select(`
      *,
      engineers:assigned_engineer_id(*),
      clients:client_id(id, name, contact_person)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  // Get design request and billing split
  const [designRequest, billingSplit] = await Promise.all([
    getDesignRequestByJobId(id),
    getBillingSplitByJobId(id)
  ])
  
  return {
    ...data,
    engineer: data.engineers || null,
    client: data.clients || null,
    design_request: designRequest,
    billing_split: billingSplit
  }
}

export async function createFireConsultJob(
  job: FireConsultJobInsert
): Promise<FireConsultJob> {
  // Auto-calculate design parameters if not provided
  if (!job.design_density_mm_per_min || !job.design_area_m2) {
    const estimates = estimateDesignParameters(
      job.commodity_class || undefined,
      job.storage_method || undefined,
      job.storage_height_m || undefined,
      job.ceiling_height_m || undefined
    )
    
    job.design_density_mm_per_min = estimates.densityMmPerMin
    job.design_area_m2 = estimates.designAreaM2
    job.sprinkler_spacing_m2 = estimates.sprinklerSpacingM2
  }
  
  // Estimate sprinkler count if not provided
  if (!job.estimated_sprinkler_count && job.design_area_m2 && job.sprinkler_spacing_m2) {
    job.estimated_sprinkler_count = Math.ceil(job.design_area_m2 / (job.sprinkler_spacing_m2 || 12))
  }
  
  // Calculate water supply if design parameters are available
  if (job.design_density_mm_per_min && job.design_area_m2) {
    const waterSupply = estimateWaterSupply({
      designDensityMmPerMin: job.design_density_mm_per_min,
      designAreaM2: job.design_area_m2,
      commodityClass: job.commodity_class || undefined,
      storageMethod: job.storage_method || undefined,
      municipalPressureBar: job.municipal_pressure_bar || undefined,
      municipalFlowLpm: job.municipal_flow_lpm || undefined,
      durationMinutes: job.estimated_duration_minutes || undefined
    })
    
    job.estimated_flow_required_lpm = waterSupply.flowRequiredLpm
    job.estimated_tank_size_m3 = waterSupply.tankSizeM3
    job.estimated_duration_minutes = waterSupply.durationMinutes
    job.requires_tank = waterSupply.requiresTank
    job.requires_pump = waterSupply.requiresPump
    job.pump_type = waterSupply.recommendedPumpType
  }
  
  // Calculate pricing if design fee per head is set
  if (job.design_fee_per_head && job.estimated_sprinkler_count) {
    job.total_design_fee = job.design_fee_per_head * job.estimated_sprinkler_count
    
    // Get engineer split percentages
    if (job.assigned_engineer_id) {
      const engineer = await getEngineer(job.assigned_engineer_id)
      if (engineer) {
        const engineerPct = engineer.engineer_split_percentage / 100
        const consultantPct = engineer.consultant_split_percentage / 100
        job.engineer_fee_amount = job.total_design_fee * engineerPct
        job.consultant_fee_amount = job.total_design_fee * consultantPct
      } else {
        // Default 90/10 split
        job.engineer_fee_amount = job.total_design_fee * 0.1
        job.consultant_fee_amount = job.total_design_fee * 0.9
      }
    } else {
      // Default 90/10 split
      job.engineer_fee_amount = job.total_design_fee * 0.1
      job.consultant_fee_amount = job.total_design_fee * 0.9
    }
  }
  
  const { data, error } = await supabase
    .from('fire_consult_jobs')
    .insert(job)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateFireConsultJob(
  id: string,
  updates: FireConsultJobUpdate
): Promise<FireConsultJob> {
  // Recalculate if design parameters changed
  if (updates.design_density_mm_per_min || updates.design_area_m2) {
    const currentJob = await getFireConsultJob(id)
    if (currentJob) {
      const density = updates.design_density_mm_per_min ?? currentJob.design_density_mm_per_min
      const area = updates.design_area_m2 ?? currentJob.design_area_m2
      
      if (density && area) {
        const waterSupply = estimateWaterSupply({
          designDensityMmPerMin: density,
          designAreaM2: area,
          commodityClass: updates.commodity_class ?? currentJob.commodity_class ?? undefined,
          storageMethod: updates.storage_method ?? currentJob.storage_method ?? undefined,
          municipalPressureBar: updates.municipal_pressure_bar ?? currentJob.municipal_pressure_bar ?? undefined,
          municipalFlowLpm: updates.municipal_flow_lpm ?? currentJob.municipal_flow_lpm ?? undefined
        })
        
        updates.estimated_flow_required_lpm = waterSupply.flowRequiredLpm
        updates.estimated_tank_size_m3 = waterSupply.tankSizeM3
        updates.requires_tank = waterSupply.requiresTank
        updates.requires_pump = waterSupply.requiresPump
        updates.pump_type = waterSupply.recommendedPumpType
      }
    }
  }
  
  const { data, error } = await supabase
    .from('fire_consult_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteFireConsultJob(id: string): Promise<void> {
  const { error } = await supabase
    .from('fire_consult_jobs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================
// DESIGN REQUESTS
// ============================================

export async function getDesignRequests(jobId?: string): Promise<DesignRequest[]> {
  let query = supabase
    .from('design_requests')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (jobId) {
    query = query.eq('job_id', jobId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getDesignRequestByJobId(jobId: string): Promise<DesignRequest | null> {
  const { data, error } = await supabase
    .from('design_requests')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data
}

export async function getDesignRequest(id: string): Promise<DesignRequest | null> {
  const { data, error } = await supabase
    .from('design_requests')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data
}

export async function createDesignRequest(
  request: DesignRequestInsert
): Promise<DesignRequest> {
  const { data, error } = await supabase
    .from('design_requests')
    .insert({
      ...request,
      request_sent_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Update job status
  await updateFireConsultJob(request.job_id, {
    status: 'design_request',
    design_request_sent_at: new Date().toISOString()
  })
  
  return data
}

export async function updateDesignRequest(
  id: string,
  updates: DesignRequestUpdate
): Promise<DesignRequest> {
  // If status changed to completed, update job
  if (updates.status === 'completed') {
    const request = await getDesignRequest(id)
    if (request) {
      await updateFireConsultJob(request.job_id, {
        status: 'design_complete',
        design_completed_at: new Date().toISOString()
      })
      
      // Update job with final design parameters if provided
      if (updates.final_sprinkler_count || updates.final_density_mm_per_min) {
        const jobUpdates: FireConsultJobUpdate = {}
        if (updates.final_sprinkler_count) {
          jobUpdates.estimated_sprinkler_count = updates.final_sprinkler_count
        }
        if (updates.final_density_mm_per_min) {
          jobUpdates.design_density_mm_per_min = updates.final_density_mm_per_min
        }
        if (updates.final_design_area_m2) {
          jobUpdates.design_area_m2 = updates.final_design_area_m2
        }
        if (updates.final_flow_required_lpm) {
          jobUpdates.estimated_flow_required_lpm = updates.final_flow_required_lpm
        }
        if (updates.final_tank_size_m3) {
          jobUpdates.estimated_tank_size_m3 = updates.final_tank_size_m3
        }
        
        if (Object.keys(jobUpdates).length > 0) {
          await updateFireConsultJob(request.job_id, jobUpdates)
        }
      }
    }
  }
  
  if (updates.status === 'acknowledged' && !updates.acknowledged_at) {
    updates.acknowledged_at = new Date().toISOString()
  }
  
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('design_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// BILLING SPLITS
// ============================================

export async function getBillingSplitByJobId(jobId: string): Promise<BillingSplit | null> {
  const { data, error } = await supabase
    .from('billing_splits')
    .select('*')
    .eq('job_id', jobId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data
}

export async function updateBillingSplit(
  jobId: string,
  updates: Partial<BillingSplit>
): Promise<BillingSplit> {
  const { data, error } = await supabase
    .from('billing_splits')
    .update(updates)
    .eq('job_id', jobId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// FIRE SYSTEMS
// ============================================

export async function getFireSystems(jobId: string): Promise<FireSystem[]> {
  const { data, error } = await supabase
    .from('fire_systems')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createFireSystem(system: FireSystemInsert): Promise<FireSystem> {
  const { data, error } = await supabase
    .from('fire_systems')
    .insert(system)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateFireSystem(
  id: string,
  updates: FireSystemUpdate
): Promise<FireSystem> {
  const { data, error } = await supabase
    .from('fire_systems')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getFireConsultDashboardStats(
  consultantId: string
): Promise<FireConsultDashboardStats> {
  const jobs = await getFireConsultJobs(consultantId)
  
  const activeStatuses = ['site_visit', 'data_collection', 'design_request', 'engineer_review']
  const activeJobs = jobs.filter(j => activeStatuses.includes(j.status))
  const pendingSignOff = jobs.filter(j => j.status === 'engineer_review' || j.status === 'design_request')
  
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const completedThisMonth = jobs.filter(j => {
    if (j.status !== 'completed' || !j.design_completed_at) return false
    const completedDate = new Date(j.design_completed_at)
    return completedDate >= thisMonth
  })
  
  const totalRevenue = jobs
    .filter(j => j.consultant_fee_amount)
    .reduce((sum, j) => sum + (j.consultant_fee_amount || 0), 0)
  
  const pendingRevenue = jobs
    .filter(j => j.status === 'design_complete' || j.status === 'billing')
    .filter(j => j.consultant_fee_amount)
    .reduce((sum, j) => sum + (j.consultant_fee_amount || 0), 0)
  
  return {
    totalJobs: jobs.length,
    activeJobs: activeJobs.length,
    pendingEngineerSignOff: pendingSignOff.length,
    completedThisMonth: completedThisMonth.length,
    totalRevenue,
    pendingRevenue
  }
}

// ============================================
// PRICING CALCULATOR
// ============================================

export function calculatePricing(
  sprinklerCount: number,
  designFeePerHead: number,
  engineerPercentage: number = 10
): PricingEstimate {
  const totalDesignFee = sprinklerCount * designFeePerHead
  const engineerPct = engineerPercentage / 100
  const consultantPct = 1 - engineerPct
  
  return {
    designFeePerHead,
    totalDesignFee,
    engineerFeeAmount: totalDesignFee * engineerPct,
    consultantFeeAmount: totalDesignFee * consultantPct,
    engineerPercentage,
    consultantPercentage: consultantPct * 100
  }
}

