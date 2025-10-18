# 🎵 PulsePlay AI

**Turn your typing rhythm into personalized focus music**

An AI-powered focus music generator that creates adaptive, real-time ambient soundscapes based on your typing rhythm and mouse movements. Built for developers and knowledge workers who want dynamic background music that responds to their work patterns.

[![Built with React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-Powered-green.svg)](https://supabase.com/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Native-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## ✨ Features

- 🎹 **Real-time Audio Generation** - Dynamic music synthesis using Web Audio API
- 🎯 **Rhythm Detection** - Tracks keyboard and mouse activity to calculate tempo
- 🧠 **AI Mood Analysis** - Intelligent insights about your work patterns via Supabase Edge Functions
- 🎨 **Visual Feedback** - Beautiful canvas-based visualizer that pulses with your rhythm
- 🔐 **User Authentication** - Secure login with Supabase Auth
- 💾 **Session Tracking** - Automatic persistence of focus sessions
- ♿ **Accessibility Mode** - Lower frequency ranges for sensory-friendly experience
- 🎚️ **Multiple Moods** - Choose between Calm, Focus, or Energy modes

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up free](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pulseplay-ai.git
cd pulseplay-ai

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
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
- **Supabase** - Backend as a service
  - Authentication
  - PostgreSQL Database
  - Edge Functions (Serverless)
  - Real-time subscriptions

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
│   ├── services/        # API clients
│   ├── lib/             # Utilities
│   └── App.tsx          # Main application
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database schema
└── Documentation files
```

---

## 🎮 How to Use

1. **Sign Up/Sign In** - Create an account or log in
2. **Click Play** - Start the audio engine
3. **Start Typing** - Your typing rhythm will modulate the music
4. **Adjust Settings** - Change mood, volume, and accessibility mode
5. **View Insights** - See AI-generated analysis of your work rhythm

### Mood Modes

- **🌊 Calm** - Lower frequencies (130-392 Hz) for relaxed focus
- **🎯 Focus** - Mid frequencies (145-440 Hz) for productive work
- **⚡ Energy** - Higher frequencies (165-494 Hz) for high-intensity tasks

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
- Powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pulseplay-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pulseplay-ai/discussions)

---

## 🗺️ Roadmap

- [ ] Mobile app version (React Native)
- [ ] More instrument types (piano, strings, pads)
- [ ] Session analytics and charts
- [ ] Collaborative focus rooms
- [ ] Pomodoro timer integration
- [ ] Export session recordings
- [ ] Spotify playlist integration
- [ ] Machine learning for advanced mood detection
- [ ] Binaural beats support

---

**Built with ❤️ for focused productivity**
