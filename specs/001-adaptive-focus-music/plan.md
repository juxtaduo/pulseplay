# Implementation Plan: Adaptive Focus Music Engine

**Branch**: `001-adaptive-focus-music` | **Date**: 2025-10-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-adaptive-focus-music/spec.md`

## Summary

Build an AI-powered web application that generates adaptive focus music in real-time based on user typing rhythm and mouse movement. The system synthesizes Lofi-style ambient music using Web Audio API, detects user input patterns via browser events, visualizes rhythm as an animated waveform on Canvas, and integrates Gemini API for AI-driven mood recommendations. The architecture follows a full-stack approach with React + Vite frontend, Node.js + Express backend, MongoDB Atlas for session storage, and Auth0 for authentication.

**Primary Technical Approach**:
- **Frontend**: React hooks manage Web Audio API audio nodes (OscillatorNode, GainNode, BiquadFilterNode), Canvas requestAnimationFrame loop for 60fps waveform, keyboard/mouse event listeners for rhythm detection
- **Backend**: Express REST API handles session CRUD, WebSocket server broadcasts real-time rhythm metrics, Gemini API integration generates mood insights, MongoDB Mongoose models persist anonymized session data
- **AI Integration**: Gemini API (gemini-1.5-flash) analyzes session rhythm patterns (steady/erratic, fast/slow) to generate personalized mood recommendations with transparent prompt logging
- **Performance**: <200ms latency for keystroke-to-sound (Web Audio API scheduler), 60fps Canvas animation (requestAnimationFrame), <100ms audio-visual sync

## Technical Context

**Language/Version**: TypeScript 5.5.3+, Node.js 18+ (backend), React 18.3.1+ (frontend)  
**Primary Dependencies**:
- **Frontend**: react 18.3.1+, vite 5.4.20+, tailwindcss 3.4.17+, @auth0/auth0-react 2.2.4+
- **Backend**: express 4.18+, mongoose 8.0+, ws 8.16+ (WebSocket), @google/generative-ai 0.2+ (Gemini), pino 8.19+ (logging), express-rate-limit 7.1+
- **Testing**: vitest 1.3+, @testing-library/react 14.2+, playwright 1.42+

**Storage**: MongoDB Atlas 7+ (session data, user preferences, AI recommendations)  
**Testing**: Vitest (unit), @testing-library/react (React components), Playwright (E2E)  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14.1+) with Web Audio API support  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**:
- <200ms latency from keystroke to instrument sound (p95)
- 60fps Canvas waveform visualization (p95)
- <100ms audio-visual synchronization latency
- <50ms keystroke detection to waveform pulse
- <3s Gemini API response time for mood insights
- <5s real-time session stats update lag

**Constraints**:
- Web Audio API only (no pre-recorded audio files)
- Browser-based rhythm detection (no keystroke content leaves browser)
- Gemini API rate limits (60 requests/minute for gemini-1.5-flash)
- MongoDB Atlas free tier (<512MB storage, <100 concurrent connections)
- Auth0 free tier (7000 active users, social logins, MFA)

**Scale/Scope**:
- MVP: 10-100 users, 3 moods (calm/focus/energy), 4 instruments (piano/violin/electric piano/bass)
- 6 user stories (2 P1 MVP, 2 P2 core, 2 P3 analytics)
- 20 functional requirements, 14 success criteria
- 4 key entities: FocusSession, RhythmMetrics, UserPreferences, AIMoodRecommendation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with PulsePlay AI Constitution (v2.1.0):

- [x] **Experience-First Design**: 
  - ✅ UX intuitive (30-second understanding: select mood → start session → type)
  - ✅ Distraction-free (Lofi aesthetic, essential controls only, no visual clutter)
  - ✅ Audio-visual sync planned (<100ms latency per SC-003, 50ms waveform response per SC-002)
  - ✅ Accessibility (WCAG 2.1 AA): FR-015 accessibility mode, keyboard nav, ARIA labels, color contrast 4.5:1, respect `prefers-reduced-motion`
  - ✅ Neurodiverse inclusivity: Lower frequency instruments (200-800 Hz), reduced animation intensity

- [x] **AI-Augmented Creativity**: 
  - ✅ Gemini API integration adds measurable value: US5 mood recommendations, weekly focus pattern summaries
  - ✅ Prompts transparent & logged: FR-020 structured JSON logging (pino) of all Gemini prompts/responses
  - ✅ Fail-safe fallbacks defined: FR-014 graceful degradation to generic productivity tips if Gemini API unavailable
  - ✅ Context-aware: AI analyzes session rhythm patterns (steady/erratic, fast/slow) for personalized insights

- [x] **Data-Respectful Architecture**: 
  - ✅ Minimal data collection: FR-011 tracks aggregated metrics only (no keystroke content, no mouse coordinates)
  - ✅ MongoDB anonymization strategy: FocusSession entity uses hashed userId, no PII stored
  - ✅ User control mechanisms: FR-018 export session data as JSON, deletion on request (right to be forgotten)
  - ✅ Client-side processing: Rhythm detection in browser, only metrics sent to backend

- [x] **Open Source Integrity**: 
  - ✅ Documentation plan: JSDoc required for all hooks/components/functions (Constitution compliance checklist)
  - ✅ README updated: Setup instructions, feature overview (Constitution compliance checklist)
  - ✅ ARCHITECTURE.md updated: Audio engine, rhythm detection, AI integration diagrams (Constitution compliance checklist)
  - ✅ Contribution workflow transparent: 1-hour onboarding target (Constitution compliance checklist)

- [x] **Simplicity and Observability**: 
  - ✅ YAGNI/KISS principles: Out-of-scope section excludes 11 features (gamification, social, offline, mobile apps, premium tiers)
  - ✅ Structured logging defined: FR-020 JSON logging via pino (rhythm metrics, AI latency, audio node creation)
  - ✅ Modular design for testability: Separate hooks (useAudioEngine, useRhythmDetection, useSessionPersistence)
  - ✅ Test coverage target: 70%+ on critical paths (Constitution compliance checklist)

**Gate Status**: ✅ **PASSED** - All 5 principles satisfied, no violations requiring justification.

## Project Structure

### Documentation (this feature)

```
specs/001-adaptive-focus-music/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── sessions.openapi.yaml
│   ├── rhythm.openapi.yaml
│   └── ai-insights.openapi.yaml
├── checklists/
│   └── requirements.md  # Validation checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Current Structure** (from workspace context):
```
src/                      # Frontend (React + Vite)
├── components/           # Existing: AuthButton, ControlPanel, MoodInsights, RhythmVisualizer, SessionStats
├── hooks/                # Existing: useAudioEngine, useRhythmDetection, useSessionPersistence
├── services/             # Existing: moodService
└── lib/                  # Existing: supabase (to be replaced with Auth0)

supabase/                 # To be replaced with backend/
└── [legacy files]
```

