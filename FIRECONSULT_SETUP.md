# Fire Consultancy Module - Quick Setup Guide

## Step 1: Database Migration

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-fireconsult-migration.sql`
4. Click "Run"
5. Verify tables were created (check Table Editor)

## Step 2: Add Routes (Optional)

Add routes to your React Router setup:

```tsx
// In your router configuration
import FireConsultDashboard from './components/FireConsultDashboard'
import AccreditationTracker from './components/AccreditationTracker'

// Add routes:
<Route path="/fireconsult" element={<FireConsultDashboard />} />
<Route path="/fireconsult/accreditations" element={<AccreditationTracker />} />
```

## Step 3: Add Navigation Menu Items

Add to your navigation component:

```tsx
import { FireIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

// In your navigation menu:
<NavLink to="/fireconsult">
  <FireIcon className="h-5 w-5" />
  Fire Consultancy
</NavLink>
<NavLink to="/fireconsult/accreditations">
  <ShieldCheckIcon className="h-5 w-5" />
  Accreditations
</NavLink>
```

## Step 4: Create Your First Engineer

```typescript
import { createEngineer } from './lib/fireconsult'

const engineer = await createEngineer({
  full_name: 'John Engineer',
  email: 'john@engineering.co.za',
  phone: '+27 21 123 4567',
  company_name: 'Fire Engineering Solutions',
  registration_number: 'ECSA-12345',
  consultant_split_percentage: 90.00,
  engineer_split_percentage: 10.00,
  is_active: true,
  created_by: user.id
})
```

## Step 5: Add Engineer Accreditations

```typescript
import { createAccreditation } from './lib/fireconsult'

const accreditation = await createAccreditation({
  engineer_id: engineer.id,
  accreditation_type: 'ASIB',
  certificate_number: 'ASIB-2024-001',
  issued_date: '2024-01-15',
  expiry_date: '2025-01-15',
  issuing_authority: 'ASIB',
  is_active: true
})
```

## Step 6: Create Your First Job

```typescript
import { createFireConsultJob } from './lib/fireconsult'

const job = await createFireConsultJob({
  site_name: 'Test Warehouse',
  site_address: '123 Test Street',
  contact_person: 'Test Contact',
  contact_email: 'test@example.com',
  consultant_id: user.id,
  assigned_engineer_id: engineer.id,
  
  // Storage info
  commodity_class: 'Class II',
  storage_method: 'palletized',
  storage_height_m: 6.0,
  ceiling_height_m: 10.0,
  sprinkler_strategy: 'ceiling_only',
  
  // Water supply
  municipal_pressure_bar: 3.8,
  municipal_flow_lpm: 1200,
  
  // Pricing
  design_fee_per_head: 150
})

// System automatically calculates:
// - Design density: ~6.5 mm/min
// - Design area: ~200 m²
// - Estimated sprinkler count: ~20 heads
// - Required flow: ~1300 L/min
// - Tank size: ~78 m³
// - Pump type: electric
// - Total design fee: R3,000
// - Consultant fee: R2,700 (90%)
// - Engineer fee: R300 (10%)
```

## Step 7: Generate Design Request

```typescript
import { generateDesignRequestPDF } from './lib/design-request-pdf'

// Get job with engineer
const job = await getFireConsultJob(jobId)

// Generate and open PDF
generateDesignRequestPDF({
  job,
  engineer: job.engineer,
  consultantName: 'Your Name',
  consultantCompany: 'Your Company'
})
```

## Step 8: View Dashboard

Navigate to `/fireconsult` to see:
- Total jobs count
- Active jobs
- Pending engineer sign-offs
- Total revenue
- Recent jobs table

## Testing Checklist

- [ ] Database migration completed successfully
- [ ] Can create engineer
- [ ] Can add accreditation
- [ ] Can create fire consult job
- [ ] Design parameters auto-calculate
- [ ] Water supply estimates correctly
- [ ] Billing split calculates (90/10)
- [ ] Design request PDF generates
- [ ] Dashboard displays jobs
- [ ] Accreditation alerts show expiring certificates

## Common Issues

### "Table does not exist" error
- Make sure you ran the SQL migration
- Check that tables exist in Supabase Table Editor

### "Permission denied" error
- Check RLS policies are enabled
- Verify user has correct role (admin/manager)

### PDF doesn't generate
- Check browser pop-up blocker
- Use `downloadDesignRequestHTML` as alternative

### Calculations seem wrong
- Verify input values (heights in meters, pressure in bar)
- Check commodity class and storage method are correct
- Review `water-supply-estimator.ts` for calculation formulas

## Next Steps

1. Customize pricing per head based on your rates
2. Adjust default split percentages if needed
3. Add more engineers and accreditations
4. Create jobs for real projects
5. Integrate with your existing project management workflow

## Support

See `FIRECONSULT_MODULE.md` for detailed documentation.

