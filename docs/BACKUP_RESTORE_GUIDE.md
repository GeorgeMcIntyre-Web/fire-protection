# Fire Protection PM - Backup & Restore Guide

Complete guide for data backup and disaster recovery.

---

## 📋 Table of Contents

1. [Backup Overview](#backup-overview)
2. [Backup Strategy](#backup-strategy)
3. [Automated Backups](#automated-backups)
4. [Manual Backups](#manual-backups)
5. [What to Backup](#what-to-backup)
6. [Backup Verification](#backup-verification)
7. [Restore Procedures](#restore-procedures)
8. [Disaster Recovery](#disaster-recovery)
9. [Testing & Validation](#testing--validation)

---

## Backup Overview

### Why Backups Matter

Backups protect against:
- 🔥 **Hardware failure**: Server crashes, disk failures
- 🛠️ **Software issues**: Bugs, corruption, failed updates
- 👤 **Human error**: Accidental deletions, misconfigurations
- 🔒 **Security incidents**: Ransomware, data breaches
- 🌪️ **Natural disasters**: Floods, fires, power outages
- 💻 **Complete system loss**: Catastrophic failures

### Backup Objectives

**Recovery Point Objective (RPO):**
- Maximum acceptable data loss
- Target: 24 hours for this system
- Meaning: Lose at most 1 day of data

**Recovery Time Objective (RTO):**
- Maximum acceptable downtime
- Target: 4 hours for this system
- Meaning: System restored within 4 hours

### Backup Types

**Full Backup:**
- Complete copy of all data
- Longest to create
- Fastest to restore
- Frequency: Weekly

**Incremental Backup:**
- Only changes since last backup
- Fastest to create
- Slower to restore (need all incrementals)
- Frequency: Daily

**Differential Backup:**
- Changes since last full backup
- Moderate creation time
- Moderate restore time
- Frequency: As needed

---

## Backup Strategy

### 3-2-1 Backup Rule

**3** copies of data:
- 1 primary (production database)
- 2 backups

**2** different media types:
- Cloud storage (Supabase)
- External storage (downloaded backups)

**1** off-site copy:
- Cloud-based backups
- Geographic redundancy

### Backup Schedule

#### Daily Backups
**What:** Incremental database backup
**When:** 2:00 AM UTC (off-peak hours)
**Retention:** 7 days
**Method:** Automated via Supabase

#### Weekly Backups
**What:** Full system backup
**When:** Sunday 1:00 AM UTC
**Retention:** 4 weeks
**Method:** Automated + Manual verification

#### Monthly Backups
**What:** Complete system snapshot
**When:** First Sunday of month
**Retention:** 12 months
**Method:** Manual with documentation

#### Yearly Backups
**What:** Annual archive
**When:** December 31st
**Retention:** 7 years (compliance)
**Method:** Manual export and archival

---

## Automated Backups

### Supabase Automated Backups

Supabase provides built-in backup features:

**Free Tier:**
- Daily automated backups
- 7-day retention
- Point-in-time recovery (PITR) for last 7 days

**Pro Tier:**
- Daily automated backups
- 30-day retention
- Point-in-time recovery for last 30 days
- Download backup files

### Accessing Automated Backups

1. **Login to Supabase Dashboard**
   ```
   https://app.supabase.com
   ```

2. **Navigate to Backups**
   - Select your project
   - Click "Database" in sidebar
   - Click "Backups" tab

3. **View Available Backups**
   - See list of automatic backups
   - Timestamps of each backup
   - Backup size
   - Status (Complete/In Progress/Failed)

### Configure Backup Settings

1. **Go to Project Settings**
   - Click Settings → Database
   - Review backup configuration

2. **Enable Point-in-Time Recovery (PITR)**
   - Recommended for production
   - Requires Pro tier or higher
   - Allows restore to any point in time
   - Enable in Database settings

3. **Configure Backup Retention**
   - Set retention period
   - Balance cost vs. needs
   - Consider compliance requirements

---

## Manual Backups

### When to Create Manual Backups

Before:
- Major system updates
- Database schema changes
- Bulk data imports/exports
- Configuration changes
- User testing sessions
- Known high-risk operations

After:
- Successful major milestones
- Quarter/year end
- Significant data entry sessions
- Major project completions

### Database Backup

#### Option 1: Supabase Dashboard

1. **Create Manual Backup**
   ```
   1. Go to Supabase Dashboard
   2. Select project
   3. Database → Backups
   4. Click "Create Backup"
   5. Enter backup name
   6. Add description
   7. Click "Create"
   ```

2. **Download Backup**
   ```
   1. Find backup in list
   2. Click "Download"
   3. Save .sql file locally
   4. Store in secure location
   ```

#### Option 2: Command Line (pg_dump)

```bash
# Export database to SQL file
pg_dump -h your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F p \
  -f backup_$(date +%Y%m%d).sql

# With compression
pg_dump -h your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d).dump
```

**Parameters:**
- `-h`: Hostname
- `-U`: Username
- `-d`: Database name
- `-F p`: Plain text SQL
- `-F c`: Compressed custom format
- `-f`: Output filename

#### Option 3: Specific Tables Only

```bash
# Backup specific tables
pg_dump -h your-project.supabase.co \
  -U postgres \
  -d postgres \
  -t public.projects \
  -t public.tasks \
  -t public.documents \
  -f tables_backup_$(date +%Y%m%d).sql
```

### Document Storage Backup

Documents are stored in Supabase Storage. Backup methods:

#### Option 1: Download via Dashboard

1. Go to Supabase Dashboard
2. Storage → Buckets
3. Select bucket (e.g., "documents")
4. Download all files
5. Store in secure location

#### Option 2: Programmatic Download

```javascript
// Script to download all documents
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_KEY' // Use service key for admin access
)

async function backupDocuments() {
  // List all files
  const { data: files, error } = await supabase
    .storage
    .from('documents')
    .list()

  if (error) {
    console.error('Error listing files:', error)
    return
  }

  // Download each file
  for (const file of files) {
    const { data, error } = await supabase
      .storage
      .from('documents')
      .download(file.name)
    
    if (!error) {
      // Save file locally
      // Implementation depends on your environment
      console.log(`Downloaded: ${file.name}`)
    }
  }
}

backupDocuments()
```

### Configuration Backup

**Save Important Configuration:**

1. **Environment Variables**
   ```bash
   # Copy .env file
   cp .env .env.backup.$(date +%Y%m%d)
   ```

2. **System Settings**
   - Organization settings
   - User roles and permissions
   - Workflow configurations
   - Integration settings
   - Email templates

3. **Custom Templates**
   - Export project templates
   - Export document templates
   - Export task templates

### Complete Backup Checklist

Create a comprehensive backup:

```
☐ Database backup (SQL dump)
☐ Document storage backup
☐ Configuration files (.env)
☐ System settings export
☐ Custom templates export
☐ User list export
☐ Project list export
☐ Integration configurations
☐ SSL certificates (if self-hosted)
☐ Documentation updates
```

---

## What to Backup

### Critical Data (Must Backup)

**Database Tables:**
- ✅ users
- ✅ projects
- ✅ tasks
- ✅ time_logs
- ✅ documents (metadata)
- ✅ clients
- ✅ expenses
- ✅ work_documentation

**Storage:**
- ✅ Uploaded documents
- ✅ User avatars
- ✅ Project attachments

**Configuration:**
- ✅ Environment variables
- ✅ System settings
- ✅ Workflow configurations

### Important Data (Should Backup)

- Templates
- Comments
- Activity logs (recent)
- Notification settings
- Custom fields

### Optional Data (Nice to Have)

- System logs (older than 30 days)
- Temporary files
- Cache data
- Session data

---

## Backup Verification

### Verify Backup Integrity

**After Each Backup:**

1. **Check Backup Completed Successfully**
   ```
   ☐ Backup job finished without errors
   ☐ Backup file created
   ☐ File size reasonable (not 0 bytes)
   ☐ Timestamp correct
   ```

2. **Test Backup File**
   ```bash
   # For SQL backups
   # Check file can be read
   head backup.sql
   tail backup.sql
   
   # Count lines
   wc -l backup.sql
   
   # Check for errors
   grep -i "error" backup.sql
   ```

3. **Verify Data Integrity**
   ```sql
   -- Quick checks after restore to test database
   SELECT COUNT(*) FROM projects;
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM tasks;
   SELECT MAX(created_at) FROM projects;
   ```

4. **Document Backup**
   ```
   Date: 2025-10-31
   Type: Full backup
   Size: 245 MB
   Tables: All
   Documents: 1,234 files
   Status: ✅ Verified
   Location: s3://backups/prod/2025-10-31/
   Tested: ✅ Yes
   Notes: Monthly backup before Q4 close
   ```

### Backup Verification Schedule

**Weekly:**
- Verify backup completed
- Check backup size is reasonable
- Confirm backup file exists

**Monthly:**
- Test backup restoration
- Verify data integrity
- Document test results

**Quarterly:**
- Full disaster recovery test
- Restore to test environment
- Validate all functionality
- Update procedures if needed

---

## Restore Procedures

### Database Restore

#### Option 1: Supabase Dashboard (Point-in-Time)

**When to Use:**
- Recent data loss (within retention period)
- Need to restore to specific time
- Quick recovery needed

**Steps:**
1. Go to Supabase Dashboard
2. Database → Backups
3. Click "Restore"
4. Choose restore point:
   - Specific backup
   - Or specific timestamp (PITR)
5. Confirm restoration
6. Wait for process to complete
7. Verify data restored

⚠️ **Warning:** This will overwrite current database!

#### Option 2: Restore from SQL Backup

**When to Use:**
- Restoring from downloaded backup
- Major disaster recovery
- Migrating to new instance

**Steps:**

1. **Prepare for Restoration**
   ```bash
   # Backup current state first (just in case)
   pg_dump -h your-project.supabase.co -U postgres -d postgres -f current_state.sql
   ```

2. **Restore Database**
   ```bash
   # Plain SQL file
   psql -h your-project.supabase.co \
     -U postgres \
     -d postgres \
     -f backup_20251031.sql
   
   # Custom format dump
   pg_restore -h your-project.supabase.co \
     -U postgres \
     -d postgres \
     -F c \
     backup_20251031.dump
   ```

3. **Verify Restoration**
   ```sql
   -- Check record counts
   SELECT 'projects' as table_name, COUNT(*) as count FROM projects
   UNION ALL
   SELECT 'tasks', COUNT(*) FROM tasks
   UNION ALL
   SELECT 'users', COUNT(*) FROM users;
   
   -- Check recent data
   SELECT * FROM projects ORDER BY created_at DESC LIMIT 10;
   ```

4. **Test Application**
   - Log in to application
   - Verify projects visible
   - Check tasks load
   - Test document access
   - Verify time logs present

#### Option 3: Selective Restore (Specific Tables)

**When to Use:**
- Only specific data needs restoration
- Minimize disruption
- Recent partial data loss

**Steps:**
```bash
# Extract specific table from backup
pg_restore -h your-project.supabase.co \
  -U postgres \
  -d postgres \
  -t projects \
  -F c \
  backup.dump

# Or from SQL file
grep "projects" backup.sql | psql -h your-project.supabase.co -U postgres -d postgres
```

### Document Restore

**Restore All Documents:**

1. **Via Supabase Dashboard**
   - Go to Storage → Buckets
   - Select bucket
   - Upload files from backup
   - Overwrite if prompted

2. **Via Script**
   ```javascript
   const { createClient } = require('@supabase/supabase-js')
   const fs = require('fs')
   const path = require('path')
   
   const supabase = createClient(URL, SERVICE_KEY)
   
   async function restoreDocuments(backupDir) {
     const files = fs.readdirSync(backupDir)
     
     for (const file of files) {
       const filePath = path.join(backupDir, file)
       const fileBuffer = fs.readFileSync(filePath)
       
       const { error } = await supabase
         .storage
         .from('documents')
         .upload(file, fileBuffer, {
           upsert: true
         })
       
       if (error) {
         console.error(`Error uploading ${file}:`, error)
       } else {
         console.log(`Restored: ${file}`)
       }
     }
   }
   
   restoreDocuments('./backup/documents')
   ```

### Configuration Restore

1. **Restore Environment Variables**
   ```bash
   # Copy backup .env file
   cp .env.backup.20251031 .env
   
   # Verify settings
   cat .env
   ```

2. **Restore System Settings**
   - Manually reconfigure in admin panel
   - Or import from settings export
   - Verify all settings correct

3. **Restore Templates**
   - Import template files
   - Reconfigure custom templates
   - Verify templates work correctly

---

## Disaster Recovery

### Disaster Recovery Plan

**Preparation:**
1. Maintain current backups
2. Document restore procedures
3. Identify key personnel
4. Establish communication plan
5. Keep contact information current

**Response:**
1. Assess the situation
2. Notify stakeholders
3. Activate DR team
4. Begin recovery procedures
5. Communicate progress

**Recovery:**
1. Provision new infrastructure if needed
2. Restore database
3. Restore documents
4. Restore configuration
5. Test system functionality
6. Resume operations

**Post-Recovery:**
1. Document what happened
2. Review response effectiveness
3. Update procedures
4. Implement preventive measures
5. Train team on lessons learned

### Disaster Scenarios

#### Scenario 1: Accidental Data Deletion

**Impact:** Low
**Recovery Time:** < 1 hour

**Steps:**
1. Identify what was deleted
2. Find latest backup before deletion
3. Restore specific data
4. Verify restoration
5. Inform affected users

#### Scenario 2: Database Corruption

**Impact:** Medium
**Recovery Time:** 2-4 hours

**Steps:**
1. Take current database offline
2. Assess extent of corruption
3. Restore from last good backup
4. Restore documents if affected
5. Test thoroughly
6. Bring system back online

#### Scenario 3: Complete System Loss

**Impact:** High
**Recovery Time:** 4-8 hours

**Steps:**
1. Provision new Supabase project
2. Configure new environment
3. Restore full database backup
4. Restore all documents
5. Update DNS/configuration
6. Test all functionality
7. Monitor closely for issues

#### Scenario 4: Ransomware Attack

**Impact:** Critical
**Recovery Time:** 8-24 hours

**Steps:**
1. Isolate affected systems
2. Don't pay ransom
3. Assess damage
4. Provision clean infrastructure
5. Restore from pre-infection backup
6. Change all credentials
7. Enhanced security monitoring
8. Notify authorities if required

---

## Testing & Validation

### Backup Testing Schedule

**Monthly Test:**
1. Select random backup
2. Restore to test environment
3. Verify data integrity
4. Test application functionality
5. Document results

**Quarterly DR Test:**
1. Full disaster recovery simulation
2. Restore complete system
3. Test all features
4. Measure recovery time
5. Update procedures
6. Train team

### Test Checklist

```
☐ Select backup to test
☐ Create test environment
☐ Restore database
☐ Restore documents
☐ Restore configuration
☐ Verify user accounts
☐ Check projects load
☐ Test task functionality
☐ Verify document access
☐ Test time tracking
☐ Generate reports
☐ Measure restore time
☐ Document findings
☐ Update procedures if needed
☐ Archive test results
```

### Success Criteria

**Backup Test Passes If:**
- ✅ All data restored successfully
- ✅ No data corruption detected
- ✅ Application functions normally
- ✅ Users can log in
- ✅ All features work
- ✅ Recovery time within RTO
- ✅ Data loss within RPO

---

## Best Practices

### Do's ✅

1. **Automate backups**
   - Don't rely on manual processes
   - Set up automated schedule
   - Monitor backup success

2. **Test backups regularly**
   - Monthly minimum
   - Document test results
   - Fix issues immediately

3. **Keep multiple backup copies**
   - Follow 3-2-1 rule
   - Different locations
   - Different media types

4. **Secure backup storage**
   - Encrypt backups
   - Access controls
   - Separate credentials

5. **Document procedures**
   - Keep documentation current
   - Make it easy to follow
   - Share with team

6. **Monitor backup health**
   - Check completion daily
   - Verify file sizes
   - Alert on failures

### Don'ts ❌

1. **Don't assume backups work**
   - Always test
   - Verify regularly
   - Don't wait for disaster

2. **Don't store backups only locally**
   - Use off-site storage
   - Geographic redundancy
   - Cloud + local

3. **Don't forget about documents**
   - Database is not enough
   - Back up storage buckets
   - Include all attachments

4. **Don't use same credentials**
   - Separate backup accounts
   - Different passwords
   - Limit access

5. **Don't delay taking backups**
   - Before major changes
   - Regular schedule
   - When in doubt, back up

---

## Emergency Contacts

**Primary Administrator:**
- Name: [Your Name]
- Email: admin@example.com
- Phone: +1-555-0100

**Backup Administrator:**
- Name: [Backup Name]
- Email: backup@example.com
- Phone: +1-555-0101

**Supabase Support:**
- Email: support@supabase.com
- Dashboard: app.supabase.com

---

## Additional Resources

- [Admin Guide](./ADMIN_GUIDE.md)
- [User Management Guide](./USER_MANAGEMENT.md)
- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)

---

**Last Updated:** October 31, 2025

**Next Review Date:** January 31, 2026
