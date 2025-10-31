-- Supabase Production Migration (Idempotent)
-- Run safely multiple times. Includes tables, constraints, indexes, and storage setup.
-- NOTE: Requires Postgres 13+ (CREATE INDEX IF NOT EXISTS supported). Supabase meets this.

-- 0) Enable RLS on auth schema (safe if repeated)
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- 1) Core tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin','manager','technician')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE
);

CREATE TABLE IF NOT EXISTS public.time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_time_range CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.work_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE IF NOT EXISTS public.document_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_library (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  document_code TEXT,
  version TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category_id INTEGER REFERENCES public.document_categories(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_documents (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id BIGINT NOT NULL REFERENCES public.document_library(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- (Optionally, policies would be added here. Keep simple permissive policies for now, rely on app/service role for writes.)

-- 3) Indexes for performance and FK support (idempotent)
-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- Time logs
CREATE INDEX IF NOT EXISTS idx_time_logs_project_id ON public.time_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON public.time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON public.time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_start_time ON public.time_logs(start_time);

-- Work documentation
CREATE INDEX IF NOT EXISTS idx_work_docs_project_id ON public.work_documentation(project_id);
CREATE INDEX IF NOT EXISTS idx_work_docs_task_id ON public.work_documentation(task_id);
CREATE INDEX IF NOT EXISTS idx_work_docs_user_id ON public.work_documentation(user_id);
CREATE INDEX IF NOT EXISTS idx_work_docs_created_at ON public.work_documentation(created_at);

-- Documents
CREATE INDEX IF NOT EXISTS idx_document_library_category_id ON public.document_library(category_id);
CREATE INDEX IF NOT EXISTS idx_document_library_created_at ON public.document_library(created_at);
CREATE INDEX IF NOT EXISTS idx_document_library_created_by ON public.document_library(created_by);

CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON public.project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_document_id ON public.project_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_by ON public.project_documents(uploaded_by);

-- 4) Storage: bucket and policies (idempotent)
-- Ensure extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'company-documents'
  ) THEN
    PERFORM storage.create_bucket('company-documents', public := true);
  END IF;
END$$;

-- Policies: allow read for all (public bucket already exposes), write only for authenticated users
-- Clean existing policies with same names
DO $$ BEGIN
  DELETE FROM storage.policies WHERE name IN (
    'Allow authenticated uploads to company-documents'
  ) AND bucket_id = 'company-documents';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Write policy
INSERT INTO storage.policies (name, bucket_id, definition, allowed_operations)
SELECT 'Allow authenticated uploads to company-documents', 'company-documents', '(
  (SELECT auth.role()) = ''authenticated''
)', ARRAY['insert','update','delete']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies WHERE name = 'Allow authenticated uploads to company-documents' AND bucket_id = 'company-documents'
);

-- 5) Helpful views (optional, idempotent)
CREATE OR REPLACE VIEW public.v_project_summary AS
SELECT p.id AS project_id,
       p.name AS project_name,
       p.status,
       COUNT(t.id) AS num_tasks,
       SUM(CASE WHEN t.status='completed' THEN 1 ELSE 0 END) AS completed_tasks,
       MIN(t.due_date) AS earliest_due_date
FROM public.projects p
LEFT JOIN public.tasks t ON t.project_id = p.id
GROUP BY p.id;

-- 6) Updated timestamps triggers (optional)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Attach triggers where updated_at exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
    CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
    CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='time_logs' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS trg_time_logs_updated_at ON public.time_logs;
    CREATE TRIGGER trg_time_logs_updated_at BEFORE UPDATE ON public.time_logs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='work_documentation' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS trg_work_docs_updated_at ON public.work_documentation;
    CREATE TRIGGER trg_work_docs_updated_at BEFORE UPDATE ON public.work_documentation FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- End of migration
