# 🔧 Technical Overview - For George (ME/Software Engineer)

## 🎯 Architecture Summary

**Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Deployment: Cloudflare Pages
- State: React Context API
- Styling: Tailwind CSS

**Current Status:**
- ✅ Frontend built and deployed
- ⏳ Database needs initialization
- ⏳ Documents need upload

---

## 📐 System Architecture

### **Frontend Layer (React)**

```
src/
├── pages/           # Route components
│   ├── DashboardPage.tsx    # Main dashboard with PM/budget panels
│   ├── ProjectsPage.tsx      # Project management
│   ├── WorkDocsPage.tsx     # Documentation (photos + company docs)
│   └── ...
├── components/      # Reusable UI
│   ├── PMDashboard.tsx      # PM workflow tracking
│   ├── BudgetTracker.tsx    # Budget monitoring
│   ├── DocumentLibrary.tsx  # Document browser
│   └── ...
├── lib/            # Business logic
│   ├── pm-workflow.ts       # PM workflows + client updates
│   ├── project-planning.ts   # Structured project plans
│   ├── documents.ts         # Document CRUD operations
│   └── supabase.ts         # Database client
└── contexts/       # State management
    └── AuthContext.tsx     # Auth state
```

**Key Technologies:**
- TypeScript for type safety
- React Router for navigation
- Heroicons for UI
- Tailwind for styling

---

### **Backend Layer (Supabase)**

**Database Schema:**

```sql
-- Core tables (existing)
profiles, clients, projects, tasks, time_logs, work_documentation

-- New document management
document_categories     # 9 categories (Appointments, Certificates, etc.)
document_library        # All company documents
project_documents       # Junction table (project ↔ document)
```

**Storage Buckets:**
```sql
company-documents   # General company docs
project-documents   # Project-specific docs
forms               # Form templates
certificates        # Certificates/CoCs
```

**Security:**
- Row Level Security (RLS) enabled
- Auth policies configured
- Public/private buckets set

---

## 🔨 Key Components Explained

### **1. PM Workflow System**

**File:** `src/lib/pm-workflow.ts`

**Purpose:** Track daily PM tasks and client communications

**Key Functions:**
```typescript
getDailyWorkItems()       // Urgent/today tasks
getProjectsNeedingClientUpdates()  // Projects >3 days without update
getDocumentationStatus()   // Required docs per project
generateClientUpdate()    // Auto-generate update messages
```

**Data Flow:**
```
Supabase projects table
  → Query with status filters
  → Calculate days since update
  → Return as DailyWorkItem[]
  → Display in PMDashboard component
```

**Business Logic:**
- Urgent = deadline within 1 day OR high priority task
- Today = active project or medium priority
- Client update needed = last update > 3 days ago
- Progress % = completed tasks / total tasks

---

### **2. Budget Tracker**

**File:** `src/components/BudgetTracker.tsx`

**Purpose:** Monitor project costs and budget variance

**Components:**
- `BudgetSummary` interface (estimated, actual, variance)
- Budget calculation per project
- Variance percentage calculation
- Status indicators (green/yellow/red)

**Calculation:**
```typescript
variance = actual - estimated
variance_percentage = (variance / estimated) * 100

status = 
  if variance_percentage > 10: 'over_budget'
  else if variance_percentage > 5: 'at_risk'
  else: 'within_budget'
```

**Integration Points:**
- `src/lib/project-planning.ts` → cost calculations
- `time_logs` table → labor costs
- Task hours × hourly rate → labor cost
- Materials tracking → material cost

---

### **3. Document Management**

**File:** `src/lib/documents.ts`

**Purpose:** CRUD operations for company documents

**Key Functions:**
```typescript
uploadDocumentToStorage()  // Upload to Supabase Storage
createDocumentRecord()     // Create DB record
getDocuments()             // Query with filters
linkDocumentToProject()    // Link doc to project
```

**Categories (9 types):**
1. Appointments & Organograms
2. Certificates
3. Checklists
4. Forms & Templates
5. Index & Registers
6. Policies
7. Processes
8. Reports
9. Work Instructions

**Storage Structure:**
```
Supabase Storage
  └── company-documents/
      ├── Work Appointment Schedule.xlsx
      ├── Pressure Test Checklist.xlsx
      └── ...
```

---

### **4. Project Planning System**

**File:** `src/lib/project-planning.ts`

**Purpose:** Structured project plans with phases

