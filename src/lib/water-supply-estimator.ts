/**
 * Water Supply Estimator
 * 
 * Calculates fire protection water supply requirements including:
 * - Required flow (L/min)
 * - Tank size (m³)
 * - Pump requirements
 * 
 * Based on SANS 10252 and NFPA 13 standards
 */

import type { 
  WaterSupplyEstimate, 
  CommodityClass, 
  StorageMethod, 
  SprinklerStrategy,
  PumpType 
} from './fireconsult-types'

export interface WaterSupplyInputs {
  // Design Parameters
  designDensityMmPerMin: number // 5-30 mm/min
  designAreaM2: number // 140-465 m²
  estimatedSprinklerCount?: number
  
  // Storage Hazard Factors
  commodityClass?: CommodityClass
  storageMethod?: StorageMethod
  storageHeightM?: number
  ceilingHeightM?: number
  sprinklerStrategy?: SprinklerStrategy
  
  // Municipal Supply
  municipalPressureBar?: number // Typically 3.5-4 bar
  municipalFlowLpm?: number // Available flow from municipal supply
  
  // Duration
  durationMinutes?: number // 60-120 min typical
}

/**
 * Calculate required flow based on design density and area
 * Formula: Flow (L/min) = Density (mm/min) × Area (m²) × 0.001
 * 
 * @param densityMmPerMin Design density in mm/min
 * @param areaM2 Design area in m²
 * @returns Required flow in L/min
 */
export function calculateRequiredFlow(
  densityMmPerMin: number,
  areaM2: number
): number {
  // Convert mm/min to L/min: 1 mm/min over 1 m² = 1 L/min
  return densityMmPerMin * areaM2
}

/**
 * Calculate tank size based on flow and duration
 * Formula: Tank Size (m³) = (Flow × Duration) / 1000
 * 
 * @param flowLpm Required flow in L/min
 * @param durationMinutes Duration in minutes (default 60)
 * @returns Tank size in m³
 */
export function calculateTankSize(
  flowLpm: number,
  durationMinutes: number = 60
): number {
  // Convert L/min to m³: (L/min × min) / 1000 = m³
  return (flowLpm * durationMinutes) / 1000
}

/**
 * Determine if tank is required
 * Municipal supply is typically inadequate for fire protection
 * 
 * @param municipalFlowLpm Available municipal flow
 * @param requiredFlowLpm Required flow for design
 * @returns true if tank is required
 */
export function requiresTank(
  municipalFlowLpm?: number,
  requiredFlowLpm?: number
): boolean {
  if (!requiredFlowLpm) return true // Default to requiring tank
  
  // Municipal supply is typically 3.5-4 bar, limited flow
  // Most fire protection systems require more than municipal can provide
  if (!municipalFlowLpm) return true
  
  // If municipal flow is less than 80% of required, need tank
  return municipalFlowLpm < (requiredFlowLpm * 0.8)
}

/**
 * Determine if pump is required
 * Pumps are needed when pressure/flow from municipal is insufficient
 * 
 * @param municipalPressureBar Municipal pressure
 * @param requiredFlowLpm Required flow
 * @param municipalFlowLpm Available municipal flow
 * @returns true if pump is required
 */
export function requiresPump(
  municipalPressureBar?: number,
  requiredFlowLpm?: number,
  municipalFlowLpm?: number
): boolean {
  if (!requiredFlowLpm) return true // Default to requiring pump
  
  // Typical fire protection requires 5-7 bar operating pressure
  const minRequiredPressure = 5.0 // bar
  
  // Check pressure
  if (!municipalPressureBar || municipalPressureBar < minRequiredPressure) {
    return true
  }
  
  // Check flow
  if (!municipalFlowLpm || municipalFlowLpm < (requiredFlowLpm * 0.8)) {
    return true
  }
  
  return false
}

/**
 * Recommend pump type based on system requirements
 * 
 * @param flowLpm Required flow
 * @param pressureBar Required pressure
 * @returns Recommended pump type
 */
export function recommendPumpType(
  flowLpm: number,
  _pressureBar: number
): PumpType {
  // For large systems (>2000 L/min), diesel is more reliable
  if (flowLpm > 2000) {
    return 'diesel'
  }
  
  // For medium systems, electric is common
  if (flowLpm > 500) {
    return 'electric'
  }
  
  // Small systems might use jockey pump only
  return 'electric'
}

/**
 * Estimate pump capacity based on required flow
 * Pump should provide 110-120% of design flow for safety margin
 * 
 * @param requiredFlowLpm Required flow
 * @returns Recommended pump capacity in L/min
 */
export function estimatePumpCapacity(requiredFlowLpm: number): number {
  // Add 15% safety margin
  return requiredFlowLpm * 1.15
}

/**
 * Estimate pump pressure based on system requirements
 * Typical fire protection systems require 5-7 bar operating pressure
 * 
 * @param municipalPressureBar Available municipal pressure
 * @param designAreaM2 Design area (larger areas may need more pressure)
 * @returns Recommended pump pressure in bar
 */
export function estimatePumpPressure(
  municipalPressureBar?: number,
  designAreaM2?: number
): number {
  // Base pressure requirement
  let requiredPressure = 5.5 // bar
  
  // Larger design areas may need more pressure
  if (designAreaM2 && designAreaM2 > 300) {
    requiredPressure = 6.5
  }
  
  // If municipal pressure is close, we might need less boost
  if (municipalPressureBar && municipalPressureBar >= 4.0) {
    // Only need to boost by 1-2 bar
    return Math.max(requiredPressure, municipalPressureBar + 1.5)
  }
  
  return requiredPressure
}

