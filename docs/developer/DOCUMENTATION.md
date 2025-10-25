# PulsePlay - Complete Technical Documentation

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
- **Session Tracking**: Persistent storage of focus sessions with MongoDB
- **User Authentication**: Secure login with Auth0
- **Docker Deployment**: Containerized deployment with docker-compose

---

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + TypeScript + MongoDB + Auth0
- **Audio Engine**: Web Audio API
- **Deployment**: Docker + Docker Compose + GitHub Actions
- **Icons**: Lucide React

### Architecture Pattern
The application follows a **microservices architecture** with:
- Separate frontend and backend services
- RESTful API communication
- Containerized deployment
- Web Audio API for real-time sound synthesis
- MongoDB for data persistence

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React         │◄──────────────►│   Express.js    │
│   Frontend      │                 │   Backend       │
│   (Port 5173)   │                 │   (Port 3001)   │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │ Web Audio API                     │ Auth0
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Browser       │                 │   MongoDB       │
│   Audio Engine  │                 │   Database      │
└─────────────────┘                 └─────────────────┘
```

---

## Project Structure

```
pulseplay/
├── src/                          # Frontend React Application
│   ├── components/               # React UI Components
│   │   ├── AudioTest.tsx         # Audio testing interface
│   │   ├── AuthButton.tsx        # Auth0 authentication UI
│   │   ├── ControlPanel.tsx      # Audio control interface
│   │   ├── SongInsights.tsx      # AI song analysis display
│   │   ├── RhythmVisualizer.tsx  # Real-time rhythm visualization
│   │   └── SessionStats.tsx      # Session metrics dashboard
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useAudioEngine.ts     # Audio synthesis management
│   │   ├── useRhythmDetection.ts # Keyboard/mouse tracking
│   │   └── useSessionPersistence.ts # Session data persistence
│   │
│   ├── services/                 # External API Services
│   │   └── moodService.ts        # Gemini AI mood analysis
│   │
│   ├── types/                    # TypeScript Type Definitions
│   ├── utils/                    # Utility Functions
│   └── lib/                      # Library Configurations
│
├── backend/                      # Backend Express.js API
│   ├── src/
│   │   ├── server.ts             # Express server setup
│   │   ├── routes/               # API route handlers
│   │   │   ├── auth.ts           # Auth0 authentication routes
│   │   │   ├── sessions.ts       # Session management routes
│   │   │   └── ai.ts             # AI mood analysis routes
│   │   ├── services/             # Business logic services
│   │   │   ├── authService.ts    # Auth0 integration
│   │   │   ├── sessionService.ts # Session data management
│   │   │   └── aiService.ts      # Gemini AI integration
│   │   ├── models/               # MongoDB data models
│   │   │   └── Session.ts        # Session schema
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts           # Auth0 JWT validation
│   │   │   └── cors.ts           # CORS configuration
│   │   ├── config/               # Configuration files
│   │   └── utils/                # Backend utilities
│   └── package.json              # Backend dependencies
│
├── docker/                       # Docker Configuration
│   ├── docker-compose.yml        # Local development (MongoDB)
│   ├── docker-compose.atlas.yml  # Production (MongoDB Atlas)
│   ├── docker-compose.dev.yml    # Development with hot reload
│   ├── Dockerfile                # Backend production build
│   ├── Dockerfile.dev            # Development builds
│   └── nginx.conf                # Nginx configuration
│
├── docs/                         # Documentation
├── .github/workflows/            # CI/CD Pipelines
└── package.json                  # Frontend dependencies
```

---

## Core Technologies

### Frontend Stack

#### React 18.3
- **Version**: 18.3.1
- **Usage**: Core UI framework with hooks-based architecture
- **Key Features Used**:
  - Functional components with hooks
  - Context API for global state
  - Suspense for loading states
  - StrictMode for development checks

#### TypeScript 5.5
- **Usage**: Type-safe development across frontend and backend
- **Configuration**: Strict mode enabled
- **Benefits**:
  - Compile-time error checking
  - Enhanced IDE support with IntelliSense
  - Better refactoring capabilities
  - Self-documenting code with types

#### Vite 5.4
- **Usage**: Fast build tool and development server
- **Benefits**:
  - Lightning-fast HMR (Hot Module Replacement)
  - Native ESM support
  - Optimized production builds
  - Plugin ecosystem

#### TailwindCSS 3.4
- **Usage**: Utility-first CSS framework
- **Theme**: Dark theme with slate color palette
- **Custom Configuration**: Minimal custom config, using default theme

### Backend Stack

#### Express.js
- **Version**: 4.19
- **Usage**: RESTful API server with TypeScript
- **Key Features**:
  - Middleware architecture
  - Route organization
  - Error handling
  - CORS support

#### MongoDB with Mongoose
- **Usage**: NoSQL database for session data
- **Features**:
  - Schema validation
  - Middleware support
  - Query building
  - Connection pooling

#### Auth0
- **Usage**: Authentication and authorization
- **Integration**: JWT validation middleware
- **Features**: Social login, user management, token refresh

#### Google Gemini AI
- **Usage**: AI-powered mood analysis
- **Integration**: REST API calls with authentication
- **Features**: Natural language processing for work pattern analysis

### DevOps Stack

#### Docker & Docker Compose
- **Usage**: Containerization and orchestration
- **Benefits**:
  - Consistent environments
  - Easy deployment
  - Service isolation
  - Volume management

#### GitHub Actions
- **Usage**: CI/CD pipeline automation
- **Features**:
  - Automated testing
  - Docker image building
  - Security scanning
  - Multi-environment deployment

---

## Features

### 1. Real-time Rhythm Detection
Tracks user keyboard and mouse activity to calculate:
- **BPM (Beats Per Minute)**: Based on keystroke intervals
- **Rhythm Score**: 0-100 scale indicating activity intensity
- **Intensity Level**: Low, Medium, or High classification
- **Average Interval**: Time between keystrokes in milliseconds

### 2. Adaptive Audio Engine
Dynamically generates music using:
- **Multiple Oscillators**: Sine, triangle, and square waves
- **Frequency Modulation**: Adjusts based on rhythm score
- **Filter Sweeps**: Changes cutoff frequency with activity
- **Reverb Effects**: Adds spatial depth to the sound
- **Three Mood Modes**:
  - **Calm**: Lower frequencies (130-196 Hz or 261-392 Hz accessible)
  - **Focus**: Standard frequencies (293-440 Hz)
  - **Energy**: Higher frequencies (329-494 Hz)

### 3. AI Mood Analysis
Integrates with Google Gemini AI to generate:
- Mood classification (Deep Focus, Productive Flow, High Energy)
- Tempo recommendations based on work patterns
- Detailed analysis of typing rhythm and consistency
- Personalized suggestions for optimal focus

### 4. Session Persistence
Automatically tracks and stores:
- Session start/end timestamps
- Average rhythm metrics (BPM, intensity)
- Total keystroke counts
- Session duration in minutes
- Mood preferences and AI insights
- User identification via Auth0

### 5. Accessibility Mode
- Reduces frequency ranges for sensory-friendly experience
- Lowers filter cutoff frequencies
- Maintains musical quality while being gentler on sensitive users

### 6. Visual Feedback
- **Animated Canvas Visualizer**: Pulsing circle that responds to rhythm
- **Color-coded Intensity**: Green (low), Blue (medium), Red (high)
- **Wave Rings**: Animated concentric circles showing activity
- **Real-time BPM Display**: Center of visualizer
- **Session Statistics**: Duration, keystrokes, current intensity

---

## Components

### App.tsx
**Main application orchestrator** - coordinates all features

**Key Responsibilities**:
- Session duration tracking with automatic timer
- Coordinating audio engine with rhythm detection
- Managing play/pause state and user controls
- Routing data between components
- Error boundary implementation

**State Management**:
- `sessionDuration`: Tracks time in seconds
- `isPlaying`: Audio engine state
- `currentMood`: Selected mood preset
- Integrates `useAudioEngine`, `useRhythmDetection`, `useSessionPersistence`

**Effects**:
1. Updates audio parameters when rhythm changes
2. Manages session timer interval (1-second updates)
3. Saves session data on component unmount
4. Handles keyboard shortcuts

---

### AuthButton.tsx
**Authentication interface** with Auth0 integration

**Features**:
- Login/logout functionality
- Auth state management
- User profile display
- Error handling for auth failures
- Responsive design for mobile/desktop

**Auth0 Integration**:
```typescript
// Login redirect
auth0.loginWithRedirect()

