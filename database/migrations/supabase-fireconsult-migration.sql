-- Fire Consultancy Module Database Migration
-- Run this script in your Supabase SQL Editor
-- This creates all tables for the FireConsult add-on module

-- ============================================
-- 1. ENGINEERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  registration_number TEXT, -- Professional registration (e.g., ECSA)
  hourly_rate NUMERIC(10, 2), -- For billing calculations
  consultant_split_percentage NUMERIC(5, 2) DEFAULT 90.00, -- Default 90/10 split
  engineer_split_percentage NUMERIC(5, 2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_split_total CHECK (consultant_split_percentage + engineer_split_percentage = 100.00)
);

-- ============================================
-- 2. ACCREDITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.accreditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES public.engineers(id) ON DELETE CASCADE,
  accreditation_type TEXT NOT NULL CHECK (accreditation_type IN ('ASIB', 'SAQCC', 'SABS', 'ECSA', 'OTHER')),
  certificate_number TEXT NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_authority TEXT,
  document_url TEXT, -- Link to uploaded certificate
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_expiry_after_issue CHECK (expiry_date > issued_date)
);

-- ============================================
-- 3. FIRE CONSULT JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.fire_consult_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL, -- Link to main project if exists
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  job_number TEXT NOT NULL UNIQUE, -- e.g., "FC-2025-001"
  site_name TEXT NOT NULL,
  site_address TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Job Status
  status TEXT NOT NULL DEFAULT 'site_visit' CHECK (status IN (
    'site_visit',           -- Initial site assessment
    'data_collection',      -- Gathering site metadata
    'design_request',       -- Design request sent to engineer
    'engineer_review',      -- Engineer reviewing/calculating
    'design_complete',      -- Engineer signed off
    'billing',              -- Invoicing phase
    'completed',            -- Job fully complete
    'cancelled'             -- Job cancelled
  )),
  
  -- Consultant Info
  consultant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_engineer_id UUID REFERENCES public.engineers(id) ON DELETE SET NULL,
  
  -- Site Assessment Data
  site_visit_date DATE,
  floor_plan_url TEXT, -- Link to uploaded floor plan
  site_photos_urls TEXT[], -- Array of photo URLs
  
  -- Storage Hazard Factors
  commodity_class TEXT CHECK (commodity_class IN ('Class I', 'Class II', 'Class III', 'Class IV', 'Group A Plastics', 'Group B Plastics', 'Group C Plastics')),
  storage_method TEXT CHECK (storage_method IN ('floor_stack', 'palletized', 'racked', 'shelving', 'mixed')),
  storage_height_m NUMERIC(5, 2), -- Storage height in meters
  ceiling_height_m NUMERIC(5, 2), -- Ceiling height in meters
  flue_spacing_m NUMERIC(5, 2), -- Flue spacing for racked storage (if applicable)
  sprinkler_strategy TEXT CHECK (sprinkler_strategy IN ('ceiling_only', 'in_rack', 'combined', 'esfr', 'cmsa', 'cmda')),
  
  -- Design Parameters (Baseline assumptions - engineer may adjust)
  design_density_mm_per_min NUMERIC(5, 2), -- 5-30 mm/min
  design_area_m2 NUMERIC(6, 2), -- 140-465 m²
  estimated_sprinkler_count INTEGER,
  sprinkler_spacing_m2 NUMERIC(5, 2), -- ~9-12 m² per head for light hazard
  
  -- Water Supply Data
  municipal_pressure_bar NUMERIC(5, 2), -- Typically 3.5-4 bar
  municipal_flow_lpm NUMERIC(8, 2), -- Liters per minute
  requires_tank BOOLEAN DEFAULT true,
  requires_pump BOOLEAN DEFAULT true,
  estimated_flow_required_lpm NUMERIC(8, 2),
  estimated_tank_size_m3 NUMERIC(8, 2), -- Calculated: (Flow × Duration) / 1000
  estimated_duration_minutes INTEGER DEFAULT 60, -- 60-120 min typical
  pump_type TEXT CHECK (pump_type IN ('diesel', 'electric', 'jockey', 'none')),
  
  -- Pricing
  design_fee_per_head NUMERIC(8, 2), -- R120-180 per head
  total_design_fee NUMERIC(12, 2), -- Calculated: design_fee_per_head × estimated_sprinkler_count
  engineer_fee_amount NUMERIC(12, 2), -- 10% of total design fee
  consultant_fee_amount NUMERIC(12, 2), -- 90% of total design fee
  
  -- Dates
  design_request_sent_at TIMESTAMPTZ,
  design_completed_at TIMESTAMPTZ,
  due_date DATE,
  
  -- Notes
  site_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. DESIGN REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.design_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.fire_consult_jobs(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES public.engineers(id) ON DELETE RESTRICT,
  
  -- Request Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Request sent, awaiting engineer
    'acknowledged',      -- Engineer acknowledged receipt
    'in_progress',       -- Engineer working on calculations
    'review_required',   -- Engineer needs clarification
    'completed',         -- Design complete, signed off
    'rejected'           -- Engineer rejected (with reason)
  )),
  
  -- Request Details
  request_pdf_url TEXT, -- Generated PDF with site metadata
  request_sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Engineer Response
  signed_fire_plan_url TEXT, -- Uploaded signed fire plan
  hydraulic_calc_file_url TEXT, -- AutoSPRINK/HydraCALC file
  engineer_notes TEXT,
  rejection_reason TEXT,
  
  -- Final Design Parameters (as calculated by engineer)
  final_density_mm_per_min NUMERIC(5, 2),
  final_design_area_m2 NUMERIC(6, 2),
  final_sprinkler_count INTEGER,
  final_flow_required_lpm NUMERIC(8, 2),
  final_tank_size_m3 NUMERIC(8, 2),
  final_pump_specs TEXT, -- JSON or text description
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. BILLING SPLITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.billing_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL UNIQUE REFERENCES public.fire_consult_jobs(id) ON DELETE CASCADE,
  design_request_id UUID REFERENCES public.design_requests(id) ON DELETE SET NULL,
  
  -- Financial Details
  total_design_fee NUMERIC(12, 2) NOT NULL,
  consultant_percentage NUMERIC(5, 2) NOT NULL DEFAULT 90.00,
  engineer_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  consultant_amount NUMERIC(12, 2) NOT NULL,
  engineer_amount NUMERIC(12, 2) NOT NULL,
  
  -- Payment Status
  consultant_paid BOOLEAN DEFAULT false,
  engineer_paid BOOLEAN DEFAULT false,
  consultant_paid_at TIMESTAMPTZ,
  engineer_paid_at TIMESTAMPTZ,
  
  -- Invoice References
  consultant_invoice_number TEXT,
  engineer_invoice_number TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_split_total CHECK (consultant_percentage + engineer_percentage = 100.00),
  CONSTRAINT chk_amounts_match CHECK (consultant_amount + engineer_amount = total_design_fee)
);

