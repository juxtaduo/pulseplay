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
- 🧠 **AI Mood Recommendations** - Intelligent insights via Gemini API based on your focus patterns
- 🎨 **Live Waveform Visualization** - 60fps Canvas animation synced with your typing
- 🎼 **Piano Song Moods** - A Thousand Years (Christina Perri), Kiss The Rain (Yiruma), River Flows In You (Yiruma), Gurenge (LiSA)
- 🎹 **MIDI-Based Melodies** - Real piano pieces that adapt to your typing rhythm
- 🎵 **Adaptive Instruments** - Piano, Flute, Xylophone, and Kalimba that respond to your rhythm
- 🔐 **Secure Authentication** - OAuth2 PKCE flow with Auth0
- 💾 **Session History** - Automatic tracking with 90-day data retention
- ♿ **Accessibility Mode** - WCAG 2.1 AA compliant with sensory-friendly options
- 📊 **Session Statistics** - Real-time metrics: duration, keystrokes, clicks, mouse moves, scrolls

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm (for manual development)
- **Docker + Docker Compose** (recommended for full development environment)
- **MongoDB Atlas** account ([sign up free](https://www.mongodb.com/cloud/atlas/register))
- **Auth0** account ([sign up free](https://auth0.com/signup))
- **Gemini API** key ([get key](https://ai.google.dev/))

### Installation

#### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay

# Start development environment
make up-dev

# Or with MongoDB Atlas
make up-atlas
```

#### Manual Installation

```bash
# Clone the repository
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay

# Install dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### Configuration

Create a `.env` file in the project root:

```bash
# Frontend Environment Variables
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=http://localhost:3001
```

Create a `backend/.env` file:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Running the Application

#### Docker (Recommended)

```bash
# Start all services
make up-dev

# View logs
make logs

# Stop services
make down
```

#### Manual Development

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend (in new terminal)
npm run dev
```

Visit `http://localhost:5173` (manual) or `http://localhost:3000` (Docker) in your browser.

---

## 📚 Documentation

### For Users

- **[Quick Start Guide](docs/public/QUICK_START.md)** - Get up and running
- **[Background Audio Guide](docs/developer/BACKGROUND_AUDIO.md)** - How audio works when tab is inactive
- **[Contributing](docs/public/CONTRIBUTING.md)** - How to contribute to the project

### Vercel Deployment

- **[Vercel Deployment Guide](docs/vercel/VERCEL_DEPLOYMENT.md)** - Complete Vercel serverless deployment
- **[Vercel Quick Reference](docs/vercel/VERCEL_QUICK_REFERENCE.md)** - Quick Vercel commands and setup
- **[Vercel vs Others](docs/vercel/VERCEL_VS_OTHERS.md)** - Compare Vercel with other deployment methods

### Docker Deployment

- **[Docker README](docs/docker/DOCKER_README.md)** - Complete Docker deployment guide
- **[Docker Quick Reference](docs/docker/DOCKER_QUICK_REFERENCE.md)** - Quick Docker commands
- **[Docker Files Summary](docs/docker/DOCKER_FILES_SUMMARY.md)** - Docker file inventory

### Database Setup

- **[MongoDB Atlas Setup](docs/mongodb/MONGODB_ATLAS_SETUP.md)** - Complete Atlas setup guide
- **[MongoDB Atlas Quick Start](docs/mongodb/MONGODB_ATLAS_QUICK_START.md)** - 5-minute setup guide

### For Developers

- **[Developer Guide](docs/developer/DEVELOPER_GUIDE.md)** - Comprehensive development guide
- **[API Reference](docs/developer/API_REFERENCE.md)** - Complete API documentation
- **[Architecture](docs/developer/ARCHITECTURE.md)** - System architecture and design
- **[Quick Reference](docs/developer/QUICK_REFERENCE.md)** - Code snippets and patterns
- **[Deployment Guide](docs/developer/DEPLOYMENT.md)** - Production deployment instructions
- **[Technical Documentation](docs/developer/DOCUMENTATION.md)** - In-depth technical details

---

## 🎮 How to Use

1. **Select a Piano Song** - Choose from 4 beautiful piano pieces:
   - **A Thousand Years** - Christina Perri's calm, romantic piano ballad
   - **Kiss The Rain** - Yiruma's gentle, contemplative melody
   - **River Flows In You** - Yiruma's smooth, flowing piece
   - **Gurenge** - LiSA's energetic anime theme song
2. **Pick Instruments** - Select up to 4 instruments (Piano, Flute, Xylophone, Kalimba)
3. **Start Your Session** - Click play and start typing/working
4. **Adjust Volume** - Use the slider to set your preferred volume level
5. **Your Rhythm Creates Music** - The app adapts to your typing and mouse patterns

---

## 🏗️ Tech Stack

### Frontend

- **React 18.3** - UI framework with hooks and concurrent features
- **TypeScript 5.5** - Type safety and enhanced developer experience
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Web Audio API** - Native browser audio synthesis engine
- **Canvas API** - Real-time waveform visualization
- **Lucide React** - Beautiful, consistent icon library

### Backend

- **Node.js + Express** - RESTful API server with middleware
- **TypeScript** - Type-safe backend development
- **MongoDB Atlas** - Cloud database with global clusters
- **Mongoose** - ODM for schema validation and data modeling
- **Auth0** - OAuth2 authentication and JWT validation
- **Google Gemini AI** - AI-powered mood analysis and recommendations

### DevOps & Tools

- **Docker + Docker Compose** - Containerized development and deployment
- **Biome** - Fast linting and code formatting
- **Makefile** - Development workflow automation
- **Nginx** - Reverse proxy for production deployment
- **GitHub Actions** - CI/CD pipeline (planned)

### Audio & Music

- **Web Audio API** - Real-time audio synthesis and processing
- **MIDI Parser** - Custom MIDI file parsing for piano songs
- **Audio Worklets** - Background audio processing
- **OscillatorNode** - Waveform generation
- **BiquadFilterNode** - Audio filtering and effects

---

## 🔧 Development

### Quick Setup

```bash
# Clone repository
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay

# Start development environment
make up-dev

# Or run manually:
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend
npm install && npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start frontend dev server (port 5173)
npm run dev:all      # Start both frontend and backend
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run Biome linter
npm run typecheck    # Check TypeScript errors

# Backend Scripts (in backend/ directory)
npm run dev          # Start backend dev server (port 3001)
npm run build        # Build backend
npm run start        # Start production server
```

### Docker Development

```bash
# Full development environment
make up-dev          # Start all services with hot reload

# With local MongoDB
make up-local        # Local database for development

# With MongoDB Atlas
make up-atlas        # Cloud database for production-like setup

# Development workflow
make logs            # Monitor all services
make rebuild         # Rebuild after dependency changes
make down            # Stop all services
```

### Environment Configuration

See the [Developer Guide](docs/developer/DEVELOPER_GUIDE.md) for complete environment setup instructions.

---

## 📁 Project Structure

```
pulseplay/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── assets/            # Static assets
├── backend/               # Backend API server
│   └── src/
│       ├── models/        # MongoDB models
│       ├── routes/        # Express routes
│       ├── services/      # Business logic
│       ├── middleware/    # Express middleware
│       ├── config/        # Configuration files
│       ├── types/         # TypeScript types
│       └── utils/         # Backend utilities
├── docs/                  # Documentation
│   ├── public/           # User-facing documentation
│   ├── developer/        # Developer technical docs
│   ├── docker/           # Docker deployment guides
│   ├── mongodb/          # MongoDB Atlas setup guides
│   ├── vercel/           # Vercel deployment guides
│   └── archive/          # Historical documentation
├── specs/                # Project specifications
├── scripts/              # Utility scripts
├── public/               # Static files served by Vite
├── docker/               # Docker-related files
│   ├── docker-compose.dev.yml
│   ├── docker-compose.atlas.yml
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── Dockerfile.frontend
└── Makefile              # Development and deployment commands
```

---

## 🎯 Key Algorithms

### Rhythm Detection Algorithm

```typescript
1. Track keystroke timestamps (last 50 keystrokes)
2. Filter to recent events (5-second window)
3. Calculate intervals between consecutive keystrokes
4. Average interval: sum(intervals) / count(intervals)
5. Rhythm score: min(100, 1000 / max(avgInterval, 50))
6. BPM: (60000 / avgInterval) * 0.25
7. Classify intensity: high (>70), medium (>40), low
```

### Audio Modulation Algorithm

```typescript
1. Normalize rhythm score (0-1 range)
2. Modulate oscillator frequencies:
   - targetFreq = baseFreq * (1 + normalizedScore * 0.3)
3. Adjust filter cutoff:
   - filterFreq = 1500 + (normalizedScore * 1500) Hz
4. Modulate gain:
   - gain = baseGain * (0.7 + normalizedScore * 0.3)
5. Use linearRampToValueAtTime for smooth transitions
```

---

## 🧪 Testing

```bash
# Type checking
npm run typecheck
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended for Serverless)

PulsePlay can be deployed as a full-stack serverless application using Vercel with MongoDB Atlas.

#### Quick Start

```bash
# Clone and setup
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay

# Install Vercel CLI
npm i -g vercel
vercel login

# Deploy
vercel --prod
```

#### Environment Setup

Configure environment variables in Vercel dashboard or CLI:
- MongoDB Atlas connection string
- Auth0 credentials
- Google Gemini API key

#### Available Commands

```bash
# Development
vercel --dev          # Local development server
vercel env add        # Add environment variables

# Production
vercel --prod         # Deploy to production
vercel logs           # View function logs
vercel analytics      # View analytics
```

See the [Vercel Deployment Guide](docs/vercel/VERCEL_DEPLOYMENT.md) for complete setup instructions.

### Docker Deployment

PulsePlay is fully containerized and ready for production deployment with Docker.

#### Quick Start

```bash
# Clone and setup
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay

# Start all services (MongoDB Atlas)
make up-atlas

# Or start with local MongoDB
make up-local

# View application
open http://localhost:3000
```

#### Production Deployment

```bash
# Build and deploy
make build-prod
make deploy-prod

# Monitor logs
make logs

# Update deployment
make update-prod
```

#### Environment Setup

Create `.env` files as described in the [Docker README](docs/docker/DOCKER_README.md).

#### Available Commands

```bash
# Development
make up-dev          # Start development environment
make up-local        # Start with local MongoDB
make up-atlas        # Start with MongoDB Atlas

# Production
make build-prod      # Build production images
make deploy-prod     # Deploy to production
make update-prod     # Update running deployment

# Management
make logs            # View all service logs
make logs-backend    # View backend logs only
make logs-frontend   # View frontend logs only
make down            # Stop all services
make clean           # Remove containers and volumes
make rebuild         # Rebuild and restart all services
```

See the [Docker README](docs/docker/DOCKER_README.md) for complete deployment instructions.

### Traditional Deployment

#### Vercel (Frontend Only - Alternative)

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Netlify (Frontend Only - Alternative)

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Note:** Traditional hosting requires separate backend deployment. Vercel serverless or Docker deployment is recommended for full-stack deployment.

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

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Web Audio API** - For enabling real-time audio synthesis
- **Google Gemini AI** - For intelligent mood recommendations
- **Auth0** - For secure authentication
- **MongoDB Atlas** - For reliable cloud database
- **React Community** - For amazing open-source tools

---

## 📧 Contact

- **GitHub Issues** - [Report bugs or request features](https://github.com/juxtaduo/pulseplay/issues)
- **Discussions** - [Join the conversation](https://github.com/juxtaduo/pulseplay/discussions)

---

**Built with ❤️ for productivity and creativity**