**Project Structure:**
```typescript
ProjectPlan {
  phases: ProjectPhase[]
  total_estimated_cost: number
  budget_status: 'within_budget' | 'over_budget' | 'at_risk'
}

ProjectPhase {
  name: string
  tasks: PlannedTask[]
  status: 'not_started' | 'in_progress' | 'completed'
  dependencies?: string[]
}
```

**Phase Structure (Sprinkler System):**
```
Phase 1: Planning & Design
  ├─ Site Survey (4h, R2,600)
  ├─ System Design (8h, R1,200)
  └─ ASIB Submission (2h, R800)

Phase 2: Procurement & Fabrication
  ├─ Material Procurement (4h + R25k materials)
  ├─ Fabrication - Pipework (16h + R5k)
  └─ Mounting Brackets (8h + R500)

Phase 3: Installation
  ├─ Pipe Installation (32h + R2k materials)
  ├─ Sprinkler Heads (16h + R1.5k materials)
  └─ Valve Installation (8h + R3k materials)

Phase 4: Testing & Commissioning
  ├─ Pressure Testing (4h, R600)
  ├─ System Commissioning (8h, R1,200)
  └─ Final Documentation (4h, R600)
```

**Cost Calculation:**
```typescript
labor_cost = hours × hourly_rate
material_cost = materials × 1.25 (25% markup)
overhead = total_cost × 0.15 (15%)
profit = total_cost × 0.20 (20%)
total = labor + materials + overhead + profit
```

---

## 🔄 Data Flow

### **Project Creation Flow:**

```
User → Templates Page
  → Select template
  → Fill form data
  → Submit
  
Frontend → Supabase
  → Create project record
  → Create client (if new)
  → Generate tasks from template
  → Link project ↔ client ↔ tasks
  
Dashboard → Query Supabase
  → Fetch active projects
  → Fetch tasks for each project
  → Calculate progress %
  → Display in PMDashboard
```

### **Budget Tracking Flow:**

```
User works on project
  → Logs time (time_logs table)
  → Adds materials costs
  → Updates task status
  
Frontend calculates:
  → Actual hours from time_logs
  → Labor cost = hours × rate
  → Material cost from tasks
  → Variance = actual - estimated
  
BudgetTracker displays:
  → Per-project budgets
  → Overall budget status
  → Variance alerts
```

---

## 🗄️ Database Schema

### **Existing Tables:**
```sql
profiles          -- User profiles
clients           -- Customer records
projects          -- Fire protection projects
tasks             -- Project tasks
time_logs         -- Time tracking
work_documentation -- Photos/notes
```

### **New Tables (from supabase-documents.sql):**
```sql
document_categories    -- 9 category types
document_library       -- All company documents
project_documents      -- Many-to-many (projects ↔ documents)
```

**Relationships:**
```
projects (1) ←→ (many) tasks
projects (1) ←→ (many) project_documents
project_documents → document_library
document_library → document_categories
clients (1) ←→ (many) projects
users (1) ←→ (many) projects (created_by)
```

---

## 🎨 Frontend Patterns

### **Component Architecture:**

```typescript
// Container Components (pages)
DashboardPage.tsx
  ├── Stats section
  ├── PMDashboard (container)
  └── BudgetTracker (container)

// Presentational Components
PMDashboard.tsx
  ├── Quick Actions panel
  ├── Daily Work items
  ├── Client Updates
  └── Documentation Status

// Utility Functions (lib)
pm-workflow.ts
  ├── getDailyWorkItems()
  ├── getProjectsNeedingClientUpdates()
  └── generateClientUpdate()
```

### **State Management:**
```typescript
// Context for auth
AuthContext → provides { user, login, logout }

// Local state for components
useState() → component-scoped state
useEffect() → data fetching
```

---

## 🔐 Security Model

### **Authentication:**
- Supabase Auth (handles user management)
- JWT tokens (automatic)
- RLS policies (row-level security)

### **Authorization:**
```sql
-- Users can view their own profile
CREATE POLICY ON profiles 
  FOR SELECT USING (auth.uid() = id);

-- Users can view all projects
CREATE POLICY ON projects 
  FOR SELECT USING (true);

-- Users can only insert their own data
CREATE POLICY ON work_documentation 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🚀 Deployment Pipeline

```
Developer → Git push
  ↓
GitHub → Cloudflare (auto-deploy)
  ↓
Build: npm run build
  ↓
Deploy: dist/ → Cloudflare Pages
  ↓
