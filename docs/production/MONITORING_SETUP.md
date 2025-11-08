# Monitoring Setup Guide

**Fire Protection Tracker - Comprehensive Monitoring Configuration**

---

## Table of Contents

1. [Overview](#overview)
2. [Monitoring Stack](#monitoring-stack)
3. [Cloudflare Analytics](#cloudflare-analytics)
4. [Supabase Monitoring](#supabase-monitoring)
5. [Application Monitoring](#application-monitoring)
6. [Error Tracking](#error-tracking)
7. [Performance Monitoring](#performance-monitoring)
8. [Alerting Configuration](#alerting-configuration)
9. [Dashboard Setup](#dashboard-setup)
10. [Log Management](#log-management)

---

## Overview

### Monitoring Philosophy

Our monitoring strategy follows the "Three Pillars of Observability":
1. **Metrics:** Quantitative measurements (response time, error rate)
2. **Logs:** Detailed event records
3. **Traces:** Request flow through system

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Uptime | 99.9% | < 99% |
| Response Time | < 2s | > 5s |
| Error Rate | < 0.1% | > 1% |
| API Success Rate | > 99% | < 95% |

---

## Monitoring Stack

### Current Stack

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│  - Error Tracking (Built-in + Sentry)   │
│  - Performance Monitoring (Browser API) │
│  - Logging (Custom Logger)              │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│      Infrastructure Layer                │
│  - Cloudflare Analytics                  │
│  - Supabase Metrics                      │
│  - GitHub Actions Monitoring             │
└─────────────────────────────────────────┘
```

### Tools Used

1. **Cloudflare Analytics** (Built-in, Free)
   - Traffic metrics
   - Performance data
   - Security events

2. **Supabase Dashboard** (Built-in, Free)
   - Database metrics
   - API usage
   - Storage metrics

3. **Custom Application Monitoring** (Built-in)
   - Error tracking
   - Performance metrics
   - User analytics

4. **Optional Tools** (Recommended for Production)
   - Sentry (Error tracking)
   - LogRocket (Session replay)
   - UptimeRobot (Uptime monitoring)
   - New Relic / Datadog (Full observability)

---

## Cloudflare Analytics

### Setup

1. **Access Analytics**
   - Go to https://dash.cloudflare.com/
   - Navigate to **Pages** → **fire-protection-tracker**
   - Click **Analytics** tab

2. **Available Metrics**
   - Requests per second
   - Bandwidth usage
   - Status codes (2xx, 4xx, 5xx)
   - Cache hit ratio
   - Geographic distribution

### Key Dashboards

#### 1. Traffic Overview
```
Metrics to Monitor:
- Total requests (last 24h)
- Bandwidth (last 24h)
- Unique visitors
- Cache hit ratio
```

#### 2. Performance
```
Metrics to Monitor:
- Origin response time
- Total response time
- Time to first byte (TTFB)
```

#### 3. Security
```
Metrics to Monitor:
- Threats blocked
- Bot traffic
- DDoS attempts
```

### Setting Up Alerts

1. **Navigate to Notifications**
   ```
   Dashboard → Notifications → Add
   ```

2. **Configure Critical Alerts**

   **Alert 1: High Error Rate**
   ```
   Type: Pages Error Rate Alert
   Threshold: > 5% error rate
   Duration: 5 minutes
   Notification: Email + Webhook
   ```

   **Alert 2: Traffic Spike**
   ```
   Type: Traffic Anomalies
   Threshold: 3x normal traffic
   Notification: Email
   ```

   **Alert 3: SSL Certificate**
   ```
   Type: SSL Certificate Expiration
   Threshold: 30 days before expiry
   Notification: Email
   ```

### API Access

For programmatic access:

```bash
# Get analytics via Cloudflare API
curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"
```

---

## Supabase Monitoring

### Setup

1. **Access Dashboard**
   - Go to https://app.supabase.com/
   - Select your project
   - Navigate to **Settings** → **Database**

2. **Available Metrics**
   - Database size
   - Active connections
   - CPU usage
   - Memory usage
   - Query performance

### Key Metrics to Monitor

#### 1. Database Health
```sql
-- Monitor in SQL Editor

-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'postgres';

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

#### 2. Query Performance
```sql
-- Find slow queries
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### 3. API Usage

Monitor in Supabase Dashboard:
- API requests per hour
- Success rate
- Average response time
- Top endpoints

### Setting Up Alerts

1. **Navigate to Settings → Alerts**

2. **Configure Alerts**

   **Alert 1: Database Size**
   ```
   Metric: Database size
   Threshold: > 80% of plan limit
   Action: Email notification
   ```

   **Alert 2: Connection Pool**
   ```
   Metric: Active connections
   Threshold: > 90% of max connections
   Action: Email + Slack
   ```

   **Alert 3: CPU Usage**
   ```
   Metric: CPU usage
   Threshold: > 80% for 10 minutes
   Action: Email notification
   ```

---

## Application Monitoring

### Built-in Monitoring

Our application includes built-in monitoring via:
- `src/lib/logger.ts` - Structured logging
- `src/lib/error-tracking.ts` - Error tracking

### Setup

#### 1. Initialize Monitoring

In `src/main.tsx`:

```typescript
import { logger } from './lib/logger';
import { errorTracker } from './lib/error-tracking';

// Initialize error tracking
errorTracker.initialize({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

// Set up user context on auth
auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    errorTracker.setUser(
      session.user.id,
      session.user.email,
      session.user.email?.split('@')[0]
    );
  }
});
```

#### 2. Add Error Boundary

Wrap your app in `ErrorBoundary`:

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* Your app */}
    </ErrorBoundary>
  );
}
```

### Usage in Code

#### Logging Examples

```typescript
import { logger, logUserAction } from '@/lib/logger';

// Log user actions
logUserAction('document_uploaded', {
  documentId: doc.id,
  size: doc.size,
});

// Log performance
const startTime = performance.now();
await fetchData();
const duration = performance.now() - startTime;
logger.logPerformance('api_call', duration);

// Log errors
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    component: 'DocumentUpload',
    action: 'upload',
  });
}
```

#### Error Tracking Examples

```typescript
import { captureError, addBreadcrumb } from '@/lib/error-tracking';

// Add context breadcrumbs
addBreadcrumb('User clicked upload button', 'user-action');
addBreadcrumb('File selected: large.pdf', 'user-action', {
  fileSize: 5000000,
});

// Capture errors with context
try {
  await uploadDocument(file);
} catch (error) {
  captureError(error, {
    component: 'DocumentUpload',
    severity: 'high',
    tags: {
      feature: 'upload',
      fileType: file.type,
    },
    extra: {
      fileSize: file.size,
      fileName: file.name,
    },
  });
  throw error;
}
```

---

## Error Tracking

### Integrating Sentry (Recommended)

#### 1. Sign Up & Create Project

1. Go to https://sentry.io/
2. Create account
3. Create new project (React)
4. Copy DSN

#### 2. Install Dependencies

```bash
npm install @sentry/react @sentry/tracing
```

#### 3. Configure Sentry

Update `src/lib/error-tracking.ts`:

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initializeSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Session replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data from errors
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
        }
        return event;
      },
    });
  }
}
```

#### 4. Add Environment Variable

```env
VITE_SENTRY_DSN=https://...@sentry.io/...
```

#### 5. Set Up Alerts in Sentry

1. Go to Sentry Dashboard
2. Click **Alerts** → **Create Alert**
3. Configure alert rules:

   ```
   Alert: High Error Rate
   Condition: Error count > 50 in 1 hour
   Action: Email + Slack notification
   ```

---

## Performance Monitoring

### Browser Performance API

#### 1. Core Web Vitals

Track using built-in Web APIs:

```typescript
// src/lib/performance.ts

export function trackWebVitals() {
  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    logger.logPerformance('LCP', lastEntry.renderTime || lastEntry.loadTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      logger.logPerformance('FID', entry.processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsScore = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
        logger.logPerformance('CLS', clsScore);
      }
    });
  }).observe({ entryTypes: ['layout-shift'] });
}
```

#### 2. API Performance

Track API call performance:

```typescript
// src/lib/api-monitor.ts

