# Vercel Deployment with MongoDB Atlas

This guide explains how to deploy PulsePlay using Vercel with MongoDB Atlas for the backend and Vercel's frontend hosting.

## 📋 Overview

Vercel provides a serverless deployment platform that can host both your frontend React application and backend API routes as serverless functions. This approach eliminates the need for traditional server management while providing excellent performance and scalability.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   MongoDB      │
│   (React App)   │───▶│ (Serverless)    │───▶│   Atlas        │
│                 │    │                 │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      ▲                        ▲                        ▲
      │                        │                        │
   Vercel Hosting        Vercel Functions         Cloud Database
```

## ⚙️ Prerequisites

### Accounts and Services

1. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub account for automatic deployments

2. **MongoDB Atlas Account**
   - Set up a cluster (see `MONGODB_ATLAS_SETUP.md`)
   - Get your connection string

3. **Auth0 Account**
   - Configure your Auth0 application
   - Get domain, client ID, and client secret

4. **Google Gemini AI API Key**
   - Get your API key from Google AI Studio

### Project Setup

Ensure your project has the correct structure:

```
pulseplay/
├── src/                    # Frontend React app
├── api/                    # Vercel serverless functions (to be created)
├── backend/src/           # Existing backend code
├── vercel.json           # Vercel configuration (to be created)
├── package.json          # Root package.json
└── backend/package.json  # Backend dependencies
```

## 🚀 Deployment Steps

### Step 1: Prepare the Backend for Vercel

Vercel requires API routes to be in an `api/` directory at the root level. We'll convert your Express routes to Vercel serverless functions.

#### Create API Directory Structure

```bash
# Create api directory in project root
mkdir -p api/sessions api/ai

# Copy and adapt route handlers
cp backend/src/routes/sessions.ts api/sessions/index.ts
cp backend/src/routes/ai.ts api/ai/index.ts
```

#### Adapt Route Handlers for Vercel

**api/sessions/index.ts** (adapted from backend/src/routes/sessions.ts):

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkJwt, getUserIdFromToken } from '../../backend/src/config/auth0.js';
import {
  createSession,
  getSessionById,
  getSessionsByUser,
  updateSession,
  deleteSession,
} from '../../backend/src/services/sessionService.js';
import { hashSHA256 } from '../../backend/src/utils/crypto.js';
import { logger } from '../../backend/src/config/logger.js';
import type { Song, SessionState } from '../../backend/src/types/index.js';

// Vercel serverless function export
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database (Vercel serverless functions need to connect each time)
    const { connectDatabase } = await import('../../backend/src/config/database.js');
    await connectDatabase();

    switch (req.method) {
      case 'GET':
        return await handleGetSessions(req, res);
      case 'POST':
        return await handleCreateSession(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'api_error');
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetSessions(req: VercelRequest, res: VercelResponse) {
  try {
    await checkJwt(req, res); // This will throw if not authenticated
    const userId = getUserIdFromToken(req);
    const userIdHash = hashSHA256(userId);
    const limit = Number.parseInt(req.query.limit as string, 10) || 10;

    const sessions = await getSessionsByUser(userIdHash, limit);

    return res.json({
      sessions: sessions.map((s) => s.toJSON()),
      count: sessions.length,
    });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

async function handleCreateSession(req: VercelRequest, res: VercelResponse) {
  try {
    await checkJwt(req, res);
    const userId = getUserIdFromToken(req);
    const userIdHash = hashSHA256(userId);
    const { song } = req.body as { song: Song };

    const validSongs: Song[] = ['thousand-years', 'kiss-the-rain', 'river-flows', 'gurenge'];
    if (!song || !validSongs.includes(song)) {
      return res.status(400).json({
        error: 'Invalid song',
        message: `Song must be one of: ${validSongs.join(', ')}`,
      });
    }

    const session = await createSession({ userIdHash, song });

    return res.status(201).json({ session: session.toJSON() });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
```

**api/ai/index.ts** (adapted from backend/src/routes/ai.ts):

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkJwt, getUserIdFromToken } from '../../backend/src/config/auth0.js';
import { getMoodAnalysis } from '../../backend/src/services/aiService.js';
import { logger } from '../../backend/src/config/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    const { connectDatabase } = await import('../../backend/src/config/database.js');
    await connectDatabase();

    await checkJwt(req, res);
    const userId = getUserIdFromToken(req);
    const { rhythmData } = req.body;

    if (!rhythmData) {
      return res.status(400).json({ error: 'Rhythm data is required' });
    }

    const analysis = await getMoodAnalysis(rhythmData);

    return res.json({ analysis });
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'ai_analysis_error');
    return res.status(500).json({ error: 'Failed to analyze mood' });
  }
}
```

#### Create Health Check Endpoint

**api/health.ts**:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    const { connectDatabase } = await import('../backend/src/config/database.js');
    await connectDatabase();

    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'pulseplay-backend',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'pulseplay-backend',
      error: 'Database connection failed'
    });
  }
}
```

### Step 2: Create Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 3: Update Package.json

Update your root `package.json` to include Vercel build scripts and dependencies:

```json
{
  "name": "pulseplay",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "npm run build",
    "lint": "biome check .",
    "lint:fix": "biome check --write ."
  },
  "dependencies": {
    // ... your existing frontend dependencies
  },
  "devDependencies": {
    "@vercel/node": "^3.0.0",
    // ... your existing dev dependencies
  }
}
```

### Step 4: Configure Environment Variables

#### In Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

