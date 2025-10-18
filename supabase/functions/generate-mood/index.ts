import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RhythmData {
  rhythmScore: number;
  bpm: number;
  intensity: string;
  keystrokeCount: number;
}

interface MoodResponse {
  mood: string;
  tempo: string;
  description: string;
  suggestion: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const rhythmData: RhythmData = await req.json();
    
    const { rhythmScore, bpm, intensity, keystrokeCount } = rhythmData;

    let moodResponse: MoodResponse;

    if (rhythmScore < 30 || bpm < 40) {
      moodResponse = {
        mood: "Deep Focus",
        tempo: "Slow",
        description: "Your steady rhythm suggests deep concentration. Perfect for complex problem-solving.",
        suggestion: "Maintain this pace for sustained focus. Try Calm mode for optimal flow.",
      };
    } else if (rhythmScore < 60 || bpm < 80) {
      moodResponse = {
        mood: "Productive Flow",
        tempo: "Moderate",
        description: "You're in a productive rhythm. Your typing shows consistent engagement.",
        suggestion: "You're hitting the sweet spot. Focus mode will enhance this natural rhythm.",
      };
    } else {
      moodResponse = {
        mood: "High Energy",
        tempo: "Fast",
        description: "Your rapid pace shows high energy and momentum. Great for execution tasks.",
        suggestion: "Channel this energy wisely. Energy mode will match your intensity.",
      };
    }

    if (keystrokeCount > 500) {
      moodResponse.suggestion += " Consider a short break to maintain quality.";
    }

    return new Response(
      JSON.stringify(moodResponse),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to generate mood", details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});