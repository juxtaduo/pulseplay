# Docker Deployment with GitHub Actions

This guide explains how to deploy PulsePlay using Docker containers through GitHub Actions CI/CD pipeline.

## 📋 Overview

The GitHub Actions workflow automates the entire deployment process:
- **Testing**: Runs linting, type checking, and tests
- **Building**: Creates optimized Docker images for backend and frontend
- **Security**: Scans images for vulnerabilities
- **Deployment**: Deploys to staging/production environments

## 🚀 Workflow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Git Push  │───▶│    Test     │───▶│   Build     │
│ (main/dev)  │    │             │    │  Images     │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Security   │───▶│  Deploy     │───▶│ Production │
│   Scan      │    │  Staging    │    │   Server   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## ⚙️ Prerequisites

### GitHub Repository Setup

1. **Enable GitHub Container Registry**
   ```bash
   # No action needed - automatically enabled for public repos
   ```

2. **Configure Secrets and Variables**

   #### Option A: Repository-Level Secrets & Variables (Recommended for single repo)

   **Navigate to Repository Settings:**
   - Go to your repository on GitHub
   - Click **Settings** tab
   - Scroll down to **Secrets and variables** → **Actions**

   **Create Repository Secrets:**
   ```bash
   # Required for production deployment
   SSH_PRIVATE_KEY        # Private SSH key for server access
   SERVER_HOST            # Production server IP/hostname
   SERVER_USER            # SSH username

   # Required for staging deployment
   STAGING_SSH_PRIVATE_KEY
   STAGING_SERVER_HOST
   STAGING_SERVER_USER

   # Required for backend deployment
   MONGODB_ATLAS_URI      # MongoDB Atlas connection string
   AUTH0_CLIENT_SECRET    # Auth0 client secret
   AUTH0_ISSUER_BASE_URL  # Auth0 issuer base URL
   GEMINI_API_KEY         # Google Gemini API key
   GRADIENT_AI_API_KEY    # Gradient AI API key (if used)
   ```

   **Create Repository Variables:**
   ```bash
   # Frontend build arguments
   VITE_AUTH0_DOMAIN      # Auth0 domain
   VITE_AUTH0_CLIENT_ID   # Auth0 client ID
   VITE_AUTH0_AUDIENCE    # Auth0 audience
   VITE_API_URL           # API URL for frontend
   FRONTEND_URL           # Frontend URL for CORS
   ```

   #### Option B: Environment-Level Secrets & Variables (Recommended for multi-environment)

   **Create Deployment Environments:**
   - In repository **Settings** → **Environments**
   - Click **New environment**
   - Create `production` and `staging` environments

   **For Production Environment:**
   - Go to **Settings** → **Environments** → **production**
   - Add **Environment secrets:**
     ```bash
     SSH_PRIVATE_KEY
     SERVER_HOST
     SERVER_USER
     MONGODB_ATLAS_URI
     AUTH0_CLIENT_SECRET
     AUTH0_ISSUER_BASE_URL
     GEMINI_API_KEY
     GRADIENT_AI_API_KEY
     ```
   - Add **Environment variables:**
     ```bash
     VITE_AUTH0_DOMAIN
     VITE_AUTH0_CLIENT_ID
     VITE_AUTH0_AUDIENCE
     VITE_API_URL
     FRONTEND_URL
     ```

   **For Staging Environment:**
   - Go to **Settings** → **Environments** → **staging**
   - Add **Environment secrets:**
     ```bash
     STAGING_SSH_PRIVATE_KEY
     STAGING_SERVER_HOST
     STAGING_SERVER_USER
     MONGODB_ATLAS_URI      # Can use same Atlas cluster
     AUTH0_CLIENT_SECRET    # Can use same Auth0 app
     AUTH0_ISSUER_BASE_URL
     GEMINI_API_KEY         # Can use same API key
     GRADIENT_AI_API_KEY
     ```
   - Add **Environment variables:**
     ```bash
     VITE_AUTH0_DOMAIN
     VITE_AUTH0_CLIENT_ID
     VITE_AUTH0_AUDIENCE
     VITE_API_URL           # Staging API URL
     FRONTEND_URL           # Staging frontend URL
     ```

   #### Option C: Organization-Level Secrets & Variables (Recommended for multiple repos)

   **Navigate to Organization Settings:**
   - Go to your organization on GitHub
   - Click **Settings** tab
   - Scroll down to **Secrets and variables** → **Actions**

   **Create Organization Secrets:**
   ```bash
   # Shared across all repos in organization
   ORG_MONGODB_ATLAS_URI
   ORG_AUTH0_CLIENT_SECRET
   ORG_AUTH0_ISSUER_BASE_URL
   ORG_GEMINI_API_KEY
   ORG_GRADIENT_AI_API_KEY
   ```

   **Create Organization Variables:**
   ```bash
   # Shared across all repos in organization
   ORG_VITE_AUTH0_DOMAIN
   ORG_VITE_AUTH0_CLIENT_ID
   ORG_VITE_AUTH0_AUDIENCE
   ```

   **Repository-Specific Secrets (per repo):**
   ```bash
   SSH_PRIVATE_KEY
   SERVER_HOST
   SERVER_USER
   STAGING_SSH_PRIVATE_KEY
   STAGING_SERVER_HOST
   STAGING_SERVER_USER
   ```

   **Repository-Specific Variables (per repo):**
   ```bash
   VITE_API_URL
   FRONTEND_URL
   ```

   **Configure Repository Access:**
   - In organization settings, select which repositories can access each secret/variable
   - For PulsePlay, grant access to the `pulseplay` repository

   #### How to Create Secrets and Variables

   **Via GitHub Web Interface:**
   1. Navigate to the appropriate level (Repository/Environment/Organization)
   2. Click **New repository secret** or **New repository variable**
   3. Enter **Name** (case-sensitive, no spaces)
   4. Enter **Value** (the actual secret or variable value)
   5. Click **Add secret** or **Add variable**

   **Via GitHub CLI (Alternative):**
   ```bash
   # Repository level
   gh secret set SECRET_NAME --body "secret_value"
   gh variable set VARIABLE_NAME --body "variable_value"

   # Environment level
   gh secret set SECRET_NAME --body "secret_value" --env production
   gh variable set VARIABLE_NAME --body "variable_value" --env production

   # Organization level (requires org admin)
   gh secret set SECRET_NAME --body "secret_value" --org organization_name
   gh variable set VARIABLE_NAME --body "variable_value" --org organization_name
   ```

   #### Security Best Practices

   - **Use environment-specific secrets** when possible
   - **Rotate secrets regularly** (at least quarterly)
   - **Use different secrets** for staging and production
   - **Never commit secrets** to version control
   - **Use organization secrets** for shared infrastructure
   - **Limit repository access** for organization secrets
   - **Use GitHub's built-in secret scanning** to detect exposed secrets

