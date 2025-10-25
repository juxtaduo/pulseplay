# MongoDB Atlas - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Create Free Cluster
```
https://www.mongodb.com/cloud/atlas
→ Sign Up
→ Create Free Cluster (M0)
→ Choose AWS + Closest Region
```

### 2. Configure Access
```
Network Access → Add IP → 0.0.0.0/0
Database Access → Add User → pulseplay-user / <password>
```

### 3. Get Connection String
```
Database → Connect → Connect Application
→ Copy: mongodb+srv://pulseplay-user:<password>@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority
```

### 4. Update .env
```bash
MONGODB_ATLAS_URI=mongodb+srv://pulseplay-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority
```

### 5. Start with Atlas
```bash
make up-atlas
# or
docker-compose -f docker-compose.atlas.yml up -d
```

## ✅ Checklist

- [ ] Atlas account created
- [ ] Free M0 cluster deployed
- [ ] IP whitelist configured (0.0.0.0/0 for Docker)
- [ ] Database user created
- [ ] Connection string copied
- [ ] .env file updated with MONGODB_ATLAS_URI
- [ ] docker-compose.atlas.yml tested
- [ ] Backend connects successfully

## 📝 .env Configuration

```bash
# MongoDB Atlas (Required)
MONGODB_ATLAS_URI=mongodb+srv://pulseplay-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority

# Auth0 (Required)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com

# Frontend Auth0 (for Docker build)
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
VITE_API_URL=http://localhost:3001

# Gemini AI (Required)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXX

# Server Config
NODE_ENV=production
BACKEND_PORT=3001
FRONTEND_PORT=5173
FRONTEND_URL=http://localhost:5173
```

## 🎯 Common Commands

```bash
# Start with Atlas
make up-atlas      # Start services with MongoDB Atlas

# View logs
make logs-atlas    # View Atlas deployment logs

# Stop services
make down-atlas    # Stop Atlas services

# Check health
curl http://localhost:3001/api/health

# Access services
http://localhost:5173  # Frontend
http://localhost:3001  # Backend API
```

## 🔐 Security Tips

1. **IP Whitelist**
   - Development: `0.0.0.0/0` (anywhere)
   - Production: Your server's specific IP

2. **Strong Passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 24
   ```

3. **URL Encode Special Characters**
   ```bash
   @ → %40
   : → %3A
   / → %2F
   ? → %3F
   # → %23
   ```

4. **Separate Environments**
   ```bash
   Dev:     pulseplay-dev
   Staging: pulseplay-staging  
   Prod:    pulseplay
   ```

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| Connection timeout | Check IP whitelist |
| Authentication failed | Verify username/password |
| DNS error | Check connection string format |
| Backend won't start | Check .env has MONGODB_ATLAS_URI |

## 📊 Monitoring

**Atlas Dashboard**
- Metrics → View connections, queries, storage
- Alerts → Configure notifications
- Performance Advisor → Optimization tips

**Backend Logs**
```bash
docker-compose -f docker-compose.atlas.yml logs -f backend
```

## 💾 Backups

**Free Tier (M0)**
- Manual exports only
- Use mongodump/mongorestore

**Paid Tiers (M10+)**
- Automatic continuous backups
- Point-in-time recovery

## 📈 Scaling

**Free (M0)**: 512 MB storage, shared clusters
**M10**: ~$0.08/hr - 2GB RAM, 10GB storage, dedicated clusters
**M20**: ~$0.20/hr - 4GB RAM, 20GB storage, dedicated clusters
**M30**: ~$0.54/hr - 8GB RAM, 80GB storage, dedicated clusters

Upgrade in Atlas dashboard when needed.

## 🌐 Resources

- **Setup Guide**: `MONGODB_ATLAS_SETUP.md`
- **Atlas Docs**: https://docs.atlas.mongodb.com/
- **Support**: https://support.mongodb.com/
- **Free Courses**: https://university.mongodb.com/

## 🎓 Next Steps

1. ✅ Set up Atlas cluster
2. ✅ Configure Docker with Atlas
3. 📚 Read full guide: `MONGODB_ATLAS_SETUP.md`
4. 🚀 Deploy to production
5. 📊 Set up monitoring and alerts
6. 💾 Configure backup strategy

---

**Need help?** Read `MONGODB_ATLAS_SETUP.md` for detailed instructions!
