# Quick Reference Guide - PulsePlay AI

A cheat sheet for common tasks, commands, and code patterns.

---

## 🚀 Quick Start Commands

```bash
# Initial setup
npm install
cp .env.example .env
# Edit .env with your Supabase credentials

# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run typecheck        # Check TypeScript errors
npm run lint             # Run ESLint

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Supabase
supabase link            # Link to project
supabase db push         # Apply migrations
supabase functions deploy generate-mood
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
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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

## 🔌 Supabase Code Snippets

### Authentication

```typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign Out
const { error } = await supabase.auth.signOut();

// Get Session
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;

// Auth State Change
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log(event, session?.user);
  }
);
// Cleanup
subscription.unsubscribe();
```

### Database Operations

```typescript
// SELECT
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2')
  .eq('id', userId)
  .single();

// SELECT with filter
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);

// INSERT
const { data, error } = await supabase
  .from('table_name')
  .insert({
    column1: 'value1',
    column2: 'value2'
  })
  .select()
  .single();

// UPDATE
const { data, error } = await supabase
  .from('table_name')
  .update({ column1: 'new_value' })
  .eq('id', recordId);

// DELETE
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', recordId);

// Check for existing record
const { data, error } = await supabase
  .from('table_name')
  .select('id')
  .eq('user_id', userId)
  .maybeSingle();

if (!data) {
  // Record doesn't exist
}
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

// Check user session
const { data } = await supabase.auth.getSession();
console.log(data.session?.user);

// Test edge function
fetch('https://project.supabase.co/functions/v1/generate-mood', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
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

## 📝 SQL Snippets

### Create Table with RLS

```sql
CREATE TABLE my_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  field1 text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
  ON my_table FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON my_table FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_my_table_user_id ON my_table(user_id);
```

### Common Queries

```sql
-- Get user's records
SELECT * FROM table_name
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Count records
SELECT COUNT(*) FROM table_name
WHERE user_id = auth.uid();

-- Aggregate data
SELECT 
  DATE(created_at) as date,
  AVG(score) as avg_score,
  COUNT(*) as count
FROM focus_sessions
WHERE user_id = auth.uid()
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔧 Environment Setup

### .env Template

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

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
□ npm run build            # Build succeeds
□ Test production build    # npm run preview

# Supabase
□ Migrations applied       # supabase db push
□ Edge functions deployed  # supabase functions deploy
□ RLS policies enabled     # Check in dashboard

# Deployment Platform
□ Environment variables set
□ Build command: npm run build
□ Output directory: dist
□ Node version: 18+

# Post-deployment
□ Test auth flow
□ Test audio playback
□ Test database operations
□ Check browser console
□ Verify API calls work
```

---

## 📚 Useful Links

- **React Docs**: https://react.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **TailwindCSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide/

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

### Database RLS errors
```sql
-- Verify policies are set
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Check user is authenticated
SELECT auth.uid(); -- Should return user ID, not null
```

### TypeScript errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check specific file
npx tsc --noEmit src/file.tsx
```

### Build fails
```bash
# Clear cache
rm -rf dist .vite

# Rebuild
npm run build
```

---

**Last Updated**: October 18, 2025
