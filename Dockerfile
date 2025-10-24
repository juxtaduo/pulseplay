# Multi-stage build for PulsePlay

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package.json ./
COPY package-lock.json* ./

# Clean any existing node_modules and lock file issues
RUN rm -rf node_modules package-lock.json && npm cache clean --force

# Install frontend dependencies with retry logic for esbuild issues
RUN npm ci --include=dev --no-audit --no-fund --no-optional --ignore-scripts && npm rebuild esbuild

# Copy config files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./

# Copy frontend source code
COPY src ./src

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package.json ./
COPY backend/package-lock.json* ./

# Clean any existing node_modules and lock file issues
RUN rm -rf node_modules package-lock.json && npm cache clean --force

# Install backend dependencies
RUN npm ci --include=dev --no-audit --no-fund --no-optional --ignore-scripts && npm rebuild esbuild

# Copy backend config
COPY backend/tsconfig.json ./

# Copy backend source code
COPY backend/src ./src

# Build backend
RUN npm run build

# Stage 3: Production Image
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Install production dependencies for backend
COPY backend/package.json ./backend/
COPY backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN rm -rf node_modules package-lock.json && npm cache clean --force && npm ci --only=production --no-audit --no-fund

# Copy built backend from builder
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend from builder
WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose ports
# Backend API
EXPOSE 3000
# Frontend (if serving static files from backend)
EXPOSE 5173

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the backend server
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
