# Fire Consultancy Module

A comprehensive add-on module for managing the consultant-to-engineer pipeline for fire protection design projects.

## Overview

The Fire Consultancy module handles the complete workflow from site assessment through engineer sign-off and billing, specifically designed for fire protection consultants who work with engineers for design approval.

### Key Features

- **Job Management**: Track fire protection design jobs from site visit to completion
- **Engineer Management**: Manage engineer contacts and accreditation tracking
- **Design Request Generation**: Auto-generate PDF design requests with site metadata
- **Water Supply Estimation**: Calculate flow, tank size, and pump requirements
- **Billing Splits**: Automatic 90/10 revenue split calculation (configurable)
- **Accreditation Tracking**: Monitor ASIB/SAQCC/SABS/ECSA certificate expiry dates
- **Dashboard**: Real-time view of active jobs, pending sign-offs, and revenue

## Installation

### 1. Run Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

```sql
-- Run: supabase-fireconsult-migration.sql
```

This creates all necessary tables:
- `engineers` - Engineer contacts and split percentages
- `accreditations` - Certificate tracking
- `fire_consult_jobs` - Main job tracking
- `design_requests` - Engineer design request workflow
- `billing_splits` - Revenue split tracking
- `fire_systems` - Detailed system specifications

### 2. Import TypeScript Types

The module includes comprehensive TypeScript types in:
- `src/lib/fireconsult-types.ts` - All entity types and interfaces
- `src/lib/fireconsult.ts` - Core CRUD operations
- `src/lib/water-supply-estimator.ts` - Calculation functions
- `src/lib/design-request-pdf.ts` - PDF generation

### 3. Add UI Components

Import and use the dashboard components:

```tsx
import FireConsultDashboard from './components/FireConsultDashboard'
import AccreditationTracker from './components/AccreditationTracker'
```

## Usage

### Creating a Fire Consult Job

```typescript
import { createFireConsultJob } from './lib/fireconsult'

const job = await createFireConsultJob({
  site_name: 'Warehouse Complex',
  site_address: '123 Industrial Road, Cape Town',
  contact_person: 'John Smith',
  contact_email: 'john@example.com',
  contact_phone: '+27 21 123 4567',
  consultant_id: user.id,
  client_id: clientId,
  
  // Storage Hazard Factors
  commodity_class: 'Group A Plastics',
  storage_method: 'racked',
  storage_height_m: 8.5,
  ceiling_height_m: 12.0,
  flue_spacing_m: 1.5,
  sprinkler_strategy: 'combined',
  
  // Water Supply
  municipal_pressure_bar: 3.8,
  municipal_flow_lpm: 1200,
  
  // Pricing
  design_fee_per_head: 150, // R150 per sprinkler head
  assigned_engineer_id: engineerId
})

// System auto-calculates:
// - Design density (mm/min)
// - Design area (m²)
// - Estimated sprinkler count
// - Required flow (L/min)
// - Tank size (m³)
// - Pump requirements
// - Billing splits (90/10)
```

### Estimating Water Supply

```typescript
import { estimateWaterSupply } from './lib/water-supply-estimator'

const estimate = estimateWaterSupply({
  designDensityMmPerMin: 12.0,
  designAreaM2: 360,
  commodityClass: 'Group A Plastics',
  storageMethod: 'racked',
  municipalPressureBar: 3.8,
  municipalFlowLpm: 1200,
  durationMinutes: 90
})

// Returns:
// {
//   flowRequiredLpm: 4320,
//   tankSizeM3: 388.8,
//   durationMinutes: 90,
//   requiresTank: true,
//   requiresPump: true,
//   recommendedPumpType: 'diesel',
//   recommendedPumpCapacityLpm: 4968,
//   recommendedPumpPressureBar: 6.5
// }
```

### Generating Design Request PDF

```typescript
import { generateDesignRequestPDF } from './lib/design-request-pdf'

const job = await getFireConsultJob(jobId)
const engineer = await getEngineer(job.assigned_engineer_id)

// Opens browser print dialog
generateDesignRequestPDF({
  job,
  engineer,
  consultantName: 'Your Name',
  consultantCompany: 'Your Company'
})

// Or download as HTML
import { downloadDesignRequestHTML } from './lib/design-request-pdf'
downloadDesignRequestHTML({ job, engineer }, 'design-request.pdf')
```

### Creating Design Request

```typescript
import { createDesignRequest } from './lib/fireconsult'

const request = await createDesignRequest({
  job_id: jobId,
  engineer_id: engineerId,
  request_pdf_url: pdfUrl // Upload PDF to Supabase Storage first
})

// Job status automatically updates to 'design_request'
```

### Tracking Accreditations

```typescript
import { getAccreditationAlerts } from './lib/fireconsult'

// Get accreditations expiring in next 30 days
const alerts = await getAccreditationAlerts(30)

alerts.forEach(alert => {
  if (alert.isExpired) {
    console.log(`${alert.engineer.full_name} - ${alert.accreditation.accreditation_type} EXPIRED`)
  } else if (alert.isExpiringSoon) {
    console.log(`${alert.engineer.full_name} - ${alert.accreditation.accreditation_type} expires in ${alert.daysUntilExpiry} days`)
  }
})
```

## Workflow

### 1. Site Visit (Consultant)
- Create new fire consult job
- Enter site metadata:
  - Commodity class
  - Storage method
  - Heights
  - Water supply data