### Server Requirements

For remote deployment (recommended for production):

```bash
# Install Docker and Docker Compose on server
curl -fsSL https://get.docker.com | sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment directory
sudo mkdir -p /opt/pulseplay
sudo chown $USER:$USER /opt/pulseplay
```

## 📝 Workflow Configuration

### Trigger Conditions

The workflow runs on:
- **Push** to `main` or `develop` branches
- **Pull Requests** targeting `main`
- **Manual trigger** via GitHub Actions UI

### Environment-Specific Deployment

```yaml
# Staging deployment (develop branch)
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  environment: staging
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to staging
      run: |
        # Access environment-level secrets
        ssh -i ~/.ssh/deploy_key ${{ secrets.STAGING_SSH_PRIVATE_KEY }} ${{ secrets.STAGING_SERVER_USER }}@${{ secrets.STAGING_SERVER_HOST }}
        
        # Access environment-level variables
        echo "API URL: ${{ vars.VITE_API_URL }}"
        echo "Frontend URL: ${{ vars.FRONTEND_URL }}"

# Production deployment (main branch)
deploy-production:
  if: github.ref == 'refs/heads/main'
  environment: production
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: |
        # Access environment-level secrets
        ssh -i ~/.ssh/deploy_key ${{ secrets.SSH_PRIVATE_KEY }} ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}
        
        # Access organization-level secrets (if configured)
        echo "Using shared DB: ${{ secrets.ORG_MONGODB_ATLAS_URI }}"
```

### Accessing Variables in Builds

