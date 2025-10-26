# Document Upload & Integration Plan - For Quinten

Hi Quinten! Here's how we'll get your documents from the old company server into your fire protection app.

## 📋 What You Have

### **Process Documents:**
- CFM-OPS-PRO-001 - Operations Process (Rev 13)
- CFM-OPS-PRO-002 - Operations Process Flow Chart (Rev 8)  
- CFM-QAM-PRO-001 - Quality Management Plan (Rev 3)

### **Quality Control Documents (QCPs):**
- CFM-QUA-FRM-001 - Cross Fire Quality Management Plan
- CFM-QUA-FRM-002 - Project QCP
- CFM-QUA-FRM-003 - Design QCP
- CFM-QUA-FRM-004 - Fabrication QCP
- CFM-QUA-FRM-005 - Installation QCP
- CFM-QUA-FRM-006 - Testing QCP
- CFM-QUA-FRM-007 - Commissioning QCP

### **Forms:**
- Work Appointment Schedules (CFM-OPS-FRM-004)
- Payment Valuations (CFM-QAM-FRM-021)
- Site File Requests (CFM-QAM-FRM-001, CFM-SHE-FRM-001)
- Travel Requests (CFM-QAM-FRM-018)
- Purchase Orders (CFM-FIN-FRM-005)
- Expense Claims (CFM-HR-FRM-020)
- ASIB Inspection Requests (CFM-DES-FRM-003)

### **Checklists:**
- Alarm Valve Overhaul Checklist
- Pressure Test Checklist (CFM-QAM-CKL-002)
- ASIB Pre-inspection Checklist (CFM-QAM-CKL-003)

### **Certificates:**
- C.o.C. Valve Overhaul (CFM-QAM-CER-002)
- And more compliance certificates

### **Training Documents:**
- ASIB Sprinkler Site Guide for Project Managers
- Basic Project Management Training
- General Project Management
- How to Snag a Project
- OPS Basic Project Management
- Project Management Routines
- PM Coaching Process

### **ASIB Reference:**
- 2024 ASIB Rule Book (Your bible for fire protection regulations)

---

## 🎯 Integration Strategy

### **Step 1: Organize by 9-Category System**

Your documents will be organized into:

1. **Appointments** → Job roles, organograms
2. **Certificates** → ASIB, CoC, compliance docs
3. **Checklists** → Quality control checklists
4. **Forms & Templates** → All CFM-FRM documents
5. **Index & Registers** → Master index
6. **Policies** → Company policies
7. **Processes** → All CFM-PRO documents
8. **Reports** → Weekly reports, progress reports
9. **Work Instructions** → All CFM-WKI documents

### **Step 2: Upload to Supabase Storage**

Create buckets:
- `documents` - General company documents
- `forms` - Form templates
- `processes` - Process documents
- `checklists` - Quality control checklists
- `training` - Training materials
- `certificates` - Certificate templates

### **Step 3: Database Integration**

Create tables to track documents:
```sql
CREATE TABLE document_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  display_order INTEGER
);

CREATE TABLE document_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_code TEXT, -- e.g., "CFM-OPS-FRM-004"
  category_id INTEGER REFERENCES document_categories(id),
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  version TEXT, -- e.g., "Rev 14"
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES document_library(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- active, archived
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, document_id)
);
```

### **Step 4: Build UI**

Enhanced WorkDocsPage with:
- **Folder Tree View** - Navigate by category
- **Search & Filter** - Find documents quickly
- **Version Control** - Track document revisions
- **Link to Projects** - Attach docs to projects
- **Upload/Download** - Easy file management

### **Step 5: Workflow Integration**

When creating a project:
1. Select a template → Auto-generate project
2. System suggests relevant documents from library
3. Attach documents to project
4. Generate forms auto-populated with project data
5. Complete checklists as work progresses
6. Generate certificates when work complete

---

## 🚀 Implementation Steps

### **Phase 1: Setup (Today)**

1. **Add document tables to Supabase**
   ```bash
   # Run these SQL commands in Supabase SQL Editor
   ```

2. **Create document upload script**
   - Batch upload from your local files
   - Auto-categorize by file name/code
   - Create database records

### **Phase 2: Upload Documents (This Week)**

3. **Upload process documents**
   - All CFM-PRO documents
   - Operations processes
   - Quality management plans

4. **Upload QCPs**
   - All 7 Quality Control Plans
   - Link to project phases

5. **Upload forms**
   - Convert to digital versions
   - Or keep as PDF templates

6. **Upload training materials**
   - Project management guides
   - ASIB reference materials
   - Training PDFs

### **Phase 3: Integration (Next Week)**

7. **Build document library UI**
   - Folder tree navigation
   - Search functionality
   - Document details view

8. **Link to projects**
   - Attach documents when creating project
   - Auto-suggest relevant docs
   - Track usage per project

9. **Workflow automation**
   - Auto-generate project with relevant docs
   - Complete checklists as tasks done
   - Generate certificates when project complete

---

## 💡 Key Features You'll Get

### **1. Document Library**
```
📁 Company Documents
├── 📁 Processes
│   ├── Operations Process (Rev 13)
│   ├── Operations Flow Chart
│   └── Quality Management Plan
├── 📁 Quality Control Plans
│   ├── Project QCP
│   ├── Design QCP
│   ├── Installation QCP
│   └── Commissioning QCP
├── 📁 Forms
│   ├── Work Appointment Schedule
│   ├── Payment Valuation
│   ├── Site File Request
│   └── ASIB Inspection Request
├── 📁 Checklists
│   ├── Pressure Test Checklist
│   ├── Valve Overhaul Checklist
│   └── ASIB Pre-inspection Checklist
└── 📁 Training
    ├── ASIB Rule Book
    ├── Project Management Training
    └── PM Guides
```

### **2. Project Integration**
When you create a project:
- **View relevant documents** for this project type
- **Attach forms** - pre-populate with project info
- **Use checklists** - complete as you work
- **Generate certificates** - automatic when complete

### **3. Smart Suggestions**
- "You're installing sprinklers → Here's the Installation QCP"
- "You're doing pressure testing → Here's the Pressure Test Checklist"
- "Project complete → Generate Certificate of Compliance"

### **4. Version Control**
- Track document revisions (Rev 14, Rev 15, etc.)
- See which version was used on which project
- Never lose old revisions

---

## 📋 Next Steps

**I can start by:**

1. **Creating the database schema** (document tables)
2. **Building the document upload UI**
3. **Creating an upload script** to batch import your files
4. **Enhancing WorkDocsPage** with folder navigation
5. **Creating workflow templates** from your processes

**Which one should I start with?**

Let me know and I'll build it for you!

---

## 🎯 End Goal

You want to:
- ✅ Have all your company documents in one place
- ✅ Attach relevant documents to projects
- ✅ Use forms/checklists during project execution
- ✅ Track compliance and certifications
- ✅ Streamline your processes with automation

**I can make this happen!** 🚀

Which part should I build first?

