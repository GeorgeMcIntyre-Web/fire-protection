# Fire Protection Project Management System - Project Summary

**For AI Context: This file provides a high-level overview. See detailed docs in `docs/` directory.**

## Project Overview

A comprehensive fire protection contractor project management system built with:
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Deployment:** Cloudflare Pages

## Core Modules

### 1. Main Project Management
- **Location:** `src/pages/ProjectsPage.tsx`, `src/pages/TasksPage.tsx`
- **Features:** Project tracking, task management, client management
- **Database:** `projects`, `tasks`, `clients` tables

### 2. Document Management
- **Location:** `src/pages/DocumentsPage.tsx`, `src/lib/documents.ts`
- **Features:** 9-category document library, version control, project linking
- **Database:** `document_library`, `document_categories`, `project_documents`

### 3. Time Tracking & Work Documentation
- **Location:** `src/pages/TimeTrackingPage.tsx`, `src/pages/WorkDocsPage.tsx`
- **Features:** Time logs, work photos, notes
- **Database:** `time_logs`, `work_documentation`

### 4. Fire Consultancy Module (NEW)
- **Location:** `src/pages/FireConsult/`, `src/lib/fireconsult*.ts`
- **Features:** Consultant-to-engineer pipeline, design requests, billing splits, accreditation tracking
- **Database:** `fire_consult_jobs`, `engineers`, `accreditations`, `design_requests`, `billing_splits`, `fire_systems`
- **Key Files:**
  - `src/contexts/FireConsultContext.tsx` - State management
  - `src/lib/fireconsult.ts` - CRUD operations
  - `src/lib/water-supply-estimator.ts` - Calculation engine
  - `src/lib/design-request-pdf.ts` - PDF generation
  - `src/components/FireConsultDashboard.tsx` - Dashboard UI
  - `src/components/AccreditationTracker.tsx` - Accreditation alerts

## Key Directories

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (routes)
│   └── FireConsult/   # Fire Consultancy module pages
├── contexts/           # React context providers
├── lib/                # Utility functions and business logic
└── __tests__/          # Test files

docs/
├── modules/
│   └── fireconsult/   # Fire Consultancy documentation
├── setup/              # Setup guides
├── deployment/         # Deployment guides
└── ...                 # Other documentation

database/
└── migrations/         # SQL migration files
```

## Database Schema

**Core Tables:**
- `profiles` - User profiles
- `clients` - Client information
- `projects` - Project tracking
- `tasks` - Task management
- `time_logs` - Time tracking
- `work_documentation` - Work photos/notes
- `document_library` - Company documents

**Fire Consultancy Tables:**
- `fire_consult_jobs` - Main job tracking
- `engineers` - Engineer contacts
- `accreditations` - Certificate tracking
- `design_requests` - Design request workflow
- `billing_splits` - Revenue splits
- `fire_systems` - System specifications

## Key Features

1. **Project Management:** 4-phase workflows, budget tracking, template-based creation
2. **Document Management:** 50+ documents, 9 categories, version control
3. **Client Communication:** Automated updates, message templates
4. **Fire Consultancy:** Auto-calculations, PDF generation, accreditation tracking
5. **Time Tracking:** Log hours, track work documentation
6. **Reporting:** Dashboard stats, revenue tracking

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend (PostgreSQL + Auth + Storage)
- **React Router** - Routing
- **Heroicons** - Icons

## Important Files to Know

**Configuration:**
- `package.json` - Dependencies
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Tailwind config

**Entry Points:**
- `src/main.tsx` - App entry point
- `src/App.tsx` - Route definitions
- `src/components/Layout.tsx` - Main layout

**Core Libraries:**
- `src/lib/supabase.ts` - Supabase client
- `src/lib/fireconsult.ts` - Fire Consultancy CRUD
- `src/lib/water-supply-estimator.ts` - Calculations
- `src/lib/documents.ts` - Document management

## Recent Additions (Fire Consultancy Module)

**New Components:**
- `FireConsultDashboard` - Main dashboard
- `AccreditationTracker` - Certificate expiry alerts
- `CreateJobPage` - Job creation form
- `JobDetailPage` - Job detail view
- `EngineersPage` - Engineer management

**New Context:**
- `FireConsultContext` - Global state management

**New Hooks:**
- `fireconsult-hooks.ts` - Custom data fetching hooks

## Documentation

- **Quick Start:** `docs/modules/fireconsult/QUICK_START.md`
- **Full Guide:** `docs/modules/fireconsult/README.md`
- **Integration:** `docs/modules/fireconsult/FIRECONSULT_INTEGRATION_GUIDE.md`
- **Architecture:** `docs/modules/fireconsult/SYSTEM_ARCHITECTURE.md`

## Current Status

✅ Fire Consultancy module fully integrated
✅ All routes configured
✅ Navigation updated
✅ Documentation complete
✅ Ready for database migration

## Next Steps

1. Run database migration: `database/migrations/supabase-fireconsult-migration.sql`
2. Test the module: Create engineer → Create job → Generate PDF
3. Deploy to production

---

**Note for AI:** This project has ~222 actual source files. The high file count (16,000+) is due to `node_modules/` which is excluded via `.cursorignore`.

