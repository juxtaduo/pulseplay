# PulsePlay AI - Quick Start Guide

## Phase 2 Complete ✅

All foundational infrastructure is in place. You can now start implementing User Story 1.

## Project Structure

```
pulseplay-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── auth0.ts     # Auth0 JWT middleware
│   │   │   ├── database.ts  # MongoDB connection
│   │   │   └── logger.ts    # Pino structured logging
│   │   ├── middleware/      # Express middleware
│   │   │   ├── errorHandler.ts  # Centralized error handling
│   │   │   └── rateLimiter.ts   # Rate limiting
│   │   ├── models/          # Mongoose models
│   │   │   ├── FocusSession.ts
│   │   │   ├── UserPreferences.ts
│   │   │   ├── MoodInsight.ts
│   │   │   └── WeeklySummary.ts
│   │   ├── routes/          # API routes (TODO)
│   │   ├── services/        # Business logic
│   │   │   └── geminiService.ts
│   │   ├── types/           # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/           # Utilities
│   │   │   └── crypto.ts    # SHA-256 hashing
│   │   ├── websocket/       # WebSocket server
│   │   │   └── server.ts
│   │   └── server.ts        # Express entry point
│   ├── tsconfig.json
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Auth0ProviderWrapper.tsx
│   │   ├── AuthButton.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── MoodInsights.tsx
│   │   ├── RhythmVisualizer.tsx
│   │   └── SessionStats.tsx
│   ├── lib/
│   │   ├── audioContext.ts  # Web Audio API wrapper
│   │   └── supabase.ts      # (Legacy - to be removed)
│   └── hooks/
│       ├── useAudioEngine.ts
│       ├── useRhythmDetection.ts
│       └── useSessionPersistence.ts
├── biome.json               # Biome.js configuration
├── .env.example             # Environment variables template
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure Environment Variables

Create `.env` in project root:

```bash
# Backend environment variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay?retryWrites=true&w=majority
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional: Context7 MCP for documentation lookup
CONTEXT7_API_KEY=ctx7sk_your_api_key_here
```

Create `.env` in project root for frontend variables:

```bash
# Frontend environment variables
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
```

### 3. Configure Context7 MCP (Optional but Recommended)

Context7 MCP provides up-to-date documentation for dependencies. See [Context7 Setup Guide](./docs/CONTEXT7_SETUP.md) for detailed instructions.

**Quick setup**: Add to VS Code User Settings (JSON):
```json
{
  "mcp.servers": {
    "upstash_conte": {
      "env": {
        "CONTEXT7_API_KEY": "ctx7sk_your_api_key_here"
      }
    }
  }
}
```

### 4. Start Development Servers

**Option A: Run both servers together**
```bash
npm run dev:all
```

**Option B: Run separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:backend
```

### 4. Verify Setup

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/health

## Development Commands

```bash
# Frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Run Biome.js linting
npm run lint:fix         # Fix linting issues

# Backend
npm run dev:backend      # Start backend with nodemon
npm run build:backend    # Build backend TypeScript

# Both
npm run dev:all          # Start both servers
```

## Tech Stack

### Backend
- Node.js 18+ with ES2022 modules
- Express 5.1.0+ (TypeScript)
- MongoDB Atlas 7+ with Mongoose 8.19+
- Auth0 OAuth2 JWT validation
- Gemini API (gemini-1.5-flash)
- WebSocket (ws 8.18+)
- Pino structured logging

### Frontend
- React 18.3.1+ with TypeScript 5.5.3+
- Vite 5.4.20+
- TailwindCSS 3.4.17+ (slate palette)
- Auth0 React SDK
- Web Audio API

## Next Steps: Phase 3 (User Story 1)

**Goal**: Users can select mood and start session with ambient Lofi music

**Tasks to implement** (13 tasks):

1. **Backend**:
   - Session API routes (POST/GET/PUT /api/sessions)
   - Session service layer
   - User preferences endpoints

2. **Frontend**:
   - `useAudioEngine` hook for audio synthesis
   - `audioService` for OscillatorNode management
   - `ControlPanel` component (mood selector, start/stop)
   - `useSessionPersistence` hook
   - Auth0 login button integration
   - Volume control and fadeout

3. **Integration**:
   - Connect frontend to backend API
   - Implement session state management
   - Test end-to-end flow

## Architecture Highlights

### Authentication Flow
1. User clicks "Login with Auth0"
2. Auth0 redirects to login page
3. User authenticates
4. Auth0 returns JWT token
5. Frontend stores token in localStorage
6. Backend validates JWT on each API request

### Audio Synthesis Flow
1. User selects piano song (thousand-years, kiss-the-rain, river-flows, gurenge)
2. Mood maps to base frequency (160Hz, 200Hz, 150Hz, 220Hz)
3. OscillatorNode generates sine/sawtooth waves
4. GainNode controls volume with fadeIn/fadeOut
5. Canvas visualizes waveform in real-time

### Real-time Rhythm Detection
1. Frontend detects keystrokes/clicks
2. Calculates keys per minute (KPM)
3. Sends rhythm updates via WebSocket
4. Backend stores rhythm data in FocusSession
5. AI generates insights based on typing patterns

## Troubleshooting

### Backend won't start
- Check MongoDB URI in `.env`
- Verify Auth0 credentials
- Run `cd backend && npm install`

### Frontend can't authenticate
- Verify `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`
- Check Auth0 callback URL includes `http://localhost:5173`

### Linting errors
- Run `npm run lint:fix` to auto-fix
- Check `biome.json` configuration

## Resources

- [Constitution v2.2.0](./specs/001-adaptive-focus-music/constitution.md)
- [Tasks Breakdown](./specs/001-adaptive-focus-music/tasks.md)
- [Phase 2 Completion Summary](./docs/phase2-completion.md)

---

**Status**: Phase 2 Complete ✅ | Ready for Phase 3
**Last Updated**: October 18, 2025
