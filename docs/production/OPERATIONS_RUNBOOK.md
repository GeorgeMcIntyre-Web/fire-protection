# Operations Runbook

**Fire Protection Tracker - DevOps & Operations Guide**

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Monitoring & Alerting](#monitoring--alerting)
4. [Common Operations](#common-operations)
5. [Health Checks](#health-checks)
6. [Backup & Recovery](#backup--recovery)
7. [Performance Tuning](#performance-tuning)
8. [Troubleshooting](#troubleshooting)
9. [Emergency Contacts](#emergency-contacts)

---

## Overview

### Service Details

- **Application Name:** Fire Protection Tracker
- **Environment:** Cloudflare Pages (Production)
- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Cloudflare Pages
- **Repository:** GitHub
- **CI/CD:** GitHub Actions

### Key Metrics

- **Uptime Target:** 99.9%
- **Response Time Target:** < 2 seconds
- **Error Rate Target:** < 0.1%
- **Recovery Time Objective (RTO):** 1 hour
- **Recovery Point Objective (RPO):** 24 hours

---

## System Architecture

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│  Cloudflare Pages   │
│  (Frontend Hosting) │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│    Supabase         │
│  - PostgreSQL DB    │
│  - Authentication   │
│  - Storage          │
│  - Real-time        │
└─────────────────────┘
```

### Critical Dependencies

1. **Cloudflare Pages**
   - Status: https://www.cloudflarestatus.com/
   - Purpose: Static site hosting, CDN

2. **Supabase**
   - Status: https://status.supabase.com/
   - Purpose: Backend services, database

3. **GitHub**
   - Status: https://www.githubstatus.com/
   - Purpose: Source control, CI/CD

---

## Monitoring & Alerting

### Health Check Endpoints

```bash
# Application health
curl https://fire-protection-tracker.pages.dev

# Supabase health
curl https://[project-id].supabase.co/rest/v1/
```

### Key Metrics to Monitor

1. **Application Performance**
   - Page load time
   - Time to interactive (TTI)
   - First contentful paint (FCP)
   - Cumulative layout shift (CLS)

2. **Error Rates**
   - JavaScript errors
   - API failures
   - Authentication failures

3. **User Metrics**
   - Active users
   - Session duration
   - Feature usage

### Monitoring Tools

#### Cloudflare Analytics
- URL: https://dash.cloudflare.com/
- Metrics: Traffic, bandwidth, requests

#### Supabase Dashboard
- URL: https://app.supabase.com/
- Metrics: Database queries, API usage, storage

#### Browser DevTools
- Performance tab for client-side metrics
- Network tab for API calls
- Console for errors

### Setting Up Alerts

#### 1. Cloudflare Notifications
```bash
# Navigate to: Cloudflare Dashboard > Notifications
# Set up alerts for:
- High error rate (>5%)
- Traffic anomalies
- SSL certificate expiration
```

#### 2. Supabase Alerts
```bash
# Navigate to: Supabase Dashboard > Settings > Alerts
# Configure:
- Database connection pool exhaustion
- High CPU usage (>80%)
- Storage limits approaching
```

#### 3. GitHub Actions Notifications
```yaml
# Already configured in .github/workflows/*.yml
# Notifications sent to:
- Email (repository watchers)
- GitHub notifications
- PR comments (for deployments)
```

---

## Common Operations

### Deploying Changes

#### Automatic Deployment (Recommended)
```bash
# Push to main branch triggers automatic deployment
git push origin main

# Monitor deployment
# GitHub Actions: https://github.com/[org]/[repo]/actions
```

#### Manual Deployment
```bash
# Build locally
npm run build

# Deploy via Cloudflare CLI (if needed)
npx wrangler pages publish dist --project-name=fire-protection-tracker
```

### Rolling Back

See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) for detailed steps.

Quick rollback:
```bash
# In Cloudflare Dashboard:
# 1. Navigate to Pages > fire-protection-tracker
# 2. Go to Deployments
# 3. Find previous working deployment
# 4. Click "Retry deployment" or "Rollback"
```

### Updating Environment Variables

#### Cloudflare Pages
```bash
# Via Cloudflare Dashboard:
# 1. Pages > fire-protection-tracker > Settings > Environment variables
# 2. Add/Edit variables
# 3. Trigger redeploy
```

#### Local Development
```bash
# Copy .env.example to .env
cp env.example .env

# Edit .env with your values
nano .env
```

### Database Maintenance

#### Running Migrations
```sql
-- Connect to Supabase SQL Editor
-- Run migration scripts from supabase-*.sql files
```

#### Creating Backups
```bash
# Run backup script
npm run backup

# Or with specific configuration
node scripts/backup-database.ts

# Backups stored in ./backups/
```

#### Restoring from Backup
```bash
# List available backups
node scripts/restore-database.ts

# Restore specific backup (dry run first)
node scripts/restore-database.ts ./backups/backup-YYYY-MM-DD --dry-run

# Actual restore
node scripts/restore-database.ts ./backups/backup-YYYY-MM-DD
```

---

## Health Checks

### Automated Health Checks

Health checks run automatically via:
- Cloudflare's edge monitoring
- Supabase internal monitoring
- GitHub Actions workflows (on schedule)

### Manual Health Check Script

Create `scripts/health-check.sh`:
```bash
#!/bin/bash

echo "Running health checks..."

# Check frontend
echo "1. Checking frontend..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://fire-protection-tracker.pages.dev)
if [ $STATUS -eq 200 ]; then
  echo "✓ Frontend is up"
else
  echo "✗ Frontend is down (Status: $STATUS)"
fi

# Check Supabase
echo "2. Checking Supabase..."
# Add your Supabase URL
SUPABASE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://[project-id].supabase.co/rest/v1/)
if [ $SUPABASE_STATUS -eq 200 ] || [ $SUPABASE_STATUS -eq 401 ]; then
  echo "✓ Supabase is up"
else
  echo "✗ Supabase is down (Status: $SUPABASE_STATUS)"
fi

echo "Health check complete!"
```

### Performance Check

```bash
# Build the project
npm run build

# Run performance analysis
npm run performance-check

# Or manually
node scripts/performance-check.ts
```

---

## Backup & Recovery

### Backup Strategy

#### Automatic Backups
- **Supabase:** Automatic daily backups (last 7 days)
- **Code:** Git repository (infinite retention)

#### Manual Backups
```bash
# Database backup
npm run backup
# or
node scripts/backup-database.ts

# Configuration backup
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  .env.example \
  vite.config.ts \
  package.json \
  tsconfig.json
```

### Backup Schedule

| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Database | Daily | 7 days | ./backups/ |
| Code | On commit | Infinite | GitHub |
| Config | Weekly | 30 days | ./backups/config/ |

### Recovery Procedures

See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) for detailed recovery steps.

---

## Performance Tuning

### Frontend Optimization

1. **Bundle Size**
   ```bash
   # Analyze bundle
   npm run build
   npm run performance-check
   ```

2. **Code Splitting**
   - Already configured in `vite.config.ts`
   - Lazy load routes if needed

3. **Image Optimization**
   - Use WebP format
   - Compress images before upload
   - Use appropriate sizes

### Database Optimization

1. **Query Optimization**
   ```sql
   -- Add indexes for frequently queried fields
   CREATE INDEX idx_documents_user_id ON documents(user_id);
   CREATE INDEX idx_projects_status ON projects(status);
   ```

2. **Connection Pooling**
   - Supabase handles automatically
   - Monitor in dashboard

3. **Cache Strategy**
   - Use Cloudflare edge caching
   - Set appropriate cache headers

### Monitoring Performance

```bash
# Run Lighthouse audit
npx lighthouse https://fire-protection-tracker.pages.dev \
  --output=html \
  --output-path=./lighthouse-report.html

# Open report
open lighthouse-report.html
```

---

## Troubleshooting

### Common Issues

#### 1. Application Not Loading

**Symptoms:** White screen, 404 error

**Diagnosis:**
```bash
# Check if site is accessible
curl -I https://fire-protection-tracker.pages.dev

# Check deployment status
# GitHub: Actions tab
# Cloudflare: Pages > Deployments
```

**Resolution:**
1. Check Cloudflare Pages deployment status
2. Verify last deployment succeeded
3. Check for Cloudflare service issues
4. If needed, trigger redeployment

#### 2. Database Connection Errors

**Symptoms:** API errors, authentication failures

**Diagnosis:**
```bash
# Check Supabase status
curl https://[project-id].supabase.co/rest/v1/

# Check browser console for errors
```

**Resolution:**
1. Verify Supabase service status
2. Check API keys are correct
3. Verify database connection limits
4. Check for IP restrictions

#### 3. Slow Performance

**Symptoms:** Long load times, slow interactions

**Diagnosis:**
```bash
# Run performance check
npm run build
npm run performance-check

# Check network tab in browser
# Look for slow API calls or large assets
```

**Resolution:**
1. Optimize large assets
2. Review database queries
3. Check for memory leaks
4. Enable caching

#### 4. Authentication Issues

**Symptoms:** Cannot login, session expires

**Diagnosis:**
- Check browser console for auth errors
- Verify Supabase auth settings
- Check for CORS issues

**Resolution:**
1. Clear browser cookies/cache
2. Verify auth providers enabled
3. Check redirect URLs configured
4. Review JWT settings

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');

// Reload page to see debug logs
```

### Getting Help

1. Check this runbook
2. Review [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
3. Check service status pages
4. Review GitHub Issues
5. Contact development team

---

## Emergency Contacts

### On-Call Rotation

| Role | Primary | Backup |
|------|---------|--------|
| DevOps | TBD | TBD |
| Backend | TBD | TBD |
| Frontend | TBD | TBD |

### Escalation Path

1. **Level 1:** On-call engineer (15 min response)
2. **Level 2:** Team lead (30 min response)
3. **Level 3:** Engineering manager (1 hour response)

### Service Contacts

- **Cloudflare Support:** https://support.cloudflare.com/
- **Supabase Support:** support@supabase.io
- **GitHub Support:** https://support.github.com/

---

## Maintenance Windows

### Scheduled Maintenance

- **Day:** Sunday
- **Time:** 2:00 AM - 4:00 AM UTC
- **Frequency:** Monthly (as needed)
- **Notification:** 72 hours advance notice

### Emergency Maintenance

- Can be scheduled with 2-hour notice
- Only for critical security or stability issues
- Team lead approval required

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run lint             # Run linter

# Operations
npm run backup           # Backup database
npm run performance-check # Check performance

# Deployment
git push origin main     # Deploy to production
```

### Configuration Files

- `.github/workflows/*.yml` - CI/CD configuration
- `vite.config.ts` - Build configuration
- `package.json` - Dependencies and scripts
- `env.example` - Environment variables template

### Documentation Links

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Incident Response](./INCIDENT_RESPONSE.md)
- [Rollback Procedures](./ROLLBACK_PROCEDURES.md)
- [Monitoring Setup](./MONITORING_SETUP.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)

---

**Last Updated:** 2025-10-31  
**Version:** 1.0.0  
**Maintained By:** DevOps Team
