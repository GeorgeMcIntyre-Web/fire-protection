# Fire Consultancy Module - Completion Plan

## Current Status
Cursor has created the foundation:
- ✅ Database schema (6 tables with RLS)
- ✅ TypeScript types
- ✅ Water supply estimator
- ✅ Core library functions
- ✅ PDF generator
- ✅ Dashboard UI components
- ✅ Documentation

## What Needs to Be Done

### Phase 1: Database Setup (15 minutes)
- [ ] Run `supabase-fireconsult-migration.sql` in Supabase SQL Editor
- [ ] Verify tables created: engineers, accreditations, fire_consult_jobs, design_requests, billing_splits, fire_systems
- [ ] Test RLS policies with test data
- [ ] Confirm auto-numbering works (job_number format: FC-YYYY-0001)

### Phase 2: Type Integration (10 minutes)
- [ ] Add FireConsult types to main database types file
- [ ] Update `src/lib/supabase.ts` to export FireConsult types
- [ ] Ensure no TypeScript errors in IDE

### Phase 3: Routing Integration (20 minutes)
- [ ] Create `/fireconsult` route group
- [ ] Add navigation menu item
- [ ] Create sub-routes:
  - `/fireconsult` - Dashboard (main view)
  - `/fireconsult/jobs` - Jobs list
  - `/fireconsult/jobs/[id]` - Job detail
  - `/fireconsult/engineers` - Engineers list
  - `/fireconsult/accreditations` - Accreditation tracker

### Phase 4: Component Integration (30 minutes)
- [ ] Create page wrappers for dashboard components
- [ ] Add proper loading states
- [ ] Add error boundaries
- [ ] Connect to existing auth context
- [ ] Style to match existing UI theme

### Phase 5: Feature Completion (45 minutes)
- [ ] Job creation form
- [ ] Engineer management CRUD UI
- [ ] File upload for design documents
- [ ] PDF download functionality
- [ ] Email notification triggers (design request sent, sign-off received)
- [ ] Search and filter for jobs table

### Phase 6: Testing (30 minutes)
- [ ] Create test engineer with accreditations
- [ ] Create test job through full workflow
- [ ] Test calculations (water supply, billing splits)
- [ ] Generate test PDF
- [ ] Verify accreditation expiry alerts
- [ ] Test RLS policies (different user roles)

### Phase 7: Documentation (15 minutes)
- [ ] Add user guide for consultants
- [ ] Add admin guide for engineer setup
- [ ] Create video walkthrough (optional)
- [ ] Update main README with FireConsult section

## Critical Files to Create

### 1. Route Pages
```
src/pages/FireConsult/
├── DashboardPage.tsx          # Main dashboard wrapper
├── JobsPage.tsx               # Jobs list with filters
├── JobDetailPage.tsx          # Single job detail view
├── EngineersPage.tsx          # Engineer management
├── AccreditationsPage.tsx     # Accreditation tracking
└── CreateJobPage.tsx          # New job form
```

### 2. Forms
```
src/components/FireConsult/
├── JobForm.tsx                # Create/edit job
├── EngineerForm.tsx           # Create/edit engineer
├── AccreditationForm.tsx      # Add/edit accreditation
├── DesignRequestForm.tsx      # Generate design request
└── SignOffUpload.tsx          # Upload signed documents
```

### 3. Integration Layer
```
src/lib/
├── fireconsult-hooks.ts       # React hooks for data fetching
├── fireconsult-context.tsx    # Context for module state
└── fireconsult-utils.ts       # Helper functions
```

## Integration Checklist

### Database Connection
- [ ] Verify Supabase client can access new tables
- [ ] Test RLS policies with current auth setup
- [ ] Confirm triggers fire correctly (auto job numbering)

### Authentication
- [ ] Only authenticated users can access FireConsult routes
- [ ] Role-based access (admin, consultant, engineer views)
- [ ] API keys protected in environment variables

