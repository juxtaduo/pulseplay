# PulsePlay - REST API Reference

**Version**: 2.0.0
**Base URL**: `http://localhost:3001` (development) / `https://your-backend-domain.com` (production)
**Authentication**: JWT Bearer tokens via Auth0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Sessions API](#sessions-api)
3. [AI API](#ai-api)
4. [Health Check](#health-check)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Type Definitions](#type-definitions)

---

## Authentication

All API endpoints require authentication via JWT tokens from Auth0. Include the token in the `Authorization` header:

```
Authorization: Bearer <auth0_jwt_token>
```

### Getting Auth Tokens

1. **Frontend**: Use Auth0 SDK to get tokens
```typescript
import { useAuth0 } from '@auth0/auth0-react';

const { getAccessTokenSilently } = useAuth0();

const token = await getAccessTokenSilently({
  audience: 'https://api.pulseplay.ai'
});
```

2. **Direct API**: Call Auth0 token endpoint
```bash
curl -X POST https://your-tenant.auth0.com/oauth/token \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "audience": "https://api.pulseplay.ai",
    "grant_type": "client_credentials"
  }'
```

### Token Validation

The backend automatically validates JWT tokens using Auth0's JWKS endpoint. Invalid or expired tokens return `401 Unauthorized`.

---

## Sessions API

Manage focus sessions with full CRUD operations.

### POST /api/sessions

Create a new focus session.

**Request Body**:
```json
{
  "startTime": "2024-01-01T10:00:00.000Z",
  "endTime": "2024-01-01T11:30:00.000Z",
  "duration": 90,
  "keystrokes": 2450,
  "averageBpm": 85,
  "averageIntensity": 65,
  "mood": "focus",
  "aiInsights": {
    "mood": "Deep Focus",
    "description": "Your typing rhythm shows consistent, focused work patterns...",
    "recommendation": "Consider maintaining this rhythm for optimal productivity",
    "tempo": 88
  }
}
```

**Response (201)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "auth0|123456789",
  "startTime": "2024-01-01T10:00:00.000Z",
  "endTime": "2024-01-01T11:30:00.000Z",
  "duration": 90,
  "keystrokes": 2450,
  "averageBpm": 85,
  "averageIntensity": 65,
  "mood": "focus",
  "aiInsights": {
    "mood": "Deep Focus",
    "description": "Your typing rhythm shows consistent, focused work patterns...",
    "recommendation": "Consider maintaining this rhythm for optimal productivity",
    "tempo": 88
  },
  "createdAt": "2024-01-01T11:30:00.000Z",
  "updatedAt": "2024-01-01T11:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid JWT token
- `500 Internal Server Error`: Database error

---

### GET /api/sessions

Retrieve user's focus sessions with pagination.

**Query Parameters**:
- `limit` (optional): Number of sessions to return (default: 10, max: 100)
- `offset` (optional): Number of sessions to skip (default: 0)
- `mood` (optional): Filter by mood ("calm", "focus", "energy")
- `startDate` (optional): Filter sessions after this date (ISO 8601)
- `endDate` (optional): Filter sessions before this date (ISO 8601)

**Example Requests**:
```bash
# Get latest 10 sessions
GET /api/sessions

# Get focus sessions with pagination
GET /api/sessions?limit=20&offset=10&mood=focus

# Get sessions from last week
GET /api/sessions?startDate=2024-01-01T00:00:00.000Z
```

**Response (200)**:
```json
{
  "sessions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "auth0|123456789",
      "startTime": "2024-01-01T10:00:00.000Z",
      "endTime": "2024-01-01T11:30:00.000Z",
      "duration": 90,
      "keystrokes": 2450,
      "averageBpm": 85,
      "averageIntensity": 65,
      "mood": "focus",
      "aiInsights": {
        "mood": "Deep Focus",
        "description": "Your typing rhythm shows consistent, focused work patterns...",
        "recommendation": "Consider maintaining this rhythm for optimal productivity",
        "tempo": 88
      },
      "createdAt": "2024-01-01T11:30:00.000Z",
      "updatedAt": "2024-01-01T11:30:00.000Z"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

---

### GET /api/sessions/:id

Retrieve a specific session by ID.

**Path Parameters**:
- `id`: Session MongoDB ObjectId

**Response (200)**: Single session object (same format as above)

**Error Responses**:
- `404 Not Found`: Session not found or doesn't belong to user
- `401 Unauthorized`: Missing or invalid JWT token

---

### PUT /api/sessions/:id

Update an existing session.

**Path Parameters**:
- `id`: Session MongoDB ObjectId

**Request Body**: Same as POST, but all fields optional

**Response (200)**: Updated session object

**Error Responses**:
- `404 Not Found`: Session not found or doesn't belong to user
- `400 Bad Request`: Invalid update data
- `401 Unauthorized`: Missing or invalid JWT token

---

### DELETE /api/sessions/:id

Delete a session.

**Path Parameters**:
- `id`: Session MongoDB ObjectId

**Response (200)**:
```json
{
  "message": "Session deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Session not found or doesn't belong to user
- `401 Unauthorized`: Missing or invalid JWT token

---

## AI API

Generate song insights using Google Gemini AI.

### POST /api/ai/mood-analysis

Analyze work patterns and generate AI insights.

**Request Body**:
```json
{
  "bpm": 85,
  "intensity": 65,
  "keystrokes": 2450,
  "duration": 90
}
```

**Response (200)**:
```json
{
  "mood": "Deep Focus",
  "description": "Your typing rhythm shows consistent, focused work patterns with steady intensity. This suggests you're in a productive flow state with good concentration levels.",
  "recommendation": "Consider maintaining this rhythm for optimal productivity. Your current pace indicates strong focus without burnout.",
  "tempo": 88
}
```

**Mood Classifications**:
- **"Deep Focus"**: Low-medium intensity, steady rhythm
- **"Productive Flow"**: Medium intensity, consistent patterns
- **"High Energy"**: High intensity, fast-paced work
- **"Scattered"**: Inconsistent rhythm, varying intensity
- **"Warming Up"**: Low activity, building momentum

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI service unavailable

---

## Health Check

### GET /api/health

Check API service health and connectivity.

**Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "2.0.0",
  "services": {
    "mongodb": "connected",
    "auth0": "available",
    "gemini": "available"
  }
}
```

**Response (503)**: Service unhealthy
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "mongodb": "disconnected",
    "auth0": "available",
    "gemini": "error"
  }
}
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "duration",
      "issue": "must be a positive number"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authenticated endpoints**: 100 requests per 15 minutes per user
- **AI endpoints**: 10 requests per minute per user
- **Health check**: Unlimited

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

---

## Type Definitions

### Session Types

```typescript
interface Session {
  _id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  keystrokes: number;
  averageBpm: number;
  averageIntensity: number; // 0-100
  mood: 'calm' | 'focus' | 'energy';
  aiInsights?: AIInsights;
  createdAt: Date;
  updatedAt: Date;
}

interface AIInsights {
  mood: string;
  description: string;
  recommendation: string;
  tempo: number;
}
```

### API Request/Response Types

```typescript
// Create session request
interface CreateSessionRequest {
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  duration: number;
  keystrokes: number;
  averageBpm: number;
  averageIntensity: number;
  mood: 'calm' | 'focus' | 'energy';
  aiInsights?: AIInsights;
}

// Sessions list response
interface SessionsResponse {
  sessions: Session[];
  total: number;
  limit: number;
  offset: number;
}

// AI analysis request
interface MoodAnalysisRequest {
  bpm: number;
  intensity: number; // 0-100
  keystrokes: number;
  duration: number; // minutes
}

// AI analysis response
interface MoodAnalysisResponse {
  mood: string;
  description: string;
  recommendation: string;
  tempo: number;
}

// Error response
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Frontend Service Integration

```typescript
// sessionsService.ts
class SessionsService {
  private apiUrl: string;
  private getAuthToken: () => Promise<string>;

  constructor(apiUrl: string, getAuthToken: () => Promise<string>) {
    this.apiUrl = apiUrl;
    this.getAuthToken = getAuthToken;
  }

  async createSession(sessionData: CreateSessionRequest): Promise<Session> {
    const token = await this.getAuthToken();
    const response = await fetch(`${this.apiUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async getSessions(params?: {
    limit?: number;
    offset?: number;
    mood?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SessionsResponse> {
    const token = await this.getAuthToken();
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.mood) queryParams.set('mood', params.mood);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);

    const response = await fetch(
      `${this.apiUrl}/api/sessions?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }
}

// moodService.ts
class MoodService {
  private apiUrl: string;
  private getAuthToken: () => Promise<string>;

  constructor(apiUrl: string, getAuthToken: () => Promise<string>) {
    this.apiUrl = apiUrl;
    this.getAuthToken = getAuthToken;
  }

  async analyzeMood(analysisData: MoodAnalysisRequest): Promise<MoodAnalysisResponse> {
    const token = await this.getAuthToken();
    const response = await fetch(`${this.apiUrl}/api/ai/mood-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(analysisData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }
}
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl -X GET http://localhost:3001/api/health

# Create session (replace TOKEN with actual JWT)
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "startTime": "2024-01-01T10:00:00.000Z",
    "endTime": "2024-01-01T11:30:00.000Z",
    "duration": 90,
    "keystrokes": 2450,
    "averageBpm": 85,
    "averageIntensity": 65,
    "mood": "focus"
  }'

# Get sessions
curl -X GET http://localhost:3001/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# AI mood analysis
curl -X POST http://localhost:3001/api/ai/mood-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bpm": 85,
    "intensity": 65,
    "keystrokes": 2450,
    "duration": 90
  }'
```

### Using Postman

1. **Set Base URL**: `http://localhost:3001` or your production URL
2. **Set Authorization**: Bearer Token (paste JWT from Auth0)
3. **Import Collection**: Use the examples above to create requests

---

## SDK Examples

### JavaScript/TypeScript Client

```typescript
// apiClient.ts
class PulsePlayAPI {
  constructor(private baseUrl: string, private getToken: () => Promise<string>) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Network error' } }));
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  // Sessions
  async createSession(data: CreateSessionRequest) {
    return this.request<Session>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getSessions(params?: { limit?: number; offset?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request<SessionsResponse>(`/api/sessions${query}`);
  }

  // AI
  async analyzeMood(data: MoodAnalysisRequest) {
    return this.request<MoodAnalysisResponse>('/api/ai/mood-analysis', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Health
  async healthCheck() {
    return this.request<{ status: string }>('/api/health');
  }
}

// Usage with Auth0
import { useAuth0 } from '@auth0/auth0-react';

const usePulsePlayAPI = () => {
  const { getAccessTokenSilently } = useAuth0();

  return new PulsePlayAPI(
    import.meta.env.VITE_API_URL || 'http://localhost:3001',
    () => getAccessTokenSilently({ audience: 'https://api.pulseplay.ai' })
  );
};
```

---

## Changelog

### Version 2.0.0 (Current)
- Complete rewrite for Express.js + MongoDB + Auth0 architecture
- Removed Supabase dependencies
- Added JWT authentication
- Updated all endpoint signatures
- Added comprehensive error handling
- Included rate limiting documentation

### Version 1.0.0 (Legacy)
- Supabase-based API with Edge Functions
- Real-time subscriptions
- Row Level Security (RLS)

---

**Last Updated**: October 18, 2025

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
- `mood: string` - Current song setting

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

### SongInsights

**Props**:
```typescript
interface SongInsightsProps {
  rhythmData: RhythmData;
  isPlaying: boolean;
}
```

**Usage**:
```typescript
<SongInsights
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
