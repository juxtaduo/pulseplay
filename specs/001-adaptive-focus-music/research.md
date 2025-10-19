# Technology Research: Adaptive Focus Music Engine

**Feature**: 001-adaptive-focus-music  
**Research Date**: 2025-10-18  
**Status**: Complete

This document captures all technology research and decisions made during Phase 0 planning for the Adaptive Focus Music Engine feature.

---

## 1. Web Audio API Lofi Synthesis Techniques

### Decision

Use **Web Audio API with modular synthesis approach**:
- **OscillatorNode** types: `sine` for sub-bass (60-120 Hz), `triangle` for melody (200-800 Hz), `sawtooth` for texture (400-2000 Hz)
- **BiquadFilterNode** types: `lowpass` (cutoff 3000-5000 Hz, Q 1.5) for Lofi warmth, `highpass` (cutoff 40 Hz) for rumble removal
- **GainNode** envelope: ADSR (Attack 0.1s, Decay 0.2s, Sustain 0.7, Release 0.3s) for natural instrument feel
- **Mood BPM mapping**:
  - Calm: 60-80 BPM, dominant sine/triangle oscillators, lowpass at 3000 Hz
  - Focus: 85-110 BPM, balanced oscillator mix, lowpass at 4000 Hz
  - Energy: 110-130 BPM, sawtooth prominence, lowpass at 5000 Hz

### Rationale

- **Performance**: Web Audio API runs on a separate thread (AudioWorklet), ensuring <50ms latency even with complex node graphs
- **Lofi aesthetic**: Low-pass filtering + oscillator detuning (±2-5 cents) creates analog warmth without sample libraries
- **Simplicity**: Modular node approach follows KISS principle—easy to test, debug, and extend
- **Browser compatibility**: Supported in Chrome 90+, Firefox 88+, Safari 14.1+ (per performance requirements)

### Alternatives Considered

1. **Tone.js library** (wrapper around Web Audio API)
   - **Rejected**: Adds 400KB+ bundle size, abstracts away low-level control needed for custom Lofi synthesis
   - **Why not chosen**: Constitution principle V (Simplicity) prioritizes minimal dependencies; raw Web Audio API provides sufficient control

2. **Pre-recorded audio samples** (Howler.js + MP3/WAV files)
   - **Rejected**: Violates FR-004 requirement (Web Audio API only), limits adaptive capabilities
   - **Why not chosen**: Sample playback can't adapt to rhythm in real-time with <200ms latency

3. **WebAssembly audio DSP** (e.g., compiled C++ audio engine)
   - **Rejected**: Over-engineered for MVP, adds complexity and build tooling
   - **Why not chosen**: Constitution principle V (YAGNI)—Web Audio API meets all performance goals without WASM

### Implementation Notes

**Oscillator Setup** (calm mood example):
```typescript
// Create ambient base layer (Lofi backing texture)
const context = new AudioContext();
const oscillator1 = context.createOscillator();
oscillator1.type = 'sine';
oscillator1.frequency.setValueAtTime(110, context.currentTime); // A2 note

const oscillator2 = context.createOscillator();
oscillator2.type = 'triangle';
oscillator2.frequency.setValueAtTime(220, context.currentTime); // A3 note
oscillator2.detune.setValueAtTime(3, context.currentTime); // Slight detuning for warmth

// Lofi warmth filter
const filter = context.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.setValueAtTime(3000, context.currentTime); // Warm, muffled texture
filter.Q.setValueAtTime(1.5, context.currentTime); // Gentle resonance

// Master gain control
const gainNode = context.createGain();
gainNode.gain.setValueAtTime(0.5, context.currentTime); // 50% volume

// Connect nodes: oscillators → filter → gain → output
oscillator1.connect(filter);
oscillator2.connect(filter);
filter.connect(gainNode);
gainNode.connect(context.destination);
```

