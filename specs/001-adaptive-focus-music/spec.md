# Feature Specification: Adaptive Focus Music Engine

**Feature Branch**: `001-adaptive-focus-music`  
**Created**: 2025-10-18  
**Status**: Draft  
**Input**: User description: "Build an AI-powered web application that generates adaptive focus music based on a user's typing rhythm, mouse movement, or selected mood. The app listens to how users naturally interact during their work sessions and translates those rhythmic patterns into dynamic, ambient soundscapes that shift in real time to maintain concentration and flow."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Basic Focus Session with Ambient Background (Priority: P1) 🎯 MVP

A user opens the application, selects a mood (calm, focus, or energy), and clicks "Start Session." The app begins playing soft ambient Lofi-style background music matching the selected mood without requiring any typing or mouse activity.

**Why this priority**: Core value proposition—users get immediate ambient sound for focus without complexity. This is the foundation that all other features build upon. MVP must deliver value even without rhythm detection.

**Independent Test**: Can be fully tested by starting a session with each mood selection and verifying appropriate ambient sound plays continuously. Delivers immediate value: personalized ambient music for focus.

**Acceptance Scenarios**:

1. **Given** a user on the application homepage, **When** they click "Start Session" without selecting a mood, **Then** default "focus" mood ambient sound begins playing at comfortable volume (50%)
2. **Given** a user selects "calm" mood, **When** they start a session, **Then** soft, slow-tempo Lofi ambient background plays (60-80 BPM range)
3. **Given** a user selects "energy" mood, **When** they start a session, **Then** upbeat, moderately fast Lofi ambient background plays (110-130 BPM range)
4. **Given** a session is playing, **When** the user adjusts the volume slider, **Then** ambient sound volume changes smoothly in real-time (0-100%)
5. **Given** a session is playing, **When** the user clicks "Stop Session," **Then** audio fades out gracefully over 2 seconds and session statistics are displayed

---

### User Story 2 - Visualize Typing Rhythm as Waveform (Priority: P1) 🎯 MVP

During an active focus session, a user types on their keyboard. The application displays a real-time waveform visualization that pulses and animates in sync with their typing rhythm, providing immediate visual feedback that the system is detecting their activity.

**Why this priority**: Visual feedback is critical for users to understand the system is working and responding to their input. Neurodiverse users especially benefit from multimodal feedback (audio + visual). This builds trust in the adaptive system.

**Independent Test**: Can be tested by starting a session, typing at varying speeds (slow, medium, fast bursts), and observing waveform animation changes. Delivers value: visual representation of focus rhythm creates engagement and transparency.

**Acceptance Scenarios**:

1. **Given** an active focus session, **When** the user types a keystroke, **Then** the waveform visualization displays a pulse/spike corresponding to that keystroke within 50ms
2. **Given** the user types rapidly (5+ keystrokes per second), **When** they continue typing, **Then** the waveform shows higher amplitude and more frequent pulses
3. **Given** the user stops typing for 3+ seconds, **When** no input detected, **Then** the waveform gradually returns to a calm baseline state
4. **Given** the user clicks their mouse, **When** the click is detected, **Then** the waveform shows a subtle pulse (less prominent than keyboard)
5. **Given** a user with accessibility mode enabled, **When** viewing the waveform, **Then** animations respect `prefers-reduced-motion` settings (simplified, non-flickering visuals)

---

### User Story 3 - Adaptive Instrumental Sounds on Keystroke/Click (Priority: P2)

During a focus session, each keystroke or mouse click triggers a short instrumental sound (like a piano note or violin pluck) layered over the ambient background. The tempo and intensity of these sounds increase as typing speed increases, creating a dynamic, responsive musical experience.

**Why this priority**: This is the core "adaptive" feature that transforms passive background music into active collaboration between user and app. Creates the unique "typing rhythm becomes music" experience that differentiates PulsePlay from static playlists.

**Independent Test**: Can be tested by starting a session, selecting instruments (piano, violin), typing at varying speeds, and listening for instrument sounds that match typing rhythm. Delivers value: personalized, interactive music that responds to work patterns.

**Acceptance Scenarios**:

1. **Given** a session with "grand piano" instrument selected, **When** the user presses a key, **Then** a piano note plays layered over ambient sound (duration: 0.5-1 second, non-distracting volume)
2. **Given** a session with typing speed at 60 keystrokes/minute, **When** the user continues typing, **Then** piano notes play at calm, spaced intervals matching the rhythm
3. **Given** typing speed increases to 120 keystrokes/minute, **When** the user types faster, **Then** piano notes play more rapidly with slightly higher pitch range (sounds more energetic but not chaotic)
4. **Given** a user selects multiple instruments (grand piano + violin), **When** they type, **Then** alternating piano and violin notes play, distributed across keystrokes (e.g., piano on odd, violin on even)
5. **Given** a mouse click is detected, **When** the user clicks, **Then** a softer, bass-range instrument sound plays (less prominent than keyboard notes)
6. **Given** typing pauses for 5+ seconds, **When** no activity detected, **Then** instrumental sounds stop playing, ambient background continues
7. **Given** accessibility mode enabled, **When** typing, **Then** instrumental sounds use lower frequency ranges (200-800 Hz) to avoid sensory overload

---

### User Story 4 - Select and Switch Instruments (Priority: P2)

A user can choose which instruments produce sounds during their typing session. Available instruments include grand piano, electric piano, violin, and bass guitar. Users can select multiple instruments simultaneously, and switch instruments mid-session without interrupting the audio flow.

**Why this priority**: Personalization is key to maintaining long-term engagement. Different users prefer different sonic textures. Allowing choice respects individual preferences and neurodiverse needs (some users may find certain instruments distracting).

**Independent Test**: Can be tested by starting a session, selecting different instruments one at a time, then selecting multiple, then switching mid-session. Delivers value: customizable experience that users can tailor to their preferences.

**Acceptance Scenarios**:

1. **Given** the control panel is visible, **When** the user clicks on "grand piano" instrument icon, **Then** grand piano is selected (visual indicator shows active state) and subsequent keystrokes trigger piano sounds
2. **Given** grand piano is already selected, **When** the user clicks on "violin," **Then** both piano and violin are selected, keystrokes alternate between instruments
3. **Given** multiple instruments selected (piano + violin), **When** the user de-selects piano, **Then** only violin sounds play on keystrokes, transition is smooth (no audio glitches)
4. **Given** an active typing session with piano sounds, **When** the user switches to bass guitar, **Then** the next keystroke produces bass guitar sound, previous notes fade naturally
5. **Given** no instruments selected, **When** the user types, **Then** only ambient background plays (no per-keystroke sounds)
6. **Given** "electric piano" selected, **When** typing slowly, **Then** electric piano notes sound mellow and spaced; **When** typing rapidly, **Then** electric piano notes sound brighter and more energetic

---

### User Story 5 - Receive AI-Driven Mood Recommendations (Priority: P3)

After completing a focus session (minimum 10 minutes), the user sees AI-generated insights and mood recommendations. The AI analyzes the session's typing rhythm patterns (e.g., steady vs. erratic, fast vs. slow) and suggests a mood for the next session that might enhance productivity.

**Why this priority**: AI augmentation provides value beyond what users could discover manually. Insights help users understand their focus patterns and optimize future sessions. This is "nice-to-have" compared to core adaptive music functionality.

**Independent Test**: Can be tested by completing sessions with different typing patterns (steady fast, erratic slow, burst typing) and verifying AI suggestions differ appropriately. Delivers value: personalized productivity insights that improve over time.

**Acceptance Scenarios**:

1. **Given** a 15-minute session with steady, fast typing (100+ keystrokes/min), **When** the session ends, **Then** AI suggests "energy" mood for next session with rationale: "Your rhythm was consistent and energetic—energy mode may maintain your flow"
2. **Given** a 20-minute session with slow, erratic typing (30-50 keystrokes/min), **When** the session ends, **Then** AI suggests "calm" mood with rationale: "Your rhythm was slower and more thoughtful—calm mode may help sustain deep focus"
3. **Given** a session shorter than 10 minutes, **When** the session ends, **Then** no AI recommendation displayed, message shows: "Complete a 10+ minute session for AI insights"
4. **Given** AI service (Gemini API) is unavailable, **When** session ends, **Then** fallback message displays: "AI insights unavailable—try again next session" (no error, graceful degradation)
5. **Given** a user has completed 5+ sessions, **When** viewing session history, **Then** AI provides a weekly summary of focus patterns and mood effectiveness