```yaml
build-frontend:
  runs-on: ubuntu-latest
  steps:
    - name: Build frontend image
      uses: docker/build-push-action@v5
      with:
        file: Dockerfile.frontend
        push: true
        tags: ghcr.io/juxtaduo/pulseplay:latest-frontend
        build-args: |
          # Repository-level variables
          VITE_AUTH0_DOMAIN=${{ vars.VITE_AUTH0_DOMAIN }}
          VITE_AUTH0_CLIENT_ID=${{ vars.VITE_AUTH0_CLIENT_ID }}
          VITE_AUTH0_AUDIENCE=${{ vars.VITE_AUTH0_AUDIENCE }}
          VITE_API_URL=${{ vars.VITE_API_URL }}
          
          # Organization-level variables (fallback)
          VITE_AUTH0_DOMAIN=${{ vars.ORG_VITE_AUTH0_DOMAIN || vars.VITE_AUTH0_DOMAIN }}
          VITE_AUTH0_CLIENT_ID=${{ vars.ORG_VITE_AUTH0_CLIENT_ID || vars.VITE_AUTH0_CLIENT_ID }}
```

### Conditional Secret Access

```yaml
deploy-with-fallbacks:
  runs-on: ubuntu-latest
  steps:
    - name: Configure deployment
      run: |
        # Try environment secrets first, then repository secrets
        DB_URI="${{ secrets.MONGODB_ATLAS_URI || secrets.ORG_MONGODB_ATLAS_URI }}"
        API_KEY="${{ secrets.GEMINI_API_KEY || secrets.ORG_GEMINI_API_KEY }}"
        
        if [ -z "$DB_URI" ]; then
          echo "Error: No database URI found in secrets"
          exit 1
        fi
        
        echo "Database configured successfully"
```

## 🔧 Build Process

### Multi-Stage Docker Builds

The workflow builds two separate images:

1. **Backend Image** (`Dockerfile`)
   - Multi-stage build (builder → production)
   - Includes Node.js runtime and compiled application
   - Tagged as: `ghcr.io/juxtaduo/pulseplay:latest-backend`

2. **Frontend Image** (`Dockerfile.frontend`)
   - Multi-stage build (builder → nginx)
   - Includes built React app served by Nginx
   - Tagged as: `ghcr.io/juxtaduo/pulseplay:latest-frontend`

### Build Arguments

Frontend build receives environment variables:
```yaml
build-args: |
  VITE_AUTH0_DOMAIN=${{ vars.VITE_AUTH0_DOMAIN }}
  VITE_AUTH0_CLIENT_ID=${{ vars.VITE_AUTH0_CLIENT_ID }}
  VITE_AUTH0_AUDIENCE=${{ vars.VITE_AUTH0_AUDIENCE }}
  VITE_API_URL=${{ vars.VITE_API_URL }}
```

## 🔐 Security Features

### Vulnerability Scanning

```yaml
# Trivy scans both images for vulnerabilities
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/juxtaduo/pulseplay:latest-backend
    format: 'sarif'
    output: 'trivy-backend-results.sarif'
```

### SBOM Generation

```yaml
# Generates Software Bill of Materials
- name: Generate artifact attestation
  uses: actions/attest-build-provenance@v1
  with:
    subject-name: ghcr.io/juxtaduo/pulseplay:latest-backend
    subject-digest: ${{ steps.push-backend.outputs.digest }}
    push-to-registry: true
```

## 🚀 Deployment Strategies

### Option 1: Local Deployment (GitHub Runner)

The current workflow deploys directly on the GitHub Actions runner:

```bash
# Login to registry
echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin

# Modify docker-compose.atlas.yml to use built images
sed -i 's|build:|image: ghcr.io/juxtaduo/pulseplay:latest-backend|' docker-compose.atlas.yml

# Deploy
docker-compose -f docker-compose.atlas.yml pull
docker-compose -f docker-compose.atlas.yml up -d
```

### Option 2: Remote Server Deployment

For production, modify the deployment step to SSH to your server:

```yaml
- name: Deploy to production
  run: |
    # SSH to server
    ssh -o StrictHostKeyChecking=no -i ~/.ssh/deploy_key ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
      cd /opt/pulseplay
      
      # Login to registry
      echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
      
      # Pull latest code
      git pull origin main
      
      # Modify compose file
      sed -i 's|build:|image: ghcr.io/juxtaduo/pulseplay:latest-backend|' docker-compose.atlas.yml
      
      # Deploy
      docker-compose -f docker-compose.atlas.yml pull
      docker-compose -f docker-compose.atlas.yml up -d
    EOF
```

