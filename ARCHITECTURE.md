# Architecture & Flow Diagrams

This document provides visual representations of the PulsePlay AI system architecture, data flows, and component interactions.

---

## System Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                         PULSEPLAY AI                               │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Frontend (React + Vite)                    │ │
│  │                                                                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │ │
│  │  │    UI       │  │   Custom    │  │   Services Layer     │ │ │
│  │  │ Components  │◄─┤   Hooks     │◄─┤  (API Clients)       │ │ │
│  │  └─────────────┘  └─────────────┘  └──────────────────────┘ │ │
│  │         │                │                      │             │ │
│  └─────────┼────────────────┼──────────────────────┼─────────────┘ │
│            │                │                      │               │
│            │                │                      │               │
└────────────┼────────────────┼──────────────────────┼───────────────┘
             │                │                      │
             │                │                      │
    ┌────────▼────────┐  ┌────▼──────────┐  ┌──────▼───────────┐
    │   Web Audio     │  │  Browser      │  │    Supabase      │
    │      API        │  │  Events       │  │   (Backend)      │
    │  (Sound Engine) │  │ (Input Track) │  │                  │
    └─────────────────┘  └───────────────┘  └──────────────────┘
                                             │                  │
                                    ┌────────┴────────┬─────────┴───────┐
                                    │                 │                 │
                            ┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
                            │     Auth     │  │  PostgreSQL │  │    Edge     │
                            │   Service    │  │  Database   │  │  Functions  │
                            └──────────────┘  └─────────────┘  └─────────────┘
```

---

## Component Hierarchy

```
App (Main Orchestrator)
│
├─── AuthButton
│    └─── AuthModal (conditional)
│
├─── RhythmVisualizer
│    └─── Canvas Element (animated)
│
├─── ControlPanel
│    ├─── Play/Pause Button
│    ├─── Mood Selector (3 buttons)
│    ├─── Volume Slider
│    └─── Accessibility Checkbox
│
├─── SessionStats
│    ├─── Duration Card
│    ├─── Keystrokes Card
│    ├─── Intensity Card
│    └─── Rhythm Score Bar (conditional)
│
└─── MoodInsights (conditional)
     ├─── Loading Spinner
     └─── Insight Card
```

---

## Data Flow Diagram

### User Interaction Flow

```
                    ┌─────────────┐
                    │    USER     │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐  ┌────▼─────┐  ┌─────▼──────┐
    │   Keyboard  │  │  Mouse   │  │ UI Controls│
    │   Events    │  │  Events  │  │   (Clicks) │
    └──────┬──────┘  └────┬─────┘  └─────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                   ┌───────▼────────┐
                   │ useRhythmDet.. │
                   │  (Hook)        │
                   └───────┬────────┘
                           │
                   ┌───────▼────────┐
                   │  rhythmData    │
                   │   (State)      │
                   └───────┬────────┘
                           │
       ┌───────────────────┼───────────────────┬───────────────┐
       │                   │                   │               │
┌──────▼──────┐  ┌─────────▼─────────┐  ┌─────▼──────┐  ┌────▼─────┐
│ Visualizer  │  │  useAudioEngine   │  │  Insights  │  │  Stats   │
│  (Display)  │  │   (Modulation)    │  │   (API)    │  │ (Display)│
└─────────────┘  └─────────┬─────────┘  └─────┬──────┘  └──────────┘
                           │                   │
                  ┌────────▼────────┐  ┌───────▼────────┐
                  │  Web Audio API  │  │ Supabase Edge  │
                  │  (Sound Output) │  │   Function     │
                  └─────────────────┘  └────────────────┘