// Logout with return URL
auth0.logout({ returnTo: window.location.origin })

// Get user profile
const user = await auth0.getUser()
```

---

### ControlPanel.tsx
**Audio control dashboard** for user interaction

**Props**:
```typescript
interface ControlPanelProps {
  isPlaying: boolean;
  currentMood: MoodType;
  volume: number;
  accessibilityMode: boolean;
  onPlayPause: () => void;
  onMoodChange: (mood: MoodType) => void;
  onVolumeChange: (volume: number) => void;
  onAccessibilityToggle: () => void;
}
```

**UI Elements**:
- Play/Pause button (Green/Red with icons)
- Mood selector (3-button group)
- Volume slider (0-100 with percentage display)
- Accessibility mode toggle
- Responsive grid layout

---

### SongInsights.tsx
**AI-generated song recommendations panel** with Gemini integration

**Features**:
- Fetches song analysis from backend API
- Loading states with skeleton UI
- Conditional rendering (requires 10+ keystrokes)
- 5-second debounce to prevent API spam
- Error handling for API failures

**Data Displayed**:
- Current mood classification
- Detailed description of work patterns
- Recommended tempo adjustments
- Personalized productivity suggestions

---

### RhythmVisualizer.tsx
**Canvas-based audio visualizer** with WebGL acceleration

**Technical Details**:
- HTML5 Canvas element (300x300px)
- `requestAnimationFrame` for 60fps animation
- Radial gradient backgrounds
- Dynamic circle radius based on rhythm score
- Animated wave rings with phase offsets

**Animation Logic**:
```typescript
const baseRadius = 60;
const maxRadius = 120;
const radius = baseRadius + (maxRadius - baseRadius) * normalizedScore;
const phase = (Date.now() * 0.005) % (Math.PI * 2);
```

**Color Mapping**:
- High intensity: Red (239, 68, 68)
- Medium intensity: Blue (59, 130, 246)
- Low intensity: Green (34, 197, 94)

---

### SessionStats.tsx
**Session metrics dashboard** with real-time updates

**Metrics Displayed**:
1. **Duration**: MM:SS format with live updates
2. **Keystrokes**: Running count of keyboard activity
3. **Intensity**: Color-coded level indicator
4. **Rhythm Score**: Progress bar (0-100 scale)

**Features**:
- Responsive card layout
- Animated progress bars
- Color-coded intensity levels
- Conditional rendering during active sessions

---

## Custom Hooks

### useAudioEngine.ts
**Core audio synthesis management** hook

**Exports**:
```typescript
{
  isPlaying: boolean;
  currentMood: MoodType;
  volume: number;
  accessibilityMode: boolean;
  play: () => void;
  pause: () => void;
  setMood: (mood: MoodType) => void;
  setVolume: (volume: number) => void;
  toggleAccessibility: () => void;
  updateAudioParameters: (rhythmData: RhythmData) => void;
}
```

**Audio Architecture**:
```
AudioContext
├── Oscillators (×3) [sine, triangle, square]
├── GainNodes (×3) [volume control per oscillator]
├── MasterGain [overall volume]
├── Filter [lowpass filter]
├── Reverb [convolver node]
└── Destination [speakers]
```

**Key Functions**:

#### initAudioContext()
- Creates AudioContext with error handling
- Sets up audio node graph
- Initializes reverb impulse response
- Configures filter parameters

#### getMoodFrequencies(mood, accessibility)
Returns frequency arrays for different moods:
```typescript
Calm: [261.63, 329.63, 392.0] or [130, 165, 196] (accessible)
Focus: [293.66, 349.23, 440.0]
Energy: [329.63, 392.0, 493.88]
```

#### createOscillators(frequencies, ctx)
- Creates 3 oscillators with different waveforms
- Sets gain levels (0.3, 0.2, 0.15 for mix balance)
- Connects to master gain node
- Starts playback with slight detuning for richness

#### updateAudioParameters(rhythmData)
Real-time audio modulation:
- Frequency modulation: `baseFreq * (1 + normalizedScore * 0.3)`
- Filter sweep: `1500 + (normalizedScore * 1500)` Hz
- Gain modulation: `baseGain * (0.7 + normalizedScore * 0.3)`
- Smooth transitions using `linearRampToValueAtTime`

---

### useRhythmDetection.ts
**Keyboard and mouse activity tracking** hook

**Exports**:
```typescript
{
  rhythmData: RhythmData;
  resetRhythm: () => void;
}
```

**RhythmData Interface**:
```typescript
interface RhythmData {
  bpm: number;
  intensity: number;
  score: number;
  averageInterval: number;
  keystrokeCount: number;
}
```

**Tracking Logic**:
- Keyboard event listeners for keydown events
- Mouse event listeners for mousedown events
- Timestamp recording for interval calculation
- Moving average calculations for BPM
- Intensity classification (Low: <30, Medium: 30-70, High: >70)

**Algorithm**:
1. Record timestamp on each keystroke
2. Calculate intervals between keystrokes
3. Compute average interval and convert to BPM
4. Calculate rhythm consistency score
5. Update intensity level based on activity

---

### useSessionPersistence.ts
**Session data management** with MongoDB integration

**Exports**:
```typescript
{
  saveSession: (sessionData: SessionData) => Promise<void>;
  loadSessions: () => Promise<SessionData[]>;
  isLoading: boolean;
  error: string | null;
}
```

**SessionData Interface**:
```typescript
interface SessionData {
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  keystrokes: number;
  averageBpm: number;
  averageIntensity: number;
  mood: MoodType;
  aiInsights?: AIInsights;
}
```

**Features**:
- Automatic session saving on app close
- Session history loading with pagination
- Error handling for network failures
- Optimistic updates for better UX
- Data validation before API calls

---

## Services

### moodService.ts
**Gemini AI integration** for mood analysis

**API Calls**:
```typescript
// Analyze work patterns
const insights = await moodService.analyzeMood({
  bpm: rhythmData.bpm,
  intensity: rhythmData.intensity,
  keystrokes: rhythmData.keystrokeCount,
  duration: sessionDuration
});
```

**Response Format**:
```typescript
interface AIInsights {
  mood: string;
  description: string;
  recommendation: string;
  tempo: number;
}
```

**Error Handling**:
- Network timeout handling
- API quota exceeded handling
- Invalid response format handling
- Fallback to default insights

---

## Database Schema

### Session Model (MongoDB)

```typescript
interface Session {
  _id: ObjectId;
  userId: string;           // Auth0 user ID
  startTime: Date;          // Session start timestamp
  endTime: Date;            // Session end timestamp
  duration: number;         // Duration in minutes
  keystrokes: number;       // Total keystroke count
  averageBpm: number;       // Average BPM during session
  averageIntensity: number; // Average intensity (0-100)
  mood: 'calm' | 'focus' | 'energy';
  aiInsights?: {
    mood: string;
    description: string;
    recommendation: string;
    tempo: number;
  };
  createdAt: Date;          // Auto-generated timestamp
  updatedAt: Date;          // Auto-updated timestamp
}
```

### Indexes
```javascript
// Performance indexes
db.sessions.createIndex({ userId: 1, createdAt: -1 });
db.sessions.createIndex({ userId: 1, mood: 1 });

