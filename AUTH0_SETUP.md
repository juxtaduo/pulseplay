# Auth0 Setup Guide - Email/Password + Google Sign-In

## 🎯 What You'll Get:
- ✅ Email/Password sign-up and login
- ✅ Google sign-in (Social login)
- ✅ User profile management
- ✅ Secure JWT tokens

---

## 📝 Step 1: Create Auth0 Account & Application

### 1.1 Sign Up for Auth0
1. Go to https://auth0.com/
2. Click **"Sign Up"**
3. You can sign up with:
   - Google account (recommended - easiest)
   - GitHub
   - Email

### 1.2 Create a New Application
1. After login, you'll see the Auth0 Dashboard
2. Go to **Applications** → **Applications** (in left sidebar)
3. Click **"Create Application"**
4. Configure:
   - **Name**: `PulsePlay AI`
   - **Application Type**: **Single Page Web Applications**
   - Click **"Create"**

### 1.3 Configure Application Settings
In the **Settings** tab of your application:

#### **Application URIs** (Important!)
Add these URLs:

**Allowed Callback URLs:**
```
http://localhost:5173, http://localhost:5173/callback
```

**Allowed Logout URLs:**
```
http://localhost:5173
```

**Allowed Web Origins:**
```
http://localhost:5173
```

**Allowed Origins (CORS):**
```
http://localhost:5173
```

Click **"Save Changes"** at the bottom!

### 1.4 Get Your Credentials
In the **Settings** tab, copy these values (you'll need them soon):
- ✅ **Domain** (e.g., `dev-abc123.us.auth0.com`)
- ✅ **Client ID** (long string like `AbCdEf123...`)

---

## 🔐 Step 2: Enable Google Sign-In

### 2.1 Set Up Google Social Connection
1. In Auth0 Dashboard, go to **Authentication** → **Social** (left sidebar)
2. Click on **Google** 
3. You have two options:

#### **Option A: Use Auth0 Dev Keys** (Quick Setup - Recommended for Testing)
1. Toggle **"Use Auth0's Dev Keys"** to ON
2. Click **"Save"**
3. ✅ Done! Google login will work immediately

#### **Option B: Use Your Own Google Credentials** (Production - Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Copy **Client ID** and **Client Secret** to Auth0
6. Click **"Save"**

### 2.2 Enable the Connection for Your App
1. Go to **Authentication** → **Social**
2. Click on **Google**
3. Go to **Applications** tab
4. Enable toggle for **"PulsePlay AI"**
5. Click **"Save"**

---

## 🎨 Step 3: Customize Login Experience (Optional)

### 3.1 Enable Email/Password Database
1. Go to **Authentication** → **Database** (left sidebar)
2. You should see **"Username-Password-Authentication"** (enabled by default)
3. Click on it to customize settings if needed

### 3.2 Customize Login Page (Optional)
1. Go to **Branding** → **Universal Login**
2. Choose a template
3. Customize colors, logo, etc.

---

## 🔧 Step 4: Create API for Backend Authentication

### 4.1 Create Auth0 API
1. Go to **Applications** → **APIs** (left sidebar)
2. Click **"Create API"**
3. Configure:
   - **Name**: `PulsePlay AI API`
   - **Identifier**: `https://api.pulseplay.ai` (exactly this!)
   - **Signing Algorithm**: `RS256`
4. Click **"Create"**

---

## 💻 Step 5: Configure Your App

Now let's add the Auth0 credentials to your app:

### 5.1 Create Frontend `.env` File

Create a file named `.env` in the **root directory** (NOT in backend folder):

```env
# Auth0 Configuration (Frontend)
VITE_AUTH0_DOMAIN=your-actual-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_actual_client_id
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai
```

**Replace:**
- `your-actual-domain.auth0.com` → Your Auth0 domain from Step 1.4
- `your_actual_client_id` → Your Client ID from Step 1.4

### 5.2 Update Backend `.env` File

Update your `backend/.env` file with Auth0 settings:

```env
# MongoDB Configuration (Already set)
MONGODB_URI=mongodb+srv://thoriq:thoriq@pulseplay-ai-cluster.gankis1.mongodb.net/pulseplay?retryWrites=true&w=majority

# Auth0 Configuration (Backend) - ADD THESE
AUTH0_DOMAIN=your-actual-domain.auth0.com
AUTH0_CLIENT_ID=your_actual_client_id
AUTH0_CLIENT_SECRET=your_actual_client_secret
AUTH0_AUDIENCE=https://api.pulseplay.ai
AUTH0_ISSUER_BASE_URL=https://your-actual-domain.auth0.com

# Rest of your config...
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Where to find Client Secret:**
1. Go to your Auth0 Application → **Settings** tab
2. Scroll down to **Client Secret**
3. Copy it (keep it secret!)

---

## 🧪 Step 6: Test Your Authentication

### 6.1 Start Your App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6.2 Test Login Flow

1. Open your browser: `http://localhost:5173`
2. Click **"Sign In"** button
3. You should see Auth0 login page with:
   - ✅ **Email/Password** fields
   - ✅ **Continue with Google** button
4. Try both methods!

---

## ✅ What Users Can Do:

### Sign Up with Email/Password:
1. Click "Sign In"
2. Click "Sign up" link
3. Enter email and password
4. Verify email (check spam folder!)
5. Login

### Sign In with Google:
1. Click "Sign In"
2. Click "Continue with Google"
3. Choose Google account
4. Done!

---

## 🎨 Customization Options

### Change Button Text
Edit `src/components/AuthButton.tsx` and change the button text.

### Add More Social Logins
In Auth0 Dashboard → **Authentication** → **Social**, you can enable:
- GitHub
- Facebook
- Twitter
- Microsoft
- LinkedIn
- Apple
- And many more!

### Customize Login Page
Go to **Branding** → **Universal Login** in Auth0 Dashboard

---

## 🔒 Security Features (Already Built-In!)

Your app already has:
- ✅ JWT token authentication
- ✅ Secure password hashing (by Auth0)
- ✅ Token refresh
- ✅ CORS protection
- ✅ Rate limiting

---

## 🚀 For Vercel Deployment (Later)

When you deploy to Vercel, remember to:

1. **Update Auth0 URLs:**
   - Add your Vercel URL to Allowed Callback URLs
   - Add your Vercel URL to Allowed Logout URLs
   - Add your Vercel URL to Allowed Web Origins

2. **Add Environment Variables in Vercel:**
   - All the `VITE_` variables for frontend
   - All the `AUTH0_` variables for backend

---

## 🆘 Troubleshooting

### "Invalid state" error
- Clear browser cookies and try again
- Check that callback URLs match exactly

### Google login not showing
- Make sure you enabled Google in Auth0 Social connections
- Check that your app is enabled for Google connection

### "Access denied" error
- Check AUTH0_AUDIENCE matches in both frontend and backend
- Verify API identifier is exactly `https://api.pulseplay.ai`

### Still can't login?
- Check browser console for errors
- Verify all environment variables are set correctly
- Make sure both frontend and backend are running

---

## 📚 Next Steps

After authentication is working:
1. ✅ Test creating focus sessions (will be saved with user ID)
2. ✅ View session history (only your sessions)
3. ✅ Get AI recommendations
4. ✅ Deploy to Vercel

---

**Need Help?**
- Auth0 Docs: https://auth0.com/docs
- Auth0 React SDK: https://auth0.com/docs/quickstart/spa/react
