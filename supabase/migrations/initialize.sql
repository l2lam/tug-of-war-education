-- Tug-of-War Education Supabase Initialization Schema

-- 1. Create the questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    topic TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the custom_topics table
CREATE TABLE IF NOT EXISTS public.custom_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    questions_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- 3. Create the player_configs table
CREATE TABLE IF NOT EXISTS public.player_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    topics JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name) -- Names are unique per user
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_configs ENABLE ROW LEVEL SECURITY;

-- 5. Create Production Policies

-- Questions: Only authenticated users can read global questions
CREATE POLICY "Authenticated users can read questions" 
ON public.questions FOR SELECT TO authenticated USING (true);

-- Custom Topics: Authenticated users can read all. Only owners can write/edit.
CREATE POLICY "Authenticated users can read all topics" 
ON public.custom_topics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own topics" 
ON public.custom_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" 
ON public.custom_topics FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" 
ON public.custom_topics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Player Configs: Strictly owner-only access
CREATE POLICY "Users can manage their own configurations" 
ON public.player_configs FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 6. Insert seed data (Optional: You can also rely on the JSON library)
-- INSERT INTO public.questions (text, options, correct_index, topic) VALUES
-- ('What is 2 + 2?', '["3", "4", "5", "6"]', 1, 'grade-1-math');
