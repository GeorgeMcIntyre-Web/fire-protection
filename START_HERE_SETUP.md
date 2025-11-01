# 🚀 START HERE - FireGuard Pro Setup

## Quick Start (30 Minutes Total)

Follow these steps in order:

---

## ⚡ **1. Environment Variables** (5 min) 🔴 CRITICAL

**What:** Connect your app to Supabase database

**Steps:**
1. **Get Supabase credentials:**
   - Go to: https://supabase.com/dashboard
   - Click your project → Settings → API
   - Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy **anon public** key (long string)

2. **Add to Cloudflare:**
   - Go to: https://dash.cloudflare.com
   - Workers & Pages → **fire-protection-tracker** → Settings → Environment Variables
   - Add for **Production**:
     - `VITE_SUPABASE_URL` = (your Project URL)
     - `VITE_SUPABASE_ANON_KEY` = (your anon key)
   - Save → Go to Deployments → Retry latest deployment

**✅ Done when:** App can connect to database (test by signing in)

---

## ⚡ **2. Database Setup** (10 min) 🔴 CRITICAL

**What:** Create all database tables and structure

**Steps:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Open file: `supabase-complete-setup.sql` (in this repo)
4. Copy **ALL** contents
5. Paste into SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Should see: "Success. No rows returned"

**✅ Done when:** Go to Table Editor → See all tables listed

---

## ⚡ **3. Storage Buckets** (5 min) 🔴 CRITICAL

**What:** Create storage for documents

**Steps:**
1. Supabase Dashboard → **Storage**
2. Click **Create bucket**
3. Name: `company-documents`
4. ✅ Check "Public bucket"
5. File size: `52428800` (50MB)
6. Click **Create bucket**

**✅ Done when:** Bucket appears in Storage list

---

## ⚡ **4. Test Everything** (10 min) 🟡 IMPORTANT

**What:** Verify all features work

**Steps:**
1. Go to your app URL
2. Register a test account
3. Sign in
4. Test:
   - ✅ Create a project
   - ✅ Add a task
   - ✅ Log time
   - ✅ Upload a document
   - ✅ View dashboard

**✅ Done when:** All features work without errors

---

## 🎯 **Optional but Recommended**

### **Custom Domain** (15-30 min)
- Register: `fireguardpro.com` (or your choice)
- Connect in Cloudflare Pages → Custom domains
- Wait for SSL certificate

**See:** `DOMAIN_SUGGESTIONS.md` for options

### **Upload Documents** (15-30 min)
- Option 1: Use app's upload feature
- Option 2: Run `npm run upload-docs` (if you have document files)

---

## 📚 **Detailed Guides**

- **`COMPLETE_SETUP_GUIDE.md`** - Full step-by-step instructions
- **`SETUP_EXECUTION_CHECKLIST.md`** - Checklist format
- **`WHAT_NEXT.md`** - Overview of all next steps

---

## 🆘 **Quick Troubleshooting**

| Problem | Solution |
|---------|----------|
| Can't connect to Supabase | Check environment variables in Cloudflare |
| Tables don't exist | Run SQL migration script again |
| Can't upload documents | Create storage bucket first |
| Domain not working | Wait 5-10 min for SSL, check DNS settings |

---

## ✅ **You're Done When:**

- [ ] App loads at your URL
- [ ] Can sign in/register
- [ ] Can create projects
- [ ] Can add tasks
- [ ] Can log time
- [ ] Can upload documents
- [ ] Dashboard shows correctly

---

**Estimated Total Time: 30-60 minutes**

**Need help?** Check the detailed guides or error messages for specific issues.