```

---

## Audio Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Web Audio API Graph                           │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │ Oscillator 1 │   │ Oscillator 2 │   │ Oscillator 3 │       │
│  │  (Sine Wave) │   │(Triangle Wave)│   │(Square Wave) │       │
│  │   Freq: Base │   │  Freq: +1.2x  │   │  Freq: +1.5x │       │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│         │                  │                   │               │
│         ▼                  ▼                   ▼               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │  GainNode 1  │   │  GainNode 2  │   │  GainNode 3  │       │
│  │  Gain: 0.3   │   │  Gain: 0.2   │   │  Gain: 0.15  │       │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│         │                  │                   │               │
│         └──────────────────┼───────────────────┘               │
│                            │                                   │
│                     ┌──────▼──────┐                            │
│                     │ Master Gain │                            │
│                     │ (Volume: 0-1)│                           │
│                     └──────┬──────┘                            │
│                            │                                   │
│                     ┌──────▼──────────┐                        │
│                     │ BiquadFilter    │                        │
│                     │ (Lowpass)       │                        │
│                     │ Freq: 1500-3000 │                        │
│                     └──────┬──────────┘                        │
│                            │                                   │
│                     ┌──────▼──────────┐                        │
│                     │ ConvolverNode   │                        │
│                     │ (Reverb Effect) │                        │
│                     └──────┬──────────┘                        │
│                            │                                   │
│                     ┌──────▼──────────┐                        │
│                     │   Destination   │                        │
│                     │ (Audio Output)  │                        │
│                     └─────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Modulation (based on rhythmData):
- Frequencies: baseFreq × (1 + score × 0.3)
- Filter: 1500 + (score × 1500) Hz
- Gain: baseGain × (0.7 + score × 0.3)
```

---

## Rhythm Detection Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────┐
│             Rhythm Detection Process (1 second cycle)           │
└─────────────────────────────────────────────────────────────────┘

           ┌──────────────────────────┐
           │  Window Event Listeners  │
           │  - keydown               │
           │  - mousemove             │
           └───────────┬──────────────┘
                       │
                       ▼
           ┌──────────────────────────┐
           │ Store Timestamps         │
           │ - keystrokeTimestamps[]  │
           │ - mouseMovements[]       │
           │ (Max 50 / 30 entries)    │
           └───────────┬──────────────┘
                       │
                       ▼
           ┌──────────────────────────┐
           │ Filter Recent Events     │
           │ (Last 5 seconds)         │
           └───────────┬──────────────┘
                       │
                       ▼
           ┌──────────────────────────┐
           │ Calculate Intervals      │
           │ intervals[i] =           │
           │   timestamp[i] -         │
           │   timestamp[i-1]         │
           └───────────┬──────────────┘
                       │
                       ▼
           ┌──────────────────────────┐
           │ Compute Average          │
           │ avgInterval =            │
           │   sum / count            │
           └───────────┬──────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
  ┌──────────┐ ┌────────────┐ ┌──────────────┐
  │  Score   │ │    BPM     │ │  Intensity   │
  │min(100,  │ │  (60000/   │ │  high: >70   │
  │1000/     │ │ avgInt)    │ │  med:  >40   │
  │max(avg,  │ │  × 0.25    │ │  low:  ≤40   │
  │50))      │ │            │ │              │
  └────┬─────┘ └─────┬──────┘ └──────┬───────┘
       │             │               │
       └─────────────┼───────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │    Update State      │
          │   (rhythmData)       │
          └──────────────────────┘
```

---

## Authentication Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ 1. Click "Sign In"
       ▼
┌──────────────────┐
│   AuthButton     │
│  (Component)     │
└──────┬───────────┘
       │
       │ 2. Show Modal
       ▼
┌──────────────────┐
│   AuthModal      │
│  (Email/Pass)    │
└──────┬───────────┘
       │
       │ 3. Submit Credentials
       ▼
┌──────────────────────────────┐
│  supabase.auth.signIn        │
│  WithPassword()              │
└──────┬───────────────────────┘
       │
       │ 4. API Request
       ▼
┌──────────────────────────────┐
│  Supabase Auth Service       │
│  - Validate credentials      │
│  - Generate JWT tokens       │
└──────┬───────────────────────┘
       │
       │ 5. Return Session
       ▼
┌──────────────────────────────┐
│  Store Session               │
│  - Access Token              │
│  - Refresh Token             │
│  - User Object               │
└──────┬───────────────────────┘
       │
       │ 6. onAuthStateChange
       ▼
┌──────────────────────────────┐
│  Update UI                   │
│  - Show user email           │
│  - Enable features           │
│  - Start session tracking    │
└──────────────────────────────┘
```

---

## Session Persistence Flow

