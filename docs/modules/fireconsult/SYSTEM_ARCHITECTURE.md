# FireConsult System Architecture & Workflow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Dashboard   │  │  Create Job  │  │  Job Detail  │  │  Engineers  │ │
│  │    Page      │  │     Page     │  │     Page     │  │    Page     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │         │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                         STATE MANAGEMENT LAYER                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              FireConsultContext (Global State)                   │   │
│  │  - jobs: FireConsultJob[]                                        │   │
│  │  - engineers: Engineer[]                                         │   │
│  │  - stats: DashboardStats                                         │   │
│  │  - loading, error states                                         │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                       │
└──────────────────────────────────┼───────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────┐
│                          CUSTOM HOOKS LAYER                               │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   useJob     │  │ useEngineer  │  │ useDesign    │  │  useBilling │ │
│  │   (jobId)    │  │ (engineerId) │  │  Requests    │  │   Splits    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │         │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                          BUSINESS LOGIC LAYER                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  fireconsult.ts - CRUD Operations                              │    │
│  │  - createJob, updateJob, deleteJob                             │    │
│  │  - getJobs, getJobById, getJobsByEngineer                      │    │
│  │  - createEngineer, updateEngineer                              │    │
│  │  - getDashboardStats                                           │    │
│  └──────────────────────────────┬─────────────────────────────────┘    │
│                                  │                                       │
│  ┌──────────────────────────────▼─────────────────────────────────┐    │
│  │  water-supply-estimator.ts - Calculations                      │    │
│  │  - planSprinklerWater(area, density, duration)                 │    │
│  │  - estimateDesignParameters(storage, commodity)                │    │
│  │  - Calculate: flow, tank size, pump requirements               │    │
│  └──────────────────────────────┬─────────────────────────────────┘    │
│                                  │                                       │
│  ┌──────────────────────────────▼─────────────────────────────────┐    │
│  │  design-request-pdf.ts - PDF Generation                        │    │
│  │  - generateDesignRequestPDF(job)                               │    │
│  │  - Create professional document with calculations              │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
                                   │ Supabase Client
                                   │
┌──────────────────────────────────▼───────────────────────────────────────┐
│                          DATABASE LAYER (PostgreSQL)                      │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  engineers                                                       │    │
│  │  - id, name, email, phone, company, fee_percentages            │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                  │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │  accreditations                                                  │    │
│  │  - id, engineer_id, type, certificate_number, expiry_date      │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                  │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │  fire_consult_jobs                                              │    │
│  │  - id, job_number, site_name, status, engineer_id              │    │
│  │  - floor_area, commodity_class, storage details                │    │
│  │  - design parameters, calculations                             │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                  │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │  fire_systems                                                   │    │
│  │  - id, job_id, system_type, code_reference                     │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                  │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │  design_requests                                                │    │
│  │  - id, job_id, version, document_path, signed_at               │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                  │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │  billing_splits                                                 │    │
│  │  - id, job_id, total_fee, consultant_amount, engineer_amount   │    │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  Features: RLS Policies, Triggers, Indexes, Foreign Keys                 │
└───────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Creating a New Job

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Fills form with site details
     │    (floor area, commodity, heights)
     ▼
┌─────────────────┐
│  CreateJobPage  │
└────┬────────────┘
     │ 2. Form submit
     │    (with FormData)
     ▼
┌───────────────────┐
│ FireConsultContext│
└────┬──────────────┘
     │ 3. Calls createJob(input)
     │
     ▼
┌──────────────────────┐
│ fireconsult.ts       │
│ createJob()          │
└────┬─────────────────┘
     │ 4a. Insert into Supabase
     │ 4b. Calculate design params
     │ 4c. Update with calculations
     ▼
┌──────────────────────┐
│  Supabase Database   │
│  fire_consult_jobs   │
└────┬─────────────────┘
     │ 5. Trigger: Generate job_number
     │    (FC-2025-0001)
     │
     │ 6. Return created job
     ▼
