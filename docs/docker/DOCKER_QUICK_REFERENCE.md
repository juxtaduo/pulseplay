# Docker Quick Reference

## 🚀 Quick Commands

### Production Deployment
```bash
# First time setup
make init          # Copy .env template
# Edit .env with your credentials
make build         # Build images
make up            # Start services

# Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# MongoDB:  mongodb://localhost:27017
```

### Development Environment
```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Or without Docker (local development)
npm run dev:all
```

### Common Operations
```bash
make logs          # View all logs
make logs-backend  # View backend logs only
make restart       # Restart all services
make down          # Stop all services
make health        # Check service health
```

### Database Operations
```bash
make backup        # Backup MongoDB
make restore       # Restore from latest backup
make shell-mongodb # Access MongoDB shell
```

## 📁 Files Created

### Docker Configuration
- `Dockerfile` - Production multi-stage build
- `Dockerfile.dev` - Development with hot reload
- `docker-compose.yml` - Production orchestration
- `docker-compose.dev.yml` - Development orchestration
- `.dockerignore` - Files to exclude from build
- `nginx.conf` - Nginx web server configuration

### Environment & Setup
- `.env.docker.template` - Environment variables template
- `Makefile` - Convenient command shortcuts
- `DOCKER_DEPLOYMENT.md` - Complete deployment guide

### CI/CD
- `.github/workflows/docker-deploy.yml` - Automated builds

## 🔧 Environment Setup

1. **Copy environment template**
   ```bash
   cp .env.docker.template .env
   ```

2. **Edit `.env` with required values:**
   - MongoDB credentials
   - Auth0 credentials (from https://manage.auth0.com/)
   - Gemini API key (from https://makersuite.google.com/)
   - Context7 API key (from https://context7.com/)

3. **Start services**
   ```bash
   docker-compose up -d
   ```

## 🏗️ Architecture

```
┌──────────────┐
│   Client     │
│   Browser    │
└──────┬───────┘
       │
       │ http://localhost:5173
       ▼
┌──────────────┐
│   Nginx      │  Frontend Static Files
│  Container   │  + Reverse Proxy
└──────┬───────┘
       │
       │ /api/* → backend:3000
       ▼
┌──────────────┐
│   Node.js    │  Backend API
│  Container   │  Express + WebSocket
└──────┬───────┘
       │
       │ mongodb://mongodb:27017
       ▼
┌──────────────┐
│   MongoDB    │  Database
│  Container   │  + Persistent Storage
└──────────────┘
```

## 🔐 Security Checklist

- [ ] Changed default MongoDB passwords
- [ ] Set strong passwords (use `openssl rand -base64 32`)
- [ ] Configured Auth0 credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configured CORS (`FRONTEND_URL`)
- [ ] Set up HTTPS/SSL in production
- [ ] Restricted MongoDB port exposure
- [ ] Enabled firewall rules
- [ ] Set up monitoring and logging
- [ ] Configured backup strategy

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

### Health Checks
```bash
# Service status
docker-compose ps

# API health
curl http://localhost:3000/api/health

# Frontend
curl http://localhost:5173
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Check Docker daemon
systemctl status docker  # Linux
```

### Port conflicts
```bash
# Check what's using the port
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Change port in .env
BACKEND_PORT=3001
```

### MongoDB connection issues
```bash
# Check MongoDB status
docker-compose ps mongodb

# Test connection
docker-compose exec mongodb mongosh -u admin -p

# Check environment variables
docker-compose exec backend env | grep MONGO
```

### Build fails
```bash
# Clear cache and rebuild
docker-compose build --no-cache
docker system prune -a

# Check disk space
df -h
docker system df
```

## 🔄 Updates & Maintenance

### Update application code
```bash
git pull
docker-compose up -d --build
```

### Update dependencies
```bash
# Update package.json
# Then rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Clean up old images
```bash
docker system prune -a
```

## 📦 Backup & Recovery

### Automated Backup (Cron)
```bash
# Add to crontab
0 2 * * * cd /path/to/pulseplay-ai && make backup
```

### Manual Backup
```bash
make backup
```

### Restore
```bash
make restore
```

## 🌐 Production Deployment

### DigitalOcean
```bash
# Use App Platform or Droplet + Docker
# Upload docker-compose.yml and .env
ssh user@server
docker-compose up -d
```

### AWS
```bash
# ECS, Fargate, or EC2
# Use AWS ECR for images
# Configure ALB for load balancing
```

### Google Cloud
```bash
# Cloud Run or GKE
gcloud run deploy pulseplay \
  --image gcr.io/PROJECT/pulseplay
```

## 📞 Support

- Documentation: `DOCKER_DEPLOYMENT.md`
- Issues: https://github.com/retiarylime/pulseplay-ai/issues
- Make commands: `make help`
