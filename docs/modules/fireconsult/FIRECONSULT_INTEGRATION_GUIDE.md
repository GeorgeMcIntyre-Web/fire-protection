# Fire Consultancy Module - Complete Integration Guide

This guide will walk you through integrating the FireConsult module into your existing Fire Protection project management system step by step.

## Prerequisites

- Existing React + TypeScript + Vite + Supabase project
- Node.js and npm installed
- Supabase project set up
- Basic understanding of React Router

---

## Step 1: Install Dependencies (5 minutes)

```bash
# Navigate to your project
cd fire-protection

# Install required packages
npm install jspdf html2canvas

# Verify installation
npm list jspdf html2canvas
```

---

## Step 2: Database Setup (10 minutes)

### 2.1: Run Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy contents of `supabase-fireconsult-migration.sql`
6. Paste into editor
7. Click **Run** (bottom right)
8. Verify success: "Success. No rows returned"

### 2.2: Verify Tables Created

In SQL Editor, run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'fire_%';
```

You should see:
- engineers
- accreditations
- fire_consult_jobs
- design_requests
- billing_splits
- fire_systems

### 2.3: Test RLS Policies

```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'fire_%';
```

---

## Step 3: Add Source Files (15 minutes)

Copy all created files to your project:

```bash
# From the files created, copy to your project:

# Context
cp src/contexts/FireConsultContext.tsx YOUR_PROJECT/src/contexts/

# Hooks
cp src/lib/fireconsult-hooks.ts YOUR_PROJECT/src/lib/

# Pages
mkdir -p YOUR_PROJECT/src/pages/FireConsult
cp src/pages/FireConsult/*.tsx YOUR_PROJECT/src/pages/FireConsult/

# Components (already created by Cursor)
# - src/components/FireConsultDashboard.tsx
# - src/components/AccreditationTracker.tsx

# Libraries (already created by Cursor)
# - src/lib/fireconsult.ts
# - src/lib/fireconsult-types.ts
# - src/lib/water-supply-estimator.ts
# - src/lib/design-request-pdf.ts
```

---

## Step 4: Update Router Configuration (10 minutes)

### 4.1: If using React Router v6

Open your main router file (usually `src/App.tsx` or `src/router.tsx`):

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FireConsultProvider } from './contexts/FireConsultContext';

// Import pages
import DashboardPage from './pages/FireConsult/DashboardPage';
import CreateJobPage from './pages/FireConsult/CreateJobPage';
import JobDetailPage from './pages/FireConsult/JobDetailPage';
import EngineersPage from './pages/FireConsult/EngineersPage';

function App() {
  return (
    <BrowserRouter>
      <FireConsultProvider>
        <Routes>
          {/* Existing routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* FireConsult routes */}
          <Route path="/fireconsult" element={<DashboardPage />} />
          <Route path="/fireconsult/jobs/new" element={<CreateJobPage />} />
          <Route path="/fireconsult/jobs/:id" element={<JobDetailPage />} />
          <Route path="/fireconsult/engineers" element={<EngineersPage />} />
        </Routes>
      </FireConsultProvider>
    </BrowserRouter>
  );
}
```

### 4.2: Add Navigation Menu Item

In your navigation component (e.g., `src/components/Navigation.tsx`):

```tsx
export default function Navigation() {
  return (
    <nav>
      {/* Existing menu items */}
      <a href="/dashboard">Dashboard</a>
      <a href="/projects">Projects</a>
      
      {/* Add FireConsult */}
      <a href="/fireconsult">Fire Consultancy</a>
    </nav>
  );
}
```

---

## Step 5: Update Supabase Client (5 minutes)

Ensure your Supabase client exports the database types:

```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export type helpers
export type { Database } from './database.types';
```

---

## Step 6: Environment Variables (2 minutes)

Verify your `.env` file has Supabase credentials:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Never commit `.env` to git!**

---

## Step 7: Test the Integration (15 minutes)

### 7.1: Start Dev Server

```bash
npm run dev
```

### 7.2: Navigate to FireConsult

Open browser: `http://localhost:5173/fireconsult`

### 7.3: Create Test Engineer

1. Click "Manage Engineers"
2. Click "+ Add Engineer"
3. Fill in:
   - Name: John Smith
   - Email: john@fireeng.co.za
   - Phone: +27 82 123 4567
   - Company: Smith Fire Engineering
   - Fee split: 90% / 10% (default)
4. Click "Create"

### 7.4: Add Accreditation

```sql
-- In Supabase SQL Editor
INSERT INTO accreditations (
  engineer_id,
  type,
  certificate_number,
  issued_date,
  expiry_date,
  issuing_body
) VALUES (
  (SELECT id FROM engineers LIMIT 1),
  'ASIB',
  'ASIB-12345',
  '2024-01-01',
  '2026-12-31',
  'Automatic Sprinkler Inspection Bureau'
);
```

### 7.5: Create Test Job

1. Go back to dashboard
2. Click "+ New Job"
3. Fill in form:
   - Site Name: ABC Warehouse
   - Client: ABC Logistics
   - Floor Area: 1000 m²
   - Commodity: Group A Plastics
   - Storage Method: Palletized
   - Storage Height: 6 m
   - Ceiling Height: 8 m
   - Strategy: Ceiling Only
