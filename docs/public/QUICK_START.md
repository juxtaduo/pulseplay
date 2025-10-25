# PulsePlay - Quick Start Guide

**Turn your typing rhythm into personalized focus music**

This guide will help you get PulsePlay up and running on your local machine for development.

## Project Structure

```
pulseplay/
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
│   │   └── midiParser.ts    # MIDI file parsing utilities
│   ├── hooks/
│   │   ├── useAudioEngine.ts
│   │   ├── useRhythmDetection.ts
│   │   └── useSessionPersistence.ts
│   ├── pages/
│   │   └── Home.tsx
│   └── types/
│       └── index.ts
├── biome.json               # Biome.js configuration
├── .env.example             # Environment variables template
├── docker-compose.yml       # Docker orchestration
├── Makefile                 # Development shortcuts
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

Copy the example file and edit it with your credentials:

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

**Required environment variables:**

```bash
# ============================================
# MongoDB Configuration (choose one)
# ============================================
# Option A: MongoDB Atlas (recommended for production)
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay?retryWrites=true&w=majority

# Option B: Local MongoDB (for development)
MONGODB_URI=mongodb://localhost:27017/pulseplay-dev

# ============================================
# Auth0 Configuration
# ============================================
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com

# Frontend Auth0 (for Vite)
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=http://localhost:3001

# ============================================
# AI/ML API Keys
# ============================================
GEMINI_API_KEY=your_gemini_api_key

# ============================================
# Server Configuration
# ============================================
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Development Setup Complete

You're now ready to start developing!

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
- Backend: http://localhost:3001/api/health

## Development Commands

```bash
# Frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Run Biome.js linting
npm run lint:fix         # Fix linting issues
npm run typecheck        # Check TypeScript errors

# Backend
npm run dev:backend      # Start backend with nodemon
npm run build:backend    # Build backend TypeScript

# Both
npm run dev:all          # Start both servers concurrently

# Testing
npm test                 # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
```

## Docker Development (Alternative)

For a complete development environment with MongoDB:

```bash
# Start all services (local MongoDB)
make up

# Start development environment (hot reload + debug tools)
make up-dev

# Start with MongoDB Atlas
make up-atlas

# View logs
make logs          # All services
make logs-dev      # Development environment
make logs-atlas    # Atlas deployment

# Stop services
make down          # All services
make down-dev      # Development services
make down-atlas    # Atlas services

# Rebuild after changes
make rebuild       # All services
make rebuild-dev   # Development services
make rebuild-atlas # Atlas services
```

## Tech Stack

### Backend
- Node.js 18+ with ES2022 modules
- Express 5.1.0+ (TypeScript)
- MongoDB Atlas 7+ with Mongoose 8.19+
- Auth0 OAuth2 JWT validation
- Gemini API (gemini-2.5-flash)
- WebSocket (ws 8.18+)
- Pino structured logging

### Frontend
- React 18.3.1+ with TypeScript 5.5.3+
- Vite 5.4.20+
- TailwindCSS 3.4.17+ (slate palette)
- Auth0 React SDK
- Web Audio API

## 🎮 How to Use PulsePlay

1. **Open the application** at http://localhost:5173
2. **Sign in** with Auth0 (OAuth2 authentication)
3. **Select a piano song** from the four available options:
   - 🎹 **A Thousand Years** - Christina Perri's romantic ballad
   - 💧 **Kiss The Rain** - Yiruma's gentle meditation
   - 🌊 **River Flows In You** - Yiruma's flowing melody
   - ⚔️ **Gurenge** - LiSA's energetic anime theme
4. **Choose instruments** (Piano, Flute, Xylophone, Kalimba)
5. **Click Play** to start the audio engine
6. **Start typing/working** - your rhythm creates music in real-time
7. **View insights** - AI-generated analysis appears after sessions

## 🎵 How It Works

- **Real-time rhythm detection** tracks your keystrokes, mouse movements, and clicks
- **MIDI-based melodies** use actual note sequences from the original songs
- **Adaptive timing** - your typing speed modulates the piano note timing
- **Web Audio API synthesis** creates all sounds in real-time (no pre-recorded samples)
- **AI mood analysis** provides insights based on your work patterns

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection (Atlas URI or local MongoDB)
- Verify Auth0 credentials are correct
- Ensure PORT=3001 is set in .env
- Run `npm install` in backend directory

### Frontend authentication issues
- Verify `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`
- Check Auth0 callback URL includes `http://localhost:5173`
- Ensure `VITE_API_URL` points to `http://localhost:3001`

### Audio not working
- Check browser permissions for audio
- Ensure you're using a modern browser with Web Audio API support
- Try refreshing the page

### MongoDB connection failed
- For Atlas: Verify connection string and IP whitelist
- For local: Ensure MongoDB is running on port 27017
- Check network connectivity

### Linting errors
- Run `npm run lint:fix` to auto-fix formatting issues
- Check `biome.json` configuration if problems persist

## 📚 Resources

- **[Main README](../../README.md)** - Project overview and features
- **[API Documentation](../developer/API_REFERENCE.md)** - Backend API reference
- **[Developer Guide](../developer/DEVELOPER_GUIDE.md)** - Development best practices
- **[Docker Deployment](../docker/DOCKER_README.md)** - Production deployment guide
- **[MongoDB Atlas Setup](../mongodb/MONGODB_ATLAS_SETUP.md)** - Database setup guide

## 🎯 Getting Help

- **Issues**: [GitHub Issues](https://github.com/juxtaduo/pulseplay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/juxtaduo/pulseplay/discussions)
- **Documentation**: Check the `docs/` directory for detailed guides

---

**Ready to start developing?** Run `npm run dev:all` and visit http://localhost:5173

**Last Updated**: October 25, 2025
