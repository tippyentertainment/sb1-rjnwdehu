/*
  # Sprint Management Schema

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamptz)
    
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
    
    - `sprints`
      - `id` (uuid, primary key)
      - `name` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `status` (enum: active, completed, planned)
      - `team_id` (uuid)
      - `created_at` (timestamptz)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (enum: todo, in_progress, done)
      - `sprint_id` (uuid, foreign key)
      - `assigned_to` (uuid)
      - `story_points` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create teams table first
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create sprint status enum
CREATE TYPE sprint_status AS ENUM ('active', 'completed', 'planned');

-- Create task status enum
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status sprint_status NOT NULL DEFAULT 'planned',
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status task_status NOT NULL DEFAULT 'todo',
  sprint_id uuid NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  story_points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_points CHECK (story_points >= 0)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for teams
CREATE POLICY "Team members can view their teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Policies for team members
CREATE POLICY "Users can view team memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for sprints
CREATE POLICY "Team members can view their sprints"
  ON sprints
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = sprints.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert sprints"
  ON sprints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = sprints.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update their sprints"
  ON sprints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = sprints.team_id
      AND team_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = sprints.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Policies for tasks
CREATE POLICY "Team members can view sprint tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN team_members ON team_members.team_id = sprints.team_id
      WHERE sprints.id = tasks.sprint_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN team_members ON team_members.team_id = sprints.team_id
      WHERE sprints.id = tasks.sprint_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN team_members ON team_members.team_id = sprints.team_id
      WHERE sprints.id = tasks.sprint_id
      AND team_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprints
      JOIN team_members ON team_members.team_id = sprints.team_id
      WHERE sprints.id = tasks.sprint_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sprints_team_id ON sprints(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);