┌───────────────────┐
│ FireConsultContext│
│ refreshJobs()     │
└────┬──────────────┘
     │ 7. Update state
     │
     ▼
┌─────────────────┐
│  Dashboard UI   │
│  Shows new job  │
└─────────────────┘
```

### Generating PDF Design Request

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Clicks "Generate PDF"
     │
     ▼
┌─────────────────┐
│  JobDetailPage  │
└────┬────────────┘
     │ 2. Calls generateDesignRequestPDF(job)
     │
     ▼
┌──────────────────────────┐
│ design-request-pdf.ts    │
│ generateDesignRequestPDF │
└────┬─────────────────────┘
     │ 3a. Create HTML template
     │ 3b. Populate with job data
     │ 3c. Include calculations
     │
     ▼
┌──────────────────┐
│  Browser Print   │
│     Dialog       │
└────┬─────────────┘
     │ 4. User saves as PDF
     │
     ▼
┌─────────────────┐
│  PDF Document   │
│  Design Request │
└─────────────────┘
```

## User Workflow Sequence

### Complete Job Lifecycle

```
START: Client needs fire protection system
│
├─ PHASE 1: SITE VISIT (Consultant)
│  ├─ Measure floor area
│  ├─ Identify commodity type
│  ├─ Note storage method
│  ├─ Record ceiling/storage heights
│  └─ Take photos/notes
│
├─ PHASE 2: JOB CREATION (System)
│  ├─ Enter site details
│  ├─ Auto-calculate:
│  │  ├─ Design density (mm/min)
│  │  ├─ Design area (m²)
│  │  ├─ Sprinkler count
│  │  └─ Water requirements
│  └─ Save job (FC-2025-0001)
│
├─ PHASE 3: DESIGN REQUEST (System)
│  ├─ Generate PDF with:
│  │  ├─ Site metadata
│  │  ├─ Design parameters
│  │  ├─ Water supply needs
│  │  └─ Compliance references
│  └─ Email to engineer
│
├─ PHASE 4: ENGINEERING (Engineer)
│  ├─ Receive design request
│  ├─ Run hydraulic calculations
│  ├─ Create detailed drawings
│  ├─ Sign off design
│  └─ Upload final documents
│
├─ PHASE 5: COMPLETION (System)
│  ├─ Upload signed design
│  ├─ Change status to "Complete"
│  ├─ Calculate billing:
│  │  ├─ Total fee: R12,000
│  │  ├─ Consultant (90%): R10,800
│  │  └─ Engineer (10%): R1,200
│  └─ Generate invoice
│
END: Project documented and billed
```

## Component Hierarchy

```
App.tsx
│
├─ FireConsultProvider (Context)
│  │
│  └─ Routes
│     │
│     ├─ /fireconsult → DashboardPage
│     │  │
│     │  ├─ AccreditationTracker
│     │  │  └─ Shows expiring accreditations
│     │  │
│     │  └─ FireConsultDashboard
│     │     ├─ Stats cards (Active, Pending, Complete)
│     │     └─ Jobs table (sortable, filterable)
│     │
│     ├─ /fireconsult/jobs/new → CreateJobPage
│     │  │
│     │  └─ JobForm
│     │     ├─ Basic info section
│     │     ├─ Storage details section
│     │     ├─ Design parameters section
│     │     └─ Auto-calculation display
│     │
│     ├─ /fireconsult/jobs/:id → JobDetailPage
│     │  │
│     │  └─ Tabbed interface
│     │     ├─ Details tab
│     │     │  ├─ Basic info
│     │     │  ├─ Storage details
│     │     │  ├─ Design parameters
│     │     │  └─ Water supply calc
│     │     │
│     │     ├─ Systems tab
│     │     │  └─ Fire systems list
│     │     │
│     │     ├─ Design tab
│     │     │  └─ Design requests list
│     │     │
│     │     └─ Billing tab
│     │        └─ Billing splits
│     │
│     └─ /fireconsult/engineers → EngineersPage
│        │
│        ├─ Engineers list
│        └─ Engineer form (modal)
│           ├─ Basic info
│           └─ Fee split percentages
```

