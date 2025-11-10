/**
 * Fire Consultancy Quoting Engine
 * Based on ASIB Rule Book 2024 parameters and SA market rates.
 */

// =========================================
// 1. Types and Interfaces
// =========================================

export const HazardCategory = {
  ORDINARY_HAZARD: "OH",     // Offices, hotels (ASIB Section 1001)
  HIGH_HAZARD_1: "HH1",      // Low combustible storage
  HIGH_HAZARD_2: "HH2",      // Medium combustible storage
  HIGH_HAZARD_3: "HH3",      // High combustible storage
  HIGH_HAZARD_4: "HH4",      // Special hazards (Aerosols, Tyres - ASIB 1058, 1102)
} as const

export type HazardCategory = typeof HazardCategory[keyof typeof HazardCategory]

export interface QuoteInput {
  sprinklerHeadCount: number
  hazardCategory: HazardCategory
  includePumpsAndTanks: boolean
  customMarginPercent?: number // Optional override for specific clients
}

export interface CostBreakdown {
  engineeringCost: number    // What you pay the third-party engineer
  fabricationCost: number    // Estimated cost for pipe cutting/threading
  installationLabour: number // Estimated cost for on-site subbie labour
  hardwareCost: number       // Estimated cost for heads, valves, pipe
  waterSupplyCost: number    // Estimated pumps & tanks
  subtotalCost: number       // Total Cost to Company (excluding your markup)
}

export interface QuoteResult {
  breakdown: CostBreakdown
  grossProfit: number
  grossMarginPercent: number
  finalQuoteExVat: number
  vatAmount: number
  finalQuoteIncVat: number
}

// =========================================
// 2. Constants & Baseline Costs (ZAR)
// =========================================

// Baseline costs per sprinkler point (estimated from Quinten's audio)
const BASE_ENGINEERING_COST_PER_HEAD = 200
const BASE_FABRICATION_COST_PER_HEAD = 100
const BASE_INSTALL_LABOUR_PER_HEAD = 150
const BASE_HARDWARE_COST_PER_HEAD = 800 // Blended avg for pipe + heads

// ASIB Hazard Complexity Multipliers
// High hazard = more complex calcs, bigger pipes, more risk.
const HAZARD_MULTIPLIERS: Record<HazardCategory, number> = {
  [HazardCategory.ORDINARY_HAZARD]: 1.0,
  [HazardCategory.HIGH_HAZARD_1]: 1.15,
  [HazardCategory.HIGH_HAZARD_2]: 1.25,
  [HazardCategory.HIGH_HAZARD_3]: 1.4,
  [HazardCategory.HIGH_HAZARD_4]: 1.75, // Significant jump for special risks
}

// Water Supply rough estimates (Pumps + Tanks) based on hazard
const WATER_SUPPLY_ESTIMATES: Record<HazardCategory, number> = {
  [HazardCategory.ORDINARY_HAZARD]: 450000, // e.g., smaller electrical pump + tank
  [HazardCategory.HIGH_HAZARD_1]: 850000,
  [HazardCategory.HIGH_HAZARD_2]: 1000000,
  [HazardCategory.HIGH_HAZARD_3]: 1200000,
  [HazardCategory.HIGH_HAZARD_4]: 1800000, // e.g., Full diesel/electric sets + massive tanks
}

// Target Margins
const DEFAULT_DESIGN_MARGIN = 0.50   // 50% Gross Margin for pure consultancy (Quinten's "double it")
const DEFAULT_INSTALL_MARGIN = 0.25  // 25% Gross Margin for managing full contracts

const VAT_RATE = 0.15

// =========================================
// 3. Core Calculation Functions
// =========================================

/**
 * Calculates a "Design & Consulting Only" quote.
 * Used when the client only wants ASIB-approved plans for tender.
 */
export function calculateDesignQuote(input: QuoteInput): QuoteResult {
  const complexity = HAZARD_MULTIPLIERS[input.hazardCategory]
  const margin = input.customMarginPercent ? (input.customMarginPercent / 100) : DEFAULT_DESIGN_MARGIN
  
  // Calculate costs
  const engineeringCost = input.sprinklerHeadCount * BASE_ENGINEERING_COST_PER_HEAD * complexity
  
  // For design-only, other installation costs are zero
  const breakdown: CostBreakdown = {
    engineeringCost,
    fabricationCost: 0,
    installationLabour: 0,
    hardwareCost: 0,
    waterSupplyCost: 0,
    subtotalCost: engineeringCost
  }

  // Calculate final price based on target gross margin
  // Formula: Revenue = Cost / (1 - Margin%)
  const finalQuoteExVat = breakdown.subtotalCost / (1 - margin)
  const grossProfit = finalQuoteExVat - breakdown.subtotalCost
  const vatAmount = finalQuoteExVat * VAT_RATE

  return {
    breakdown,
    grossProfit,
    grossMarginPercent: (grossProfit / finalQuoteExVat) * 100,
    finalQuoteExVat,
    vatAmount,
    finalQuoteIncVat: finalQuoteExVat + vatAmount
  }
}