## 📊 Monitoring & Logs

### Workflow Logs

View deployment logs in GitHub Actions:
1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Expand the **deploy-production** or **deploy-staging** job

### Application Logs

After deployment, monitor application logs:

```bash
# View all service logs
docker-compose -f docker-compose.atlas.yml logs -f

# View specific service logs
docker-compose -f docker-compose.atlas.yml logs -f backend
docker-compose -f docker-compose.atlas.yml logs -f frontend
```

### Health Checks

```bash
# Check service status
docker-compose -f docker-compose.atlas.yml ps

# Test health endpoints
curl http://localhost:3000/api/health  # Backend
curl http://localhost:80/health        # Frontend
```

## 🐛 Troubleshooting

### Build Failures

**Issue**: `docker build` fails
```bash
# Check build logs in GitHub Actions
# Common causes:
# - Missing build arguments
# - Network timeouts during npm install
# - Insufficient runner resources
```

**Solution**: Increase timeout or optimize Dockerfile

### Deployment Failures

**Issue**: Services won't start
```bash
# Check environment variables
docker-compose -f docker-compose.atlas.yml exec backend env

# Verify image tags
docker images | grep pulseplay

# Check service dependencies
docker-compose -f docker-compose.atlas.yml ps
```

### Registry Issues

**Issue**: `docker pull` fails
```bash
# Check GitHub token permissions
# Verify repository visibility (public repos only)
# Check rate limits (anonymous users: 100 pulls/hour)
```

### Secrets and Variables Issues

**Issue**: `secrets.SECRET_NAME` is not available
```bash
# Check secret scope level:
# - Repository secrets: Available in all workflows
# - Environment secrets: Only available in jobs targeting that environment
# - Organization secrets: Check repository access permissions

# Verify secret naming (case-sensitive)
# Check if secret exists in the correct scope
# Ensure proper environment targeting in job configuration
```

**Issue**: Variables not resolving in build args
```bash
# Check variable scope:
# - Repository variables: Use vars.VARIABLE_NAME
# - Organization variables: Use vars.ORG_VARIABLE_NAME
# - Environment variables: Use vars.VARIABLE_NAME in environment jobs

# Verify variable naming (case-sensitive)
# Check if workflow has access to the variable scope
```

**Issue**: SSH deployment fails
```bash
# Verify SSH key format (should be private key, not public)
# Check SSH key permissions (should be 600)
# Ensure server host and user are correct
# Test SSH connection manually first
```

**Issue**: Environment-specific deployment not triggering
```bash
# Check branch protection rules
# Verify environment name matches exactly
# Ensure required reviewers are set for environment
# Check if deployment is blocked by environment protection
```

**Issue**: Organization secrets not accessible
```bash
# Verify organization admin permissions
# Check repository access list for the secret
# Ensure secret is not repository-specific
# Confirm organization billing plan supports the feature
```

## 🔄 Rollback Strategy

### Manual Rollback

```bash
# Rollback to previous image tag
docker tag ghcr.io/juxtaduo/pulseplay:previous-backend ghcr.io/juxtaduo/pulseplay:latest-backend
docker-compose -f docker-compose.atlas.yml up -d
```

### Automated Rollback

Add rollback job to workflow:

```yaml
rollback:
  if: failure() && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Rollback deployment
      run: |
        # Implement rollback logic
        echo "Rolling back to previous version..."
```

## 📈 Performance Optimization

### Build Caching

```yaml
# Use GitHub Actions cache
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Multi-Platform Builds

```yaml
# Build for multiple architectures
platforms: linux/amd64,linux/arm64
```

### Layer Caching

Optimize Dockerfile for better caching:
```dockerfile
# Copy package files first
COPY package*.json ./
RUN npm ci

