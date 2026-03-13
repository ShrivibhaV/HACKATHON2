-- Dyslexia App Database Migration
-- Target: Supabase / PostgreSQL
-- Purpose: Store personalized student profiles and track learning progress

-- COMPATIBILITY LAYER FOR LOCAL PGADMIN / STANDARD POSTGRES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM auth.users LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- 1. Create Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age_group TEXT CHECK (age_group IN ('junior', 'senior')), -- 'junior' for 1st-5th, 'senior' for 6th-10th+
    grade_level INTEGER, -- Specific grade (1-12)
    diagnosis_type TEXT[], -- Array of conditions: ['dyslexia', 'adhd', 'none']
    medication_status BOOLEAN DEFAULT false,
    comfort_level INTEGER CHECK (comfort_level BETWEEN 1 AND 10),
    preferred_background TEXT DEFAULT 'warm',
    font_scale FLOAT DEFAULT 1.0,
    word_spacing FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Learning Progress Table
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id TEXT, -- ID or original word for the syllable breakdown
    action_type TEXT CHECK (action_type IN ('syllable_breakdown', 'bionic_read', 'audio_played')),
    context_url TEXT, -- Where the learning happened
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Daily Streaks Table
CREATE TABLE IF NOT EXISTS daily_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    longest_streak INTEGER DEFAULT 0
);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Users can only see/edit their own data)
CREATE POLICY "Users can manage their own profile" 
ON student_profiles FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" 
ON learning_progress FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streaks" 
ON daily_streaks FOR ALL 
USING (auth.uid() = user_id);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
