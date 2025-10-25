# PulsePlay - Deployment Guide

**Version**: 2.0.0  
**Last Updated**: October 18, 2025  
**Environment**: Production

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Docker Deployment (Recommended)](#docker-deployment-recommended)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Setup](#environment-setup)
6. [MongoDB Atlas Setup](#mongodb-atlas-setup)
7. [Auth0 Configuration](#auth0-configuration)
8. [Gemini API Setup](#gemini-api-setup)
9. [Environment Variables](#environment-variables)
10. [Post-Deployment Checklist](#post-deployment-checklist)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- [ ] [Auth0](https://auth0.com/) (Free tier: 7,000 MAU)
- [ ] [Google AI Studio](https://makersuite.google.com/app/apikey) (Gemini API key)
- [ ] [GitHub](https://github.com/) (Source code repository)
- [ ] Docker & Docker Compose (for containerized deployment)

### Development Environment

- Node.js 18+ installed
- Git installed
- Terminal/Command Line access
- Docker Desktop (optional, for local development)

---

## Deployment Options

PulsePlay supports multiple deployment strategies:

### 🐳 Docker Deployment (Recommended)
- **Best for**: Full control, consistent environments, easy scaling
- **Pros**: Containerized, reproducible, works locally and in production
- **Cons**: Requires Docker knowledge, higher resource usage
- **Use case**: Production deployment, development teams

### ☁️ Cloud Deployment
- **Best for**: Quick setup, managed services, cost-effective for small projects
- **Pros**: No server management, auto-scaling, integrated monitoring
- **Cons**: Vendor lock-in, less control over infrastructure
- **Use case**: Prototyping, small production workloads

---

## Docker Deployment (Recommended)

### Overview

PulsePlay uses a multi-container architecture with separate frontend and backend services:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Nginx         │◄──────────────►│   Express.js    │
│   Frontend      │                 │   Backend       │
│   (Port 80)     │                 │   (Port 3001)   │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
┌─────────────────┐                 ┌─────────────────┐
│   Browser       │                 │   MongoDB       │
│   Clients       │                 │   Atlas         │
└─────────────────┘                 └─────────────────┘
```

### Quick Start with Docker

#### Option 1: Production with MongoDB Atlas

```bash
# Clone repository
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay

# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit environment variables (see Environment Variables section)
nano .env
nano backend/.env

# Deploy with Atlas (production)
docker-compose -f docker-compose.atlas.yml up -d
```

#### Option 2: Local Development

```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up

# Or start production build locally
docker-compose up
```

#### Option 3: GitHub Actions CI/CD

The project includes automated deployment via GitHub Actions:

1. Push to `main` branch
2. GitHub Actions builds Docker images
3. Images are pushed to GitHub Container Registry
4. Deployment happens automatically

### Docker Architecture

#### Services

**Frontend Service** (`nginx:alpine`)
- Serves static React build files
- Handles client-side routing
- Provides gzip compression
- SSL termination (if configured)

**Backend Service** (`node:18-alpine`)
- Express.js API server
- Auth0 JWT validation
- MongoDB integration
- Gemini AI processing

**Database** (MongoDB Atlas)
- Cloud-hosted MongoDB
- Automatic scaling
- Built-in backup and monitoring

#### Docker Files

- `Dockerfile`: Multi-stage production build
- `Dockerfile.dev`: Development with hot reload
- `docker-compose.yml`: Local MongoDB setup
- `docker-compose.atlas.yml`: Production with Atlas
- `docker-compose.dev.yml`: Development environment
- `nginx.conf`: Web server configuration

### Docker Commands

```bash
# View running containers
docker-compose -f docker-compose.atlas.yml ps

# View logs
docker-compose -f docker-compose.atlas.yml logs -f

# Stop services
docker-compose -f docker-compose.atlas.yml down

# Rebuild and restart
docker-compose -f docker-compose.atlas.yml up -d --build

# Clean up
docker system prune -a
```

### Production Deployment

#### 1. Server Requirements

- **OS**: Linux (Ubuntu 20.04+ recommended)
- **RAM**: 1GB minimum, 2GB recommended
- **CPU**: 1 vCPU minimum, 2 vCPU recommended
- **Storage**: 5GB available space
- **Network**: Public IP with ports 80/443 open

#### 2. Security Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (optional)
sudo usermod -aG docker $USER

# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 3. SSL Configuration (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf to use SSL
# Add SSL configuration to nginx.conf
```

#### 4. Process Management

```bash
# Install PM2 for process monitoring
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'pulseplay',
    script: 'docker-compose.atlas.yml',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
```

---

## Cloud Deployment

### Frontend Options

#### Vercel (Recommended)

1. **Install Vercel CLI**: `npm install -g vercel`
2. **Deploy**: `vercel`
3. **Configure environment variables** in Vercel dashboard
4. **Custom domain**: Add in Vercel settings

#### Netlify

1. **Install CLI**: `npm install -g netlify-cli`
2. **Build**: `npm run build`
3. **Deploy**: `netlify deploy --prod --dir=dist`
4. **Environment variables**: Configure in Netlify dashboard

### Backend Options

#### Railway (Recommended)

1. **Connect GitHub repo** in Railway dashboard
2. **Set root directory**: `backend`
3. **Configure build/start commands**
4. **Add environment variables**
5. **Auto-deploys on push to main**

#### Render

1. **Create web service** from GitHub repo
2. **Set root directory**: `backend`
3. **Configure Node environment**
4. **Add environment variables**
5. **Free tier**: Spins down after inactivity

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay
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
4. **Name**: `PulsePlay`
5. **Application Type**: **Single Page Application (SPA)**
6. Click **"Create"**

### Step 2: Configure Application Settings

1. Go to **Settings** tab
2. **Application URIs**:
   - **Allowed Callback URLs**:
     ```
     http://localhost:5173, https://your-frontend-domain.com
     ```
   - **Allowed Logout URLs**:
     ```
     http://localhost:5173, https://your-frontend-domain.com
     ```
   - **Allowed Web Origins**:
     ```
     http://localhost:5173, https://your-frontend-domain.com
     ```
3. **Cross-Origin Authentication**: Enabled
4. **Refresh Token Rotation**: Enabled
5. **Refresh Token Expiration**: 30 days
6. Click **"Save Changes"**

### Step 3: Create API

1. Go to **APIs** → **Create API**
2. **Name**: `PulsePlay Backend`
3. **Identifier**: `https://api.pulseplay.ai` (your backend URL)
4. **Signing Algorithm**: **RS256**
5. Click **"Create"**

### Step 4: Enable Social Logins (Optional)

1. Go to **Authentication** → **Social**
2. Enable **Google**, **GitHub**, or other providers
3. Configure OAuth credentials for each provider

### Step 5: Copy Credentials

From **Applications** → **PulsePlay** → **Settings**:

- **Domain**: `your-tenant.auth0.com`
- **Client ID**: `abc123xyz...`

From **Applications** → **PulsePlay** → **Settings** → **Advanced** → **OAuth**:

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

## Environment Variables

### Frontend (.env)

```bash
# Auth0
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai

# Backend API
VITE_API_URL=http://localhost:3001

# Optional
VITE_DEBUG=true
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
FRONTEND_URL=http://localhost:5173
```

### Docker Environment Variables

For Docker deployments, create a `.env` file in the project root:

```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://pulseplay_admin:<password>@pulseplay-cluster.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com

# Gemini API
GEMINI_API_KEY=AI...

# Frontend
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=http://localhost:3001
```

---

## Post-Deployment Checklist

### Docker Deployment

- [ ] Docker and docker-compose installed
- [ ] Environment variables configured
- [ ] MongoDB Atlas accessible
- [ ] Auth0 application configured
- [ ] Gemini API key valid
- [ ] Containers start without errors: `docker-compose -f docker-compose.atlas.yml up -d`
- [ ] Frontend accessible on port 80
- [ ] Backend health check: `curl http://localhost/api/health`
- [ ] Database connection successful (check logs)

### Frontend

- [ ] Site loads without errors
- [ ] Auth0 login/logout works
- [ ] Audio plays when session starts
- [ ] Waveform visualizer animates
- [ ] Keyboard shortcuts work (if implemented)
- [ ] Responsive design works on mobile
- [ ] Browser compatibility warning shows for old browsers

### Backend

- [ ] Health check endpoint responds: `GET /api/health`
- [ ] Session creation works: `POST /api/sessions`
- [ ] AI recommendation works: `POST /api/ai/mood-analysis`
- [ ] Session history loads: `GET /api/sessions`
- [ ] Auth0 JWT validation working
- [ ] Rate limiting active

### Database

- [ ] MongoDB connection successful (check backend logs)
- [ ] Sessions save correctly
- [ ] TTL index auto-deletes old sessions after 90 days
- [ ] No PII stored (verify with sample document)

### Security

- [ ] HTTPS enabled on all endpoints
- [ ] JWT validation working (test with invalid token)
- [ ] Rate limiting triggers correctly (test with >100 requests)
- [ ] CORS configured correctly
- [ ] Environment variables not exposed in client code

---

## Monitoring & Maintenance

### Docker Monitoring

```bash
# View container resource usage
docker stats

# View logs
docker-compose -f docker-compose.atlas.yml logs -f backend

# Check container health
docker ps

# Restart services
docker-compose -f docker-compose.atlas.yml restart
```

### Logging

**Frontend** (Browser Console):
- Web Audio API errors
- Network request failures
- React component errors (caught by ErrorBoundary)

**Backend** (Container Logs):
- Pino structured JSON logs
- View logs: `docker-compose logs -f backend`

### Performance Monitoring

1. **Docker**:
   - Container resource usage: `docker stats`
   - Application logs for performance metrics

2. **Database**:
   - MongoDB Atlas Performance Advisor
   - Query performance monitoring

3. **External Services**:
   - Auth0 tenant logs
   - Gemini API usage dashboard

### Error Tracking (Optional)

Consider integrating:
- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay

---

## Troubleshooting

### Docker Issues

#### "Permission denied" when running Docker
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again, or run:
newgrp docker
```

#### "Port already in use"
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :3001

# Kill process or change ports in docker-compose.yml
```

#### "No space left on device"
```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

#### Containers won't start
```bash
# Check logs
docker-compose -f docker-compose.atlas.yml logs

# Rebuild images
docker-compose -f docker-compose.atlas.yml up -d --build
```

### Frontend Issues

#### "Cannot connect to server"
- Check `VITE_API_URL` environment variable
- Verify backend container is running: `docker ps`
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

### Docker Scaling

```bash
# Scale backend services
docker-compose -f docker-compose.atlas.yml up -d --scale backend=3

# Use Docker Swarm for orchestration
docker swarm init
docker stack deploy -c docker-compose.atlas.yml pulseplay
```

### When to Upgrade

**MongoDB Atlas**:
- M0 Free → M10 Shared when you hit 512MB storage
- M10 → M20 Dedicated when you need >100 concurrent connections

**Auth0**:
- Free → Essentials when you exceed 7,000 MAUs

**Docker Hosting**:
- Single server → Docker Swarm when you need high availability
- Docker Swarm → Kubernetes for complex orchestration

**Gemini API**:
- Free → Pay-as-you-go when you exceed 1,500 requests/day

---

## Support

- **Issues**: [GitHub Issues](https://github.com/juxtaduo/pulseplay/issues)
- **Documentation**: [README.md](../README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## License

MIT License - see [LICENSE](../LICENSE) file for details

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
git clone https://github.com/juxtaduo/pulseplay.git
cd pulseplay
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
4. **Name**: `PulsePlay`
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
2. **Name**: `PulsePlay Backend`
3. **Identifier**: `https://api.pulseplay.ai` (your backend URL)
4. **Signing Algorithm**: **RS256**
5. Click **"Create"**

### Step 4: Enable Social Logins (Optional)

1. Go to **Authentication** → **Social**
2. Enable **Google**, **GitHub**, or other providers
3. Configure OAuth credentials for each provider

### Step 5: Copy Credentials

From **Applications** → **PulsePlay** → **Settings**:

- **Domain**: `your-tenant.auth0.com`
- **Client ID**: `abc123xyz...`

From **Applications** → **PulsePlay** → **Settings** → **Advanced** → **OAuth**:

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
# - Project name: pulseplay
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
4. Select `pulseplay` repository

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
3. Select `pulseplay`

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

- **Issues**: [GitHub Issues](https://github.com/juxtaduo/pulseplay/issues)
- **Documentation**: [README.md](../README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## License

MIT License - see [LICENSE](../LICENSE) file for details
