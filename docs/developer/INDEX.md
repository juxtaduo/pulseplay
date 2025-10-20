# 🛠️ Developer Documentation

This directory contains comprehensive technical documentation for developers working on PulsePlay.

## 📖 Documentation Index

### Core Documentation
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Complete development setup and workflow
- **[API Reference](API_REFERENCE.md)** - REST API endpoints and component API
- **[Architecture](ARCHITECTURE.md)** - System architecture and design patterns
- **[Technical Documentation](DOCUMENTATION.md)** - In-depth technical details

### Setup & Deployment
- **[Quick Reference](QUICK_REFERENCE.md)** - Quick reference for common tasks
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions

### Technical Guides
- **[Background Audio](BACKGROUND_AUDIO.md)** - How background audio functionality works
- **[Index Reference](DOCS_INDEX.md)** - Legacy documentation index

---

## 🏗️ Project Architecture

### Frontend Architecture
- **React 18.3** with TypeScript
- **Custom Hooks** for business logic separation
- **Web Audio API** for real-time synthesis
- **Canvas API** for visualizations

### Backend Architecture
- **Express.js** REST API
- **MongoDB** with Mongoose ODM
- **Auth0** authentication middleware
- **Google Gemini AI** integration

### Key Design Patterns
- **Hook-based state management** - No Redux needed
- **Service layer pattern** - Separation of API logic
- **Component composition** - Reusable UI components
- **Type-safe APIs** - Full TypeScript coverage

---

## 📂 Code Organization

```
src/
├── components/       # React UI components
│   ├── AudioTest.tsx
│   ├── AuthButton.tsx
│   ├── ControlPanel.tsx
│   ├── MoodInsights.tsx
│   ├── RhythmVisualizer.tsx
│   └── SessionStats.tsx
├── hooks/           # Custom React hooks
│   ├── useAudioEngine.ts
│   ├── useRhythmDetection.ts
│   └── useSessionPersistence.ts
├── lib/             # Utilities and helpers
│   ├── audioContext.ts
│   ├── audioService.ts
│   └── instruments.ts
├── pages/           # Page components
│   ├── Home.tsx
│   └── SessionHistory.tsx
└── services/        # External API clients
```

---

## 🧪 Testing

- **Unit Tests**: `npm test`
- **Type Checking**: `npm run type-check`
- **Linting**: `npm run lint`

---

## 🔧 Development Workflow

1. **Setup**: Follow the [Developer Guide](DEVELOPER_GUIDE.md)
2. **Branch**: Create a feature branch from `main`
3. **Develop**: Make your changes with tests
4. **Test**: Run `npm test` and `npm run type-check`
5. **Commit**: Use conventional commits
6. **PR**: Submit a pull request with description

---

## 📚 Additional Resources

- **[Main README](../../README.md)** - Project overview
- **[Public Documentation](../public/INDEX.md)** - User guides
- **[Archive](../archive/)** - Historical documentation

---

## 🤝 Contributing

See [CONTRIBUTING.md](../public/CONTRIBUTING.md) for contribution guidelines.

---

## 📧 Questions?

- **Technical Issues**: [GitHub Issues](https://github.com/juxtaduo/pulseplay/issues)
- **Architecture Discussions**: [GitHub Discussions](https://github.com/juxtaduo/pulseplay/discussions)
