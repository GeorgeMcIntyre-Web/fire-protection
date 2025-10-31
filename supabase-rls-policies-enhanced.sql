-- ============================================
-- ENHANCED ROW LEVEL SECURITY (RLS) POLICIES
-- Fire Protection Tracker - Production Ready
-- ============================================
--
-- This script creates hardened RLS policies with role-based access control.
--
-- ROLES:
-- - admin: Full access to all resources
-- - manager: Manage projects, clients, view team data
-- - technician: View assigned work, log time, update assigned tasks
-- - readonly: View-only access for reporting
--
-- IMPORTANT: Run this AFTER the main setup script.
-- This will DROP existing policies and create new hardened ones.
-- ============================================

-- ============================================
-- DROP EXISTING POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Clients policies
DROP POLICY IF EXISTS "Users can view all clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;

-- Projects policies
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;

-- Tasks policies
DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;

-- Time logs policies
DROP POLICY IF EXISTS "Users can view all time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can insert time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can update own time logs" ON time_logs;

-- Work documentation policies
DROP POLICY IF EXISTS "Users can view all work docs" ON work_documentation;
DROP POLICY IF EXISTS "Users can insert work docs" ON work_documentation;
DROP POLICY IF EXISTS "Users can update own work docs" ON work_documentation;

-- Document library policies
DROP POLICY IF EXISTS "Users can view documents" ON document_library;
DROP POLICY IF EXISTS "Users can insert documents" ON document_library;
DROP POLICY IF EXISTS "Users can update documents" ON document_library;
DROP POLICY IF EXISTS "Users can delete documents" ON document_library;

-- Project documents policies
DROP POLICY IF EXISTS "Users can view project documents" ON project_documents;
DROP POLICY IF EXISTS "Users can link documents to projects" ON project_documents;
DROP POLICY IF EXISTS "Users can update project documents" ON project_documents;
DROP POLICY IF EXISTS "Users can delete project documents" ON project_documents;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is manager or higher
CREATE OR REPLACE FUNCTION is_manager_or_higher(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is assigned to a task
CREATE OR REPLACE FUNCTION is_assigned_to_task(user_id UUID, task_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tasks 
    WHERE id = task_id AND assigned_to = user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user is assigned to a project (via tasks)
CREATE OR REPLACE FUNCTION is_assigned_to_project(user_id UUID, proj_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tasks 
    WHERE project_id = proj_id AND assigned_to = user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins and managers can view all profiles
CREATE POLICY "Admins and managers can view all profiles"
  ON profiles FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Only admins can change roles
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CLIENTS POLICIES
-- ============================================

-- Admins and managers can view all clients
CREATE POLICY "Admins and managers can view clients"
  ON clients FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can view clients (read-only for context)
CREATE POLICY "Technicians can view clients"
  ON clients FOR SELECT
  USING (get_user_role(auth.uid()) = 'technician');

-- Read-only users can view clients
CREATE POLICY "Readonly users can view clients"
  ON clients FOR SELECT
  USING (get_user_role(auth.uid()) = 'readonly');

-- Only admins and managers can insert clients
CREATE POLICY "Admins and managers can insert clients"
  ON clients FOR INSERT
  WITH CHECK (
    is_manager_or_higher(auth.uid())
    AND auth.uid() = created_by
  );

-- Only admins and managers can update clients
CREATE POLICY "Admins and managers can update clients"
  ON clients FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Only admins can delete clients
CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Admins and managers can view all projects
CREATE POLICY "Admins and managers can view all projects"
  ON projects FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can only view projects they're assigned to (via tasks)
CREATE POLICY "Technicians can view assigned projects"
  ON projects FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND is_assigned_to_project(auth.uid(), id)
  );

-- Read-only users can view all projects
CREATE POLICY "Readonly users can view all projects"
  ON projects FOR SELECT
  USING (get_user_role(auth.uid()) = 'readonly');

-- Only admins and managers can insert projects
CREATE POLICY "Admins and managers can insert projects"
  ON projects FOR INSERT
  WITH CHECK (
    is_manager_or_higher(auth.uid())
    AND auth.uid() = created_by
  );

-- Only admins and managers can update projects
CREATE POLICY "Admins and managers can update projects"
  ON projects FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Admins and managers can view all tasks
CREATE POLICY "Admins and managers can view all tasks"
  ON tasks FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can view tasks assigned to them
CREATE POLICY "Technicians can view assigned tasks"
  ON tasks FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND assigned_to = auth.uid()
  );

-- Read-only users can view all tasks
CREATE POLICY "Readonly users can view all tasks"
  ON tasks FOR SELECT
  USING (get_user_role(auth.uid()) = 'readonly');

-- Only admins and managers can insert tasks
CREATE POLICY "Admins and managers can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    is_manager_or_higher(auth.uid())
    AND auth.uid() = created_by
  );

-- Admins and managers can update any task
CREATE POLICY "Admins and managers can update tasks"
  ON tasks FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can update tasks assigned to them (status, progress)
CREATE POLICY "Technicians can update assigned tasks"
  ON tasks FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND assigned_to = auth.uid()
  );

-- Only admins can delete tasks
CREATE POLICY "Admins can delete tasks"
  ON tasks FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- TIME LOGS POLICIES
-- ============================================