**Target Structure** (after implementation):
```
# Frontend (React + Vite) - existing src/ directory
src/
├── components/
│   ├── AuthButton.tsx              # [UPDATE] Auth0 integration
│   ├── ControlPanel.tsx            # [UPDATE] Instrument selection, volume control
│   ├── MoodInsights.tsx            # [UPDATE] Display Gemini API insights
│   ├── RhythmVisualizer.tsx        # [UPDATE] Canvas waveform visualization
│   ├── SessionStats.tsx            # [UPDATE] Real-time session metrics
│   └── AccessibilityToggle.tsx     # [NEW] WCAG 2.1 AA accessibility mode
├── hooks/
│   ├── useAudioEngine.ts           # [UPDATE] Web Audio API synthesis (ambient + instruments)
│   ├── useRhythmDetection.ts       # [UPDATE] Keyboard/mouse event listeners, BPM calculation
│   ├── useSessionPersistence.ts    # [UPDATE] MongoDB API calls for session CRUD
│   ├── useAuth0.ts                 # [NEW] Auth0 authentication hook
│   └── useWebSocket.ts             # [NEW] Real-time rhythm data WebSocket
├── services/
│   ├── audioSynthesis.ts           # [NEW] Web Audio API node creation, Lofi texture generation
│   ├── rhythmAnalysis.ts           # [NEW] Tempo calculation, velocity tracking
│   ├── apiClient.ts                # [NEW] Axios-based REST API client for backend
│   └── moodService.ts              # [UPDATE] Remove Supabase, use apiClient
├── lib/
│   ├── auth0.ts                    # [NEW] Auth0 React SDK configuration
│   └── constants.ts                # [NEW] Mood BPM ranges, instrument frequencies
├── types/
│   ├── session.types.ts            # [NEW] FocusSession, RhythmMetrics types
│   ├── audio.types.ts              # [NEW] AudioNode, Instrument types
│   └── api.types.ts                # [NEW] API request/response types
└── tests/
    ├── unit/
    │   ├── audioSynthesis.test.ts
    │   ├── rhythmAnalysis.test.ts
    │   └── hooks.test.tsx
    ├── integration/
    │   └── sessionFlow.test.tsx
    └── e2e/
        └── adaptiveMusicFlow.spec.ts  # Playwright E2E test

# Backend (Node.js + Express) - new directory
backend/
├── src/
│   ├── server.ts                   # [NEW] Express app entry point, middleware setup
│   ├── models/
│   │   ├── FocusSession.ts         # [NEW] Mongoose schema for FocusSession
│   │   ├── UserPreferences.ts      # [NEW] Mongoose schema for UserPreferences
│   │   ├── AIMoodRecommendation.ts # [NEW] Mongoose schema for AIMoodRecommendation
│   │   └── index.ts                # [NEW] Export all models
│   ├── routes/
│   │   ├── sessions.ts             # [NEW] POST/GET/DELETE /api/sessions
│   │   ├── preferences.ts          # [NEW] GET/PUT /api/preferences
│   │   ├── ai-insights.ts          # [NEW] POST /api/ai/insights (Gemini integration)
│   │   └── index.ts                # [NEW] Combine all routes
│   ├── services/
│   │   ├── geminiService.ts        # [NEW] Gemini API client, prompt engineering
│   │   ├── sessionService.ts       # [NEW] Session CRUD logic
│   │   ├── rhythmService.ts        # [NEW] Real-time rhythm WebSocket handler
│   │   └── authService.ts          # [NEW] Auth0 JWT verification
│   ├── middleware/
│   │   ├── auth.ts                 # [NEW] Auth0 JWT verification middleware
│   │   ├── rateLimiter.ts          # [NEW] express-rate-limit configuration
│   │   ├── errorHandler.ts         # [NEW] Global error handling
│   │   └── logger.ts               # [NEW] Pino structured logging middleware
│   ├── websocket/
│   │   └── rhythmSocket.ts         # [NEW] WebSocket server for real-time rhythm data
│   ├── config/
│   │   ├── database.ts             # [NEW] MongoDB connection
│   │   ├── auth0.ts                # [NEW] Auth0 configuration
│   │   └── gemini.ts               # [NEW] Gemini API configuration
│   └── utils/
│       ├── logger.ts               # [NEW] Pino logger instance
│       ├── validation.ts           # [NEW] Request validation schemas (Joi)
│       └── anonymization.ts        # [NEW] User ID hashing, PII removal
└── tests/
    ├── unit/
    │   ├── geminiService.test.ts
    │   ├── sessionService.test.ts
    │   └── rhythmService.test.ts
    ├── integration/
    │   ├── sessionAPI.test.ts
    │   └── websocket.test.ts
    └── fixtures/
        └── sampleSessions.json

# Deployment configuration
docker-compose.yml           # [NEW] MongoDB, backend, frontend services
Dockerfile.backend           # [NEW] Backend containerization
.env.example                 # [UPDATE] Add MongoDB Atlas, Auth0, Gemini API keys
```

