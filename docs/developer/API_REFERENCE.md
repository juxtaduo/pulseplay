# API Reference Guide

## Table of Contents
1. [Supabase Client API](#supabase-client-api)
2. [Custom Hooks API](#custom-hooks-api)
3. [Component Props API](#component-props-api)
4. [Edge Functions API](#edge-functions-api)
5. [Type Definitions](#type-definitions)

---

## Supabase Client API

### Authentication Methods

#### `supabase.auth.signUp()`
Create a new user account.

```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string
});

// Returns
{
  data: {
    user: User | null,
    session: Session | null
  },
  error: AuthError | null
}
```

---

#### `supabase.auth.signInWithPassword()`
Sign in an existing user.

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string
});

// Returns
{
  data: {
    user: User,
    session: Session
  },
  error: AuthError | null
}
```

---

#### `supabase.auth.signOut()`
Sign out the current user.

```typescript
const { error } = await supabase.auth.signOut();

// Returns
{
  error: AuthError | null
}
```

---

#### `supabase.auth.getSession()`
Get the current session.

```typescript
const { data, error } = await supabase.auth.getSession();

// Returns
{
  data: {
    session: Session | null
  },
  error: AuthError | null
}
```

---

#### `supabase.auth.onAuthStateChange()`
Subscribe to authentication state changes.

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event: AuthChangeEvent, session: Session | null) => {
    // Handle auth state change
    console.log(event, session);
  }
);

// Don't forget to unsubscribe
subscription.unsubscribe();
```

**Events**:
- `SIGNED_IN`
- `SIGNED_OUT`
- `TOKEN_REFRESHED`
- `USER_UPDATED`
- `PASSWORD_RECOVERY`

---

### Database Methods

#### Select Query
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2')
  .eq('id', userId)
  .maybeSingle();
```

#### Insert Query
```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert({
    column1: value1,
    column2: value2
  })
  .select()
  .single();
```

#### Update Query
```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({
    column1: new_value
  })
  .eq('id', recordId);
```

---

## Custom Hooks API

### useAudioEngine()

**Purpose**: Manages Web Audio API for sound synthesis.

**Returns**:
```typescript
{
  isPlaying: boolean;
  mood: MoodType;
  volume: number;
  accessibilityMode: boolean;
  startAudio: () => void;
  stopAudio: () => void;
  changeMood: (mood: MoodType) => void;
  setVolume: (volume: number) => void;
  setAccessibilityMode: (mode: boolean) => void;
  updateAudioParameters: (rhythmData: RhythmData) => void;
}
```

**Usage Example**:
```typescript
function MyComponent() {
  const {
    isPlaying,
    mood,
    volume,
    startAudio,
    stopAudio,
    changeMood,
    setVolume,
    updateAudioParameters
  } = useAudioEngine();

  const handlePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleMoodChange = (newMood: MoodType) => {
    changeMood(newMood);
  };

  return (
    <div>
      <button onClick={handlePlay}>
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <select value={mood} onChange={(e) => handleMoodChange(e.target.value)}>
        <option value="Calm">Calm</option>
        <option value="Focus">Focus</option>
        <option value="Energy">Energy</option>
      </select>
    </div>
  );
}
```

**Methods Details**:

- **startAudio()**: Initializes AudioContext and starts oscillators
- **stopAudio()**: Stops all oscillators and cleans up
- **changeMood(mood)**: Changes frequencies based on mood
- **setVolume(volume)**: Sets master gain (0-100)
- **setAccessibilityMode(mode)**: Toggles lower frequency ranges
- **updateAudioParameters(rhythmData)**: Modulates audio based on rhythm

---

### useRhythmDetection(isActive)

**Purpose**: Tracks keyboard and mouse activity to calculate rhythm metrics.

**Parameters**:
- `isActive: boolean` - Whether to track activity

**Returns**:
```typescript
{
  rhythmData: RhythmData;
  resetRhythm: () => void;
}

interface RhythmData {
  rhythmScore: number;      // 0-100
  bpm: number;              // Calculated tempo
  intensity: 'low' | 'medium' | 'high';
  keystrokeCount: number;   // Total keystrokes
  averageInterval: number;  // ms between keystrokes
}
```

**Usage Example**:
```typescript
function MyComponent() {
  const [isActive, setIsActive] = useState(false);
  const { rhythmData, resetRhythm } = useRhythmDetection(isActive);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
    resetRhythm();
  };

  return (
    <div>
      <p>BPM: {rhythmData.bpm}</p>
      <p>Rhythm Score: {rhythmData.rhythmScore}</p>
      <p>Intensity: {rhythmData.intensity}</p>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
}
```

**Algorithm**:
- Tracks keydown events and stores timestamps
- Calculates intervals between consecutive keystrokes
- Computes average interval over 5-second window
- Derives rhythm score: `1000 / max(avgInterval, 50)`
- Calculates BPM: `(60000 / avgInterval) * 0.25`
- Classifies intensity based on rhythm score

---

### useSessionPersistence(isPlaying, rhythmData, mood)

**Purpose**: Automatically persists focus sessions to database.

**Parameters**:
- `isPlaying: boolean` - Whether session is active
- `rhythmData: RhythmData` - Current rhythm metrics
- `mood: string` - Current mood setting

**Returns**:
```typescript
{
  currentSessionId: string | null;
}
```

**Usage Example**:
```typescript
function MyComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { rhythmData } = useRhythmDetection(isPlaying);
  const [mood, setMood] = useState('Focus');
  
  const { currentSessionId } = useSessionPersistence(
    isPlaying,
    rhythmData,
    mood
  );

  return (
    <div>
      {currentSessionId && <p>Session ID: {currentSessionId}</p>}
    </div>
  );
}
```

**Behavior**:
- **On Start**: Creates new `focus_sessions` record
- **On Stop**: Updates record with final metrics
- **Auto Profile**: Creates user profile if doesn't exist
- **Auth Required**: Only works for authenticated users

---

## Component Props API

### AuthButton

**Props**: None (manages own state)

**Features**:
- Displays login button when signed out
- Shows user email and logout button when signed in
- Modal for sign in/sign up
- Auth state subscription

---

### ControlPanel

**Props**:
```typescript
interface ControlPanelProps {
  isPlaying: boolean;
  mood: MoodType;
  volume: number;
  accessibilityMode: boolean;
  onPlayPause: () => void;
  onMoodChange: (mood: MoodType) => void;
  onVolumeChange: (volume: number) => void;
  onAccessibilityToggle: () => void;
}
```

**Usage**:
```typescript
<ControlPanel
  isPlaying={isPlaying}
  mood={mood}
  volume={volume}
  accessibilityMode={accessibilityMode}
  onPlayPause={handlePlayPause}
  onMoodChange={handleMoodChange}
  onVolumeChange={handleVolumeChange}
  onAccessibilityToggle={handleAccessibilityToggle}
/>
```

---

### MoodInsights

**Props**:
```typescript
interface MoodInsightsProps {
  rhythmData: RhythmData;
  isPlaying: boolean;
}
```

**Usage**:
```typescript
<MoodInsights
  rhythmData={rhythmData}
  isPlaying={isPlaying}
/>
```

**Behavior**:
- Only renders when `isPlaying` is true and keystrokeCount >= 10
- Fetches AI insights after 5-second delay
- Shows loading spinner during fetch
- Displays mood, description, suggestion, and tempo

---

### RhythmVisualizer

**Props**:
```typescript
interface RhythmVisualizerProps {
  rhythmData: RhythmData;
  isPlaying: boolean;
}
```

**Usage**:
```typescript
<RhythmVisualizer
  rhythmData={rhythmData}
  isPlaying={isPlaying}
/>
```

**Features**:
- Canvas-based animation (300x300px)
- Pulsing circle that grows with rhythm score
- Color-coded by intensity (red/blue/green)
- Animated wave rings
- BPM display in center

---

### SessionStats

**Props**:
```typescript
interface SessionStatsProps {
  rhythmData: RhythmData;
  sessionDuration: number;  // seconds
  isActive: boolean;
}
```

**Usage**:
```typescript
<SessionStats
  rhythmData={rhythmData}
  sessionDuration={sessionDuration}
  isActive={isActive}
/>
```

**Displays**:
- Duration in MM:SS format
- Total keystroke count
- Intensity level (color-coded)
- Rhythm score progress bar (conditional)

---

## Edge Functions API

### generate-mood

**Endpoint**: `POST /functions/v1/generate-mood`

**Authentication**: Bearer token (Supabase anon key)

**Request Headers**:
```
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json
```

**Request Body**:
```typescript
{
  rhythmScore: number;    // 0-100
  bpm: number;            // Calculated BPM
  intensity: string;      // 'low' | 'medium' | 'high'
  keystrokeCount: number; // Total keystrokes
}
```

**Success Response** (200):
```typescript
{
  mood: string;         // "Deep Focus" | "Productive Flow" | "High Energy"
  tempo: string;        // "Slow" | "Moderate" | "Fast"
  description: string;  // Detailed analysis
  suggestion: string;   // Personalized recommendation
}
```

**Error Response** (500):
```typescript
{
  error: string;
  details: string;
}
```

**Example Usage**:
```typescript
import { generateMood } from '../services/moodService';

const rhythmData = {
  rhythmScore: 65,
  bpm: 120,
  intensity: 'medium',
  keystrokeCount: 150
};

try {
  const moodResponse = await generateMood(rhythmData);
  console.log(moodResponse);
  // {
  //   mood: "Productive Flow",
  //   tempo: "Moderate",
  //   description: "You're in a productive rhythm...",
  //   suggestion: "You're hitting the sweet spot..."
  // }
} catch (error) {
  console.error('Failed to generate mood:', error);
}
```

**Classification Logic**:
```typescript
if (rhythmScore < 30 || bpm < 40) {
  return "Deep Focus" with "Slow" tempo
}
else if (rhythmScore < 60 || bpm < 80) {
  return "Productive Flow" with "Moderate" tempo
}
else {
  return "High Energy" with "Fast" tempo
}

// Extra suggestion added if keystrokeCount > 500
if (keystrokeCount > 500) {
  suggestion += " Consider a short break to maintain quality."
}
```

---

## Type Definitions

### Core Types

```typescript
// Mood types
type MoodType = 'Calm' | 'Focus' | 'Energy';

// Intensity levels
type IntensityType = 'low' | 'medium' | 'high';

// Rhythm data structure
interface RhythmData {
  rhythmScore: number;
  bpm: number;
  intensity: IntensityType;
  keystrokeCount: number;
  averageInterval: number;
}

// Mood response from AI
interface MoodResponse {
  mood: string;
  tempo: string;
  description: string;
  suggestion: string;
}
```

### Database Types

```typescript
// User profile
interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  updated_at: string;
}

// User preferences
interface UserPreferences {
  id: string;
  user_id: string;
  mood_preference: string;
  volume: number;
  instrument_type: string;
  accessibility_mode: boolean;
  created_at: string;
  updated_at: string;
}

// Focus session
interface FocusSession {
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
```

### Supabase Auth Types

```typescript
import { User, Session, AuthError } from '@supabase/supabase-js';

// User object
interface User {
  id: string;
  email?: string;
  phone?: string;
  // ... other fields
}

// Session object
interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at?: number;
}

// Auth error
interface AuthError extends Error {
  message: string;
  status?: number;
}
```

---

## Web Audio API Reference

### AudioContext
```typescript
const audioContext = new AudioContext();

// Properties
audioContext.currentTime: number;  // Current time in seconds
audioContext.sampleRate: number;   // Sample rate in Hz
audioContext.state: AudioContextState; // 'running' | 'suspended' | 'closed'

// Methods
audioContext.resume(): Promise<void>;
audioContext.suspend(): Promise<void>;
audioContext.close(): Promise<void>;
```

### OscillatorNode
```typescript
const oscillator = audioContext.createOscillator();

// Properties
oscillator.type: OscillatorType; // 'sine' | 'square' | 'sawtooth' | 'triangle'
oscillator.frequency: AudioParam; // Frequency in Hz

// Methods
oscillator.start(when?: number): void;
oscillator.stop(when?: number): void;
oscillator.connect(destination: AudioNode): void;
```

### GainNode
```typescript
const gainNode = audioContext.createGain();

// Properties
gainNode.gain: AudioParam; // Gain value (0.0 to 1.0+)

// Methods
gainNode.connect(destination: AudioNode): void;
```

### BiquadFilterNode
```typescript
const filter = audioContext.createBiquadFilter();

// Properties
filter.type: BiquadFilterType; // 'lowpass' | 'highpass' | 'bandpass' | ...
filter.frequency: AudioParam;  // Cutoff frequency in Hz
filter.Q: AudioParam;          // Quality factor

// Methods
filter.connect(destination: AudioNode): void;
```

### ConvolverNode
```typescript
const reverb = audioContext.createConvolver();

// Properties
reverb.buffer: AudioBuffer | null; // Impulse response

// Methods
reverb.connect(destination: AudioNode): void;
```

### AudioParam Methods
```typescript
// Immediate value change
audioParam.value = newValue;

// Scheduled value changes
audioParam.linearRampToValueAtTime(value: number, endTime: number): void;
audioParam.exponentialRampToValueAtTime(value: number, endTime: number): void;
audioParam.setTargetAtTime(target: number, startTime: number, timeConstant: number): void;
```

---

## Error Handling Patterns

### Database Operations
```typescript
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
  
  if (error) throw error;
  
  // Use data
  console.log(data);
} catch (error) {
  console.error('Database error:', error);
  // Handle error gracefully
}
```

### Authentication
```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  // Signed in successfully
  console.log('User:', data.user);
} catch (error: any) {
  // Show user-friendly error
  setError(error.message);
}
```

### Edge Function Calls
```typescript
try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result;
} catch (error) {
  console.error('API error:', error);
  throw error; // Re-throw for caller to handle
}
```

---

**Last Updated**: October 18, 2025
