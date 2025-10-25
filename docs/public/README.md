# 🎵 PulsePlay

**Turn your typing rhythm into personalized focus music**

An AI-powered focus music generator that creates adaptive, real-time ambient soundscapes based on your typing rhythm and mouse movements. Built for developers, writers, and knowledge workers who want dynamic background music that responds to their work patterns.

[![Built with React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Auth0](https://img.shields.io/badge/Auth0-Secure-orange.svg)](https://auth0.com/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Native-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI--Powered-yellow.svg)](https://ai.google.dev/)

---

## ✨ Features

- 🎹 **Real-time Audio Synthesis** - Pure Web Audio API synthesis (no pre-recorded samples)
- 🎯 **Rhythm Detection** - Tracks keyboard and mouse activity to calculate BPM and tempo
- 🧠 **AI Song Recommendations** - Intelligent insights via Gemini API based on your focus patterns
- 🎨 **Live Waveform Visualization** - 60fps Canvas animation synced with your typing
- 🎹 **MIDI-Based Piano Songs** - Real piano pieces that adapt to your typing rhythm
- 🎵 **Adaptive Instruments** - Piano, Flute, Xylophone, and Kalimba that respond to your rhythm
- 🔐 **Secure Authentication** - OAuth2 PKCE flow with Auth0
- 💾 **Session History** - Automatic tracking with 90-day data retention
- ♿ **Accessibility Mode** - WCAG 2.1 AA compliant with sensory-friendly options
- � **Four Piano Songs** - Choose from A Thousand Years, Kiss The Rain, River Flows In You, or Gurenge

---

## 🚀 Deployment

### Docker Deployment (Recommended)

PulsePlay includes complete Docker configuration for production deployment:

```bash
# Quick start with Docker
make up-atlas    # Start with MongoDB Atlas
make up          # Start with local MongoDB

# View deployment guides
# See docs/docker/DOCKER_README.md for complete instructions
```

### Key Deployment Features

- **Multi-stage Docker builds** for optimized images
- **MongoDB Atlas integration** for cloud database
- **Nginx reverse proxy** for static file serving
- **Health checks** and **auto-restart** policies
- **Environment-based configuration** for different deployment stages

### Cloud Platform Options

- **AWS**: ECS, Fargate, or EC2 with Docker
- **Google Cloud**: Cloud Run, GKE
- **Azure**: Container Instances, AKS
- **DigitalOcean**: App Platform, Droplets
- **Railway**: Docker deployments

Set environment variables in your deployment platform's dashboard.

---

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Step-by-step setup instructions
- **[Complete Documentation](./DOCUMENTATION.md)** - Full project documentation
- **[API Reference](./API_REFERENCE.md)** - Detailed API documentation
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Development best practices

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend
- **Node.js + Express** - REST API server
- **MongoDB Atlas** - Cloud database
- **Auth0** - Authentication and authorization
- **Google Gemini AI** - Song recommendations

### Audio
- **Web Audio API** - Native browser audio synthesis
  - OscillatorNode for tone generation
  - GainNode for volume control
  - BiquadFilterNode for frequency filtering
  - ConvolverNode for reverb effects

---

## 📁 Project Structure

```
pulseplay/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── Auth0ProviderWrapper.tsx
│   │   ├── AuthButton.tsx
│   │   ├── ControlPanel.tsx      # Main audio controls
│   │   ├── SongInsights.tsx      # AI-generated insights
│   │   ├── RhythmVisualizer.tsx  # Real-time waveform
│   │   └── SessionStats.tsx      # Session metrics
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAudioEngine.ts     # Audio synthesis logic
│   │   ├── useRhythmDetection.ts # Keyboard/mouse tracking
│   │   └── useSessionPersistence.ts # Session management
│   ├── lib/                      # Utilities and services
│   │   ├── audioContext.ts       # Web Audio API wrapper
│   │   └── midiParser.ts         # MIDI file parsing
│   ├── pages/                    # Page components
│   │   └── Home.tsx
│   └── types/                    # TypeScript type definitions
├── backend/                      # Express.js API server
│   └── src/
│       ├── config/               # Configuration files
│       │   ├── auth0.ts          # JWT validation middleware
│       │   ├── database.ts       # MongoDB connection
│       │   └── logger.ts         # Structured logging
│       ├── middleware/           # Express middleware
│       │   ├── errorHandler.ts   # Error handling
│       │   └── rateLimiter.ts    # Rate limiting
│       ├── models/               # Mongoose schemas
│       │   ├── FocusSession.ts
│       │   ├── UserPreferences.ts
│       │   ├── MoodInsight.ts
│       │   └── WeeklySummary.ts
│       ├── routes/               # API route handlers
│       ├── services/             # Business logic
│       │   └── geminiService.ts  # AI mood analysis
│       ├── types/                # TypeScript types
│       ├── utils/                # Utilities
│       │   └── crypto.ts         # SHA-256 hashing
│       ├── websocket/            # WebSocket server
│       └── server.ts             # Express app entry point
├── docs/                         # Documentation
├── scripts/                      # Utility scripts
├── specs/                        # Project specifications
├── docker-compose*.yml          # Docker orchestration
├── Dockerfile*                   # Container definitions
├── Makefile                     # Development shortcuts
└── package.json                 # Dependencies and scripts
```

---

## 🎮 How to Use

1. **Sign Up/Sign In** - Create an account with Auth0 OAuth2 authentication
2. **Select Piano Song** - Choose from 4 beautiful piano pieces:
   - 🎹 **A Thousand Years** - Christina Perri's romantic ballad (75 BPM)
   - 💧 **Kiss The Rain** - Yiruma's gentle meditation (58 BPM)
   - 🌊 **River Flows In You** - Yiruma's flowing melody (65 BPM)
   - ⚔️ **Gurenge** - LiSA's energetic anime theme (95 BPM)
3. **Choose Instruments** - Select from Piano, Flute, Xylophone, and Kalimba
4. **Click Play** - Start the real-time audio synthesis engine
5. **Start Working** - Your typing rhythm creates adaptive music:
   - **Keystrokes** trigger melody notes
   - **Mouse movements** and **clicks** affect rhythm
   - **Scroll events** contribute to the audio mix
6. **View Real-time Insights** - AI analysis of your work patterns and focus metrics
7. **Session History** - Review past sessions with detailed statistics

### Real-time Features

- **Live BPM Detection** - Calculates your typing speed in real-time
- **Waveform Visualization** - 60fps canvas animation synced to your rhythm
- **Adaptive Audio** - Music changes based on your activity intensity
- **Session Statistics** - Tracks duration, keystrokes, clicks, mouse moves, scrolls

---

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript errors

# Backend
cd backend
npm run dev        # Start Express server
npm run build      # Build backend
```

### Environment Variables

Create a `.env` file in root:

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=http://localhost:3001
```

Create a `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

---

## 🎯 Key Algorithms

### Rhythm Detection Algorithm

```typescript
1. Track all user interactions (keystrokes, clicks, mouse moves, scrolls)
2. Filter to recent events (5-second rolling window)
3. Calculate intervals between consecutive events
4. Average interval: sum(intervals) / count(intervals)
5. Rhythm score: min(100, 10000 / max(avgInterval, 100))
6. Intensity levels: Low (<40), Medium (40-69), High (70+)
```

### Audio Synthesis Algorithm

```typescript
1. MIDI file parsing extracts note sequences and timing
2. OscillatorNode generates sine/sawtooth waves for each instrument
3. GainNode controls volume with fadeIn/fadeOut effects
4. BiquadFilterNode applies frequency filtering
5. Real-time rhythm modulation adjusts note timing and intensity
6. Canvas visualization renders 60fps waveform animation
```

---

## 🎮 How It Works

1. **Start a Session** - Click play to begin
2. **Select Piano Song** - Choose from 4 beautiful piano pieces:
   - **🎹 A Thousand Years** - Christina Perri's calm, romantic piano ballad (75 BPM)
   - **💧 Kiss The Rain** - Yiruma's gentle, contemplative melody (58 BPM)
   - **🌊 River Flows In You** - Yiruma's smooth, flowing piece (65 BPM)
   - **⚔️ Gurenge** - LiSA's energetic anime theme from Demon Slayer (95 BPM)
3. **Pick Instruments** - Select up to 4 instruments (Piano, Flute, Xylophone, Kalimba)
4. **Type Naturally** - Your typing triggers the melody notes
5. **Watch the Rhythm** - Real-time BPM and waveform visualization

### How Piano Songs Work

- **MIDI-Based Melodies** - Each song uses actual MIDI note sequences from the original piece
- **Rhythm-Adaptive** - Your typing speed modulates the piano note timing
- **Background Bass** - Low notes (< C4) play automatically in the background
- **Melody on Keystrokes** - High notes (>= C4) are triggered by your typing
- **Pure Web Audio API** - All sounds synthesized in real-time using browser audio

---

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run Biome.js linting
npm run typecheck  # Check TypeScript errors

# Backend
cd backend
npm run dev        # Start Express server with hot reload
npm run build      # Build TypeScript to JavaScript

# Both servers
npm run dev:all    # Start frontend & backend concurrently

# Testing
npm test           # Run unit tests
npm run test:ui    # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Environment Variables

Create a `.env` file in the project root:

```env
# ============================================
# MongoDB Configuration
# ============================================
# MongoDB Atlas (recommended)
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay?retryWrites=true&w=majority

# Local MongoDB (alternative)
MONGODB_URI=mongodb://localhost:27017/pulseplay-dev

# ============================================
# Auth0 Configuration
# ============================================
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com

# Frontend Auth0
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

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Express.js** - Backend API
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **Auth0** - Authentication & authorization
- **Google Gemini AI** - Song analysis
- **Web Audio API** - Native browser audio synthesis
- **@tonejs/midi** - MIDI file parsing
- **TailwindCSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Biome** - Fast linting & formatting

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/juxtaduo/pulseplay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/juxtaduo/pulseplay/discussions)
- **Documentation**: See the `docs/` directory for detailed guides

---

## 🗺️ Roadmap

- [x] Real-time audio synthesis with Web Audio API
- [x] MIDI-based piano songs (4 songs implemented)
- [x] Rhythm detection from typing patterns
- [x] AI song analysis with Gemini
- [x] Auth0 OAuth2 authentication
- [x] MongoDB Atlas integration
- [x] Docker containerization
- [ ] Mobile app version (React Native)
- [ ] More MIDI music files and instruments
- [ ] Advanced session analytics and charts
- [ ] Pomodoro timer integration
- [ ] Session recording export
- [ ] Enhanced machine learning for mood detection
- [ ] VSCode extension
- [ ] Browser extension

---

**Built with ❤️ for productivity and creativity**
**Status**: ✅ Production Ready | Actively Maintained
**Last Updated**: October 25, 2025