---

### User Story 6 - View Session Statistics and History (Priority: P3)

Users can view statistics from their current session (duration, total keystrokes, average typing tempo) in real-time, and access a history of past sessions with metrics and mood choices. This data helps users track focus habits over time.

**Why this priority**: Analytics provide motivation and self-awareness but aren't essential to the core adaptive music experience. Users can benefit from music without ever looking at stats. This is valuable for power users and long-term engagement.

**Independent Test**: Can be tested by completing multiple sessions with different activities, viewing real-time stats, and accessing session history. Delivers value: self-awareness and motivation through quantified focus tracking.

**Acceptance Scenarios**:

1. **Given** an active 5-minute session with 250 keystrokes, **When** the user views the session stats panel, **Then** stats display: "Duration: 5:00", "Keystrokes: 250", "Tempo: 50 keys/min"
2. **Given** typing speed increases from 40 to 80 keystrokes/min during session, **When** stats update, **Then** "Tempo" value updates in real-time (every 5 seconds) to reflect current rolling average
3. **Given** a completed session, **When** the user navigates to "Session History," **Then** a list of past sessions displays with: date, duration, mood, keystrokes, avg tempo
4. **Given** 10+ past sessions, **When** viewing history, **Then** sessions are sorted by date (most recent first) and user can filter by mood type
5. **Given** a user exports their session data, **When** they click "Export Data," **Then** a JSON file downloads containing all session metrics (anonymous, no keystroke content)

---

### Edge Cases

- **What happens when a user types extremely fast (200+ keystrokes/min)?**  
  The system caps instrumental note frequency to prevent audio chaos—notes blend together smoothly rather than creating overlapping noise. Waveform shows high energy but remains visually clear (not a blur).

- **How does the system handle rapid mouse clicking vs. keyboard typing?**  
  Mouse clicks trigger lower-volume, bass-range sounds to differentiate from keyboard notes. If a user clicks rapidly (e.g., 10 clicks/second), the system throttles sound generation to every other click to prevent sensory overload.

- **What if a user's browser doesn't support Web Audio API?**  
  The app displays a browser compatibility warning: "Your browser doesn't support advanced audio features. Please use Chrome, Firefox, Safari, or Edge 90+." The app remains accessible but core features are disabled.

- **What if Gemini API fails during AI insight generation?**  
  The app gracefully degrades—shows generic productivity tip instead of AI-personalized insight. Logs error for debugging but never blocks user from viewing session stats or starting a new session.

- **How does the system handle extended periods of inactivity (user AFK)?**  
  If no keyboard/mouse activity for 5 minutes during an active session, ambient music continues playing but instrumental sounds stop. After 10 minutes of inactivity, the app displays a gentle prompt: "Still working? Click to keep session active" to avoid inflating session duration metrics.

- **What if a user enables accessibility mode mid-session?**  
  Settings apply immediately—waveform animations simplify (no rapid flashing), instrumental sounds shift to lower frequency ranges, visual contrast increases. Audio fades smoothly during transition (no jarring changes).

- **How does the system handle multiple instrument selections with very fast typing?**  
  When 3+ instruments selected and typing speed >100 keystrokes/min, the system intelligently distributes instruments across keystrokes (round-robin or pattern-based) to maintain harmonic balance and prevent audio mud.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect keyboard keystrokes in real-time using browser keyboard event listeners (keydown events)
