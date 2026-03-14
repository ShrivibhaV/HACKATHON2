-- ============================================================
-- NeuroLearn: Progress & Session Tables
-- ============================================================

-- Table to log daily learning sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  words_read      INT           NOT NULL DEFAULT 0,
  time_spent_min  INT           NOT NULL DEFAULT 0,
  comprehension   INT           NOT NULL DEFAULT 0, -- percentage
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Table to log areas of struggle 
CREATE TABLE IF NOT EXISTS struggle_points (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  topic           TEXT          NOT NULL,
  struggle_type   TEXT          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Clear existing data for clear seeding
TRUNCATE TABLE learning_sessions CASCADE;
TRUNCATE TABLE struggle_points CASCADE;

-- Insert a default "Teacher" profile so we have at least one student profile to attach data to if the DB is empty
INSERT INTO student_profiles (id, name, age_group, preferred_mode)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Alex Johnson', 'teen', 'dyslexia'),
  ('22222222-2222-2222-2222-222222222222', 'Jordan Smith', 'preteen', 'adhd'),
  ('33333333-3333-3333-3333-333333333333', 'Casey Brown', 'teen', 'standard')
ON CONFLICT (id) DO NOTHING;

-- Seed Data: Learning Sessions (Last 7 days for the Progress charts)
INSERT INTO learning_sessions (student_id, words_read, time_spent_min, comprehension, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 120, 15, 85, NOW() - INTERVAL '6 days'),
  ('11111111-1111-1111-1111-111111111111', 250, 25, 92, NOW() - INTERVAL '5 days'),
  ('11111111-1111-1111-1111-111111111111', 180, 20, 88, NOW() - INTERVAL '4 days'),
  ('11111111-1111-1111-1111-111111111111', 310, 35, 95, NOW() - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111111', 220, 22, 90, NOW() - INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111111', 450, 45, 98, NOW() - INTERVAL '1 days'),
  ('11111111-1111-1111-1111-111111111111', 380, 40, 94, NOW()),
  
  ('22222222-2222-2222-2222-222222222222', 150, 10, 80, NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 170, 15, 82, NOW() - INTERVAL '1 days'),
  ('22222222-2222-2222-2222-222222222222', 180, 20, 85, NOW()),
  
  ('33333333-3333-3333-3333-333333333333', 500, 30, 90, NOW() - INTERVAL '1 days'),
  ('33333333-3333-3333-3333-333333333333', 600, 35, 92, NOW());

-- Seed Data: Struggle Points
INSERT INTO struggle_points (student_id, topic, struggle_type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Photosynthesis', 'Complex vocabulary'),
  ('11111111-1111-1111-1111-111111111111', 'Photosynthesis', 'Long paragraphs'),
  ('22222222-2222-2222-2222-222222222222', 'Water Cycle', 'Length'),
  ('22222222-2222-2222-2222-222222222222', 'Water Cycle', 'Sustained focus');