Live: https://fire-protection-tracker.pages.dev
```

**Environment Variables:**
- Cloudflare Pages settings
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

---

## 🛠️ Development Workflow

### **Local Development:**
```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run upload-docs  # Upload documents to Supabase
```

### **Database Operations:**
```bash
# SQL migrations
Supabase Dashboard → SQL Editor → Run supabase-documents.sql

# Storage
Supabase Dashboard → Storage → Upload files
```

### **File Structure:**
```
fire-protection/
├── src/              # React source code
├── dist/             # Built files (deployed)
├── scripts/           # Automation scripts
├── supabase-setup.sql  # Original schema
└── supabase-documents.sql  # Document management schema
```

---

## 📊 Business Logic

### **Project Planning:**
- Templates define phase structure
- Phase dependencies enforced
- Cost estimates auto-calculated
- Task hours estimated per phase

### **Budget Management:**
- Track estimated vs actual per project
- Calculate variance percentage
- Alert on budget risks (>5% variance)
- Suggest cost-saving measures

### **Client Communication:**
- Track last update timestamp
- Calculate days since update
- Generate update messages
- One-click copy to clipboard

### **Document Organization:**
- Parse document codes (CFM-OPS-FRM-004)
- Extract versions (Rev 14)
- Auto-categorize by code
- Version control built-in

---

## 🧪 Testing Checklist

**Unit Tests Needed:**
- [ ] Budget calculations
- [ ] Document code parsing
- [ ] Client update message generation
- [ ] Phase dependency validation

**Integration Tests Needed:**
- [ ] Supabase queries
- [ ] File uploads
- [ ] Auth flow
- [ ] Project creation from template

**Manual Testing:**
- [ ] Create project
- [ ] Log time
- [ ] Upload documents
- [ ] Calculate budgets
- [ ] Send client updates

---

## 📈 Performance Considerations

**Optimizations:**
- Indexes on foreign keys
- Query filters to reduce data
- Pagination for large lists
- Image compression for photos

**Limitations:**
- Supabase free tier: 500MB storage, 2GB bandwidth
- Cloudflare Pages: automatic edge caching
- No server-side caching yet

---

## 🔧 Configuration Files

### **package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "upload-docs": "node scripts/upload-documents.js"
  }
}
```

### **vite.config.ts:**
- React plugin
- TypeScript support
- Path aliases

### **tailwind.config.js:**
- Custom theme
- Dark mode colors
- Custom utilities

---

## 🎯 Next Steps (Technical)

### **Immediate:**
1. Add Supabase credentials to Cloudflare
2. Run SQL migration in Supabase
3. Upload documents via script

### **Short Term:**
1. Add real-time subscriptions (Supabase realtime)
2. Email notifications
3. Mobile app
4. Reporting module

### **Long Term:**
1. Mobile app (React Native)
2. SMS integration
3. Analytics dashboard
4. Multi-tenant support

---

## 🐛 Known Issues / TODOs

**Technical Debt:**
- Budget tracker uses demo data (needs Supabase connection)
- Some TypeScript `any` types need fixing
- Error handling could be improved
- Loading states need optimization

**Feature Gaps:**
- No PDF generation yet
- No email sending yet
- No export functionality
- No advanced reporting

---

## 💡 Architecture Decisions

**Why Supabase:**
- PostgreSQL (reliable)
- Built-in auth
- File storage included
- Real-time subscriptions possible
- Free tier good for starting

**Why Cloudflare:**
- Edge deployment (fast globally)
- Automatic HTTPS
- Git integration
- Free tier
- Easy domain setup

**Why React:**
- Component-based (reusable UI)
- TypeScript safety
- Good ecosystem
- Easy to maintain

---

## 📝 Code Quality

**Type Safety:**
- TypeScript strict mode
- Interfaces for all data
- Type guards where needed

**Code Organization:**
- Separate concerns (UI vs logic)
- Reusable components
- Utility functions in lib/
- Clear file structure

**Documentation:**
- TSDoc comments on functions
- README files
- Setup guides
- Code comments where complex

---

## 🎓 Learning Resources

**For Understanding:**
- Supabase docs: https://supabase.com/docs
- React docs: https://react.dev
- TypeScript: https://typescriptlang.org/docs
- Tailwind: https://tailwindcss.com/docs

**For Quinten:**
- User guides in WORKFLOW_SOLUTIONS.md
- Setup guides in RIGHT_NOW_CHECKLIST.md
- Quick start in QUICK_SETUP.md

---

**Need more detail on any specific part?** Let me know!

