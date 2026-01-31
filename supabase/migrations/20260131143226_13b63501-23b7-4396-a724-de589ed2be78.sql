-- Create table for paid users (by Telegram ID)
CREATE TABLE public.paid_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paid_users ENABLE ROW LEVEL SECURITY;

-- Anyone can check if a telegram_id is paid (for the app to function)
CREATE POLICY "Anyone can check paid status"
ON public.paid_users
FOR SELECT
USING (true);

-- Only service role can insert/update/delete (managed via admin)