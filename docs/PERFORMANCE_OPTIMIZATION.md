# Performance Optimization Guide

**Fire Protection Tracker - Performance Tuning & Optimization**

---

## Table of Contents

1. [Overview](#overview)
2. [Performance Metrics](#performance-metrics)
3. [Frontend Optimization](#frontend-optimization)
4. [Backend Optimization](#backend-optimization)
5. [Network Optimization](#network-optimization)
6. [Database Optimization](#database-optimization)
7. [Caching Strategies](#caching-strategies)
8. [Monitoring Performance](#monitoring-performance)
9. [Performance Testing](#performance-testing)
10. [Optimization Checklist](#optimization-checklist)

---

## Overview

### Performance Goals

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint (FCP) | < 1.8s | TBD | 🎯 |
| Largest Contentful Paint (LCP) | < 2.5s | TBD | 🎯 |
| Time to Interactive (TTI) | < 3.8s | TBD | 🎯 |
| Cumulative Layout Shift (CLS) | < 0.1 | TBD | 🎯 |
| First Input Delay (FID) | < 100ms | TBD | 🎯 |
| Total Bundle Size | < 500KB | TBD | 🎯 |

### Performance Budget

```
JavaScript:     ≤ 300 KB (gzipped)
CSS:           ≤ 50 KB (gzipped)
Images:        ≤ 200 KB per page
Fonts:         ≤ 100 KB
Total:         ≤ 1 MB
```

---

## Performance Metrics

### Core Web Vitals

#### 1. Largest Contentful Paint (LCP)
**What:** Time to render the largest visible content element  
**Target:** < 2.5 seconds  
**Measures:** Loading performance

**How to Improve:**
- Optimize images
- Minimize CSS/JS blocking
- Use CDN (Cloudflare)
- Implement lazy loading

#### 2. First Input Delay (FID)
**What:** Time from user interaction to browser response  
**Target:** < 100 milliseconds  
**Measures:** Interactivity

**How to Improve:**
- Reduce JavaScript execution time
- Break up long tasks
- Use web workers for heavy computation
- Minimize main thread work

#### 3. Cumulative Layout Shift (CLS)
**What:** Visual stability (unexpected layout shifts)  
**Target:** < 0.1  
**Measures:** Visual stability

**How to Improve:**
- Set dimensions for images/videos
- Avoid inserting content above existing content
- Use transform animations instead of layout-triggering properties

---

## Frontend Optimization

### 1. Code Splitting

#### Route-Based Code Splitting

Already configured in `vite.config.ts`. To implement in routes:

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load route components
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </Suspense>
  );
}
```

#### Component-Based Code Splitting

```typescript
// Lazy load heavy components
const PDFViewer = lazy(() => import('./components/PDFViewer'));
const ChartComponent = lazy(() => import('./components/ChartComponent'));

function DocumentView() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PDFViewer document={doc} />
    </Suspense>
  );
}
```

### 2. Bundle Optimization

#### Analyze Bundle Size

```bash
# Build and analyze
npm run build
npm run performance-check

# Or use rollup-plugin-visualizer
npm install --save-dev rollup-plugin-visualizer
```

Add to `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
});
```

#### Tree Shaking

Ensure tree shaking is working:

```typescript
// ❌ Bad: Imports entire library
import _ from 'lodash';

// ✅ Good: Imports only what's needed
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

### 3. Image Optimization

#### Use WebP Format

```typescript
// src/components/OptimizedImage.tsx
interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, width, height }: Props) {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
```

#### Lazy Loading Images

```typescript
// Use native lazy loading
<img src="image.jpg" loading="lazy" alt="description" />

// Or use Intersection Observer for more control
import { useEffect, useRef, useState } from 'react';

export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLoaded(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <img
      ref={imgRef}
      src={loaded ? src : 'placeholder.jpg'}
      alt={alt}
    />
  );
}
```

#### Image Compression

```bash
# Compress images before deployment
npm install --save-dev imagemin imagemin-webp

# Or use online tools:
# - TinyPNG (https://tinypng.com/)
# - Squoosh (https://squoosh.app/)
```

### 4. Font Optimization

#### Use Font Display Swap

```css
/* src/style.css */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
  font-display: swap; /* Prevents invisible text during load */
  font-weight: 400;
  font-style: normal;
}
```

#### Preload Critical Fonts

```html
<!-- index.html -->
<head>
  <link
    rel="preload"
    href="/fonts/critical-font.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  />
</head>
```

#### Subset Fonts

Only include characters you need:

```bash
# Use tools like glyphhanger
npx glyphhanger --subset=*.woff2 --whitelist="ABCDEFabcdef..."
```

### 5. CSS Optimization

#### Critical CSS

Extract and inline critical CSS:

```typescript
// vite.config.ts - add plugin for critical CSS
import criticalCSS from 'vite-plugin-critical-css';

export default defineConfig({
  plugins: [
    react(),
    criticalCSS({
      urls: ['/'],
      dimensions: [
        { width: 375, height: 667 },
        { width: 1920, height: 1080 },
      ],
    }),
  ],
});
```

#### Remove Unused CSS

```bash
# Use PurgeCSS with Tailwind (already configured)
# Tailwind automatically purges unused classes in production
```

#### Minification

Already configured in `vite.config.ts`:

```typescript
css: {
  postcss: './postcss.config.js',
},
```

### 6. JavaScript Optimization

#### Debounce and Throttle

```typescript
import { debounce } from 'lodash';

// Debounce search input
const handleSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);

// Throttle scroll events
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

#### Virtual Scrolling

For long lists:

```typescript
import { FixedSizeList } from 'react-window';

function LongList({ items }: { items: any[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </FixedSizeList>
  );
}
```

#### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive component
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// Memoize expensive calculation
function Component({ items }) {
  const processedItems = useMemo(() => {
    return items.map(item => expensiveProcessing(item));
  }, [items]);
  
  const handleClick = useCallback(() => {
    // handler
  }, []);
  
  return <div>{/* render */}</div>;
}
```

---

## Backend Optimization

### 1. API Response Time

#### Implement Request Caching

```typescript
// src/lib/api-cache.ts
const cache = new Map();

export async function cachedFetch(
  url: string,
  options?: RequestInit,
  ttl = 5 * 60 * 1000 // 5 minutes
) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
  
  return data;
}
```

#### Pagination

```typescript
// Implement pagination for large datasets
async function fetchDocuments(page = 1, pageSize = 20) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  return data;
}
```

#### Request Batching

```typescript
// Batch multiple API calls
async function batchFetch(urls: string[]) {
  const promises = urls.map(url => fetch(url));
  return Promise.all(promises);
}
```

---

## Network Optimization

### 1. CDN Configuration

#### Cloudflare Caching

Already enabled by default. Optimize with custom rules:

1. **Cache-Control Headers**

```typescript
// For Cloudflare Pages, configure in _headers file
// public/_headers

/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

2. **Page Rules**

In Cloudflare Dashboard:
- Cache Level: Standard
- Browser Cache TTL: 1 year
- Always Online: Enabled

### 2. Resource Hints

```html
<!-- index.html -->
<head>
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://[project-id].supabase.co" />
  
  <!-- DNS prefetch -->
  <link rel="dns-prefetch" href="https://[project-id].supabase.co" />
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/assets/main.js" as="script" />
  <link rel="preload" href="/assets/main.css" as="style" />
</head>
```

### 3. Compression

Already enabled on Cloudflare. Verify:

```bash
# Check if gzip/brotli is enabled
curl -I -H "Accept-Encoding: gzip, br" https://fire-protection-tracker.pages.dev
```

---

## Database Optimization

### 1. Query Optimization

#### Add Indexes

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Composite indexes for common queries
CREATE INDEX idx_documents_user_status ON documents(user_id, status);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
```

#### Optimize Queries

```typescript
// ❌ Bad: Fetch all fields
const { data } = await supabase
  .from('documents')
  .select('*');

// ✅ Good: Fetch only needed fields
const { data } = await supabase
  .from('documents')
  .select('id, title, created_at');

// ❌ Bad: N+1 query problem
for (const project of projects) {
  const tasks = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', project.id);
}

// ✅ Good: Use joins or single query
const { data } = await supabase
  .from('projects')
  .select('*, tasks(*)');
```

### 2. Connection Pooling

Supabase handles this automatically, but monitor:

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection limits
SHOW max_connections;
```

### 3. Query Analysis

```sql
-- Find slow queries
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Explain query performance
EXPLAIN ANALYZE
SELECT * FROM documents 
WHERE user_id = '123' 
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Caching Strategies

### 1. Browser Caching

```typescript
// Service Worker for offline caching (optional)
// public/sw.js

const CACHE_NAME = 'fire-protection-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/main.css',
  '/assets/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### 2. Application-Level Caching

```typescript
// React Query for server state management
import { useQuery } from '@tanstack/react-query';

function Documents() {
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### 3. API Response Caching

```typescript
// Cache API responses in localStorage
function cacheResponse(key: string, data: any, ttl = 300000) {
  const item = {
    data,
    expiry: Date.now() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getCachedResponse(key: string) {
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  const parsed = JSON.parse(item);
  if (Date.now() > parsed.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return parsed.data;
}
```

---

## Monitoring Performance

### 1. Performance Monitoring Script

```typescript
// src/lib/performance-monitor.ts

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }
  
  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    const duration = measure.duration;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    logger.logPerformance(name, duration);
  }
  
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, count: values.length };
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### 2. Usage in Components

```typescript
import { perfMonitor } from '@/lib/performance-monitor';

function DocumentList() {
  useEffect(() => {
    perfMonitor.startMeasure('document-list-render');
    
    return () => {
      perfMonitor.endMeasure('document-list-render');
    };
  }, []);
  
  return <div>{/* render */}</div>;
}
```

### 3. Real User Monitoring

```typescript
// Track real user metrics
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  
  logger.logPerformance('page-load', perfData.duration);
  logger.logPerformance('dom-interactive', perfData.domInteractive);
  logger.logPerformance('dom-complete', perfData.domComplete);
});
```

---

## Performance Testing

### 1. Lighthouse CI

Add to your workflow:

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build
        run: |
          npm ci
          npm run build
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:5000
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 2. Load Testing

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io/

# Create load test script
# scripts/load-test.js
```

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  const res = http.get('https://fire-protection-tracker.pages.dev');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

```bash
# Run load test
k6 run scripts/load-test.js
```

### 3. Bundle Size Monitoring

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "analyze": "npm run build && npm run performance-check",
    "size-limit": "size-limit"
  },
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "300 KB"
    },
    {
      "path": "dist/assets/*.css",
      "limit": "50 KB"
    }
  ]
}
```

---

## Optimization Checklist

### Pre-Launch Checklist

#### Images
- [ ] All images compressed
- [ ] WebP format used where possible
- [ ] Lazy loading implemented
- [ ] Image dimensions specified
- [ ] Responsive images configured

#### Code
- [ ] Code splitting implemented
- [ ] Tree shaking verified
- [ ] Unused code removed
- [ ] Dependencies optimized
- [ ] Source maps disabled in production

#### CSS
- [ ] Unused CSS purged
- [ ] Critical CSS inlined
- [ ] CSS minified
- [ ] CSS-in-JS optimized

#### JavaScript
- [ ] Minification enabled
- [ ] Compression (gzip/brotli) enabled
- [ ] Long tasks broken up
- [ ] Heavy computations optimized
- [ ] Debouncing/throttling applied

#### Fonts
- [ ] Font display: swap
- [ ] Fonts preloaded
- [ ] Fonts subset
- [ ] Only necessary weights loaded

#### Network
- [ ] CDN configured
- [ ] Caching headers set
- [ ] Resource hints added
- [ ] HTTP/2 enabled
- [ ] Compression enabled

#### Database
- [ ] Indexes added
- [ ] Queries optimized
- [ ] Pagination implemented
- [ ] Connection pooling configured

#### Monitoring
- [ ] Performance monitoring setup
- [ ] Error tracking configured
- [ ] Analytics implemented
- [ ] Alerts configured

---

## Quick Wins

### Immediate Improvements (< 1 hour)

1. **Enable Cloudflare Optimization**
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
   - HTTP/2

2. **Add Loading States**
   ```typescript
   // Show loading indicators
   {isLoading && <Spinner />}
   ```

3. **Lazy Load Images**
   ```html
   <img src="..." loading="lazy" />
   ```

4. **Add Database Indexes**
   ```sql
   CREATE INDEX idx_documents_user_id ON documents(user_id);
   ```

### Medium Effort (1-4 hours)

1. **Implement Code Splitting**
2. **Optimize Images (WebP)**
3. **Add Request Caching**
4. **Virtual Scrolling for Lists**

### Long Term (> 4 hours)

1. **Service Worker for Offline Support**
2. **Advanced Caching Strategy**
3. **Performance Budget Enforcement**
4. **Automated Performance Testing**

---

## Resources

### Tools
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **WebPageTest:** https://www.webpagetest.org/
- **BundlePhobia:** https://bundlephobia.com/
- **Can I Use:** https://caniuse.com/

### Documentation
- **Web Vitals:** https://web.dev/vitals/
- **Vite Performance:** https://vitejs.dev/guide/performance
- **React Performance:** https://react.dev/learn/render-and-commit

---

**Last Updated:** 2025-10-31  
**Version:** 1.0.0  
**Maintained By:** DevOps Team
