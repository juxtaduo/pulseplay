# MongoDB Atlas Setup Guide for Docker

This guide explains how to use MongoDB Atlas (cloud-hosted MongoDB) with your Docker containers instead of running a local MongoDB instance.

## 🌐 Why Use MongoDB Atlas?

- ✅ **No local database** - Reduces Docker resource usage
- ✅ **Free tier available** - M0 cluster is free forever
- ✅ **Automatic backups** - Built-in backup and restore
- ✅ **Scaling** - Easy to scale up/down
- ✅ **Monitoring** - Built-in performance monitoring
- ✅ **High availability** - Automatic failover and replication

## 📋 Setup Steps

### Step 1: Create MongoDB Atlas Account

1. Visit https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" or "Try Free"
3. Create an account (Google/GitHub sign-in available)

### Step 2: Create a Cluster

1. After login, click **"Create"** or **"Build a Database"**
2. Choose **"Shared"** (M0 - Free tier)
3. Select your cloud provider:
   - **AWS** (recommended for most regions)
   - **Google Cloud**
   - **Azure**
4. Choose a region **close to your deployment location**
5. Name your cluster (e.g., "pulseplay-cluster")
6. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 3: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Choose one of these options:

   **Option A: Allow from Anywhere** (easier for Docker)
   ```
   IP Address: 0.0.0.0/0
   Description: Allow from anywhere
   ```
   ⚠️ **Warning**: This is convenient but less secure. Use only for development or with strong authentication.

   **Option B: Add Specific IPs** (more secure)
   ```
   # Add your server's IP address
   # For local development, add your home/office IP
   # For cloud deployments, add your server's IP
   ```

4. Click **"Confirm"**

### Step 4: Create Database User

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **"Password"**
4. Set credentials:
   ```
   Username: pulseplay-user
   Password: <generate strong password>
   ```
   💡 Click "Autogenerate Secure Password" and save it securely
5. Database User Privileges:
   - Select **"Built-in Role"**
   - Choose **"Read and write to any database"**
6. Click **"Add User"**

### Step 5: Get Connection String

1. Go back to **"Database"** (home page)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string:
   ```
   mongodb+srv://pulseplay-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Add database name: `/pulseplay` before the `?`
   ```
   mongodb+srv://pulseplay-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority
   ```

## 🐳 Docker Configuration

### Option 1: Use docker-compose.atlas.yml (Recommended)

1. **Copy environment template**
   ```bash
   cp .env.docker.template .env
   ```

2. **Edit .env file**
   ```bash
   nano .env
   ```

3. **Add your MongoDB Atlas URI**
   ```bash
   # MongoDB Atlas Configuration
   MONGODB_ATLAS_URI=mongodb+srv://pulseplay-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority
   
   # Other required variables
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   CONTEXT7_API_KEY=ctx7sk_your_api_key
   ```

4. **Start services with Atlas**
   ```bash
   docker-compose -f docker-compose.atlas.yml up -d
   ```

### Option 2: Modify docker-compose.yml

If you want to keep using the default `docker-compose.yml`:

1. **Edit docker-compose.yml**
   - Remove or comment out the `mongodb` service
   - Remove `depends_on: mongodb` from backend service

2. **Update backend environment**
   ```yaml
   backend:
     environment:
       MONGODB_URI: ${MONGODB_ATLAS_URI}
   ```

3. **Update .env**
   ```bash
   MONGODB_ATLAS_URI=mongodb+srv://...
   ```

## 📝 Complete .env Example

```bash
# ============================================
# MongoDB Atlas Configuration
# ============================================
MONGODB_ATLAS_URI=mongodb+srv://pulseplay-user:SecurePass123@cluster0.abc123.mongodb.net/pulseplay?retryWrites=true&w=majority

# ============================================
# Auth0 Configuration
# ============================================
AUTH0_DOMAIN=pulseplay.auth0.com
AUTH0_CLIENT_ID=abc123xyz789
AUTH0_CLIENT_SECRET=your_secret_here
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://pulseplay.auth0.com

# ============================================
# AI/ML API Keys
# ============================================
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
CONTEXT7_API_KEY=ctx7sk_XXXXXXXXXXXXXXXXXXXXXXXX

# ============================================
# Server Configuration
# ============================================
NODE_ENV=production
BACKEND_PORT=3000
FRONTEND_PORT=5173
FRONTEND_URL=http://localhost:5173
```

## 🚀 Starting Your Application

### Using MongoDB Atlas

```bash
# Start with Atlas
docker-compose -f docker-compose.atlas.yml up -d

# View logs
docker-compose -f docker-compose.atlas.yml logs -f

# Stop services
docker-compose -f docker-compose.atlas.yml down
```

### Makefile Commands (Optional)

Add these to your Makefile for convenience:

```makefile
up-atlas: ## Start services with MongoDB Atlas
	docker-compose -f docker-compose.atlas.yml up -d

