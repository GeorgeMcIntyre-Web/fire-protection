# Fire Protection PM - User Management Guide

Comprehensive guide for managing users in Fire Protection PM.

---

## 📋 Table of Contents

1. [User Management Overview](#user-management-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Creating User Accounts](#creating-user-accounts)
4. [Managing Existing Users](#managing-existing-users)
5. [User Groups & Teams](#user-groups--teams)
6. [Access Control](#access-control)
7. [User Activity & Monitoring](#user-activity--monitoring)
8. [Troubleshooting User Issues](#troubleshooting-user-issues)

---

## User Management Overview

### Why User Management Matters

Effective user management ensures:
- ✅ Right people have right access
- ✅ Data security and privacy
- ✅ Audit trail and accountability
- ✅ Efficient collaboration
- ✅ Cost control (if per-user pricing)

### User Lifecycle

```
Invitation → Registration → Onboarding → Active Use → 
→ Offboarding → Deactivation → (Optional) Deletion
```

---

## User Roles & Permissions

### Available Roles

#### 1. Super Administrator
**Full System Control**

**Permissions:**
- ✅ Manage all users
- ✅ System configuration
- ✅ Billing and subscriptions
- ✅ View all projects and data
- ✅ Export/delete any data
- ✅ Access audit logs
- ✅ Configure integrations

**Use Cases:**
- IT administrators
- System owners
- Primary system manager

**Best Practices:**
- Limit to 1-2 users
- Use strong passwords + 2FA
- Regularly review access logs
- Don't use for day-to-day work

#### 2. Administrator
**Organization Management**

**Permissions:**
- ✅ Manage users in organization
- ✅ View all projects
- ✅ Access all data within org
- ✅ Generate reports
- ✅ Configure workflows
- ✅ Manage clients
- ❌ System-level configuration
- ❌ Billing management

**Use Cases:**
- Department managers
- Office administrators
- Senior project managers

**Best Practices:**
- Assign to trusted staff
- Review permissions quarterly
- Enable 2FA
- Monitor admin actions

#### 3. Project Manager
**Project Leadership**

**Permissions:**
- ✅ Create and manage own projects
- ✅ Assign tasks to team
- ✅ View team member time logs
- ✅ Manage project budgets
- ✅ Upload/organize documents
- ✅ Manage clients
- ✅ Generate project reports
- ❌ View other PMs' projects (unless shared)
- ❌ Manage users
- ❌ System configuration

**Use Cases:**
- Project managers
- Team leads
- Department supervisors

**Best Practices:**
- Assign based on project ownership
- Regular training on PM features
- Review budget access
- Monitor project creation

#### 4. Team Member
**Standard User**

**Permissions:**
- ✅ View assigned projects
- ✅ Complete assigned tasks
- ✅ Log time for own work
- ✅ Upload documents
- ✅ Comment on tasks/projects
- ✅ View own reports
- ❌ Create projects
- ❌ Assign tasks to others
- ❌ View budget details
- ❌ Manage users

**Use Cases:**
- Field technicians
- Engineers
- Support staff
- Contractors

**Best Practices:**
- Default role for most users
- Train on time tracking
- Encourage documentation
- Regular check-ins

#### 5. Client (External User)
**Limited External Access**

**Permissions:**
- ✅ View specific projects
- ✅ View shared documents
- ✅ Add comments
- ✅ View project status
- ✅ Download documents
- ❌ Edit projects
- ❌ View budgets
- ❌ View time logs
- ❌ Access other clients' data

**Use Cases:**
- External clients
- Partners
- Consultants
- Auditors (read-only)

**Best Practices:**
- Only grant when necessary
- Use expiring access
- Regular access review
- Monitor activity

### Permission Matrix

| Feature | Super Admin | Admin | PM | Member | Client |
|---------|-------------|-------|----|---------
|---------|
| **User Management** |||||
| Create users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete users | ✅ | ✅ | ❌ | ❌ | ❌ |
| View all users | ✅ | ✅ | 👁️ | ❌ | ❌ |
| **Projects** |||||
| Create projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit own projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit all projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| View all projects | ✅ | ✅ | 👁️ | 👁️ | ❌ |
| **Tasks** |||||
| Create tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Complete tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Documents** |||||
| Upload documents | ✅ | ✅ | ✅ | ✅ | ❌ |
| Download documents | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete documents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Share externally | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Time Tracking** |||||
| Log own time | ✅ | ✅ | ✅ | ✅ | ❌ |
| View own time | ✅ | ✅ | ✅ | ✅ | ❌ |
| View team time | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit others' time | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Budget** |||||
| Set budgets | ✅ | ✅ | ✅ | ❌ | ❌ |
| View budgets | ✅ | ✅ | ✅ | ❌ | ❌ |
| Log expenses | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Reports** |||||
| View own reports | ✅ | ✅ | ✅ | ✅ | 👁️ |
| View team reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| View all reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| **System** |||||
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Org settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Billing | ✅ | ❌ | ❌ | ❌ | ❌ |

✅ = Full access | 👁️ = Limited/view only | ❌ = No access

---

## Creating User Accounts

### Method 1: Individual User Invitation

**Step-by-Step:**

1. **Navigate to User Management**
   - Click Admin → Users
   - Click "Invite User" button

2. **Enter User Information**
   ```
   Email: user@example.com
   First Name: John
   Last Name: Doe
   Role: Team Member
   Department: Operations (optional)
   Phone: (optional)
   ```

3. **Set Role and Permissions**
   - Select appropriate role
   - Configure any custom permissions
   - Set project assignments (optional)

4. **Send Invitation**
   - Click "Send Invitation"
   - User receives email with setup link
   - Link expires in 7 days

5. **User Completes Registration**
   - User clicks link in email
   - Sets password
   - Completes profile
   - Automatic login

**Email Template Preview:**
```
Subject: Welcome to Fire Protection PM

Hi John,

You've been invited to join Fire Protection PM as a Team Member.

Click here to set up your account: [Setup Link]

This link expires in 7 days.

Questions? Contact your administrator.
```

### Method 2: Bulk User Import

**When to Use:**
- Onboarding multiple users
- Migrating from another system
- Annual user updates
- Department-wide rollout

**Preparation:**

1. **Download CSV Template**
   - Go to Admin → Users → Import
   - Click "Download Template"

2. **Prepare User Data**
   ```csv
   email,first_name,last_name,role,department,phone
   john@example.com,John,Doe,member,Operations,555-0100
   jane@example.com,Jane,Smith,project_manager,Engineering,555-0101
   bob@example.com,Bob,Johnson,member,Field,555-0102
   ```

**Import Process:**

1. **Upload CSV File**
   - Click "Upload CSV"
   - Select prepared file
   - System validates format

2. **Review Import Preview**
   - Check for errors
   - Review user list
   - Verify role assignments

3. **Configure Import Options**
   - [ ] Send welcome emails
   - [ ] Require email verification
   - [ ] Auto-assign to default projects
   - [ ] Generate random passwords

4. **Execute Import**
   - Click "Import Users"
   - Progress bar shows status
   - Review import summary

5. **Post-Import Actions**
   - Users receive welcome emails
   - Admins receive summary report
   - Review any failed imports

**CSV Field Definitions:**

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| email | Yes | Valid email | john@example.com |
| first_name | Yes | Text | John |
| last_name | Yes | Text | Doe |
| role | Yes | admin, project_manager, member, client | member |
| department | No | Text | Operations |
| phone | No | Phone number | 555-0100 |

### Method 3: Self-Registration (Optional)

**Configuration:**
- Go to Admin → Settings → Registration
- Enable "Allow Self-Registration"
- Set default role for new users
- Optionally require admin approval

**Process:**
1. Users visit registration page
2. Enter email and create password
3. Admin receives notification
4. Admin approves/denies request
5. User gains access

**Best Practices:**
- Only enable for open organizations
- Require admin approval
- Set strict email domain requirements
- Monitor new registrations daily

---

## Managing Existing Users

### Viewing User Information

**User List View:**
- Go to Admin → Users
- See all users at a glance
- Sort by name, role, last active, etc.
- Filter by role, department, status

**User Detail View:**
- Click on any user
- View complete profile
- See assigned projects
- Review activity history
- Check time logs

### Editing User Accounts

**Update User Profile:**
1. Go to Admin → Users
2. Click user to edit
3. Click "Edit Profile"
4. Update fields:
   - Name
   - Email (requires re-verification)
   - Phone
   - Department
   - Job title
5. Save changes

**Change User Role:**
1. Open user profile
2. Click "Change Role"
3. Select new role
4. Add reason for change (audit)
5. Confirm change
6. User receives notification

**Modify Permissions:**
1. Open user profile
2. Go to "Permissions" tab
3. Check/uncheck permissions
4. Save changes

### Password Management

**Reset User Password (Admin):**
1. Open user profile
2. Click "Reset Password"
3. Choose method:
   - Send reset email to user
   - Generate temporary password
4. Confirm action
5. User receives email/credentials

**Force Password Change:**
1. Open user profile
2. Enable "Require password change on next login"
3. User must change password at next login

**Password Policy Enforcement:**
- Minimum 8 characters
- Require uppercase, lowercase, number
- Optional: Require special character
- Optional: Password expiration
- Prevent password reuse

### User Status Management

**Deactivate User:**
When to use:
- Employee on leave
- Temporary contractors
- Suspended accounts

Process:
1. Open user profile
2. Click "Deactivate Account"
3. Enter reason
4. Confirm action
5. User is immediately logged out
6. Cannot log in until reactivated
7. Data is preserved

**Reactivate User:**
1. Filter users: Show "Inactive"
2. Click user to reactivate
3. Click "Reactivate Account"
4. User can log in again

**Delete User Account:**
⚠️ **Warning: This is permanent!**

When to use:
- Former employees (after retention period)
- Duplicate accounts
- GDPR/privacy requests

Process:
1. Open user profile
2. Click "Delete Account"
3. Review warning:
   - Personal data will be deleted
   - Work products may be retained
   - Action is irreversible
4. Type DELETE to confirm
5. Click "Permanently Delete"
6. User data removed per privacy policy

**What Gets Deleted:**
- User profile
- Login credentials
- Personal settings
- Private notes

**What Gets Retained:**
- Projects created (reassigned to admin)
- Tasks completed
- Time logs (anonymized)
- Documents uploaded
- Comments (marked as "Deleted User")

---

## User Groups & Teams

### Creating Teams

**Purpose:**
- Organize users by department
- Control project access
- Streamline reporting
- Facilitate collaboration

**Create Team:**
1. Go to Admin → Teams
2. Click "Create Team"
3. Enter details:
   - Team name: "Engineering"
   - Description: "Engineering department"
   - Team lead: Select user
   - Default permissions
4. Add team members
5. Save team

**Team Management:**
- Add/remove members
- Assign team to projects
- Set team permissions
- View team reports

### Department Structure

**Configure Departments:**
1. Admin → Settings → Departments
2. Add departments:
   - Operations
   - Engineering
   - Field Services
   - Administration
3. Assign users to departments
4. Use for filtering and reporting

---

## Access Control

### Project-Level Access

**Assign Users to Projects:**
1. Open project
2. Go to "Team" tab
3. Click "Add Team Member"
4. Select user
5. Set role on project:
   - Owner (full control)
   - Editor (can modify)
   - Viewer (read-only)
6. Save

**Remove User from Project:**
1. Open project team
2. Find user
3. Click "Remove"
4. Confirm action

### Document Access Control

**Set Document Permissions:**
1. Open document
2. Click "Share"
3. Choose visibility:
   - Private (creator only)
   - Project team
   - Organization
   - Public link
4. Set permissions:
   - Can view
   - Can download
   - Can edit
5. Optional: Set expiration date
6. Save permissions

### IP Restrictions

**Configure IP Whitelist:**
1. Admin → Security → IP Restrictions
2. Enable IP whitelisting
3. Add allowed IP ranges:
   ```
   192.168.1.0/24 (Office network)
   203.0.113.0/24 (Remote office)
   ```
4. Set exceptions for admins
5. Save configuration

**Testing:**
- Access from allowed IP: ✅ Success
- Access from other IP: ❌ Blocked

---

## User Activity & Monitoring

### Activity Logs

**View User Activity:**
1. Admin → Users → [User] → Activity
2. See comprehensive log:
   - Login/logout times
   - Projects accessed
   - Documents viewed/modified
   - Tasks completed
   - Time logged
   - Settings changed

**Filter Activity:**
- By date range
- By action type
- By project
- By result (success/failure)

**Export Activity:**
- CSV export for audit
- Include in compliance reports
- Track productivity

### Login History

**Monitor Login Activity:**
1. Admin → Security → Login History
2. View all login attempts:
   - Successful logins
   - Failed attempts
   - IP addresses
   - Browser/device info
   - Location (if available)

**Security Alerts:**
- Multiple failed attempts
- Login from new location
- Login from suspicious IP
- Concurrent sessions

### Usage Reports

**Generate Usage Reports:**
1. Admin → Reports → User Activity
2. Select parameters:
   - Date range
   - User/team
   - Activity type
3. Generate report
4. Export to PDF/CSV

**Metrics:**
- Active users count
- Projects per user
- Tasks completed
- Hours logged
- Documents uploaded
- Login frequency

---

## Troubleshooting User Issues

### Common Issues

**User Can't Log In:**

Checklist:
1. ✅ Verify account is active
2. ✅ Check email/password correct
3. ✅ Confirm email verified
4. ✅ Check account not locked
5. ✅ Verify system is accessible
6. ✅ Check IP restrictions

Solutions:
- Reset password
- Resend verification email
- Unlock account
- Check system status

**User Can't See Project:**

Possible causes:
- Not added to project team
- Insufficient permissions
- Project archived/deleted
- Filter hiding project

Solutions:
- Add user to project
- Adjust permissions
- Check project status
- Clear filters

**User Can't Upload Documents:**

Possible causes:
- Permission denied
- File too large
- Storage quota exceeded
- Unsupported file type

Solutions:
- Grant upload permission
- Reduce file size
- Increase storage quota
- Convert file format

**Time Tracking Not Working:**

Possible causes:
- Permission denied
- Timer already running
- Browser issue
- Network problem

Solutions:
- Grant time tracking permission
- Stop existing timer
- Try different browser
- Check network connection

### Support Procedures

**Level 1: User Self-Service**
- Check FAQ
- Review user guide
- Try basic troubleshooting
- Ask team members

**Level 2: Administrator Support**
- User contacts admin
- Admin reviews issue
- Admin makes adjustments
- Admin provides guidance

**Level 3: Technical Support**
- Complex technical issues
- System-level problems
- Database issues
- Security concerns

---

## Best Practices

### User Onboarding

1. **Before First Login:**
   - Send welcome email
   - Provide login instructions
   - Share getting started guide
   - Assign mentor if needed

2. **First Day:**
   - Schedule orientation
   - Walk through key features
   - Assign first task
   - Check for questions

3. **First Week:**
   - Check progress
   - Answer questions
   - Provide feedback
   - Gather feedback

4. **First Month:**
   - Review usage
   - Advanced training
   - Gather suggestions
   - Adjust permissions if needed

### User Offboarding

1. **Notification:**
   - Manager notifies admin
   - Set offboarding date
   - Plan data transition

2. **Access Review:**
   - List active projects
   - Identify critical data
   - Plan reassignments

3. **Data Transition:**
   - Reassign projects
   - Transfer document ownership
   - Archive important work
   - Export user data if needed

4. **Account Deactivation:**
   - Deactivate on last day
   - Revoke all access
   - Archive account data
   - Document in audit log

5. **Final Steps:**
   - Schedule account deletion (30-90 days)
   - Remove from distribution lists
   - Update documentation

### Security Best Practices

1. **Regular Audits:**
   - Review user accounts quarterly
   - Remove inactive accounts
   - Verify role assignments
   - Check permission appropriateness

2. **Principle of Least Privilege:**
   - Grant minimum necessary access
   - Review permissions regularly
   - Remove access when no longer needed
   - Document exceptions

3. **Strong Authentication:**
   - Enforce strong passwords
   - Enable 2FA for admins
   - Monitor login attempts
   - Lock accounts after failures

4. **Activity Monitoring:**
   - Review activity logs weekly
   - Investigate anomalies
   - Track sensitive actions
   - Document findings

---

## Compliance & Auditing

### User Access Audit

**Quarterly Audit Checklist:**
- [ ] Review all active accounts
- [ ] Verify role appropriateness
- [ ] Check inactive accounts (>90 days)
- [ ] Review admin accounts
- [ ] Verify project assignments
- [ ] Check external user access
- [ ] Document findings
- [ ] Take corrective actions
- [ ] Update policies if needed

### GDPR Compliance

**User Rights:**
- Right to access data
- Right to correct data
- Right to delete data
- Right to data portability
- Right to restrict processing

**Admin Responsibilities:**
- Respond to data requests within 30 days
- Provide data export
- Delete data when requested
- Maintain audit trail
- Document data processing

---

## Additional Resources

- [Admin Guide](./ADMIN_GUIDE.md)
- [Backup & Restore Guide](./BACKUP_RESTORE_GUIDE.md)
- [Security Best Practices](./ADMIN_GUIDE.md#security--permissions)

---

**Last Updated:** October 31, 2025
