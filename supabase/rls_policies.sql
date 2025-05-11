-- RLS Policies for Reading Goals Tables

-- Enable RLS on the tables
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Reading Goals Policies

-- 1. Users can view their own reading goals
CREATE POLICY "Users can view their own reading goals"
  ON reading_goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own reading goals
CREATE POLICY "Users can insert their own reading goals"
  ON reading_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own reading goals
CREATE POLICY "Users can update their own reading goals"
  ON reading_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Users can delete their own reading goals
CREATE POLICY "Users can delete their own reading goals"
  ON reading_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Librarians can view all reading goals (for analytics)
CREATE POLICY "Librarians can view all reading goals"
  ON reading_goals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'librarian'
    )
  );

-- Reading Progress Policies

-- 1. Users can view their own reading progress
CREATE POLICY "Users can view their own reading progress"
  ON reading_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own reading progress
CREATE POLICY "Users can insert their own reading progress"
  ON reading_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own reading progress
CREATE POLICY "Users can update their own reading progress"
  ON reading_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Users can delete their own reading progress
CREATE POLICY "Users can delete their own reading progress"
  ON reading_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Librarians can view all reading progress (for analytics)
CREATE POLICY "Librarians can view all reading progress"
  ON reading_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'librarian'
    )
  );

-- Reading Sessions Policies

-- 1. Users can view their own reading sessions
CREATE POLICY "Users can view their own reading sessions"
  ON reading_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own reading sessions
CREATE POLICY "Users can insert their own reading sessions"
  ON reading_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own reading sessions
CREATE POLICY "Users can update their own reading sessions"
  ON reading_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Users can delete their own reading sessions
CREATE POLICY "Users can delete their own reading sessions"
  ON reading_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Librarians can view all reading sessions (for analytics)
CREATE POLICY "Librarians can view all reading sessions"
  ON reading_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'librarian'
    )
  );
