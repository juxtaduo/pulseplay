# Developer Guide - PulsePlay AI

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

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/pulseplay-ai.git
   cd pulseplay-ai
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your values
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Supabase Setup**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   
   # Deploy edge function
   supabase functions deploy generate-mood
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:5173 in your browser

---

## Project Architecture

### Directory Structure Explained

```
pulseplay-ai/
│
├── src/
│   ├── components/          # React UI components
│   │   ├── AuthButton.tsx        # Self-contained auth UI
│   │   ├── ControlPanel.tsx      # Audio control interface
│   │   ├── MoodInsights.tsx      # AI insights display
│   │   ├── RhythmVisualizer.tsx  # Canvas visualizer
│   │   └── SessionStats.tsx      # Metrics dashboard
│   │
│   ├── hooks/               # Custom React hooks (business logic)
│   │   ├── useAudioEngine.ts         # Web Audio API wrapper
│   │   ├── useRhythmDetection.ts     # Activity tracking
│   │   └── useSessionPersistence.ts  # DB sync
│   │
│   ├── services/            # External API clients
│   │   └── moodService.ts        # Edge function client
│   │
│   ├── lib/                 # Shared utilities
│   │   └── supabase.ts          # Supabase client + types
│   │
│   ├── App.tsx              # Main app (orchestrator)
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type definitions
│
├── supabase/
│   ├── functions/           # Edge functions (serverless)
│   │   └── generate-mood/
│   │       └── index.ts
│   │
│   └── migrations/          # Database migrations (SQL)
│       └── *.sql
│
├── public/                  # Static assets
├── node_modules/            # Dependencies (gitignored)
├── dist/                    # Production build (gitignored)
│
├── .env                     # Environment variables (gitignored)
├── .gitignore
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── README.md
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
│  - moodService, supabase client             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         External Services                   │
│  - Supabase (Auth, DB, Functions)           │
│  - Web Audio API                            │
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
    │           ├─→ MoodInsights (AI analysis)
    │           └─→ useSessionPersistence (save)
    │
    └─→ UI Controls
        └─→ ControlPanel
            ├─→ useAudioEngine (play/stop/mood)
            └─→ App state updates
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
const { data: { session } } = await supabase.auth.getSession();
console.log('User:', session?.user);

// Check RLS policies in Supabase dashboard
// Verify user has permission to access table

// Log errors
const { data, error } = await supabase.from('table').select();
if (error) {
  console.error('DB Error:', error.message, error.details);
}
```

#### 3. Edge Function Errors
```typescript
// Check logs in Supabase dashboard
// Functions → generate-mood → Logs

// Test locally
supabase functions serve generate-mood

// Make request with curl
curl -X POST http://localhost:54321/functions/v1/generate-mood \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"rhythmScore": 50, "bpm": 100, "intensity": "medium", "keystrokeCount": 100}'
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

### Adding a Database Table

1. **Create Migration File**
   ```bash
   # Create new migration
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_table.sql
   ```

2. **Write Migration SQL**
   ```sql
   -- supabase/migrations/*_add_new_table.sql
   CREATE TABLE IF NOT EXISTS new_table (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     field1 text NOT NULL,
     field2 integer DEFAULT 0,
     created_at timestamptz DEFAULT now()
   );
   
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own records"
     ON new_table FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);
   ```

3. **Apply Migration**
   ```bash
   supabase db push
   ```

4. **Add TypeScript Types**
   ```typescript
   // src/lib/supabase.ts
   export interface NewTable {
     id: string;
     user_id: string;
     field1: string;
     field2: number;
     created_at: string;
   }
   ```

### Adding a New Edge Function

1. **Create Function**
   ```bash
   supabase functions new my-function
   ```

2. **Implement Function**
   ```typescript
   // supabase/functions/my-function/index.ts
   import "jsr:@supabase/functions-js/edge-runtime.d.ts";
   
   const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Headers": "Content-Type, Authorization",
   };
   
   Deno.serve(async (req: Request) => {
     if (req.method === "OPTIONS") {
       return new Response(null, { status: 200, headers: corsHeaders });
     }
     
     try {
       const body = await req.json();
       
       // Your logic here
       const result = { success: true };
       
       return new Response(JSON.stringify(result), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: corsHeaders }
       );
     }
   });
   ```

3. **Deploy Function**
   ```bash
   supabase functions deploy my-function
   ```

4. **Test Function**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/my-function \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
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

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables in Vercel**:
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

#### Option 3: Custom Server

```bash
# Build
npm run build

# Copy dist/ to your server
scp -r dist/* user@server:/var/www/html/

# Configure nginx/apache to serve static files
```

### Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase migrations applied
- [ ] Edge functions deployed
- [ ] TypeScript errors resolved
- [ ] Build completes successfully
- [ ] Test in production-like environment
- [ ] Check browser console for errors
- [ ] Verify authentication works
- [ ] Test audio playback
- [ ] Verify database operations

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
- Verify Supabase URL and key
- Check Supabase project is active
- Verify RLS policies are set up
- Check CORS settings in Supabase

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
