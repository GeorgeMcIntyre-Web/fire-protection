-- Client Communications Table for Reports Module
-- Stores all client communications sent from the system

CREATE TABLE IF NOT EXISTS client_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  communication_type TEXT DEFAULT 'update' CHECK (communication_type IN ('update', 'alert', 'milestone', 'completion')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_client_communications_project_id ON client_communications(project_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_sent_date ON client_communications(sent_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_communications_sent_by ON client_communications(sent_by);

-- Enable Row Level Security
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_communications
CREATE POLICY "Users can view their own communications" ON client_communications
  FOR SELECT
  USING (auth.uid() = sent_by OR auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ));

CREATE POLICY "Users can create communications" ON client_communications
  FOR INSERT
  WITH CHECK (auth.uid() = sent_by);

CREATE POLICY "Users can update their own communications" ON client_communications
  FOR UPDATE
  USING (auth.uid() = sent_by);

CREATE POLICY "Users can delete their own communications" ON client_communications
  FOR DELETE
  USING (auth.uid() = sent_by);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_communications_updated_at
  BEFORE UPDATE ON client_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_client_communications_updated_at();

COMMENT ON TABLE client_communications IS 'Stores all client communication history for reporting and audit purposes';
COMMENT ON COLUMN client_communications.communication_type IS 'Type of communication: update, alert, milestone, or completion';