**Production Environment Variables:**
```bash
# MongoDB Atlas
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay

# Auth0
AUTH0_DOMAIN=your-app.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-app.auth0.com

# AI Service
GEMINI_API_KEY=your_gemini_api_key

# Frontend
VITE_AUTH0_DOMAIN=your-app.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=https://your-app.vercel.app/api
FRONTEND_URL=https://your-app.vercel.app
```

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add MONGODB_ATLAS_URI
vercel env add AUTH0_DOMAIN
vercel env add AUTH0_CLIENT_ID
vercel env add AUTH0_CLIENT_SECRET
vercel env add GEMINI_API_KEY
vercel env add VITE_AUTH0_DOMAIN
vercel env add VITE_AUTH0_CLIENT_ID
vercel env add VITE_AUTH0_AUDIENCE
vercel env add VITE_API_URL
vercel env add FRONTEND_URL
```

### Step 5: Deploy to Vercel

#### Option A: Automatic Deployment (Recommended)

1. **Connect Repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect your settings

2. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Deploy:**
   - Push to your main branch
   - Vercel will automatically build and deploy

#### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login and initialize
vercel login
vercel

# Follow the prompts to configure your project
# Then deploy
vercel --prod
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues

**Problem:** MongoDB connection fails
```javascript
// Check your connection string format
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay?retryWrites=true&w=majority
```

**Solution:** Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` for Vercel deployments.

#### CORS Issues

**Problem:** Frontend can't connect to API
```javascript
// Ensure CORS headers are set in all API functions
res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

#### Cold Start Issues

**Problem:** First API call is slow
```json
// This is normal for serverless functions
// Vercel will keep functions warm for frequently used routes
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Environment Variables Not Working

**Problem:** Environment variables are undefined
```bash
# Check variable names (case-sensitive)
# Ensure variables are set in Vercel dashboard
# Redeploy after adding new variables
vercel --prod
```

### Vercel-Specific Limitations

1. **Execution Time Limit:** 30 seconds for serverless functions
2. **Memory Limit:** 1024 MB per function
3. **Cold Starts:** First request may be slower
4. **No Persistent File System:** Can't store files between requests

## 📊 Monitoring and Logs

### Vercel Analytics

- View function execution times
- Monitor error rates
- Track bandwidth usage
- Analyze user traffic

### Application Logs

```bash
# View logs in Vercel dashboard
# Go to your project → Functions tab
# Click on a function to see its logs

# Or use Vercel CLI
vercel logs
```

### Health Monitoring

```bash
# Test your deployed API
curl https://your-app.vercel.app/api/health

# Should return:
{
  "status": "ok",
  "timestamp": "2025-01-25T...",
  "service": "pulseplay-backend",
  "environment": "production"
}
```

## 🔄 Updates and Redeployment

### Automatic Updates

- Push to your main branch
- Vercel automatically builds and deploys
- Preview deployments for pull requests

### Manual Redeployment

```bash
# Redeploy current production
vercel --prod

# Redeploy with specific commit
vercel --prod --commit sha123
```

## 💰 Cost Optimization

### Vercel Pricing

- **Hobby Plan:** Free for personal projects
- **Pro Plan:** $20/month for commercial use
- **Enterprise:** Custom pricing

### Cost Factors

- **Bandwidth:** Data transfer costs
- **Function Invocations:** Number of API calls
- **Build Minutes:** Time spent building
- **Serverless Function Duration:** Execution time

### Optimization Tips

1. **Enable Compression:**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "max-age=300" }
      ]
    }
  ]
}
```

2. **Use Appropriate Function Sizes:**
```json
{
  "functions": {
    "api/health.ts": { "runtime": "nodejs18.x", "maxDuration": 10 },
    "api/sessions/index.ts": { "runtime": "nodejs18.x", "maxDuration": 30 }
  }
}
```

## 🎯 Best Practices

### Development Workflow

1. **Local Development:** Use `npm run dev`
2. **Testing:** Test API routes locally first
3. **Staging:** Use Vercel preview deployments for PRs
4. **Production:** Automatic deployment from main branch

### Security Considerations

- **Environment Variables:** Never commit secrets to code
- **CORS Policy:** Restrict origins to your domain
- **Rate Limiting:** Implement in your serverless functions
- **Input Validation:** Validate all user inputs

### Performance Optimization

- **Database Indexing:** Ensure MongoDB indexes are optimized
- **Caching:** Use Vercel's edge network for static assets
- **Bundle Splitting:** Optimize your frontend build
- **Lazy Loading:** Load components as needed

## 📞 Support

### Vercel Resources

- **Documentation:** https://vercel.com/docs
- **Serverless Functions:** https://vercel.com/docs/functions
- **Environment Variables:** https://vercel.com/docs/environment-variables

### MongoDB Atlas Resources

- **Connection Guide:** See `MONGODB_ATLAS_SETUP.md`
- **Performance:** https://docs.mongodb.com/atlas/performance/
- **Security:** https://docs.mongodb.com/atlas/security/

### PulsePlay Resources

- **API Reference:** `docs/developer/API_REFERENCE.md`
- **Architecture:** `docs/developer/ARCHITECTURE.md`
- **Deployment Options:** `docs/docker/DOCKER_DEPLOYMENT.md`

## 📄 Related Documentation

- `MONGODB_ATLAS_SETUP.md` - MongoDB Atlas configuration
- `MONGODB_ATLAS_QUICK_START.md` - Quick MongoDB setup
- `DOCKER_DEPLOYMENT.md` - Alternative Docker deployment
- `DOCKER_GITHUB_ACTIONS_DEPLOYMENT.md` - Docker with CI/CD

---

**Last Updated**: October 25, 2025
**Deployment Method**: Vercel Serverless
**Database**: MongoDB Atlas
**Status**: ✅ Ready for Deployment</content>
<parameter name="filePath">/home/rl/.github/pulseplay/docs/vercel/VERCEL_DEPLOYMENT.md