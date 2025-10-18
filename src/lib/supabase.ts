import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  mood_preference: string;
  volume: number;
  instrument_type: string;
  accessibility_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  average_rhythm_score: number;
  average_bpm: number;
  mood_generated: string | null;
  duration_minutes: number;
  keystroke_count: number;
  session_data: Record<string, any>;
  created_at: string;
}