**Structure Decision**: Hybrid architecture—existing `src/` directory contains frontend React components/hooks/services, new `backend/` directory contains Express API + WebSocket server. This separation enables independent deployment (frontend to Vercel/Netlify, backend to Render/Railway) while maintaining single-repo simplicity for development. Frontend communicates with backend via REST API (`/api/*` endpoints) and WebSocket (`wss://backend/rhythm`) for real-time rhythm data streaming.

## Complexity Tracking

*No violations detected—table left empty per template instructions.*

## Phase 0: Research & Technology Decisions

### Research Tasks

1. **Web Audio API Lofi Synthesis Techniques**
   - **Unknown**: How to synthesize warm, Lofi-style ambient textures using Web Audio API oscillators and filters?
   - **Research Goal**: Find best practices for creating analog-style imperfections (reverb, low-pass filtering, subtle detuning) without pre-recorded audio files
   - **Deliverable**: Decision on OscillatorNode types, BiquadFilterNode settings, GainNode envelope patterns for calm/focus/energy moods

2. **Canvas Waveform Visualization (60fps)**
   - **Unknown**: How to render smooth, real-time waveform animation that syncs with audio within <50ms latency?
   - **Research Goal**: Find optimal requestAnimationFrame patterns, Canvas drawing techniques, and performance optimization strategies for 60fps target
   - **Deliverable**: Decision on Canvas API vs. WebGL, waveform data structure (frequency domain vs. time domain), animation easing functions

