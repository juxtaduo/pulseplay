# 🎵 PulsePlay AI

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

- **Node.js 18+** and npm
- **MongoDB Atlas** account ([sign up free](https://www.mongodb.com/cloud/atlas/register))
- **Auth0** account ([sign up free](https://auth0.com/signup))
- **Gemini API** key ([get key](https://ai.google.dev/))

### Installation

```bash
# Clone the repository
git clone https://github.com/retiarylime/pulseplay-ai.git
cd pulseplay-ai

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

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend (in new terminal)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📚 Documentation

### For Users

- **[Quick Start Guide](docs/public/QUICK_START.md)** - Get up and running
- **[Background Audio Guide](docs/developer/BACKGROUND_AUDIO.md)** - How audio works when tab is inactive
- **[Contributing](docs/public/CONTRIBUTING.md)** - How to contribute to the project
- **[Docker Deployment](DOCKER_DEPLOYMENT.md)** - Deploy with Docker and MongoDB Atlas

### For Developers

- **[Developer Guide](docs/developer/DEVELOPER_GUIDE.md)** - Comprehensive development guide
- **[API Reference](docs/developer/API_REFERENCE.md)** - Complete API documentation
- **[Architecture](docs/developer/ARCHITECTURE.md)** - System architecture and design
- **[Deployment Guide](docs/developer/DEPLOYMENT.md)** - Production deployment instructions
- **[Docker Quick Start](DOCKER_QUICK_REFERENCE.md)** - Quick Docker commands reference
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

- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Web Audio API** - Audio synthesis
- **Canvas API** - Waveform visualization
- **Lucide React** - Icon library

### Backend

- **Node.js + Express** - REST API server
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **Auth0** - Authentication and authorization
- **Google Gemini AI** - Mood recommendations

### DevOps

- **Biome** - Linting and formatting
- **GitHub Actions** - CI/CD (planned)

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start frontend dev server
npm run dev:all      # Start both frontend and backend
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run Biome linter
npm run typecheck    # Check TypeScript errors

# Docker Commands
make up              # Start all services
make down            # Stop all services
make logs            # View logs
make rebuild         # Rebuild and restart
```

---

## 📁 Project Structure

```
pulseplay-ai/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   ├── pages/             # Page components
│   └── services/          # API services
├── backend/               # Backend API server
│   └── src/
│       ├── models/        # MongoDB models
│       ├── routes/        # Express routes
│       ├── services/      # Business logic
│       └── middleware/    # Express middleware
├── docs/                  # Documentation
│   ├── public/           # User-facing docs
│   ├── developer/        # Developer docs
│   └── archive/          # Historical docs
└── specs/                # Project specifications
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

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Remember to set environment variables in your deployment platform!

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

- **GitHub Issues** - [Report bugs or request features](https://github.com/retiarylime/pulseplay-ai/issues)
- **Discussions** - [Join the conversation](https://github.com/retiarylime/pulseplay-ai/discussions)

---

**Built with ❤️ for productivity and creativity**
