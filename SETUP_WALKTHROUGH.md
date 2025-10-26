# 🎯 Step-by-Step Setup Walkthrough for Quinten

## Current Status
- ✅ Frontend: Built and deployed
- ✅ URL: https://fire-protection-tracker.pages.dev
- ⚠️ Backend: Needs 3 steps

---

## 📋 BACKEND SETUP - 3 Steps

### **STEP 1: Add Supabase Credentials to Cloudflare (5 minutes)**

**What this does:**
Connects your deployed app to your Supabase database.

**How to do it:**
1. Go to: https://dash.cloudflare.com
2. Click: **Workers & Pages** → **Pages**
3. Click on: **fire-protection-tracker**
4. Click tab: **Settings**
5. Scroll to: **Environment Variables**
6. Click: **Add variable**

**Add Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: (paste your Supabase project URL)
Click: Save
```

**Add Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY  
Value: (paste your Supabase anon key)
Click: Save
```

**Where to find values:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: **Settings** (gear icon)
4. Click: **API** (in left menu)
5. Copy:
   - **Project URL** → Goes to VITE_SUPABASE_URL
   - **anon public** key → Goes to VITE_SUPABASE_ANON_KEY

**After adding:**
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **Retry deployment**

**Verify:**
- Wait 2-3 minutes
- Check deployment shows "Success"
- Visit your app
- It should connect to Supabase

---

### **STEP 2: Run SQL Migration (5 minutes)**

**What this does:**
Creates database tables for document management.

**How to do it:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: **SQL Editor** (in left sidebar)
4. Click: **New query**
5. Open file: `supabase-documents.sql` (in your project folder)
6. Select all content (Ctrl+A)
7. Copy (Ctrl+C)
8. Paste into SQL Editor
9. Click: **Run** button (or Ctrl+Enter)

**You should see:**
```
Success. No rows returned.
```

**Verify it worked:**
1. Click: **Table Editor** (in left sidebar)
2. You should see new tables:
   - ✅ `document_categories`
   - ✅ `document_library`
   - ✅ `project_documents`
3. Click: **Storage** (in left sidebar)
4. You should see new buckets:
   - ✅ `company-documents`
   - ✅ `project-documents`
   - ✅ `forms`
   - ✅ `certificates`

**If errors:**
- Some tables might already exist
- That's OK, ON CONFLICT prevents duplicates
- Continue anyway

---

### **STEP 3: Upload Documents (10 minutes)**

**What this does:**
Uploads all your company documents to Supabase Storage.

**Prerequisites:**
- Supabase credentials added to Cloudflare ✓
- SQL migration run ✓
- Documents exist in: `FirePm/QuintensDocs/` ✓

**How to do it:**

**1. Check documents exist:**
```bash
# List files in QuintensDocs
dir "C:\Users\George\source\repos\FirePm\QuintensDocs" /s
```

**2. Prepare environment:**

Create `.env` file in project root with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Or set temporarily:**
```powershell
$env:VITE_SUPABASE_URL="your-supabase-url"
$env:VITE_SUPABASE_ANON_KEY="your-anon-key"
```

**3. Run upload script:**
```bash
npm run upload-docs
```

**You'll see:**
```
📄 Uploading: Work Appointment Schedule.xlsx
📄 Uploading: Pressure Test Checklist.xlsx
...
✅ Success: 47 documents uploaded
   Success: 45
   Errors: 2
```

**What gets uploaded:**
- All PDF files
- All DOCX files
- All XLSX files
- Organizes by category automatically
- Creates database records

**Verify:**
1. Go to Supabase → Storage → company-documents
2. Should see your files uploaded
3. Go to app → Work Documentation → Company Documents tab
4. Should see all documents listed

**If errors:**
- Check file paths are correct
- Check Supabase credentials
- Check storage bucket exists
- Check RLS policies

---

## ✅ After Setup - What You'll Have

### **In Supabase:**
- ✅ Document tables created
- ✅ 50+ documents uploaded
- ✅ Storage organized by category
- ✅ Security policies set

### **In Cloudflare:**
- ✅ App deployed
- ✅ Supabase credentials configured
- ✅ Auto-deploys on git push

### **In App:**
- ✅ Can login/register
- ✅ Dashboard shows real data
- ✅ Can create projects
- ✅ Document library populated
- ✅ Budget tracker functional
- ✅ Client updates work

---

## 🧪 Testing Checklist

After setup, test these:

### **Authentication:**
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Session persists on refresh

### **Dashboard:**
- [ ] Shows PM workflow panel
- [ ] Shows budget tracker
- [ ] Shows daily work items
- [ ] Client updates section works

### **Document Management:**
- [ ] Go to Work Documentation → Company Documents
- [ ] See all uploaded documents
- [ ] Can filter by category
- [ ] Can search documents
- [ ] Can download/view documents

### **Project Management:**
- [ ] Can create project from template
- [ ] Tasks are generated
- [ ] Can assign tasks
- [ ] Can track time

---

## 🎯 Next Development Moves

### **Immediate (After Setup):**
1. Test all features
2. Create test project
3. Use with real data
4. Give feedback

### **Short Term (This Week):**
1. Use daily for project planning
2. Track budgets on real projects
3. Send client updates via app
4. Build document library

### **Long Term (Next Month):**
1. Full production use
2. Add more templates
3. Generate reports
4. Mobile app
5. Integrations (SMS, email)

---

## 📊 Summary

**Completed:**
- ✅ Frontend built
- ✅ Features working
- ✅ Deployed live

**Next:**
1. ✅ Add Supabase credentials (5 min)
2. ✅ Run SQL migration (5 min)  
3. ✅ Upload documents (10 min)

**Total setup time:** ~20 minutes

**Then you're ready to use it daily!** 🚀

---

## 🆘 Troubleshooting

**"App loads but shows errors":**
- Credentials not added yet
- Add environment variables and redeploy

**"Documents don't show":**
- SQL migration not run
- Run supabase-documents.sql
- Then upload documents

**"Can't login":**
- Supabase not connected
- Check credentials are correct
- Check Supabase project is active

**"Upload fails":**
- Documents not found in path
- Check `FirePm/QuintensDocs/` exists
- Check file permissions
- Check Supabase credentials

**Need help?**
- Check logs in Supabase Dashboard
- Check browser console for errors
- Check Cloudflare deployment logs

---

Ready to start? Let's begin with Step 1! 🎯

