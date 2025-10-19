# Quick Start: MongoDB Atlas Setup

## 🚀 Step-by-Step Instructions

### 1️⃣ Get Your MongoDB Atlas Connection String

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Create a FREE cluster** (M0 Sandbox) if you haven't already
3. **Create a database user**:
   - Go to **Database Access** → **Add New Database User**
   - Username: `pulseplay-user` (or any name you prefer)
   - Password: Generate a strong password (save it!)
   - Database User Privileges: **Read and write to any database**
   
4. **Whitelist all IPs**:
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Click **Confirm**

5. **Get your connection string**:
   - Go to **Database** → Click **Connect** on your cluster
   - Choose **Connect your application**
   - Copy the connection string
   - It should look like this:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

### 2️⃣ Update Your .env File

Open the `.env` file in the **root directory** and update it:

```env
MONGODB_URI=mongodb+srv://pulseplay-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pulseplay?retryWrites=true&w=majority
```

**Replace**:
- `pulseplay-user` → Your MongoDB username
- `YOUR_PASSWORD` → Your MongoDB password
- `cluster0.xxxxx` → Your actual cluster URL
- Add `/pulseplay` after `.net/` (this is your database name)

⚠️ **Important**: If your password contains special characters (`@`, `:`, `/`, etc.), you need to URL-encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`

### 3️⃣ Test Your Connection

Run this command in the terminal from the `backend` folder:

```bash
cd backend
npm run test:db
```

You should see:
```
✅ Successfully connected to MongoDB Atlas!
📊 Database: pulseplay
🌍 Host: cluster0.xxxxx.mongodb.net
```

If you see ❌ errors, check the troubleshooting tips in the output.

### 4️⃣ Set Up Auth0 (Optional for now, but needed for deployment)

1. **Go to Auth0**: https://auth0.com/
2. **Sign up** for a free account
3. **Create an application**:
   - Applications → Create Application
   - Name: "PulsePlay AI"
   - Type: **Single Page Web Applications**
   
4. **Configure Settings**:
   - Allowed Callback URLs: `http://localhost:5173/callback`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`

5. **Create an API**:
   - Applications → APIs → Create API
   - Name: "PulsePlay AI API"
   - Identifier: `https://api.pulseplay.ai`

6. **Update .env** with Auth0 credentials:
   ```env
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   AUTH0_AUDIENCE=https://api.pulseplay.ai
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   ```

### 5️⃣ Get Gemini API Key

1. **Go to**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Create API Key**
4. **Copy** the key and add to `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

### 6️⃣ Start Your Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
database_connected
server_started
```

## 📦 Ready for Vercel Deployment?

Once everything works locally, follow the full `DEPLOYMENT_GUIDE.md` for Vercel deployment.

### Quick Vercel Checklist:
- [ ] MongoDB Atlas connection string ready
- [ ] Auth0 credentials configured
- [ ] Gemini API key obtained
- [ ] Code pushed to GitHub
- [ ] Environment variables added to Vercel
- [ ] Deploy! 🚀

## 🆘 Need Help?

**MongoDB connection fails?**
- Check username/password are correct
- Verify IP whitelist (0.0.0.0/0)
- Ensure database name is in connection string
- Special characters in password must be URL-encoded

**Auth0 issues?**
- Verify callback URLs match exactly
- Check domain includes `.auth0.com`
- Ensure API identifier is correct

**Vercel deployment fails?**
- Check all environment variables are set
- Review build logs in Vercel dashboard
- Make sure `vercel.json` is in root directory

---

**Files Created**:
- ✅ `.env` - Your local environment variables (⚠️ never commit this!)
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `DEPLOYMENT_GUIDE.md` - Full deployment documentation
- ✅ `backend/src/test-db-connection.ts` - MongoDB connection test script
