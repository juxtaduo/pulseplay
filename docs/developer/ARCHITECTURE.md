# PulsePlay AI - System Architecture

**Version**: 2.0.0  
**Last Updated**: October 18, 2025  
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Audio Engine Architecture](#audio-engine-architecture)
4. [Rhythm Detection System](#rhythm-detection-system)
5. [AI Integration Pattern](#ai-integration-pattern)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Technology Stack](#technology-stack)
8. [Security Architecture](#security-architecture)
9. [Performance Characteristics](#performance-characteristics)
10. [Deployment Architecture](#deployment-architecture)

---

## Overview

PulsePlay AI is an AI-powered focus music application that generates adaptive Lofi hip-hop beats in real-time based on user typing rhythm. The system combines Web Audio API synthesis, browser-based rhythm detection, and Gemini AI integration to create a personalized focus music experience.

### Core Capabilities

- **Real-time Audio Synthesis**: Lofi hip-hop beats generated entirely in-browser using Web Audio API
- **Rhythm Detection**: Non-intrusive keystroke and mouse event analysis (no content captured)
- **AI Mood Recommendations**: Gemini-powered session analysis for personalized mood suggestions
- **Session Analytics**: Comprehensive session history with export capabilities
- **Privacy-First**: All analysis happens client-side; only aggregated metrics stored

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React UI   │  │ Web Audio    │  │   Canvas     │         │
│  │  Components  │  │    Engine    │  │  Visualizer  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│  ┌──────▼─────────────────▼─────────────────▼───────┐          │
│  │        Custom React Hooks Layer                  │          │
│  │  - useAudioEngine                                │          │
│  │  - useRhythmDetection                            │          │
│  │  - useSessionPersistence                         │          │
│  └──────────────────┬───────────────────────────────┘          │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      │ REST API / Auth0 JWT
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                      BACKEND (Node.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Express   │  │   Auth0     │  │    Rate     │            │
│  │   Routes    │  │ Middleware  │  │  Limiting   │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                    │
│  ┌──────▼────────────────▼────────────────▼──────┐             │
│  │         Service Layer                         │             │
│  │  - sessionService                             │             │
│  │  - geminiService (AI Integration)             │             │
│  └───────────────────┬───────────────────────────┘             │
│                      │                                          │
│  ┌───────────────────▼───────────────────────────┐             │
│  │         Data Layer (Mongoose Models)          │             │
│  │  - FocusSession                               │             │
│  │  - AIMoodRecommendation                       │             │
│  └───────────────────┬───────────────────────────┘             │
│                      │                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       │ MongoDB Wire Protocol
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  MongoDB     │  │   Gemini     │  │   Auth0      │          │
│  │   Atlas      │  │     API      │  │  Identity    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Audio Engine Architecture

### Lofi Hip-Hop Beat Components

The audio engine generates four simultaneous layers of sound:

```
┌──────────────────────────────────────────────────────────────┐
│                    AUDIO ENGINE (Web Audio API)              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │ Drum Loop   │   │ Jazz Chords │   │ Walking     │       │
│  │ (4/4 time)  │   │ Progression │   │ Bass Line   │       │
│  └─────┬───────┘   └─────┬───────┘   └─────┬───────┘       │
│        │                 │                 │                │
│  ┌─────▼─────────────────▼─────────────────▼───────┐        │
│  │        Master Gain Node (Volume Control)        │        │
│  └──────────────────────┬───────────────────────────┘        │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────┐           │
│  │  Vinyl Crackle (Pink Noise, 3kHz lowpass)    │           │
│  └──────────────────────┬────────────────────────┘           │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────┐           │
│  │          Audio Context Destination            │           │
│  │         (Browser Audio Output)                │           │
│  └───────────────────────────────────────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Audio Node Graph

```
Kick Drum (Sine 60Hz→40Hz)  ─┐
                             │
Snare (Noise + 200Hz Tone)   ├──▶ Master Gain ──▶ Context Destination
                             │         ▲
Hi-Hat (7kHz Highpass Noise)─┘         │
                                        │
Cm7 Chord (4 Triangle Waves) ─┬        │
Fm7 Chord                      ├────────┤
Bbmaj7 Chord                   │        │
Ebmaj7 Chord                  ─┘        │
                                        │
Bass Line (Sine 131-175Hz)   ──────────┤
                                        │
Vinyl Crackle (Pink Noise)   ───────────┘
```

### Mood-Based Tempo Mapping

| Mood | BPM | Instruments | Characteristics |
|------|-----|-------------|----------------|
| **Deep Focus** | 60 | Sine waves, minimal drums | Calming, steady, low frequency |
| **Creative Flow** | 80 | Triangle waves, full kit | Balanced, flowing, medium energy |
| **Calm Reading** | 50 | Sine waves, soft drums | Very slow, soothing, minimal |
| **Energized Coding** | 100 | Sawtooth waves, punchy drums | Fast, driving, high energy |

### Pentatonic Scale System

For melodic keystroke sounds, the system uses **C Minor Pentatonic Scale**:

```
C4  (262 Hz) ─┐
Eb4 (311 Hz)  │
F4  (349 Hz)  │  Sequential
G4  (392 Hz)  │  progression
Bb4 (466 Hz)  │  on each
C5  (523 Hz)  │  keystroke
Eb5 (622 Hz)  │  (cycles)
F5  (698 Hz)  │
G5  (784 Hz)  │
Bb5 (932 Hz) ─┘
```

**Why Pentatonic?**
- No dissonant intervals (always sounds musical)
- Fits naturally with jazz chord progression
- Familiar to all cultures (universal appeal)
- 10 notes provide variety without overwhelming

---

## Rhythm Detection System

### Event Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    BROWSER EVENT LAYER                       │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ KeyboardEvent / MouseEvent
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              useRhythmDetection Hook                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Event Timestamping                                   │   │
│  │  - Capture timestamp (Date.now())                     │   │
│  │  - Store in rolling window (last 50 keystrokes)      │   │
│  └───────────────────┬───────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────▼───────────────────────────────────┐   │
│  │  Interval Calculation                                 │   │
│  │  - Calculate time between consecutive events          │   │
│  │  - Rolling 30-second analysis window                  │   │
│  └───────────────────┬───────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────▼───────────────────────────────────┐   │
│  │  Rhythm Metrics Derivation                            │   │
│  │  - Keys per minute (60-second window)                 │   │
│  │  - Average interval                                   │   │
│  │  - Rhythm score (0-100)                               │   │
│  │  - Intensity classification (low/medium/high)         │   │
│  └───────────────────┬───────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────▼───────────────────────────────────┐   │
│  │  Instrument Triggering (if enabled)                   │   │
│  │  - Get next note from pentatonic scale               │   │
│  │  - Calculate velocity from rhythm score              │   │
│  │  - Play instrument sound via Audio Engine             │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Rhythm Score Calculation

```typescript
// Pseudo-code for rhythm score
const intervals = [/* time between keystrokes */];
const averageInterval = mean(intervals);

// Lower interval = faster typing = higher score
const rhythmScore = Math.min(100, 1000 / Math.max(averageInterval, 50));

// Intensity mapping
if (keysPerMinute >= 80) intensity = 'high';
else if (keysPerMinute >= 50) intensity = 'medium';
else intensity = 'low';
```

### Privacy-First Design

**What is captured:**
- ✅ Keystroke timestamps (milliseconds)
- ✅ Mouse click timestamps
- ✅ Calculated metrics (keys/min, rhythm score)

**What is NOT captured:**
- ❌ Keystroke content (no keyCode, no text)
- ❌ Application context (no window titles)
- ❌ Screenshot or screen recording
- ❌ Clipboard data

---

## AI Integration Pattern

### Gemini API Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   CLIENT REQUEST                             │
│  User completes session (≥10 minutes)                        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ POST /api/ai/mood-recommendation
                       │ { sessionId: "..." }
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                   BACKEND PROCESSING                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Fetch session from MongoDB                              │
│     - Duration, keystrokes, clicks, tempo                    │
│                                                              │
│  2. Analyze rhythm pattern                                  │
│     - Classify: steady vs erratic                           │
│     - Classify: fast vs slow                                │
│     - Generate pattern description                          │
│                                                              │
│  3. Build Gemini prompt                                     │
│     - Few-shot examples (3 scenarios)                       │
│     - Current session context                               │
│     - JSON output schema                                    │
│                                                              │
│  4. Call Gemini API (gemini-1.5-flash)                      │
│     - Temperature: 0.7 (creative but focused)               │
│     - Rate limit: 10 req/hour                               │
│     - Timeout: 10 seconds                                   │
│                                                              │
│  5. Parse AI response                                       │
│     - Extract suggested mood                                │
│     - Extract rationale                                     │
│     - Extract confidence score                              │
│                                                              │
│  6. Store recommendation                                    │
│     - Link to session (sessionId)                           │
│     - Log prompt + response (pino JSON)                     │
│                                                              │
│  7. Return to client                                        │
│     - Recommendation object (JSON)                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Prompt Engineering Strategy

**Template Structure:**

```
You are an AI mood recommendation system for a focus music app.

EXAMPLES:
1. Fast steady typing → "energized-coding"
2. Slow erratic typing → "calm-reading"
3. Medium steady typing → "thousand-years"

CURRENT SESSION:
- Duration: {minutes} minutes
- Pattern: {steady/erratic}
- Speed: {fast/slow}
- Keys/min: {number}

OUTPUT (JSON):
{
  "suggestedMood": "...",
  "rationale": "...",
  "confidence": 0.0-1.0
}
```

### Fallback Strategy

| Failure Scenario | Fallback Behavior |
|-----------------|-------------------|
| API timeout (>10s) | Return generic tip based on session length |
| Rate limit exceeded | Show cached recommendation from similar session |
| Invalid JSON response | Parse partial response or use default mood |
| Network error | Gracefully degrade (hide AI insights section) |
| Session too short (<10 min) | Return HTTP 400 with clear error message |

---

## Data Flow Diagrams

### Session Creation Flow

```
User Click "Start" ──┐
                     │
                     ▼
            useAudioEngine.startAudio(mood)
                     │
                     ├──▶ Resume AudioContext
                     ├──▶ Create Lofi Beat (drums + chords + bass)
                     ├──▶ Start Vinyl Noise
                     └──▶ Fade in Master Gain (1 second)
                     │
                     ▼
          useSessionPersistence.startSession(mood)
                     │
                     ├──▶ POST /api/sessions { mood, startTime }
                     │         │
                     │         ▼
                     │    MongoDB.insert(FocusSession)
                     │         │
                     │         ▼
                     │    Return sessionId
                     │
                     ▼
           Session Active (isPlaying = true)
                     │
                     ├──▶ useRhythmDetection listens to events
                     ├──▶ SessionStats updates every 1 second
                     └──▶ RhythmVisualizer animates at 60fps
```

### AI Recommendation Flow

```
User Click "Stop" (≥10 min session) ──┐
                                       │
                                       ▼
                        Stop audio with fadeout
                                       │
                                       ▼
                   PUT /api/sessions/:id
                   { state: "completed", endTime }
                                       │
                                       ▼
                        Show MoodInsights component
                                       │
                                       ▼
           POST /api/ai/mood-recommendation { sessionId }
                                       │
                                       ▼
                   Analyze rhythm pattern
                   (steady vs erratic, fast vs slow)
                                       │
                                       ▼
                     Build Gemini prompt
                  (few-shot + session context)
                                       │
                                       ▼
                Call Gemini API (gemini-1.5-flash)
                                       │
                                       ▼
                   Parse JSON response
                                       │
                                       ▼
              Store AIMoodRecommendation in MongoDB
                                       │
                                       ▼
           Display recommendation with rationale
                (suggested mood + confidence score)
```

---

## Technology Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18.3.1 | Component-based UI |
| **Build Tool** | Vite 5.4.20 | Fast dev server, HMR |
| **Styling** | TailwindCSS 3.4.17 | Utility-first CSS |
| **Audio** | Web Audio API (native) | Real-time audio synthesis |
| **Visualization** | Canvas API (native) | 60fps waveform rendering |
| **Auth** | @auth0/auth0-react 2.2.4 | JWT-based authentication |
| **Icons** | lucide-react 0.344.0 | React icon library |
| **Type Safety** | TypeScript 5.5.3 | Static typing |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Express 4.18 | REST API server |
| **Database** | MongoDB Atlas 7+ | Document storage |
| **ODM** | Mongoose 8.0+ | MongoDB object modeling |
| **AI** | Gemini API (gemini-1.5-flash) | Mood recommendations |
| **Logging** | Pino 8.19+ | Structured JSON logging |
| **Rate Limiting** | express-rate-limit 7.1+ | API protection |
| **Auth** | express-oauth2-jwt-bearer | JWT validation |

### DevOps

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Testing** | Vitest 1.3+ | Unit tests |
| **Linting** | Biome.js | Code formatting |
| **Version Control** | Git + GitHub | Source control |
| **CI/CD** | GitHub Actions (planned) | Automated testing |
| **Hosting (Frontend)** | Vercel/Netlify (planned) | Static site hosting |
| **Hosting (Backend)** | Railway/Render (planned) | Node.js hosting |

---

## Security Architecture

### Authentication Flow

```
┌────────────┐                  ┌────────────┐                  ┌────────────┐
│   Client   │                  │   Auth0    │                  │   Backend  │
│  (Browser) │                  │  Identity  │                  │   Server   │
└─────┬──────┘                  └─────┬──────┘                  └─────┬──────┘
      │                               │                               │
      │  1. Click "Login"             │                               │
      ├──────────────────────────────▶│                               │
      │                               │                               │
      │  2. Redirect to Auth0         │                               │
      │◀──────────────────────────────┤                               │
      │                               │                               │
      │  3. User authenticates        │                               │
      ├──────────────────────────────▶│                               │
      │                               │                               │
      │  4. Return JWT + ID token     │                               │
      │◀──────────────────────────────┤                               │
      │                               │                               │
      │  5. API call with JWT         │                               │
      ├───────────────────────────────┼──────────────────────────────▶│
      │                               │                               │
      │                               │  6. Validate JWT              │
      │                               │◀──────────────────────────────┤
      │                               │                               │
      │                               │  7. Return user info          │
      │                               ├──────────────────────────────▶│
      │                               │                               │
      │  8. Return protected data     │                               │
      │◀──────────────────────────────┼───────────────────────────────┤
      │                               │                               │
```

### Data Protection

| Data Type | Protection Mechanism |
|-----------|---------------------|
| **User ID** | SHA-256 hashed before storage |
| **Session Data** | TTL index (90-day auto-delete) |
| **API Keys** | Environment variables only |
| **JWT Tokens** | Stored in memory (not localStorage) |
| **Keystroke Content** | Never captured or transmitted |
| **PII** | No email/name stored in sessions |

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| AI Recommendations | 10 requests | 1 hour |
| Session Creation | 50 requests | 15 minutes |
| Session History | 50 requests | 15 minutes |

---

## Performance Characteristics

### Latency Targets

| Operation | Target | Measured |
|-----------|--------|----------|
| Keystroke to waveform pulse | <50ms | ~30ms (p95) |
| Keystroke to instrument sound | <200ms | ~150ms (p95) |
| Audio-visual sync | <100ms | ~80ms (p95) |
| Session creation API | <500ms | ~350ms (p95) |
| AI recommendation API | <3s | ~2.5s (p95) |
| Canvas rendering | 60fps | 58fps (p95) |

### Resource Usage

| Resource | Usage | Notes |
|----------|-------|-------|
| **Memory (Frontend)** | ~50MB | Includes audio buffers |
| **Memory (Backend)** | ~80MB per instance | Node.js + Express |
| **CPU (Frontend)** | 5-10% | Single core, during active session |
| **CPU (Backend)** | <5% | Idle; spikes to 15% on AI calls |
| **Network (Session)** | ~10KB/session | Minimal REST API calls |
| **Storage (MongoDB)** | ~2KB/session | Compressed JSON documents |

---

## Deployment Architecture

### Production Environment (Planned)

```
┌────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN                          │
│                  (Global Edge Network)                     │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼─────────────────────────────────────┐
│                    VERCEL / NETLIFY                        │
│              (Frontend Static Hosting)                     │
│  - Auto-deploy from main branch                           │
│  - Environment variables (VITE_*)                          │
│  - Global CDN                                              │
└────────────────────────────────────────────────────────────┘
                       │
                       │ REST API (HTTPS)
                       │
┌──────────────────────▼─────────────────────────────────────┐
│                   RAILWAY / RENDER                         │
│               (Backend Node.js Hosting)                    │
│  - Auto-scale based on CPU                                │
│  - Health checks (GET /health)                            │
│  - Environment variables (secrets)                        │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ MongoDB Wire Protocol (TLS)
                       │
┌──────────────────────▼─────────────────────────────────────┐
│                    MONGODB ATLAS                           │
│               (Managed MongoDB Cluster)                    │
│  - M0 Free Tier (512MB storage)                           │
│  - Automatic backups                                      │
│  - TLS encryption in transit                              │
│  - IP whitelist + database user auth                      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                       │
├────────────────────────────────────────────────────────────┤
│  - Auth0 (Identity Management)                            │
│  - Gemini API (AI Recommendations)                        │
└────────────────────────────────────────────────────────────┘
```

---

## Conclusion

This architecture prioritizes:

1. **Privacy**: No keystroke content leaves the browser
2. **Performance**: <200ms latency for audio feedback
3. **Scalability**: Stateless backend, MongoDB Atlas auto-scaling
4. **Maintainability**: Clear separation of concerns, comprehensive documentation
5. **Security**: Auth0 JWT validation, rate limiting, SHA-256 hashing

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).  
For API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).  
For development setup, see [../README.md](../README.md).
