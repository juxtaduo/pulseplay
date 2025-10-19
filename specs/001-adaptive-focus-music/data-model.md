# Data Model: Adaptive Focus Music Engine

**Feature**: 001-adaptive-focus-music  
**Date**: 2025-10-18  
**Status**: Complete

This document defines the data entities, MongoDB schemas, and relationships for the Adaptive Focus Music Engine feature.

---

## Entity Overview

| Entity | Purpose | Storage | Lifecycle |
|--------|---------|---------|-----------|
| `FocusSession` | Tracks individual focus work sessions | MongoDB | 90-day TTL auto-delete |
| `RhythmMetrics` | Real-time typing/mouse rhythm data | In-memory only | Session duration |
| `UserPreferences` | User settings and defaults | MongoDB | Persistent |
| `AIMoodRecommendation` | AI-generated mood suggestions | MongoDB | 90-day TTL (linked to session) |

---

## 1. FocusSession

**Purpose**: Represents a single focus work session with aggregated metrics (no raw keystroke content).

**MongoDB Collection**: `focus_sessions`

### Schema

```typescript
interface FocusSession {
  sessionId: string;          // UUID v4 (primary key)
  userId: string;             // SHA-256 hashed Auth0 user ID (anonymized)
  startTime: Date;            // ISO 8601 timestamp (session start)
  endTime: Date | null;       // ISO 8601 timestamp (session end, null if active)
  duration: number;           // Total session duration in seconds
  totalKeystrokes: number;    // Aggregated keystroke count (no content)
  totalClicks: number;        // Aggregated mouse click count
  averageTempo: number;       // Average typing speed (keystrokes/minute)
  selectedMood: 'calm' | 'focus' | 'energy';  // User-selected mood
  selectedInstruments: ('grandPiano' | 'electricPiano' | 'violin' | 'bass')[];  // Active instruments
  aiInsight: string | null;   // Gemini-generated mood recommendation (nullable)
  createdAt: Date;            // Timestamp for TTL index
}
```

### Mongoose Schema

```typescript
// backend/src/models/FocusSession.ts
import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

interface IFocusSession extends Document {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  totalKeystrokes: number;
  totalClicks: number;
  averageTempo: number;
  selectedMood: string;
  selectedInstruments: string[];
  aiInsight?: string;
  createdAt: Date;
}

const focusSessionSchema = new Schema<IFocusSession>({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => crypto.randomUUID()
  },
  userId: { 
    type: String, 
    required: true,
    set: (v: string) => crypto.createHash('sha256').update(v).digest('hex')
  },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, default: null },
  duration: { type: Number, min: 0, default: 0 },
  totalKeystrokes: { type: Number, min: 0, default: 0 },
  totalClicks: { type: Number, min: 0, default: 0 },
  averageTempo: { type: Number, min: 0, default: 0 },
  selectedMood: { 
    type: String, 
    enum: ['calm', 'focus', 'energy'], 
    required: true 
  },
  selectedInstruments: [{ 
    type: String, 
    enum: ['grandPiano', 'electricPiano', 'violin', 'bass'] 
  }],
  aiInsight: { type: String, default: null },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 7776000  // TTL: 90 days in seconds (auto-delete)
  }
});

// Indexes
focusSessionSchema.index({ sessionId: 1 }, { unique: true });
focusSessionSchema.index({ userId: 1, createdAt: -1 });  // User session history queries
focusSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });  // TTL index

export const FocusSession = model<IFocusSession>('FocusSession', focusSessionSchema);
```

### Validation Rules

- `sessionId`: Must be valid UUID v4 format
- `userId`: Automatically SHA-256 hashed on save (via Mongoose setter)
- `duration`: Must be >= 0 seconds
- `totalKeystrokes`, `totalClicks`: Must be >= 0
- `averageTempo`: Must be >= 0 keystrokes/minute
- `selectedMood`: Must be one of ['calm', 'focus', 'energy']
- `selectedInstruments`: Each instrument must be one of ['grandPiano', 'electricPiano', 'violin', 'bass']
- `endTime`: Can be null (for active sessions)
- `aiInsight`: Can be null (if session <10 minutes or Gemini API unavailable)