- **FR-002**: System MUST detect mouse clicks in real-time using browser mouse event listeners (mousedown events)
- **FR-003**: System MUST calculate typing tempo (keystrokes per minute) based on a rolling 30-second window, updated every 5 seconds
- **FR-004**: System MUST synthesize ambient background music using Web Audio API (OscillatorNode, GainNode, BiquadFilterNode for Lofi texture)
- **FR-005**: System MUST generate instrumental sounds (piano, violin, electric piano, bass guitar) on each keystroke/click using Web Audio API oscillators and envelope generators
- **FR-006**: System MUST render a real-time waveform visualization on HTML5 Canvas that pulses in sync with detected keystrokes and mouse clicks
- **FR-007**: System MUST provide three selectable moods: "calm" (60-80 BPM ambient), "focus" (85-110 BPM ambient), "energy" (110-130 BPM ambient)
- **FR-008**: System MUST allow users to select one or multiple instruments simultaneously (grand piano, electric piano, violin, bass guitar) from a visual control panel
- **FR-009**: System MUST adapt instrumental sound pitch and rhythm based on typing speed: slow typing (<40 keys/min) = lower pitch, calm rhythm; fast typing (>80 keys/min) = higher pitch, energetic rhythm
- **FR-010**: System MUST maintain Lofi music aesthetic: warm, non-distracting, analog-style textures with subtle imperfections (e.g., gentle reverb, low-pass filtering)
- **FR-011**: System MUST track session metrics: duration (HH:MM:SS), total keystrokes, total clicks, average tempo, selected mood, selected instruments
- **FR-012**: System MUST persist completed session data to MongoDB Atlas (anonymized: no keystroke content, only aggregated metrics)
- **FR-013**: System MUST integrate with Gemini API to generate mood recommendations based on session rhythm patterns (steady vs. erratic, fast vs. slow)
- **FR-014**: System MUST display AI-generated insights after sessions >10 minutes, with graceful fallback if Gemini API unavailable (show generic productivity tip)
- **FR-015**: System MUST provide accessibility mode: lower frequency instrument sounds (200-800 Hz), respect `prefers-reduced-motion` for waveform, high contrast UI
- **FR-016**: System MUST allow users to adjust master volume (0-100%) via slider, affecting both ambient and instrumental sounds proportionally
- **FR-017**: System MUST allow users to pause/resume sessions without losing current stats (duration continues from pause point)
- **FR-018**: System MUST allow users to export session data as JSON (all metrics, no PII)
- **FR-019**: System MUST authenticate users via Auth0 (OAuth2 PKCE flow) to enable session persistence and history access
- **FR-020**: System MUST log rhythm detection events (BPM changes, tempo shifts) using structured JSON logging (pino) for observability

### Key Entities

- **FocusSession**: Represents a single focus work session  
  *Attributes*: sessionId (UUID), userId (hashed), startTime (ISO 8601), endTime (ISO 8601), duration (seconds), totalKeystrokes (integer), totalClicks (integer), averageTempo (keys/min), selectedMood (enum: calm/focus/energy), selectedInstruments (array: strings), aiInsight (text, nullable), createdAt (timestamp)  
  *Relationships*: Belongs to User (via hashed userId)

- **RhythmMetrics**: Real-time typing rhythm data calculated during session  
  *Attributes*: currentBPM (float), rollingAvgBPM (float), tempoTrend (enum: increasing/steady/decreasing), activityLevel (enum: low/medium/high), lastKeystrokeTimestamp (timestamp), keystrokeVelocity (ms between strokes)  
  *Relationships*: Associated with current FocusSession

- **UserPreferences**: Stored user settings for personalization  
  *Attributes*: userId (hashed), defaultMood (enum: calm/focus/energy), defaultInstruments (array: strings), masterVolume (0-100), accessibilityModeEnabled (boolean), createdAt (timestamp), updatedAt (timestamp)  
  *Relationships*: Belongs to User

- **AIMoodRecommendation**: AI-generated suggestion for next session  
  *Attributes*: recommendationId (UUID), sessionId (UUID), suggestedMood (enum: calm/focus/energy), rationale (text), confidence (0-1 float), generatedAt (timestamp), geminiModel (string: e.g., "gemini-2.5-flash")  
  *Relationships*: References FocusSession that triggered recommendation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start a focus session and hear ambient music within 2 seconds of clicking "Start Session"
