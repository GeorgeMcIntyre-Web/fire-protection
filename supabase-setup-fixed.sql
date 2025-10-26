-- Fire Protection Tracker - Complete Database Setup (FIXED)
-- Run this entire script in your Supabase SQL Editor
-- This version removes the problematic auth.users line

-- ============================================
-- PART 1: MAIN DATABASE SETUP
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_logs table
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_documentation table
CREATE TABLE IF NOT EXISTS work_documentation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for work photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-photos', 'work-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_documentation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view all time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can insert time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can update own time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can view all work docs" ON work_documentation;
DROP POLICY IF EXISTS "Users can insert work docs" ON work_documentation;
DROP POLICY IF EXISTS "Users can update own work docs" ON work_documentation;
DROP POLICY IF EXISTS "Users can upload work photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view work photos" ON storage.objects;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can view all clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Users can insert clients" ON clients FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (auth.uid() = created_by);

-- Projects policies
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can insert projects" ON projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update projects" ON projects FOR UPDATE USING (auth.uid() = created_by);

-- Tasks policies
CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Time logs policies
CREATE POLICY "Users can view all time logs" ON time_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert time logs" ON time_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time logs" ON time_logs FOR UPDATE USING (auth.uid() = user_id);

-- Work documentation policies
CREATE POLICY "Users can view all work docs" ON work_documentation FOR SELECT USING (true);
CREATE POLICY "Users can insert work docs" ON work_documentation FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work docs" ON work_documentation FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Users can upload work photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'work-photos');
CREATE POLICY "Users can view work photos" ON storage.objects FOR SELECT USING (bucket_id = 'work-photos');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_time_logs_updated_at ON time_logs;
DROP TRIGGER IF EXISTS update_work_documentation_updated_at ON work_documentation;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_logs_updated_at BEFORE UPDATE ON time_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_documentation_updated_at BEFORE UPDATE ON work_documentation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- PART 2: DOCUMENT MANAGEMENT SYSTEM
-- ============================================

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view categories" ON document_categories;
DROP POLICY IF EXISTS "Users can view documents" ON document_library;
DROP POLICY IF EXISTS "Users can insert documents" ON document_library;
DROP POLICY IF EXISTS "Users can update documents" ON document_library;
DROP POLICY IF EXISTS "Users can delete documents" ON document_library;
DROP POLICY IF EXISTS "Users can view project documents" ON project_documents;
DROP POLICY IF EXISTS "Users can link documents to projects" ON project_documents;
DROP POLICY IF EXISTS "Users can update project documents" ON project_documents;
DROP POLICY IF EXISTS "Users can delete project documents" ON project_documents;
DROP POLICY IF EXISTS "Anyone can view company documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- RLS Policies for document_categories
CREATE POLICY "Users can view categories" ON document_categories FOR SELECT USING (true);

-- RLS Policies for document_library
CREATE POLICY "Users can view documents" ON document_library FOR SELECT USING (true);
CREATE POLICY "Users can insert documents" ON document_library FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update documents" ON document_library FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete documents" ON document_library FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for project_documents
CREATE POLICY "Users can view project documents" ON project_documents FOR SELECT USING (true);
CREATE POLICY "Users can link documents to projects" ON project_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update project documents" ON project_documents FOR UPDATE USING (true);
CREATE POLICY "Users can delete project documents" ON project_documents FOR DELETE USING (true);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_document_library_updated_at ON document_library;

-- Add updated_at trigger for document_library
CREATE TRIGGER update_document_library_updated_at
  BEFORE UPDATE ON document_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_document_library_category;
DROP INDEX IF EXISTS idx_document_library_code;
DROP INDEX IF EXISTS idx_document_library_created_by;
DROP INDEX IF EXISTS idx_project_documents_project;
DROP INDEX IF EXISTS idx_project_documents_document;

-- Create indexes for better performance
CREATE INDEX idx_document_library_category ON document_library(category_id);
CREATE INDEX idx_document_library_code ON document_library(document_code);
CREATE INDEX idx_document_library_created_by ON document_library(created_by);
CREATE INDEX idx_project_documents_project ON project_documents(project_id);
CREATE INDEX idx_project_documents_document ON project_documents(document_id);

-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public) VALUES
  ('company-documents', 'company-documents', true),
  ('project-documents', 'project-documents', true),
  ('forms', 'forms', true),
  ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-documents bucket
CREATE POLICY "Anyone can view company documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'company-documents');
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own documents" ON storage.objects FOR UPDATE
  USING (bucket_id = 'company-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'company-documents' AND auth.role() = 'authenticated');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
SELECT 'Setup completed successfully!' as message,
       'Tables created: 9' as tables,
       'Storage buckets: 5' as buckets,
       'Document categories: 9' as categories;