3. **WebSocket Architecture for Low-Latency Audio Apps**
   - **Unknown**: How to design WebSocket message protocol for real-time rhythm data streaming with <200ms latency?
   - **Research Goal**: Find best practices for WebSocket message batching, reconnection logic, and backpressure handling in audio-critical applications
   - **Deliverable**: Decision on WebSocket library (ws vs. socket.io), message format (binary vs. JSON), heartbeat/ping-pong patterns

4. **Gemini API Prompt Engineering for Music Insights**
   - **Unknown**: How to engineer Gemini prompts that generate accurate, emotionally resonant mood recommendations from rhythm data?
   - **Research Goal**: Find few-shot examples, structured output patterns (JSON), and token optimization techniques for gemini-1.5-flash
   - **Deliverable**: Decision on prompt templates, few-shot examples for steady/erratic patterns, Gemini model selection (flash vs. pro)

5. **Auth0 React + Express Integration Patterns**
   - **Unknown**: How to integrate Auth0 with React frontend and Express backend using OAuth2 PKCE flow?
   - **Research Goal**: Find best practices for @auth0/auth0-react setup, JWT verification in Express middleware, token refresh patterns
   - **Deliverable**: Decision on Auth0 SDK configuration, JWT verification library (jsonwebtoken vs. express-oauth2-jwt-bearer), token storage (localStorage vs. memory)

6. **MongoDB Session Schema Design for Privacy**
   - **Unknown**: How to design Mongoose schemas that enforce anonymization and minimal data retention?
   - **Research Goal**: Find best practices for hashed user IDs, TTL indexes for auto-deletion, and aggregation-only metrics storage
   - **Deliverable**: Decision on Mongoose schema validation, TTL index configuration (90-day auto-delete), userId hashing algorithm (SHA-256 vs. bcrypt)

7. **Express Rate Limiting and Security Middleware**
   - **Unknown**: How to configure express-rate-limit to prevent API abuse while maintaining user experience?
   - **Research Goal**: Find optimal rate limit thresholds for session creation, AI insight requests, and WebSocket connections
   - **Deliverable**: Decision on rate limit values (100 req/15min per Constitution), express-rate-limit store (memory vs. Redis), custom rate limit handlers

### Research Output Format

Each research task will be documented in `research.md` with:

```markdown
## [Topic]: [What was researched]

### Decision
[What was chosen - specific technology, library version, pattern]

### Rationale
[Why this choice was made - performance, security, simplicity, ecosystem fit]

### Alternatives Considered
[What else was evaluated and why rejected]

### Implementation Notes
[Practical guidance for Phase 1 implementation]

### References
- [Link to documentation]
- [Link to relevant articles/tutorials]
- [Link to example implementations]
```

## Phase 1: Design & Contracts

### Data Model (`data-model.md`)

Extract entities from feature specification and define MongoDB Mongoose schemas:

