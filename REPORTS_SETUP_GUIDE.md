# Reports Module - Setup Guide

## Quick Setup (3 Steps)

### Step 1: Run Database Migration

Execute the SQL migration to create the `client_communications` table:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-client-communications.sql`
4. Click "Run" to execute

**What this does:**
- Creates `client_communications` table
- Sets up indexes for performance
- Configures Row Level Security (RLS) policies
- Adds sample data (optional)

### Step 2: Verify Installation

The Reports page has been automatically added to your application:

✅ **Files Created:**
- `/src/pages/ReportsPage.tsx` - Main reports component
- `/src/lib/pdf-export.ts` - Optional PDF export utilities
- `supabase-client-communications.sql` - Database migration
- `REPORTS_MODULE_README.md` - Complete documentation
- `REPORTS_SETUP_GUIDE.md` - This file

✅ **Files Updated:**
- `/src/App.tsx` - Added Reports route
- `/src/components/Navigation.tsx` - Added Reports menu item
- `/src/lib/supabase.ts` - Added client_communications types

### Step 3: Access Reports

1. Start your development server (if not running):
   ```bash
   npm run dev
   ```

2. Navigate to the Reports page:
   - Click "Reports" in the navigation menu
   - Or visit: `http://localhost:5173/reports`

3. You should see three tabs:
   - **Project Progress** - Track project completion
   - **Budget Summary** - Monitor costs and budgets
   - **Client Communications** - View communication history

## Features Available

### ✅ Core Features (Ready to Use)
- [x] Project progress tracking with completion percentages
- [x] Budget vs. actual cost analysis
- [x] Client communications log
- [x] CSV export for all reports
- [x] Color-coded status indicators
- [x] Real-time data refresh
- [x] Mobile responsive design
- [x] On-track/behind schedule indicators
- [x] Budget alerts and warnings

### 📦 Optional Features (Require Additional Setup)

#### PDF Export
To enable PDF export:

1. Install dependencies:
   ```bash
   npm install jspdf jspdf-autotable
   npm install --save-dev @types/jspdf
   ```

2. Uncomment PDF functions in `/src/lib/pdf-export.ts`

3. Add PDF export buttons to ReportsPage:
   ```tsx
   import { exportProjectProgressPDF } from '../lib/pdf-export'
   
   // Add button:
   <button onClick={() => exportProjectProgressPDF(projectProgress, {
     title: 'Project Progress Report',
     filename: 'progress-report',
     companyName: 'Your Company Name'
   })}>
     Export PDF
   </button>
   ```

## Testing the Reports Module

### 1. Test Project Progress Report

**Prerequisites:**
- At least one project in the database
- Projects should have tasks assigned
- Some tasks should be completed

**Expected Results:**
- Table shows all projects
- Progress bars display correctly
- Status badges show proper colors
- "On Track" indicators work
- CSV export downloads successfully

### 2. Test Budget Summary

**Prerequisites:**
- Projects with time logs
- Time logs should have start and end times

**Expected Results:**
- Budget calculations display
- Variance shows in red if over budget
- Summary cards show totals
- Budget alerts appear for at-risk projects
- CSV export includes all financial data

### 3. Test Client Communications

**Prerequisites:**
- Run the SQL migration (includes sample data)
- Or manually create communications

**Expected Results:**
- Communications display in chronological order
- Message content is readable
- Project and client names display
- Timestamps show correctly
- CSV export works

## Troubleshooting

### Issue: "No data available"
**Solution:**
1. Check that Supabase credentials are configured in `.env`
2. Verify projects exist in database
3. Check browser console for errors

### Issue: "Table 'client_communications' does not exist"
**Solution:**
1. Run the SQL migration from `supabase-client-communications.sql`
2. Refresh the Reports page

### Issue: Budget shows $0.00 for all projects
**Solution:**
1. Ensure tasks have time logs
2. Verify time logs have both start_time and end_time
3. Check that projects have tasks assigned

### Issue: CSV export not downloading
**Solution:**
1. Check browser's download settings
2. Allow pop-ups for your application
3. Try a different browser

### Issue: "Permission denied" errors
**Solution:**
1. Verify RLS policies are enabled
2. Ensure user is logged in
3. Check that user created the projects

## Data Flow

```
┌─────────────────────────────────────────────────┐
│            Supabase Database                    │
├─────────────────────────────────────────────────┤
│  projects → tasks → time_logs                   │
│  projects → clients                             │
│  client_communications → projects               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Helper Libraries                        │
├─────────────────────────────────────────────────┤
│  calculateProjectCosts()  (project-planning.ts) │
│  getBudgetAlerts()        (project-planning.ts) │
│  getProjectsNeedingClientUpdates()              │
│                           (pm-workflow.ts)      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│            ReportsPage.tsx                      │
├─────────────────────────────────────────────────┤
│  • Load data from database                      │
│  • Calculate metrics                            │
│  • Display in tables                            │
│  • Export to CSV                                │
└─────────────────────────────────────────────────┘
```

## Customization Tips

### Add New Report Columns

1. Edit the interface in `ReportsPage.tsx`:
   ```tsx
   interface ProjectProgress {
     // ... existing fields
     new_field: string
   }
   ```

2. Update data loading:
   ```tsx
   const progressData = projects.map(p => ({
     // ... existing mappings
     new_field: p.some_value
   }))
   ```

3. Add table column:
   ```tsx
   <th>New Column</th>
   // ...
   <td>{project.new_field}</td>
   ```

### Change Date Formats

Modify date display in the table cells:
```tsx
new Date(project.due_date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})
```

### Add Filtering

Add state for filters:
```tsx
const [statusFilter, setStatusFilter] = useState<string>('all')

const filteredProjects = projectProgress.filter(p => 
  statusFilter === 'all' || p.status === statusFilter
)
```

## Performance Optimization

For large datasets (100+ projects):

1. **Add Pagination:**
   ```tsx
   const [page, setPage] = useState(1)
   const pageSize = 20
   const paginatedData = data.slice((page-1)*pageSize, page*pageSize)
   ```

2. **Lazy Load Communications:**
   ```tsx
   .limit(50)
   .order('sent_date', { ascending: false })
   ```

3. **Add Database Indexes:**
   ```sql
   CREATE INDEX idx_projects_status ON projects(status);
   CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
   ```

## Next Steps

After confirming the Reports module works:

1. ✅ Test all three report tabs
2. ✅ Verify CSV exports work
3. ✅ Check data accuracy
4. 📊 (Optional) Add PDF export
5. 📊 (Optional) Add charts/graphs
6. 📊 (Optional) Add date range filters
7. 📊 (Optional) Schedule automated reports

## Support

For questions or issues:
- Check the main documentation: `REPORTS_MODULE_README.md`
- Review Supabase logs for database errors
- Verify all prerequisites are met
- Check browser console for JavaScript errors

---

**Status:** ✅ Ready to Use  
**Version:** 1.0.0  
**Last Updated:** 2025-10-28