## Database Relationships

```
engineers (1)
    │
    ├─── (1:N) accreditations
    │           └─ Track ASIB, SAQCC, SABS, ECSA
    │
    └─── (1:N) fire_consult_jobs (N)
                │
                ├─── (1:N) fire_systems
                │           └─ Sprinkler, Detection, Gas, etc.
                │
                ├─── (1:N) design_requests
                │           └─ Version history, signed docs
                │
                └─── (1:N) billing_splits
                            └─ Fee calculations
```

## State Management Flow

```
User Action → Component Event Handler → Context Method
                                            │
                                            ├─ Update local state (optimistic)
                                            │
                                            ├─ Call library function
                                            │  └─ Supabase operation
                                            │
                                            ├─ Handle success/error
                                            │
                                            └─ Refresh related data
                                               └─ UI updates automatically
```

## Calculation Flow

### Design Parameters Calculation

```
Input:
├─ floor_area_m2: 1000
├─ storage_height_m: 6
├─ ceiling_height_m: 8
├─ commodity_class: "Group A Plastics"
└─ storage_method: "palletized"

Calculate:
├─ Hazard level → HIGH (>5m storage + plastics)
├─ Design density → 12.5 mm/min
├─ Design area → 260 m²
├─ Sprinkler spacing → 10 m² per head
└─ Sprinkler count → floor_area / spacing = 100 heads

Water Supply:
├─ Flow required → density × design_area = 3,250 L/min
├─ Duration → 90 min (default)
├─ Tank volume → flow × duration / 1000 = 293 m³
└─ Pump required → YES (municipal insufficient)

Financial:
├─ Design fee → sprinkler_count × R120 = R12,000
├─ Consultant share → fee × 90% = R10,800
└─ Engineer share → fee × 10% = R1,200
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Row Level Security (RLS)        │
├─────────────────────────────────────────┤
│                                         │
│  Authenticated Users:                   │
│  ├─ Read own jobs                       │
│  ├─ Create jobs                         │
│  └─ Update own jobs                     │
│                                         │
│  Engineers:                             │
│  ├─ Read assigned jobs                  │
│  └─ Update design status                │
│                                         │
│  Admins:                                │
│  ├─ Full access to all tables           │
│  └─ Manage engineers/accreditations     │
│                                         │
└─────────────────────────────────────────┘
```

## Performance Optimizations

```
Frontend:
├─ React Context (minimize re-renders)
├─ Custom hooks (data fetching)
├─ Debounced search (300ms)
└─ Pagination (50 items per page)

Backend:
├─ Database indexes on:
│  ├─ job_number (for search)
│  ├─ status (for filtering)
│  ├─ engineer_id (for joins)
│  └─ created_at (for sorting)
│
├─ RLS policies (row-level access)
└─ Triggers (auto-calculations)

Caching:
├─ Engineer list (updates infrequently)
└─ Dashboard stats (refresh on action)
```

## Monitoring & Logging

```
Application Level:
├─ Console errors (browser dev tools)
├─ Network requests (failed API calls)
└─ Component errors (error boundaries)

Database Level:
├─ Supabase logs (query performance)
├─ RLS policy hits (access patterns)
└─ Trigger execution (auto-calculations)

User Actions:
├─ Jobs created per day
├─ PDFs generated
└─ Status changes tracked
```

---

This architecture provides:
✓ Separation of concerns (UI → State → Logic → Data)  
✓ Scalable structure (easy to add features)  
✓ Type safety (TypeScript throughout)  
✓ Security (RLS policies)  
✓ Performance (optimized queries, caching)  
✓ Maintainability (clear patterns, documentation)
