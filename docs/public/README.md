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
- 🎹 **MIDI-Based Piano Songs** - Real piano pieces that adapt to your typing rhythm
- 🎵 **Adaptive Instruments** - Piano, Flute, Xylophone, and Kalimba that respond to your rhythm
- 🔐 **Secure Authentication** - OAuth2 PKCE flow with Auth0
- 💾 **Session History** - Automatic tracking with 90-day data retention
- ♿ **Accessibility Mode** - WCAG 2.1 AA compliant with sensory-friendly options
- � **Four Piano Songs** - Choose from A Thousand Years, Kiss The Rain, River Flows In You, or Gurenge

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

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB, Auth0, and Gemini credentials

# Start development servers
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (Express)
cd backend
npm run dev
```

Visit http://localhost:5173 to see the app running!

---

## 📖 Documentation

- **[Complete Documentation](./DOCUMENTATION.md)** - Full project documentation
- **[API Reference](./API_REFERENCE.md)** - Detailed API documentation
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Development best practices and guides

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
- **Google Gemini AI** - Mood recommendations

### Audio
- **Web Audio API** - Native browser audio synthesis
  - OscillatorNode for tone generation
  - GainNode for volume control
  - BiquadFilterNode for frequency filtering
  - ConvolverNode for reverb effects

---

## 📁 Project Structure

```
pulseplay-ai/
├── src/
│   ├── components/       # React UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Audio synthesis & utilities
│   ├── pages/           # Page components
│   └── App.tsx          # Main application
├── backend/
│   └── src/
│       ├── models/      # MongoDB models
│       ├── routes/      # API routes
│       └── services/    # Business logic
└── Documentation files
```

---

## 🎮 How to Use

1. **Sign Up/Sign In** - Create an account with Auth0
2. **Select Piano Song** - Choose from 4 beautiful piano pieces
3. **Pick Instruments** - Select instruments (Piano, Flute, Xylophone, Kalimba)
4. **Click Play** - Start the audio engine
5. **Start Working** - Your typing rhythm will create music
6. **View Insights** - See AI-generated analysis of your work rhythm (shown after 1+ minute sessions)

### Piano Songs

- **� A Thousand Years** - Christina Perri's romantic ballad (75 BPM, C4 key)
- **💧 Kiss The Rain** - Yiruma's gentle meditation (58 BPM, C4 key)
- **� River Flows In You** - Yiruma's flowing melody (65 BPM, C4 key)
- **⚔️ Gurenge** - LiSA's energetic anime theme (95 BPM, C4 key)

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
1. Track all interactions (keystrokes, clicks, mouse moves, scrolls)
2. Filter to recent events (5-second window)
3. Calculate intervals between consecutive events
4. Average interval: sum(intervals) / count(intervals)
5. Rhythm score: min(100, 10000 / max(avgInterval, 100))
6. Intensity levels: Low (<40), Medium (40-69), High (70+)
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
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript errors
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Deploy edge functions
supabase functions deploy generate-mood
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
# Run unit tests (when implemented)
npm test

# Run E2E tests (when implemented)
npm run test:e2e

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

This project is built for an open-source hackathon. License details to be added.

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Database by [MongoDB Atlas](https://www.mongodb.com/atlas)
- Auth by [Auth0](https://auth0.com/)
- AI by [Google Gemini](https://ai.google.dev/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/retiarylime/pulseplay-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/retiarylime/pulseplay-ai/discussions)

---

## 🗺️ Roadmap

- [ ] Mobile app version (React Native)
- [ ] More MIDI music files
- [ ] Session analytics and charts
- [ ] Pomodoro timer integration
- [ ] Export session recordings
- [ ] Machine learning for advanced mood detection
- [ ] VSCode extension

---

**Built with ❤️ for productivity and creativity**