# Copy source code after
COPY . .
```

## 🔒 Security Best Practices

### Secrets Management

- **Use appropriate scope levels:**
  - Repository secrets for repo-specific credentials
  - Environment secrets for environment-specific sensitive data
  - Organization secrets for shared infrastructure across multiple repos
- **Rotate secrets regularly** (quarterly minimum)
- **Use different secrets** for staging and production environments
- **Never commit secrets** to version control
- **Limit repository access** for organization-level secrets
- **Use GitHub's secret scanning** to detect exposed secrets
- **Audit secret usage** through GitHub's security insights

### Variables Management

- **Use variables for non-sensitive configuration** that may change
- **Environment variables** for environment-specific settings
- **Organization variables** for shared configuration across repos
- **Repository variables** for repo-specific settings
- **Version control variable changes** through workflow updates

### Access Control

- **Environment protection rules:**
  - Require reviews for production deployments
  - Restrict deployment branches
  - Require specific user/role permissions
- **Organization secret policies:**
  - Limit repositories that can access organization secrets
  - Require admin approval for secret creation
  - Regular audit of secret usage

### Best Practices by Level

#### Repository Level
```yaml
# Use for: Repo-specific deployment credentials
# Pros: Simple, direct access
# Cons: Not reusable across repos
secrets:
  SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
  SERVER_HOST: ${{ secrets.SERVER_HOST }}
```

#### Environment Level
```yaml
# Use for: Environment-specific sensitive data
# Pros: Environment isolation, protection rules
# Cons: More complex setup
environment: production
secrets:
  MONGODB_ATLAS_URI: ${{ secrets.MONGODB_ATLAS_URI }}
  AUTH0_CLIENT_SECRET: ${{ secrets.AUTH0_CLIENT_SECRET }}
```

#### Organization Level
```yaml
# Use for: Shared infrastructure across repos
# Pros: Centralized management, reusability
# Cons: Requires org admin, broader access
secrets:
  ORG_MONGODB_ATLAS_URI: ${{ secrets.ORG_MONGODB_ATLAS_URI }}
  ORG_AUTH0_CLIENT_SECRET: ${{ secrets.ORG_AUTH0_CLIENT_SECRET }}
```

## 📋 Environment Variables

### Configuration Levels

GitHub Actions supports secrets and variables at three levels:

| Level | Scope | Use Case | Access in Workflows |
|-------|-------|----------|-------------------|
| **Repository** | Single repository | Repo-specific config | `secrets.SECRET_NAME`, `vars.VARIABLE_NAME` |
| **Environment** | Specific environment | Environment-specific config | `secrets.SECRET_NAME`, `vars.VARIABLE_NAME` |
| **Organization** | All repos in org | Shared infrastructure | `secrets.SECRET_NAME`, `vars.VARIABLE_NAME` |

### Required Variables by Level

#### Repository-Level Variables (Recommended)
```bash
# Frontend configuration
VITE_AUTH0_DOMAIN      # Auth0 domain (e.g., your-app.auth0.com)
VITE_AUTH0_CLIENT_ID   # Auth0 SPA client ID
VITE_AUTH0_AUDIENCE    # Auth0 API audience
VITE_API_URL           # API URL for frontend (e.g., https://api.pulseplay.ai)
FRONTEND_URL           # Frontend URL for CORS (e.g., https://pulseplay.ai)
```

#### Environment-Level Variables (For multi-environment setups)
```bash
# Production environment
VITE_API_URL=https://api.pulseplay.ai
FRONTEND_URL=https://pulseplay.ai

# Staging environment
VITE_API_URL=https://staging-api.pulseplay.ai
FRONTEND_URL=https://staging.pulseplay.ai
```

#### Organization-Level Variables (For shared config)
```bash
# Shared across multiple repositories
ORG_VITE_AUTH0_DOMAIN=your-org.auth0.com
ORG_VITE_AUTH0_CLIENT_ID=shared_client_id
ORG_VITE_AUTH0_AUDIENCE=https://api.your-org.com
```

### Required Secrets by Level

#### Repository-Level Secrets
```bash
# Deployment credentials
SSH_PRIVATE_KEY        # Private SSH key for production server
SERVER_HOST            # Production server hostname/IP
SERVER_USER            # SSH username for production

STAGING_SSH_PRIVATE_KEY # Private SSH key for staging server
STAGING_SERVER_HOST     # Staging server hostname/IP
STAGING_SERVER_USER     # SSH username for staging
```

#### Environment-Level Secrets
```bash
# Production environment
MONGODB_ATLAS_URI      # MongoDB Atlas connection string
AUTH0_CLIENT_SECRET    # Auth0 client secret
AUTH0_ISSUER_BASE_URL  # Auth0 issuer base URL
GEMINI_API_KEY         # Google Gemini API key
GRADIENT_AI_API_KEY    # Gradient AI API key (if used)