### State Transitions

```
CREATED (startTime set, endTime null)
    ↓
PAUSED (endTime temporarily set, can resume)
    ↓
ACTIVE (endTime reset to null, duration continues)
    ↓
COMPLETED (endTime set, duration finalized)
    ↓
EXPIRED (90 days after createdAt, auto-deleted by MongoDB TTL)
```

### Relationships

- **Belongs to** User (via hashed `userId`)
- **Has one** AIMoodRecommendation (via `sessionId` foreign key)

---

## 2. RhythmMetrics

**Purpose**: Real-time typing/mouse rhythm data calculated during active session. **Not persisted to database** (in-memory only for WebSocket streaming).

**Storage**: In-memory (frontend state + WebSocket broadcast)

### Schema

```typescript
interface RhythmMetrics {
  sessionId: string;                // Links to active FocusSession
  currentBPM: number;               // Instantaneous typing speed (keys/min)
  rollingAvgBPM: number;            // 30-second rolling average (keys/min)
  tempoTrend: 'increasing' | 'steady' | 'decreasing';  // Tempo change direction
  activityLevel: 'low' | 'medium' | 'high';  // Activity intensity
  lastKeystrokeTimestamp: Date;     // ISO 8601 timestamp of last keystroke
  keystrokeVelocity: number;        // Time between keystrokes (milliseconds)
}
```

### TypeScript Type

```typescript
// src/types/session.types.ts
export interface RhythmMetrics {
  sessionId: string;
  currentBPM: number;
  rollingAvgBPM: number;
  tempoTrend: 'increasing' | 'steady' | 'decreasing';
  activityLevel: 'low' | 'medium' | 'high';
  lastKeystrokeTimestamp: string;  // ISO 8601 string in frontend
  keystrokeVelocity: number;
}
```

### Validation Rules

- `currentBPM`, `rollingAvgBPM`: Must be >= 0
- `tempoTrend`: Must be one of ['increasing', 'steady', 'decreasing']
- `activityLevel`: Must be one of ['low', 'medium', 'high']
  - low: <40 keys/min
  - medium: 40-80 keys/min
  - high: >80 keys/min
- `keystrokeVelocity`: Must be >= 0 milliseconds

### Calculation Logic

```typescript
// backend/src/services/rhythmService.ts
export function calculateRhythmMetrics(
  keystrokeTimestamps: number[],  // Last 30 seconds of timestamps
  currentTimestamp: number
): RhythmMetrics {
  const windowSize = 30000; // 30 seconds in ms
  const recentKeystrokes = keystrokeTimestamps.filter(
    ts => currentTimestamp - ts <= windowSize
  );
  
  const currentBPM = recentKeystrokes.length * 2;  // Scale 30s to 60s
  const rollingAvgBPM = currentBPM;  // Simplified; in practice, use exponential moving average
  
  const tempoTrend = calculateTrend(keystrokeTimestamps);  // Compare recent vs. previous window
  const activityLevel = currentBPM < 40 ? 'low' : currentBPM < 80 ? 'medium' : 'high';
  
  const lastKeystroke = keystrokeTimestamps[keystrokeTimestamps.length - 1];
  const secondLastKeystroke = keystrokeTimestamps[keystrokeTimestamps.length - 2];
  const keystrokeVelocity = lastKeystroke - secondLastKeystroke;
  
  return {
    sessionId: '...',
    currentBPM,
    rollingAvgBPM,
    tempoTrend,
    activityLevel,
    lastKeystrokeTimestamp: new Date(currentTimestamp).toISOString(),
    keystrokeVelocity
  };
}
```

### Relationships

- **Associated with** active FocusSession (transient, not persisted)

---

## 3. UserPreferences

