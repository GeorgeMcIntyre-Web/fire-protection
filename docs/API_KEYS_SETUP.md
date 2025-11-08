# 🔑 API Keys Setup Guide

## What You Need

### **1. Supabase Credentials** (Required)

**Get them from:**
- https://supabase.com/dashboard
- Your project → Settings → API

**What you need:**
- `Project URL` → Goes to VITE_SUPABASE_URL
- `anon public` key → Goes to VITE_SUPABASE_ANON_KEY

---

## 🚀 Quick Setup (Choose One)

### **Option 1: Automated Script** (Easiest)

```powershell
.\scripts\setup-credentials.ps1
```

This will:
- Ask for your credentials
- Save to .env file
- Show next steps

---

### **Option 2: Manual .env Edit**

```powershell
# Edit the .env file
code .env

# Or use notepad
notepad .env
```

**Add these lines:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### **Option 3: PowerShell One-Liner**

```powershell
# Set credentials
$env:VITE_SUPABASE_URL="https://your-project.supabase.co"
$env:VITE_SUPABASE_ANON_KEY="your-anon-key-here"

# Save to .env
@"
VITE_SUPABASE_URL=$env:VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$env:VITE_SUPABASE_ANON_KEY
"@ | Out-File .env
```

---

## 📍 Where to Add Credentials

### **For Local Development (.env file)**

Already have .env? Just edit it:
```powershell
notepad .env
```

Add:
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

### **For Production (Cloudflare)**

**Steps:**
1. https://dash.cloudflare.com
2. Workers & Pages → Pages → fire-protection-tracker
3. Settings → Environment Variables
4. Add variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `your-url`
5. Add variable:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `your-key`
6. Save
7. Go to Deployments → Retry latest deployment

---

## ✅ Verify Setup

**Check .env exists:**
```powershell
Test-Path .env
```

**Check .env has values:**
```powershell
Get-Content .env
```

Should show:
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 🎯 After Setup

**1. Start local dev:**
```bash
npm run dev
```

**2. Or deploy:**
```bash
npm run build
# Or redeploy on Cloudflare
```

**3. Test:**
Visit app → Should connect to Supabase

---

## 🔍 Where Are These Used?

### **Supabase URL:**
- Connects app to database
- Used by: all Supabase queries
- Required for: login, data, storage

### **Supabase Anon Key:**
- Authenticates requests
- Used by: all Supabase calls
- Required for: all features

---

## 🛡️ Security Notes

**✅ Safe to commit to git:**
- .env file (already in .gitignore)
- Don't commit real keys

**✅ Safe in Cloudflare:**
- Environment variables are encrypted
- Only visible to you and your team

**⚠️ Don't expose:**
- Don't share keys publicly
- Don't put in code
- Don't commit to git

---

## ✅ Quick Checklist

**Setup:**
- [ ] Get Supabase credentials
- [ ] Add to .env file
- [ ] Add to Cloudflare
- [ ] Verify connection

**Next:**
- [ ] Run SQL migration (COPY_PASTE_READY.md)
- [ ] Upload documents (npm run upload-docs)
- [ ] Test app

---

**Need help? Run:** `.\scripts\setup-credentials.ps1`

