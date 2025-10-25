# Developer Guide - PulsePlay

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Architecture](#project-architecture)
3. [Code Standards](#code-standards)
4. [Testing Guide](#testing-guide)
5. [Debugging Tips](#debugging-tips)
6. [Common Tasks](#common-tasks)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

---

## Development Environment Setup

### Prerequisites

**Required Software**:
- Node.js 18.x or higher
- npm 9.x or yarn 1.22+ or pnpm 8.x
- Git 2.x
- Modern browser (Chrome/Firefox/Safari/Edge)
- Code editor (VS Code recommended)

**Recommended VS Code Extensions**:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens
- Better Comments
- Error Lens
- Biome (for linting and formatting)

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/juxtaduo/pulseplay.git
   cd pulseplay
   npm install
   npm install  # Also install backend dependencies
   cd backend && npm install && cd ..
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your values
   MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **MongoDB Atlas Setup**
   ```bash
   # Create free MongoDB Atlas account at https://mongodb.com/atlas
   # Create cluster, set up database user, get connection string
   # Add connection string to .env as MONGODB_ATLAS_URI
   ```

4. **Auth0 Setup**
   ```bash
   # Create Auth0 account at https://auth0.com
   # Create application, get domain/client ID/secret
   # Add to .env file
   ```

5. **Start Development Server**
   ```bash
   npm run dev:all  # Starts both frontend and backend
   ```
   
   Open http://localhost:5173 in your browser

---

## Project Architecture

### Directory Structure Explained

```
pulseplay/
│
├── src/                          # Frontend React application
│   ├── components/               # React UI components
│   │   ├── Auth0ProviderWrapper.tsx    # Auth0 integration
│   │   ├── AuthButton.tsx             # Login/logout UI
│   │   ├── ControlPanel.tsx           # Audio controls
│   │   ├── MoodInsights.tsx           # AI insights display
│   │   ├── RhythmVisualizer.tsx       # Real-time waveform
│   │   └── SessionStats.tsx           # Session metrics
│   │
│   ├── hooks/                    # Custom React hooks (business logic)
│   │   ├── useAudioEngine.ts          # Web Audio API wrapper
│   │   ├── useRhythmDetection.ts      # Activity tracking
│   │   └── useSessionPersistence.ts   # DB sync
│   │
│   ├── lib/                      # Shared utilities and services
│   │   ├── audioContext.ts           # Web Audio API wrapper
│   │   └── midiParser.ts             # MIDI file parsing
│   │
│   ├── pages/                    # Page components
│   │   └── Home.tsx
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── App.tsx                   # Main app (orchestrator)
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Global styles
│   └── vite-env.d.ts             # Vite type definitions
│
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
│
├── docs/                         # Documentation
├── scripts/                      # Utility scripts
├── specs/                        # Project specifications
├── docker-compose*.yml          # Docker orchestration
├── Dockerfile*                   # Container definitions
├── Makefile                     # Development shortcuts
└── package.json                 # Dependencies and scripts
```

### Architecture Layers

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (React Components - UI/UX)                 │
│  - AuthButton, ControlPanel, etc.           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Business Logic Layer                │
│  (Custom Hooks - State & Logic)             │
│  - useAudioEngine, useRhythmDetection       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Service Layer                      │
│  (API Clients - External Communication)     │
│  - Gemini AI service, Auth0 client          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Data Access Layer                   │
│  (Database & Persistence)                   │
│  - MongoDB Atlas, Mongoose ODM             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         External Services                   │
│  - MongoDB Atlas (Database)                 │
│  - Auth0 (Authentication)                   │
│  - Google Gemini AI (Mood Analysis)         │
│  - Web Audio API (Audio Synthesis)          │
└─────────────────────────────────────────────┘
```

### Data Flow

```
User Interaction
    │
    ├─→ Keyboard/Mouse Events
    │   └─→ useRhythmDetection
    │       └─→ rhythmData state
    │           ├─→ RhythmVisualizer (display)
    │           ├─→ useAudioEngine (modulation)
    │           ├─→ MoodInsights (AI analysis via Gemini)
    │           └─→ useSessionPersistence (save to MongoDB)
    │               └─→ Express API → MongoDB Atlas
    │
    └─→ UI Controls
        └─→ ControlPanel
            └─→ Auth0 authentication flow
```

---

## Code Standards

### TypeScript Guidelines

**1. Always Define Types**
```typescript
// ✅ Good
interface RhythmData {
  rhythmScore: number;
  bpm: number;
  intensity: 'low' | 'medium' | 'high';
}

function processRhythm(data: RhythmData): void {
  // ...
}

// ❌ Bad
function processRhythm(data: any) {
  // ...
}
```

**2. Use Type Inference When Obvious**
```typescript
// ✅ Good
const count = 0; // TypeScript infers number
const isPlaying = true; // TypeScript infers boolean

// ❌ Unnecessary
const count: number = 0;
const isPlaying: boolean = true;
```

**3. Prefer Interfaces for Objects**
```typescript
// ✅ Good
interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

// ⚠️ Also acceptable
type UserProfile = {
  id: string;
  email: string;
  name?: string;
};
```

### React Best Practices

**1. Functional Components with Hooks**
```typescript
// ✅ Good
export const MyComponent = ({ prop1, prop2 }: MyProps) => {
  const [state, setState] = useState(initialValue);
  
  return <div>{state}</div>;
};

// ❌ Avoid class components
class MyComponent extends React.Component { }
```

**2. Props Interface Definition**
```typescript
// ✅ Good
interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

export const ControlPanel = ({ isPlaying, onPlayPause }: ControlPanelProps) => {
  // ...
};

// ❌ Bad - no type definition
export const ControlPanel = ({ isPlaying, onPlayPause }) => {
  // ...
};
```

**3. useEffect Cleanup**
```typescript
// ✅ Good
useEffect(() => {
  const handleKeyDown = () => { /* ... */ };
  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, []);

// ❌ Bad - no cleanup (memory leak)
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
}, []);
```

**4. Memoization for Performance**
```typescript
// ✅ Good - useCallback for functions
const handleClick = useCallback(() => {
  doSomething(dependency);
}, [dependency]);

// ✅ Good - useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ❌ Bad - recreated on every render
const handleClick = () => {
  doSomething(dependency);
};
```

### Naming Conventions

```typescript
// Components: PascalCase
export const AuthButton = () => { };
export const RhythmVisualizer = () => { };

// Custom Hooks: camelCase with 'use' prefix
export const useAudioEngine = () => { };
export const useRhythmDetection = () => { };

// Functions: camelCase
const calculateRhythm = () => { };
const initAudioContext = () => { };

// Constants: UPPER_SNAKE_CASE
const MAX_KEYSTROKES = 50;
const DEFAULT_VOLUME = 70;

// Types/Interfaces: PascalCase
interface RhythmData { }
type MoodType = 'Calm' | 'Focus' | 'Energy';

// Private/Internal: prefix with underscore
const _internalHelper = () => { };
```

### File Organization

```typescript
// Component file structure
// 1. Imports (external, then internal)
import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { useAudioEngine } from '../hooks/useAudioEngine';

// 2. Type definitions
interface ComponentProps {
  prop1: string;
  prop2: number;
}

// 3. Constants
const DEFAULT_VALUE = 100;

// 4. Helper functions (if component-specific)
const helperFunction = () => { };

// 5. Component definition
export const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  // State declarations
  const [state, setState] = useState();
  
  // Custom hooks
  const { value } = useCustomHook();
  
  // Effects
  useEffect(() => { }, []);
  
  // Event handlers
  const handleClick = () => { };
  
  // Render
  return <div>Content</div>;
};
```

---

## Testing Guide

### Unit Testing (Future)

**Setup Jest + React Testing Library**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
```

**Example Component Test**
```typescript
// components/__tests__/ControlPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from '../ControlPanel';

describe('ControlPanel', () => {
  const mockProps = {
    isPlaying: false,
    mood: 'Focus',
    volume: 70,
    accessibilityMode: false,
    onPlayPause: jest.fn(),
    onMoodChange: jest.fn(),
    onVolumeChange: jest.fn(),
    onAccessibilityToggle: jest.fn(),
  };

  it('renders play button when not playing', () => {
    render(<ControlPanel {...mockProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onPlayPause when button clicked', () => {
    render(<ControlPanel {...mockProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockProps.onPlayPause).toHaveBeenCalledTimes(1);
  });
});
```

**Example Hook Test**
```typescript
// hooks/__tests__/useRhythmDetection.test.ts
import { renderHook, act } from '@testing-library/react';
import { useRhythmDetection } from '../useRhythmDetection';

describe('useRhythmDetection', () => {
  it('initializes with zero values', () => {
    const { result } = renderHook(() => useRhythmDetection(true));
    
    expect(result.current.rhythmData.bpm).toBe(0);
    expect(result.current.rhythmData.rhythmScore).toBe(0);
    expect(result.current.rhythmData.keystrokeCount).toBe(0);
  });

  it('resets rhythm when resetRhythm is called', () => {
    const { result } = renderHook(() => useRhythmDetection(true));
    
    act(() => {
      result.current.resetRhythm();
    });
    
    expect(result.current.rhythmData.bpm).toBe(0);
  });
});
```

---

## Debugging Tips

### React DevTools

**Installation**:
- Chrome: Install "React Developer Tools" extension
- Firefox: Install "React Developer Tools" addon

**Usage**:
1. Open browser DevTools (F12)
2. Click "Components" tab
3. Inspect component props, state, hooks
4. Use "Profiler" tab to identify performance issues

### Common Issues

#### 1. Audio Not Playing
```typescript
// Check AudioContext state
console.log('AudioContext state:', audioContextRef.current?.state);

// Resume if suspended
if (audioContextRef.current?.state === 'suspended') {
  audioContextRef.current.resume();
}

// Ensure user interaction before starting
// Browser policy requires user gesture
```

#### 2. Database Operations Failing
```typescript
// Check authentication
const token = localStorage.getItem('auth0_token');
console.log('Auth0 token:', token ? 'present' : 'missing');

// Check MongoDB connection
const response = await fetch('/api/health');
const health = await response.json();
console.log('MongoDB connection:', health.database);

// Log errors
try {
  const response = await fetch('/api/sessions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('API response:', data);
} catch (error) {
  console.error('API Error:', error);
}
```

#### 3. API Endpoint Errors
```typescript
// Check API server logs
// Backend logs are available in Docker container
docker logs pulseplay-backend

// Test API endpoint locally
curl -X POST http://localhost:3001/api/mood-analysis \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rhythmScore": 50, "bpm": 100, "intensity": "medium", "keystrokeCount": 100}'

// Check MongoDB connection in backend
// Backend will log connection status on startup
```

#### 4. TypeScript Errors
```bash
# Check all TypeScript errors
npm run typecheck

# Common fixes:
# - Add null checks: value?.property
# - Type assertions: value as Type
# - Optional chaining: object?.property
# - Non-null assertion: value!
```

### Logging Best Practices

```typescript
// Development logging
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// Error logging (always log errors)
try {
  // operation
} catch (error) {
  console.error('Operation failed:', error);
  // Optionally send to error tracking service
}

// Performance logging
const start = performance.now();
// operation
const end = performance.now();
console.log(`Operation took ${end - start}ms`);
```

---

## Common Tasks

### Adding a New Component

1. **Create Component File**
   ```bash
   touch src/components/NewComponent.tsx
   ```

2. **Component Template**
   ```typescript
   // src/components/NewComponent.tsx
   import { useState } from 'react';
   
   interface NewComponentProps {
     prop1: string;
     prop2: number;
   }
   
   export const NewComponent = ({ prop1, prop2 }: NewComponentProps) => {
     const [state, setState] = useState('');
     
     return (
       <div className="bg-slate-800 rounded-xl p-6">
         <h2 className="text-xl font-semibold text-white mb-4">
           New Component
         </h2>
         {/* Content */}
       </div>
     );
   };
   ```

3. **Import in App.tsx**
   ```typescript
   import { NewComponent } from './components/NewComponent';
   
   // Use in JSX
   <NewComponent prop1="value" prop2={123} />
   ```

### Adding a New Hook

1. **Create Hook File**
   ```bash
   touch src/hooks/useNewFeature.ts
   ```

2. **Hook Template**
   ```typescript
   // src/hooks/useNewFeature.ts
   import { useState, useEffect, useCallback } from 'react';
   
   export const useNewFeature = (param: string) => {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       // Setup
       return () => {
         // Cleanup
       };
     }, [param]);
     
     const doSomething = useCallback(() => {
       // Logic
     }, []);
     
     return { data, doSomething };
   };
   ```

3. **Use in Component**
   ```typescript
   import { useNewFeature } from '../hooks/useNewFeature';
   
   const { data, doSomething } = useNewFeature('param');
   ```

### Adding a Database Model

1. **Create Mongoose Schema**
   ```bash
   # Create new model file
   touch backend/src/models/NewModel.ts
   ```

2. **Define Schema**
   ```typescript
   // backend/src/models/NewModel.ts
   import mongoose, { Schema, Document } from 'mongoose';
   
   export interface INewModel extends Document {
     userId: mongoose.Types.ObjectId;
     field1: string;
     field2: number;
     createdAt: Date;
   }
   
   const NewModelSchema = new Schema<INewModel>({
     userId: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     field1: {
       type: String,
       required: true
     },
     field2: {
       type: Number,
       default: 0
     }
   }, {
     timestamps: true
   });
   
   export const NewModel = mongoose.model<INewModel>('NewModel', NewModelSchema);
   ```

3. **Add to Database Connection**
   ```typescript
   // backend/src/config/database.ts
   import { NewModel } from '../models/NewModel';
   
   // Models are registered when imported
   export const models = {
     NewModel
   };
   ```

4. **Create API Routes**
   ```typescript
   // backend/src/routes/newModel.ts
   import express from 'express';
   import { NewModel } from '../models/NewModel';
   import { authenticateToken } from '../middleware/auth';
   
   const router = express.Router();
   
   router.get('/', authenticateToken, async (req, res) => {
     try {
       const models = await NewModel.find({ userId: req.user.id });
       res.json(models);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   export default router;
   ```

5. **Register Route**
   ```typescript
   // backend/src/server.ts
   import newModelRoutes from './routes/newModel';
   
   app.use('/api/new-models', newModelRoutes);
   ```

### Adding a New API Endpoint

1. **Create Route File**
   ```bash
   touch backend/src/routes/my-endpoint.ts
   ```

2. **Implement Route Handler**
   ```typescript
   // backend/src/routes/my-endpoint.ts
   import express from 'express';
   import { authenticateToken } from '../middleware/auth';
   
   const router = express.Router();
   
   router.post('/', authenticateToken, async (req, res) => {
     try {
       const { data } = req.body;
       
       // Your logic here
       const result = { success: true, data };
       
       res.json(result);
     } catch (error) {
       console.error('Endpoint error:', error);
       res.status(500).json({ error: error.message });
     }
   });
   
   export default router;
   ```

3. **Register Route**
   ```typescript
   // backend/src/server.ts
   import myEndpointRoutes from './routes/my-endpoint';
   
   app.use('/api/my-endpoint', myEndpointRoutes);
   ```

4. **Test Endpoint**
   ```bash
   # Test locally
   curl -X POST http://localhost:3001/api/my-endpoint \
     -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"data": "test"}'
   
   # Check backend logs
   docker logs pulseplay-backend
   ```

---

## Deployment Guide

### Building for Production

```bash
# 1. Install dependencies
npm install

# 2. Type check
npm run typecheck

# 3. Lint
npm run lint

# 4. Build
npm run build

# Output will be in dist/ directory
```

### Deployment Options

#### Option 1: Docker Compose (Recommended)

```bash
# 1. Build and start all services
docker-compose up --build

# 2. Or for production
docker-compose -f docker-compose.yml up --build -d

# 3. Check logs
docker-compose logs -f
```

**Environment Variables for Docker**:
Create `.env` file with:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://...

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

# Google Gemini AI
GEMINI_API_KEY=...

# Backend
JWT_SECRET=your-secret-key
PORT=3001
```

#### Option 2: Manual Docker Build

```bash
# Build frontend
docker build -f Dockerfile.frontend -t pulseplay-frontend .

# Build backend
docker build -f Dockerfile -t pulseplay-backend .

# Run with docker-compose
docker-compose up
```

#### Option 3: Cloud Deployment

```bash
# Deploy to cloud provider (AWS, GCP, Azure)
# Use docker-compose.prod.yml for production

# Example: AWS ECS
aws ecs create-service \
  --cluster pulseplay-cluster \
  --service-name pulseplay-service \
  --task-definition pulseplay-task \
  --desired-count 1
```

### Pre-deployment Checklist

- [ ] Environment variables configured (.env file)
- [ ] MongoDB Atlas cluster accessible
- [ ] Auth0 application configured
- [ ] Google Gemini API key valid
- [ ] Docker images build successfully
- [ ] TypeScript errors resolved
- [ ] Test in production-like environment
- [ ] Check browser console for errors
- [ ] Verify authentication works
- [ ] Test audio playback
- [ ] Verify database operations
- [ ] Backend API endpoints responding

---

## Troubleshooting

### Build Errors

**Issue**: `Module not found`
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: TypeScript errors in build
```bash
# Check specific errors
npm run typecheck

# Common fixes:
# - Add missing imports
# - Fix type definitions
# - Use type assertions where needed
```

### Runtime Errors

**Issue**: White screen after deployment
- Check browser console for errors
- Verify environment variables are set
- Check network tab for failed requests
- Ensure API URLs are correct

**Issue**: Authentication not working
- Verify Auth0 domain and client ID
- Check Auth0 application configuration
- Verify JWT token validation in backend
- Check CORS settings in Express.js
- Ensure Auth0 callback URLs are configured

**Issue**: Audio not starting
- Requires user interaction (browser policy)
- Check AudioContext state
- Verify Web Audio API support
- Check browser console for errors

### Performance Issues

**Issue**: Slow initial load
- Optimize bundle size (check with `npm run build`)
- Lazy load components
- Reduce dependencies
- Use code splitting

**Issue**: High CPU usage
- Reduce animation frame rate
- Optimize rhythm detection calculations
- Limit array sizes
- Use debouncing/throttling

---

**Last Updated**: October 18, 2025
