# Fire Consultancy Quoting Engine - Implementation Plan

## Overview

A comprehensive quoting engine that calculates accurate, profitable quotes for fire protection projects based on:
- Hazard classification
- Sprinkler count
- Target margins (25-30% net)
- Design-only vs Full installation pricing

## Business Requirements

### Pricing Tiers (South Africa, 2025)

**Design-Only:**
- Light Hazard: R120-150/head
- Ordinary Hazard: R140-170/head
- High Hazard (Plastics): R160-180/head

**Full Installation:**
- Light Hazard: R1,200-1,400/head
- Ordinary Hazard: R1,400-1,600/head
- High Hazard (Plastics): R1,600-1,800/head

### Cost Breakdown Structure

1. **Materials** (40-50% of total)
   - Sprinkler heads
   - Pipes and fittings
   - Valves and controls
   - Water supply (tank, pump)

2. **Labor** (25-35% of total)
   - Installation hours
   - Site preparation
   - Testing and commissioning

3. **Engineering** (8-12% of total)
   - Design fees
   - Engineer sign-off
   - Compliance documentation

4. **Overhead** (10-15% of total)
   - Admin
   - Insurance
   - Equipment

5. **Profit Margin** (25-30% net)
   - Target: 25-30% on total project

## Implementation Files

### 1. `src/lib/fireconsult-quotes.ts`
Core quoting engine with:
- Hazard-based pricing calculation
- Margin calculation
- Cost breakdown generation
- Quote validation

### 2. `src/lib/quote-pdf.ts`
PDF quote generation:
- Professional quote document
- Cost breakdown table
- Terms and conditions
- Validity period

### 3. `src/pages/FireConsult/QuotePage.tsx`
Quote creation UI:
- Job selection
- Pricing tier selection
- Margin adjustment
- Preview and generate

### 4. Database Schema Updates
Add `quotes` table:
- Quote number
- Job reference
- Quote type (design/full)
- Pricing breakdown (JSON)
- Status (draft/sent/accepted/rejected)
- Validity date

## Functions to Build

```typescript
// Calculate quote based on hazard and sprinkler count
calculateQuote(inputs: QuoteInputs): QuoteResult

// Get pricing tier for hazard class
getPricingTier(hazard: CommodityClass): PricingTier

// Calculate cost breakdown
calculateCostBreakdown(quote: QuoteResult): CostBreakdown

// Apply margin to costs
applyMargin(costs: CostBreakdown, targetMargin: number): PricedQuote

// Generate quote PDF
generateQuotePDF(quote: PricedQuote): PDFDocument

// Save quote to database
saveQuote(quote: PricedQuote): Promise<Quote>
```

## Next Steps

1. Build `fireconsult-quotes.ts` with core calculation logic
2. Create quote PDF template
3. Add quote UI page
4. Update database schema
5. Integrate with job workflow

