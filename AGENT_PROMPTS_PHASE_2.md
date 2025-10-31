# 🤖 Phase 2 Agent Prompts - Advanced Features

**Created:** October 31, 2024  
**Phase:** Post-Launch Enhancements  
**Target:** Agents 6, 7, 8

After successful production launch and stabilization (2-4 weeks), deploy these 3 agents for advanced features.

---

## 📋 **AGENT 6: Email Notifications & Realtime Updates**

**Copy this entire prompt:**

```
You are Agent 6: Email Notifications & Realtime Updates Specialist.

⚠️ IMPORTANT CONTEXT:
- Main branch has all 5 agents' work integrated
- Reports module has been added
- Database migration is production-ready
- This is Phase 2 work (post-launch)
- Work independently in your own branch

CREATE YOUR BRANCH:
git checkout main
git pull origin main
git checkout -b feature/email-notifications-realtime

MISSION: Implement comprehensive email notification system and realtime updates using Supabase features.

CURRENT STATE:
- Application is in production
- Supabase database configured
- Basic functionality working
- No email notifications
- No realtime updates
- Notification SQL exists in database/future-features/

YOUR TASKS:

========================================
1. EMAIL NOTIFICATION SYSTEM
========================================

A. SETUP EMAIL INFRASTRUCTURE
   - Review database/future-features/supabase-notifications.sql
   - Enhance and integrate into production migration
   - Set up Supabase Edge Functions for email sending
   - Choose email service (Resend, SendGrid, or Supabase built-in)
   - Configure email templates
   - Set up SMTP credentials

B. NOTIFICATION TYPES TO IMPLEMENT
   
   1. **Task Deadline Notifications**
      - Alert 24 hours before task due date
      - Alert on task due date
      - Alert when task is overdue
      - Configurable per user (daily digest vs realtime)
   
   2. **Budget Alerts**
      - Alert when project approaches budget (>90%)
      - Alert when project exceeds budget
      - Weekly budget summary email
      - Monthly budget report
   
   3. **Project Updates**
      - Project status change notifications
      - New task assigned
      - Task completed by team member
      - Document uploaded to project
      - Client communication sent
   
   4. **System Notifications**
      - New user welcome email
      - Password reset email
      - Account verification email
      - System maintenance notifications

C. NOTIFICATION PREFERENCES
   - Create user preferences table:
     ```sql
     CREATE TABLE notification_preferences (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
       email_enabled BOOLEAN DEFAULT true,
       task_deadline_enabled BOOLEAN DEFAULT true,
       budget_alert_enabled BOOLEAN DEFAULT true,
       project_update_enabled BOOLEAN DEFAULT true,
       digest_frequency TEXT DEFAULT 'realtime' CHECK (digest_frequency IN ('realtime', 'daily', 'weekly')),
       quiet_hours_start TIME,
       quiet_hours_end TIME,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
   
   - Create UI for users to manage preferences
   - Implement quiet hours functionality
   - Implement digest email batching

D. EMAIL TEMPLATES
   Create beautiful HTML email templates for:
   - task_deadline.html
   - budget_alert.html
   - project_update.html
   - weekly_digest.html
   - monthly_report.html
   - welcome.html
   - password_reset.html
   
   Use responsive design with fire protection branding

E. SUPABASE EDGE FUNCTIONS
   Create Edge Functions in supabase/functions/:
   
   1. **send-email/**
      - Generic email sending function
      - Template rendering
      - Error handling and retry logic
      - Logging
   
   2. **check-task-deadlines/**
      - Cron job (runs hourly)
      - Checks upcoming deadlines
      - Creates notification records
      - Triggers email sending
   
   3. **check-budget-alerts/**
      - Cron job (runs daily)
      - Calculates budget variances
      - Creates alert notifications
      - Sends budget warnings
   
   4. **send-digest-emails/**
      - Cron job (runs daily at 8am)
      - Aggregates notifications
      - Sends digest emails
      - Marks notifications as sent

F. NOTIFICATION QUEUE SYSTEM
   - Implement notification queue table
   - Add retry logic for failed sends
   - Track delivery status
   - Handle bounce/complaint notifications
   - Create admin dashboard for monitoring

========================================
2. REALTIME UPDATES
========================================

A. SUPABASE REALTIME INTEGRATION
   - Enable Realtime on relevant tables:
     * projects
     * tasks
     * time_logs
     * client_communications
     * work_documentation
   
   - Set up proper RLS policies for Realtime
   - Configure broadcast channels

B. REALTIME FEATURES TO IMPLEMENT
   
   1. **Live Task Updates**
      - When another user completes a task
      - When task is assigned to you
      - When task priority changes
      - Show toast notification with action
   
   2. **Live Project Updates**
      - Project status changes
      - New tasks added to project
      - Budget updates
      - Document uploads
   
   3. **Live Presence**
      - Show which users are online
      - Show who is viewing a project
      - Show who is editing a document
      - Typing indicators (optional)
   
   4. **Live Notifications**
      - Real-time notification bell
      - Unread count badge
      - Notification dropdown
      - Mark as read functionality

C. IMPLEMENT REALTIME HOOKS
   Create custom hooks in src/hooks/:
   
   ```typescript
   // useRealtimeSubscription.ts
   export function useRealtimeSubscription(
     table: string,
     filter?: string,
     callback?: (payload: any) => void
   ) {
     // Subscribe to table changes
     // Handle inserts, updates, deletes
     // Return cleanup function
   }
   
   // useRealtimePresence.ts
   export function useRealtimePresence(channel: string) {
     // Track online users
     // Broadcast presence
     // Return online users list
   }
   
   // useNotifications.ts
   export function useNotifications() {
     // Subscribe to user's notifications
     // Mark as read
     // Delete notifications
     // Return notifications array
   }
   ```

D. UI COMPONENTS FOR REALTIME
   
   1. **NotificationBell Component**
      ```tsx
      // src/components/NotificationBell.tsx
      - Bell icon with unread count badge
      - Dropdown with notifications list
      - Mark all as read button
      - "View all" link to notifications page
      - Real-time updates
      - Sound on new notification (optional)
      ```
   
   2. **OnlineUsers Component**
      ```tsx
      // src/components/OnlineUsers.tsx
      - Avatar list of online users
      - Green dot indicator
      - Hover shows user name
      - Shows who's viewing current page
      ```
   
   3. **LiveToast Component**
      ```tsx
      // src/components/LiveToast.tsx
      - Toast notifications for realtime events
      - Action buttons (View, Dismiss, Undo)
      - Auto-dismiss after 5 seconds
      - Stack multiple toasts
      ```

E. NOTIFICATIONS PAGE
   Create comprehensive notifications center:
   ```tsx
   // src/pages/NotificationsPage.tsx
   - All notifications list
   - Filter by type
   - Filter by read/unread
   - Bulk actions (mark all read, delete all)
   - Pagination
   - Search functionality
   - Group by date (Today, Yesterday, This Week, Older)
   ```

========================================
3. ANALYTICS & MONITORING
========================================

A. EMAIL ANALYTICS
   - Track email open rates
   - Track click-through rates
   - Track delivery success/failure
   - Create admin dashboard for email metrics
   - Set up alerts for high bounce rates

B. REALTIME PERFORMANCE MONITORING
   - Monitor subscription counts
   - Track message throughput
   - Alert on connection issues
   - Log realtime errors
   - Create debugging tools

C. USER ENGAGEMENT METRICS
   - Track notification engagement
   - Measure feature adoption
   - A/B test notification content
   - Optimize send times

========================================
4. TESTING
========================================

A. EMAIL TESTING
   - Unit tests for email template rendering
   - Integration tests for email sending
   - Test all notification triggers
   - Test digest email aggregation
   - Test notification preferences
   - Test quiet hours functionality

B. REALTIME TESTING
   - Test subscriptions connect/disconnect
   - Test message delivery
   - Test presence tracking
   - Test simultaneous users
   - Test connection recovery
   - Load testing with many subscriptions

C. END-TO-END TESTING
   - User receives deadline reminder
   - User gets budget alert
   - User sees live task update
   - User manages notification preferences
   - Digest email contains correct data

========================================
5. DOCUMENTATION
========================================

Create comprehensive documentation:

A. **EMAIL_NOTIFICATIONS_GUIDE.md**
   - How to configure email service
   - List of all notification types
   - How to create custom templates
   - Troubleshooting email delivery
   - SMTP setup instructions

B. **REALTIME_GUIDE.md**
   - Supabase Realtime setup
   - How to add realtime to new tables
   - Best practices for subscriptions
   - Performance optimization
   - Debugging realtime issues

C. **USER_NOTIFICATION_SETTINGS.md**
   - User guide for notification preferences
   - How to enable/disable notifications
   - How to set quiet hours
   - How to choose digest frequency

D. **ADMIN_NOTIFICATION_DASHBOARD.md**
   - How to monitor email delivery
   - How to troubleshoot failed sends
   - How to view analytics
   - How to manage notification queue

========================================
6. CONFIGURATION & DEPLOYMENT
========================================

A. ENVIRONMENT VARIABLES
   Add to .env:
   ```env
   # Email Configuration
   EMAIL_SERVICE=resend # or sendgrid, supabase
   EMAIL_API_KEY=your_api_key
   EMAIL_FROM=noreply@fire-protection-tracker.com
   EMAIL_FROM_NAME=Fire Protection Tracker
   
   # Supabase Edge Functions
   SUPABASE_FUNCTIONS_URL=https://xxx.supabase.co/functions/v1
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Realtime Configuration
   REALTIME_ENABLED=true
   ```

B. SUPABASE CONFIGURATION
   - Enable Realtime in Supabase dashboard
   - Configure Edge Functions
   - Set up cron triggers
   - Configure email service integration

C. DEPLOYMENT CHECKLIST
   - [ ] Email service API key configured
   - [ ] Edge Functions deployed
   - [ ] Cron jobs scheduled
   - [ ] Realtime enabled on tables
   - [ ] RLS policies updated
   - [ ] Email templates uploaded
   - [ ] Notification preferences migrated
   - [ ] Testing completed
   - [ ] Documentation updated
   - [ ] Monitoring set up

========================================
DELIVERABLES
========================================

✅ **Database:**
- notifications table (enhanced from future-features)
- notification_preferences table
- email_analytics table
- Migration script

✅ **Edge Functions:**
- send-email/
- check-task-deadlines/
- check-budget-alerts/
- send-digest-emails/

✅ **Email Templates:**
- 7+ responsive HTML email templates
- Template rendering system

✅ **Frontend Components:**
- NotificationBell.tsx
- OnlineUsers.tsx
- LiveToast.tsx
- NotificationPreferences.tsx (settings page)
- NotificationsPage.tsx (full notifications center)

✅ **Realtime Hooks:**
- useRealtimeSubscription.ts
- useRealtimePresence.ts
- useNotifications.ts

✅ **Tests:**
- Email sending tests
- Realtime subscription tests
- Notification trigger tests
- E2E notification flow tests

✅ **Documentation:**
- EMAIL_NOTIFICATIONS_GUIDE.md
- REALTIME_GUIDE.md
- USER_NOTIFICATION_SETTINGS.md
- ADMIN_NOTIFICATION_DASHBOARD.md
- API documentation for Edge Functions

✅ **Configuration:**
- Supabase Edge Functions configured
- Email service integrated
- Cron jobs scheduled
- Environment variables documented

========================================
SUCCESS CRITERIA
========================================

- [ ] Users receive deadline reminders 24hrs before due date
- [ ] Budget alerts sent when project >90% budget
- [ ] Realtime task updates appear instantly
- [ ] Online presence tracking works accurately
- [ ] Email templates are beautiful and responsive
- [ ] Notification preferences are respected
- [ ] Quiet hours functionality works
- [ ] Daily digest emails aggregate correctly
- [ ] Email delivery rate >95%
- [ ] Realtime latency <500ms
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Zero production errors

========================================
DEPENDENCIES
========================================

**Required Before Starting:**
- Production database is live
- Supabase Edge Functions are available
- Email service account created (Resend recommended)
- SSL/TLS for email configured

**External Services:**
- Email service (Resend, SendGrid, or Supabase)
- Supabase Realtime (included in Supabase)
- Supabase Edge Functions (included in Supabase)

========================================
ESTIMATED EFFORT
========================================

- Email notification system: 3-4 days
- Realtime updates: 2-3 days
- UI components: 2 days
- Testing: 2 days
- Documentation: 1 day
- **Total: 10-12 days**

========================================
WHEN COMPLETE
========================================

1. Run all tests: npm test
2. Test email sending manually
3. Test realtime updates with multiple users
4. Create feature branch: feature/email-notifications-realtime
5. Commit with clear messages
6. Create PR to main
7. Include:
   - Screenshots of notifications
   - Video demo of realtime features
   - Email template examples
   - Performance metrics

========================================
NOTES
========================================

- **Email Service:** Resend is recommended for its simplicity and generous free tier
- **Realtime:** Supabase Realtime is WebSocket-based and very efficient
- **Templates:** Use MJML for responsive email templates
- **Cron:** Supabase Edge Functions support cron triggers
- **Testing:** Use MailCatcher or Mailtrap for email testing
- **Performance:** Batch notification checks to avoid overwhelming the system
- **Privacy:** Respect user preferences and GDPR requirements
- **Monitoring:** Set up alerts for failed email sends

BEGIN WORK NOW.
```

---

## 📋 **AGENT 7: Mobile PWA & Offline Capability**

**Copy this entire prompt:**

```
You are Agent 7: Mobile PWA & Offline Capability Expert.

⚠️ IMPORTANT CONTEXT:
- Main branch has all previous agents' work integrated
- Reports module exists
- Email notifications may be in progress (Agent 6)
- This is Phase 2 work (post-launch)
- Work independently in your own branch

CREATE YOUR BRANCH:
git checkout main
git pull origin main
git checkout -b feature/mobile-pwa-offline

MISSION: Transform the Fire Protection Tracker into a full-featured Progressive Web App (PWA) with offline capabilities, mobile optimization, and native-like experience.

CURRENT STATE:
- Web application is responsive
- No PWA manifest properly configured
- No service worker
- No offline functionality
- No install prompts
- Basic mobile responsiveness

YOUR TASKS:

========================================
1. PWA FOUNDATION
========================================

A. WEB APP MANIFEST
   Enhance public/manifest.json:
   ```json
   {
     "name": "Fire Protection Tracker",
     "short_name": "FP Tracker",
     "description": "Professional fire protection project management system",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#1f2937",
     "theme_color": "#ef4444",
     "orientation": "portrait-primary",
     "icons": [
       {
         "src": "/icons/icon-72x72.png",
         "sizes": "72x72",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-96x96.png",
         "sizes": "96x96",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-128x128.png",
         "sizes": "128x128",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-144x144.png",
         "sizes": "144x144",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-152x152.png",
         "sizes": "152x152",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-384x384.png",
         "sizes": "384x384",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "/icons/icon-512x512.png",
         "sizes": "512x512",
         "type": "image/png",
         "purpose": "any maskable"
       }
     ],
     "screenshots": [
       {
         "src": "/screenshots/desktop-1.png",
         "sizes": "2560x1440",
         "type": "image/png",
         "form_factor": "wide"
       },
       {
         "src": "/screenshots/mobile-1.png",
         "sizes": "750x1334",
         "type": "image/png",
         "form_factor": "narrow"
       }
     ],
     "categories": ["business", "productivity"],
     "shortcuts": [
       {
         "name": "Dashboard",
         "short_name": "Dashboard",
         "description": "View project dashboard",
         "url": "/dashboard",
         "icons": [{ "src": "/icons/shortcut-dashboard.png", "sizes": "96x96" }]
       },
       {
         "name": "New Project",
         "short_name": "New",
         "description": "Create new project",
         "url": "/projects?new=true",
         "icons": [{ "src": "/icons/shortcut-new.png", "sizes": "96x96" }]
       },
       {
         "name": "Reports",
         "short_name": "Reports",
         "description": "View reports",
         "url": "/reports",
         "icons": [{ "src": "/icons/shortcut-reports.png", "sizes": "96x96" }]
       }
     ],
     "share_target": {
       "action": "/work-docs",
       "method": "POST",
       "enctype": "multipart/form-data",
       "params": {
         "title": "name",
         "text": "description",
         "files": [
           {
             "name": "photos",
             "accept": ["image/*"]
           }
         ]
       }
     }
   }
   ```

B. SERVICE WORKER
   Create comprehensive service worker in public/sw.js:
   
   **Features to implement:**
   1. Cache-first strategy for static assets
   2. Network-first strategy for API calls
   3. Offline fallback page
   4. Background sync for failed requests
   5. Push notification support
   6. Periodic background sync
   7. Cache management (size limits)
   8. Update notification system
   
   **Caching Strategies:**
   ```javascript
   // Static assets: Cache first
   - HTML, CSS, JS files
   - Icons, images
   - Fonts
   
   // API calls: Network first with cache fallback
   - Supabase API requests
   - User data
   - Project data
   
   // Documents: Cache with update
   - PDF files
   - Templates
   - Work documentation photos
   ```

C. SERVICE WORKER REGISTRATION
   Create src/serviceWorkerRegistration.ts:
   - Register service worker
   - Handle updates
   - Show update available notification
   - Implement skipWaiting
   - Handle controller changes

========================================
2. OFFLINE FUNCTIONALITY
========================================

A. OFFLINE DATA STORAGE
   Implement IndexedDB for offline data:
   
   Create src/lib/offline-storage.ts:
   ```typescript
   // Tables to sync offline:
   - projects (recent 20)
   - tasks (user's active tasks)
   - time_logs (today's logs)
   - clients (active clients)
   - document_library (metadata only)
   
   // Functions:
   - saveForOffline()
   - getOfflineData()
   - syncWithServer()
   - clearOfflineData()
   - getOfflineStatus()
   ```

B. OFFLINE SYNC QUEUE
   Create src/lib/sync-queue.ts:
   ```typescript
   // Queue pending operations:
   - Task completions
   - Time log entries
   - Status updates
   - Photo uploads
   
   // Background sync when online:
   - Automatic retry
   - Conflict resolution
   - Success/failure notifications
   ```

C. OFFLINE UI INDICATORS
   Create components:
   
   1. **OfflineIndicator.tsx**
      - Banner showing offline status
      - Sync status indicator
      - Pending operations count
      - Manual sync button
   
   2. **OfflineFallback.tsx**
      - Offline fallback page
      - Cached data viewer
      - Helpful instructions
      - Retry connection button

D. OFFLINE-CAPABLE FEATURES
   Prioritize these for offline:
   1. ✅ View recent projects
   2. ✅ View active tasks
   3. ✅ Log time (queued for sync)
   4. ✅ Mark tasks complete (queued)
   5. ✅ Take photos (stored locally)
   6. ✅ View cached documents
   7. ❌ Create new projects (online only)
   8. ❌ Upload documents (online only)

========================================
3. MOBILE OPTIMIZATION
========================================

A. TOUCH OPTIMIZATIONS
   - Increase tap targets to 44x44px minimum
   - Add touch feedback (ripple effects)
   - Implement swipe gestures:
     * Swipe left to mark task complete
     * Swipe right to view task details
     * Pull to refresh on lists
     * Swipe to delete with confirmation
   - Optimize scroll performance
   - Prevent zoom on input focus

B. MOBILE-FIRST UI IMPROVEMENTS
   
   1. **Bottom Navigation (Mobile)**
      Create mobile-specific navigation:
      ```tsx
      // src/components/MobileBottomNav.tsx
      - Home
      - Projects
      - Tasks
      - Reports
      - More (menu)
      
      - Fixed at bottom
      - Active indicator
      - Badge for notifications
      - Smooth transitions
      ```
   
   2. **Floating Action Button**
      ```tsx
      // src/components/FAB.tsx
      - Quick actions menu
      - Context-aware actions
      - Position: bottom right
      - Actions:
        * New project
        * New task
        * Log time
        * Take photo
      ```
   
   3. **Mobile-Optimized Forms**
      - Larger input fields
      - Better keyboard handling
      - Input type optimization (tel, email, number)
      - Autofocus management
      - Submit on enter
      - Scroll to error fields

C. CAMERA INTEGRATION
   Enhanced camera features:
   ```tsx
   // src/components/CameraCapture.tsx
   - Native camera access
   - Multiple photo capture
   - Photo preview
   - Crop/rotate tools
   - Compression before upload
   - Offline storage
   - Location tagging (optional)
   - Timestamp overlay
   ```

D. GEOLOCATION FEATURES
   ```tsx
   // src/lib/geolocation.ts
   - Get current location
   - Save location with time logs
   - Show job site on map
   - Calculate distance to job site
   - Track travel time
   - Geofencing (notify when arrived at site)
   ```

E. RESPONSIVE IMPROVEMENTS
   
   **Breakpoints:**
   ```css
   - xs: 320px  (small phones)
   - sm: 640px  (phones)
   - md: 768px  (tablets)
   - lg: 1024px (laptops)
   - xl: 1280px (desktops)
   - 2xl: 1536px (large desktops)
   ```
   
   **Test on devices:**
   - iPhone SE (small screen)
   - iPhone 12/13/14 (standard)
   - iPhone 14 Pro Max (large)
   - iPad (tablet)
   - Samsung Galaxy S21 (Android)
   - Pixel 6 (Android)

========================================
4. NATIVE-LIKE FEATURES
========================================

A. APP INSTALL PROMPT
   Create src/components/InstallPrompt.tsx:
   - Detect if app is installable
   - Show install banner (non-intrusive)
   - Custom install button
   - Track install events
   - A/B test prompts
   - Don't show again option
   - Show on 3rd visit

B. PUSH NOTIFICATIONS
   (If Agent 6 hasn't implemented)
   - Request notification permission
   - Subscribe to push notifications
   - Handle notification clicks
   - Badge updates
   - Sound/vibration
   - Action buttons in notifications

C. SHARE API
   Implement Web Share API:
   ```tsx
   // src/hooks/useShare.ts
   - Share project links
   - Share reports (PDF/CSV)
   - Share contact info
   - Share to WhatsApp/Email
   - Fallback to copy to clipboard
   ```

D. FILE SYSTEM ACCESS
   ```tsx
   // src/lib/file-system.ts
   - Save reports locally
   - Open local files
   - Auto-save drafts
   - Export data to device
   ```

E. HAPTIC FEEDBACK
   ```tsx
   // src/lib/haptics.ts
   - Vibrate on actions:
     * Task completed
     * Error occurred
     * Button pressed
     * Swipe gesture
   - Different patterns for different actions
   ```

========================================
5. PERFORMANCE OPTIMIZATION
========================================

A. IMAGE OPTIMIZATION
   - Lazy load images
   - Responsive images (srcset)
   - WebP with fallback
   - Image compression
   - Progressive loading
   - Blur-up placeholder

B. CODE SPLITTING
   - Route-based splitting (already done)
   - Component lazy loading
   - Dynamic imports for heavy features
   - Reduce initial bundle size
   - Prefetch critical routes

C. LOADING OPTIMIZATION
   - Skeleton screens everywhere
   - Optimistic UI updates
   - Instant interactions
   - Background data fetching
   - Request batching
   - Debounce search inputs

D. PERFORMANCE MONITORING
   - Track Core Web Vitals
   - Monitor LCP, FID, CLS
   - Track page load time
   - Monitor API response times
   - Alert on performance degradation

========================================
6. TESTING
========================================

A. PWA AUDIT
   - Run Lighthouse PWA audit
   - Score 90+ required
   - Fix all PWA issues
   - Test install flow
   - Test offline functionality

B. MOBILE TESTING
   **Test on real devices:**
   - iOS devices (iPhone)
   - Android devices (Samsung, Pixel)
   - Different screen sizes
   - Different network conditions (3G, 4G, WiFi)
   - Offline mode
   - Poor connection simulation

C. OFFLINE TESTING
   - Test offline data access
   - Test sync queue
   - Test conflict resolution
   - Test background sync
   - Test cache invalidation

D. PERFORMANCE TESTING
   - Lighthouse performance audit
   - WebPageTest analysis
   - Real device testing
   - Network throttling
   - Long task monitoring

========================================
7. DOCUMENTATION
========================================

Create comprehensive documentation:

A. **PWA_SETUP_GUIDE.md**
   - How PWA works
   - Service worker explanation
   - Caching strategies
   - Update mechanism
   - Troubleshooting

B. **OFFLINE_FUNCTIONALITY_GUIDE.md**
   - What works offline
   - How to sync data
   - Conflict resolution
   - Best practices
   - Limitations

C. **MOBILE_OPTIMIZATION_GUIDE.md**
   - Touch gestures guide
   - Camera usage
   - Location features
   - Mobile-specific UI
   - Testing on mobile

D. **USER_GUIDE_MOBILE.md**
   - How to install app
   - Using offline mode
   - Mobile tips and tricks
   - Camera features
   - Location tracking

========================================
DELIVERABLES
========================================

✅ **PWA Configuration:**
- Enhanced manifest.json
- Service worker (sw.js)
- Service worker registration
- All required icons (72px - 512px)
- Screenshots for app stores

✅ **Offline System:**
- IndexedDB storage layer
- Sync queue implementation
- Conflict resolution logic
- Offline indicator components

✅ **Mobile UI:**
- MobileBottomNav.tsx
- FAB.tsx (Floating Action Button)
- InstallPrompt.tsx
- OfflineIndicator.tsx
- CameraCapture.tsx
- Touch-optimized components

✅ **Native Features:**
- Web Share API integration
- Geolocation services
- Haptic feedback
- File system access
- Push notification setup

✅ **Hooks & Utilities:**
- useServiceWorker.ts
- useOffline.ts
- useInstallPrompt.ts
- useShare.ts
- useCamera.ts
- useGeolocation.ts

✅ **Tests:**
- PWA Lighthouse audit passing
- Offline functionality tests
- Mobile responsiveness tests
- Touch gesture tests
- Camera integration tests

✅ **Documentation:**
- PWA_SETUP_GUIDE.md
- OFFLINE_FUNCTIONALITY_GUIDE.md
- MOBILE_OPTIMIZATION_GUIDE.md
- USER_GUIDE_MOBILE.md

✅ **Assets:**
- App icons (all sizes)
- Splash screens
- Screenshots
- Shortcut icons

========================================
SUCCESS CRITERIA
========================================

- [ ] Lighthouse PWA score: 90+
- [ ] Lighthouse Performance score: 90+
- [ ] App is installable on iOS and Android
- [ ] Works offline (view data, log time, mark complete)
- [ ] Sync queue processes when back online
- [ ] Service worker caches correctly
- [ ] Camera capture works on mobile
- [ ] Touch gestures feel natural
- [ ] Pull-to-refresh works
- [ ] Install prompt shows appropriately
- [ ] App feels native on mobile
- [ ] All tests passing
- [ ] Documentation complete

========================================
DEPENDENCIES
========================================

**Required:**
- Main application is deployed
- HTTPS enabled (required for PWA)
- Service workers supported (all modern browsers)

**Optional:**
- Push notification server (if implementing push)
- Geolocation API access
- Camera API access

========================================
ESTIMATED EFFORT
========================================

- PWA setup and service worker: 2-3 days
- Offline functionality: 3-4 days
- Mobile UI optimization: 2-3 days
- Native features: 2 days
- Testing and fixes: 2 days
- Documentation: 1 day
- **Total: 12-15 days**

========================================
WHEN COMPLETE
========================================

1. Run Lighthouse audit (aim for 90+ PWA score)
2. Test install on iOS device
3. Test install on Android device
4. Test offline mode thoroughly
5. Test on poor network connection
6. Create feature branch: feature/mobile-pwa-offline
7. Commit with clear messages
8. Create PR to main
9. Include:
   - Lighthouse scores (before/after)
   - Screenshots of install prompt
   - Video of offline functionality
   - Mobile device testing results
   - Performance metrics

========================================
NOTES
========================================

- **iOS Limitations:** iOS has some PWA limitations (no background sync, no push notifications from homescreen)
- **Service Workers:** Require HTTPS (works on localhost for development)
- **Cache Size:** Be mindful of cache size limits (50-100MB reasonable)
- **Update Strategy:** Prompt users to update when new version available
- **Testing:** Use Chrome DevTools > Application tab for PWA debugging
- **Offline First:** Design features with offline-first mindset
- **Progressive Enhancement:** App should work without service worker

BEGIN WORK NOW.
```

---

## 📋 **AGENT 8: Advanced Analytics & AI Features**

**Copy this entire prompt:**

```
You are Agent 8: Advanced Analytics & AI Features Specialist.

⚠️ IMPORTANT CONTEXT:
- Main branch has all previous agents' work integrated
- Reports module exists with basic reporting
- Email notifications may be implemented (Agent 6)
- PWA features may be implemented (Agent 7)
- This is Phase 2 work (post-launch)
- Work independently in your own branch

CREATE YOUR BRANCH:
git checkout main
git pull origin main
git checkout -b feature/advanced-analytics-ai

MISSION: Implement advanced analytics, predictive insights, and AI-powered features to provide intelligent project management capabilities and business intelligence.

CURRENT STATE:
- Basic reports exist (Progress, Budget, Communications)
- No predictive analytics
- No AI features
- No advanced visualizations
- No business intelligence
- No forecasting

YOUR TASKS:

========================================
1. ADVANCED ANALYTICS DASHBOARD
========================================

A. ANALYTICS DATABASE SCHEMA
   Create tables for analytics:
   ```sql
   -- Analytics snapshots (daily aggregations)
   CREATE TABLE analytics_snapshots (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     snapshot_date DATE NOT NULL,
     total_projects INTEGER,
     active_projects INTEGER,
     completed_projects INTEGER,
     overdue_projects INTEGER,
     total_revenue DECIMAL(12,2),
     total_costs DECIMAL(12,2),
     average_project_duration INTEGER, -- days
     average_budget_variance DECIMAL(5,2),
     on_time_completion_rate DECIMAL(5,2),
     customer_satisfaction_score DECIMAL(3,2),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Project performance metrics
   CREATE TABLE project_metrics (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     completion_percentage DECIMAL(5,2),
     budget_variance DECIMAL(10,2),
     schedule_variance INTEGER, -- days
     team_productivity DECIMAL(5,2), -- tasks per day
     cost_performance_index DECIMAL(5,2),
     schedule_performance_index DECIMAL(5,2),
     estimated_completion_date DATE,
     risk_score DECIMAL(3,2), -- 0-100
     health_status TEXT CHECK (health_status IN ('healthy', 'at_risk', 'critical'))
   );
   
   -- Predictive models
   CREATE TABLE prediction_models (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     model_type TEXT NOT NULL, -- 'completion_date', 'budget_overrun', 'risk_score'
     model_version TEXT NOT NULL,
     training_data JSONB,
     accuracy_score DECIMAL(5,2),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     active BOOLEAN DEFAULT true
   );
   
   -- AI insights
   CREATE TABLE ai_insights (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     insight_type TEXT NOT NULL, -- 'recommendation', 'warning', 'optimization', 'prediction'
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     confidence_score DECIMAL(3,2), -- 0-1
     impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
     action_required BOOLEAN DEFAULT false,
     action_description TEXT,
     acknowledged BOOLEAN DEFAULT false,
     acknowledged_by UUID REFERENCES profiles(id),
     acknowledged_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

B. ANALYTICS DASHBOARD PAGE
   Create src/pages/AnalyticsPage.tsx:
   
   **Key Performance Indicators (KPIs):**
   ```tsx
   1. Business Metrics
      - Total revenue (MTD, YTD)
      - Total costs
      - Profit margin
      - Revenue per project
      - Average project value
   
   2. Project Performance
      - On-time completion rate
      - Average project duration
      - Budget variance average
      - Customer satisfaction
      - Projects completed this month
   
   3. Team Performance
      - Tasks completed per day
      - Average time per task
      - Team utilization rate
      - Productivity trends
      - Most productive team members
   
   4. Financial Health
      - Cash flow projection
      - Accounts receivable aging
      - Profit/loss trends
      - Budget utilization
      - Cost breakdown by category
   ```

C. ADVANCED VISUALIZATIONS
   Integrate charting library (recharts or chart.js):
   
   **Charts to implement:**
   ```tsx
   1. Revenue & Profit Trends
      - Line chart (monthly/quarterly/yearly)
      - Comparison to previous period
      - Forecast line for next 3 months
   
   2. Project Pipeline
      - Funnel chart (leads → active → completed)
      - Conversion rates
      - Average time in each stage
   
   3. Budget Performance
      - Actual vs Estimated bar chart
      - Grouped by project type
      - Variance analysis
   
   4. Team Workload
      - Stacked bar chart
      - Tasks by team member
      - Capacity planning
   
   5. Task Completion Rates
      - Line chart over time
      - By priority level
      - By project type
   
   6. Cost Breakdown
      - Pie/donut chart
      - Labor vs Materials
      - By cost category
   
   7. Project Timeline
      - Gantt chart view
      - Dependencies visualization
      - Critical path highlighting
   
   8. Risk Heatmap
      - Matrix of probability vs impact
      - Color-coded by severity
      - Click to view details
   
   9. Customer Satisfaction
      - Line chart over time
      - By project type
      - Correlation with other metrics
   
   10. Geographical Distribution
       - Map view of projects
       - Heat map by region
       - Travel time analysis
   ```

D. INTERACTIVE FILTERS & DRILL-DOWN
   ```tsx
   // src/components/AnalyticsFilters.tsx
   - Date range picker
   - Project type filter
   - Client filter
   - Team member filter
   - Status filter
   - Save filter presets
   - Export filtered data
   
   // Drill-down functionality:
   - Click any chart element for details
   - Breadcrumb navigation
   - Back to overview button
   ```

========================================
2. PREDICTIVE ANALYTICS
========================================

A. PROJECT COMPLETION PREDICTION
   Create src/lib/predictions/completion-predictor.ts:
   
   **Algorithm:**
   ```typescript
   // Factors to consider:
   - Historical completion times
   - Current progress rate
   - Task complexity
   - Team capacity
   - Historical delays
   - Current blockers
   - Weather seasonality (fire protection work)
   
   // Output:
   - Predicted completion date
   - Confidence interval (80%, 90%)
   - Risk factors affecting prediction
   - Recommended actions
   ```
   
   **ML Model (simple linear regression to start):**
   - Train on completed projects
   - Use features: project_size, team_size, complexity, season
   - Predict: days_to_complete
   - Update model weekly with new data

B. BUDGET OVERRUN PREDICTION
   Create src/lib/predictions/budget-predictor.ts:
   
   **Algorithm:**
   ```typescript
   // Factors:
   - Current spend rate
   - Remaining work estimate
   - Historical variance patterns
   - Material price fluctuations
   - Scope changes
   
   // Early warning system:
   - Alert at 50% complete if trending >10% over
   - Weekly budget health report
   - Recommend cost-saving measures
   ```

C. RISK SCORING SYSTEM
   Create src/lib/predictions/risk-scorer.ts:
   
   **Risk Factors:**
   ```typescript
   // Project Risk Score (0-100):
   1. Schedule Risk (30%)
      - Days behind schedule
      - Completion rate trend
      - Upcoming deadlines
   
   2. Budget Risk (30%)
      - Current variance
      - Spend rate
      - Remaining budget vs work
   
   3. Quality Risk (20%)
      - Rework frequency
      - Inspection failures
      - Client complaints
   
   4. Resource Risk (20%)
      - Team capacity
      - Skill availability
      - Equipment availability
   
   // Output:
   - Overall risk score
   - Risk category breakdown
   - Top 3 risk factors
   - Mitigation recommendations
   ```

D. RESOURCE OPTIMIZATION
   Create src/lib/predictions/resource-optimizer.ts:
   
   **Optimization Algorithm:**
   ```typescript
   // Given: team members, their skills, current projects
   // Optimize: task assignments to minimize:
   - Project delays
   - Cost overruns
   - Team overutilization
   
   // Constraints:
   - Skill requirements
   - Availability
   - Maximum workload per person
   - Travel time between sites
   
   // Recommendations:
   - Suggested task assignments
   - Team rebalancing suggestions
   - Hiring needs prediction
   ```

========================================
3. AI-POWERED FEATURES
========================================

A. SMART PROJECT RECOMMENDATIONS
   Create src/lib/ai/project-advisor.ts:
   
   **Features:**
   ```typescript
   1. Similar Project Analysis
      - Find similar completed projects
      - Compare metrics (time, cost, team size)
      - Suggest best practices from similar projects
   
   2. Optimal Team Composition
      - Based on project requirements
      - Consider past successful teams
      - Account for current availability
   
   3. Cost Estimation
      - AI-enhanced cost prediction
      - Based on historical data
      - Adjusted for market conditions
   
   4. Timeline Optimization
      - Suggest optimal task ordering
      - Identify parallelizable tasks
      - Minimize critical path
   ```

B. INTELLIGENT TASK PRIORITIZATION
   Create src/lib/ai/task-prioritizer.ts:
   
   **Algorithm:**
   ```typescript
   // Factors:
   - Task dependencies
   - Resource availability
   - Project deadlines
   - Customer importance
   - Impact on other tasks
   - Historical urgency patterns
   
   // Output:
   - Prioritized task list
   - Reasoning for prioritization
   - Suggested order of execution
   - Estimated completion date
   ```

C. AUTOMATED ANOMALY DETECTION
   Create src/lib/ai/anomaly-detector.ts:
   
   **Detect Anomalies In:**
   ```typescript
   1. Budget
      - Unusual spend spikes
      - Material cost anomalies
      - Labor hour irregularities
   
   2. Schedule
      - Tasks taking unusually long
      - Unexpected delays
      - Pattern deviations
   
   3. Team Performance
      - Productivity drops
      - Quality issues
      - Unusual patterns
   
   // Actions:
   - Alert project manager
   - Log in AI insights table
   - Suggest investigation areas
   ```

D. NATURAL LANGUAGE INSIGHTS
   Create src/lib/ai/insight-generator.ts:
   
   **Generate Human-Readable Insights:**
   ```typescript
   Examples:
   - "Project Alpha is trending 15% over budget. Main cost driver: unexpected material price increase. Recommendation: Review supplier contracts."
   
   - "Your team's productivity has increased 22% this month. Top contributor: John Smith (32 tasks completed)."
   
   - "Project Beta has 85% probability of late completion. Key risk: insufficient team capacity next week. Recommendation: Consider hiring temporary help."
   
   - "Based on similar projects, you can reduce costs by 12% by ordering materials in bulk for the next 3 projects."
   ```

========================================
4. BUSINESS INTELLIGENCE REPORTS
========================================

A. EXECUTIVE DASHBOARD
   Create src/pages/ExecutiveDashboard.tsx:
   
   **High-Level Metrics:**
   ```tsx
   1. Financial Overview
      - Revenue this month/quarter/year
      - Profit margin trends
      - Cash flow status
      - Top revenue-generating projects
   
   2. Portfolio Health
      - Total active projects
      - Projects at risk
      - Overall completion rate
      - Average project profitability
   
   3. Growth Metrics
      - New projects this period
      - Growth rate
      - Market share trends
      - Customer acquisition cost
   
   4. Strategic Indicators
      - Customer satisfaction NPS
      - Employee utilization
      - Win rate on proposals
      - Average project value
   ```

B. CUSTOM REPORT BUILDER
   Create src/components/ReportBuilder.tsx:
   
   **Features:**
   ```tsx
   - Drag-and-drop interface
   - Choose metrics to include
   - Select visualization type
   - Add filters
   - Schedule automated reports
   - Export to PDF/Excel/CSV
   - Share via email
   - Save as template
   ```

C. AUTOMATED REPORTS
   Create automated report system:
   
   **Report Types:**
   ```typescript
   1. Daily Digest
      - Yesterday's activity
      - Today's priorities
      - Upcoming deadlines
   
   2. Weekly Summary
      - Week's accomplishments
      - Budget status all projects
      - Team performance
      - Issues that need attention
   
   3. Monthly Executive Report
      - Financial performance
      - Project portfolio status
      - Team productivity
      - Strategic recommendations
   
   4. Quarterly Business Review
      - Quarter performance vs goals
      - Trends and insights
      - Forecast for next quarter
      - Strategic recommendations
   ```

========================================
5. DATA EXPORT & INTEGRATION
========================================

A. ADVANCED EXPORT OPTIONS
   Create src/lib/exports/:
   
   ```typescript
   1. PDF Reports
      - Beautiful formatted reports
      - Charts and tables
      - Company branding
      - Page numbers, headers, footers
   
   2. Excel Workbooks
      - Multiple sheets
      - Formatted tables
      - Embedded charts
      - Formulas for dynamic analysis
   
   3. CSV Data Dumps
      - All data fields
      - Proper formatting
      - Quote handling
      - Large dataset support
   
   4. Google Sheets Integration
      - Export directly to Google Sheets
      - Auto-updating sheets
      - Shared with stakeholders
   ```

B. API FOR EXTERNAL INTEGRATIONS
   Create API endpoints:
   
   ```typescript
   // src/lib/api/analytics-api.ts
   
   GET /api/analytics/kpis
   GET /api/analytics/projects/:id/metrics
   GET /api/analytics/predictions/:project_id
   GET /api/analytics/insights
   POST /api/analytics/export
   ```

========================================
6. MACHINE LEARNING PIPELINE
========================================

A. DATA COLLECTION & PREPROCESSING
   Create src/lib/ml/data-pipeline.ts:
   
   ```typescript
   // Collect training data from:
   - Completed projects
   - Task completion history
   - Budget actuals
   - Time logs
   - Client feedback
   
   // Preprocess:
   - Handle missing data
   - Normalize values
   - Feature engineering
   - Train/test split
   ```

B. MODEL TRAINING
   Create src/lib/ml/model-trainer.ts:
   
   **Models to train:**
   ```typescript
   1. Project Duration Model
      Input: project_size, complexity, team_size, season
      Output: estimated_days
      Algorithm: Linear Regression
   
   2. Budget Overrun Model
      Input: progress, current_variance, remaining_work
      Output: probability_overrun
      Algorithm: Logistic Regression
   
   3. Risk Score Model
      Input: various risk factors
      Output: risk_score (0-100)
      Algorithm: Random Forest
   
   4. Task Duration Model
      Input: task_type, complexity, assignee_skill
      Output: estimated_hours
      Algorithm: Decision Tree
   ```

C. MODEL EVALUATION & MONITORING
   Create src/lib/ml/model-monitor.ts:
   
   ```typescript
   // Track model performance:
   - Prediction accuracy
   - Mean Absolute Error
   - Root Mean Square Error
   - Precision/Recall (classification)
   
   // Automated retraining:
   - Retrain weekly with new data
   - A/B test new models
   - Gradual rollout of improvements
   
   // Alerts:
   - Alert if accuracy drops
   - Alert if predictions drift
   - Dashboard for ML metrics
   ```

========================================
7. AI INSIGHTS UI
========================================

A. INSIGHTS PANEL
   Create src/components/AIInsightsPanel.tsx:
   
   ```tsx
   // Floating panel on dashboard
   - AI assistant icon
   - Expandable panel
   - List of insights
   - Priority badges
   - Action buttons
   - Dismiss/acknowledge
   - "Explain this" feature
   ```

B. INSIGHT CARDS
   Create src/components/InsightCard.tsx:
   
   ```tsx
   // Each insight displayed as:
   - Icon (based on type)
   - Title
   - Description
   - Confidence score
   - Impact level badge
   - Recommended action
   - "View details" link
   - Acknowledge button
   - Snooze option
   ```

C. INSIGHTS TIMELINE
   Create src/pages/InsightsPage.tsx:
   
   ```tsx
   // Full page for insights
   - Timeline view of all insights
   - Filter by type, priority
   - Search insights
   - View acknowledged insights
   - Insight analytics (how many helped)
   - Feedback on insights (useful/not useful)
   ```

========================================
8. TESTING
========================================

A. ANALYTICS ACCURACY TESTING
   - Verify calculations are correct
   - Test edge cases
   - Compare with manual calculations
   - Test with various data volumes
   - Test performance with large datasets

B. PREDICTION MODEL TESTING
   - Test with historical data
   - Measure accuracy
   - Test edge cases
   - Test with incomplete data
   - Validate predictions make sense

C. UI/UX TESTING
   - Test all visualizations render
   - Test interactions
   - Test responsive design
   - Test accessibility
   - User acceptance testing

D. PERFORMANCE TESTING
   - Load test analytics queries
   - Test with 1000+ projects
   - Test chart rendering performance
   - Test export performance
   - Optimize slow queries

========================================
9. DOCUMENTATION
========================================

Create comprehensive documentation:

A. **ANALYTICS_GUIDE.md**
   - How to use analytics dashboard
   - Understanding KPIs
   - How to interpret charts
   - Custom report creation
   - Export options

B. **PREDICTIVE_ANALYTICS_GUIDE.md**
   - How predictions work
   - Understanding confidence scores
   - How to act on predictions
   - Accuracy and limitations
   - Model updates

C. **AI_INSIGHTS_GUIDE.md**
   - Types of insights
   - How AI generates insights
   - How to acknowledge/act on insights
   - Providing feedback
   - Privacy and data usage

D. **ML_TECHNICAL_GUIDE.md**
   - Model architecture
   - Training process
   - Feature engineering
   - Model evaluation
   - Retraining schedule

========================================
DELIVERABLES
========================================

✅ **Database:**
- analytics_snapshots table
- project_metrics table
- prediction_models table
- ai_insights table
- Migration script

✅ **Analytics Pages:**
- AnalyticsPage.tsx (main dashboard)
- ExecutiveDashboard.tsx (high-level view)
- InsightsPage.tsx (AI insights center)

✅ **Visualization Components:**
- 10+ chart types implemented
- Interactive filters
- Drill-down functionality
- Export functionality

✅ **Prediction Engine:**
- completion-predictor.ts
- budget-predictor.ts
- risk-scorer.ts
- resource-optimizer.ts

✅ **AI Features:**
- project-advisor.ts
- task-prioritizer.ts
- anomaly-detector.ts
- insight-generator.ts

✅ **ML Pipeline:**
- data-pipeline.ts
- model-trainer.ts
- model-monitor.ts

✅ **Export System:**
- PDF export
- Excel export
- CSV export
- Google Sheets integration

✅ **UI Components:**
- AIInsightsPanel.tsx
- InsightCard.tsx
- AnalyticsFilters.tsx
- ReportBuilder.tsx

✅ **Tests:**
- Analytics calculation tests
- Prediction accuracy tests
- Chart rendering tests
- Export tests
- Performance tests

✅ **Documentation:**
- ANALYTICS_GUIDE.md
- PREDICTIVE_ANALYTICS_GUIDE.md
- AI_INSIGHTS_GUIDE.md
- ML_TECHNICAL_GUIDE.md

========================================
SUCCESS CRITERIA
========================================

- [ ] Analytics dashboard loads <2s
- [ ] All KPIs calculate correctly
- [ ] Charts render smoothly
- [ ] Predictions are reasonably accurate (>70%)
- [ ] AI insights are actionable
- [ ] Export to PDF works flawlessly
- [ ] Reports are visually appealing
- [ ] Models retrain automatically
- [ ] All tests passing
- [ ] Documentation complete

========================================
DEPENDENCIES
========================================

**Required:**
- Historical project data (at least 20 completed projects for ML)
- Reports module (already exists)
- Production database with data

**External Libraries:**
- Charting: recharts or chart.js
- PDF generation: jsPDF + html2canvas
- Excel export: xlsx
- ML (optional): tensorflow.js or simple algorithms

========================================
ESTIMATED EFFORT
========================================

- Analytics dashboard: 4-5 days
- Predictive analytics: 4-5 days
- AI features: 3-4 days
- ML pipeline: 2-3 days
- Visualizations: 3-4 days
- Export system: 2 days
- Testing: 2-3 days
- Documentation: 1-2 days
- **Total: 21-28 days (3-4 weeks)**

========================================
WHEN COMPLETE
========================================

1. Run all tests
2. Test analytics with real data
3. Verify predictions are reasonable
4. Test export functionality
5. Create feature branch: feature/advanced-analytics-ai
6. Commit with clear messages
7. Create PR to main
8. Include:
   - Screenshots of analytics dashboard
   - Video demo of AI insights
   - Sample exported reports
   - Model accuracy metrics
   - Performance benchmarks

========================================
NOTES
========================================

- **Start Simple:** Begin with basic ML algorithms (linear regression)
- **Iterate:** Improve models over time as more data is collected
- **Privacy:** Ensure data handling complies with privacy regulations
- **Performance:** Cache analytics results, precompute where possible
- **Accuracy:** Better to be approximately right than precisely wrong
- **Explainability:** Make predictions understandable, not black boxes
- **Feedback Loop:** Learn from which insights users find useful
- **Data Quality:** Garbage in = garbage out. Validate data quality first

BEGIN WORK NOW.
```

---

**End of Agent Prompts Phase 2**