**Purpose**: Stores user settings and defaults for personalized experience.

**MongoDB Collection**: `user_preferences`

### Schema

```typescript
interface UserPreferences {
  userId: string;             // SHA-256 hashed Auth0 user ID (primary key)
  defaultMood: 'calm' | 'focus' | 'energy';  // Default mood on session start
  defaultInstruments: ('grandPiano' | 'electricPiano' | 'violin' | 'bass')[];  // Default instruments
  masterVolume: number;       // Volume percentage (0-100)
  accessibilityModeEnabled: boolean;  // WCAG 2.1 AA mode (lower frequencies, reduced motion)
  createdAt: Date;            // Account creation timestamp
  updatedAt: Date;            // Last update timestamp
}
```

### Mongoose Schema

```typescript
// backend/src/models/UserPreferences.ts
import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

interface IUserPreferences extends Document {
  userId: string;
  defaultMood: string;
  defaultInstruments: string[];
  masterVolume: number;
  accessibilityModeEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new Schema<IUserPreferences>({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    set: (v: string) => crypto.createHash('sha256').update(v).digest('hex')
  },
  defaultMood: { 
    type: String, 
    enum: ['calm', 'focus', 'energy'], 
    default: 'focus' 
  },
  defaultInstruments: [{ 
    type: String, 
    enum: ['grandPiano', 'electricPiano', 'violin', 'bass'],
    default: []
  }],
  masterVolume: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 50 
  },
  accessibilityModeEnabled: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt on save
userPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes
userPreferencesSchema.index({ userId: 1 }, { unique: true });

export const UserPreferences = model<IUserPreferences>('UserPreferences', userPreferencesSchema);
```

### Validation Rules

- `userId`: Automatically SHA-256 hashed on save
- `defaultMood`: Must be one of ['calm', 'focus', 'energy']
- `defaultInstruments`: Each instrument must be one of ['grandPiano', 'electricPiano', 'violin', 'bass']
- `masterVolume`: Must be between 0-100 (inclusive)
- `accessibilityModeEnabled`: Boolean (true/false)

### Relationships

- **Belongs to** User (1:1 relationship via `userId`)

---

## 4. AIMoodRecommendation

**Purpose**: AI-generated mood suggestions from Gemini API based on session rhythm patterns.

**MongoDB Collection**: `ai_mood_recommendations`

### Schema

```typescript
interface AIMoodRecommendation {
  recommendationId: string;   // UUID v4 (primary key)
  sessionId: string;          // Foreign key to FocusSession
  suggestedMood: 'calm' | 'focus' | 'energy';  // AI-recommended mood
  rationale: string;          // Explanation for recommendation
  confidence: number;         // AI confidence score (0-1)
  generatedAt: Date;          // ISO 8601 timestamp
  geminiModel: string;        // Gemini model used (e.g., "gemini-2.5-flash")
}
```

### Mongoose Schema

```typescript
// backend/src/models/AIMoodRecommendation.ts
import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

interface IAIMoodRecommendation extends Document {
  recommendationId: string;
  sessionId: string;
  suggestedMood: string;
  rationale: string;
  confidence: number;
  generatedAt: Date;
  geminiModel: string;
}

const aiMoodRecommendationSchema = new Schema<IAIMoodRecommendation>({
  recommendationId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => crypto.randomUUID()
  },
  sessionId: { 
    type: String, 
    required: true,
    ref: 'FocusSession'  // Foreign key reference
  },
  suggestedMood: { 
    type: String, 
    enum: ['calm', 'focus', 'energy'], 
    required: true 
  },
  rationale: { 
    type: String, 
    required: true,
    maxlength: 500  // Limit AI-generated text length
  },
  confidence: { 
    type: Number, 
    min: 0, 
    max: 1, 
    required: true 
  },
  generatedAt: { type: Date, default: Date.now },
  geminiModel: { 
    type: String, 
    required: true,
    match: /^gemini-1\.5-(flash|pro)$/  // Validate model name format
  }
});

// Indexes
aiMoodRecommendationSchema.index({ recommendationId: 1 }, { unique: true });
aiMoodRecommendationSchema.index({ sessionId: 1 });  // Foreign key lookup

export const AIMoodRecommendation = model<IAIMoodRecommendation>('AIMoodRecommendation', aiMoodRecommendationSchema);
```

