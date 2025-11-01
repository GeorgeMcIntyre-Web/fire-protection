# ✅ FireGuard Pro - Complete Setup Checklist

Follow this checklist step-by-step to get everything configured.

---

## 🔴 **STEP 1: Environment Variables (REQUIRED)**

### Get Supabase Credentials:
- [ ] Go to https://supabase.com/dashboard
- [ ] Select/create your project
- [ ] Settings → API
- [ ] Copy **Project URL**: `https://xxxxx.supabase.co`
- [ ] Copy **anon public** key: `eyJ...`

### Add to Cloudflare:
- [ ] Go to https://dash.cloudflare.com
- [ ] Workers & Pages → **fire-protection-tracker**
- [ ] Settings → **Environment Variables**
- [ ] Add `VITE_SUPABASE_URL` = (your Project URL)
- [ ] Add `VITE_SUPABASE_ANON_KEY` = (your anon key)
- [ ] Click **Save**
- [ ] Go to **Deployments** → Click **Retry deployment** on latest

**⏱️ Time: 5 minutes**  
**✅ Status:** ___

---

## 🔴 **STEP 2: Database Setup (REQUIRED)**

### Run SQL Migration:
- [ ] Go to Supabase Dashboard → **SQL Editor**
- [ ] Click **New query**
- [ ] Open `supabase-complete-setup.sql` from this repo
- [ ] Copy **ENTIRE** file contents
- [ ] Paste into SQL Editor
- [ ] Click **Run** (Ctrl+Enter)
- [ ] Verify success: "Success. No rows returned"

### Verify Tables Created:
- [ ] Go to **Table Editor**
- [ ] Verify these tables exist:
  - [ ] `profiles`
  - [ ] `clients`
  - [ ] `projects`
  - [ ] `tasks`
  - [ ] `time_logs`
  - [ ] `work_documentation`
  - [ ] `document_library` (or `documents`)
  - [ ] `document_categories`
  - [ ] `project_documents`

**⏱️ Time: 10 minutes**  
**✅ Status:** ___

---

## 🟡 **STEP 3: Storage Buckets (REQUIRED)**

### Create Buckets:
- [ ] Go to Supabase Dashboard → **Storage**
- [ ] Click **Create bucket**

**Bucket 1:**
- [ ] Name: `company-documents`
- [ ] Public bucket: ✅ **Yes** (checked)
- [ ] File size limit: `52428800` (50MB)
- [ ] Click **Create bucket**

**Bucket 2 (Optional):**
- [ ] Name: `project-documents`
- [ ] Public bucket: ✅ **Yes**
- [ ] File size limit: `52428800`
- [ ] Click **Create bucket**

**⏱️ Time: 5 minutes**  
**✅ Status:** ___

---

## 🟡 **STEP 4: Custom Domain (OPTIONAL but Recommended)**

### Register Domain:
- [ ] Decide on domain: `fireguardpro.com` (recommended)
- [ ] Register at Cloudflare Registrar or preferred registrar
- [ ] Note: If using Cloudflare Registrar, domain auto-connects

### Connect to Pages:
- [ ] Go to Cloudflare Dashboard
- [ ] Workers & Pages → **fire-protection-tracker**
- [ ] Click **Custom domains** tab
- [ ] Click **Set up a custom domain**
- [ ] Enter your domain
- [ ] Follow DNS instructions
- [ ] Wait for SSL (5-10 minutes)
- [ ] Verify status shows **Active** ✅

**⏱️ Time: 15-30 minutes**  
**✅ Status:** ___

---

## 🟡 **STEP 5: Test Authentication**

### Create Test Account:
- [ ] Go to your app URL (Cloudflare Pages or custom domain)
- [ ] Click **Register**
- [ ] Create test account
- [ ] Verify email (if email verification enabled)
- [ ] Sign in
- [ ] ✅ Should see dashboard with welcome message

**⏱️ Time: 5 minutes**  
**✅ Status:** ___

---

## 🟡 **STEP 6: Test Core Features**

### Create Project:
- [ ] Go to **Projects** page
- [ ] Click **New Project** or **+** button
- [ ] Fill in project details
- [ ] Save project
- [ ] ✅ Project appears in list

### Add Task:
- [ ] Open the project you just created
- [ ] Click **Add Task** or **New Task**
- [ ] Fill in task details
- [ ] Save task
- [ ] ✅ Task appears in project

### Log Time:
- [ ] Go to **Time Tracking** page
- [ ] Click **Start Timer** or **Log Time**
- [ ] Fill in time entry
- [ ] Save
- [ ] ✅ Time entry saved

### Upload Document:
- [ ] Go to **Documents** page
- [ ] Click **Upload Document** or **+** button
- [ ] Select a test file (PDF, DOC, etc.)
- [ ] Fill in document info
- [ ] Upload
- [ ] ✅ Document appears in library

### Test Dashboard:
- [ ] Go to **Dashboard**
- [ ] ✅ Should show:
  - Welcome message
  - Project count
  - Task count
  - Time logged stats

**⏱️ Time: 15-20 minutes**  
**✅ Status:** ___

---

## 🟡 **STEP 7: Upload Documents (Optional)**

### Option 1: Via Script
- [ ] Create `.env` file in project root with:
  ```
  VITE_SUPABASE_URL=your-url
  VITE_SUPABASE_ANON_KEY=your-key
  ```
- [ ] Prepare documents folder (if using script)
- [ ] Run: `npm run upload-docs`
- [ ] Verify documents in Supabase Storage

### Option 2: Via App
- [ ] Sign in to app
- [ ] Go to **Documents**
- [ ] Upload documents one by one
- [ ] ✅ Documents appear in library

**⏱️ Time: 15-30 minutes (depending on number of docs)**  
**✅ Status:** ___

---

## ✅ **STEP 8: Production Health Check**

### Run Health Check:
- [ ] Open terminal in project directory
- [ ] Run: `npm run health-check`
- [ ] Review output
- [ ] Fix any errors reported
- [ ] ✅ All checks should pass

**⏱️ Time: 5 minutes**  
**✅ Status:** ___

---

## 🎉 **SETUP COMPLETE!**

### Verify Everything Works:
- [ ] App loads at your URL
- [ ] Can sign in/register
- [ ] Can create projects
- [ ] Can add tasks
- [ ] Can log time
- [ ] Can upload documents
- [ ] Dashboard shows data
- [ ] All navigation links work

### Next Steps:
- [ ] Create your first real project
- [ ] Invite team members (if ready)
- [ ] Customize any settings
- [ ] Set up monitoring/analytics

---

## 📊 **Progress Tracking**

**Completed Steps:** ___ / 8  
**Total Time:** ___ minutes  
**Blockers:** ___

---

## 🆘 **Need Help?**

- Check `COMPLETE_SETUP_GUIDE.md` for detailed instructions
- Review error messages in browser console
- Check Supabase Dashboard for database issues
- Verify Cloudflare Pages deployment logs

---

**Last Updated:** Today  
**Version:** 1.0