export async function monitoredFetch(url: string, options?: RequestInit) {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const duration = performance.now() - startTime;
    
    logger.logApiRequest(
      options?.method || 'GET',
      url,
      duration
    );
    
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('API call failed', error, {
      action: 'api_request',
    }, {
      url,
      duration,
    });
    throw error;
  }
}
```

### Performance Budgets

Set performance budgets:

```javascript
// performance-budgets.json
{
  "budgets": [
    {
      "resourceType": "script",
      "budget": 500  // 500 KB
    },
    {
      "resourceType": "stylesheet",
      "budget": 100  // 100 KB
    },
    {
      "resourceType": "image",
      "budget": 1000  // 1 MB
    },
    {
      "metric": "interactive",
      "budget": 3000  // 3 seconds
    }
  ]
}
```

Monitor with:

```bash
npm run performance-check
```

---

## Alerting Configuration

### Alert Priority Matrix

| Priority | Response Time | Notification Method |
|----------|---------------|---------------------|
| P1 (Critical) | Immediate | Page + SMS + Email |
| P2 (High) | < 15 min | Phone call + Email |
| P3 (Medium) | < 1 hour | Email + Slack |
| P4 (Low) | < 24 hours | Email |

### Alert Rules

#### 1. Availability Alerts

```yaml
# High error rate
alert: HighErrorRate
condition: error_rate > 5%
duration: 5 minutes
severity: P1
notification: page

# Service down
alert: ServiceDown
condition: uptime_check fails
attempts: 3
interval: 1 minute
severity: P1
notification: page
```

#### 2. Performance Alerts

```yaml
# Slow response time
alert: SlowResponseTime
condition: avg_response_time > 5s
duration: 10 minutes
severity: P2
notification: email

# High database load
alert: HighDatabaseLoad
condition: db_cpu > 80%
duration: 15 minutes
severity: P2
notification: email + slack
```

#### 3. Resource Alerts

```yaml
# Database size warning
alert: DatabaseSizeWarning
condition: db_size > 80% of limit
severity: P3
notification: email

