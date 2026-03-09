-- NeuroLearn Database Schema
-- Tables for user profiles, learning preferences, progress tracking, and teacher access

-- 1. Users table (authentication + basic info)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'student', -- 'student' or 'teacher'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Student profiles (learning preferences + weighted profile)
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Weighted profile: dyslexia_score + adhd_score should sum to 100
  dyslexia_score DECIMAL(5,2) DEFAULT 0,
  adhd_score DECIMAL(5,2) DEFAULT 0,
  standard_score DECIMAL(5,2) DEFAULT 100,
  
  -- Preferences for Dyslexia mode
  font_size INT DEFAULT 16,
  word_spacing DECIMAL(5,2) DEFAULT 0.15, -- in em
  line_height DECIMAL(5,2) DEFAULT 2.0,
  background_color VARCHAR(50) DEFAULT 'cream', -- cream, lightyellow, lightgreen
  use_bionic_reading BOOLEAN DEFAULT TRUE,
  
  -- Preferences for ADHD mode
  use_pomodoro BOOLEAN DEFAULT TRUE,
  pomodoro_duration INT DEFAULT 25, -- minutes
  show_confetti BOOLEAN DEFAULT TRUE,
  show_streaks BOOLEAN DEFAULT TRUE,
  
  -- General preferences
  dark_mode BOOLEAN DEFAULT FALSE,
  text_to_speech_enabled BOOLEAN DEFAULT TRUE,
  reading_ruler_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Learning content (transformed texts)
CREATE TABLE IF NOT EXISTS learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  original_text TEXT NOT NULL,
  transformed_text TEXT,
  
  -- Transformations applied
  has_dyslexia_adaptation BOOLEAN DEFAULT FALSE,
  has_adhd_chunking BOOLEAN DEFAULT FALSE,
  has_vocab_simplification BOOLEAN DEFAULT FALSE,
  
  -- Content metadata
  title VARCHAR(255),
  reading_time_minutes INT,
  difficulty_level VARCHAR(50), -- beginner, intermediate, advanced
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Progress tracking (per-user, per-content)
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES learning_content(id) ON DELETE CASCADE,
  
  -- Reading metrics
  words_read INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  sections_completed INT DEFAULT 0,
  
  -- Comprehension
  quiz_score DECIMAL(5,2), -- 0-100
  quiz_attempts INT DEFAULT 0,
  
  -- Engagement
  paused_count INT DEFAULT 0,
  resumed_count INT DEFAULT 0,
  
  -- Struggle points (for teacher insights)
  struggle_sections TEXT, -- JSON array of section indices where user re-read
  
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT NOW()
);

-- 5. Achievements/badges (gamification)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  badge_type VARCHAR(100), -- 'first_read', 'century', 'week_streak', etc.
  badge_name VARCHAR(255),
  badge_description TEXT,
  earned_at TIMESTAMP DEFAULT NOW()
);

-- 6. Daily streaks (ADHD mode engagement)
CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Teacher profiles + student access
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Teacher-student relationships (students grant access)
CREATE TABLE IF NOT EXISTS teacher_student_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Access granted via share code
  access_code VARCHAR(20) UNIQUE NOT NULL,
  access_type VARCHAR(50) DEFAULT 'read-only', -- read-only or full
  
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  
  UNIQUE(teacher_id, student_id)
);

-- 9. Session/conversation history (for AI educator)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES learning_content(id) ON DELETE SET NULL,
  
  conversation_data JSONB, -- Array of {role, content} messages
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_learning_content_user_id ON learning_content(user_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_content_id ON learning_progress(content_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_daily_streaks_user_id ON daily_streaks(user_id);
CREATE INDEX idx_teacher_student_access_teacher_id ON teacher_student_access(teacher_id);
CREATE INDEX idx_teacher_student_access_student_id ON teacher_student_access(student_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Students can only see their own data
CREATE POLICY "Users can see own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Students can see own profile" ON student_profiles
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Students can see own content" ON learning_content
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Students can see own progress" ON learning_progress
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR
    EXISTS (
      SELECT 1 FROM teacher_student_access
      WHERE teacher_id = auth.uid()::uuid AND student_id = user_id AND revoked_at IS NULL
    )
  );
