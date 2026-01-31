-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own providers" ON public.ai_providers;
DROP POLICY IF EXISTS "Users can create their own providers" ON public.ai_providers;
DROP POLICY IF EXISTS "Users can update their own providers" ON public.ai_providers;
DROP POLICY IF EXISTS "Users can delete their own providers" ON public.ai_providers;

-- Make user_id nullable for non-auth usage
ALTER TABLE public.ai_providers ALTER COLUMN user_id DROP NOT NULL;

-- Create permissive policies (like posts table)
CREATE POLICY "Anyone can view providers"
ON public.ai_providers
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create providers"
ON public.ai_providers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update providers"
ON public.ai_providers
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete providers"
ON public.ai_providers
FOR DELETE
USING (true);