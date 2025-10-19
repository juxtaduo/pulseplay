# PulsePlay AI - Deployment Guide

**Version**: 2.0.0  
**Last Updated**: October 18, 2025  
**Environment**: Production

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Auth0 Configuration](#auth0-configuration)
5. [Gemini API Setup](#gemini-api-setup)
6. [Frontend Deployment (Vercel/Netlify)](#frontend-deployment)
7. [Backend Deployment (Railway/Render)](#backend-deployment)
8. [Environment Variables](#environment-variables)
9. [Post-Deployment Checklist](#post-deployment-checklist)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- [ ] [Auth0](https://auth0.com/) (Free tier: 7,000 MAU)
- [ ] [Google AI Studio](https://makersuite.google.com/app/apikey) (Gemini API key)
- [ ] [Vercel](https://vercel.com/) OR [Netlify](https://www.netlify.com/) (Frontend hosting)
- [ ] [Railway](https://railway.app/) OR [Render](https://render.com/) (Backend hosting)
- [ ] [GitHub](https://github.com/) (Source code repository)

### Development Environment

- Node.js 18+ installed
- Git installed
- Terminal/Command Line access

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/retiarylime/pulseplay-ai.git
cd pulseplay-ai
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Create Environment Files

```bash
# Root .env (frontend)
cp .env.example .env

# Backend .env
cp backend/.env.example backend/.env
```

---

## MongoDB Atlas Setup

### Step 1: Create a Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Build a Database"**
4. Select **M0 Free Tier** (512MB storage, shared RAM)
5. Choose a cloud provider (AWS recommended) and region (closest to your backend)
6. Cluster Name: `pulseplay-cluster` (or your choice)
7. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `pulseplay_admin` (or your choice)
5. **Password**: Generate a strong password (save it securely!)
6. **Database User Privileges**: Select **"Atlas admin"**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IP addresses of your hosting provider
5. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. **Driver**: Node.js, **Version**: 5.5 or later
5. Copy the connection string:

```
mongodb+srv://pulseplay_admin:<password>@pulseplay-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<password>` with your actual password
7. Add database name before `?`: `...mongodb.net/pulseplay?retryWrites=true...`

### Step 5: Create Database and Collections

MongoDB will auto-create collections on first write, but you can pre-create them:

1. Go to **Collections**
2. Click **"Create Database"**
3. **Database Name**: `pulseplay`
4. **Collection Name**: `focussessions`
5. Add more collections: `aimoodrecommendations`, `userpreferences`

### Step 6: Set Up TTL Index (Auto-Delete Old Sessions)

1. Go to **Collections** → `focussessions`
2. Click **"Indexes"**
3. Click **"Create Index"**
4. **Field**: `createdAt`
5. **Type**: Select **"TTL"**
6. **Expire After**: `7776000` seconds (90 days)
7. Click **"Review"** → **"Confirm"**

---

## Auth0 Configuration

### Step 1: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Sign up or log in
3. Go to **Applications** → **Create Application**
4. **Name**: `PulsePlay AI`
5. **Application Type**: **Single Page Application (SPA)**
6. Click **"Create"**

### Step 2: Configure Application Settings

1. Go to **Settings** tab
2. **Application URIs**:
   - **Allowed Callback URLs**:
     ```
     http://localhost:5174, https://your-frontend-domain.vercel.app
     ```
   - **Allowed Logout URLs**:
     ```
     http://localhost:5174, https://your-frontend-domain.vercel.app
     ```
   - **Allowed Web Origins**:
     ```
     http://localhost:5174, https://your-frontend-domain.vercel.app
     ```
3. **Cross-Origin Authentication**: Enabled
4. **Refresh Token Rotation**: Enabled
5. **Refresh Token Expiration**: 30 days
6. Click **"Save Changes"**

### Step 3: Create API

1. Go to **APIs** → **Create API**
2. **Name**: `PulsePlay AI Backend`
3. **Identifier**: `https://api.pulseplay.ai` (your backend URL)
4. **Signing Algorithm**: **RS256**
5. Click **"Create"**

### Step 4: Enable Social Logins (Optional)

1. Go to **Authentication** → **Social**
2. Enable **Google**, **GitHub**, or other providers
3. Configure OAuth credentials for each provider

### Step 5: Copy Credentials

From **Applications** → **PulsePlay AI** → **Settings**:

- **Domain**: `your-tenant.auth0.com`
- **Client ID**: `abc123xyz...`

From **Applications** → **PulsePlay AI** → **Settings** → **Advanced** → **OAuth**:

- **Client Secret**: `secret123...` (for backend only)

---

## Gemini API Setup

### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Click **"Create API Key"**
5. Select a Google Cloud project or create a new one
6. Copy the API key (starts with `AI...`)

### Step 2: Test API Key

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

Expected response: JSON with generated text

### Step 3: Check Quota

- Free tier: 15 requests per minute, 1,500 requests per day
- Paid tier: 1,000 requests per minute

---

## Frontend Deployment

### Option A: Vercel (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
# From project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: pulseplay-ai
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
# - Framework: Vite
```

#### Step 3: Configure Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

```
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=https://your-backend.railway.app
```

5. Redeploy: `vercel --prod`

#### Step 4: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

### Option B: Netlify

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Build Project

```bash
npm run build
```

#### Step 3: Deploy

```bash
netlify deploy --prod

# Publish directory: dist
```

#### Step 4: Configure Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add same variables as Vercel (above)

---

## Backend Deployment

### Option A: Railway (Recommended)

#### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub

#### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account
4. Select `pulseplay-ai` repository

#### Step 3: Configure Build Settings

1. **Root Directory**: `backend`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Port**: Railway auto-detects from `process.env.PORT`

#### Step 4: Add Environment Variables

Go to project → **Variables** tab and add:

```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://pulseplay_admin:<password>@...
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
GEMINI_API_KEY=AI...
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Step 5: Deploy

Railway auto-deploys on every push to `main` branch.

---

### Option B: Render

#### Step 1: Create Render Account

1. Go to [Render](https://render.com/)
2. Sign up with GitHub

#### Step 2: Create New Web Service

1. Click **"New"** → **"Web Service"**
2. Connect GitHub repository
3. Select `pulseplay-ai`

#### Step 3: Configure Service

- **Name**: `pulseplay-backend`
- **Root Directory**: `backend`
- **Environment**: **Node**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: **Free** (spins down after inactivity)

#### Step 4: Add Environment Variables

Same as Railway (above).

---

## Environment Variables

### Frontend (.env)

```bash
# Auth0
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai

# Backend API
VITE_API_URL=https://your-backend.railway.app
```

### Backend (backend/.env)

```bash
# Server
NODE_ENV=production
PORT=3001

# MongoDB
MONGODB_URI=mongodb+srv://pulseplay_admin:<password>@pulseplay-cluster.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com

# Gemini API
GEMINI_API_KEY=AI...

# CORS
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## Post-Deployment Checklist

### Frontend

- [ ] Site loads without errors
- [ ] Auth0 login/logout works
- [ ] Audio plays when session starts
- [ ] Waveform visualizer animates
- [ ] Keyboard shortcuts work (if implemented)
- [ ] Responsive design works on mobile
- [ ] Browser compatibility warning shows for old browsers

### Backend

- [ ] Health check endpoint responds: `GET https://your-backend/health`
- [ ] Session creation works: `POST /api/sessions`
- [ ] AI recommendation works: `POST /api/ai/mood-recommendation`
- [ ] Session history loads: `GET /api/sessions/history`
- [ ] Data export works: `GET /api/sessions/export`
- [ ] Rate limiting triggers correctly (test with >100 requests)

### Database

- [ ] MongoDB connection successful (check backend logs)
- [ ] Sessions save correctly
- [ ] TTL index auto-deletes old sessions after 90 days
- [ ] No PII stored (verify with sample document)

### Security

- [ ] HTTPS enabled on all endpoints
- [ ] JWT validation working (test with invalid token)
- [ ] Rate limiting active
- [ ] CORS configured correctly
- [ ] Environment variables not exposed in client code

---

## Monitoring & Maintenance

### Logging

**Frontend** (Browser Console):
- Web Audio API errors
- Network request failures
- React component errors (caught by ErrorBoundary)

**Backend** (Production Logs):
- Pino structured JSON logs
- View logs: `railway logs` or Render dashboard

### Performance Monitoring

1. **Frontend**:
   - [Vercel Analytics](https://vercel.com/analytics) (free)
   - Chrome DevTools Performance tab

2. **Backend**:
   - Railway Metrics (CPU, Memory, Network)
   - MongoDB Atlas Performance Advisor

### Error Tracking (Optional)

Consider integrating:
- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay

---

## Troubleshooting

### Frontend Issues

#### "Cannot connect to server"
- Check `VITE_API_URL` environment variable
- Verify backend is deployed and running
- Check CORS configuration in backend

#### "Auth0 login doesn't work"
- Verify callback URLs in Auth0 dashboard
- Check `VITE_AUTH0_CLIENT_ID` and `VITE_AUTH0_DOMAIN`
- Ensure frontend domain is in Auth0 allowed origins

#### "No sound plays"
- Check browser compatibility (Web Audio API support)
- Verify user clicked start button (autoplay policy)
- Open browser console for errors

### Backend Issues

#### "MongoDB connection failed"
- Verify `MONGODB_URI` is correct (including password)
- Check MongoDB Atlas network access (IP whitelist)
- Ensure database user has correct permissions

#### "401 Unauthorized"
- Verify JWT token in request header
- Check Auth0 audience matches API identifier
- Ensure backend has correct `AUTH0_DOMAIN`

#### "429 Too Many Requests"
- Rate limit triggered (100 req/15min)
- Wait or increase limits in backend config

#### "Gemini API error"
- Check API key is valid: `GEMINI_API_KEY`
- Verify quota not exceeded (15 req/min free tier)
- Check API endpoint URL

---

## Scaling Considerations

### When to Upgrade

**MongoDB Atlas**:
- M0 Free → M10 Shared when you hit 512MB storage
- M10 → M20 Dedicated when you need >100 concurrent connections

**Auth0**:
- Free → Essentials when you exceed 7,000 MAUs

**Hosting**:
- Vercel/Netlify: Free tier sufficient for most use cases
- Railway/Render: Free → Hobby ($5/month) when you need always-on (no spin-down)

**Gemini API**:
- Free → Pay-as-you-go when you exceed 1,500 requests/day

---

## Support

- **Issues**: [GitHub Issues](https://github.com/retiarylime/pulseplay-ai/issues)
- **Documentation**: [README.md](../README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## License

MIT License - see [LICENSE](../LICENSE) file for details
