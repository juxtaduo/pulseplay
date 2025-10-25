# Quick Reference Guide - PulsePlay

A cheat sheet for common tasks, commands, and code patterns.

---

## 🚀 Quick Start Commands

```bash
# Initial setup
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas, Auth0, and Gemini credentials

# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run typecheck        # Check TypeScript errors
npm run lint             # Run ESLint

# Backend development
cd backend && npm install
npm run dev              # Start backend server (http://localhost:3001)

# Docker development
docker-compose -f docker-compose.dev.yml up --build

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Database
# MongoDB Atlas is cloud-hosted, no local setup needed
```

---

## 📁 File Templates

### React Component Template

```typescript
import { useState } from 'react';

interface MyComponentProps {
  prop1: string;
  prop2: number;
}

export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  const [state, setState] = useState('');

  const handleAction = () => {
    setState('new value');
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Component Title
      </h2>
      {/* Content */}
    </div>
  );
};
```

### Custom Hook Template

```typescript
import { useState, useEffect, useCallback } from 'react';

export const useMyHook = (param: string) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Setup logic
    
    return () => {
      // Cleanup logic
    };
  }, [param]);

  const doSomething = useCallback(() => {
    // Action logic
  }, []);

  return { data, doSomething };
};
```

### Service Function Template

```typescript
// src/services/myService.ts
export interface MyResponse {
  field1: string;
  field2: number;
}

export const myServiceCall = async (data: any): Promise<MyResponse> => {
  try {
    const token = localStorage.getItem('auth0_token');
    const response = await fetch('/api/my-endpoint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};
```

---

## 🎨 Common UI Patterns

### Button Styles

```tsx
{/* Primary Button */}
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
  Click Me
</button>

{/* Secondary Button */}
<button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium transition-colors">
  Cancel
</button>

{/* Danger Button */}
<button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors">
  Delete
</button>

{/* Icon Button */}
<button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
  <Icon size={20} />
</button>
```

### Card Layouts

```tsx
{/* Basic Card */}
<div className="bg-slate-800 rounded-xl p-6">
  <h2 className="text-xl font-semibold text-white mb-4">Title</h2>
  {/* Content */}
</div>

{/* Stat Card */}
<div className="bg-slate-900 rounded-lg p-4">
  <div className="flex items-center gap-3 mb-2">
    <Icon size={20} className="text-slate-400" />
    <span className="text-sm text-slate-400">Label</span>
  </div>
  <div className="text-2xl font-bold text-white">Value</div>
</div>
```

### Form Inputs

```tsx
{/* Text Input */}
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
  placeholder="Enter text..."
/>

{/* Range Slider */}
<input
  type="range"
  min="0"
  max="100"
  value={value}
  onChange={(e) => setValue(Number(e.target.value))}
  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
/>

{/* Checkbox */}
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
  className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
/>
```

---

## 🔌 Auth0 + MongoDB Code Snippets

### Authentication (Auth0)

```typescript
// Login with Auth0
const login = async () => {
  const auth0 = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
    redirect_uri: window.location.origin
  });
  
  await auth0.loginWithRedirect();
};

// Get user info
const getUser = async () => {
  const auth0 = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID
  });
  
  const user = await auth0.getUser();
  const token = await auth0.getTokenSilently();
  
  return { user, token };
};

// Logout
const logout = async () => {
  const auth0 = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID
  });
  
  await auth0.logout({
    returnTo: window.location.origin
  });
};
```

### API Calls (Express.js Backend)

```typescript
// GET request with auth
const fetchUserData = async (): Promise<UserData> => {
  const token = localStorage.getItem('auth0_token');
  
  const response = await fetch('/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

// POST request
const saveSession = async (sessionData: SessionData): Promise<Session> => {
  const token = localStorage.getItem('auth0_token');
  
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

// PUT request
const updateSettings = async (settings: UserSettings): Promise<UserSettings> => {
  const token = localStorage.getItem('auth0_token');
  
  const response = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  return response.json();
};
```

---

## 🎵 Web Audio API Snippets

### Basic Setup

```typescript
// Create context
const audioContext = new AudioContext();

// Resume if suspended (browser policy)
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}

// Close context
audioContext.close();
```

### Oscillator

```typescript
// Create and configure
const oscillator = audioContext.createOscillator();
oscillator.type = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
oscillator.frequency.value = 440; // Hz

// Connect and start
oscillator.connect(destination);
oscillator.start();

// Stop
oscillator.stop();
oscillator.disconnect();
```

### Gain (Volume)

```typescript
// Create gain node
const gainNode = audioContext.createGain();
gainNode.gain.value = 0.5; // 0.0 to 1.0+

// Smooth volume change
gainNode.gain.linearRampToValueAtTime(
  0.8,
  audioContext.currentTime + 0.5
);
```

### Filter

```typescript
// Create filter
const filter = audioContext.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 1000; // Hz
filter.Q.value = 1; // Quality factor

// Sweep filter
filter.frequency.linearRampToValueAtTime(
  2000,
  audioContext.currentTime + 1
);
```

### Audio Graph

```typescript
// Create nodes
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
const filter = audioContext.createBiquadFilter();

// Connect: oscillator → gain → filter → destination
oscillator.connect(gainNode);
gainNode.connect(filter);
filter.connect(audioContext.destination);

// Start
oscillator.start();
```

---

## 🎣 React Hooks Patterns

### useState with Object

```typescript
interface State {
  field1: string;
  field2: number;
}

const [state, setState] = useState<State>({
  field1: '',
  field2: 0
});

// Update single field
setState(prev => ({ ...prev, field1: 'new value' }));
```

### useEffect Patterns

