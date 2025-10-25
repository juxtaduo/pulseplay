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
src/                    # Frontend (React + TypeScript)
├── components/         # React UI components
│   ├── AudioTest.tsx       # Audio testing interface
│   ├── AuthButton.tsx      # Authentication UI
│   ├── ControlPanel.tsx    # Audio controls
│   ├── SongInsights.tsx    # AI-generated song insights
│   ├── RhythmVisualizer.tsx # Visual feedback
│   └── SessionStats.tsx    # Session metrics
├── hooks/              # Custom React hooks
│   ├── useAudioEngine.ts        # Audio synthesis logic
│   ├── useRhythmDetection.ts    # Rhythm tracking
│   └── useSessionPersistence.ts # Database persistence
├── services/           # External API clients
│   └── moodService.ts       # AI mood generation API
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # Library configurations

backend/                # Backend (Express.js + TypeScript)
├── src/
│   ├── server.ts       # Express server setup
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic services
│   ├── models/         # MongoDB models
│   ├── middleware/     # Express middleware
│   ├── config/         # Configuration files
│   └── utils/          # Backend utilities
└── package.json        # Backend dependencies

docs/                   # Documentation
├── docker/            # Docker deployment guides
├── developer/         # Developer documentation
└── public/            # User guides

.github/workflows/     # CI/CD pipelines
└── docker-deploy.yml  # GitHub Actions deployment
```

---

## 🧪 Testing

- **Frontend**: `npm test` (Vitest + React Testing Library)
- **Backend**: `cd backend && npm test` (Jest)
- **Type Checking**: `npm run typecheck`
- **Linting**: `npm run lint`
- **Integration**: `npm run test:e2e` (Playwright)

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
