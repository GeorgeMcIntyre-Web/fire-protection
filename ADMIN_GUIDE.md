# Fire Protection PM - Administrator Guide

Complete guide for system administrators.

---

## 📋 Table of Contents

1. [Administrator Overview](#administrator-overview)
2. [Initial System Setup](#initial-system-setup)
3. [User Management](#user-management)
4. [Organization Settings](#organization-settings)
5. [Security & Permissions](#security--permissions)
6. [Data Management](#data-management)
7. [Backup & Recovery](#backup--recovery)
8. [System Monitoring](#system-monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## Administrator Overview

### Administrator Responsibilities

As a system administrator, you are responsible for:
- User account management
- System configuration
- Security and access control
- Data backup and recovery
- System monitoring and maintenance
- User support and training
- Policy enforcement
- Compliance and auditing

### Administrator Access Levels

**Super Administrator:**
- Full system access
- User management
- System configuration
- Billing and subscriptions
- Data export and deletion

**Organization Administrator:**
- Organization-level settings
- User management within org
- Project oversight
- Reporting and analytics
- Limited system configuration

---

## Initial System Setup

### Prerequisites

Before deploying Fire Protection PM, ensure you have:
- [ ] Supabase account and project
- [ ] Database setup completed
- [ ] Environment variables configured
- [ ] SMTP email service (optional but recommended)
- [ ] SSL certificate for production
- [ ] Backup strategy in place

### Step 1: Supabase Configuration

1. **Create Supabase Project**
   ```bash
   # Navigate to https://supabase.com
   # Create a new project
   # Note down your project URL and keys
   ```

2. **Run Database Migrations**
   ```bash
   # Execute the SQL setup files in order:
   # 1. supabase-setup.sql (core tables)
   # 2. supabase-documents.sql (document management)
   # 3. supabase-complete-setup.sql (additional features)
   ```

3. **Configure Authentication**
   - Enable email authentication
   - Set up email templates
   - Configure OAuth providers (optional)
   - Set password requirements
   - Configure session timeout

4. **Set Row Level Security (RLS)**
   - Verify RLS policies are enabled
   - Test user access controls
   - Review security policies

### Step 2: Application Configuration

1. **Environment Variables**
   Create `.env` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Build and Deploy**
   ```bash
   # Install dependencies
   npm install
   
   # Build for production
   npm run build
   
   # Deploy to hosting service
   # (Cloudflare Pages, Vercel, Netlify, etc.)
   ```

3. **Verify Deployment**
   - Test login functionality
   - Create test project
   - Upload test document
   - Verify database connections

### Step 3: Organization Setup

1. **Create Organization Profile**
   - Company name
   - Logo and branding
   - Contact information
   - Billing details

2. **Configure System Settings**
   - Date/time formats
   - Currency
   - Timezone
   - Language
   - Business hours

3. **Set System Defaults**
   - Default project settings
   - Task priority levels
   - Time tracking settings
   - Notification preferences
   - Document categories

---

## User Management

### Creating User Accounts

**Method 1: Invite Users**
1. Go to Admin → Users → Invite User
2. Enter email address
3. Assign role
4. Send invitation
5. User receives email to set password

**Method 2: Bulk Import**
1. Prepare CSV file with user data
2. Go to Admin → Users → Import
3. Upload CSV file
4. Review and confirm
5. Send welcome emails

**CSV Format:**
```csv
email,first_name,last_name,role,department
john@example.com,John,Doe,member,Operations
jane@example.com,Jane,Smith,admin,Management
```

### User Roles and Permissions

**Super Admin**
- Full system access
- Manage all users
- System configuration
- Billing management
- Data export/deletion

**Administrator**
- Manage users in organization
- View all projects
- Access all data
- Generate reports
- Configure workflows

**Project Manager**
- Create and manage projects
- Assign tasks
- View team member data
- Budget management
- Client management

**Team Member**
- View assigned projects
- Complete tasks
- Log time
- Upload documents
- Basic reporting

**Client** (External)
- View specific projects
- View documents
- Add comments
- Limited reporting

### Modifying User Accounts

**Change User Role:**
1. Go to Admin → Users
2. Find user
3. Click Edit
4. Select new role
5. Save changes

**Reset User Password:**
1. Go to Admin → Users
2. Find user
3. Click "Reset Password"
4. User receives reset email

**Deactivate User:**
1. Go to Admin → Users
2. Find user
3. Click "Deactivate"
4. Confirm action
5. User is logged out and cannot log in

**Reactivate User:**
1. Go to Admin → Users
2. Filter: Show inactive users
3. Find user
4. Click "Reactivate"

**Delete User:**
⚠️ **Warning:** This permanently deletes user data
1. Go to Admin → Users
2. Find user
3. Click Delete
4. Type confirmation
5. User and personal data deleted (projects may be retained)

### User Activity Monitoring

**View User Activity:**
- Go to Admin → Users → [User] → Activity Log
- See login history
- View actions performed
- Track time logged
- Monitor document access

**Activity Reports:**
- Generate user activity reports
- Export login logs
- Track feature usage
- Monitor productivity metrics

---

## Organization Settings

### General Settings

**Company Information:**
- Organization name
- Legal business name
- Tax ID/EIN
- Address
- Contact information

**Branding:**
- Upload logo (recommended: PNG, 200x200px)
- Primary color
- Secondary color
- Favicon
- Email header/footer

**Localization:**
- Default language
- Timezone
- Date format
- Time format
- Currency
- Number format

### Feature Configuration

**Enable/Disable Features:**
- Time tracking
- Budget management
- Client portal
- Document management
- Templates
- Custom fields
- API access

**Feature Settings:**
- Time tracking: Minimum billing increment
- Documents: Maximum file size
- Projects: Auto-archive after X days of inactivity
- Tasks: Allow dependencies
- Notifications: Frequency limits

### Workflow Automation

**Automated Actions:**
- Auto-assign tasks based on rules
- Send notifications on status changes
- Create recurring tasks
- Auto-archive completed projects
- Generate scheduled reports

**Notification Rules:**
- Configure email templates
- Set notification frequency
- Define notification triggers
- Customize message content

### Integration Settings

**Available Integrations:**
- Email (SMTP configuration)
- Calendar (Google, Outlook)
- Storage (Google Drive, Dropbox)
- Authentication (SSO, OAuth)
- Webhooks

**API Configuration:**
- Enable API access
- Generate API keys
- Set rate limits
- Configure webhooks
- Monitor API usage

---

## Security & Permissions

### Security Best Practices

**Password Policies:**
- Minimum length: 8 characters
- Require uppercase letters
- Require numbers
- Require special characters
- Password expiration (optional)
- Prevent password reuse

**Session Management:**
- Session timeout: 24 hours (configurable)
- Remember me duration: 30 days
- Force re-authentication for sensitive actions
- Single sign-on (SSO) support

**Two-Factor Authentication (2FA):**
- Enable 2FA requirement (optional)
- Supported methods: TOTP apps
- Backup codes for recovery
- Admin can reset 2FA for users

### Access Control

**Project-Level Permissions:**
- Project visibility (public/private)
- Team member access levels
- Document access controls
- Budget visibility settings

**Role-Based Access Control (RBAC):**
- Define custom roles
- Assign granular permissions
- Apply role templates
- Audit permission changes

**IP Whitelisting:**
- Restrict access to specific IPs
- Configure IP ranges
- Set exceptions for mobile users
- Monitor blocked access attempts

### Security Monitoring

**Audit Logs:**
- Track all user actions
- Monitor login attempts
- Log permission changes
- Track data exports
- Record deletions

**Security Alerts:**
- Failed login attempts
- Suspicious activity
- Permission changes
- Data exports
- API usage anomalies

---

## Data Management

### Data Organization

**Database Structure:**
- Users table
- Projects table
- Tasks table
- Documents table (metadata)
- Time logs table
- Clients table
- Activity logs table

**Data Retention:**
- Active projects: Unlimited
- Completed projects: 7 years (configurable)
- User activity logs: 2 years
- System logs: 90 days
- Deleted items: 30-day grace period

### Data Export

**Export Options:**
- **CSV**: Tables and lists
- **PDF**: Reports and documents
- **JSON**: API data export
- **ZIP**: Bulk document download

**Export Procedures:**
1. Go to Admin → Data Management → Export
2. Select data type (projects, tasks, time logs, etc.)
3. Set date range and filters
4. Choose export format
5. Generate and download export file

**Scheduled Exports:**
- Configure automatic exports
- Set frequency (daily, weekly, monthly)
- Choose destination (email, FTP, cloud storage)
- Verify export success

### Data Import

**Import Procedures:**
1. Prepare data in correct format
2. Validate data structure
3. Go to Admin → Data Management → Import
4. Upload file
5. Map fields
6. Preview import
7. Confirm and execute

**Supported Import Formats:**
- CSV for users, projects, tasks, clients
- ZIP for bulk documents
- JSON for API imports

---

## Backup & Recovery

### Backup Strategy

**Automated Backups:**
Supabase provides automated backups:
- Daily snapshots
- Point-in-time recovery (PITR)
- Retention: 7 days (free tier) or 30 days (pro)

**Manual Backups:**
1. Go to Supabase Dashboard
2. Database → Backups
3. Create manual snapshot
4. Name and describe backup
5. Download backup file (optional)

**What to Backup:**
- [ ] Database (all tables)
- [ ] User uploaded documents
- [ ] System configuration
- [ ] Custom templates
- [ ] Email templates
- [ ] Integration settings

### Backup Schedule

**Recommended Schedule:**
- **Full Backup**: Weekly
- **Incremental**: Daily
- **Configuration**: After any changes
- **Documents**: Real-time (cloud storage)

### Recovery Procedures

**Database Recovery:**
1. Go to Supabase Dashboard
2. Database → Backups
3. Select backup point
4. Click "Restore"
5. Confirm restoration
6. Verify data integrity

**Document Recovery:**
- Documents stored in Supabase Storage
- Use Supabase backup/restore
- Or restore from cloud storage backup

**Disaster Recovery:**
1. Verify backup integrity
2. Provision new infrastructure if needed
3. Restore database from backup
4. Restore documents from storage backup
5. Update DNS/configuration
6. Test system functionality
7. Notify users

---

## System Monitoring

### Performance Monitoring

**Key Metrics:**
- Page load times
- API response times
- Database query performance
- Storage usage
- Active users
- Concurrent sessions

**Monitoring Tools:**
- Supabase Dashboard (database metrics)
- Browser DevTools (client-side performance)
- Application logs
- Error tracking (Sentry, if configured)

**Performance Optimization:**
- Monitor slow queries
- Optimize database indexes
- Review RLS policies
- Cache frequently accessed data
- Optimize image sizes
- Enable CDN for static assets

### System Health Checks

**Daily Checks:**
- [ ] User login functionality
- [ ] Database connectivity
- [ ] Email delivery
- [ ] File upload/download
- [ ] API availability

**Weekly Checks:**
- [ ] Review error logs
- [ ] Check disk space
- [ ] Review backup success
- [ ] Monitor user growth
- [ ] Check integration status

**Monthly Checks:**
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning
- [ ] Update dependencies
- [ ] Review user feedback

### Logging

**Application Logs:**
- Error logs: Critical issues
- Access logs: User activity
- Security logs: Authentication events
- API logs: Integration activity

**Log Management:**
- Centralize logs
- Set retention policies
- Configure log rotation
- Set up alerts for errors
- Regular log review

---

## Troubleshooting

### Common Administrator Issues

**Issue: Users Can't Log In**
Possible causes:
- Incorrect credentials
- Account deactivated
- Email not verified
- Session expired
- Database connection issue

Solutions:
1. Verify account status
2. Reset user password
3. Resend verification email
4. Check database connectivity
5. Review error logs

**Issue: Slow System Performance**
Possible causes:
- High concurrent users
- Slow database queries
- Large file uploads
- Network issues
- Insufficient resources

Solutions:
1. Monitor active users
2. Review slow query logs
3. Optimize database indexes
4. Check network bandwidth
5. Scale resources if needed

**Issue: Documents Not Uploading**
Possible causes:
- Storage quota exceeded
- File too large
- Network timeout
- Permission issues
- Storage bucket misconfigured

Solutions:
1. Check storage usage
2. Verify file size limits
3. Test with smaller file
4. Check Supabase Storage settings
5. Review storage permissions

### Debugging Tools

**Browser Console:**
- Press F12 to open DevTools
- Check Console tab for JavaScript errors
- Review Network tab for failed requests
- Examine Application tab for storage issues

**Database Queries:**
- Use Supabase SQL Editor
- Review query performance
- Check RLS policy blocks
- Monitor real-time queries

**Log Analysis:**
- Review application logs
- Check Supabase logs
- Monitor API logs
- Track error patterns

---

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- [ ] Monitor system health
- [ ] Review error logs
- [ ] Check backup success
- [ ] Monitor storage usage
- [ ] Respond to support tickets

**Weekly:**
- [ ] Review user activity
- [ ] Check system performance
- [ ] Update documentation
- [ ] Test critical workflows
- [ ] Review security logs

**Monthly:**
- [ ] Update dependencies
- [ ] Security patch review
- [ ] Capacity planning
- [ ] User account audit
- [ ] Performance optimization

**Quarterly:**
- [ ] Comprehensive security audit
- [ ] Disaster recovery test
- [ ] User training refresh
- [ ] Feature usage analysis
- [ ] Strategic planning

### System Updates

**Update Procedure:**
1. **Review Release Notes**
   - Read changelog
   - Check breaking changes
   - Review new features
   - Note deprecated features

2. **Backup Before Update**
   - Full database backup
   - Configuration backup
   - Document backup

3. **Test in Staging**
   - Deploy to staging environment
   - Run test suite
   - Verify critical workflows
   - Check integration compatibility

4. **Schedule Maintenance Window**
   - Notify users in advance
   - Choose low-traffic time
   - Estimate downtime
   - Prepare rollback plan

5. **Deploy Update**
   - Put system in maintenance mode
   - Deploy new version
   - Run migrations
   - Test functionality
   - Resume normal operation

6. **Post-Update Verification**
   - Test critical features
   - Monitor error logs
   - Check user reports
   - Verify integrations

### Database Maintenance

**Optimization Tasks:**
```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim storage
VACUUM;

-- Check for slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Review table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Index Maintenance:**
- Review missing indexes
- Remove unused indexes
- Rebuild fragmented indexes
- Monitor index usage

---

## Support & Training

### User Support

**Support Tiers:**
- **Tier 1**: Basic how-to questions → User documentation
- **Tier 2**: Technical issues → Administrator assistance
- **Tier 3**: System issues → Developer support

**Support Channels:**
- In-app help center
- Email support
- Admin portal
- Documentation
- Video tutorials

### User Training

**Onboarding New Users:**
1. Send welcome email with credentials
2. Schedule orientation session
3. Provide getting started guide
4. Assign mentor/buddy
5. Follow up after one week

**Training Materials:**
- User Guide
- Video tutorials
- Quick reference cards
- Feature walkthroughs
- Best practices guide

**Training Schedule:**
- New user orientation: First week
- Advanced features: After 1 month
- Admin training: As needed
- Refresher training: Quarterly

---

## Compliance & Auditing

### Compliance Requirements

**Data Protection:**
- GDPR compliance (if applicable)
- Data encryption
- Access controls
- Audit trails
- Data retention policies

**Industry Standards:**
- SOC 2 (if applicable)
- ISO 27001 (if applicable)
- NIST guidelines
- Industry-specific regulations

### Audit Procedures

**User Access Audit:**
1. Review user accounts
2. Verify role assignments
3. Check inactive accounts
4. Review permission changes
5. Document findings

**Data Audit:**
1. Verify backup integrity
2. Check data retention compliance
3. Review data exports
4. Audit deletion logs
5. Document findings

**Security Audit:**
1. Review access logs
2. Check failed login attempts
3. Verify 2FA adoption
4. Review permission changes
5. Document findings

---

## Additional Resources

- [User Management Guide](./USER_MANAGEMENT.md)
- [Backup & Restore Guide](./BACKUP_RESTORE_GUIDE.md)
- [User Guide](./USER_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

## Support

**Administrator Support:**
- Email: admin-support@example.com
- Documentation: Check this guide and related docs
- Community: Admin forum (if available)
- Emergency: 24/7 support hotline (if available)

---

**Last Updated:** October 31, 2025