```typescript
// On mount only
useEffect(() => {
  console.log('Component mounted');
}, []);

// With cleanup
useEffect(() => {
  const handler = () => console.log('Event');
  window.addEventListener('event', handler);
  
  return () => {
    window.removeEventListener('event', handler);
  };
}, []);

// With dependencies
useEffect(() => {
  console.log('Dependency changed:', dependency);
}, [dependency]);
```

### useCallback

```typescript
// Memoize function
const handleClick = useCallback(() => {
  doSomething(dependency);
}, [dependency]);

// Pass to child component
<ChildComponent onClick={handleClick} />
```

### useMemo

```typescript
// Memoize expensive calculation
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### useRef

```typescript
// DOM reference
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// Mutable value (doesn't trigger re-render)
const countRef = useRef(0);
countRef.current += 1;
```

---

## 🐛 Debug Commands

### Browser Console

```javascript
// Check audio context
window.audioContext = audioContextRef.current;
console.log(audioContext.state); // 'running', 'suspended', 'closed'

// Check Auth0 token
const token = localStorage.getItem('auth0_token');
console.log('Auth0 token:', token ? 'present' : 'missing');

// Test API endpoint
fetch('/api/health', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(console.log);

// Test mood analysis API
fetch('/api/mood-analysis', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rhythmScore: 50,
    bpm: 100,
    intensity: 'medium',
    keystrokeCount: 100
  })
}).then(r => r.json()).then(console.log);
```

### TypeScript Helpers

```typescript
// Check types
const data: unknown = fetchData();
if (typeof data === 'string') {
  // TypeScript knows data is string here
}

// Type assertion
const value = (data as MyType).property;

// Non-null assertion
const value = data!.property;

// Optional chaining
const value = data?.property?.nested;

// Nullish coalescing
const value = data?.property ?? 'default';
```

---

## 📝 MongoDB/Mongoose Snippets

### Mongoose Schema

```typescript
// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  name?: string;
  settings: {
    volume: number;
    mood: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  settings: {
    volume: { type: Number, default: 70 },
    mood: { type: String, default: 'Focus' }
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
```

### Common Queries

```typescript
// Find user by Auth0 ID
const user = await User.findOne({ auth0Id: auth0Id });

// Find sessions for user
const sessions = await Session.find({ userId: user._id })
  .sort({ createdAt: -1 })
  .limit(10);

// Create new session
const session = new Session({
  userId: user._id,
  rhythmScore: 85,
  bpm: 120,
  duration: 1800
});
await session.save();

// Update user settings
await User.findByIdAndUpdate(user._id, {
  'settings.volume': 80,
  'settings.mood': 'Calm'
});

// Aggregate session data
const stats = await Session.aggregate([
  { $match: { userId: user._id } },
  {
    $group: {
      _id: null,
      avgScore: { $avg: '$rhythmScore' },
      totalSessions: { $sum: 1 },
      avgBpm: { $avg: '$bpm' }
    }
  }
]);
```

---

## 🔧 Environment Setup

### .env Template

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=your_api_identifier

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Backend Configuration
JWT_SECRET=your_jwt_secret_key
PORT=3001

# Optional: Development flags
VITE_DEBUG=true
```

### VS Code Settings (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## 🚢 Deployment Checklist

```bash
# Pre-deployment
□ npm run typecheck        # No TypeScript errors
□ npm run lint             # No linting errors
□ npm run build            # Frontend build succeeds
□ Backend build succeeds   # cd backend && npm run build

# Docker
□ docker-compose build     # Images build successfully
□ docker-compose up        # Services start without errors

# Database & Services
□ MongoDB Atlas accessible # Test connection string
□ Auth0 app configured     # Check domain and client ID
□ Gemini API key valid     # Test API access

# Environment
□ .env file configured     # All required variables set
□ Secrets not in repo      # Check .gitignore

# Post-deployment
□ Test auth flow           # Login/logout works
□ Test audio playback      # Sound generates correctly
□ Test API endpoints       # Backend responds to requests
□ Check browser console    # No runtime errors
□ Verify data persistence  # Sessions save to MongoDB
```

---

## 📚 Useful Links

- **React Docs**: https://react.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Mongoose ODM**: https://mongoosejs.com/docs/
- **Auth0 Docs**: https://auth0.com/docs
- **Google Gemini AI**: https://ai.google.dev/docs
- **Express.js**: https://expressjs.com/
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **TailwindCSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide/
- **Docker**: https://docs.docker.com/

---

## 🆘 Common Issues & Fixes

### Audio not playing
```typescript
// Check AudioContext state
if (audioContext.state === 'suspended') {
  audioContext.resume();
}
// Ensure user interaction before starting
```

### Database connection errors
```bash
# Check MongoDB Atlas connection
# 1. Verify connection string in .env
# 2. Check IP whitelist in Atlas dashboard
# 3. Test connection: mongosh "your-connection-string"

# Backend logs
docker logs pulseplay-backend
```

### Auth0 authentication errors
```typescript
// Check Auth0 configuration
console.log('Auth0 Domain:', import.meta.env.VITE_AUTH0_DOMAIN);
console.log('Client ID:', import.meta.env.VITE_AUTH0_CLIENT_ID);

// Verify callback URLs in Auth0 dashboard
// Should include: http://localhost:5173, https://yourdomain.com
```

### API request failures
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check Auth0 token
const token = localStorage.getItem('auth0_token');
console.log('Token exists:', !!token);

# Test API with token
curl -H "Authorization: Bearer $token" http://localhost:3001/api/user/profile
```

### TypeScript errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check specific file
npx tsc --noEmit src/file.tsx
```

### Docker build fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check build logs
docker-compose build --progress=plain
```

---

**Last Updated**: October 18, 2025
