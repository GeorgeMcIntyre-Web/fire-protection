# Quick Reference for Claude - Fire Protection ERP

**Status:** Production-ready app with Fire Consultancy module 100% complete. Main app needs final integrations.

---

## ✅ What's Complete & Working

### **Core Application**
- **Tech Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase
- **Deployment:** Cloudflare Pages (live at fire-protection-tracker.pages.dev)
- **Database:** PostgreSQL via Supabase with full schema

### **Main Features (All Working)**
1. **Project Management** ✅
   - Project tracking with 4-phase workflows
   - Task management
   - Client management
   - Budget tracking (connected to real data)

2. **Document Management** ✅
   - 9-category document library
   - File upload/delete (Supabase Storage)
   - Version control
   - Auto-categorization from filenames

3. **Time Tracking** ✅
   - Time logs
   - Work documentation (photos/notes)

4. **Fire Consultancy Module** ✅ **100% COMPLETE**
   - Job creation and management
   - Engineer management
   - Design request workflow
   - **Quoting engine** (ASIB-based hazard multipliers)
   - PDF generation (design requests & quotes)
   - Accreditation tracking with expiry alerts
   - Billing splits automation
   - Water supply calculations

5. **Email Service** ✅
   - Resend API integration
   - Quote email templates
   - Design request emails
   - Accreditation expiry warnings
   - *Note: Needs `VITE_RESEND_API_KEY` env variable*

---

## 🚧 What Needs Work (From NEXT_STEPS_FOR_COMPLETION.md)

### **Priority 1: Critical Integrations (2-3 hours)**
1. **Budget Tracker** - ✅ DONE (already connected to real data)
2. **Document Library** - ✅ DONE (upload/delete working)
3. **Quote Email Functionality** - ⚠️ Email service exists, needs integration
4. **File Upload for Design Documents** - ⚠️ Component exists, needs integration

### **Priority 2: Enhancements (3-4 hours)**
5. **Quote Approval Workflow** - Quote status tracking (draft → sent → accepted)
6. **Client Portal** - Public quote viewing with secure tokens
7. **Email Notifications System** - Automated emails for workflow events
8. **Advanced Search & Filtering** - Enhanced filters, date ranges, CSV export

### **Priority 3: Polish (2-3 hours)**
9. **Error Handling & Loading States** - Better UX
10. **Mobile Responsiveness** - Test and fix
11. **Performance Optimization** - Lazy loading, pagination

---

## 📁 Key Files & Structure

### **Entry Points**
- `src/main.tsx` - App initialization
- `src/App.tsx` - Routes
- `src/components/Layout.tsx` - Main layout

### **Fire Consultancy (Complete)**
- `src/pages/FireConsult/` - 4 pages (Dashboard, CreateJob, JobDetail, Engineers)
- `src/lib/fireconsult.ts` - CRUD operations
- `src/lib/fireconsult-quotes.ts` - Quoting engine
- `src/lib/quote-pdf.ts` - Quote PDF generation
- `src/lib/design-request-pdf.ts` - Design request PDFs
- `src/lib/water-supply-estimator.ts` - Calculations
- `src/contexts/FireConsultContext.tsx` - State management

### **Core Libraries**
- `src/lib/budget.ts` - Budget calculations ✅
- `src/lib/documents.ts` - Document management ✅
- `src/lib/email.ts` - Email service (Resend) ✅
- `src/components/FileUpload.tsx` - Upload component ✅

### **Database**
- `database/migrations/` - SQL migration files
- All tables created with RLS policies

---

## 🎯 Division of Labor: Claude vs Cursor

### **Claude's Work (Complex Logic & Integration)** 🧠

**Claude should handle:**
1. **Client Portal with Secure Tokens** (1-2 hours)
   - Token generation system (`src/lib/quote-tokens.ts`)
   - Public quote view page (`src/pages/Public/QuoteViewPage.tsx`)
   - RLS policies for public access
   - Accept/reject workflow logic
   - Email integration with secure links

2. **Advanced Search & Filtering** (1 hour)
   - Complex filter logic, multiple data sources
   - Date range filtering
   - Multi-criteria search
   - CSV export functionality
   - Performance optimization (debouncing, pagination)

3. **Email Notification System** (1-2 hours)
   - Workflow automation, business logic
   - Automated emails for workflow events
   - Quote status change notifications
   - Accreditation expiry warnings (scheduled)
   - Design request notifications
   - Email template system

4. **Quote Approval Workflow** (1 hour)
   - State management, database updates
   - Quote status tracking (draft → sent → accepted/rejected)
   - Status update functions in `fireconsult-quotes.ts`
   - Quotes management page logic
   - Status history tracking

### **Cursor's Work (UI/UX & Simple Integrations)** ✋

**Cursor will handle:**
1. **Connect Quote Email Button** (30 min) - Simple UI integration
2. **Add File Upload to Job Details** (30 min) - Component placement
3. **Error Boundaries & Loading States** (1 hour) - UI polish
4. **Mobile Responsiveness Fixes** (1-2 hours) - Visual testing
5. **TypeScript & Linting Cleanup** (30 min) - Quick fixes
6. **UI Polish** (1 hour) - Visual improvements

**See:** `CURSOR_WORK_ASSIGNMENT.md` for full details

---

## 🎯 What Claude Should Focus On

### **Priority 1: Complex Features**
1. **Client Portal** - Security-critical, requires token system
2. **Quote Approval Workflow** - Business logic and state management
3. **Advanced Search** - Complex filter logic
4. **Email Notifications** - Workflow automation

### **Priority 2: After Cursor's Quick Wins**
- Review and integrate Cursor's UI connections
- Add any missing business logic
- Test end-to-end workflows

---

## 🚀 Quick Start for Claude

**If user says "connect quote email":**
- File: `src/pages/FireConsult/JobDetailPage.tsx`
- Use: `src/lib/email.ts` (already has `sendQuoteEmail` function)
- Add: Button to send quote via email

**If user says "add file upload":**
- Component: `src/components/FileUpload.tsx` (already exists)
- Integrate: Into `JobDetailPage.tsx` for design documents

**If user says "quote approval workflow":**
- Add: Status dropdown in `JobDetailPage.tsx`
- Update: `src/lib/fireconsult-quotes.ts` with status update function
- Create: `src/pages/FireConsult/QuotesPage.tsx` for quote management

**If user says "client portal":**
- Create: `src/pages/Public/QuoteViewPage.tsx`
- Add: Token generation in `src/lib/quote-tokens.ts`
- Route: `/quote/:token` in `App.tsx`

---

## 📊 Current State Summary

**Completed:** ~85% of planned features
- ✅ All core functionality working
- ✅ Fire Consultancy module 100% complete
- ✅ Budget, documents, email service all connected
- ⚠️ Some integrations need wiring up
- ⚠️ Polish and enhancements needed

**Ready for:**
- Production use (with minor setup)
- Feature enhancements
- Integration work
- Bug fixes
- Performance improvements

---

## 💡 Important Notes

1. **Email Service:** Code exists but needs `VITE_RESEND_API_KEY` environment variable
2. **Storage:** Supabase Storage buckets need to be configured
3. **Database:** All migrations exist in `database/migrations/`
4. **Deployment:** Already deployed to Cloudflare Pages
5. **Documentation:** Extensive docs in `docs/` directory

---

**Bottom Line:** This is a production-ready app with a complete Fire Consultancy module. Most remaining work is connecting existing components together and adding polish. All the hard work is done!