/**
 * Calculates a "Full Turnkey Installation" quote.
 * Used when managing the entire project (design + sub-contractors).
 */
export function calculateFullInstallQuote(input: QuoteInput): QuoteResult {
  const complexity = HAZARD_MULTIPLIERS[input.hazardCategory]
  const margin = input.customMarginPercent ? (input.customMarginPercent / 100) : DEFAULT_INSTALL_MARGIN
  
  // 1. Calculate base costs per head, adjusted for hazard complexity
  const engCost = input.sprinklerHeadCount * BASE_ENGINEERING_COST_PER_HEAD * complexity
  const fabCost = input.sprinklerHeadCount * BASE_FABRICATION_COST_PER_HEAD * complexity
  // Labour less affected by hazard, more by pure volume, but let's add slight complexity bump
  const labourCost = input.sprinklerHeadCount * BASE_INSTALL_LABOUR_PER_HEAD * (1 + (complexity - 1) * 0.5)
  // Hardware costs rise significantly with hazard (bigger pipes, diverse heads)
  const hardwareCost = input.sprinklerHeadCount * BASE_HARDWARE_COST_PER_HEAD * complexity
  
  // 2. Determine water supply costs
  const waterSupplyCost = input.includePumpsAndTanks 
    ? WATER_SUPPLY_ESTIMATES[input.hazardCategory] 
    : 0

  const breakdown: CostBreakdown = {
    engineeringCost: engCost,
    fabricationCost: fabCost,
    installationLabour: labourCost,
    hardwareCost: hardwareCost,
    waterSupplyCost: waterSupplyCost,
    subtotalCost: engCost + fabCost + labourCost + hardwareCost + waterSupplyCost
  }

  // 3. Calculate final price
  const finalQuoteExVat = breakdown.subtotalCost / (1 - margin)
  const grossProfit = finalQuoteExVat - breakdown.subtotalCost
  const vatAmount = finalQuoteExVat * VAT_RATE

  return {
    breakdown,
    grossProfit,
    grossMarginPercent: (grossProfit / finalQuoteExVat) * 100,
    finalQuoteExVat,
    vatAmount,
    finalQuoteIncVat: finalQuoteExVat + vatAmount
  }
}

// =========================================
// 4. Integration Helpers
// =========================================

/**
 * Map FireConsultJob commodity class to HazardCategory
 */
export function mapCommodityToHazard(commodityClass: string | null): HazardCategory {
  if (!commodityClass) return HazardCategory.ORDINARY_HAZARD
  
  const mapping: Record<string, HazardCategory> = {
    'Class I': HazardCategory.ORDINARY_HAZARD,
    'Class II': HazardCategory.HIGH_HAZARD_1,
    'Class III': HazardCategory.HIGH_HAZARD_2,
    'Class IV': HazardCategory.HIGH_HAZARD_3,
    'Group A Plastics': HazardCategory.HIGH_HAZARD_3,
    'Group B Plastics': HazardCategory.HIGH_HAZARD_4,
    'Group C Plastics': HazardCategory.HIGH_HAZARD_4,
  }
  
  return mapping[commodityClass] || HazardCategory.ORDINARY_HAZARD
}

/**
 * Generate quote from FireConsultJob
 */
export function generateQuoteFromJob(
  job: {
    estimated_sprinkler_count: number | null
    commodity_class: string | null
    requires_tank: boolean
    requires_pump: boolean
  },
  quoteType: 'design_only' | 'full_installation',
  customMarginPercent?: number
): QuoteResult {
  const sprinklerCount = job.estimated_sprinkler_count || 0
  if (sprinklerCount === 0) {
    throw new Error('Cannot generate quote: Sprinkler count is required')
  }
  
  const hazardCategory = mapCommodityToHazard(job.commodity_class)
  const includePumpsAndTanks = job.requires_tank || job.requires_pump
  
  const input: QuoteInput = {
    sprinklerHeadCount: sprinklerCount,
    hazardCategory,
    includePumpsAndTanks,
    customMarginPercent
  }
  
  return quoteType === 'design_only'
    ? calculateDesignQuote(input)
    : calculateFullInstallQuote(input)
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Generate quote number
 */
export function generateQuoteNumber(jobNumber: string): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `QT-${year}${month}-${random}`
}