- System auto-calculates design parameters

### 2. Design Request (System)
- Generate PDF with site metadata
- Send to assigned engineer
- Job status: `design_request`

### 3. Engineer Sign-off (Third Party)
- Engineer performs hydraulic calculations
- Uploads signed fire plan
- Updates design request status to `completed`
- Job status: `design_complete`

### 4. Billing (Automated)
- System calculates billing split (90/10)
- Creates billing split record
- Job status: `billing`

### 5. Completion
- Mark payments received
- Job status: `completed`

## Pricing Model

### Design Fees (South Africa, 2025)

| Item | Rate | Example (5,500 heads) |
|------|------|---------------------|
| Design fee | R120–180/head | R660k–990k total |
| Engineer's 10% | ~R100/head × 10% | R55k–100k |
| Full installation | R1,200–1,800/head | R6.6M–9.9M |

### Revenue Split

Default: **90% consultant / 10% engineer**

Configurable per engineer in `engineers` table:
- `consultant_split_percentage` (default: 90.00)
- `engineer_split_percentage` (default: 10.00)

## Design Parameters

### Density Ranges
- **Light hazard**: 2–4 mm/min
- **Ordinary**: 5–8 mm/min
- **Storage/plastics**: 8–20 mm/min
- **Severe/ESFR**: up to 30 mm/min

### Design Areas
- **Light hazard**: ~140 m²
- **Ordinary**: ~200 m²
- **Storage**: 280–465 m² (depending on hazard)

### Sprinkler Spacing
- **Light hazard**: ~12 m² per head
- **Ordinary**: ~10 m² per head
- **High hazard**: 6–8 m² per head

## Water Supply Calculations

### Flow Calculation
```
Flow (L/min) = Density (mm/min) × Area (m²)
```

### Tank Sizing
```
Tank Size (m³) = (Flow × Duration) / 1000
```

### Duration Guidelines
- **Standard systems**: 60 minutes
- **High hazard (plastics)**: 90 minutes
- **Racked plastics**: 120 minutes

### Pump Requirements
- **Municipal pressure < 5 bar**: Pump required
- **Municipal flow < 80% of required**: Pump required
- **Large systems (>2000 L/min)**: Diesel pump recommended
- **Medium systems (500–2000 L/min)**: Electric pump
- **Small systems (<500 L/min)**: Electric or jockey pump

## Database Schema

### Key Tables

**fire_consult_jobs**
- Main job tracking
- Links to projects, clients, engineers
- Stores site assessment data
- Auto-calculates design parameters

**engineers**
- Engineer contact information
- Split percentages (90/10 default)
- Active/inactive status

**accreditations**
- ASIB, SAQCC, SABS, ECSA certificates
- Expiry date tracking
- Document URLs

**design_requests**
- Request workflow status
- Engineer response files
- Final design parameters

**billing_splits**
- Revenue split calculations
- Payment tracking
- Invoice references

**fire_systems**
- Detailed system specifications
- Compliance tracking (ASIB approval)
- Water supply details

## UI Components

### FireConsultDashboard
Main dashboard showing:
- Total/active jobs
- Pending engineer sign-offs
- Revenue tracking
- Recent jobs table

### AccreditationTracker
Accreditation monitoring:
- Expired certificates
- Expiring soon alerts (30 days)
- Engineer status overview

## API Reference

### Jobs
- `getFireConsultJobs(consultantId?, status?)` - List jobs
- `getFireConsultJob(id)` - Get job with relations
- `createFireConsultJob(job)` - Create new job
- `updateFireConsultJob(id, updates)` - Update job
- `deleteFireConsultJob(id)` - Delete job

### Engineers
- `getEngineers(activeOnly?)` - List engineers
- `getEngineer(id)` - Get engineer
- `createEngineer(engineer)` - Create engineer
- `updateEngineer(id, updates)` - Update engineer

### Accreditations
- `getAccreditations(engineerId?)` - List accreditations
- `getAccreditationAlerts(daysAhead)` - Get expiry alerts
- `createAccreditation(accreditation)` - Create accreditation

### Design Requests
- `getDesignRequests(jobId?)` - List requests
- `createDesignRequest(request)` - Create request
- `updateDesignRequest(id, updates)` - Update request

### Water Supply
- `estimateWaterSupply(inputs)` - Calculate requirements
- `estimateDesignParameters(...)` - Estimate design params

## Integration with Existing System

The Fire Consultancy module integrates seamlessly with your existing fire protection project management system:

- **Projects**: Fire consult jobs can link to main `projects` table
- **Clients**: Uses existing `clients` table
- **Users**: Uses existing `profiles` and `auth.users`
- **Documents**: Can link design requests to `document_library`

## Next Steps

1. **Run Migration**: Execute `supabase-fireconsult-migration.sql`
2. **Add Routes**: Create routes for FireConsult dashboard and accreditation tracker
3. **Add Navigation**: Add menu items to access FireConsult module
4. **Test Workflow**: Create a test job and follow the complete workflow
5. **Customize**: Adjust pricing, split percentages, and design parameters as needed

## Support

For questions or issues:
- Check the TypeScript types in `fireconsult-types.ts`
- Review the calculation functions in `water-supply-estimator.ts`
- See example usage in the dashboard components

