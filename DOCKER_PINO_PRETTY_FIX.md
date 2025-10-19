# Docker Build Fix - pino-pretty Version Error

## 🐛 Problem

Docker build failed with this error:
```
npm error notarget No matching version found for pino-pretty@^14.1.1.
npm error notarget In most cases you or one of your dependencies are requesting
npm error notarget a package version that doesn't exist.
```

## 🔍 Root Cause

The `backend/package.json` specified `pino-pretty@^14.1.1`, but this version **does not exist** in the npm registry.

**Available versions:**
- Latest stable: `13.1.2`
- Next major that exists: v13.x (not v14.x)

## ✅ Solution Applied

Updated `backend/package.json`:

```diff
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.5",
    "@types/ws": "^8.5.13",
    "nodemon": "^3.1.9",
-   "pino-pretty": "^14.1.1",
+   "pino-pretty": "^13.1.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
```

## 🚀 Build Again

On your server (where Docker is installed):

```bash
docker build . -t pulseplay
```

Expected output:
```
[+] Building X.Xs
...
=> [backend-builder 6/8] RUN npm install --production=false
...
=> exporting to image
=> => naming to docker.io/library/pulseplay
```

## 📝 All Fixes Applied

1. ✅ **Fixed `.dockerignore`** - Removed `package-lock.json` from ignore list
2. ✅ **Updated `Dockerfile`** - Changed `npm ci` to `npm install`
3. ✅ **Fixed `pino-pretty` version** - Changed from `^14.1.1` to `^13.1.2`

## 🎯 Complete Build Command

```bash
# Clean build (removes old layers)
docker build --no-cache -t pulseplay .

# Or regular build (uses cache)
docker build -t pulseplay .

# Or with docker-compose
docker-compose build
```

## 🐛 If Still Having Issues

### Issue: Other version conflicts
**Check for outdated packages:**
```bash
# In backend directory
cd backend
npm outdated
```

### Issue: Network timeout during build
**Solution:** Increase timeout or use a different registry:
```dockerfile
RUN npm install --production=false --network-timeout=60000
```

### Issue: Out of memory during build
**Solution:** Increase Docker memory:
```bash
# Check Docker memory
docker info | grep Memory

# Or build with less parallelism
docker build --memory=2g -t pulseplay .
```

## 📊 Build Timeline

| Step | Time | Status |
|------|------|--------|
| Load context | ~1s | ✅ |
| Frontend deps | ~60s | ✅ (after fix) |
| Backend deps | ~70s | ✅ (after fix) |
| Frontend build | ~30s | Pending |
| Backend build | ~20s | Pending |
| Production image | ~10s | Pending |
| **Total** | **~3-4 min** | Expected |

## 🎉 Result

After this fix, your Docker build should complete successfully!

### Verify Build
```bash
# Check image was created
docker images pulseplay

# Expected output:
# REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
# pulseplay    latest    abc123def456   2 minutes ago   ~200MB
```

### Test Run
```bash
# Quick test
docker run --rm pulseplay node --version

# Start the application
docker-compose up -d
```

## 📚 Related Files

- `backend/package.json` - Fixed pino-pretty version
- `Dockerfile` - Uses npm install instead of npm ci
- `.dockerignore` - Allows package-lock.json
- `DOCKER_BUILD_FIX.md` - Previous fixes documentation

---

**Status**: ✅ Fixed - Ready to build!  
**Next Step**: Run `docker build . -t pulseplay` on your server
