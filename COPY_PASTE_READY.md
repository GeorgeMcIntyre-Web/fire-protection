# 📋 Copy-Paste Ready SQL Migration

## Use This in Supabase SQL Editor

**Steps:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Click "New query"
5. Copy ALL the code below
6. Paste in SQL Editor
7. Click "Run" (or press Ctrl+Enter)

---

## SQL MIGRATION CODE (Copy All Below):

```sql
-- Document Management System for Fire Protection Tracker
-- Add this to your Supabase SQL Editor

-- Create document categories table
CREATE TABLE IF NOT EXISTS document_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the standard 9-category system
INSERT INTO document_categories (name, code, display_order, description) VALUES
  ('Appointments & Organograms', 'appointment', 1, 'Job roles, responsibilities, organograms'),
  ('Certificates', 'certificate', 2, 'ASIB, CoC, compliance certificates'),
  ('Checklists', 'checklist', 3, 'Quality control and safety checklists'),
  ('Forms & Templates', 'form', 4, 'Standardized operational forms'),
  ('Index & Registers', 'index', 5, 'Master document indexes'),
  ('Policies', 'policy', 6, 'Company policies and procedures'),
  ('Processes', 'process', 7, 'Workflow procedures and flow charts'),
  ('Reports', 'report', 8, 'Status and audit reports'),
  ('Work Instructions', 'work_instruction', 9, 'Step-by-step task instructions')
ON CONFLICT (code) DO NOTHING;

-- Create document library table
CREATE TABLE IF NOT EXISTS document_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document_code TEXT,
  category_id INTEGER REFERENCES document_categories(id),
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  version TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project documents junction table
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES document_library(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  UNIQUE(project_id, document_id)
);

-- Enable RLS
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_categories
CREATE POLICY IF NOT EXISTS "Users can view categories" ON document_categories FOR SELECT USING (true);

-- RLS Policies for document_library
CREATE POLICY IF NOT EXISTS "Users can view documents" ON document_library FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert documents" ON document_library FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Users can update documents" ON document_library FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Users can delete documents" ON document_library FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for project_documents
CREATE POLICY IF NOT EXISTS "Users can view project documents" ON project_documents FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can link documents to projects" ON project_documents FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Users can update project documents" ON project_documents FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Users can delete project documents" ON project_documents FOR DELETE USING (true);

-- Add updated_at trigger for document_library
CREATE TRIGGER IF NOT EXISTS update_document_library_updated_at 
  BEFORE UPDATE ON document_library 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_library_category ON document_library(category_id);
CREATE INDEX IF NOT EXISTS idx_document_library_code ON document_library(document_code);
CREATE INDEX IF NOT EXISTS idx_document_library_created_by ON document_library(created_by);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_document ON project_documents(document_id);

-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('company-documents', 'company-documents', true),
  ('project-documents', 'project-documents', true),
  ('forms', 'forms', true),
  ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-documents bucket
CREATE POLICY IF NOT EXISTS "Anyone can view company documents" ON storage.objects FOR SELECT 
  USING (bucket_id = 'company-documents');
CREATE POLICY IF NOT EXISTS "Authenticated users can upload documents" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'company-documents' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can update own documents" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'company-documents' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can delete own documents" ON storage.objects FOR DELETE 
  USING (bucket_id = 'company-documents' AND auth.role() = 'authenticated');
```

**After running:**
- Check Tables tab → Should see 3 new tables
- Check Storage tab → Should see 4 new buckets

✅ **Done!**

---

## NEXT: Upload Documents

After SQL migration runs successfully, come back here and I'll help you upload documents.