# Staging environment (can share some secrets)
MONGODB_ATLAS_URI      # Same Atlas cluster, different database
AUTH0_CLIENT_SECRET    # Same Auth0 application
GEMINI_API_KEY         # Same API key
```

#### Organization-Level Secrets
```bash
# Shared infrastructure secrets
ORG_MONGODB_ATLAS_URI     # Organization-wide MongoDB Atlas
ORG_AUTH0_CLIENT_SECRET   # Shared Auth0 credentials
ORG_AUTH0_ISSUER_BASE_URL # Shared Auth0 configuration
ORG_GEMINI_API_KEY        # Shared AI API keys
ORG_GRADIENT_AI_API_KEY   # Shared AI API keys
```

### Setting Server Environment

Create `.env` file on deployment server (for local deployment option):

```bash
# MongoDB Atlas (from secrets)
MONGODB_ATLAS_URI=${{ secrets.MONGODB_ATLAS_URI }}

# Auth0 (from secrets)
AUTH0_CLIENT_SECRET=${{ secrets.AUTH0_CLIENT_SECRET }}
AUTH0_ISSUER_BASE_URL=${{ secrets.AUTH0_ISSUER_BASE_URL }}

# API Keys (from secrets)
GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
GRADIENT_AI_API_KEY=${{ secrets.GRADIENT_AI_API_KEY }}

# Frontend config (from variables)
FRONTEND_URL=${{ vars.FRONTEND_URL }}
```

### Workflow Variable Access

In your GitHub Actions workflow (`.github/workflows/docker-deploy.yml`):

```yaml
# Access repository-level variables
- name: Build frontend
  run: |
    docker build -f Dockerfile.frontend \
      --build-arg VITE_AUTH0_DOMAIN=${{ vars.VITE_AUTH0_DOMAIN }} \
      --build-arg VITE_AUTH0_CLIENT_ID=${{ vars.VITE_AUTH0_CLIENT_ID }} \
      --build-arg VITE_API_URL=${{ vars.VITE_API_URL }} \
      -t frontend .

# Access environment-level secrets
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  environment: production
  run: |
    ssh -i ~/.ssh/deploy_key ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}

# Access organization-level secrets
- name: Use shared database
  run: |
    echo "Connecting to: ${{ secrets.ORG_MONGODB_ATLAS_URI }}"
```

## 🎯 Best Practices

### Choosing Secret and Variable Levels

#### When to Use Repository Level
- **Single repository projects**
- **Repository-specific deployment credentials** (SSH keys, server hosts)
- **Simple setups** without complex environment management
- **Quick prototyping** and development

#### When to Use Environment Level
- **Multiple deployment environments** (staging, production, testing)
- **Environment-specific sensitive data** (different DBs, API keys per env)
- **Enhanced security** with environment protection rules
- **Large projects** with complex deployment workflows

#### When to Use Organization Level
- **Multiple repositories** sharing infrastructure
- **Shared services** (common databases, auth providers)
- **Centralized secret management** across teams
- **Enterprise organizations** with standardized tooling

### Branch Strategy

- `main`: Production deployments
- `develop`: Staging deployments
- Feature branches: Testing only

### Deployment Frequency

- **Staging**: Deploy on every push to `develop`
- **Production**: Deploy only after thorough testing
- **Hotfixes**: Use separate workflow for urgent fixes

### Environment Protection Rules

```yaml
# Example environment configuration
production:
  deployment_branch_policy:
    protected_branches: true
    custom_branch_policies: false
  required_reviewers:
    - type: User
      name: admin-user
    - type: Team
      name: devops-team
  restrictions:
    allow_force_pushes: false
    allow_deletions: false
```

### Monitoring

- Set up health checks
- Monitor resource usage
- Configure log aggregation
- Set up alerts for failures

### Backup Strategy

- Regular database backups
- Image version pinning
- Configuration backups
- Rollback procedures

## 📞 Support

### PulsePlay Repository Setup Example

For the `juxtaduo/pulseplay` repository, here's how to configure secrets and variables:

#### Repository-Level Configuration
```
Repository: juxtaduo/pulseplay
Settings → Secrets and variables → Actions

