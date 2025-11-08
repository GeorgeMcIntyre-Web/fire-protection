-- Quote Tokens Table Migration
-- Enables secure public access to quotes via tokens

CREATE TABLE IF NOT EXISTS public.quote_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  viewed_at TIMESTAMPTZ,
  viewed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quote_tokens_token ON public.quote_tokens(token);
CREATE INDEX IF NOT EXISTS idx_quote_tokens_quote ON public.quote_tokens(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_tokens_expires ON public.quote_tokens(expires_at);

-- RLS Policies
ALTER TABLE public.quote_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read access for valid tokens (no auth required)
CREATE POLICY "Public can view valid quote tokens" ON public.quote_tokens
  FOR SELECT USING (
    token = current_setting('request.jwt.claims', true)::json->>'token' OR
    expires_at > now()
  );

-- Only authenticated users can create tokens
CREATE POLICY "Authenticated users can create quote tokens" ON public.quote_tokens
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to mark token as viewed
CREATE OR REPLACE FUNCTION mark_quote_token_viewed(token_value TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.quote_tokens
  SET 
    viewed_at = COALESCE(viewed_at, now()),
    viewed_count = viewed_count + 1
  WHERE token = token_value
    AND expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

