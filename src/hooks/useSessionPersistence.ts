import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RhythmData } from './useRhythmDetection';

export const useSessionPersistence = (
  isPlaying: boolean,
  rhythmData: RhythmData,
  mood: string
) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const startSession = async () => {
      if (!isPlaying || !user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            name: user.email?.split('@')[0],
          });
        }

        const { data: session, error } = await supabase
          .from('focus_sessions')
          .insert({
            user_id: user.id,
            mood_generated: mood,
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        setCurrentSessionId(session.id);
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    };

    const endSession = async () => {
      if (!currentSessionId || isPlaying || !user) return;

      try {
        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() - Math.floor(rhythmData.keystrokeCount / 2));

        const durationMinutes = Math.floor(
          (new Date().getTime() - startTime.getTime()) / 60000
        );

        await supabase
          .from('focus_sessions')
          .update({
            ended_at: new Date().toISOString(),
            average_rhythm_score: rhythmData.rhythmScore,
            average_bpm: rhythmData.bpm,
            duration_minutes: durationMinutes,
            keystroke_count: rhythmData.keystrokeCount,
            session_data: {
              intensity: rhythmData.intensity,
              averageInterval: rhythmData.averageInterval,
            },
          })
          .eq('id', currentSessionId);

        setCurrentSessionId(null);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    };

    if (isPlaying && !currentSessionId) {
      startSession();
    } else if (!isPlaying && currentSessionId) {
      endSession();
    }
  }, [isPlaying, currentSessionId, user, rhythmData, mood]);

  return { currentSessionId };
};
