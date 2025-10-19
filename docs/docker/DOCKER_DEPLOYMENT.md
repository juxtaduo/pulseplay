# PulsePlay AI - Docker Deployment Guide

This guide will help you deploy PulsePlay AI using Docker containers.

## 📋 Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 2GB of available RAM
- Ports 3000, 5173, 27017, and 8081 available

## 🚀 Quick Start

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone https://github.com/retiarylime/pulseplay-ai.git
cd pulseplay-ai

# Copy the environment template
cp .env.docker.template .env

# Edit the .env file with your actual values
nano .env  # or use your preferred editor
```

### 2. Configure Environment Variables

Edit `.env` and set the following **required** variables:

```bash
# MongoDB credentials (change these!)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here

# Auth0 credentials (from https://manage.auth0.com/)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Gemini API Key (from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017
- **Mongo Express** (optional): http://localhost:8081

## 🏗️ Architecture

```
┌─────────────────┐
│   Nginx         │  Port 5173 (Frontend)
│   (Frontend)    │
└────────┬────────┘
         │
         │ /api/* → Backend
         ▼
┌─────────────────┐
│   Node.js       │  Port 3000 (Backend API)
│   (Backend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MongoDB       │  Port 27017
│   (Database)    │
└─────────────────┘
```

## 📦 Services

### Backend
- **Image**: Built from Dockerfile (Multi-stage build)
- **Port**: 3000
- **Health Check**: `/api/health` endpoint
- **Dependencies**: MongoDB

### Frontend
- **Image**: nginx:alpine
- **Port**: 5173 (mapped to port 80 in container)
- **Health Check**: Root endpoint
- **Dependencies**: Backend

### MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Volumes**: 
  - `mongodb_data` - Database files
  - `mongodb_config` - Configuration files

### Mongo Express (Optional)
- **Image**: mongo-express:latest
- **Port**: 8081
- **Purpose**: Database administration UI
- **Activation**: Use profile `docker-compose --profile debug up -d`

## 🔧 Common Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start with Mongo Express
docker-compose --profile debug up -d

# Start specific service
docker-compose up -d backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data!)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Container
```bash
# Access backend container shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Run npm command in backend
docker-compose exec backend npm run lint
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Test backend API
curl http://localhost:3000/api/health

# Test frontend
curl http://localhost:5173
```

## 🔐 Security Best Practices

### Production Deployment

1. **Use Strong Passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

2. **Use Docker Secrets** (Docker Swarm)
   ```bash
   echo "my_secret_password" | docker secret create mongo_password -
   ```

3. **Enable HTTPS**
   - Use a reverse proxy (Traefik, Nginx)
   - Obtain SSL certificates (Let's Encrypt)

4. **Network Isolation**
   ```yaml
   # In docker-compose.yml, use internal networks
   networks:
     pulseplay-network:
       internal: true  # No external access
   ```

5. **Read-Only Filesystems**
   ```yaml
   services:
     backend:
       read_only: true
       tmpfs:
         - /tmp
   ```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh -u admin -p
```

### Backend Won't Start
```bash
# Check environment variables
docker-compose exec backend env

# View backend logs
docker-compose logs --tail=50 backend

# Rebuild backend
docker-compose up -d --build backend
```

### Frontend Shows 404
```bash
# Check if frontend volume has files
docker-compose exec frontend ls -la /usr/share/nginx/html

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Port Already in Use
```bash
# Change ports in .env file
BACKEND_PORT=3001
FRONTEND_PORT=8080

# Or find process using the port
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows
```

## 📊 Monitoring

### Resource Usage
```bash
# View resource usage
docker stats

# Check disk usage
docker system df
```

### Database Backup
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /tmp/backup

# Copy backup to host
docker cp pulseplay-mongodb:/tmp/backup ./mongodb_backup
```

### Database Restore
```bash
# Copy backup to container
docker cp ./mongodb_backup pulseplay-mongodb:/tmp/backup

# Restore
docker-compose exec mongodb mongorestore /tmp/backup
```

## 🌐 Production Deployment Options

### 1. AWS ECS
```bash
# Install ECS CLI
brew install amazon-ecs-cli  # Mac

# Configure and deploy
ecs-cli compose up
```

### 2. Google Cloud Run
```bash
# Build and push image
docker build -t gcr.io/PROJECT_ID/pulseplay .
docker push gcr.io/PROJECT_ID/pulseplay

# Deploy
gcloud run deploy pulseplay --image gcr.io/PROJECT_ID/pulseplay
```

### 3. DigitalOcean App Platform
```bash
# Use docker-compose.yml directly
# or create App Platform spec
```

### 4. Kubernetes
```bash
# Convert docker-compose to Kubernetes
kompose convert

# Deploy to Kubernetes
kubectl apply -f .
```

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_ROOT_USERNAME` | Yes | admin | MongoDB admin username |
| `MONGO_ROOT_PASSWORD` | Yes | - | MongoDB admin password |
| `AUTH0_DOMAIN` | Yes | - | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Yes | - | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Yes | - | Auth0 application secret |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `BACKEND_PORT` | No | 3000 | Backend API port |
| `FRONTEND_PORT` | No | 5173 | Frontend port |
| `NODE_ENV` | No | production | Node environment |
| `FRONTEND_URL` | No | http://localhost:5173 | Frontend URL for CORS |

## 🆘 Support

- **Issues**: https://github.com/retiarylime/pulseplay-ai/issues
- **Discussions**: https://github.com/retiarylime/pulseplay-ai/discussions
- **Documentation**: https://github.com/retiarylime/pulseplay-ai/wiki

## 📄 License

This project is licensed under the MIT License.
