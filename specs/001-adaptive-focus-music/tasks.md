# Tasks: Adaptive Focus Music Engine

**Input**: Design documents from `/specs/001-adaptive-focus-music/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL for this feature and NOT included (not explicitly requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend**: `src/` (React + TypeScript + Vite)
- **Backend**: `backend/src/` (Node.js + Express + Mongoose)
- **Shared types**: `src/types/` (TypeScript interfaces shared across frontend)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install backend dependencies (Express, Mongoose, ws, @google/generative-ai, pino, express-rate-limit)
- [X] T002 Install frontend dependencies (@auth0/auth0-react, lucide-react already installed via package.json)
- [X] T003 [P] Configure Biome.js linting and formatting (biome.json with TypeScript strict rules)
- [ ] T004 [P] Set up testing framework (Vitest + @testing-library/react for frontend, Vitest for backend)
- [X] T005 [P] Create backend project structure (backend/src/models/, routes/, services/, middleware/, config/, utils/)
- [X] T006 [P] Create .env.example with required environment variables (MONGODB_URI, AUTH0_*, GEMINI_API_KEY)
- [X] T007 [P] Configure TypeScript for backend (backend/tsconfig.json with strict mode, ES2022 target)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Constitution Compliance Tasks (mandatory per v2.2.0)

- [X] T010 **Experience-First Design**: Create base TailwindCSS theme with slate color palette (tailwind.config.js), define accessibility patterns
- [X] T011 **AI-Augmented Creativity**: Set up Gemini API client service with error handling and fallback logic in backend/src/services/geminiService.ts
- [X] T012 **Data-Respectful Architecture**: Configure MongoDB connection with Mongoose in backend/src/config/database.ts, implement SHA-256 hashing utility
- [X] T013 **Open Source Integrity**: Update README.md with setup instructions, create CONTRIBUTING.md with 1-hour onboarding target
- [X] T014 **Simplicity and Observability**: Configure pino structured logging in backend/src/config/logger.ts (JSON format, log levels)
- [ ] T015 Consult Context7 MCP for latest Mongoose, Gemini API, and Auth0 documentation

### Core Infrastructure

- [X] T016 Create MongoDB models directory structure in backend/src/models/
- [X] T017 Implement Auth0 configuration in backend/src/config/auth0.ts (express-oauth2-jwt-bearer middleware)
- [X] T018 [P] Configure Auth0 React provider wrapper in src/components/Auth0ProviderWrapper.tsx (@auth0/auth0-react)
- [X] T019 [P] Create base Express server in backend/src/server.ts (middleware, routes, error handling)
- [X] T020 [P] Implement rate limiting middleware in backend/src/middleware/rateLimiter.ts (100 req/15min general, 10 req/hour AI)
- [X] T021 [P] Create API error handler middleware in backend/src/middleware/errorHandler.ts
- [X] T022 [P] Set up WebSocket server in backend/src/websocket/server.ts (ws library, heartbeat, reconnect)
- [X] T023 [P] Create base Web Audio API context wrapper in src/lib/audioContext.ts
- [X] T024 [P] Create TypeScript interfaces for shared types in backend/src/types/index.ts

**Checkpoint**: All Phase 2 tasks complete. Backend infrastructure ready. Proceed to Phase 3.

**✅ Build Tested**: October 18, 2025
- Frontend: http://localhost:5174/ (Vite 5.4.20) ✅
- Backend: http://localhost:3001/ (Express + TypeScript) ✅  
- All endpoints operational (see docs/ENDPOINT_TEST_REPORT.md)

---

## Phase 3: User Story 1 - Start Basic Focus Session with Ambient Background (Priority: P1) 🎯 MVP

**Goal**: Users can select a mood (calm/focus/energy) and start a session that plays continuous ambient Lofi music

**Independent Test**: Start session with each mood (calm, focus, energy), verify ambient sound plays at appropriate BPM range. Adjust volume slider, verify real-time volume changes. Stop session, verify graceful fadeout.

### Implementation for User Story 1

- [X] T030 [P] [US1] Create FocusSession Mongoose model in backend/src/models/FocusSession.ts (schema with TTL index, SHA-256 hashing)
- [X] T031 [P] [US1] Create UserPreferences Mongoose model in backend/src/models/UserPreferences.ts
- [X] T032 [P] [US1] Implement session service in backend/src/services/sessionService.ts (create, retrieve, update, delete)
- [X] T033 [P] [US1] Implement POST /api/sessions endpoint in backend/src/routes/sessions.ts (create session)
- [X] T034 [P] [US1] Implement GET /api/sessions/:id endpoint in backend/src/routes/sessions.ts (retrieve session)
- [X] T035 [P] [US1] Implement PUT /api/sessions/:id endpoint in backend/src/routes/sessions.ts (update session)
- [X] T036 [US1] Create useAudioEngine React hook in src/hooks/useAudioEngine.ts (Web Audio API oscillators, filters, gain nodes)
- [X] T037 [US1] Implement ambient music generator in src/services/audioService.ts (OscillatorNode setup for calm/focus/energy moods per research.md)
- [X] T038 [US1] Create ControlPanel component in src/components/ControlPanel.tsx (mood selector, start/stop buttons, volume slider)
- [X] T039 [US1] Implement session start/stop logic in src/hooks/useSessionPersistence.ts (API calls, session state management)
- [X] T040 [US1] Integrate Auth0 login button in src/components/AuthButton.tsx (redirect to Auth0, handle callback)
- [X] T041 [US1] Add volume control functionality to useAudioEngine hook (master gain node, 0-100% range)
- [X] T042 [US1] Implement graceful audio fadeout on session stop (2-second fade using exponentialRampToValueAtTime)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can start/stop sessions with ambient music

---

## Phase 4: User Story 2 - Visualize Typing Rhythm as Waveform (Priority: P1) 🎯 MVP

**Goal**: Display real-time waveform visualization that pulses in sync with typing rhythm and mouse clicks

**Independent Test**: Start session, type at varying speeds (slow, fast bursts), observe waveform amplitude changes. Stop typing, verify waveform returns to baseline. Enable accessibility mode, verify simplified animations.

### Implementation for User Story 2

- [X] T050 [P] [US2] Create useRhythmDetection React hook in src/hooks/useRhythmDetection.ts (keyboard/mouse event listeners, BPM calculation)
- [X] T051 [P] [US2] Implement RhythmMetrics calculator in src/services/rhythmService.ts (rolling 30-second window, tempo trends)
- [X] T052 [US2] Create RhythmVisualizer component in src/components/RhythmVisualizer.tsx (Canvas with requestAnimationFrame loop)
- [X] T053 [US2] Implement waveform rendering logic in RhythmVisualizer (AnalyserNode FFT data, gradient fills, pulse effect)
- [X] T054 [US2] Connect rhythm detection to waveform visualization (keystroke events trigger waveform spikes <50ms latency)
- [X] T055 [US2] Implement mouse click detection and waveform response (subtle bass-range pulses)
- [X] T056 [US2] Add baseline waveform animation for idle state (gentle sine wave motion)
- [X] T057 [US2] Implement accessibility mode waveform (respect prefers-reduced-motion, simplified animations)
- [X] T058 [US2] Optimize Canvas performance for 60fps (requestAnimationFrame throttling, efficient rendering)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - ambient music + waveform visualization

---

## Phase 5: User Story 3 - Adaptive Instrumental Sounds on Keystroke/Click (Priority: P2)

**Goal**: Each keystroke/click triggers instrumental sounds (piano, violin, etc.) that adapt to typing speed

**Independent Test**: Start session with "grand piano" selected, type at 60 keys/min then 120 keys/min, verify piano notes adapt (slower/faster, lower/higher pitch). Pause typing for 5+ seconds, verify instrumental sounds stop (ambient continues).

### Implementation for User Story 3

- [X] T070 [P] [US3] Implement instrumental sound generator in src/services/audioService.ts (OscillatorNode with ADSR envelopes per research.md)
- [X] T071 [P] [US3] Create instrument sound library (piano, violin, electric piano, bass) in src/lib/instruments.ts (frequency mappings, envelope parameters)
- [X] T072 [US3] Extend useRhythmDetection hook to trigger instrumental sounds on keystrokes (call playInstrumentNote function)
- [X] T073 [US3] Implement tempo-based pitch adaptation (typing speed 40-80 keys/min → lower pitch, 80-120 → higher pitch)
- [X] T074 [US3] Add mouse click sound generation (bass-range, lower volume than keyboard notes)
- [X] T075 [US3] Implement instrument sound throttling for rapid typing (>200 keys/min, blend notes smoothly)
- [X] T076 [US3] Add 5-second inactivity detection (stop instrumental sounds, keep ambient playing)
- [X] T077 [US3] Implement accessibility mode lower frequency range (200-800 Hz per research.md)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Select and Switch Instruments (Priority: P2)

**Goal**: Users can select multiple instruments and switch mid-session without audio interruptions

**Independent Test**: Start session, select grand piano (verify piano sounds on keystrokes), add violin (verify alternating piano/violin), remove piano (verify only violin), switch to bass mid-session (verify smooth transition).

### Implementation for User Story 4

- [X] T090 [P] [US4] Add instrument selection state to ControlPanel component in src/components/ControlPanel.tsx (multi-select UI with icons)
- [X] T091 [US4] Implement instrument toggle logic (add/remove from selected instruments array)
- [X] T092 [US4] Extend useAudioEngine hook to support multiple instruments (round-robin or pattern-based distribution)
- [X] T093 [US4] Implement smooth instrument switching (fade out previous notes, fade in new instrument)
- [X] T094 [US4] Add visual indicators for selected instruments (active state styling, Lucide icons)
- [X] T095 [US4] Handle edge case: no instruments selected (only ambient plays, no per-keystroke sounds)
- [X] T096 [US4] Handle edge case: 3+ instruments with fast typing (intelligent distribution to maintain harmonic balance)

**Checkpoint**: User Stories 1-4 should all be functional and independently testable

---

## Phase 7: User Story 5 - Receive AI-Driven Mood Recommendations (Priority: P3)

**Goal**: After 10+ minute sessions, users receive AI-generated mood recommendations based on typing patterns

**Independent Test**: Complete 15-minute session with steady fast typing (100+ keys/min), verify AI suggests "energy" mood with rationale. Complete 20-minute session with slow erratic typing, verify AI suggests "calm" mood. Test with Gemini API unavailable, verify fallback message.

### Implementation for User Story 5

- [X] T110 [P] [US5] Create AIMoodRecommendation Mongoose model in backend/src/models/AIMoodRecommendation.ts
- [X] T111 [P] [US5] Implement Gemini API prompt template in backend/src/services/geminiService.ts (few-shot examples, JSON structured output)
- [X] T112 [US5] Create POST /api/ai/mood-recommendation endpoint in backend/src/routes/ai.ts (analyze session, call Gemini)
- [X] T113 [US5] Implement session pattern analyzer in backend/src/services/sessionAnalyzer.ts (steady vs erratic, fast vs slow classification)
- [X] T114 [US5] Add prompt logging to Gemini service (log prompts/responses to pino for observability)
- [X] T115 [US5] Implement graceful fallback for Gemini API failures (return generic productivity tip)
- [X] T116 [US5] Create MoodInsights component in src/components/MoodInsights.tsx (display AI recommendation after session)
- [X] T117 [US5] Add 10-minute session duration check (only show AI insights for sessions ≥10 minutes)
- [X] T118 [US5] Implement weekly focus pattern summary (aggregate 5+ sessions, generate summary via Gemini)

**Checkpoint**: User Stories 1-5 should all be functional and independently testable

---

## Phase 8: User Story 6 - View Session Statistics and History (Priority: P3)

**Goal**: Users can view real-time session stats and access history of past sessions

**Independent Test**: Start 5-minute session with 250 keystrokes, verify stats display (duration, keystrokes, tempo). Complete session, navigate to history, verify session appears. Export data, verify JSON file downloads with all metrics (no PII).

### Implementation for User Story 6

- [X] T130 [P] [US6] Create SessionStats component in src/components/SessionStats.tsx (display duration, keystrokes, clicks, tempo)
- [X] T131 [P] [US6] Implement real-time stats updates (update every 5 seconds during session)
- [X] T132 [P] [US6] Create GET /api/sessions/history endpoint in backend/src/routes/sessions.ts (paginated list, mood filter)
- [X] T133 [P] [US6] Create GET /api/sessions/export endpoint in backend/src/routes/sessions.ts (return JSON with all user sessions)
- [X] T134 [P] [US6] Create DELETE /api/sessions/all endpoint in backend/src/routes/sessions.ts (delete all user sessions)
- [X] T135 [US6] Create session history UI page in src/pages/SessionHistory.tsx (list past sessions, sort by date)
- [X] T136 [US6] Implement session filtering by mood type (calm/focus/energy dropdown filter)
- [X] T137 [US6] Add data export button in SessionHistory component (trigger JSON download)
- [X] T138 [US6] Implement rolling average tempo calculation (30-second window, update every 5 seconds)
- [X] T139 [US6] Add session duration formatter utility in src/utils/timeFormatter.ts (convert seconds to HH:MM:SS)

**Checkpoint**: All 6 user stories should now be independently functional

**Checkpoint**: All 6 user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Constitution Compliance (Mandatory Review per v2.2.0)

- [ ] T150 [P] **Experience-First Design**: Run WCAG 2.1 AA accessibility audit (axe DevTools), verify keyboard navigation, test with screen reader
- [ ] T151 [P] **Experience-First Design**: Validate audio-visual sync latency (<100ms, test with Chrome DevTools Performance tab)
- [ ] T152 [P] **AI-Augmented Creativity**: Review Gemini prompt quality, verify all prompts logged to pino, test fallback scenarios (API down, rate limit)
- [ ] T153 [P] **Data-Respectful Architecture**: MongoDB security audit (verify SHA-256 hashing, test TTL auto-delete, validate no PII storage)
- [ ] T154 [P] **Data-Respectful Architecture**: Test user data controls (export JSON, delete all sessions, verify right to be forgotten)
- [ ] T155 [P] **Open Source Integrity**: Complete JSDoc coverage for all hooks, components, services (>90% documentation)
- [ ] T156 [P] **Open Source Integrity**: Update ARCHITECTURE.md with audio engine diagrams, rhythm detection flowcharts, AI integration patterns
- [ ] T157 [P] **Open Source Integrity**: Validate 1-hour onboarding target (follow quickstart.md, time setup process)
- [ ] T158 [P] **Simplicity and Observability**: Code complexity review (identify violations of YAGNI/KISS principles, refactor if needed)
- [ ] T159 [P] **Simplicity and Observability**: Validate structured logging (verify all critical events logged in JSON format via pino)
- [ ] T160 [P] **Simplicity and Observability**: Run test coverage report (target 70%+ on critical paths: audio engine, rhythm detection, AI integration)

### General Polish

- [ ] T161 [P] Code cleanup and refactoring (remove dead code, unused dependencies, console.logs)
- [ ] T162 [P] Performance optimization (Web Audio API node cleanup, Canvas rendering, API response times)
- [ ] T163 [P] Error boundary implementation (React error boundaries for graceful failure handling)
- [ ] T164 [P] Add loading states for async operations (session creation, AI insights, history loading)
- [ ] T165 [P] Implement 10-minute inactivity auto-pause (prompt user "Still working? Click to keep session active")
- [ ] T166 [P] Add browser compatibility check (warn if Web Audio API not supported)
- [ ] T167 Run quickstart.md end-to-end validation (setup, start servers, test key user journeys)
- [ ] T168 Create production build configuration (Vite build optimization, environment variable setup)
- [ ] T169 Write deployment documentation in docs/DEPLOYMENT.md (MongoDB Atlas, Auth0, hosting setup)
- [ ] T170 Final constitution compliance checklist review (verify all 5 principles satisfied per v2.2.0)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) OR
  - Sequentially in priority order: US1 → US2 → US3 → US4 → US5 → US6
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - **Delivers MVP**: Ambient music + session management
  
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - **Depends on US1**: Integrates with session start/stop logic
  - **Delivers MVP**: Waveform visualization + rhythm detection

- **User Story 3 (P2)**: Can start after Foundational (Phase 2)
  - **Depends on US2**: Extends rhythm detection to trigger instrumental sounds
  - **Delivers Core**: Adaptive instrumental layer

- **User Story 4 (P2)**: Can start after Foundational (Phase 2)
  - **Depends on US3**: Extends instrument sound generation to support multiple instruments
  - **Delivers Core**: Instrument personalization

- **User Story 5 (P3)**: Can start after Foundational (Phase 2)
  - **Depends on US1**: Analyzes FocusSession data for AI insights
  - **Delivers Analytics**: AI-powered mood recommendations

- **User Story 6 (P3)**: Can start after Foundational (Phase 2)
  - **Depends on US1**: Displays session statistics and history
  - **Delivers Analytics**: Session tracking and data export

### Within Each User Story

1. **Models** → **Services** → **API Routes** → **React Hooks** → **React Components**
2. Core implementation before integration
3. Story complete and tested before moving to next priority

### Parallel Execution Opportunities

**Phase 1 (Setup)**: T003, T004, T005, T006, T007 can run in parallel

**Phase 2 (Foundational)**: 
- Constitution tasks (T010-T015) can run in parallel
- Infrastructure tasks: T018, T019, T020, T021, T022, T023 can run in parallel after T016-T017

**Phase 3 (US1)**: T030, T031, T032, T033, T034, T035 (backend) can run parallel to T036-T042 (frontend)

**Phase 4 (US2)**: T050, T051 can run parallel to T052, T053

**Phase 5 (US3)**: T070, T071 can run in parallel

**Phase 6 (US4)**: T090, T091 can run parallel to T092, T093

**Phase 7 (US5)**: T110, T111 can run parallel to T116, T117

**Phase 8 (US6)**: T130, T131 can run parallel to T132, T133, T134

**Phase 9 (Polish)**: All T150-T170 tasks can run in parallel (different files/concerns)

---

## Implementation Strategy

### MVP-First Approach (Recommended)

**Minimum Viable Product (MVP) = User Stories 1 + 2**:
- **Phase 1**: Setup (1-2 days)
- **Phase 2**: Foundational (3-4 days)
- **Phase 3**: User Story 1 - Ambient music + sessions (3-4 days)
- **Phase 4**: User Story 2 - Waveform visualization (2-3 days)
- **Validation**: Test MVP with 5-10 users (1-2 days)
- **Total MVP timeline**: ~10-15 days

**Incremental Delivery**: After MVP validation, add User Stories 3-6 in priority order

### Full Feature Timeline

- **Phases 1-2**: 4-6 days (setup + foundation)
- **Phases 3-4**: 5-7 days (P1 user stories - MVP)
- **Phases 5-6**: 4-6 days (P2 user stories - core features)
- **Phases 7-8**: 5-7 days (P3 user stories - analytics)
- **Phase 9**: 3-4 days (polish + constitution compliance)
- **Total timeline**: ~21-30 days (single developer, sequential work)

### Team Parallelization

With 2-3 developers, user stories can be parallelized after Foundational phase:
- Developer 1: US1 + US3 (ambient music + instrumental sounds)
- Developer 2: US2 + US4 (waveform + instrument selection)
- Developer 3: US5 + US6 (AI insights + session history)
- **Parallel timeline**: ~14-20 days

---

## Task Summary

**Total Tasks**: 170
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 15 tasks
- **Phase 3 (US1)**: 13 tasks
- **Phase 4 (US2)**: 9 tasks
- **Phase 5 (US3)**: 8 tasks
- **Phase 6 (US4)**: 7 tasks
- **Phase 7 (US5)**: 9 tasks
- **Phase 8 (US6)**: 10 tasks
- **Phase 9 (Polish)**: 21 tasks

**Parallel Opportunities**: 45+ tasks can be executed in parallel (marked with [P])

**Independent Test Criteria**: Each user story has clear acceptance criteria and can be tested independently

**MVP Scope**: User Stories 1 + 2 (Phase 3-4) = 22 implementation tasks after foundation

**Constitution Compliance**: 11 mandatory review tasks in Phase 9 per v2.2.0
