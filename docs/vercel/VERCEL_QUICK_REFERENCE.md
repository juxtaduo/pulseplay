# Vercel Deployment Quick Reference

## 🚀 Quick Setup

### 1. Install Vercel CLI
```bash
npm i -g vercel
vercel login
```

### 2. Prepare Project Structure
```bash
# Create API directory
mkdir -p api/sessions api/ai

# Copy and adapt route handlers (see main guide)
cp backend/src/routes/*.ts api/
# Edit files to work with Vercel serverless functions
```

### 3. Create vercel.json
```json
{
  "version": 2,
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  }
}
```

### 4. Set Environment Variables
```bash
# In Vercel dashboard or CLI
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

### 5. Deploy
```bash
vercel --prod
```

## 📋 Environment Variables Checklist

### Required for Backend
- [ ] `MONGODB_ATLAS_URI` - MongoDB connection string
- [ ] `AUTH0_DOMAIN` - Auth0 domain
- [ ] `AUTH0_CLIENT_ID` - Auth0 client ID
- [ ] `AUTH0_CLIENT_SECRET` - Auth0 client secret
- [ ] `AUTH0_AUDIENCE` - Auth0 API audience
- [ ] `AUTH0_ISSUER_BASE_URL` - Auth0 issuer URL
- [ ] `GEMINI_API_KEY` - Google Gemini API key

### Required for Frontend
- [ ] `VITE_AUTH0_DOMAIN` - Auth0 domain (public)
- [ ] `VITE_AUTH0_CLIENT_ID` - Auth0 client ID (public)
- [ ] `VITE_AUTH0_AUDIENCE` - Auth0 audience (public)
- [ ] `VITE_API_URL` - API base URL (public)
- [ ] `FRONTEND_URL` - Frontend URL for CORS

## 🔧 API Route Conversion

### From Express Route
```typescript
// backend/src/routes/sessions.ts
router.post('/', checkJwt, async (req, res) => {
  // handler logic
});
```

### To Vercel Function
```typescript
// api/sessions/index.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    await checkJwt(req, res);
    // handler logic
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
```

## 🚨 Common Issues & Fixes

### Database Connection
```bash
# Check MongoDB Atlas IP whitelist
# Allow 0.0.0.0/0 for Vercel
```

### CORS Errors
```javascript
// Add to all API functions
res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### Environment Variables
```bash
# Check Vercel dashboard
# Redeploy after adding variables
vercel --prod
```

### Function Timeouts
```json
// Increase timeout in vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📊 Useful Commands

### Deployment
```bash
vercel --prod          # Deploy to production
vercel --dev           # Local development server
vercel logs            # View function logs
vercel env ls          # List environment variables
```

### Monitoring
```bash
curl https://your-app.vercel.app/api/health  # Health check
vercel analytics     # View analytics
```

### Updates
```bash
vercel pull           # Pull latest environment variables
vercel redeploy       # Redeploy current deployment
```

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Auth0 Dashboard:** https://manage.auth0.com
- **PulsePlay Health:** `https://your-app.vercel.app/api/health`

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** See `MONGODB_ATLAS_SETUP.md`
- **Full Guide:** See `VERCEL_DEPLOYMENT.md`</content>
<parameter name="filePath">/home/rl/.github/pulseplay/docs/vercel/VERCEL_QUICK_REFERENCE.md