-- Admins and managers can view all time logs
CREATE POLICY "Admins and managers can view all time logs"
  ON time_logs FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can view their own time logs
CREATE POLICY "Technicians can view own time logs"
  ON time_logs FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND user_id = auth.uid()
  );

-- Read-only users can view all time logs
CREATE POLICY "Readonly users can view all time logs"
  ON time_logs FOR SELECT
  USING (get_user_role(auth.uid()) = 'readonly');

-- Users can insert their own time logs
CREATE POLICY "Users can insert own time logs"
  ON time_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own time logs
CREATE POLICY "Users can update own time logs"
  ON time_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins and managers can update any time log (for corrections)
CREATE POLICY "Admins and managers can update any time log"
  ON time_logs FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Only admins can delete time logs
CREATE POLICY "Admins can delete time logs"
  ON time_logs FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- WORK DOCUMENTATION POLICIES
-- ============================================

-- Admins and managers can view all work docs
CREATE POLICY "Admins and managers can view all work docs"
  ON work_documentation FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can view their own work docs
CREATE POLICY "Technicians can view own work docs"
  ON work_documentation FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND user_id = auth.uid()
  );

-- Read-only users can view all work docs
CREATE POLICY "Readonly users can view all work docs"
  ON work_documentation FOR SELECT
  USING (get_user_role(auth.uid()) = 'readonly');

-- Users can insert their own work docs
CREATE POLICY "Users can insert own work docs"
  ON work_documentation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own work docs
CREATE POLICY "Users can update own work docs"
  ON work_documentation FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins and managers can update any work doc
CREATE POLICY "Admins and managers can update any work doc"
  ON work_documentation FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Only admins can delete work docs
CREATE POLICY "Admins can delete work docs"
  ON work_documentation FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- DOCUMENT LIBRARY POLICIES
-- ============================================

-- Everyone can view documents
CREATE POLICY "All users can view documents"
  ON document_library FOR SELECT
  USING (true);

-- Admins and managers can insert documents
CREATE POLICY "Admins and managers can insert documents"
  ON document_library FOR INSERT
  WITH CHECK (
    is_manager_or_higher(auth.uid())
    AND auth.uid() = created_by
  );

-- Admins and managers can update documents
CREATE POLICY "Admins and managers can update documents"
  ON document_library FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON document_library FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- DOCUMENT CATEGORIES POLICIES
-- ============================================

-- Everyone can view categories
CREATE POLICY "All users can view categories"
  ON document_categories FOR SELECT
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Admins can insert categories"
  ON document_categories FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON document_categories FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON document_categories FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PROJECT DOCUMENTS POLICIES
-- ============================================

-- Users can view project documents based on project access
CREATE POLICY "Users can view project documents based on project access"
  ON project_documents FOR SELECT
  USING (
    is_manager_or_higher(auth.uid())
    OR (
      get_user_role(auth.uid()) = 'technician'
      AND is_assigned_to_project(auth.uid(), project_id)
    )
    OR get_user_role(auth.uid()) = 'readonly'
  );

-- Admins and managers can link documents to projects
CREATE POLICY "Admins and managers can link documents"
  ON project_documents FOR INSERT
  WITH CHECK (
    is_manager_or_higher(auth.uid())
    AND auth.uid() = uploaded_by
  );

-- Admins and managers can update project documents
CREATE POLICY "Admins and managers can update project documents"
  ON project_documents FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Only admins can delete project documents
CREATE POLICY "Admins can delete project documents"
  ON project_documents FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- STORAGE POLICIES (Enhanced)
-- ============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload work photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view work photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Work photos bucket policies
CREATE POLICY "Authenticated users can upload work photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'work-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view work photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'work-photos');

CREATE POLICY "Users can update own work photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'work-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own work photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'work-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin(auth.uid())
    )
  );

-- Company documents bucket policies
CREATE POLICY "All users can view company documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-documents');

CREATE POLICY "Admins and managers can upload company documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-documents'
    AND is_manager_or_higher(auth.uid())
  );

CREATE POLICY "Admins and managers can update company documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-documents'
    AND is_manager_or_higher(auth.uid())
  );

CREATE POLICY "Admins can delete company documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-documents'
    AND is_admin(auth.uid())
  );

-- Project documents bucket policies
CREATE POLICY "Users can view project documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-documents');

CREATE POLICY "Admins and managers can upload project documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-documents'
    AND is_manager_or_higher(auth.uid())
  );

CREATE POLICY "Admins and managers can update project documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-documents'
    AND is_manager_or_higher(auth.uid())
  );

CREATE POLICY "Admins can delete project documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-documents'
    AND is_admin(auth.uid())
  );

-- ============================================
-- AUDIT LOG (Optional Enhancement)
-- ============================================

-- Create audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_log FOR SELECT
  USING (is_admin(auth.uid()));

-- System can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- AUDIT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_clients ON clients;
CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- 
-- Your database now has:
-- ✅ Enhanced RLS policies with role-based access control
-- ✅ Helper functions for permission checking
-- ✅ Audit logging for sensitive operations
-- ✅ Hardened storage policies
-- 
-- Next steps:
-- 1. Test each role's access levels
-- 2. Review audit logs regularly
-- 3. Monitor for unauthorized access attempts
-- ============================================
