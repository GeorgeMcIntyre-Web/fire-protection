# Fire Consultancy Module - Testing Guide

**For:** Quiten  
**Status:** Ready for Testing ✅  
**Deployment:** Cloudflare

---

## 🚀 Quick Start

### 1. Login
- Navigate to your deployed application URL
- Login with your credentials
- You should see the "Fire Consultancy" menu item in navigation

### 2. First Steps

#### A. Add an Engineer
1. Click **"Fire Consultancy"** in the menu
2. Go to **"Engineers"** tab (or `/fireconsult/engineers`)
3. Click **"Add Engineer"**
4. Fill in:
   - Name: "Test Engineer"
   - Email: "engineer@test.com"
   - Company: "Test Engineering Co"
   - Fee Split: 90/10 (default)
5. Click **"Save"**

#### B. Add Accreditation (Optional)
1. Click on the engineer you just created
2. Click **"Add Accreditation"**
3. Fill in:
   - Type: ASIB
   - Certificate Number: "TEST-001"
   - Issued Date: Today
   - Expiry Date: 1 year from now
4. Click **"Save"**

#### C. Create Your First Job
1. Go to **"Fire Consultancy"** dashboard
2. Click **"New Job"** button
3. Fill in the form:

   **Basic Info:**
   - Site Name: "Test Warehouse"
   - Site Address: "123 Test Street"
   - Contact Person: "John Doe"
   - Contact Email: "john@test.com"
   - Contact Phone: "+27 11 123 4567"

   **Hazard Details:**
   - Commodity Class: "Class II/III"
   - Storage Method: "Racked"
   - Storage Height: 6 m
   - Ceiling Height: 9 m
   - Sprinkler Strategy: "Ceiling Only"

   **Water Supply:**
   - Municipal Supply Adequate: **No** (check this)
   - Requires Tank: **Yes**
   - Requires Pump: **Yes**

4. Click **"Create Job"**

#### D. Generate a Quote
1. Click on the job you just created
2. Scroll down to **"Generate Quote"** section
3. Select:
   - Quote Type: **"Full Installation"**
   - Custom Margin: Leave blank (uses default 25%)
4. Click **"Generate Quote"**
5. Review the cost breakdown
6. Click **"Save Quote"** to store it
7. Click **"Generate PDF"** to create a PDF document

---

## ✅ Testing Checklist

### Core Functionality
- [ ] Can create a new job
- [ ] Job auto-calculates design parameters
- [ ] Job auto-calculates water supply requirements
- [ ] Can generate a quote (design-only)
- [ ] Can generate a quote (full installation)
- [ ] Quote calculations look correct
- [ ] Can save quote to database
- [ ] Can generate quote PDF
- [ ] PDF opens in print dialog
- [ ] Can add an engineer
- [ ] Can add accreditation to engineer
- [ ] Accreditation expiry alerts show (if expiring soon)

### Quote Calculations
- [ ] Design-only quote shows ~50% margin
- [ ] Full installation quote shows ~25% margin
- [ ] VAT is calculated correctly (15%)
- [ ] Cost breakdown shows all components
- [ ] Water supply cost included when required
- [ ] Custom margin override works

### UI/UX
- [ ] Navigation works smoothly
- [ ] Forms validate correctly
- [ ] Error messages are clear
- [ ] Loading states show appropriately
- [ ] Data refreshes after saves

---

## 🧪 Test Scenarios

### Scenario 1: Simple Warehouse (Ordinary Hazard)
- **Input:**
  - 500 sprinklers
  - Ordinary Hazard (OH)
  - No tank/pump required
  - Full Installation

- **Expected:**
  - Quote should be around R750k - R900k (incl. VAT)
  - Margin: ~25%
  - No water supply cost

### Scenario 2: High Hazard Storage (HH3)
- **Input:**
  - 1,000 sprinklers
  - High Hazard 3 (Group A Plastics)
  - Tank + Pump required
  - Full Installation

- **Expected:**
  - Quote should be around R4.5M - R5M (incl. VAT)
  - Margin: ~25%
  - Water supply: ~R1.2M
  - Higher per-head costs due to complexity

### Scenario 3: Design Only Quote
- **Input:**
  - 200 sprinklers
  - High Hazard 2
  - Design Only

- **Expected:**
  - Quote should be around R30k - R40k (incl. VAT)
  - Margin: ~50%
  - Only engineering costs

---

## 🐛 Known Issues / Notes

### If Quote Generation Fails:
- Make sure the job has an `estimated_sprinkler_count` set
- Check browser console for errors
- Verify job data is saved correctly

### If PDF Doesn't Open:
- Check browser pop-up blocker settings
- Try a different browser (Chrome recommended)
- PDF uses browser print dialog (Save as PDF option)

### If Database Errors:
- Verify migrations have been run in Supabase
- Check RLS policies are set correctly
- Ensure user has proper permissions

---

## 📊 Expected Quote Ranges (Full Installation)

| Sprinklers | Hazard | Expected Range (ZAR) |
|------------|--------|---------------------|
| 100 | OH | R150k - R200k |
| 500 | OH | R750k - R900k |
| 1,000 | OH | R1.5M - R1.8M |
| 500 | HH2 | R1.2M - R1.5M |
| 1,000 | HH3 | R4.5M - R5M |
| 2,000 | HH4 | R8M - R10M |

*Note: These are rough estimates. Actual quotes depend on specific parameters.*

---

## 🎯 What to Test Specifically

### 1. Quote Accuracy
- [ ] Compare generated quotes to manual calculations
- [ ] Verify margin percentages are correct
- [ ] Check VAT calculation (should be 15% of ex-VAT total)

### 2. Water Supply Logic
- [ ] Jobs with tank/pump show water supply costs
- [ ] Jobs without tank/pump don't include water supply
- [ ] Water supply costs match hazard category

### 3. Database Persistence
- [ ] Saved quotes appear in database
- [ ] Quote numbers are unique
- [ ] Quote status can be updated

### 4. PDF Quality
- [ ] PDF is professional looking
- [ ] All cost breakdowns are visible
- [ ] Terms and conditions are included
- [ ] Quote number is correct

---

## 📝 Feedback Template

After testing, please provide feedback on:

1. **Functionality:**
   - What worked well?
   - What didn't work?
   - Any errors encountered?

2. **Calculations:**
   - Are quotes accurate?
   - Do margins look correct?
   - Any pricing concerns?

3. **User Experience:**
   - Is the workflow intuitive?
   - Any confusing parts?
   - Suggestions for improvement?

4. **Performance:**
   - Is it fast enough?
   - Any lag or delays?

---

## 🆘 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Take screenshots of any problems
3. Note the exact steps to reproduce
4. Contact the development team

---

## 🎉 Success Criteria

The module is working correctly if:
- ✅ You can create jobs without errors
- ✅ Quotes generate in < 5 seconds
- ✅ Quote calculations are accurate
- ✅ PDFs generate successfully
- ✅ All data saves to database
- ✅ Navigation is smooth

**Happy Testing!** 🚀

