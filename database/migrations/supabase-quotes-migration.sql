-- Quotes Table Migration for Fire Consultancy Module
-- Run this after the main fireconsult migration

-- ============================================
-- QUOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.fire_consult_jobs(id) ON DELETE CASCADE,
  
  -- Quote Details
  quote_number TEXT NOT NULL UNIQUE, -- e.g., "QT-2025-001"
  quote_type TEXT NOT NULL CHECK (quote_type IN ('design_only', 'full_installation')),
  
  -- Pricing
  sprinkler_count INTEGER NOT NULL,
  hazard_category TEXT NOT NULL, -- OH, HH1, HH2, HH3, HH4
  custom_margin_percent NUMERIC(5, 2), -- Optional override
  
  -- Cost Breakdown (stored as JSON for flexibility)
  cost_breakdown JSONB NOT NULL, -- {engineeringCost, fabricationCost, etc.}
  
  -- Final Pricing
  subtotal_cost NUMERIC(12, 2) NOT NULL,
  gross_profit NUMERIC(12, 2) NOT NULL,
  gross_margin_percent NUMERIC(5, 2) NOT NULL,
  quote_ex_vat NUMERIC(12, 2) NOT NULL,
  vat_amount NUMERIC(12, 2) NOT NULL,
  quote_inc_vat NUMERIC(12, 2) NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',           -- Being prepared
    'sent',            -- Sent to client
    'accepted',        -- Client accepted
    'rejected',        -- Client rejected
    'expired',         -- Past validity date
    'converted'        -- Converted to project
  )),
  
  -- Validity
  valid_until DATE NOT NULL,
  
  -- Documents
  pdf_url TEXT, -- Link to generated PDF
  
  -- Notes
  notes TEXT,
  rejection_reason TEXT,
  
  -- Client Response
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_quotes_job ON public.quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON public.quotes(valid_until);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Quotes (similar to jobs)
CREATE POLICY "Users can view quotes for their jobs" ON public.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = quotes.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

CREATE POLICY "Users can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update quotes for their jobs" ON public.quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.fire_consult_jobs
      WHERE fire_consult_jobs.id = quotes.job_id
      AND (fire_consult_jobs.consultant_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.profiles
             WHERE profiles.id = auth.uid()
             AND profiles.role IN ('admin', 'manager')
           ))
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  quote_num TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.quotes
  WHERE quote_number LIKE 'QT-' || year_part || '-%';
  
  quote_num := 'QT-' || year_part || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN quote_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate quote number if not provided
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_quote_number
  BEFORE INSERT OR UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_number();

