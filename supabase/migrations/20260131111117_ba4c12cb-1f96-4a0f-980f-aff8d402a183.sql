-- Drop existing RLS policies for posts
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Create new policies that allow access by user_id (without requiring auth)
-- This allows anonymous users with a consistent local user_id
CREATE POLICY "Anyone can view posts by user_id" 
ON public.posts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update posts by user_id" 
ON public.posts 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete posts by user_id" 
ON public.posts 
FOR DELETE 
USING (true);