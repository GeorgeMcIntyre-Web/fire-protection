# Deployment Guide

**Fire Protection Tracker - Comprehensive Deployment Documentation**

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Methods](#deployment-methods)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Environment Variables](#environment-variables)
7. [Deployment Verification](#deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Architecture

```
Developer → GitHub → GitHub Actions → Cloudflare Pages → Production
                          ↓
                    Run Tests & Checks
                          ↓
                      Build Assets
```

### Environments

| Environment | Branch | URL | Auto-Deploy |
|------------|--------|-----|-------------|
| Production | `main` | https://fire-protection-tracker.pages.dev | ✅ Yes |
| Preview | PR branches | https://[pr-number].[project].pages.dev | ✅ Yes |
| Development | Local | http://localhost:5173 | ❌ No |

---

## Prerequisites

### Required Tools

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18.x or v20.x
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version  # Should be v9.x or higher
   ```

3. **Git**
   ```bash
   git --version  # Any recent version
   ```

### Required Accounts

- [x] GitHub account (with repository access)
- [x] Cloudflare account
- [x] Supabase account

### Required Secrets

The following secrets must be configured in GitHub:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Cloudflare Dashboard → Overview |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | Supabase Dashboard → Settings → API |

---

## Environment Setup

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/[org]/fire-protection-tracker.git
cd fire-protection-tracker
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
```bash
# Copy example environment file
cp env.example .env

# Edit .env with your values
nano .env
```

Required variables in `.env`:
```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 4. Start Development Server
```bash
npm run dev
```

Application will be available at http://localhost:5173

---

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

#### Push to Main Branch
```bash
# Make changes
git add .
git commit -m "Your commit message"

# Push to trigger deployment
git push origin main
```

This automatically:
1. Triggers GitHub Actions workflow
2. Runs tests and linting
3. Builds the application
4. Deploys to Cloudflare Pages
5. Notifies team of deployment status

#### Monitor Deployment
1. Go to GitHub repository
2. Click "Actions" tab
3. Click on the latest workflow run
4. Monitor progress

#### Deployment Timeline
- **Total Duration:** 3-5 minutes
  - Setup: 30 seconds
  - Tests: 1-2 minutes
  - Build: 1-2 minutes
  - Deploy: 30-60 seconds

---

### Method 2: Manual Deployment via Cloudflare CLI

#### Prerequisites
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

#### Deploy
```bash
# Build the project
npm run build

# Deploy
npx wrangler pages publish dist --project-name=fire-protection-tracker
```

#### When to Use
- CI/CD pipeline is down
- Emergency hotfix needed immediately
- Testing deployment process

---

### Method 3: Manual Deployment via Cloudflare Dashboard

#### Steps
1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Zip the Build Folder**
   ```bash
   zip -r dist.zip dist/
   ```

3. **Upload to Cloudflare**
   - Go to Cloudflare Dashboard
   - Navigate to Pages → fire-protection-tracker
   - Click "Create deployment"
   - Upload `dist.zip`
   - Click "Save and Deploy"

#### When to Use
- As a last resort
- CLI tools not available
- Quick one-off deployment

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Test Workflow (`.github/workflows/test.yml`)

**Trigger:** On push or pull request to `main` or `develop`

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests
5. Upload coverage reports

**Duration:** ~2 minutes

---

#### 2. Lint Workflow (`.github/workflows/lint.yml`)

**Trigger:** On push or pull request to `main` or `develop`

**Steps:**
1. Run ESLint
2. Type checking (TypeScript)
3. Code formatting (Prettier)
4. Dependency audit

**Duration:** ~1 minute

---

#### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger:** 
- Push to `main` (production)
- Pull requests (preview)
- Manual trigger

**Steps:**
1. Build application
2. Run linting (optional)
3. Run tests (optional)
4. Deploy to Cloudflare Pages
5. Verify deployment
6. Post notification

**Duration:** ~3-4 minutes

**Preview Deployments:**
- Every PR gets a preview deployment
- URL: `https://[pr-number].fire-protection-tracker.pages.dev`
- Automatically updated on new commits
- Automatically cleaned up when PR is closed

---

#### 4. Security Workflow (`.github/workflows/security.yml`)

**Trigger:** 
- Push to `main` or `develop`
- Daily at 2 AM UTC
- Manual trigger

**Steps:**
1. Dependency security audit
2. CodeQL analysis
3. Secret scanning
4. License compliance check
5. Generate security report

**Duration:** ~5-10 minutes

---

### Workflow Diagram

```
┌─────────────┐
│   Push      │
│  to main    │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ↓                 ↓
┌──────────────┐  ┌─────────────┐
│     Test     │  │    Lint     │
│   Workflow   │  │  Workflow   │
└──────┬───────┘  └──────┬──────┘
       │                 │
       └────────┬────────┘
                ↓
       ┌────────────────┐
       │     Build      │
       └────────┬───────┘
                ↓
       ┌────────────────┐
       │     Deploy     │
       │  to Cloudflare │
       └────────┬───────┘
                ↓
       ┌────────────────┐
       │    Verify      │
       │   & Notify     │
       └────────────────┘
```

---

## Environment Variables

### Build-Time Variables

These are embedded in the build and cannot be changed without redeployment:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anon key | `eyJhbGci...` |

### Setting Environment Variables

#### For Cloudflare Pages:

1. **Via Dashboard:**
   - Go to Cloudflare Dashboard
   - Navigate to Pages → fire-protection-tracker
   - Go to Settings → Environment variables
   - Add/Edit variables
   - Trigger new deployment

2. **Via CLI:**
   ```bash
   # Not directly supported by Wrangler for Pages
   # Must use dashboard or API
   ```

3. **Via GitHub Actions:**
   - Add secrets to GitHub repository
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Secrets are automatically used in workflows

#### For Local Development:

Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Important:** Never commit `.env` file to repository!

---

## Deployment Verification

### Automated Checks

The deployment workflow automatically verifies:
- [ ] Build completed successfully
- [ ] No TypeScript errors
- [ ] Deployment accessible via HTTPS
- [ ] Basic health check passes

### Manual Verification Checklist

After deployment, verify the following:

#### 1. Accessibility
```bash
# Check if site is up
curl -I https://fire-protection-tracker.pages.dev

# Expected: HTTP/2 200
```

#### 2. Authentication
- [ ] Navigate to login page
- [ ] Attempt to log in with test account
- [ ] Verify redirect to dashboard

#### 3. Core Features
- [ ] Dashboard loads correctly
- [ ] Document upload works
- [ ] Projects page accessible
- [ ] Data loads from Supabase

#### 4. Performance
```bash
# Run Lighthouse audit
npx lighthouse https://fire-protection-tracker.pages.dev --view
```

Expected scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

#### 5. Console Errors
- [ ] Open browser console (F12)
- [ ] Navigate through application
- [ ] Verify no JavaScript errors
- [ ] Check for no 404s in Network tab

#### 6. Mobile Responsiveness
- [ ] Test on mobile device or DevTools mobile view
- [ ] Verify layout is responsive
- [ ] Check touch interactions work

---

## Troubleshooting

### Common Deployment Issues

#### Issue 1: Build Fails with TypeScript Errors

**Symptoms:**
```
Error: Type checking failed
```

**Solution:**
```bash
# Run type check locally
npm run build

# Fix all TypeScript errors
# Commit and push
```

---

#### Issue 2: Environment Variables Not Working

**Symptoms:**
- API calls fail
- "undefined" in console for env variables

**Solution:**
1. Verify variables are prefixed with `VITE_`
2. Check they're set in Cloudflare Pages settings
3. Trigger new deployment after adding variables
4. Clear browser cache

---

#### Issue 3: Deployment Succeeds but Site Shows Old Version

**Symptoms:**
- New code not visible
- Old features still present

**Solution:**
```bash
# Clear Cloudflare cache
# Via dashboard: Caching → Configuration → Purge Everything

# Or wait 5 minutes for CDN propagation

# Clear browser cache
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

---

#### Issue 4: GitHub Actions Workflow Fails

**Symptoms:**
- Red X on commit
- Workflow failed notification

**Solution:**
1. Check Actions tab for error details
2. Common issues:
   - Missing secrets → Add in repo settings
   - Test failures → Fix tests locally first
   - Build errors → Run `npm run build` locally
3. Fix issue and push again

---

#### Issue 5: 404 Errors on Page Refresh

**Symptoms:**
- Routes work on initial load
- Refresh shows 404

**Solution:**
This is configured automatically in Cloudflare Pages for SPAs.

If issue persists, verify `_redirects` file or create one:
```
# Create public/_redirects
/*    /index.html   200
```

---

### Rollback Procedures

See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) for detailed rollback instructions.

**Quick Rollback:**

#### Option 1: Via Cloudflare Dashboard
1. Go to Pages → fire-protection-tracker
2. Click "View build history"
3. Find last working deployment
4. Click "Rollback to this deployment"

#### Option 2: Via Git Revert
```bash
# Find commit to revert
git log --oneline -10

# Revert the commit
git revert <commit-hash>

# Push to trigger redeployment
git push origin main
```

---

## Deployment Best Practices

### 1. Pre-Deployment Checklist

- [ ] Run tests locally: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Test in dev environment: `npm run dev`
- [ ] Review changes: `git diff`
- [ ] Update documentation if needed
- [ ] Create meaningful commit message

### 2. During Deployment

- [ ] Monitor GitHub Actions progress
- [ ] Watch for any errors or warnings
- [ ] Check deployment notifications

### 3. Post-Deployment

- [ ] Verify deployment (see checklist above)
- [ ] Monitor error logs for 15 minutes
- [ ] Check user reports/feedback
- [ ] Update team on successful deployment

### 4. Deployment Timing

**Best Times:**
- Business hours (easier to monitor)
- Tuesday-Thursday (avoid Monday/Friday)
- Morning (full day to monitor)

**Avoid:**
- Late Friday afternoons
- Before holidays
- During high-traffic periods

---

## Emergency Procedures

### Emergency Hotfix Process

For critical bugs in production:

#### 1. Create Hotfix Branch
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-description
```

#### 2. Make Minimal Fix
```bash
# Make only the necessary changes
# Test thoroughly

git add .
git commit -m "hotfix: description of critical fix"
```

#### 3. Fast-Track Deployment
```bash
# Option A: Push directly to main (emergency only)
git checkout main
git merge hotfix/critical-bug-description
git push origin main

# Option B: Create PR with urgent label
git push origin hotfix/critical-bug-description
# Create PR, mark as urgent, get quick review
```

#### 4. Monitor Closely
- Watch deployment in real-time
- Verify fix immediately
- Monitor for 30 minutes
- Post incident report

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build locally

# Testing & Quality
npm test                 # Run tests
npm run lint             # Run linter
npm run type-check       # Run TypeScript checks

# Deployment
git push origin main     # Deploy to production

# Troubleshooting
npm run build -- --debug # Debug build issues
npm ci                   # Clean install dependencies
```

### Configuration Files

- `.github/workflows/deploy.yml` - Deployment workflow
- `vite.config.ts` - Build configuration
- `package.json` - Scripts and dependencies
- `env.example` - Environment variables template

### Related Documentation

- [Operations Runbook](./OPERATIONS_RUNBOOK.md)
- [Rollback Procedures](./ROLLBACK_PROCEDURES.md)
- [Incident Response](./INCIDENT_RESPONSE.md)
- [Monitoring Setup](./MONITORING_SETUP.md)

### Support & Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Vite Docs:** https://vitejs.dev/
- **Team Support:** [Your team contact]

---

**Last Updated:** 2025-10-31  
**Version:** 1.0.0  
**Maintained By:** DevOps Team