**Keystroke Instrument Sound** (piano note):
```typescript
function playPianoNote(frequency: number, velocity: number) {
  const context = new AudioContext();
  const osc = context.createOscillator();
  osc.type = 'triangle'; // Piano-like timbre
  osc.frequency.setValueAtTime(frequency, context.currentTime);
  
  const gain = context.createGain();
  // ADSR envelope
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(velocity * 0.8, context.currentTime + 0.1); // Attack
  gain.gain.exponentialRampToValueAtTime(velocity * 0.5, context.currentTime + 0.3); // Decay
  gain.gain.setValueAtTime(velocity * 0.5, context.currentTime + 0.8); // Sustain
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.1); // Release
  
  osc.connect(gain);
  gain.connect(context.destination);
  
  osc.start(context.currentTime);
  osc.stop(context.currentTime + 1.1);
}
```

### References

- [Web Audio API Specification (W3C)](https://www.w3.org/TR/webaudio/)
- [MDN Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Audio Synthesis in the Browser (Google Developers)](https://developers.google.com/web/updates/2017/12/audio-worklet)
- [Creating Lofi Music Programmatically](https://css-tricks.com/making-audio-plugins-with-the-web-audio-api/)

---

## 2. Canvas Waveform Visualization (60fps)

### Decision

Use **Canvas 2D API with requestAnimationFrame**:
- **Data source**: AnalyserNode from Web Audio API (time domain data, 2048 FFT size)
- **Drawing technique**: `clearRect()` + `lineTo()` path drawing for waveform, gradient fills for pulse effect
- **Performance optimization**: 
  - Throttle drawing to `requestAnimationFrame` (native 60fps cap)
  - Use `Uint8Array` buffer from AnalyserNode (no allocations per frame)
  - Offscreen Canvas for background elements (reduce redraws)
- **Sync mechanism**: Read AnalyserNode data immediately before drawing (guarantees <16ms audio-visual lag at 60fps)

### Rationale

- **Performance**: Canvas 2D API is GPU-accelerated in modern browsers, easily achieves 60fps for waveform rendering
- **Simplicity**: Straightforward imperative drawing API, no shader programming needed
- **Accessibility**: Respects `prefers-reduced-motion` by reducing animation intensity (no flashing, slower easing)
- **Audio sync**: AnalyserNode provides real-time audio buffer data with <1ms latency from audio thread

### Alternatives Considered

1. **WebGL / Three.js** (3D graphics for advanced visualizations)
   - **Rejected**: Overkill for 2D waveform, adds 500KB+ bundle size (Three.js)
   - **Why not chosen**: Constitution principle V (YAGNI)—Canvas 2D meets 60fps goal without WebGL complexity

2. **SVG animation** (declarative path animation)
   - **Rejected**: SVG DOM updates are slower than Canvas for high-frequency waveform changes (60fps challenging)
   - **Why not chosen**: Performance requirement SC-002 (50ms latency) hard to guarantee with SVG reflows

3. **Wavesurfer.js library** (pre-built waveform visualizer)
   - **Rejected**: Designed for static audio files, not real-time synthesis; heavy dependency (200KB+)
   - **Why not chosen**: Constitution principle V (Simplicity)—custom Canvas solution is 50 LOC, no external dependency

### Implementation Notes

**Waveform Drawing Loop**:
```typescript
// Setup
const canvas = document.getElementById('waveform') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048; // Higher resolution for smooth waveform
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Connect audio graph: source → analyser → destination
audioSource.connect(analyser);
analyser.connect(audioContext.destination);

function draw() {
  requestAnimationFrame(draw); // Native 60fps throttling
  
  analyser.getByteTimeDomainData(dataArray); // Read current waveform data
  
  // Clear previous frame
  ctx.fillStyle = 'rgb(15, 23, 42)'; // slate-900 background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw waveform
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(59, 130, 246)'; // blue-500 accent
  ctx.beginPath();
  
  const sliceWidth = canvas.width / bufferLength;
  let x = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0; // Normalize to 0-2 range
    const y = (v * canvas.height) / 2;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    x += sliceWidth;
  }
  
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

draw(); // Start animation loop
```

**Accessibility Support**:
```typescript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Simplify animation: slower easing, no rapid flashing
  ctx.lineWidth = 3; // Thicker, more visible lines
  // Skip intermediate frames (draw every 2nd frame for 30fps)
  frameCounter++;
  if (frameCounter % 2 !== 0) return;
}
```

### References

- [Canvas API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [AnalyserNode (Web Audio API)](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- [requestAnimationFrame Optimization](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Visualizing Audio with Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)

---

## 3. WebSocket Architecture for Low-Latency Audio Apps

### Decision

Use **ws library (WebSocket server) with JSON message protocol**:
- **Library**: `ws@8.16+` (lightweight, low-level WebSocket server for Node.js)
- **Message format**: JSON for readability and debugging (binary not needed for rhythm data volume)
- **Protocol**:
  ```json
  // Client → Server (rhythm event)
  {
    "type": "rhythm",
    "sessionId": "uuid",
    "timestamp": "ISO8601",
    "keystroke": { "velocity": 0.8 },
    "click": null
  }
  
  // Server → Client (real-time metrics)
  {
    "type": "metrics",
    "currentBPM": 85.2,
    "rollingAvgBPM": 82.5,
    "tempoTrend": "increasing",
    "activityLevel": "medium"
  }
  ```
- **Connection management**:
  - Heartbeat/ping-pong every 30 seconds (detect stale connections)
  - Auto-reconnect on client with exponential backoff (1s, 2s, 4s, 8s max)
  - Graceful degradation if WebSocket unavailable (HTTP polling fallback)

### Rationale

- **Performance**: `ws` library is fastest Node.js WebSocket implementation (<5ms message overhead)
- **Simplicity**: JSON messages are human-readable, easy to debug with browser DevTools
- **Reliability**: Heartbeat/ping-pong prevents zombie connections, auto-reconnect handles network issues
- **Latency**: WebSocket achieves <50ms round-trip latency (vs. HTTP polling ~500ms), meeting SC-002 requirement

### Alternatives Considered

1. **Socket.IO library** (higher-level WebSocket abstraction with fallbacks)
   - **Rejected**: Adds 200KB+ client bundle, auto-fallback to long-polling not needed for modern browsers
   - **Why not chosen**: Constitution principle V (Simplicity)—`ws` is sufficient, no need for Socket.IO abstraction layer

2. **Server-Sent Events (SSE)** (unidirectional server → client push)
   - **Rejected**: Unidirectional only (can't send rhythm events client → server without separate HTTP POST)
   - **Why not chosen**: Requires dual transport (SSE + HTTP), more complex than single WebSocket connection

3. **Binary WebSocket messages** (MessagePack or Protocol Buffers)
   - **Rejected**: Overkill for rhythm data (~100 bytes/message), JSON parsing negligible overhead
   - **Why not chosen**: Constitution principle V (YAGNI)—JSON readability aids debugging, binary not needed

### Implementation Notes

**Server-Side WebSocket Setup** (`backend/src/websocket/rhythmSocket.ts`):
```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export function setupRhythmWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/rhythm' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('Client connected:', req.socket.remoteAddress);
    
    // Heartbeat setup
    let isAlive = true;
    ws.on('pong', () => { isAlive = true; });
    
    const heartbeat = setInterval(() => {
      if (!isAlive) {
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, 30000); // 30s heartbeat
    
    // Handle rhythm events
    ws.on('message', (data: string) => {
      try {
        const event = JSON.parse(data);
        if (event.type === 'rhythm') {
          // Process rhythm data, calculate BPM
          const metrics = calculateMetrics(event);
          ws.send(JSON.stringify({ type: 'metrics', ...metrics }));
        }
      } catch (err) {
        console.error('Invalid WebSocket message:', err);
      }
    });
    
    ws.on('close', () => {
      clearInterval(heartbeat);
      console.log('Client disconnected');
    });
  });
}
```

**Client-Side WebSocket Hook** (`src/hooks/useWebSocket.ts`):
```typescript
import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [metrics, setMetrics] = useState({ currentBPM: 0, rollingAvgBPM: 0 });
  const reconnectTimeout = useRef(1000); // Exponential backoff
  
  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectTimeout.current = 1000; // Reset backoff
      };
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'metrics') {
          setMetrics(data);
        }
      };
      
      ws.current.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connect, reconnectTimeout.current);
        reconnectTimeout.current = Math.min(reconnectTimeout.current * 2, 8000); // Max 8s
      };
    }
    
    connect();
    
    return () => {
      ws.current?.close();
    };
  }, [url]);
  
  const sendRhythmEvent = (event: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'rhythm', ...event }));
    }
  };
  
  return { metrics, sendRhythmEvent };
}
```

### References

- [ws library documentation](https://github.com/websockets/ws)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [WebSocket Best Practices](https://www.ably.com/topic/websockets-best-practices)
- [Heartbeat Pattern for WebSockets](https://stackoverflow.com/questions/10585355/sending-websocket-ping-pong-frame-from-browser)

---

## 4. Gemini API Prompt Engineering for Music Insights

### Decision

Use **gemini-1.5-flash model with few-shot prompting**:
- **Model**: `gemini-1.5-flash` (fast, cost-effective, sufficient for text generation)
- **Prompt template**:
  ```
  You are a focus productivity coach analyzing typing rhythm patterns. Based on the session data below, suggest a mood for the next focus session and explain why.
  
  Session Data:
  - Duration: {duration} minutes
  - Average Typing Speed: {avgTempo} keystrokes/min
  - Rhythm Pattern: {steady/erratic}
  
  Examples:
  Input: 20 min, 100 keys/min, steady
  Output: {"mood": "energy", "rationale": "Your consistent high-speed rhythm indicates strong focus momentum. Energy mode will maintain this flow state."}
  
  Input: 15 min, 40 keys/min, erratic
  Output: {"mood": "calm", "rationale": "Your slower, thoughtful rhythm suggests deep contemplation. Calm mode will support sustained concentration."}
  
  Now analyze this session:
  {userSessionData}
  
  Respond ONLY with valid JSON: {"mood": "calm|focus|energy", "rationale": "string"}
  ```
- **Response format**: Structured JSON output (mood + rationale)
- **Error handling**: Fallback to generic tips if API fails or returns invalid JSON

### Rationale

- **Performance**: gemini-1.5-flash <2s response time (vs. gemini-1.5-pro ~5s), meets SC-007 requirement
- **Cost**: Flash model is 10x cheaper than Pro ($0.075/1M tokens vs. $0.75/1M)
- **Accuracy**: Few-shot examples guide model to generate consistent, relevant mood suggestions
- **Structured output**: JSON format ensures parseable responses, reduces hallucination risk

### Alternatives Considered

1. **gemini-1.5-pro model** (higher reasoning capability)
   - **Rejected**: Slower response time (~5s), higher cost, unnecessary for simple mood classification
   - **Why not chosen**: Flash model sufficient for task, Pro overkill per Constitution principle V (Simplicity)

2. **Rule-based heuristics** (no AI, just if/else logic)
   - **Rejected**: Less personalized, can't capture nuanced rhythm patterns
   - **Why not chosen**: Constitution principle II (AI-Augmented Creativity)—AI adds measurable value over rules

3. **Fine-tuned custom model** (train on user session data)
   - **Rejected**: Over-engineered for MVP, requires training data collection infrastructure
   - **Why not chosen**: Constitution principle V (YAGNI)—zero-shot Gemini sufficient for initial insights

### Implementation Notes

**Gemini Service** (`backend/src/services/geminiService.ts`):
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateMoodInsight(sessionData: {
  duration: number;
  avgTempo: number;
  rhythmPattern: 'steady' | 'erratic';
}): Promise<{ mood: string; rationale: string }> {
  const prompt = `You are a focus productivity coach analyzing typing rhythm patterns...
  
  Session Data:
  - Duration: ${sessionData.duration} minutes
  - Average Typing Speed: ${sessionData.avgTempo} keystrokes/min
  - Rhythm Pattern: ${sessionData.rhythmPattern}
  
  [Few-shot examples as shown above]
  
  Respond ONLY with valid JSON: {"mood": "calm|focus|energy", "rationale": "string"}`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response (Gemini sometimes adds markdown formatting)
    const jsonMatch = response.match(/\{[^}]+\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    
    const insight = JSON.parse(jsonMatch[0]);
    
    // Log prompt/response for transparency (Constitution principle II)
    console.log({ prompt, response: insight, timestamp: new Date().toISOString() });
    
    return insight;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Graceful fallback (Constitution principle II: fail-safe)
    return {
      mood: 'focus',
      rationale: 'AI insights temporarily unavailable. Try focus mode for balanced concentration.'
    };
  }
}
```

### References

- [Gemini API Documentation](https://ai.google.dev/docs)
- [@google/generative-ai npm package](https://www.npmjs.com/package/@google/generative-ai)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Few-Shot Prompting Techniques](https://learnprompting.org/docs/basics/few_shot)

---

## 5. Auth0 React + Express Integration Patterns

### Decision

Use **@auth0/auth0-react (frontend) + express-oauth2-jwt-bearer (backend)**:
- **Frontend**: `@auth0/auth0-react@2.2.4+` with OAuth2 PKCE flow (no client secret, secure for SPAs)
- **Backend**: `express-oauth2-jwt-bearer@1.6+` for JWT verification middleware
- **Token storage**: In-memory (Auth0Provider context), no localStorage (XSS risk)
- **Token refresh**: Automatic silent renewal via Auth0 SDK (refresh token in httpOnly cookie)
- **Configuration**:
  ```typescript
  // Frontend: src/lib/auth0.ts
  export const auth0Config = {
    domain: process.env.VITE_AUTH0_DOMAIN!,
    clientId: process.env.VITE_AUTH0_CLIENT_ID!,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: process.env.VITE_AUTH0_AUDIENCE!,
      scope: 'openid profile email offline_access' // offline_access for refresh token
    }
  };
  
  // Backend: backend/src/middleware/auth.ts
  import { auth } from 'express-oauth2-jwt-bearer';
  
  export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE!,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256'
  });
  ```

### Rationale

- **Security**: PKCE flow (Proof Key for Code Exchange) prevents authorization code interception, no client secret exposure
- **UX**: Silent token renewal provides seamless experience (no re-authentication prompts)
- **Simplicity**: Auth0 SDK handles OAuth2 complexity (token exchange, refresh, validation)
- **Ecosystem fit**: express-oauth2-jwt-bearer designed for Express, validates JWT RS256 signatures automatically

### Alternatives Considered

1. **Passport.js + passport-auth0** (traditional session-based auth)
   - **Rejected**: Session cookies require server-side storage (Redis), more complex than stateless JWT
   - **Why not chosen**: JWT approach aligns with Constitution principle V (Simplicity)—stateless backend

2. **jsonwebtoken library** (manual JWT verification)
   - **Rejected**: Requires manual JWKS (JSON Web Key Set) fetching, key rotation handling, signature verification
   - **Why not chosen**: express-oauth2-jwt-bearer automates JWKS management, less error-prone

3. **Custom JWT implementation** (roll own auth)
   - **Rejected**: Security anti-pattern, high risk of vulnerabilities
   - **Why not chosen**: Constitution principle V (Simplicity)—leverage Auth0's battle-tested OAuth2 implementation

### Implementation Notes

**Frontend Auth Setup** (`src/main.tsx`):
```typescript
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from './lib/auth0';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Auth0Provider {...auth0Config}>
    <App />
  </Auth0Provider>
);
```

**Protected API Route** (`backend/src/routes/sessions.ts`):
```typescript
import { Router } from 'express';
import { jwtCheck } from '../middleware/auth';

const router = Router();

// All session routes require authentication
router.use(jwtCheck);

router.post('/api/sessions', async (req, res) => {
  const userId = req.auth?.sub; // Auth0 user ID from JWT
  // Create session logic...
});

export default router;
```

**Frontend Protected Component** (`src/components/ControlPanel.tsx`):
```typescript
import { useAuth0 } from '@auth0/auth0-react';

export function ControlPanel() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  
  const startSession = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect();
      return;
    }
    
    const token = await getAccessTokenSilently();
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  };
  
  return <button onClick={startSession}>Start Session</button>;
}
```

### References

- [Auth0 React SDK Quickstart](https://auth0.com/docs/quickstart/spa/react)
- [express-oauth2-jwt-bearer documentation](https://github.com/auth0/node-oauth2-jwt-bearer)
- [OAuth2 PKCE Flow Explained](https://auth0.com/docs/authorization/flows/authorization-code-flow-with-proof-key-for-code-exchange-pkce)
- [Protecting Routes in React with Auth0](https://auth0.com/blog/complete-guide-to-react-user-authentication/)

---

## 6. MongoDB Session Schema Design for Privacy

### Decision

Use **Mongoose schemas with built-in anonymization and TTL indexes**:
- **User ID hashing**: SHA-256 hash of Auth0 user ID (one-way, irreversible)
- **TTL index**: Auto-delete sessions after 90 days (`createdAt` + 90 days)
- **Validation**: Mongoose schema validators enforce data constraints (no negative durations, valid enums)
- **Schema example** (`backend/src/models/FocusSession.ts`):
  ```typescript
  import { Schema, model } from 'mongoose';
  import crypto from 'crypto';
  
  const focusSessionSchema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { 
      type: String, 
      required: true,
      set: (v: string) => crypto.createHash('sha256').update(v).digest('hex') // Auto-hash
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, min: 0 }, // Seconds, must be >= 0
    totalKeystrokes: { type: Number, min: 0, default: 0 },
    totalClicks: { type: Number, min: 0, default: 0 },
    averageTempo: { type: Number, min: 0 }, // Keys/min
    selectedMood: { type: String, enum: ['calm', 'focus', 'energy'], required: true },
    selectedInstruments: [{ type: String, enum: ['grandPiano', 'electricPiano', 'violin', 'bass'] }],
    aiInsight: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 7776000 } // TTL: 90 days in seconds
  });
  
  export const FocusSession = model('FocusSession', focusSessionSchema);
  ```

### Rationale

- **Privacy**: SHA-256 hashing makes userId irreversible, prevents PII leakage even if database compromised
- **Compliance**: TTL index automates 90-day data retention per Constitution principle III (Data-Respectful Architecture)
- **Data integrity**: Mongoose validators prevent invalid data (negative durations, invalid moods)
- **Simplicity**: Mongoose schema = single source of truth for validation + database structure

### Alternatives Considered

1. **bcrypt for user ID hashing** (password-grade hashing)
   - **Rejected**: Overkill for non-password data, slower than SHA-256 (100ms+ vs. <1ms)
   - **Why not chosen**: SHA-256 sufficient for anonymization, bcrypt designed for password storage (salted, intentionally slow)

2. **Manual TTL deletion with cron job** (scheduled cleanup script)
   - **Rejected**: Requires additional infrastructure, error-prone (missed executions), less reliable than MongoDB TTL
   - **Why not chosen**: MongoDB TTL index is built-in, automatic, guaranteed execution

3. **No hashing (store raw Auth0 user IDs)** (rely on MongoDB access control only)
   - **Rejected**: Violates Constitution principle III (Data-Respectful Architecture—anonymization required)
   - **Why not chosen**: Defense-in-depth principle—hash even internal identifiers to minimize PII exposure

### Implementation Notes

**Schema with Indexes** (`backend/src/models/FocusSession.ts`):
```typescript
// Index for fast user session queries
focusSessionSchema.index({ userId: 1, createdAt: -1 });

