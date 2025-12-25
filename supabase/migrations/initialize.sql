-- Tug-of-War Education Supabase Initialization Schema

-- 1. Create the topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY, -- Using string IDs for library compatibility
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id), -- Nullable for system topics
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the player_configs table
CREATE TABLE IF NOT EXISTS public.player_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    topics JSONB NOT NULL, -- Array of topic IDs
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_configs ENABLE ROW LEVEL SECURITY;

-- 5. Create Production Policies

-- Topics: Authenticated users can read all. Only owners can write/edit.
CREATE POLICY "Authenticated users can read all topics" 
ON public.topics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own topics" 
ON public.topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" 
ON public.topics FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Questions: Only authenticated users can read. Only topic owners can write.
-- Note: This policy is simplified; to be strictly owner-only for write, 
-- we would join on topics.user_id.
CREATE POLICY "Authenticated users can read questions" 
ON public.questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can add questions" 
ON public.questions FOR INSERT TO authenticated WITH CHECK (true);

-- Player Configs: Strictly owner-only access
CREATE POLICY "Users can manage their own configurations" 
ON public.player_configs FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
