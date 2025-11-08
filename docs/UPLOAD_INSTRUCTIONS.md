# Document Upload Instructions

Hi Quinten! Here's how to upload all your documents to Supabase.

## 📋 Prerequisites

1. **Make sure you've run the SQL migration** (`supabase-documents.sql`)
2. **Have your Supabase credentials** in `.env` file

## 🚀 Upload Steps

### Step 1: Run the SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the sidebar
4. Open the file: `supabase-documents.sql`
5. Copy the entire contents
6. Paste into SQL Editor
7. Click "Run"

This creates:
- Document categories
- Document library table
- Storage buckets
- Security policies

### Step 2: Upload Documents

Run this command:

```bash
npm run upload-docs
```

This will:
- Scan `FirePm/QuintensDocs/` directory
- Upload all PDF, DOCX, XLSX files
- Parse document codes (CFM-OPS-FRM-004, etc.)
- Extract versions (Rev 14, etc.)
- Categorize documents automatically
- Create database records

### Step 3: Verify Upload

1. Open your app: `npm run dev`
2. Go to "Work Documentation" page
3. Click "Company Documents" tab
4. You should see all your documents!

## 📊 What Gets Uploaded

The script will upload:

✅ **Forms** - Work Appointment Schedules, Site File Requests, etc.  
✅ **Processes** - Operations Process, Quality Management Process  
✅ **QCPs** - All 7 Quality Control Plans  
✅ **Checklists** - Pressure Test, Valve Overhaul, ASIB Pre-inspection  
✅ **Certificates** - C.o.C. templates  
✅ **Work Instructions** - Minor Works Process  
✅ **Training Materials** - Project Management guides  
✅ **Templates** - Quote, Variation, Weekly Planner templates  
✅ **Reference** - ASIB Rule Book, SKM materials

## 🔍 Auto-Categorization

The script automatically categorizes documents by their code:

- **CFM-OPS-FRM-*** → Forms & Templates (Category 4)
- **CFM-OPS-PRO-*** → Processes (Category 7)  
- **CFM-QUA-FRM-*** → Forms & Templates (Category 4)
- **CFM-QAM-CKL-*** → Checklists (Category 3)
- **CFM-QAM-CER-*** → Certificates (Category 2)
- **CFM-OPS-WKI-*** → Work Instructions (Category 9)
- **CFM-HR-FRM-*** → Forms & Templates (Category 4)
- **CFM-FIN-FRM-*** → Forms & Templates (Category 4)
- **CFM-SHE-FRM-*** → Forms & Templates (Category 4)
- **CFM-DES-FRM-*** → Forms & Templates (Category 4)

And extracts:
- Document code (e.g., "CFM-OPS-FRM-004")
- Version (e.g., "Rev 14")
- Clean name (without code and version)

## 🐛 Troubleshooting

### "Missing Supabase credentials"
Make sure your `.env` file has:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### "No documents found"
Check that the path exists:
```
C:\Users\George\source\repos\FirePm\QuintensDocs
```

### "Permission denied"
Make sure you have read access to the QuintensDocs folder.

### "Upload failed"
- Check file size (should be under 50MB)
- Make sure storage bucket `company-documents` exists
- Verify RLS policies are set

## ✅ After Upload

Your documents will be:
- ✅ Stored in Supabase Storage
- ✅ Indexed in the database
- ✅ Searchable by name/code
- ✅ Filterable by category
- ✅ Accessible from the app

## 📝 Next Steps

After uploading:
1. Test the Document Library in the app
2. Link documents to projects as needed
3. Use documents in your workflows

## 🎯 Tips

- Documents are organized by folder structure
- Document codes (CFM-OPS-FRM-004) are preserved
- Versions are tracked (Rev 14, Rev 15)
- Search works across all documents

**Need help? Just let me know!** 🚀