```
┌──────────────────────────────────────────────────────────────┐
│              Session Lifecycle Management                     │
└──────────────────────────────────────────────────────────────┘

User clicks "Play"
       │
       ▼
┌──────────────────┐
│ isPlaying = true │
└─────────┬────────┘
          │
          ▼
┌────────────────────────────────┐
│ useSessionPersistence Hook     │
│ Detects state change           │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│ Check if profile exists        │
│ supabase.from('profiles')      │
│   .select()                    │
└─────────┬──────────────────────┘
          │
          ├─ No ──┐
          │       ▼
          │   ┌─────────────────────┐
          │   │ Create Profile      │
          │   │ supabase.from(...)  │
          │   │   .insert()         │
          │   └─────────┬───────────┘
          │             │
          ├─────────────┘
          │ Yes
          ▼
┌────────────────────────────────┐
│ Create focus_session           │
│ supabase.from('focus_sessions')│
│   .insert({                    │
│     user_id,                   │
│     mood_generated,            │
│     started_at: now()          │
│   })                           │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│ Store session ID in state      │
│ currentSessionId = session.id  │
└─────────┬──────────────────────┘
          │
          │ ... User works ...
          │ rhythmData updates
          │
User clicks "Stop"
          │
          ▼
┌──────────────────┐
│ isPlaying = false│
└─────────┬────────┘
          │
          ▼
┌────────────────────────────────┐
│ Update focus_session           │
│ supabase.from('focus_sessions')│
│   .update({                    │
│     ended_at: now(),           │
│     average_rhythm_score,      │
│     average_bpm,               │
│     duration_minutes,          │
│     keystroke_count,           │
│     session_data               │
│   })                           │
│   .eq('id', currentSessionId)  │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│ Clear session ID               │
│ currentSessionId = null        │
└────────────────────────────────┘
```

---

## AI Mood Generation Flow

```
┌────────────────────────────────────────────────────────────┐
│           AI Mood Insights Generation Process              │
└────────────────────────────────────────────────────────────┘

User types (keystrokeCount >= 10)
       │
       ▼
┌──────────────────┐
│ 5 second delay   │
│ (debounce)       │
└─────────┬────────┘
          │
          ▼
┌─────────────────────────────────┐
│ MoodInsights component          │
│ triggers API call               │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ moodService.generateMood()      │
│ POST request with:              │
│ {                               │
│   rhythmScore: 65,              │
│   bpm: 120,                     │
│   intensity: 'medium',          │
│   keystrokeCount: 150           │
│ }                               │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Supabase Edge Function          │
│ /functions/v1/generate-mood     │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Classification Logic:           │
│                                 │
│ if (score < 30 || bpm < 40)     │
│   → "Deep Focus" (Slow)         │
│                                 │
│ else if (score < 60 || bpm < 80)│
│   → "Productive Flow" (Moderate)│
│                                 │
│ else                            │
│   → "High Energy" (Fast)        │
│                                 │
│ if (keystrokeCount > 500)       │
│   → Add break suggestion        │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Return MoodResponse:            │
│ {                               │
│   mood: "Productive Flow",      │
│   tempo: "Moderate",            │
│   description: "You're in...",  │
│   suggestion: "You're hitting..."│
│ }                               │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Display in UI                   │
│ - Mood name                     │
│ - Description text              │
│ - Suggestion text               │
│ - Recommended tempo             │
└─────────────────────────────────┘
```

---

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Database Schema                          │
└─────────────────────────────────────────────────────────────┘

┌───────────────────┐
│   auth.users      │  (Supabase managed)
│ ─────────────────│
│ id (uuid) PK      │
│ email             │
│ ...               │
└─────────┬─────────┘
          │
          │ Referenced by
          │
          ▼
┌─────────────────────────────┐
│      profiles               │
│ ───────────────────────────│
│ id (uuid) PK, FK            │◄──┐
│ email (text)                │   │
│ name (text)                 │   │
│ created_at (timestamptz)    │   │
│ updated_at (timestamptz)    │   │
└─────────┬───────────────────┘   │
          │                       │
          │ Referenced by         │
          │                       │
    ┌─────┴─────┐                 │
    │           │                 │
    ▼           ▼                 │
┌──────────────────┐   ┌────────────────────────────┐
│user_preferences  │   │    focus_sessions          │
│ ────────────────│   │ ──────────────────────────│
│ id (uuid) PK     │   │ id (uuid) PK               │
│ user_id FK ──────┼───┼─►user_id FK                │
│ mood_preference  │   │ started_at (timestamptz)   │
│ volume (int)     │   │ ended_at (timestamptz)     │
│ instrument_type  │   │ average_rhythm_score (int) │
│ accessibility_   │   │ average_bpm (int)          │
│   mode (bool)    │   │ mood_generated (text)      │
│ created_at       │   │ duration_minutes (int)     │
│ updated_at       │   │ keystroke_count (int)      │
└──────────────────┘   │ session_data (jsonb)       │
                       │ created_at (timestamptz)   │
                       └────────────────────────────┘