- **SC-002**: Waveform visualization responds to keystrokes within 50ms (imperceptible latency to human perception)
- **SC-003**: Instrumental sounds trigger within 100ms of keystroke detection (tight audio-visual sync)
- **SC-004**: System adapts tempo smoothly: typing speed increase from 40 to 80 keys/min results in gradual pitch shift over 10-15 seconds (no jarring transitions)
- **SC-005**: 90% of users successfully complete their first focus session (start, type, stop) without confusion or errors
- **SC-006**: Users can switch instruments mid-session with zero audio glitches or dropouts (seamless transitions)
- **SC-007**: AI mood recommendations are generated within 3 seconds of session completion (when Gemini API is available)
- **SC-008**: Accessibility mode reduces instrumental sound frequency to 200-800 Hz range and simplifies waveform animations (tested with screen reader users)
- **SC-009**: Session statistics (duration, keystrokes, tempo) update in real-time with <5 second lag
- **SC-010**: System handles 1000 concurrent users without audio latency degradation (tested via load simulation)
- **SC-011**: Users rate the music as "non-distracting" in 85%+ of post-session surveys (5-point Likert scale: 4-5 = non-distracting)
- **SC-012**: Session data export completes in <2 seconds and contains all metrics in valid JSON format
- **SC-013**: 70% of users who complete 3+ sessions report improved focus awareness (self-reported in feedback survey)
- **SC-014**: MongoDB session storage completes within 500ms of session end (no blocking UI)

### Constitution Compliance

This feature MUST comply with PulsePlay AI Constitution (v2.1.0):

- [ ] **Experience-First Design**: Interface intuitive (30-second understanding), distraction-free (Lofi aesthetic, no visual clutter), WCAG 2.1 AA compliant (keyboard nav, ARIA labels, color contrast 4.5:1), audio-visual synchronization seamless (<100ms latency)
- [ ] **AI-Augmented Creativity**: Gemini API integration transparent (logs all prompts/responses), value-driven (mood recommendations improve over time), fail-safe fallbacks implemented (generic tips if API fails)
- [ ] **Data-Respectful Architecture**: Minimal data collection (no keystroke content, only aggregated metrics), MongoDB anonymization (hashed user IDs, no PII), user control (export session data as JSON, delete all data on request)
- [ ] **Open Source Integrity**: JSDoc complete (every hook, component, function), README updated (setup instructions, feature overview), ARCHITECTURE.md updated (audio engine, rhythm detection, AI integration diagrams), contribution workflow documented (1-hour onboarding target)
- [ ] **Simplicity and Observability**: YAGNI/KISS principles followed (no over-engineered features), structured logging (rhythm metrics, AI latency, audio node creation in JSON format via pino), modular design (separate hooks for audio engine, rhythm detection, session persistence), testable (70%+ coverage on critical paths)

## Assumptions

- Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14.1+) with Web Audio API support
- Users have working keyboards and mice (mobile support is out of scope for MVP)
- Gemini API quota is sufficient for expected user volume (fallback to generic tips if rate limits hit)
- DigitalOcean Gradient™ AI is not required for MVP (stretch goal for future music generation)
- Users understand English (localization is out of scope for MVP)
- Default volume (50%) is comfortable for most users; users can adjust as needed
- Session duration tracking accuracy of ±5 seconds is acceptable
- Lofi aesthetic is universally perceived as "non-distracting" by target audience (developers, writers, neurodiverse users)
- MongoDB Atlas free tier is sufficient for initial user base (<100 users)
- Auth0 free tier supports expected user authentication volume

## Out of Scope

- Mobile/tablet native apps (web-only for MVP)
- Offline mode (requires internet for Auth0, Gemini API, MongoDB)
- Custom audio file uploads (only synthesized Web Audio API sounds)
- Social features (sharing sessions, collaborative focus rooms)
- Advanced analytics (heatmaps, focus score algorithms)
- Binaural beats or brainwave entrainment features
- Multi-language support (English only for MVP)
- Desktop application (Electron wrapper)
- Integration with productivity tools (Notion, Todoist, etc.)
- Gamification (achievements, streaks, leaderboards)
- Premium tier with advanced features (all features free and open source)