// TTL index (MongoDB automatically deletes documents after 90 days)
focusSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

**User Preferences Schema** (`backend/src/models/UserPreferences.ts`):
```typescript
import { Schema, model } from 'mongoose';

const userPreferencesSchema = new Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    set: (v: string) => crypto.createHash('sha256').update(v).digest('hex')
  },
  defaultMood: { type: String, enum: ['calm', 'focus', 'energy'], default: 'focus' },
  defaultInstruments: [{ type: String, enum: ['grandPiano', 'electricPiano', 'violin', 'bass'] }],
  masterVolume: { type: Number, min: 0, max: 100, default: 50 },
  accessibilityModeEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt on save
userPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const UserPreferences = model('UserPreferences', userPreferencesSchema);
```

### References

- [Mongoose Schema Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/)
- [Node.js Crypto Module (SHA-256)](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options)
- [Mongoose Validation](https://mongoosejs.com/docs/validation.html)

---

## 7. Express Rate Limiting and Security Middleware

### Decision

Use **express-rate-limit with in-memory store**:
- **Rate limit configuration**:
  - General API: 100 requests / 15 minutes per IP (Constitution requirement)
  - AI insights endpoint: 10 requests / hour per user (prevent Gemini API quota exhaustion)
  - WebSocket connections: 5 connections / minute per IP (prevent DoS)
- **Middleware stack**:
  ```typescript
  import rateLimit from 'express-rate-limit';
  import helmet from 'helmet'; // Security headers
  import cors from 'cors'; // CORS policy
  
  // General API rate limiter
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per window
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false
  });
  
  // AI insights rate limiter (stricter)
  const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'AI insight quota exceeded, please try again in an hour.'
  });
  
  app.use('/api', apiLimiter);
  app.use('/api/ai/insights', aiLimiter);
  ```
- **Additional security**: Helmet.js for security headers (HSTS, CSP, X-Frame-Options)

### Rationale

- **Abuse prevention**: Rate limiting prevents API exhaustion attacks, protects backend resources
- **Cost control**: Stricter AI limiter prevents Gemini API quota overruns (60 req/min free tier)
- **User experience**: 100 req/15min allows normal usage patterns (session creation, stats fetching) without disruption
- **Simplicity**: In-memory store sufficient for single-server MVP, no Redis dependency needed

### Alternatives Considered

1. **Redis-backed rate limiter** (distributed rate limiting)
   - **Rejected**: Over-engineered for MVP (single-server deployment), adds Redis dependency + infrastructure cost
   - **Why not chosen**: Constitution principle V (YAGNI)—in-memory sufficient until horizontal scaling needed

2. **nginx rate limiting** (proxy-level rate limiting)
   - **Rejected**: Requires nginx configuration, less flexible than application-level limiting (can't vary by endpoint)
   - **Why not chosen**: Express middleware provides finer control (different limits per route, user-based limits)

3. **No rate limiting** (rely on cloud provider DDoS protection)
   - **Rejected**: Doesn't protect against application-layer abuse (e.g., user spamming AI insights endpoint)
   - **Why not chosen**: Constitution security standards require explicit rate limiting

### Implementation Notes

**Security Middleware Setup** (`backend/src/server.ts`):
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Security headers
app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true }, // HTTPS enforcement
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for React
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// CORS policy
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.auth?.sub || req.ip, // Limit per user, not IP
  message: 'AI insight quota exceeded, please try again in an hour.'
});