Row Level Security (RLS) Policies:
- All tables: Users can only access their own data
- Enforced via: auth.uid() = user_id
- Automatic filtering on SELECT, INSERT, UPDATE
```

---

## State Management Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  React State Structure                       │
└─────────────────────────────────────────────────────────────┘

App Component (Main State Container)
│
├─ sessionDuration: number
│  └─ Updated every second via setInterval
│
├─ useAudioEngine() returns:
│  ├─ isPlaying: boolean
│  ├─ mood: MoodType
│  ├─ volume: number (0-100)
│  ├─ accessibilityMode: boolean
│  └─ Functions: start, stop, change, update
│
├─ useRhythmDetection(isPlaying) returns:
│  ├─ rhythmData: RhythmData
│  │  ├─ rhythmScore: number (0-100)
│  │  ├─ bpm: number
│  │  ├─ intensity: 'low'|'medium'|'high'
│  │  ├─ keystrokeCount: number
│  │  └─ averageInterval: number
│  └─ resetRhythm: function
│
└─ useSessionPersistence(isPlaying, rhythmData, mood) returns:
   └─ currentSessionId: string | null

Child Components (Local State)
│
├─ AuthButton
│  ├─ user: User | null
│  ├─ loading: boolean
│  └─ showAuthModal: boolean
│
├─ AuthModal
│  ├─ isSignUp: boolean
│  ├─ email: string
│  ├─ password: string
│  ├─ loading: boolean
│  └─ error: string | null
│
└─ MoodInsights
   ├─ insights: MoodResponse | null
   └─ loading: boolean
```

---

## Performance Optimization Strategies

```
┌─────────────────────────────────────────────────────────────┐
│              Performance Optimization Points                 │
└─────────────────────────────────────────────────────────────┘

1. Rhythm Detection
   ├─ Debounced calculations (1 second interval)
   ├─ Limited array sizes (50 keystrokes max)
   ├─ Window-based filtering (5 seconds)
   └─ Event listener cleanup on unmount

2. Audio Engine
   ├─ Reuse AudioContext (singleton pattern)
   ├─ Limited oscillator count (3 max)
   ├─ Smooth parameter changes (linearRamp)
   └─ Proper cleanup on stop/unmount

3. React Rendering
   ├─ useCallback for stable function references
   ├─ useMemo for expensive calculations
   ├─ useRef for non-reactive values
   ├─ Conditional rendering (early returns)
   └─ Canvas animation loop (RAF, not React)

4. Database Operations
   ├─ Batch updates (session end only)
   ├─ Indexed columns (user_id, started_at)
   ├─ RLS policies (server-side filtering)
   └─ Connection pooling (Supabase managed)

5. API Calls
   ├─ Debounced requests (5 second delay)
   ├─ Conditional fetching (10+ keystrokes)
   ├─ Error handling (graceful degradation)
   └─ CORS headers (edge function caching)
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
└─────────────────────────────────────────────────────────────┘

1. Authentication Layer
   ├─ Supabase Auth (JWT tokens)
   ├─ Secure password hashing (bcrypt)
   ├─ Token refresh mechanism
   └─ Session management

2. Database Security (RLS)
   ├─ Row Level Security enabled on all tables
   ├─ Policy: auth.uid() = user_id
   ├─ Automatic filtering on queries
   └─ No direct table access without auth

3. API Security
   ├─ Bearer token authentication
   ├─ CORS headers (configured origins)
   ├─ Rate limiting (Supabase managed)
   └─ Input validation in edge functions

4. Frontend Security
   ├─ No sensitive data in localStorage
   ├─ Environment variables for keys
   ├─ HTTPS-only in production
   └─ XSS protection (React escaping)

┌──────────────────────────────────────┐
│         Request Flow (Secure)        │
└──────────────────────────────────────┘

Browser
   │
   ├─ 1. supabase.auth.getSession()
   │     └─ Returns access_token (JWT)
   │
   ├─ 2. API Request
   │     └─ Header: Authorization: Bearer {token}
   │
   ▼
Supabase
   │
   ├─ 3. Verify JWT signature
   │     ├─ Valid → Continue
   │     └─ Invalid → 401 Unauthorized
   │
   ├─ 4. Extract user_id from JWT
   │
   ├─ 5. Apply RLS policies
   │     └─ Filter: WHERE user_id = auth.uid()
   │
   └─ 6. Return filtered data
```

---

**Last Updated**: October 18, 2025