1. **FocusSession**
   - Fields: sessionId (UUID), userId (hashed SHA-256), startTime (ISO 8601), endTime (ISO 8601), duration (seconds), totalKeystrokes (integer), totalClicks (integer), averageTempo (keys/min), selectedMood (enum), selectedInstruments (array), aiInsight (text, nullable), createdAt (timestamp)
   - Validation: duration > 0, totalKeystrokes >= 0, averageTempo >= 0, selectedMood in [calm, focus, energy]
   - Relationships: Belongs to User (via hashed userId), Has One AIMoodRecommendation
   - State Transitions: ACTIVE → PAUSED → ACTIVE → COMPLETED
   - TTL Index: Auto-delete after 90 days (createdAt + 90 days)

2. **RhythmMetrics** (in-memory, not persisted)
   - Fields: currentBPM (float), rollingAvgBPM (float), tempoTrend (enum), activityLevel (enum), lastKeystrokeTimestamp (timestamp), keystrokeVelocity (ms)
   - Validation: currentBPM >= 0, rollingAvgBPM >= 0, tempoTrend in [increasing, steady, decreasing]
   - Relationships: Associated with current FocusSession (transient)
   - Note: Real-time data, not stored in MongoDB, only used for live session tracking

3. **UserPreferences**
   - Fields: userId (hashed SHA-256), defaultMood (enum), defaultInstruments (array), masterVolume (0-100), accessibilityModeEnabled (boolean), createdAt (timestamp), updatedAt (timestamp)
   - Validation: masterVolume between 0-100, defaultMood in [calm, focus, energy], defaultInstruments subset of [grandPiano, electricPiano, violin, bass]
   - Relationships: Belongs to User (1:1)
   - State Transitions: N/A (settings object, no workflow states)

4. **AIMoodRecommendation**
   - Fields: recommendationId (UUID), sessionId (UUID), suggestedMood (enum), rationale (text), confidence (0-1 float), generatedAt (timestamp), geminiModel (string)
   - Validation: confidence between 0-1, suggestedMood in [calm, focus, energy], geminiModel matches /^gemini-1\.5-(flash|pro)$/
   - Relationships: References FocusSession (many:1)
   - State Transitions: N/A (immutable once generated)

### API Contracts (`contracts/`)

Generate OpenAPI 3.0 schemas for REST API endpoints:

1. **`contracts/sessions.openapi.yaml`**
   - **POST /api/sessions**: Create new focus session
     - Request: `{ userId: string, selectedMood: enum, selectedInstruments: string[] }`
     - Response: `{ sessionId: UUID, startTime: ISO8601 }`
   - **GET /api/sessions/:sessionId**: Retrieve session details
     - Response: `FocusSession` object
   - **PUT /api/sessions/:sessionId**: Update session (pause/resume/stop)
     - Request: `{ status: enum, endTime?: ISO8601, totalKeystrokes?: int, totalClicks?: int, averageTempo?: float }`
     - Response: `FocusSession` object
   - **DELETE /api/sessions/:sessionId**: Delete session (right to be forgotten)
     - Response: `{ deleted: boolean }`
   - **GET /api/sessions/history**: List user's past sessions (paginated)
     - Query: `?page=1&limit=20&mood=calm`
     - Response: `{ sessions: FocusSession[], total: int, page: int }`

2. **`contracts/rhythm.openapi.yaml`**
   - **WebSocket /rhythm**: Real-time rhythm data stream
     - Client → Server: `{ sessionId: UUID, keystroke: { timestamp: ISO8601, velocity: float }, click: { timestamp: ISO8601 } }`
     - Server → Client: `{ currentBPM: float, rollingAvgBPM: float, tempoTrend: enum, activityLevel: enum }`
   - Note: WebSocket protocol documented as OpenAPI extension (not standard REST)

3. **`contracts/ai-insights.openapi.yaml`**
   - **POST /api/ai/insights**: Generate mood recommendation via Gemini API
     - Request: `{ sessionId: UUID, rhythmPattern: { steady: boolean, avgTempo: float, duration: int } }`
     - Response: `{ suggestedMood: enum, rationale: string, confidence: float, geminiModel: string }`
     - Error Responses: `503 Service Unavailable` (Gemini API down, returns generic tip), `429 Too Many Requests` (rate limit exceeded)

