# Quickstart: Adaptive Focus Music Engine Development

**Feature**: 001-adaptive-focus-music  
**Target Setup Time**: <1 hour  
**Date**: 2025-10-18

This guide helps developers set up the PulsePlay Adaptive Focus Music Engine for local development in under 1 hour.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ and **npm** 9+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account (free tier) **OR** local MongoDB 7+ ([Sign up](https://www.mongodb.com/cloud/atlas/register))
- **Auth0** account (free tier) ([Sign up](https://auth0.com/signup))
- **Gemini API key** from Google AI Studio ([Get key](https://aistudio.google.com/app/apikey))
- **Git** installed ([Download](https://git-scm.com/downloads))

---

## Setup Steps

### 1. Clone Repository and Checkout Feature Branch

```bash
# Clone repository
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay

# Checkout feature branch
git checkout 001-adaptive-focus-music

# Install frontend dependencies
npm install

# Create and install backend dependencies
mkdir -p backend
cd backend
npm init -y
npm install express mongoose ws @google/generative-ai pino express-rate-limit helmet cors express-oauth2-jwt-bearer
npm install --save-dev typescript @types/node @types/express @types/ws ts-node nodemon
cd ..
```

**Estimated time**: 5-10 minutes

---

### 2. Environment Configuration

Create `.env` file in project root:

```bash
cp .env.example .env
```

Fill in the following variables in `.env`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=https://api.pulseplay.ai

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Backend Server
PORT=3000
NODE_ENV=development

# Frontend (Vite)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/rhythm
```

**How to get these values**:

#### MongoDB Atlas Setup (5 minutes)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free cluster (M0 Sandbox)
3. Create database user (Database Access → Add New Database User)
4. Whitelist IP address (Network Access → Add IP Address → Allow Access from Anywhere for dev)
5. Get connection string (Clusters → Connect → Connect your application)

#### Auth0 Setup (10 minutes)
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create new application (Applications → Create Application → Single Page Web Application)
3. Configure settings:
   - **Allowed Callback URLs**: `http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`
4. Create API (APIs → Create API):
   - **Name**: PulsePlay API
   - **Identifier**: `https://api.pulseplay.ai` (use as `AUTH0_AUDIENCE`)
5. Copy **Domain** and **Client ID** to `.env`

#### Gemini API Key (2 minutes)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API key"
3. Create new key or use existing
4. Copy key to `.env` as `GEMINI_API_KEY`

**Estimated time**: 15-20 minutes

---

### 3. Backend Setup

Create backend entry point (`backend/src/server.ts`):

```typescript
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { setupRhythmWebSocket } from './websocket/rhythmSocket';

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// WebSocket setup
setupRhythmWebSocket(server);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Add scripts to `backend/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

**Estimated time**: 10 minutes

---

### 4. Start Development Servers

Open **two terminal windows**:

#### Terminal 1: Frontend (Vite)
```bash
npm run dev
```

✅ Frontend available at: **http://localhost:5173**

#### Terminal 2: Backend (Express + WebSocket)
```bash
cd backend
npm run dev
```

✅ Backend API at: **http://localhost:3000/api**  
✅ WebSocket at: **ws://localhost:3000/rhythm**

**Estimated time**: 2 minutes

---

### 5. Verify Setup

#### Test Backend API
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}
```

#### Test Frontend
1. Open http://localhost:5173 in browser
2. Should see PulsePlay interface
3. Click "Login" (redirects to Auth0)
4. After login, should see "Start Session" button

#### Test WebSocket (optional)
Install `wscat` for WebSocket testing:
```bash
npm install -g wscat
wscat -c ws://localhost:3000/rhythm
```

Send test message:
```json
{"type":"rhythm","sessionId":"test-123","timestamp":"2025-10-18T14:30:00Z","keystroke":{"velocity":0.8}}
```

**Estimated time**: 5 minutes

---

### 6. Run Tests

#### Frontend Unit Tests (Vitest)
```bash
npm run test
```

#### Backend Unit Tests (Jest)
```bash
cd backend
npm test
```

#### E2E Tests (Playwright)
```bash
npm run test:e2e
```

**Estimated time**: 5-10 minutes

---

## Project Structure Overview

```
pulseplay/
├── src/                          # Frontend (React + Vite)
│   ├── components/               # UI components
│   │   ├── AuthButton.tsx        # Auth0 login/logout
│   │   ├── ControlPanel.tsx      # Session controls, volume, instruments
│   │   ├── RhythmVisualizer.tsx  # Canvas waveform visualization
│   │   ├── SessionStats.tsx      # Real-time session metrics
│   │   └── SongInsights.tsx      # Gemini AI song insights display
│   ├── hooks/                    # React hooks
│   │   ├── useAudioEngine.ts     # Web Audio API synthesis
│   │   ├── useRhythmDetection.ts # Keyboard/mouse event listeners
│   │   ├── useSessionPersistence.ts  # MongoDB session CRUD
│   │   ├── useAuth0.ts           # Auth0 authentication
│   │   └── useWebSocket.ts       # Real-time rhythm WebSocket
│   ├── services/                 # Business logic
│   │   ├── audioSynthesis.ts     # Web Audio node creation
│   │   ├── rhythmAnalysis.ts     # BPM calculation
│   │   └── apiClient.ts          # REST API client (Axios)
│   ├── lib/                      # Configuration
│   │   ├── auth0.ts              # Auth0 React SDK config
│   │   └── constants.ts          # Mood BPM ranges, instrument frequencies
│   └── types/                    # TypeScript types
│       ├── session.types.ts      # FocusSession, RhythmMetrics
│       ├── audio.types.ts        # AudioNode, Instrument
│       └── api.types.ts          # API request/response
│
├── backend/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── server.ts             # Express app entry point
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── FocusSession.ts
│   │   │   ├── UserPreferences.ts
│   │   │   └── AIMoodRecommendation.ts
│   │   ├── routes/               # REST API routes
│   │   │   ├── sessions.ts       # POST/GET/PUT/DELETE /api/sessions
│   │   │   ├── preferences.ts    # GET/PUT /api/preferences
│   │   │   └── ai-insights.ts    # POST /api/ai/insights
│   │   ├── services/             # Business logic
│   │   │   ├── geminiService.ts  # Gemini API client
│   │   │   ├── sessionService.ts # Session CRUD logic
│   │   │   └── rhythmService.ts  # Rhythm calculation
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts           # Auth0 JWT verification
│   │   │   ├── rateLimiter.ts    # Rate limiting
│   │   │   ├── errorHandler.ts   # Global error handling
│   │   │   └── logger.ts         # Pino structured logging
│   │   ├── websocket/            # WebSocket server
│   │   │   └── rhythmSocket.ts   # Real-time rhythm data
│   │   └── config/               # Configuration
│   │       ├── database.ts       # MongoDB connection
│   │       ├── auth0.ts          # Auth0 config
│   │       └── gemini.ts         # Gemini API config
│   └── tests/                    # Backend tests
│
├── specs/001-adaptive-focus-music/  # Feature documentation
│   ├── spec.md                   # Feature specification
│   ├── plan.md                   # Implementation plan
│   ├── research.md               # Technology research
│   ├── data-model.md             # Database schemas
│   ├── quickstart.md             # This file
│   └── contracts/                # API contracts (OpenAPI)
│
├── .env                          # Environment variables (gitignored)
├── package.json                  # Frontend dependencies
└── vite.config.ts                # Vite configuration
```

---

## Key Files to Explore

### Audio Synthesis
- **`src/hooks/useAudioEngine.ts`**: Web Audio API synthesis (ambient + instruments)
- **`src/services/audioSynthesis.ts`**: OscillatorNode, BiquadFilterNode setup

### Rhythm Detection
- **`src/hooks/useRhythmDetection.ts`**: Keyboard/mouse event listeners, BPM calculation
- **`src/services/rhythmAnalysis.ts`**: Tempo calculation, velocity tracking

### Visualization
- **`src/components/RhythmVisualizer.tsx`**: Canvas waveform rendering (requestAnimationFrame)

### AI Integration
- **`backend/src/services/geminiService.ts`**: Gemini API prompts, mood recommendations
- **`src/components/SongInsights.tsx`**: Display AI song insights

### Real-Time Communication
- **`backend/src/websocket/rhythmSocket.ts`**: WebSocket server for rhythm data
- **`src/hooks/useWebSocket.ts`**: WebSocket client hook

---

## Troubleshooting

### Frontend won't start
- **Issue**: `npm run dev` fails
- **Solution**: Run `npm install` again, check Node.js version (need 18+)

### Backend crashes on start
- **Issue**: MongoDB connection error
- **Solution**: Check `MONGODB_URI` in `.env`, ensure IP whitelisted in MongoDB Atlas

### Auth0 login redirects to error page
- **Issue**: Invalid configuration
- **Solution**: Verify `Allowed Callback URLs` in Auth0 dashboard matches `http://localhost:5173`

### WebSocket connection fails
- **Issue**: `ws://localhost:3000/rhythm` not accessible
- **Solution**: Ensure backend server running, check firewall/antivirus blocking WebSocket

### Gemini API errors (503)
- **Issue**: AI insights unavailable
- **Solution**: Check `GEMINI_API_KEY` in `.env`, verify API quota not exceeded (60 req/min free tier)

---

## Next Steps

1. ✅ Setup complete! You're ready to develop.
2. Read **Constitution**: `.specify/memory/constitution.md` (understand 5 core principles)
3. Read **Feature Spec**: `specs/001-adaptive-focus-music/spec.md` (6 user stories, 20 requirements)
4. Read **Data Model**: `specs/001-adaptive-focus-music/data-model.md` (MongoDB schemas)
5. Read **API Contracts**: `specs/001-adaptive-focus-music/contracts/` (OpenAPI specs)
6. Start coding! Follow `specs/001-adaptive-focus-music/tasks.md` (coming from `/speckit.tasks` command)

---

## Development Tips

- **Hot reload**: Frontend (Vite) and backend (nodemon) auto-reload on file changes
- **Logging**: Backend uses Pino structured logging (`console.log` outputs JSON)
- **Testing**: Run tests frequently during development (`npm run test`)
- **Browser DevTools**: Use Network tab to inspect WebSocket messages, Console for audio debugging
- **Audio debugging**: Check Web Audio API nodes in Chrome DevTools → `chrome://media-internals`

---

## Resources

- [Web Audio API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Auth0 React Quickstart](https://auth0.com/docs/quickstart/spa/react)
- [Mongoose Docs](https://mongoosejs.com/docs/guide.html)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Total Setup Time**: 40-60 minutes ✅

**Questions?** Open an issue on GitHub or check `CONTRIBUTING.md` for support channels.
