import { RhythmData } from '../hooks/useRhythmDetection';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface MoodResponse {
  mood: string;
  tempo: string;
  description: string;
  suggestion: string;
}

export const generateMood = async (rhythmData: RhythmData): Promise<MoodResponse> => {
  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/generate-mood`;

    const headers = {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(rhythmData),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate mood: ${response.statusText}`);
    }

    const data: MoodResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating mood:', error);
    throw error;
  }
};
