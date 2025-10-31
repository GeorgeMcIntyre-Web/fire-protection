# Rollback Procedures

**Fire Protection Tracker - Deployment Rollback Guide**

---

## Table of Contents

1. [Overview](#overview)
2. [When to Rollback](#when-to-rollback)
3. [Rollback Methods](#rollback-methods)
4. [Step-by-Step Procedures](#step-by-step-procedures)
5. [Post-Rollback Actions](#post-rollback-actions)
6. [Prevention](#prevention)

---

## Overview

### Purpose

This document provides clear procedures for rolling back deployments when issues are detected in production, ensuring rapid recovery and minimal user impact.

### Rollback Types

| Type | Scope | Duration | Data Impact |
|------|-------|----------|-------------|
| **Application Rollback** | Frontend code | 5-10 minutes | None |
| **Database Rollback** | Schema/data changes | 15-30 minutes | Possible |
| **Configuration Rollback** | Environment variables | 2-5 minutes | None |
| **Full System Rollback** | All components | 30-60 minutes | Possible |

### Recovery Objectives

- **RTO (Recovery Time Objective):** 15 minutes for application rollback
- **RPO (Recovery Point Objective):** 24 hours for database rollback
- **Maximum Downtime:** 30 minutes

---

## When to Rollback

### Critical Issues (Immediate Rollback)

Roll back immediately if:
- [ ] Application is completely down (SEV-1)
- [ ] Critical security vulnerability introduced
- [ ] Data corruption or loss detected
- [ ] Authentication system broken
- [ ] Error rate > 50%

### Major Issues (Consider Rollback)

Consider rollback if:
- [ ] Core feature broken (SEV-2)
- [ ] Performance degradation > 50%
- [ ] Error rate > 10%
- [ ] Database connection issues
- [ ] Multiple user reports of issues

### Minor Issues (Forward Fix Preferred)

Forward fix preferred if:
- [ ] Cosmetic issues only
- [ ] Non-critical feature affected
- [ ] Workaround available
- [ ] Issue affects < 5% of users

---

## Rollback Methods

### Method 1: Cloudflare Dashboard (Fastest)

**Best for:** Quick application rollbacks  
**Time:** 2-3 minutes  
**Risk:** Low

### Method 2: Git Revert + Redeploy

**Best for:** Permanent rollbacks with audit trail  
**Time:** 5-10 minutes  
**Risk:** Low

### Method 3: Database Restore

**Best for:** Database schema/data issues  
**Time:** 15-30 minutes  
**Risk:** Medium (possible data loss)

---

## Step-by-Step Procedures

---

## Procedure 1: Application Rollback via Cloudflare

### Prerequisites
- [ ] Cloudflare dashboard access
- [ ] Knowledge of last working deployment

### Steps

#### 1. Identify Last Working Deployment (1 minute)

```bash
# Check recent commits
git log --oneline -10

# Note the last working commit hash
# Example: abc123f - "Last working version"
```

#### 2. Access Cloudflare Dashboard (1 minute)

1. Go to https://dash.cloudflare.com/
2. Navigate to **Pages**
3. Click **fire-protection-tracker**
4. Go to **Deployments** tab

#### 3. Find Previous Deployment

Deployments are listed chronologically. Look for:
- Deployment before the problem started
- Green checkmark (successful deployment)
- Recent date (within last few days)

#### 4. Rollback (1 minute)

**Option A: Retry Previous Deployment**
1. Click on the working deployment
2. Click **"Retry deployment"**
3. Confirm action

**Option B: Manual Rollback** (if available)
1. Click three dots (...) next to working deployment
2. Click **"Rollback to this deployment"**
3. Confirm action

#### 5. Verify Rollback (2-3 minutes)

```bash
# Check site is accessible
curl -I https://fire-protection-tracker.pages.dev

# Expected: HTTP/2 200

# Test in browser
# 1. Open https://fire-protection-tracker.pages.dev
# 2. Clear cache (Ctrl+Shift+R)
# 3. Verify issue is resolved
```

#### 6. Monitor (15 minutes)

- [ ] Check error logs
- [ ] Monitor user reports
- [ ] Verify metrics return to normal
- [ ] Test critical features

---

## Procedure 2: Git Revert Rollback

### When to Use

- Need permanent rollback
- Want audit trail
- Cloudflare dashboard unavailable
- Multiple commits need reverting

### Steps

#### 1. Identify Problematic Commit (2 minutes)

```bash
# View recent commits
git log --oneline -10

# Example output:
# def456g Fix authentication bug  <- Current (broken)
# abc123f Add new dashboard feature
# 789xyz0 Update styles           <- Last working
```

#### 2. Create Revert Commit (2 minutes)

```bash
# Option A: Revert single commit
git revert def456g

# Option B: Revert multiple commits
git revert def456g..HEAD

# Option C: Revert to specific commit (nuclear option)
git revert --no-commit HEAD~3..HEAD
git commit -m "Revert to last working version"
```

#### 3. Push Revert (1 minute)

```bash
# Push revert to main
git push origin main

# This triggers automatic redeployment
```

#### 4. Monitor Deployment (3-5 minutes)

1. Go to GitHub repository
2. Click **Actions** tab
3. Watch deployment workflow
4. Wait for completion

#### 5. Verify (2-3 minutes)

```bash
# Test the application
curl -I https://fire-protection-tracker.pages.dev

# Open in browser and test
```

---

## Procedure 3: Database Rollback

### ⚠️ CRITICAL WARNING

Database rollbacks can result in data loss. Only perform if:
- Data corruption detected
- Schema migration failed
- No other option available
- Data loss is acceptable

### Prerequisites

- [ ] Recent backup available
- [ ] Supabase admin access
- [ ] Approval from team lead
- [ ] Users notified of maintenance

### Steps

#### 1. Assess Situation (5 minutes)

```bash
# Check what changed
git diff HEAD~1 -- supabase-*.sql

# Review database logs in Supabase dashboard
```

#### 2. Put Application in Maintenance Mode (2 minutes)

**Option A: Disable in Cloudflare**
1. Cloudflare Dashboard → Pages
2. Pause project temporarily

**Option B: Show Maintenance Page**
- Deploy maintenance.html to Cloudflare
- Redirect all traffic temporarily

#### 3. Create Current Backup (5 minutes)

```bash
# Backup current state before rollback
node scripts/backup-database.ts
```

This creates a safety backup in case rollback fails.

#### 4. Identify Restore Point (2 minutes)

```bash
# List available backups
ls -lh backups/

# Choose appropriate backup
# Usually: Most recent before the issue
```

#### 5. Restore Database (10-15 minutes)

```bash
# Dry run first (recommended)
node scripts/restore-database.ts ./backups/backup-YYYY-MM-DD --dry-run

# Review dry run output
# If looks good, restore for real

# ACTUAL RESTORE (no going back after this)
node scripts/restore-database.ts ./backups/backup-YYYY-MM-DD --clear
```

#### 6. Verify Database (5 minutes)

```sql
-- Connect to Supabase SQL Editor
-- Run verification queries

-- Check record counts
SELECT 'users' as table_name, COUNT(*) FROM auth.users
UNION
SELECT 'documents', COUNT(*) FROM documents
UNION
SELECT 'projects', COUNT(*) FROM projects;

-- Check recent records
SELECT created_at, updated_at FROM documents ORDER BY created_at DESC LIMIT 10;
```

#### 7. Test Application (5 minutes)

- [ ] Test login
- [ ] Test data loading
- [ ] Test core features
- [ ] Check for errors

#### 8. Bring Application Online (2 minutes)

- Remove maintenance mode
- Enable Cloudflare Pages
- Monitor closely

---

## Procedure 4: Configuration Rollback

### When to Use

- Environment variable changes causing issues
- Feature flag needs reverting
- Configuration error detected

### Steps

#### 1. Access Configuration (1 minute)

**Cloudflare Pages:**
1. Dashboard → Pages → fire-protection-tracker
2. Settings → Environment variables

#### 2. Identify Changes (2 minutes)

```bash
# Check recent changes in Git
git log --oneline --all -- env.example

# Check Cloudflare audit log
# Dashboard → Audit Log
```

#### 3. Revert Configuration (2 minutes)

**In Cloudflare:**
1. Find changed variable
2. Update to previous value
3. Save changes

#### 4. Redeploy (3-5 minutes)

Cloudflare requires redeployment for env var changes:
1. Go to Deployments
2. Click "Retry deployment" on latest
3. Or trigger via Git push

#### 5. Verify (2 minutes)

```bash
# Test affected functionality
# Check browser console for errors
```

---

## Post-Rollback Actions

### Immediate Actions (Within 1 hour)

#### 1. Communication

**Internal:**
```markdown
# Slack/Email Template

Subject: [RESOLVED] Production Rollback Completed

We have rolled back production to resolve [issue description].

Rollback Details:
- Time: [HH:MM UTC]
- Method: [Cloudflare/Git revert/Database]
- Reverted to: [Version/commit]
- Impact: [Description]

Current Status: All systems operational
Monitoring: Active for next 2 hours

Next Steps:
- Root cause analysis scheduled for [time]
- Fix will be prepared and tested
- New deployment scheduled for [time/date]
```

**External (if needed):**
```markdown
Subject: Service Update - Issue Resolved

We experienced a brief service disruption that has been resolved.

Duration: [X minutes]
Impact: [Description]
Status: Fully operational

We apologize for any inconvenience.
```

#### 2. Monitoring

- [ ] Monitor error rates for 2 hours
- [ ] Watch for user reports
- [ ] Check performance metrics
- [ ] Verify all features working

#### 3. Documentation

Create incident ticket with:
- What went wrong
- What was rolled back
- Timeline of events
- Impact assessment

### Short-term Actions (Within 24 hours)

#### 1. Root Cause Analysis

```markdown
# RCA Template

## What Happened
[Description of issue]

## Why It Happened
[Root cause]

## Why We Didn't Catch It
[Process gaps]

## What We're Doing About It
1. [Action item 1] - Owner: [Name]
2. [Action item 2] - Owner: [Name]
```

#### 2. Create Fix

```bash
# Create fix branch
git checkout -b fix/issue-description

# Implement fix
# Test thoroughly

# Create PR
git push origin fix/issue-description
```

#### 3. Enhanced Testing

- [ ] Add test for the issue
- [ ] Test in staging/preview
- [ ] Extended monitoring period

### Long-term Actions (Within 1 week)

#### 1. Post-Mortem

Schedule team meeting to review:
- What went well
- What could improve
- Process changes needed

See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) for post-mortem template.

#### 2. Process Improvements

Consider:
- [ ] Additional automated tests
- [ ] Enhanced monitoring/alerts
- [ ] Deployment checklist updates
- [ ] Code review process improvements
- [ ] Staging environment setup

---

## Prevention

### Pre-Deployment Checklist

Use this before every deployment:

```markdown
## Code Quality
- [ ] All tests passing locally
- [ ] No TypeScript errors
- [ ] Linter passed
- [ ] Code reviewed by team member

## Testing
- [ ] Tested in development environment
- [ ] Core features tested
- [ ] Edge cases considered
- [ ] Browser compatibility checked

## Database
- [ ] Backup created
- [ ] Migrations tested
- [ ] Rollback plan prepared
- [ ] No destructive operations without backup

## Deployment
- [ ] Meaningful commit message
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring ready

## Rollback Plan
- [ ] Know how to rollback
- [ ] Previous version identified
- [ ] Rollback tested (if major change)
```

### Deployment Best Practices

1. **Deploy During Low-Traffic Periods**
   - Tuesday-Thursday
   - Morning hours
   - Avoid weekends/holidays

2. **Gradual Rollout**
   - Deploy to preview first
   - Test thoroughly
   - Monitor before full rollout

3. **Feature Flags**
   - Use flags for major features
   - Can disable without deployment
   - Gradual rollout possible

4. **Monitoring**
   - Watch deployment in real-time
   - Monitor for 30 minutes post-deploy
   - Keep rollback procedure ready

---

## Emergency Contacts

### Rollback Authority

| Severity | Who Can Authorize | Response Time |
|----------|------------------|---------------|
| SEV-1 | Any engineer | Immediate |
| SEV-2 | Team lead | 15 minutes |
| SEV-3 | Team consensus | 1 hour |

### Contact List

| Role | Name | Contact |
|------|------|---------|
| DevOps Lead | TBD | [contact] |
| Team Lead | TBD | [contact] |
| Database Admin | TBD | [contact] |

---

## Appendix

### Quick Reference Commands

```bash
# Check deployment status
git log --oneline -5

# Revert last commit
git revert HEAD

# Revert to specific commit
git revert abc123f

# Emergency database backup
node scripts/backup-database.ts

# Restore database
node scripts/restore-database.ts ./backups/backup-latest

# Check site health
curl -I https://fire-protection-tracker.pages.dev
```

### Rollback Decision Tree

```
Issue detected
     ↓
Is it SEV-1? ──Yes──→ Rollback immediately
     ↓ No
Can we forward fix in < 15 min? ──Yes──→ Forward fix
     ↓ No
Is rollback safe? ──Yes──→ Rollback
     ↓ No
Escalate to team lead
```

### Related Documentation

- [Operations Runbook](./OPERATIONS_RUNBOOK.md)
- [Incident Response](./INCIDENT_RESPONSE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Last Updated:** 2025-10-31  
**Version:** 1.0.0  
**Maintained By:** DevOps Team

**Remember:** When in doubt, rollback. It's better to be safe and fix forward later.