// TTL index for auto-deletion (90 days)
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 }
);
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas)
- Auth0 account
- Google Gemini API key

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay
```

2. **Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Environment Setup**
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env

# Edit with your credentials
nano .env
nano backend/.env
```

4. **Start Development**
```bash
# Option 1: Local development
npm run dev:all

# Option 2: Docker development
docker-compose -f docker-compose.dev.yml up
```

---

## Environment Variables

### Frontend (.env)
```bash
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=http://localhost:3001

# Optional
VITE_DEBUG=true
```

### Backend (backend/.env)
```bash
# Server
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/pulseplay

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## Development Guide

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with TypeScript support
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

### Testing Strategy
- **Unit Tests**: Component and hook testing with Vitest
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User journey testing with Playwright
- **Coverage**: Minimum 80% coverage required

### Git Workflow
1. Create feature branch from `main`
2. Make changes with tests
3. Run `npm run typecheck` and `npm test`
4. Commit with conventional format
5. Create pull request
6. Code review and merge

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Initiates Auth0 login flow
**Response**: Redirect to Auth0

#### POST /api/auth/logout
Logs out current user
**Response**: Success confirmation

#### GET /api/auth/user
Gets current user profile
**Response**: User object or 401 if not authenticated

### Session Endpoints

#### POST /api/sessions
Creates a new focus session
```json
{
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T11:30:00Z",
  "duration": 90,
  "keystrokes": 2450,
  "averageBpm": 85,
  "averageIntensity": 65,
  "mood": "focus"
}
```

#### GET /api/sessions
Gets user's session history
**Query Parameters**:
- `limit`: Number of sessions (default: 10)
- `offset`: Pagination offset (default: 0)

#### GET /api/sessions/:id
Gets specific session details

#### PUT /api/sessions/:id
Updates session data

#### DELETE /api/sessions/:id
Deletes a session

### AI Endpoints

#### POST /api/ai/mood-analysis
Analyzes work patterns with Gemini AI
```json
{
  "bpm": 85,
  "intensity": 65,
  "keystrokes": 2450,
  "duration": 90
}
```

**Response**:
```json
{
  "mood": "Deep Focus",
  "description": "Your typing rhythm shows consistent, focused work patterns...",
  "recommendation": "Consider maintaining this rhythm for optimal productivity",
  "tempo": 88
}
```

### Health Check

#### GET /api/health
Service health check
**Response**: `{"status": "healthy", "timestamp": "2024-01-01T12:00:00Z"}`

---

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Route-based splitting with Vite
- **Lazy Loading**: Component lazy loading for better initial load
- **Memoization**: React.memo for expensive components
- **Web Audio API**: Efficient audio processing with minimal latency

### Backend Optimization
- **Connection Pooling**: MongoDB connection reuse
- **Caching**: Response caching for AI analysis
- **Rate Limiting**: API rate limiting to prevent abuse
- **Compression**: Response compression with gzip

### Database Optimization
- **Indexing**: Proper indexes on frequently queried fields
- **TTL Indexes**: Automatic cleanup of old sessions
- **Aggregation**: Efficient data aggregation for analytics
- **Connection Limits**: Appropriate connection pool sizing

---

## Security Considerations

### Authentication
- JWT token validation on all protected routes
- Secure token storage in HTTP-only cookies
- Automatic token refresh handling
- Proper logout with token invalidation

### API Security
- CORS configuration for allowed origins
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Error message sanitization (no stack traces in production)

### Data Protection
- User data isolation by Auth0 user ID
- No PII storage beyond user ID
- Session data encryption at rest
- Secure MongoDB connection with TLS

---

## Deployment

### Docker Deployment
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production with local MongoDB
docker-compose -f docker-compose.yml up -d

# Production with MongoDB Atlas
docker-compose -f docker-compose.atlas.yml up -d
```