4. **`contracts/preferences.openapi.yaml`**
   - **GET /api/preferences**: Retrieve user preferences
     - Response: `UserPreferences` object
   - **PUT /api/preferences**: Update user preferences
     - Request: `{ defaultMood?: enum, defaultInstruments?: string[], masterVolume?: int, accessibilityModeEnabled?: boolean }`
     - Response: `UserPreferences` object

### Quickstart Guide (`quickstart.md`)

Developer onboarding guide (target: <1 hour setup):

```markdown
# Quickstart: Adaptive Focus Music Engine Development

## Prerequisites
- Node.js 18+ and npm 9+
- MongoDB Atlas account (free tier) or local MongoDB 7+
- Auth0 account (free tier)
- Gemini API key (Google AI Studio)

## Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd pulseplay-ai
   git checkout 001-adaptive-focus-music
   npm install
   cd backend && npm install && cd ..
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Fill in:
   # - MONGODB_URI (MongoDB Atlas connection string)
   # - AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE
   # - GEMINI_API_KEY
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1: Frontend (Vite)
   npm run dev

   # Terminal 2: Backend (Express + WebSocket)
   cd backend && npm run dev
   ```

4. **Verify Setup**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/health
   - WebSocket: ws://localhost:3000/rhythm

5. **Run Tests**
   ```bash
   npm run test           # Frontend unit tests
   cd backend && npm test # Backend unit tests
   npm run test:e2e       # Playwright E2E tests
   ```

## Key Files to Explore
- `src/hooks/useAudioEngine.ts` - Web Audio API synthesis
- `src/components/RhythmVisualizer.tsx` - Canvas waveform
- `backend/src/services/geminiService.ts` - AI insights
- `backend/src/websocket/rhythmSocket.ts` - Real-time rhythm
```

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh copilot` to update `.github/copilot-instructions.md` with:
- New technologies: Web Audio API, Canvas API, WebSocket (ws), Gemini API (@google/generative-ai), Auth0 (@auth0/auth0-react), Pino (logging)
- Architecture decisions from `research.md`
- Key abstractions: useAudioEngine, useRhythmDetection, useWebSocket hooks
- Testing strategies: Vitest for unit, Playwright for E2E, Web Audio API mocking

## Phase 1 Deliverables Checklist

- [ ] `research.md` created with all 7 research tasks completed
- [ ] `data-model.md` created with 4 entities (FocusSession, RhythmMetrics, UserPreferences, AIMoodRecommendation)
- [ ] `contracts/sessions.openapi.yaml` created with 5 endpoints
- [ ] `contracts/rhythm.openapi.yaml` created with WebSocket protocol
- [ ] `contracts/ai-insights.openapi.yaml` created with Gemini integration endpoint
- [ ] `contracts/preferences.openapi.yaml` created with 2 endpoints
- [ ] `quickstart.md` created with <1 hour setup guide
- [ ] Agent context updated (`.github/copilot-instructions.md` or `.cursor/instructions.md`)
- [ ] Constitution Check re-evaluated (no new violations introduced)

## Stop Point

**Command ends here per speckit.plan.prompt.md instructions. Phase 2 (task breakdown) is handled by `/speckit.tasks` command.**

---

## Reporting

**Branch**: `001-adaptive-focus-music`  
**Implementation Plan**: `/home/rl/Desktop/pulseplay-ai/specs/001-adaptive-focus-music/plan.md`  
**Feature Specification**: `/home/rl/Desktop/pulseplay-ai/specs/001-adaptive-focus-music/spec.md`  
**Validation Checklist**: `/home/rl/Desktop/pulseplay-ai/specs/001-adaptive-focus-music/checklists/requirements.md`

**Next Steps**:
1. Execute Phase 0: Research all 7 technology decisions, create `research.md`
2. Execute Phase 1: Generate `data-model.md`, `contracts/`, `quickstart.md`, update agent context
3. Run `/speckit.tasks` to generate `tasks.md` with actionable implementation tasks

**Constitution Compliance**: ✅ All 5 principles verified (Experience-First, AI-Augmented, Data-Respectful, Open Source, Simplicity & Observability)
