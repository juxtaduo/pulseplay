# Docker Quick Reference

## 🚀 Quick Commands

### Production Deployment
```bash
# First time setup
make init          # Copy .env template
# Edit .env with your credentials
make build         # Build images
make up            # Start services (local MongoDB)
make up-atlas      # Start services (MongoDB Atlas)

# Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000 (local) / 3001 (Atlas)
# MongoDB:  mongodb://localhost:27017
```

### Development Environment
```bash
# Start with hot reload
make up-dev        # Development with hot reload + debug tools

# Or without Docker (local development)
npm run dev:all
```

### Common Operations
```bash
make help          # Show all available commands
make logs          # View all logs
make logs-backend  # View backend logs only
make logs-dev      # View development logs
make logs-atlas    # View Atlas deployment logs
make restart       # Restart all services
make down          # Stop all services
make down-dev      # Stop development services
make down-atlas    # Stop Atlas services
make health        # Check service health
make rebuild       # Rebuild and restart services
make rebuild-dev   # Rebuild development services
make rebuild-atlas # Rebuild Atlas services
```

### Database Operations
```bash
make backup        # Backup MongoDB
make restore       # Restore from latest backup
make shell-mongodb # Access MongoDB shell
```

### Development Tools
```bash
make shell-backend     # Access backend container shell
make shell-backend-dev # Access development backend shell
make shell-frontend-dev # Access development frontend shell
make test-backend      # Run backend tests
make test-backend-dev  # Run backend tests in dev environment
make test-lint         # Run linter
make test-lint-dev     # Run linter in dev environment
```

## 📁 Files Created

### Docker Configuration (11 files)
- `Dockerfile` - Production multi-stage build
- `Dockerfile.dev` - Development with hot reload
- `Dockerfile.frontend` - Frontend-only production build
- `docker-compose.yml` - Production orchestration (local MongoDB)
- `docker-compose.dev.yml` - Development orchestration
- `docker-compose.atlas.yml` - Production with MongoDB Atlas
- `.dockerignore` - Files to exclude from build
- `nginx.conf` - Nginx web server configuration
- `.env.docker.template` - Environment variables template
- `Makefile` - Convenient command shortcuts (25+ commands)
- `.github/workflows/docker-deploy.yml` - CI/CD pipeline

### Documentation (4 files)
- `DOCKER_DEPLOYMENT.md` - Complete deployment guide
- `DOCKER_QUICK_REFERENCE.md` - This quick reference
- `DOCKER_FILES_SUMMARY.md` - File inventory & architecture
- `DOCKER_GITHUB_ACTIONS_DEPLOYMENT.md` - CI/CD documentation

## 🔧 Environment Setup

1. **Copy environment template**
   ```bash
   cp .env.docker.template .env
   ```

2. **Edit `.env` with required values:**
   - MongoDB credentials
   - Auth0 credentials (from https://manage.auth0.com/)
   - Gemini API key (from https://makersuite.google.com/)

3. **Start services**
   ```bash
   docker-compose up -d
   ```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Client Browser                │
│       http://localhost:5173             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Nginx Container (Port 5173)      │
│  • Serves static React frontend         │
│  • Reverse proxy for /api/* requests    │
│  • WebSocket support for real-time      │
│  • Gzip compression & security headers  │
└──────────────┬──────────────────────────┘
               │
               │ /api/* → backend:3000
               ▼
┌─────────────────────────────────────────┐
│      Backend Container (Port 3000)      │
│  • Express.js REST API (TypeScript)     │
│  • MongoDB connection with Mongoose     │
│  • Auth0 JWT authentication             │
│  • Google Gemini AI integration         │
│  • WebSocket server for real-time       │
└──────────────┬──────────────────────────┘
               │
               │ mongodb://mongodb:27017
               ▼
┌─────────────────────────────────────────┐
│      MongoDB Container (Port 27017)     │
│  • Document database with Mongoose ODM  │
│  • User sessions & preferences          │
│  • Audio analysis data storage          │
│  • Persistent volumes & health checks   │
└─────────────────────────────────────────┘

Optional (with --profile debug):
┌─────────────────────────────────────────┐
│   Mongo Express (Port 8081)             │
│  • Web-based database admin interface   │
│  • Query execution & data inspection    │
└─────────────────────────────────────────┘
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
0 2 * * * cd /path/to/pulseplay && make backup
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
- Issues: https://github.com/juxtaduo/pulseplay/issues
- Make commands: `make help`
