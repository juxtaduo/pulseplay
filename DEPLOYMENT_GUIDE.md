# Deployment Guide for Vercel

## Prerequisites

1. **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas)
2. **Auth0 Account** - [Sign up here](https://auth0.com/)
3. **Vercel Account** - [Sign up here](https://vercel.com/)
4. **Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a Cluster
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Build a Database"
3. Choose the **FREE** tier (M0 Sandbox)
4. Select your preferred cloud provider and region
5. Name your cluster (e.g., `pulseplay-cluster`)
6. Click "Create Cluster"

### 1.2 Create Database User
1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set a username and **strong password** (save these!)
5. Set user privileges to **Read and write to any database**
6. Click **Add User**

### 1.3 Configure Network Access
1. In the left sidebar, click **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ For production, restrict to Vercel's IP ranges
4. Click **Confirm**

### 1.4 Get Your Connection String
1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Driver: Node.js** and **Version: 5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your actual credentials
7. Add your database name: `pulseplay` after `.net/`
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority
   ```

## Step 2: Set Up Auth0

### 2.1 Create Auth0 Application
1. Log in to [Auth0 Dashboard](https://manage.auth0.com/)
2. Go to **Applications** → **Create Application**
3. Name it "PulsePlay AI"
4. Choose **Single Page Web Applications**
5. Click **Create**

### 2.2 Configure Application Settings
1. In the **Settings** tab:
   - **Allowed Callback URLs**: 
     ```
     http://localhost:5173/callback, https://your-app.vercel.app/callback
     ```
   - **Allowed Logout URLs**: 
     ```
     http://localhost:5173, https://your-app.vercel.app
     ```
   - **Allowed Web Origins**: 
     ```
     http://localhost:5173, https://your-app.vercel.app
     ```
2. Click **Save Changes**

### 2.3 Create Auth0 API
1. Go to **Applications** → **APIs** → **Create API**
2. Name: `PulsePlay AI API`
3. Identifier: `https://api.pulseplay.ai` (this is your **AUDIENCE**)
4. Signing Algorithm: **RS256**
5. Click **Create**

### 2.4 Collect Auth0 Credentials
From your application settings, save these:
- **Domain** (e.g., `dev-abc123.us.auth0.com`)
- **Client ID**
- **Client Secret** (found in Settings tab)
- **Audience** (from API: `https://api.pulseplay.ai`)

## Step 3: Configure Local Environment

### 3.1 Update `.env` file
Replace the placeholder values in your `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority

# Auth0 Configuration (Backend)
AUTH0_DOMAIN=dev-abc123.us.auth0.com
AUTH0_CLIENT_ID=your_actual_client_id
AUTH0_CLIENT_SECRET=your_actual_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://dev-abc123.us.auth0.com

# Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3.2 Test Local Connection
```bash
cd backend
npm install
npm run dev
```

You should see: `database_connected` in the logs.

## Step 4: Deploy to Vercel

### 4.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 4.2 Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Add Environment Variables in Vercel

In your Vercel project settings → **Environment Variables**, add:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | Your MongoDB connection string | Production, Preview, Development |
| `AUTH0_DOMAIN` | Your Auth0 domain | Production, Preview, Development |
| `AUTH0_CLIENT_ID` | Your Auth0 client ID | Production, Preview, Development |
| `AUTH0_CLIENT_SECRET` | Your Auth0 client secret | Production, Preview, Development |
| `AUTH0_AUDIENCE` | `https://api.pulseplay.ai` | Production, Preview, Development |
| `AUTH0_ISSUER_BASE_URL` | Your Auth0 issuer URL | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Gemini API key | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `FRONTEND_URL` | Your Vercel app URL | Production |

⚠️ **Important**: After deployment, update `FRONTEND_URL` with your actual Vercel URL (e.g., `https://pulseplay-ai.vercel.app`)

### 4.4 Update Auth0 URLs
After deployment, add your Vercel URL to Auth0:
1. Go to Auth0 Dashboard → Applications → Your App
2. Update:
   - **Allowed Callback URLs**: Add `https://your-app.vercel.app/callback`
   - **Allowed Logout URLs**: Add `https://your-app.vercel.app`
   - **Allowed Web Origins**: Add `https://your-app.vercel.app`

### 4.5 Deploy
Click **Deploy** in Vercel

## Step 5: Verify Deployment

1. Visit your Vercel app URL
2. Check `/health` endpoint: `https://your-app.vercel.app/health`
3. Test authentication
4. Monitor Vercel logs for any errors

## Troubleshooting

### MongoDB Connection Issues
- ✅ Check username/password are URL-encoded
- ✅ Verify IP whitelist includes 0.0.0.0/0
- ✅ Ensure database name is in the connection string

### Auth0 Issues
- ✅ Verify all URLs are added to Auth0 settings
- ✅ Check that AUDIENCE matches your API identifier
- ✅ Ensure ISSUER_BASE_URL includes `https://`

### Vercel Build Fails
- ✅ Check build logs in Vercel dashboard
- ✅ Ensure all dependencies are in `package.json`
- ✅ Verify TypeScript compiles locally: `npm run build`

## Security Checklist

- [ ] Use strong, unique passwords for MongoDB
- [ ] Enable MongoDB IP whitelist (restrict to Vercel IPs in production)
- [ ] Keep Auth0 Client Secret secure (never commit to Git)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting in production
- [ ] Set up CORS properly
- [ ] Monitor logs for suspicious activity

## Next Steps

1. Set up custom domain in Vercel
2. Configure MongoDB backups
3. Enable Auth0 MFA
4. Set up error tracking (Sentry)
5. Configure CI/CD pipeline
6. Add monitoring and analytics

---

**Need Help?**
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Auth0: https://auth0.com/docs
- Vercel: https://vercel.com/docs