### Environment-Specific Builds
- **Development**: Hot reload, source maps, debug logging
- **Production**: Minified code, optimized assets, error logging
- **Staging**: Production build with debug logging enabled

---

## Monitoring & Analytics

### Application Metrics
- Session duration tracking
- User engagement metrics
- Audio performance monitoring
- API response times

### Error Tracking
- Frontend error boundaries
- Backend error logging
- Auth0 authentication errors
- AI service failures

### Performance Monitoring
- Web Vitals tracking
- Audio context performance
- Database query performance
- API endpoint latency

---

## Contributing

See [CONTRIBUTING.md](../public/CONTRIBUTING.md) for detailed contribution guidelines.

---

## License

This project is licensed under the MIT License.

---

## Support

- **Documentation**: This file and related docs
- **Issues**: [GitHub Issues](https://github.com/juxtaduo/pulseplay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/juxtaduo/pulseplay/discussions)
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
pulseplay/
├── src/
│   ├── components/          # React UI components
│   │   ├── AuthButton.tsx        # Authentication UI
│   │   ├── ControlPanel.tsx      # Audio controls
│   │   ├── SongInsights.tsx      # AI-generated insights
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

### SongInsights.tsx
**AI-generated song recommendations display** component

**Features**:
- Fetches song analysis from Edge Function
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
   git clone https://github.com/yourusername/pulseplay.git
   cd pulseplay
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
