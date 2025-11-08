# 🚀 Complete Setup Guide - FireGuard Pro

This guide will walk you through setting up everything for production.

---

## 📋 **Step 1: Environment Variables in Cloudflare**

### **A. Get Your Supabase Credentials**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### **B. Add to Cloudflare Pages**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to: **Workers & Pages** → **fire-protection-tracker**
3. Click **Settings** tab
4. Scroll to **Environment Variables**
5. For **Production**, click **Add variable** and add:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co` (your Project URL)

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJ...` (your anon public key)

6. Click **Save**
7. Go to **Deployments** tab
8. Click **Retry deployment** on the latest deployment (or wait for auto-redeploy)

✅ **Done!** Your app will now connect to Supabase.

---

## 📋 **Step 2: Database Setup**

### **A. Run Database Migration**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**
5. Open the file `supabase-complete-setup.sql` from this repo
6. Copy the **entire** contents
7. Paste into the SQL Editor
8. Click **Run** (or press Ctrl+Enter)
9. Wait for "Success. No rows returned" message
10. Verify tables were created:
    - Go to **Table Editor**
    - You should see these tables:
      - `profiles`
      - `projects`
      - `tasks`
      - `clients`
      - `time_logs`
      - `work_documentation`
      - `document_library` (or `documents`)
      - `document_categories`
      - `project_documents`

✅ **Done!** Database structure is ready.

---

## 📋 **Step 3: Storage Buckets Setup**

### **A. Create Storage Buckets**

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **Create bucket**
3. Create these buckets one by one:

   **Bucket 1: `company-documents`**
   - Name: `company-documents`
   - Public bucket: ✅ **Yes** (checked)
   - File size limit: `52428800` (50MB)
   - Click **Create bucket**

   **Bucket 2: `project-documents`** (optional but recommended)
   - Name: `project-documents`
   - Public bucket: ✅ **Yes**
   - File size limit: `52428800` (50MB)
   - Click **Create bucket**

4. For each bucket, set **Storage Policies**:
   - Click on the bucket name
   - Go to **Policies** tab
   - The SQL migration should have created policies, but verify:
     - **Public read access** should be enabled
     - **Authenticated write access** should be enabled

✅ **Done!** Storage is ready for document uploads.

---

## 📋 **Step 4: Domain Setup (Optional but Recommended)**

### **A. Register Domain**

1. Go to [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or your preferred registrar
2. Search for and register: `fireguardpro.com` (or your preferred domain)
3. If using Cloudflare Registrar:
   - Domain is automatically added to your account
   - Go to step B
   
4. If using another registrar:
   - You'll need to transfer DNS to Cloudflare or use Cloudflare nameservers

### **B. Connect Domain to Cloudflare Pages**

1. Go to Cloudflare Dashboard → **Workers & Pages** → **fire-protection-tracker**
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter your domain: `fireguardpro.com` (or your domain)
5. Click **Continue**
6. Follow the DNS setup instructions
7. Cloudflare will automatically provision SSL certificate (~5 minutes)
8. Wait for status to show "Active" ✅

✅ **Done!** Your app is now accessible at your custom domain.

---

## 📋 **Step 5: Upload Documents**

### **A. Prepare Documents**

1. Create a folder with your documents to upload (optional)
2. Documents should be in common formats: PDF, DOC, DOCX, etc.

### **B. Run Upload Script**

**Option 1: If you have documents in a folder:**
```bash
# Set your Supabase credentials locally (temporarily)
export SUPABASE_URL="https://xxxxx.supabase.co"
export SUPABASE_ANON_KEY="eyJ..."

# Run upload script
npm run upload-docs
```

**Option 2: Manual upload via app:**
1. Sign in to your app
2. Go to **Documents** page
3. Click **Upload Document**
4. Select file(s) and upload

✅ **Done!** Documents are now in your document library.

---

## 📋 **Step 6: Test Everything**

### **A. Test Authentication**

1. Go to your app URL
2. Click **Register**
3. Create a test account
4. Verify email (if email verification is enabled)
5. Sign in
6. ✅ Should see dashboard

### **B. Test Core Features**

**Create a Project:**
1. Go to **Projects** page
2. Click **New Project**
3. Fill in details and create
4. ✅ Project appears in list

**Add Tasks:**
1. Open the project
2. Click **Add Task**
3. Create a task
4. ✅ Task appears in project

**Log Time:**
1. Go to **Time Tracking**
2. Start a timer or log time manually
3. ✅ Time entry saved

**Upload Document:**
1. Go to **Documents**
2. Upload a test document
3. ✅ Document appears in library

**Test Dashboard:**
1. Go to **Dashboard**
2. ✅ Should show stats and summaries

✅ **Done!** All features working.

---

## 📋 **Step 7: Production Health Check**

Run the health check script:

```bash
npm run health-check
```

This will verify:
- ✅ Environment variables are set
- ✅ Supabase connection works
- ✅ Database tables exist
- ✅ Storage buckets exist
- ✅ Authentication works

Fix any issues reported.

---

## 🎉 **Setup Complete!**

Your FireGuard Pro app is now fully configured and ready for production use!

### **Quick Links:**
- **App URL:** https://fireguardpro.com (or your domain)
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Cloudflare Dashboard:** https://dash.cloudflare.com

### **Next Steps:**
- Create your first real project
- Invite team members (if multi-user features are ready)
- Customize branding (if needed)
- Set up email notifications (optional)

---

## 🆘 **Troubleshooting**

### **"Can't connect to Supabase"**
- Check environment variables in Cloudflare Pages
- Verify Supabase URL and key are correct
- Make sure you redeployed after adding variables

### **"Tables don't exist"**
- Run the SQL migration script again
- Check SQL Editor for errors
- Verify you're in the correct Supabase project

### **"Can't upload documents"**
- Verify storage buckets exist
- Check bucket policies allow authenticated uploads
- Verify file size is under limit (50MB default)

### **"Domain not working"**
- Check DNS settings in Cloudflare
- Wait for SSL certificate (can take 5-10 minutes)
- Verify domain is pointed to Cloudflare Pages

---

**Need help?** Check the other documentation files or review the error messages for specific guidance.



