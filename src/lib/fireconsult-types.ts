/**
 * Fire Consultancy Module - TypeScript Types
 * 
 * Type definitions for the FireConsult add-on module
 */

// ============================================
// ENUMS
// ============================================

export type CommodityClass = 
  | 'Class I' 
  | 'Class II' 
  | 'Class III' 
  | 'Class IV' 
  | 'Group A Plastics' 
  | 'Group B Plastics' 
  | 'Group C Plastics'

export type StorageMethod = 
  | 'floor_stack' 
  | 'palletized' 
  | 'racked' 
  | 'shelving' 
  | 'mixed'

export type SprinklerStrategy = 
  | 'ceiling_only' 
  | 'in_rack' 
  | 'combined' 
  | 'esfr' 
  | 'cmsa' 
  | 'cmda'

export type FireConsultJobStatus = 
  | 'site_visit'           // Initial site assessment
  | 'data_collection'      // Gathering site metadata
  | 'design_request'       // Design request sent to engineer
  | 'engineer_review'      // Engineer reviewing/calculating
  | 'design_complete'      // Engineer signed off
  | 'billing'              // Invoicing phase
  | 'completed'            // Job fully complete
  | 'cancelled'            // Job cancelled

export type DesignRequestStatus = 
  | 'pending'           // Request sent, awaiting engineer
  | 'acknowledged'      // Engineer acknowledged receipt
  | 'in_progress'       // Engineer working on calculations
  | 'review_required'   // Engineer needs clarification
  | 'completed'         // Design complete, signed off
  | 'rejected'          // Engineer rejected (with reason)

export type AccreditationType = 
  | 'ASIB' 
  | 'SAQCC' 
  | 'SABS' 
  | 'ECSA' 
  | 'OTHER'

export type SystemType = 
  | 'sprinkler_wet' 
  | 'sprinkler_dry' 
  | 'sprinkler_preaction' 
  | 'sprinkler_deluge' 
  | 'hydrant' 
  | 'hose_reel' 
  | 'combined'

export type PumpType = 
  | 'diesel' 
  | 'electric' 
  | 'jockey' 
  | 'none'

// ============================================
// CORE ENTITIES
// ============================================