# Connection pool exhaustion
alert: ConnectionPoolHigh
condition: active_connections > 90% of max
duration: 5 minutes
severity: P2
notification: email + slack
```

### Setting Up UptimeRobot (Free Option)

1. **Sign Up**
   - Go to https://uptimerobot.com/
   - Create free account (50 monitors)

2. **Add Monitor**
   ```
   Monitor Type: HTTPS
   Friendly Name: Fire Protection Tracker
   URL: https://fire-protection-tracker.pages.dev
   Monitoring Interval: 5 minutes
   ```

3. **Configure Alerts**
   ```
   Alert Contacts: Your email
   Alert When: Down
   Alert After: 1 failed attempt
   ```

4. **Add Status Page** (Optional)
   - Create public status page
   - Share with users

---

## Dashboard Setup

### Creating a Monitoring Dashboard

#### Option 1: Grafana (Advanced)

If you want comprehensive dashboards:

1. **Deploy Grafana** (via Docker or cloud)
2. **Connect Data Sources**
   - Cloudflare API
   - Supabase metrics
   - Custom application metrics
3. **Import Dashboards**
   - Use pre-built templates
   - Customize for your needs

#### Option 2: Simple HTML Dashboard

Create `public/status.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>System Status - Fire Protection Tracker</title>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial; max-width: 800px; margin: 50px auto; }
    .status { padding: 20px; margin: 10px 0; border-radius: 5px; }
    .operational { background: #d4edda; color: #155724; }
    .degraded { background: #fff3cd; color: #856404; }
    .down { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>System Status</h1>
  <div id="status"></div>
  
  <script>
    async function checkStatus() {
      const services = [
        {
          name: 'Application',
          url: 'https://fire-protection-tracker.pages.dev',
        },
        {
          name: 'API',
          url: 'https://[your-project].supabase.co/rest/v1/',
        },
      ];
      
      const statusDiv = document.getElementById('status');
      statusDiv.innerHTML = '';
      
      for (const service of services) {
        try {
          const response = await fetch(service.url, { method: 'HEAD' });
          const status = response.ok ? 'operational' : 'degraded';
          const statusText = response.ok ? 'Operational' : 'Degraded';
          
          statusDiv.innerHTML += `
            <div class="status ${status}">
              <strong>${service.name}:</strong> ${statusText}
            </div>
          `;
        } catch (error) {
          statusDiv.innerHTML += `
            <div class="status down">
              <strong>${service.name}:</strong> Down
            </div>
          `;
        }
      }
    }
    
    checkStatus();
    setInterval(checkStatus, 60000); // Check every minute
  </script>
</body>
</html>
```

---

## Log Management

### Accessing Logs

#### 1. Browser Console Logs

```javascript
// View application logs in browser console
localStorage.getItem('app_logs');

// Or use the logger API
import { logger } from '@/lib/logger';
const logs = logger.getLogs();
console.table(logs);
```

#### 2. Cloudflare Logs

```bash
# Via Cloudflare Logs API
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/logs/received" \
  -H "Authorization: Bearer {api_token}"
```

#### 3. Supabase Logs

Available in Supabase Dashboard:
- Database logs
- API logs
- Auth logs

### Log Retention

| Log Type | Retention Period | Storage Location |
|----------|------------------|------------------|
| Application | 7 days | Browser localStorage |
| Cloudflare | 72 hours (free tier) | Cloudflare |
| Supabase | Varies by plan | Supabase |
| Error Logs | 90 days | Sentry (if configured) |

### Log Analysis

Create `scripts/analyze-logs.ts`:

```typescript
// Analyze error patterns
const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');

const errorStats = logs
  .filter(log => log.level === 'error')
  .reduce((acc, log) => {
    const component = log.context?.component || 'unknown';
    acc[component] = (acc[component] || 0) + 1;
    return acc;
  }, {});

console.log('Errors by component:', errorStats);
```

---

## Monitoring Checklist

### Daily Checks
- [ ] Check Cloudflare Analytics for anomalies
- [ ] Review error logs in console/Sentry
- [ ] Verify all services operational
- [ ] Check database size growth

### Weekly Checks
- [ ] Review performance metrics
- [ ] Analyze slow queries
- [ ] Check alert configuration
- [ ] Review security events
- [ ] Verify backups running

### Monthly Checks
- [ ] Full system health review
- [ ] Performance optimization review
- [ ] Alert tuning
- [ ] Capacity planning
- [ ] Update monitoring documentation

---

## Appendix

### Useful Monitoring Commands

```bash
# Check site health
curl -I https://fire-protection-tracker.pages.dev

# Run performance audit
npx lighthouse https://fire-protection-tracker.pages.dev

# Check bundle size
npm run build && npm run performance-check

# View logs
npm run logs  # If configured
```

### Related Documentation

- [Operations Runbook](./OPERATIONS_RUNBOOK.md)
- [Incident Response](./INCIDENT_RESPONSE.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)

---

**Last Updated:** 2025-10-31  
**Version:** 1.0.0  
**Maintained By:** DevOps Team