### Validation Rules

- `recommendationId`: Must be valid UUID v4 format
- `sessionId`: Must reference existing FocusSession
- `suggestedMood`: Must be one of ['calm', 'focus', 'energy']
- `rationale`: Max 500 characters
- `confidence`: Must be between 0-1 (inclusive)
- `geminiModel`: Must match regex `/^gemini-1\.5-(flash|pro)$/`

### Relationships

- **References** FocusSession (many:1 via `sessionId`)

---

## Entity Relationship Diagram

```
User (Auth0)
    |
    | 1:1 (hashed userId)
    ↓
UserPreferences
    - defaultMood
    - defaultInstruments
    - masterVolume
    - accessibilityModeEnabled

User (Auth0)
    |
    | 1:N (hashed userId)
    ↓
FocusSession
    - sessionId (PK)
    - userId (FK, hashed)
    - startTime, endTime
    - duration, keystrokes, clicks
    - averageTempo
    - selectedMood, selectedInstruments
    - aiInsight
    - createdAt (TTL 90 days)
    |
    | 1:1 (sessionId)
    ↓
AIMoodRecommendation
    - recommendationId (PK)
    - sessionId (FK)
    - suggestedMood
    - rationale
    - confidence
    - geminiModel

(RhythmMetrics: in-memory only, not persisted)
```

---

## Data Privacy & Anonymization

### PII Protection

1. **User ID Hashing**: All `userId` fields auto-hashed with SHA-256 (Mongoose setter)
   ```typescript
   set: (v: string) => crypto.createHash('sha256').update(v).digest('hex')
   ```

2. **No Raw Keystroke Content**: Only aggregated metrics stored (count, tempo), never actual keystrokes or mouse coordinates

3. **TTL Auto-Deletion**: Sessions auto-deleted after 90 days (MongoDB TTL index)

4. **Minimal Data Collection**: 
   - ✅ Store: session duration, keystroke count, tempo, mood, instruments
   - ❌ Do NOT store: keystroke content, mouse coordinates, audio waveforms, IP addresses

### User Control Mechanisms

1. **Data Export**: Users can export all data via `GET /api/sessions/export` (JSON format)
2. **Data Deletion**: Users can delete all data via `DELETE /api/sessions/all` (right to be forgotten)
3. **Opt-out**: Users can disable rhythm tracking (client-side preference, no data sent to backend)

---

## Mongoose Connection Setup

```typescript
// backend/src/config/database.ts
import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: 'pulseplay',
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log('MongoDB connected:', mongoose.connection.name);
    
    // Ensure indexes are created
    await Promise.all([
      FocusSession.createIndexes(),
      UserPreferences.createIndexes(),
      AIMoodRecommendation.createIndexes()
    ]);
    
    console.log('Database indexes created');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
```

---

## Data Model Summary

| Entity | Collection | Primary Key | Relationships | TTL |
|--------|------------|-------------|---------------|-----|
| **FocusSession** | `focus_sessions` | `sessionId` (UUID) | Belongs to User (hashed userId), Has One AIMoodRecommendation | 90 days |
| **RhythmMetrics** | N/A (in-memory) | `sessionId` | Associated with FocusSession (transient) | Session duration |
| **UserPreferences** | `user_preferences` | `userId` (hashed) | Belongs to User (1:1) | Persistent |
| **AIMoodRecommendation** | `ai_mood_recommendations` | `recommendationId` (UUID) | References FocusSession (many:1) | Inherits from session |

**Next Phase**: Generate API contracts (OpenAPI specs) for REST endpoints and WebSocket protocol.