down-atlas: ## Stop Atlas services
	docker-compose -f docker-compose.atlas.yml down

logs-atlas: ## View Atlas deployment logs
	docker-compose -f docker-compose.atlas.yml logs -f
```

## ✅ Verify Connection

### 1. Check Backend Logs
```bash
docker-compose -f docker-compose.atlas.yml logs backend
```

Look for successful connection messages:
```
server_started | Connected to MongoDB Atlas
```

### 2. Test API Health
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```

### 3. Check MongoDB Atlas Dashboard
- Go to your Atlas cluster
- Click "Collections"
- You should see the `pulseplay` database after first connection

## 🔐 Security Best Practices

### 1. Connection String Security
```bash
# ❌ BAD - Hardcoded credentials
MONGODB_URI=mongodb+srv://user:password123@...

# ✅ GOOD - Use environment variables
MONGODB_ATLAS_URI=${ATLAS_CONNECTION_STRING}
```

### 2. IP Whitelisting
```bash
# Development: Allow from anywhere
0.0.0.0/0

# Production: Specific IPs only
203.0.113.45/32  # Your server IP
198.51.100.0/24  # Your office network
```

### 3. Database User Permissions
- Create separate users for different environments
- Use read-only users for analytics
- Rotate passwords regularly

### 4. Network Encryption
- Atlas uses TLS/SSL by default
- Connection strings use `mongodb+srv://` (SRV records)
- All data in transit is encrypted

## 📊 Monitoring

### Atlas Dashboard
1. Go to **"Metrics"** in your cluster
2. Monitor:
   - Connections
   - Query performance
   - Storage usage
   - Network traffic

### Set Up Alerts
1. Go to **"Alerts"**
2. Configure alerts for:
   - High connection count
   - Low disk space
   - Replication lag
   - Query performance

## 💾 Backups

### Automatic Backups (M10+ clusters)
- Enabled by default on paid tiers
- Continuous backups
- Point-in-time recovery

### Manual Snapshots (M0 Free tier)
1. Use `mongodump` from your local machine
2. Or export data from Atlas UI
3. Store backups securely

## 🔄 Migration from Local MongoDB

### Export from Local
```bash
# Export from Docker MongoDB
docker-compose exec mongodb mongodump --out /tmp/backup

# Copy to host
docker cp pulseplay-mongodb:/tmp/backup ./mongodb_backup
```

### Import to Atlas
```bash
# Using mongorestore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/pulseplay" ./mongodb_backup
```

## 🐛 Troubleshooting

### Connection Timeout
```
Error: connect ETIMEDOUT
```
**Solution**: Check IP whitelist in Atlas Network Access

### Authentication Failed
```
Error: Authentication failed
```
**Solution**: 
- Verify username/password
- Check Database User permissions
- Ensure password doesn't have special characters that need URL encoding

### DNS Resolution Issues
```
Error: getaddrinfo ENOTFOUND cluster0.xxxxx.mongodb.net
```
**Solution**: Check your DNS settings or use direct connection string

### URL Encoding Special Characters
If your password contains special characters:
```bash
# Bad
mongodb+srv://user:p@ssw0rd!@cluster...

# Good (URL encoded)
mongodb+srv://user:p%40ssw0rd%21@cluster...
```

Encoding table:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`
- `$` → `%24`

## 📈 Scaling

### Free Tier (M0) Limitations
- 512 MB storage
- Shared vCPU
- Shared RAM
- No automatic backups

### Upgrade When You Need
- M10: 2 GB RAM, 10 GB storage ($0.08/hour)
- M20: 4 GB RAM, 20 GB storage ($0.20/hour)
- Scale up in Atlas dashboard

## 🌐 Production Deployment

### Environment-Specific Clusters
```bash
# Development
MONGODB_ATLAS_URI=mongodb+srv://...dev-cluster.../pulseplay-dev

# Staging
MONGODB_ATLAS_URI=mongodb+srv://...staging-cluster.../pulseplay-staging

# Production
MONGODB_ATLAS_URI=mongodb+srv://...prod-cluster.../pulseplay
```

### Use Different Databases
```bash
# Same cluster, different databases
mongodb+srv://...@cluster0.../pulseplay-dev
mongodb+srv://...@cluster0.../pulseplay-staging
mongodb+srv://...@cluster0.../pulseplay-prod
```

## 📞 Support

- **Atlas Documentation**: https://docs.atlas.mongodb.com/
- **Atlas Support**: https://support.mongodb.com/
- **Community Forums**: https://community.mongodb.com/
- **University**: https://university.mongodb.com/ (free courses)

---

✅ **You're all set!** Your PulsePlay AI app is now using MongoDB Atlas instead of a local database.