/**
 * Estimate duration based on hazard classification
 * 
 * @param commodityClass Commodity class
 * @param storageMethod Storage method
 * @returns Recommended duration in minutes
 */
export function estimateDuration(
  commodityClass?: CommodityClass,
  storageMethod?: StorageMethod
): number {
  // Default duration
  let duration = 60 // minutes
  
  // High hazard (plastics, racked storage) needs longer duration
  if (commodityClass?.includes('Plastics')) {
    duration = 90
  }
  
  if (storageMethod === 'racked' && commodityClass?.includes('Plastics')) {
    duration = 120 // Maximum duration for high hazard
  }
  
  // ESFR systems typically need 60 minutes
  // Standard systems: 60-90 minutes
  
  return duration
}

/**
 * Main function: Estimate complete water supply requirements
 * 
 * @param inputs Water supply calculation inputs
 * @returns Complete water supply estimate
 */
export function estimateWaterSupply(
  inputs: WaterSupplyInputs
): WaterSupplyEstimate {
  const {
    designDensityMmPerMin,
    designAreaM2,
    commodityClass,
    storageMethod,
    municipalPressureBar,
    municipalFlowLpm,
    durationMinutes
  } = inputs
  
  // Calculate required flow
  const flowRequiredLpm = calculateRequiredFlow(
    designDensityMmPerMin,
    designAreaM2
  )
  
  // Estimate duration if not provided
  const duration = durationMinutes || estimateDuration(commodityClass, storageMethod)
  
  // Calculate tank size
  const tankSizeM3 = calculateTankSize(flowRequiredLpm, duration)
  
  // Determine if tank is required
  const needsTank = requiresTank(municipalFlowLpm, flowRequiredLpm)
  
  // Determine if pump is required
  const needsPump = requiresPump(
    municipalPressureBar,
    flowRequiredLpm,
    municipalFlowLpm
  )
  
  // Recommend pump type
  const recommendedPumpType = needsPump
    ? recommendPumpType(flowRequiredLpm, estimatePumpPressure(municipalPressureBar, designAreaM2))
    : 'none'
  
  // Estimate pump capacity
  const recommendedPumpCapacityLpm = needsPump
    ? estimatePumpCapacity(flowRequiredLpm)
    : 0
  
  // Estimate pump pressure
  const recommendedPumpPressureBar = needsPump
    ? estimatePumpPressure(municipalPressureBar, designAreaM2)
    : 0
  
  return {
    flowRequiredLpm: Math.round(flowRequiredLpm),
    tankSizeM3: Math.round(tankSizeM3 * 10) / 10, // Round to 1 decimal
    durationMinutes: duration,
    requiresTank: needsTank,
    requiresPump: needsPump,
    recommendedPumpType: recommendedPumpType,
    recommendedPumpCapacityLpm: Math.round(recommendedPumpCapacityLpm),
    recommendedPumpPressureBar: Math.round(recommendedPumpPressureBar * 10) / 10
  }
}

/**
 * Estimate design parameters based on hazard classification
 * Provides baseline assumptions that engineer may adjust
 * 
 * @param commodityClass Commodity class
 * @param storageMethod Storage method
 * @param storageHeightM Storage height
 * @param ceilingHeightM Ceiling height
 * @returns Design parameter estimates
 */
export function estimateDesignParameters(
  commodityClass?: CommodityClass,
  storageMethod?: StorageMethod,
  storageHeightM?: number,
  _ceilingHeightM?: number
): {
  densityMmPerMin: number
  designAreaM2: number
  sprinklerSpacingM2: number
} {
  // Default values (light hazard)
  let density = 4.0 // mm/min
  let designArea = 140 // m²
  let spacing = 12.0 // m² per head
  
  // Adjust based on commodity class
  if (commodityClass === 'Class II' || commodityClass === 'Class III') {
    density = 6.5
    designArea = 200
    spacing = 10.0
  } else if (commodityClass === 'Class IV') {
    density = 8.0
    designArea = 280
    spacing = 9.0
  } else if (commodityClass?.includes('Plastics')) {
    // Group A plastics (high heat)
    if (commodityClass === 'Group A Plastics') {
      density = 12.0
      designArea = 360
      spacing = 8.0
    } else if (commodityClass === 'Group B Plastics') {
      density = 16.0
      designArea = 400
      spacing = 7.0
    } else {
      // Group C
      density = 20.0
      designArea = 465
      spacing = 6.0
    }
  }
  
  // Adjust for storage method
  if (storageMethod === 'racked') {
    // Racked storage may need higher density
    density = Math.max(density, 8.0)
    designArea = Math.max(designArea, 280)
  }
  
  // Adjust for height
  if (storageHeightM && storageHeightM > 6) {
    density = density * 1.2 // Increase density for high storage
  }
  
  // ESFR systems have specific requirements
  // (Would need more specific logic for ESFR)
  
  return {
    densityMmPerMin: Math.round(density * 10) / 10,
    designAreaM2: Math.round(designArea),
    sprinklerSpacingM2: Math.round(spacing * 10) / 10
  }
}

