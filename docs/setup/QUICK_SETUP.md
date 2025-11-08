# ⚡ Quick Setup - Just Follow These Steps

## 🎯 Automated Setup

I've prepared everything for you. Here's what I did:

✅ Created .env template
✅ Created setup script
✅ Prepared SQL migration (ready to copy-paste)
✅ Upload script ready

---

## 🚀 Run This One Command:

```powershell
.\scripts\setup-credentials.ps1
```

This will:
1. Check/create .env file
2. Ask for your Supabase credentials
3. Save them
4. Show next steps

---

## 📋 Or Do It Manually:

### **Step 1: Add Supabase Credentials**

**Option A: Use the script**
```powershell
.\scripts\setup-credentials.ps1
```

**Option B: Manual**
1. Copy `.env.template` to `.env`
2. Edit `.env` with your credentials
3. Get credentials from: https://supabase.com/dashboard → Settings → API

**Option C: PowerShell (fastest)**
```powershell
# Open .env file
code .env

# Or edit manually
notepad .env
```

Add your values:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

---

### **Step 2: Add to Cloudflare**

**Go to:** https://dash.cloudflare.com

**Steps:**
1. Workers & Pages → Pages
2. Click: fire-protection-tracker
3. Click: Settings tab
4. Scroll to: Environment Variables
5. Add:

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: [same as .env file]
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: [same as .env file]
```

6. Click: Save
7. Go to: Deployments tab
8. Click: Retry deployment on latest deployment
9. Wait 2 minutes

✅ **Done!**

---

### **Step 3: Run SQL Migration**

**Open:** `COPY_PASTE_READY.md` in this project

**Then:**
1. Go to: https://supabase.com/dashboard
2. Click: SQL Editor
3. Click: New query
4. Copy ALL code from COPY_PASTE_READY.md
5. Paste in SQL Editor
6. Click: Run

**You'll see:**
```
Success. No rows returned.
```

✅ **Done!**

---

### **Step 4: Upload Documents**

```bash
npm run upload-docs
```

This uploads all documents from QuintensDocs to Supabase.

✅ **Done!**

---

## ✅ After These 4 Steps, Your App Is Fully Functional!

**Test it:**
- Visit: https://fire-protection-tracker.pages.dev
- Login
- Dashboard works
- Documents show
- Budget tracker works
- Client updates work

---

## 🎉 Ready?

Just run:
```powershell
.\scripts\setup-credentials.ps1
```

Then follow the on-screen instructions!

