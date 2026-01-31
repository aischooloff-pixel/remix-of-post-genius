-- Create table for user AI providers
CREATE TABLE public.ai_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'openrouter',
  api_key TEXT NOT NULL,
  endpoint_url TEXT NOT NULL DEFAULT 'https://openrouter.ai/api/v1/chat/completions',
  model_id TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own providers"
ON public.ai_providers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own providers"
ON public.ai_providers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own providers"
ON public.ai_providers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own providers"
ON public.ai_providers
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ai_providers_updated_at
BEFORE UPDATE ON public.ai_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();