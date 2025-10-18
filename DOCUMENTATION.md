# PulsePlay AI - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Core Technologies](#core-technologies)
5. [Features](#features)
6. [Components](#components)
7. [Custom Hooks](#custom-hooks)
8. [Services](#services)
9. [Database Schema](#database-schema)
10. [Setup & Installation](#setup--installation)
11. [Environment Variables](#environment-variables)
12. [Development Guide](#development-guide)
13. [API Documentation](#api-documentation)

---

## Overview

**PulsePlay** is an AI-powered focus music generator that creates adaptive, real-time music based on your typing rhythm and mouse movements. Built for developers and knowledge workers, it generates personalized ambient soundscapes that respond dynamically to your work patterns.

### Key Features
- **Real-time Rhythm Detection**: Monitors keyboard and mouse activity
- **Adaptive Audio Generation**: Adjusts tempo, frequency, and intensity based on user rhythm
- **AI Mood Analysis**: Provides intelligent insights about your work patterns
- **Multiple Mood Modes**: Calm, Focus, and Energy presets
- **Accessibility Support**: Lower frequency mode for sensory comfort
- **Session Tracking**: Persistent storage of focus sessions with Supabase
- **User Authentication**: Secure login with email/password

---

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Audio Engine**: Web Audio API
- **Icons**: Lucide React

### Architecture Pattern
The application follows a **component-driven architecture** with:
- Custom React hooks for business logic separation
- Service layer for external API communication
- Web Audio API for real-time sound synthesis
- Supabase for backend services (auth, database, serverless functions)

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Components  │  │ Custom Hooks │  │ Services  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                  │                 │       │
│         └──────────────────┴─────────────────┘       │
│                          │                           │
└──────────────────────────┼───────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐       ┌───────▼────────┐
     │  Web Audio API  │       │    Supabase    │
     │  (Sound Engine) │       │ (Auth/DB/Func) │
     └─────────────────┘       └────────────────┘
```

---

## Project Structure

```
pulseplay-ai/
├── src/
│   ├── components/          # React UI components
│   │   ├── AuthButton.tsx        # Authentication UI
│   │   ├── ControlPanel.tsx      # Audio controls
│   │   ├── MoodInsights.tsx      # AI-generated insights
│   │   ├── RhythmVisualizer.tsx  # Visual feedback
│   │   └── SessionStats.tsx      # Session metrics
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAudioEngine.ts         # Audio synthesis logic
│   │   ├── useRhythmDetection.ts     # Rhythm tracking
│   │   └── useSessionPersistence.ts  # Database persistence
│   │
│   ├── services/            # External service integrations
│   │   └── moodService.ts        # AI mood generation API
│   │
│   ├── lib/                 # Utility libraries
│   │   └── supabase.ts          # Supabase client & types
│   │
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
│
├── supabase/
│   ├── functions/
│   │   └── generate-mood/
│   │       └── index.ts     # Edge function for mood analysis
│   │
│   └── migrations/
│       └── *.sql            # Database schema migrations
│
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project overview
```

---

## Core Technologies

### Frontend Stack

#### React 18
- **Version**: 18.3.1
- **Usage**: Core UI framework with hooks-based architecture
- **Key Features Used**:
  - Functional components
  - Custom hooks for logic encapsulation
  - `useEffect`, `useState`, `useCallback`, `useRef`
  - StrictMode for development checks

#### TypeScript 5.5
- **Usage**: Type-safe development
- **Configuration**: Strict mode enabled
- **Benefits**: 
  - Type inference for better DX
  - Interface definitions for API contracts
  - Enhanced IDE support

#### Vite
- **Usage**: Build tool and dev server
- **Benefits**:
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ESM support

#### TailwindCSS 3.4
- **Usage**: Utility-first CSS framework
- **Theme**: Dark theme with slate color palette
- **Custom Configuration**: Minimal custom config, using default theme

### Backend Stack

#### Supabase
- **Services Used**:
  - **Authentication**: Email/password auth with RLS
  - **PostgreSQL Database**: User profiles, preferences, sessions
  - **Edge Functions**: Serverless AI mood generation
  - **Real-time**: Auth state subscription

#### Web Audio API
- **Usage**: Real-time audio synthesis
- **Nodes Used**:
  - `OscillatorNode`: Tone generation
  - `GainNode`: Volume control
  - `BiquadFilterNode`: Frequency filtering
  - `ConvolverNode`: Reverb effect

---

## Features

### 1. Real-time Rhythm Detection
Tracks user keyboard and mouse activity to calculate:
- **BPM (Beats Per Minute)**: Based on keystroke intervals
- **Rhythm Score**: 0-100 scale indicating intensity
- **Intensity Level**: Low, Medium, or High classification
- **Average Interval**: Time between keystrokes

### 2. Adaptive Audio Engine
Dynamically generates music using:
- **Multiple Oscillators**: Sine, triangle, and square waves
- **Frequency Modulation**: Adjusts based on rhythm score
- **Filter Sweeps**: Changes cutoff frequency with intensity
- **Reverb Effects**: Adds spatial depth to the sound
- **Three Mood Modes**:
  - **Calm**: Lower frequencies (130-196 Hz or 261-392 Hz)
  - **Focus**: Mid frequencies (145-220 Hz or 293-440 Hz)
  - **Energy**: Higher frequencies (165-247 Hz or 329-494 Hz)

### 3. AI Mood Analysis
Calls Supabase Edge Function to generate:
- Mood classification (Deep Focus, Productive Flow, High Energy)
- Tempo recommendation
- Descriptive analysis of work patterns
- Personalized suggestions

### 4. Session Persistence
Automatically tracks and stores:
- Session start/end times
- Average rhythm metrics
- Keystroke counts
- Duration in minutes
- Mood preferences
- Session metadata (JSON)

### 5. Accessibility Mode
- Lowers frequency ranges for sensory-friendly experience
- Reduces filter cutoff frequencies
- Maintains musical quality while being gentler

### 6. Visual Feedback
- **Animated Canvas Visualizer**: Pulsing circle that responds to rhythm
- **Color-coded Intensity**: Green (low), Blue (medium), Red (high)
- **Wave Rings**: Animated concentric circles showing activity
- **Real-time BPM Display**: Center of visualizer

---

## Components

### App.tsx
**Main application component** - orchestrates all features

```typescript
Key Responsibilities:
- Session duration tracking
- Coordinating audio engine with rhythm detection
- Managing play/pause state
- Routing props to child components
```

**State Management**:
- `sessionDuration`: Tracks time in seconds
- Integrates `useAudioEngine`, `useRhythmDetection`, `useSessionPersistence`

**Effects**:
1. Updates audio parameters when rhythm changes
2. Manages session timer interval
3. Cleans up on unmount

---

### AuthButton.tsx
**Authentication component** with modal-based sign-in/sign-up

**Features**:
- User session management
- Auth state subscription
- Sign in/sign up modal
- Sign out functionality
- User email display

**Components**:
- `AuthButton`: Main component with auth state
- `AuthModal`: Modal dialog for credentials

**Supabase Integration**:
```typescript
supabase.auth.signUp({ email, password })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()
supabase.auth.onAuthStateChange(callback)
```

---

### ControlPanel.tsx
**Audio control interface** for user interaction

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

**UI Elements**:
- Play/Pause button (Green/Red)
- Mood selector (3 buttons)
- Volume slider (0-100)
- Accessibility mode checkbox

---

### MoodInsights.tsx
**AI-generated insights display** component

**Features**:
- Fetches mood analysis from Edge Function
- Loading state with spinner
- Conditional rendering (requires 10+ keystrokes)
- 5-second debounce before fetching

**Data Displayed**:
- Mood classification
- Detailed description
- Personalized suggestion
- Recommended tempo

---

### RhythmVisualizer.tsx
**Canvas-based audio visualizer** with real-time animation

**Technical Details**:
- Uses `<canvas>` element (300x300px)
- `requestAnimationFrame` for smooth animation
- Radial gradient based on intensity
- Animated wave rings
- Dynamic radius based on rhythm score

**Animation Logic**:
```typescript
baseRadius = 60
maxRadius = 120
radius = baseRadius + (maxRadius - baseRadius) * normalizedScore
phase += 0.05 * (1 + normalizedScore)
```

**Color Mapping**:
- High intensity: Red (239, 68, 68)
- Medium intensity: Blue (59, 130, 246)
- Low intensity: Green (34, 197, 94)

---

### SessionStats.tsx
**Session metrics dashboard** component

**Metrics Displayed**:
1. **Duration**: MM:SS format
2. **Keystrokes**: Total count
3. **Intensity**: Color-coded level
4. **Rhythm Score**: Progress bar (0-100)

**Features**:
- Responsive grid layout
- Color-coded intensity display
- Animated progress bar
- Conditional rendering when active

---

## Custom Hooks

### useAudioEngine.ts
**Core audio synthesis hook** managing Web Audio API

**Exports**:
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

**Audio Context Architecture**:
```
Oscillators (×3) → GainNodes → MasterGain → Filter → Reverb → Destination
```

**Key Functions**:

#### initAudioContext()
- Creates AudioContext
- Sets up audio node graph
- Initializes reverb buffer (2 seconds)
- Configures lowpass filter (2000 Hz base)

#### getMoodFrequencies(mood, accessMode)
Returns frequency arrays:
```typescript
Calm: [261.63, 329.63, 392.0] or [130, 165, 196] (accessible)
Focus: [293.66, 349.23, 440.0] or [145, 175, 220] (accessible)
Energy: [329.63, 392.0, 493.88] or [165, 196, 247] (accessible)
```

#### createOscillators(frequencies, ctx)
- Creates 3 oscillators (sine, triangle, square)
- Sets gain levels (0.3, 0.2, 0.15)
- Connects to master gain
- Starts playback

#### updateAudioParameters(rhythmData)
Real-time parameter modulation:
- Frequency modulation: `baseFreq * (1 + normalizedScore * 0.3)`
- Filter sweep: `1500 + (normalizedScore * 1500)` Hz
- Gain modulation: `baseGain * (0.7 + normalizedScore * 0.3)`
- Uses `linearRampToValueAtTime` for smooth transitions

---

### useRhythmDetection.ts
**Rhythm tracking and analysis hook**

**Exports**:
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

**Algorithm**:

1. **Event Tracking**:
   - Listens to `keydown` events
   - Tracks `mousemove` events
   - Stores timestamps in arrays (50 keystrokes, 30 mouse moves)

2. **Calculation** (every 1 second):
   ```typescript
   // Filter recent keystrokes (last 5 seconds)
   recentKeystrokes = timestamps.filter(ts => now - ts < 5000)
   
   // Calculate intervals
   intervals = [t[i] - t[i-1] for each consecutive pair]
   
   // Average interval
   avgInterval = sum(intervals) / length(intervals)
   
   // Rhythm score (inverse relationship with interval)
   rhythmScore = min(100, 1000 / max(avgInterval, 50))
   
   // BPM calculation
   bpm = (60000 / max(avgInterval, 50)) * 0.25
   
   // Intensity classification
   if (rhythmScore > 70) -> 'high'
   else if (rhythmScore > 40) -> 'medium'
   else -> 'low'
   ```

**Performance Optimizations**:
- Debounced calculation (500ms)
- Limited array sizes (50 keystrokes max)
- Window-based filtering (5-second window)

---

### useSessionPersistence.ts
**Database integration hook** for session tracking

**Responsibilities**:
1. Monitor auth state
2. Create profile on first use
3. Start session when playing begins
4. Update session when playing ends

**Database Operations**:

#### Start Session
```typescript
1. Check for existing profile
2. Create profile if doesn't exist
3. Insert new focus_session record
4. Store session ID in state
```

#### End Session
```typescript
1. Calculate duration from keystroke count
2. Update focus_session with:
   - ended_at timestamp
   - average_rhythm_score
   - average_bpm
   - duration_minutes
   - keystroke_count
   - session_data (JSON)
```

**Error Handling**:
- Try-catch blocks for all DB operations
- Console logging for debugging
- Graceful degradation if DB unavailable

---

## Services

### moodService.ts
**API client** for AI mood generation

**Function**: `generateMood(rhythmData: RhythmData)`

**Implementation**:
```typescript
1. Construct API URL: ${SUPABASE_URL}/functions/v1/generate-mood
2. Set headers with Authorization bearer token
3. POST rhythmData as JSON body
4. Parse MoodResponse from response
5. Handle errors gracefully
```

**Response Type**:
```typescript
interface MoodResponse {
  mood: string;          // "Deep Focus", "Productive Flow", "High Energy"
  tempo: string;         // "Slow", "Moderate", "Fast"
  description: string;   // Detailed analysis
  suggestion: string;    // Personalized recommendation
}
```

---

## Database Schema

### Tables

#### profiles
User account information
```sql
id            uuid PRIMARY KEY (FK to auth.users)
email         text
name          text
created_at    timestamptz
updated_at    timestamptz
```

**RLS Policies**: Users can only view/edit their own profile

---

#### user_preferences
User settings and preferences
```sql
id                  uuid PRIMARY KEY
user_id             uuid FK to profiles
mood_preference     text (default: 'Focus')
volume              integer (default: 70)
instrument_type     text (default: 'Synth')
accessibility_mode  boolean (default: false)
created_at          timestamptz
updated_at          timestamptz

UNIQUE(user_id)
```

**RLS Policies**: Users can only view/edit their own preferences

---

#### focus_sessions
Historical session data
```sql
id                    uuid PRIMARY KEY
user_id               uuid FK to profiles
started_at            timestamptz
ended_at              timestamptz (nullable)
average_rhythm_score  integer
average_bpm           integer
mood_generated        text (nullable)
duration_minutes      integer
keystroke_count       integer
session_data          jsonb (additional metrics)
created_at            timestamptz
```

**Indexes**:
- `idx_focus_sessions_user_id` on user_id
- `idx_focus_sessions_started_at` on started_at DESC

**RLS Policies**: Users can only view/edit their own sessions

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pulseplay-ai.git
   cd pulseplay-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Copy the project URL and anon key
   - Run the migration SQL from `supabase/migrations/`

4. **Configure environment variables**
   Create `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Deploy Edge Function**
   ```bash
   supabase functions deploy generate-mood
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

---

## Environment Variables

### Required Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Variable Usage

- **VITE_SUPABASE_URL**: Base URL for Supabase API
  - Used in: `src/lib/supabase.ts`, `src/services/moodService.ts`

- **VITE_SUPABASE_ANON_KEY**: Anonymous/public API key
  - Used for client-side authentication and API calls
  - RLS policies protect user data

---

## Development Guide

### npm Scripts

```json
{
  "dev": "vite",              // Start dev server (localhost:5173)
  "build": "vite build",      // Build for production
  "lint": "eslint .",         // Run ESLint
  "preview": "vite preview",  // Preview production build
  "typecheck": "tsc --noEmit" // Check TypeScript errors
}
```

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Imports**: Absolute paths from `src/`
- **Components**: PascalCase
- **Functions**: camelCase
- **Types**: PascalCase with `Type` or `Interface` suffix

### Adding New Features

#### 1. New Component
```bash
# Create component file
touch src/components/YourComponent.tsx

# Import in App.tsx
import { YourComponent } from './components/YourComponent';
```

#### 2. New Hook
```bash
# Create hook file
touch src/hooks/useYourHook.ts

# Use in component
import { useYourHook } from '../hooks/useYourHook';
```

#### 3. New Database Table
```sql
-- Create migration file
-- supabase/migrations/[timestamp]_your_migration.sql

-- Run migration via Supabase dashboard or CLI
supabase db push
```

### Debugging Tips

1. **Audio Issues**:
   - Check browser console for Web Audio API errors
   - Ensure user interaction before starting audio (browser policy)
   - Verify AudioContext state (suspended/running)

2. **Authentication Issues**:
   - Check Supabase project settings
   - Verify environment variables
   - Check browser console for auth errors

3. **Database Issues**:
   - Verify RLS policies in Supabase dashboard
   - Check user is authenticated before DB operations
   - Use Supabase logs for error details

---

## API Documentation

### Supabase Edge Function: generate-mood

**Endpoint**: `POST /functions/v1/generate-mood`

**Headers**:
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

**Response**:
```typescript
{
  mood: string;         // "Deep Focus" | "Productive Flow" | "High Energy"
  tempo: string;        // "Slow" | "Moderate" | "Fast"
  description: string;  // Detailed analysis
  suggestion: string;   // Personalized recommendation
}
```

**Logic**:
```typescript
if (rhythmScore < 30 || bpm < 40) {
  return "Deep Focus" (Slow tempo)
} else if (rhythmScore < 60 || bpm < 80) {
  return "Productive Flow" (Moderate tempo)
} else {
  return "High Energy" (Fast tempo)
}

// Additional suggestion if keystrokeCount > 500
suggestion += " Consider a short break to maintain quality."
```

**Error Response**:
```typescript
{
  error: string;
  details: string;
}
```

---

## Performance Considerations

### Audio Engine
- Uses `linearRampToValueAtTime` for smooth parameter changes
- Limits oscillator count to 3 for CPU efficiency
- Cleanup on unmount prevents memory leaks
- Reverb buffer calculated once and reused

### Rhythm Detection
- Debounced calculations (1 second interval)
- Limited array sizes prevent memory growth
- Window-based filtering (5 seconds) reduces computation
- Event listeners properly cleaned up

### Database
- Batch updates during session end (not real-time)
- Indexes on frequently queried columns
- RLS policies prevent unnecessary data access
- Connection pooling handled by Supabase

### React Rendering
- `useCallback` prevents function recreation
- `useRef` for values that don't need re-renders
- Conditional rendering reduces DOM updates
- Canvas animation in separate render loop

---

## Browser Compatibility

### Required Features
- Web Audio API (all modern browsers)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Local Storage

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Limitations
- Web Audio API requires user gesture to start (browser security)
- Mobile devices may have reduced audio quality
- Safari may require additional permissions for microphone/audio

---

## Future Enhancements

### Potential Features
1. **More Instrument Types**: Piano, strings, ambient pads
2. **Custom BPM Ranges**: User-defined tempo limits
3. **Session Analytics**: Charts and trends over time
4. **Collaborative Sessions**: Shared focus rooms
5. **Pomodoro Integration**: Timed focus sessions
6. **Spotify Integration**: Blend generated audio with music
7. **Export Sessions**: Download audio recordings
8. **Mobile App**: React Native version
9. **Machine Learning**: More sophisticated mood detection
10. **Binaural Beats**: Frequency patterns for focus

### Technical Debt
- Add comprehensive unit tests (Jest + React Testing Library)
- E2E tests with Playwright
- Error boundary components
- Offline support with Service Workers
- Performance monitoring (Sentry/LogRocket)
- Accessibility audit (WCAG 2.1 AA compliance)

---

## Contributing

### Code Review Checklist
- [ ] TypeScript types defined for all functions
- [ ] Components have proper prop types
- [ ] Hooks use proper dependencies in useEffect
- [ ] No memory leaks (cleanup in useEffect)
- [ ] Error handling for async operations
- [ ] Console.log statements removed
- [ ] Responsive design tested
- [ ] Accessibility considered

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature

# Create Pull Request on GitHub
```

---

## License

This project is built for an open-source hackathon. License details to be added.

---

## Support & Contact

For questions, issues, or contributions:
- GitHub Issues: [Project Issues Page]
- Email: [Contact Email]
- Discord: [Community Server]

---

**Last Updated**: October 18, 2025
**Version**: 0.0.0
**Author**: PulsePlay Team
