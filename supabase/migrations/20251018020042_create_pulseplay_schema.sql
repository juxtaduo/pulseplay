/*
  # PulsePlay Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mood_preference` (text) - Preferred music mood (Calm, Focus, Energy)
      - `volume` (integer) - Volume level 0-100
      - `instrument_type` (text) - Preferred instrument
      - `accessibility_mode` (boolean) - Lower frequencies for sensory comfort
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `focus_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `average_rhythm_score` (integer) - Average typing/mouse rhythm
      - `average_bpm` (integer) - Average beats per minute
      - `mood_generated` (text) - AI-generated mood
      - `duration_minutes` (integer) - Session duration
      - `keystroke_count` (integer)
      - `session_data` (jsonb) - Additional session metrics
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood_preference text DEFAULT 'Focus',
  volume integer DEFAULT 70,
  instrument_type text DEFAULT 'Synth',
  accessibility_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create focus_sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  average_rhythm_score integer DEFAULT 0,
  average_bpm integer DEFAULT 0,
  mood_generated text,
  duration_minutes integer DEFAULT 0,
  keystroke_count integer DEFAULT 0,
  session_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON focus_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON focus_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON focus_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);