-- ============================================
-- 6. FIRE SYSTEMS TABLE (Detailed system specs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.fire_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.fire_consult_jobs(id) ON DELETE CASCADE,
  
  -- System Type
  system_type TEXT NOT NULL CHECK (system_type IN (
    'sprinkler_wet', 'sprinkler_dry', 'sprinkler_preaction', 
    'sprinkler_deluge', 'hydrant', 'hose_reel', 'combined'
  )),
  
  -- System Specifications
  total_sprinkler_heads INTEGER,
  total_hydrant_outlets INTEGER,
  total_hose_reel_outlets INTEGER,
  pipe_material TEXT, -- Steel, CPVC, etc.
  pipe_diameter_mm TEXT, -- Main sizes
  
  -- Water Supply
  tank_capacity_m3 NUMERIC(8, 2),
  pump_capacity_lpm NUMERIC(8, 2),
  pump_pressure_bar NUMERIC(5, 2),
  pump_type TEXT,
  jockey_pump_capacity_lpm NUMERIC(8, 2),
  
  -- Design Parameters
  design_density_mm_per_min NUMERIC(5, 2),
  design_area_m2 NUMERIC(6, 2),
  operating_pressure_bar NUMERIC(5, 2),
  
  -- Compliance
  asib_approval_number TEXT,
  asib_approval_date DATE,
  compliance_standard TEXT, -- SANS 10252, NFPA 13, etc.
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fire_consult_jobs_status ON public.fire_consult_jobs(status);
CREATE INDEX IF NOT EXISTS idx_fire_consult_jobs_consultant ON public.fire_consult_jobs(consultant_id);
CREATE INDEX IF NOT EXISTS idx_fire_consult_jobs_engineer ON public.fire_consult_jobs(assigned_engineer_id);
CREATE INDEX IF NOT EXISTS idx_fire_consult_jobs_client ON public.fire_consult_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_design_requests_job ON public.design_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_design_requests_engineer ON public.design_requests(engineer_id);
CREATE INDEX IF NOT EXISTS idx_design_requests_status ON public.design_requests(status);
CREATE INDEX IF NOT EXISTS idx_accreditations_engineer ON public.accreditations(engineer_id);
CREATE INDEX IF NOT EXISTS idx_accreditations_expiry ON public.accreditations(expiry_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_billing_splits_job ON public.billing_splits(job_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accreditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_consult_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_systems ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Engineers (readable by all authenticated users, editable by admins/managers)
CREATE POLICY "Engineers are viewable by authenticated users" ON public.engineers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Engineers are editable by admins and managers" ON public.engineers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- RLS Policies: Accreditations (viewable by all, editable by admins/managers)
CREATE POLICY "Accreditations are viewable by authenticated users" ON public.accreditations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Accreditations are editable by admins and managers" ON public.accreditations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- RLS Policies: Fire Consult Jobs (users can see their own jobs, admins/managers see all)
CREATE POLICY "Users can view their own fire consult jobs" ON public.fire_consult_jobs
  FOR SELECT USING (
    consultant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create fire consult jobs" ON public.fire_consult_jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own fire consult jobs" ON public.fire_consult_jobs
  FOR UPDATE USING (
    consultant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- RLS Policies: Design Requests (similar to jobs)
CREATE POLICY "Users can view design requests for their jobs" ON public.design_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = design_requests.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

CREATE POLICY "Users can create design requests" ON public.design_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update design requests for their jobs" ON public.design_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = design_requests.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

-- RLS Policies: Billing Splits (similar to jobs)
CREATE POLICY "Users can view billing splits for their jobs" ON public.billing_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = billing_splits.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

CREATE POLICY "Users can create billing splits" ON public.billing_splits
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update billing splits for their jobs" ON public.billing_splits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = billing_splits.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

-- RLS Policies: Fire Systems (similar to jobs)
CREATE POLICY "Users can view fire systems for their jobs" ON public.fire_systems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = fire_systems.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

CREATE POLICY "Users can manage fire systems for their jobs" ON public.fire_systems
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = fire_systems.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-generate job numbers
CREATE OR REPLACE FUNCTION generate_fire_consult_job_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  job_num TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.fire_consult_jobs
  WHERE job_number LIKE 'FC-' || year_part || '-%';
  
  job_num := 'FC-' || year_part || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN job_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate job number if not provided
CREATE OR REPLACE FUNCTION set_fire_consult_job_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_fire_consult_job_number();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_fire_consult_job_number
  BEFORE INSERT OR UPDATE ON public.fire_consult_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_fire_consult_job_number();

-- Function to calculate billing splits when job is updated
CREATE OR REPLACE FUNCTION calculate_fire_consult_billing()
RETURNS TRIGGER AS $$
DECLARE
  consultant_pct NUMERIC;
  engineer_pct NUMERIC;
  consultant_amt NUMERIC;
  engineer_amt NUMERIC;
BEGIN
  -- Only calculate if design is complete and we have fee data
  IF NEW.status = 'design_complete' AND NEW.total_design_fee IS NOT NULL AND NEW.total_design_fee > 0 THEN
    -- Get split percentages from engineer or use defaults
    SELECT 
      COALESCE(consultant_split_percentage, 90.00),
      COALESCE(engineer_split_percentage, 10.00)
    INTO consultant_pct, engineer_pct
    FROM public.engineers
    WHERE id = NEW.assigned_engineer_id;
    
    -- Default to 90/10 if engineer not found
    consultant_pct := COALESCE(consultant_pct, 90.00);
    engineer_pct := COALESCE(engineer_pct, 10.00);
    
    consultant_amt := (NEW.total_design_fee * consultant_pct / 100.00);
    engineer_amt := (NEW.total_design_fee * engineer_pct / 100.00);
    
    -- Update or create billing split
    INSERT INTO public.billing_splits (
      job_id,
      total_design_fee,
      consultant_percentage,
      engineer_percentage,
      consultant_amount,
      engineer_amount
    ) VALUES (
      NEW.id,
      NEW.total_design_fee,
      consultant_pct,
      engineer_pct,
      consultant_amt,
      engineer_amt
    )
    ON CONFLICT (job_id) DO UPDATE SET
      total_design_fee = NEW.total_design_fee,
      consultant_percentage = consultant_pct,
      engineer_percentage = engineer_pct,
      consultant_amount = consultant_amt,
      engineer_amount = engineer_amt,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_fire_consult_billing
  AFTER UPDATE ON public.fire_consult_jobs
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.total_design_fee IS DISTINCT FROM NEW.total_design_fee)
  EXECUTE FUNCTION calculate_fire_consult_billing();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER trigger_engineers_updated_at
  BEFORE UPDATE ON public.engineers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_accreditations_updated_at
  BEFORE UPDATE ON public.accreditations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_fire_consult_jobs_updated_at
  BEFORE UPDATE ON public.fire_consult_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_design_requests_updated_at
  BEFORE UPDATE ON public.design_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_billing_splits_updated_at
  BEFORE UPDATE ON public.billing_splits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_fire_systems_updated_at
  BEFORE UPDATE ON public.fire_systems
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