4. Watch estimated parameters calculate
5. Click "Create Job"

### 7.6: Verify Job Created

You should see:
- Job number: FC-2025-0001 (or similar)
- Status: Site Visit
- Estimated parameters displayed
- Water supply calculations shown

### 7.7: Generate PDF

1. Click "Generate Design Request PDF"
2. Browser print dialog should open
3. Save as PDF
4. Verify all fields populated correctly

---

## Step 8: Configure Authentication (Optional, 10 minutes)

If you want to restrict access by user role:

### 8.1: Update RLS Policies

```sql
-- Allow only authenticated users
ALTER POLICY "Enable read for authenticated users" ON fire_consult_jobs
TO authenticated;

-- Add role-based access
CREATE POLICY "Consultants can create jobs"
ON fire_consult_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'consultant');
```

### 8.2: Add Auth Guard to Routes

```tsx
// src/components/AuthGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

// Wrap FireConsult routes
<Route 
  path="/fireconsult" 
  element={
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  } 
/>
```

---

## Step 9: Styling Adjustments (5 minutes)

If the components don't match your existing theme:

### 9.1: Update Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Match your existing brand colors
        primary: '#your-primary-color',
        secondary: '#your-secondary-color'
      }
    }
  }
}
```

### 9.2: Global Style Updates

Search and replace in component files:
- `bg-blue-600` → `bg-primary`
- `text-blue-600` → `text-primary`

---

## Step 10: Production Deployment (10 minutes)

### 10.1: Add Environment Variables to Cloudflare

If deploying to Cloudflare Pages:

1. Go to Workers & Pages
2. Select `fire-protection-tracker`
3. Settings → Environment Variables
4. Add production variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 10.2: Build and Deploy

```bash
# Build production bundle
npm run build

# Test build locally
npm run preview

# Push to git (triggers auto-deploy)
git add .
git commit -m "Add FireConsult module"
git push origin main
```

### 10.3: Verify Production

1. Visit your production URL
2. Navigate to `/fireconsult`
3. Create test job
4. Verify all features work

---

## Troubleshooting

### Issue: "Table does not exist"

**Solution**: Run the migration SQL again in Supabase SQL Editor

### Issue: TypeScript errors on imports

**Solution**: 
```bash
# Restart TS server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue: Components not rendering

**Solution**: Check browser console for errors, verify all imports correct

### Issue: PDF not generating

**Solution**: Check browser allows print dialogs, try different browser

### Issue: Calculations incorrect

**Solution**: Verify all inputs in correct units (m² not m, L/min not m³/h)

### Issue: RLS blocking access

**Solution**: 
```sql
-- Temporarily disable RLS for testing
ALTER TABLE fire_consult_jobs DISABLE ROW LEVEL SECURITY;
```

---

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Can create engineer
- [ ] Can add accreditation
- [ ] Can create job with all fields
- [ ] Auto-calculations work (density, area, sprinklers)
- [ ] Water supply calculations correct
- [ ] Job appears in dashboard table
- [ ] Can view job details
- [ ] Can generate PDF
- [ ] Can change job status
- [ ] Accreditation alerts show
- [ ] Billing splits calculate correctly
- [ ] Search and filter works
- [ ] Mobile responsive

---

## Next Steps

### Immediate Enhancements

1. **File Upload**: Add ability to upload floor plans, site photos
2. **Email Notifications**: Auto-email engineer when design request created
3. **Client Portal**: Let clients view job status
4. **Advanced Search**: Filter by date range, status, engineer

### Future Features

1. **Mobile App**: React Native version for site visits
2. **Offline Mode**: Work without internet, sync later
3. **AR Integration**: Overlay sprinkler layout on camera view
4. **CAD Export**: Export to AutoCAD format
5. **Compliance Reports**: Auto-generate SANS 10400-T reports

---

## Support

### Documentation
- Main docs: `FIRECONSULT_MODULE.md`
- Setup guide: `FIRECONSULT_SETUP.md`
- This guide: `FIRECONSULT_INTEGRATION.md`

### Getting Help
- Check browser console for errors
- Review Supabase logs
- Check RLS policies
- Verify environment variables

### Common Resources
- Supabase: https://supabase.com/docs
- React Router: https://reactrouter.com/
- Tailwind: https://tailwindcss.com/
- jsPDF: https://rawgit.com/MrRio/jsPDF/master/docs/

---

## Summary

You've successfully integrated the FireConsult module! 

**What you can now do:**
✅ Manage fire consultancy projects end-to-end  
✅ Track engineers and accreditations  
✅ Auto-calculate design parameters  
✅ Generate professional design request PDFs  
✅ Split billing automatically (90/10)  
✅ Monitor accreditation expiry  
✅ Track job status through workflow  

**Time to complete integration:** ~2 hours  
**Lines of code added:** ~3,500  
**New database tables:** 6  
**New routes:** 4  

Enjoy your new Fire Consultancy management system! 🔥