Secrets:
├── SSH_PRIVATE_KEY          # For production server access
├── SERVER_HOST             # pulseplay.ai or your server IP
├── SERVER_USER             # ubuntu or your SSH user
├── STAGING_SSH_PRIVATE_KEY # For staging server access
├── STAGING_SERVER_HOST     # staging.pulseplay.ai
├── STAGING_SERVER_USER     # ubuntu
├── MONGODB_ATLAS_URI       # mongodb+srv://user:pass@cluster.mongodb.net/pulseplay
├── AUTH0_CLIENT_SECRET     # From Auth0 application settings
├── AUTH0_ISSUER_BASE_URL   # https://juxtaduo-pulseplay.auth0.com
├── GEMINI_API_KEY          # From Google AI Studio
└── GRADIENT_AI_API_KEY     # If using Gradient AI

Variables:
├── VITE_AUTH0_DOMAIN       # juxtaduo-pulseplay.auth0.com
├── VITE_AUTH0_CLIENT_ID    # From Auth0 SPA application
├── VITE_AUTH0_AUDIENCE     # https://api.pulseplay.ai
├── VITE_API_URL            # https://api.pulseplay.ai
└── FRONTEND_URL            # https://pulseplay.ai
```

#### Environment-Level Configuration
```
Settings → Environments

Production Environment:
├── Secrets:
│   ├── MONGODB_ATLAS_URI
│   ├── AUTH0_CLIENT_SECRET
│   ├── GEMINI_API_KEY
│   └── SSH_PRIVATE_KEY
└── Variables:
    ├── VITE_API_URL=https://api.pulseplay.ai
    └── FRONTEND_URL=https://pulseplay.ai

Staging Environment:
├── Secrets:
│   ├── MONGODB_ATLAS_URI (same cluster, different DB)
│   ├── AUTH0_CLIENT_SECRET (same app)
│   ├── GEMINI_API_KEY (same key)
│   └── STAGING_SSH_PRIVATE_KEY
└── Variables:
    ├── VITE_API_URL=https://staging-api.pulseplay.ai
    └── FRONTEND_URL=https://staging.pulseplay.ai
```

#### Organization-Level Configuration (if applicable)
```
Organization: juxtaduo (if you have multiple repos)
Settings → Secrets and variables → Actions

Organization Secrets:
├── ORG_MONGODB_ATLAS_URI
├── ORG_AUTH0_CLIENT_SECRET
├── ORG_GEMINI_API_KEY
└── ORG_GRADIENT_AI_API_KEY

Organization Variables:
├── ORG_VITE_AUTH0_DOMAIN
├── ORG_VITE_AUTH0_CLIENT_ID
└── ORG_VITE_AUTH0_AUDIENCE

Repository Access: Grant access to 'pulseplay' repository
```

### Quick Setup Commands

```bash
# Using GitHub CLI for repository secrets
gh secret set SSH_PRIVATE_KEY --body "$(cat ~/.ssh/pulseplay_deploy_key)"
gh secret set SERVER_HOST --body "pulseplay.ai"
gh secret set SERVER_USER --body "ubuntu"

# Using GitHub CLI for repository variables
gh variable set VITE_AUTH0_DOMAIN --body "juxtaduo-pulseplay.auth0.com"
gh variable set VITE_AUTH0_CLIENT_ID --body "your_spa_client_id"
gh variable set VITE_API_URL --body "https://api.pulseplay.ai"
```

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Docker Buildx**: https://docs.docker.com/develop/dev-best-practices/
- **Trivy Security**: https://aquasecurity.github.io/trivy/
- **Issues**: https://github.com/juxtaduo/pulseplay/issues

## 📄 Related Documentation

- `DOCKER_DEPLOYMENT.md` - Complete Docker deployment guide
- `DOCKER_QUICK_REFERENCE.md` - Quick commands and troubleshooting
- `DOCKER_FILES_SUMMARY.md` - File descriptions and architecture
- `.github/workflows/docker-deploy.yml` - The actual workflow file

---

**Last Updated**: October 25, 2025
**Workflow Version**: 1.1
**Status**: ✅ Active</content>
<parameter name="filePath">/home/rl/.github/pulseplay/docs/docker/DOCKER_GITHUB_ACTIONS_DEPLOYMENT.md