### UI Consistency
- [ ] Use existing Tailwind theme colors
- [ ] Match typography and spacing
- [ ] Reuse existing button/input components
- [ ] Consistent loading spinners and error messages

### Data Flow
```
User Action → Form Component → Hook → Library Function → Supabase → State Update → UI Refresh
```

## Quick Start Commands

```bash
# 1. Navigate to project
cd fire-protection

# 2. Install dependencies (if new)
npm install jspdf html2canvas

# 3. Run database migration
# Open Supabase Dashboard → SQL Editor → New Query
# Paste contents of supabase-fireconsult-migration.sql
# Click Run

# 4. Start dev server
npm run dev

# 5. Navigate to http://localhost:5173/fireconsult
```

## Testing Workflow

1. **Create Test Engineer**
   - Name: John Smith
   - Email: john@fireeng.co.za
   - Accreditation: ASIB-12345, expiry: 2026-12-31

2. **Create Test Job**
   - Client: ABC Warehouse
   - Site: 1000 m² storage facility
   - Commodity: Group A Plastics
   - Storage height: 6 m
   - Ceiling height: 8 m

3. **Verify Calculations**
   - Expected density: ~12.5 mm/min
   - Expected area: ~260 m²
   - Expected flow: ~3,250 L/min
   - Expected tank: ~290 m³
   - Expected sprinklers: ~100 heads
   - Expected design fee: ~R12,000
   - Expected engineer share: ~R1,200

4. **Generate PDF**
   - Click "Generate Design Request"
   - Verify all fields populated
   - Download PDF
   - Check formatting

5. **Upload Sign-off**
   - Upload dummy PDF as signed design
   - Status should change to "Design Complete"
   - Billing should update

## Common Issues & Solutions

### Issue: Tables not found
**Solution**: Run migration SQL in Supabase SQL Editor

### Issue: TypeScript errors on new types
**Solution**: Restart TS server, check imports

### Issue: RLS prevents access
**Solution**: Check user is authenticated, verify RLS policies

### Issue: PDF not generating
**Solution**: Check browser print dialog permissions

### Issue: Calculations incorrect
**Solution**: Verify input units (m² not m, L/min not m³/h)

## Performance Considerations

- [ ] Add indexes on frequently queried columns (job_number, status, engineer_id)
- [ ] Implement pagination for jobs table (50 per page)
- [ ] Cache engineer list in context (updates infrequently)
- [ ] Debounce search inputs (300ms)
- [ ] Lazy load PDF preview

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] File uploads scanned/validated
- [ ] API keys in .env (never committed)
- [ ] Input sanitization on all forms
- [ ] SQL injection prevention (using Supabase client)
- [ ] Engineer sign-off requires verified accreditation

## Next Steps After Completion

1. **User Testing**
   - Get feedback from actual consultants
   - Time the workflow vs manual process
   - Identify pain points

2. **Enhancements**
   - Mobile app version
   - Offline mode for site visits
   - AR overlay for sprinkler placement (future)
   - Integration with CAD tools

3. **Scaling**
   - Multi-company support
   - API for third-party integrations
   - Automated compliance reporting
   - ML for hazard classification

## Estimated Total Time
- **Setup & Integration**: 2 hours
- **Feature Completion**: 3 hours
- **Testing**: 1 hour
- **Documentation**: 0.5 hours
- **Total**: ~6.5 hours for complete integration

## Success Metrics

After completion, you should be able to:
- ✅ Create a job in under 5 minutes
- ✅ Generate a design request PDF in under 2 minutes
- ✅ Track 50+ jobs simultaneously
- ✅ See accreditation expiry warnings 30 days in advance
- ✅ Calculate accurate water supply requirements
- ✅ Auto-split billing between consultant and engineer

## Support Resources

- Supabase Docs: https://supabase.com/docs
- jsPDF Docs: https://rawgit.com/MrRio/jsPDF/master/docs/
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/

---

**Ready to start?** Begin with Phase 1 (Database Setup) and work through sequentially.