export interface Engineer {
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  registration_number: string | null
  hourly_rate: number | null
  consultant_split_percentage: number
  engineer_split_percentage: number
  is_active: boolean
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Accreditation {
  id: string
  engineer_id: string
  accreditation_type: AccreditationType
  certificate_number: string
  issued_date: string
  expiry_date: string
  issuing_authority: string | null
  document_url: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FireConsultJob {
  id: string
  project_id: string | null
  client_id: string | null
  job_number: string
  site_name: string
  site_address: string | null
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  
  // Status
  status: FireConsultJobStatus
  
  // Consultant & Engineer
  consultant_id: string
  assigned_engineer_id: string | null
  
  // Site Assessment
  site_visit_date: string | null
  floor_plan_url: string | null
  site_photos_urls: string[] | null
  
  // Storage Hazard Factors
  commodity_class: CommodityClass | null
  storage_method: StorageMethod | null
  storage_height_m: number | null
  ceiling_height_m: number | null
  flue_spacing_m: number | null
  sprinkler_strategy: SprinklerStrategy | null
  
  // Design Parameters
  design_density_mm_per_min: number | null
  design_area_m2: number | null
  estimated_sprinkler_count: number | null
  sprinkler_spacing_m2: number | null
  
  // Water Supply
  municipal_pressure_bar: number | null
  municipal_flow_lpm: number | null
  requires_tank: boolean
  requires_pump: boolean
  estimated_flow_required_lpm: number | null
  estimated_tank_size_m3: number | null
  estimated_duration_minutes: number | null
  pump_type: PumpType | null
  
  // Pricing
  design_fee_per_head: number | null
  total_design_fee: number | null
  engineer_fee_amount: number | null
  consultant_fee_amount: number | null
  
  // Dates
  design_request_sent_at: string | null
  design_completed_at: string | null
  due_date: string | null
  
  // Notes
  site_notes: string | null
  internal_notes: string | null
  
  created_at: string
  updated_at: string
}

export interface DesignRequest {
  id: string
  job_id: string
  engineer_id: string
  
  // Status
  status: DesignRequestStatus
  
  // Request Details
  request_pdf_url: string | null
  request_sent_at: string | null
  acknowledged_at: string | null
  completed_at: string | null
  
  // Engineer Response
  signed_fire_plan_url: string | null
  hydraulic_calc_file_url: string | null
  engineer_notes: string | null
  rejection_reason: string | null
  
  // Final Design Parameters
  final_density_mm_per_min: number | null
  final_design_area_m2: number | null
  final_sprinkler_count: number | null
  final_flow_required_lpm: number | null
  final_tank_size_m3: number | null
  final_pump_specs: string | null
  
  created_at: string
  updated_at: string
}

export interface BillingSplit {
  id: string
  job_id: string
  design_request_id: string | null
  
  // Financial Details
  total_design_fee: number
  consultant_percentage: number
  engineer_percentage: number
  consultant_amount: number
  engineer_amount: number
  
  // Payment Status
  consultant_paid: boolean
  engineer_paid: boolean
  consultant_paid_at: string | null
  engineer_paid_at: string | null
  
  // Invoice References
  consultant_invoice_number: string | null
  engineer_invoice_number: string | null
  
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FireSystem {
  id: string
  job_id: string
  
  // System Type
  system_type: SystemType
  
  // System Specifications
  total_sprinkler_heads: number | null
  total_hydrant_outlets: number | null
  total_hose_reel_outlets: number | null
  pipe_material: string | null
  pipe_diameter_mm: string | null
  
  // Water Supply
  tank_capacity_m3: number | null
  pump_capacity_lpm: number | null
  pump_pressure_bar: number | null
  pump_type: string | null
  jockey_pump_capacity_lpm: number | null
  
  // Design Parameters
  design_density_mm_per_min: number | null
  design_area_m2: number | null
  operating_pressure_bar: number | null
  
  // Compliance
  asib_approval_number: string | null
  asib_approval_date: string | null
  compliance_standard: string | null
  
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// INPUT/INSERT TYPES
// ============================================

export type EngineerInsert = Omit<Engineer, 'id' | 'created_at' | 'updated_at'>
export type EngineerUpdate = Partial<Omit<Engineer, 'id' | 'created_by' | 'created_at' | 'updated_at'>>

export type AccreditationInsert = Omit<Accreditation, 'id' | 'created_at' | 'updated_at'>
export type AccreditationUpdate = Partial<Omit<Accreditation, 'id' | 'engineer_id' | 'created_at' | 'updated_at'>>

export type FireConsultJobInsert = Omit<FireConsultJob, 'id' | 'job_number' | 'created_at' | 'updated_at' | 'design_request_sent_at' | 'design_completed_at'>
export type FireConsultJobUpdate = Partial<Omit<FireConsultJob, 'id' | 'job_number' | 'consultant_id' | 'created_at' | 'updated_at'>>

export type DesignRequestInsert = Omit<DesignRequest, 'id' | 'created_at' | 'updated_at' | 'request_sent_at' | 'acknowledged_at' | 'completed_at'>
export type DesignRequestUpdate = Partial<Omit<DesignRequest, 'id' | 'job_id' | 'engineer_id' | 'created_at' | 'updated_at'>>

export type FireSystemInsert = Omit<FireSystem, 'id' | 'created_at' | 'updated_at'>
export type FireSystemUpdate = Partial<Omit<FireSystem, 'id' | 'job_id' | 'created_at' | 'updated_at'>>

// ============================================
// CALCULATION TYPES
// ============================================

export interface WaterSupplyEstimate {
  flowRequiredLpm: number
  tankSizeM3: number
  durationMinutes: number
  requiresTank: boolean
  requiresPump: boolean
  recommendedPumpType: PumpType
  recommendedPumpCapacityLpm: number
  recommendedPumpPressureBar: number
}

export interface DesignParameterEstimate {
  densityMmPerMin: number
  designAreaM2: number
  estimatedSprinklerCount: number
  sprinklerSpacingM2: number
}

export interface PricingEstimate {
  designFeePerHead: number
  totalDesignFee: number
  engineerFeeAmount: number
  consultantFeeAmount: number
  engineerPercentage: number
  consultantPercentage: number
}

export interface Quote {
  id: string
  job_id: string
  quote_number: string
  quote_type: 'design_only' | 'full_installation'
  sprinkler_count: number
  hazard_category: string
  custom_margin_percent: number | null
  cost_breakdown: {
    engineeringCost: number
    fabricationCost: number
    installationLabour: number
    hardwareCost: number
    waterSupplyCost: number
    subtotalCost: number
  }
  subtotal_cost: number
  gross_profit: number
  gross_margin_percent: number
  quote_ex_vat: number
  vat_amount: number
  quote_inc_vat: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
  valid_until: string
  pdf_url: string | null
  notes: string | null
  rejection_reason: string | null
  accepted_at: string | null
  rejected_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type QuoteInsert = Omit<Quote, 'id' | 'created_at' | 'updated_at' | 'quote_number'>
export type QuoteUpdate = Partial<Omit<Quote, 'id' | 'job_id' | 'created_by' | 'created_at' | 'updated_at' | 'quote_number'>>

// ============================================
// DASHBOARD TYPES
// ============================================

export interface FireConsultDashboardStats {
  totalJobs: number
  activeJobs: number
  pendingEngineerSignOff: number
  completedThisMonth: number
  totalRevenue: number
  pendingRevenue: number
}

export interface JobWithRelations extends FireConsultJob {
  engineer?: Engineer | null
  design_request?: DesignRequest | null
  billing_split?: BillingSplit | null
  client?: {
    id: string
    name: string
    contact_person: string | null
  } | null
}

export interface AccreditationAlert {
  accreditation: Accreditation
  engineer: Engineer
  daysUntilExpiry: number
  isExpired: boolean
  isExpiringSoon: boolean // Within 30 days
}

