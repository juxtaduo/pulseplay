# 🚀 Quick Start - Enable Sign In with Email/Password & Google

## ✅ What's Already Done:
- ✅ Auth0 integration code is already in your app
- ✅ Sign In button is already in the header
- ✅ MongoDB is connected
- ✅ Environment files are ready

## 🎯 What You Need to Do:

### **Step 1: Set Up Auth0 (5 minutes)**

1. **Go to Auth0**: https://auth0.com/ and sign up (use your Google account for quick signup)

2. **Create Application:**
   - Click **Applications** → **Applications** → **Create Application**
   - Name: `PulsePlay AI`
   - Type: **Single Page Web Applications**
   - Click **Create**

3. **Configure URLs** (in Settings tab):
   ```
   Allowed Callback URLs: http://localhost:5173
   Allowed Logout URLs: http://localhost:5173
   Allowed Web Origins: http://localhost:5173
   ```
   Click **Save Changes**

4. **Copy Your Credentials** (from Settings tab):
   - Domain (e.g., `dev-abc123.us.auth0.com`)
   - Client ID (long string)
   - Client Secret (scroll down to find it)

5. **Enable Google Login:**
   - Go to **Authentication** → **Social**
   - Click **Google**
   - Toggle **"Use Auth0's Dev Keys"** to ON
   - Go to **Applications** tab
   - Enable **PulsePlay AI**
   - Click **Save**

6. **Create API:**
   - Go to **Applications** → **APIs** → **Create API**
   - Name: `PulsePlay AI API`
   - Identifier: `https://api.pulseplay.ai` (exactly this!)
   - Click **Create**

### **Step 2: Update Your `.env` File**

Open `.env` file in the **root directory** and update these values:

```env
# ===== FRONTEND CONFIGURATION =====
VITE_AUTH0_DOMAIN=dev-abc123.us.auth0.com          # ← Your Auth0 domain
VITE_AUTH0_CLIENT_ID=your_actual_client_id         # ← Your Client ID
VITE_AUTH0_AUDIENCE=https://api.pulseplay.ai       # ← Keep this as is

# Backend API URL
VITE_API_URL=http://localhost:3000                 # ← Keep this as is
```

Also update the backend section (same file, scroll down):

```env
# ===== BACKEND CONFIGURATION =====
MONGODB_URI=mongodb+srv://thoriq:thoriq@...        # ← Already set ✓

# Auth0 Configuration (Backend)
AUTH0_DOMAIN=dev-abc123.us.auth0.com               # ← Your Auth0 domain
AUTH0_CLIENT_ID=your_actual_client_id              # ← Your Client ID
AUTH0_CLIENT_SECRET=your_actual_client_secret      # ← Your Client Secret
AUTH0_AUDIENCE=https://api.pulseplay.ai            # ← Keep this as is
AUTH0_ISSUER_BASE_URL=https://dev-abc123.us.auth0.com  # ← Your Auth0 domain with https://
```

**Note:** Backend `.env` also needs updating - copy the same values to `backend/.env`

### **Step 3: Start Your App**

Open **2 terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `✅ database_connected` and `✅ server_started`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### **Step 4: Test Sign In!**

1. Open browser: `http://localhost:5173`
2. Click **"Sign In"** button in the top right
3. You'll see Auth0 login page with:
   - ✅ **Email and Password** fields
   - ✅ **Continue with Google** button

**Try both methods:**
- **Email/Password**: Click "Sign up" → Enter email & password → Verify email → Login
- **Google**: Click "Continue with Google" → Choose account → Done!

## 🎉 That's It!

Your app now has:
- ✅ Email/Password authentication
- ✅ Google social login
- ✅ Secure user sessions
- ✅ User profiles

## 🔍 How to Verify It's Working:

After signing in, you should see:
- ✅ Your name/email in the top right corner
- ✅ A logout button
- ✅ User info in browser console

## 📝 What Happens Next:

When users create focus sessions:
- ✅ Sessions are saved to MongoDB with their user ID
- ✅ They can only see their own sessions
- ✅ Data is private and secure

## 🆘 Troubleshooting:

**"Missing Auth0 configuration" error:**
- Make sure you saved the `.env` file
- Restart the frontend terminal (Ctrl+C, then `npm run dev`)

**Sign In button does nothing:**
- Check browser console for errors
- Verify Auth0 domain and Client ID are correct
- Make sure callback URLs are set in Auth0

**"Invalid state" error:**
- Clear browser cookies
- Try again

## 📚 For More Details:

See `AUTH0_SETUP.md` for complete documentation.

---

**Need help?** Let me know which step you're stuck on! 🚀