app.use('/api', apiLimiter);
app.use('/api/ai/insights', aiLimiter);

// Body parser
app.use(express.json());

// Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/ai/insights', aiInsightsRouter);
```

**Custom Rate Limit Error Handler**:
```typescript
app.use((err, req, res, next) => {
  if (err.status === 429) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: err.headers['Retry-After'],
      message: err.message
    });
  } else {
    next(err);
  }
});
```

### References

- [express-rate-limit documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet.js Security Headers](https://helmetjs.github.io/)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DDoS_Prevention_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Research Summary

All 7 technology research tasks completed. Key decisions:

1. ✅ **Web Audio API**: Modular synthesis (OscillatorNode + BiquadFilterNode), mood-specific BPM mappings
2. ✅ **Canvas Visualization**: 2D API + requestAnimationFrame, AnalyserNode integration for <50ms sync
3. ✅ **WebSocket**: `ws` library with JSON protocol, heartbeat/reconnection patterns
4. ✅ **Gemini API**: gemini-1.5-flash with few-shot prompting, structured JSON output
5. ✅ **Auth0**: OAuth2 PKCE (frontend: @auth0/auth0-react, backend: express-oauth2-jwt-bearer)
6. ✅ **MongoDB**: Mongoose schemas with SHA-256 hashing + TTL indexes (90-day auto-delete)
7. ✅ **Security**: express-rate-limit (100 req/15min general, 10 req/hour AI), Helmet.js security headers

**Next Phase**: Generate data model, API contracts, and quickstart guide (Phase 1).
