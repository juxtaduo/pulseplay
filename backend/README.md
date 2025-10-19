# PulsePlay Backend

Backend API server for PulsePlay AI - Adaptive Focus Music Application

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` and create `.env`:
```bash
cp .env.example .env
```

Or manually create `.env` file with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulseplay?retryWrites=true&w=majority

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Test Database Connection

```bash
npm run test:db
```

You should see:
```
✅ Successfully connected to MongoDB Atlas!
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Sessions (Auth Required)
```
POST   /api/sessions          - Create new session
GET    /api/sessions          - Get user's sessions
GET    /api/sessions/:id      - Get specific session
PUT    /api/sessions/:id      - Update session
DELETE /api/sessions/:id      - Delete session
```

### AI Recommendations (Auth Required)
```
POST   /api/ai/mood-recommendation    - Get AI mood-based music recommendation
POST   /api/ai/analyze-session        - Analyze session performance
GET    /api/ai/weekly-summary         - Get weekly summary
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run test:db` - Test MongoDB connection
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── auth0.ts     # Auth0 JWT validation
│   │   ├── database.ts  # MongoDB connection
│   │   └── logger.ts    # Pino logger setup
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/          # Mongoose schemas
│   │   ├── FocusSession.ts
│   │   ├── UserPreferences.ts
│   │   └── ...
│   ├── routes/          # API route handlers
│   │   ├── sessions.ts
│   │   └── ai.ts
│   ├── services/        # Business logic
│   │   ├── sessionService.ts
│   │   ├── geminiService.ts
│   │   └── sessionAnalyzer.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── crypto.ts
│   └── server.ts        # Express app entry point
├── package.json
└── tsconfig.json
```

## 🔐 Authentication

This API uses Auth0 JWT tokens for authentication. Protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes |
| `AUTH0_DOMAIN` | Auth0 tenant domain | ✅ Yes |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | ✅ Yes |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret | ✅ Yes |
| `AUTH0_AUDIENCE` | Auth0 API identifier | ✅ Yes |
| `AUTH0_ISSUER_BASE_URL` | Auth0 issuer URL | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:5173) |

## 🧪 Testing

### Test Database Connection
```bash
npm run test:db
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Create session (requires auth token)
curl -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration": 25, "completed": true}'
```

## 🚀 Deployment

See the main `DEPLOYMENT_GUIDE.md` in the root directory for Vercel deployment instructions.

## 📚 Documentation

- [API Reference](../docs/developer/API_REFERENCE.md)
- [Architecture](../docs/developer/ARCHITECTURE.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [MongoDB Setup](../MONGODB_SETUP.md)

## 🆘 Troubleshooting

### MongoDB Connection Fails
- ✅ Check your connection string in `.env`
- ✅ Verify IP whitelist in MongoDB Atlas (0.0.0.0/0)
- ✅ Ensure database user has correct permissions
- ✅ URL-encode special characters in password

### Auth0 Errors
- ✅ Verify all Auth0 variables are set correctly
- ✅ Check that AUDIENCE matches your API identifier
- ✅ Ensure ISSUER_BASE_URL includes `https://`

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=3001
```

## 🔧 Technologies

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **Auth0** - Authentication
- **Gemini AI** - AI recommendations
- **Pino** - Logging

## 📄 License

MIT
