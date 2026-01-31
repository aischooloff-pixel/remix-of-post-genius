-- Create enum for post status
CREATE TYPE public.post_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled');

-- Create enum for tone options
CREATE TYPE public.tone_option AS ENUM ('drive', 'info', 'promo', 'friendly', 'formal');

-- Create enum for length options  
CREATE TYPE public.length_option AS ENUM ('short', 'medium', 'long');

-- Create enum for media type
CREATE TYPE public.media_type AS ENUM ('photo', 'video', 'gif', 'document');

-- Create enum for button type
CREATE TYPE public.button_type AS ENUM ('url', 'callback');

-- Bot tokens table (encrypted storage)
CREATE TABLE public.bot_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  encrypted_token TEXT NOT NULL,
  bot_username TEXT,
  bot_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Channels table
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bot_token_id UUID REFERENCES public.bot_tokens(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_title TEXT,
  channel_username TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- System prompts table
CREATE TABLE public.system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  variables_template JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  bot_token_id UUID REFERENCES public.bot_tokens(id) ON DELETE SET NULL,
  idea_text TEXT NOT NULL,
  tone tone_option DEFAULT 'info',
  length length_option DEFAULT 'medium',
  goal TEXT,
  target_audience TEXT,
  system_prompt_id UUID REFERENCES public.system_prompts(id) ON DELETE SET NULL,
  variants JSONB DEFAULT '[]',
  chosen_variant_id TEXT,
  edited_text_markdown TEXT,
  edited_text_html TEXT,
  media JSONB DEFAULT '[]',
  buttons JSONB DEFAULT '[]',
  schedule_datetime TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  status post_status DEFAULT 'draft',
  logs JSONB DEFAULT '[]',
  error_message TEXT,
  telegram_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Post versions for history/undo
CREATE TABLE public.post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  text_markdown TEXT,
  text_html TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bot_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for bot_tokens
CREATE POLICY "Users can view their own bot tokens"
ON public.bot_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot tokens"
ON public.bot_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot tokens"
ON public.bot_tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot tokens"
ON public.bot_tokens FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for channels
CREATE POLICY "Users can view their own channels"
ON public.channels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own channels"
ON public.channels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channels"
ON public.channels FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channels"
ON public.channels FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for system_prompts
CREATE POLICY "Users can view their own and public prompts"
ON public.system_prompts FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own prompts"
ON public.system_prompts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
ON public.system_prompts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
ON public.system_prompts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for posts
CREATE POLICY "Users can view their own posts"
ON public.posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for post_versions
CREATE POLICY "Users can view versions of their own posts"
ON public.post_versions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.posts 
  WHERE posts.id = post_versions.post_id 
  AND posts.user_id = auth.uid()
));

CREATE POLICY "Users can create versions for their own posts"
ON public.post_versions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.posts 
  WHERE posts.id = post_versions.post_id 
  AND posts.user_id = auth.uid()
));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_bot_tokens_updated_at
BEFORE UPDATE ON public.bot_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON public.channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_prompts_updated_at
BEFORE UPDATE ON public.system_prompts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system prompt
INSERT INTO public.system_prompts (user_id, name, prompt_text, is_default, is_public)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Telegram Post Generator',
  'Ты — профессиональный автор постов для Telegram. Задача: по идее/бриффу сгенерировать 3 варианта поста:
1) Короткий крючок (hook) + практический совет, 1–3 предложения.
2) Развёрнутый гайд — 4–8 предложений, структурированные абзацы.
3) Продающий вариант с мягким CTA в конце (1–2 фразы).

Тон: {tone}
Длина: {length}
Цель: {goal}
Целевая аудитория: {target_audience}

Ограничения: максимум 3 эмодзи; результат должен быть совместим с MarkdownV2. Не придумывай фактов.

Верни JSON массив с 3 вариантами в формате:
[
  {"id": "v1", "style": "hook", "styleName": "Крючок + совет", "text": "...", "textMarkdown": "...", "textHtml": "..."},
  {"id": "v2", "style": "guide", "styleName": "Развёрнутый гайд", "text": "...", "textMarkdown": "...", "textHtml": "..."},
  {"id": "v3", "style": "promo", "styleName": "Продающий", "text": "...", "textMarkdown": "...", "textHtml": "..."}
]',
  true,
  true
);