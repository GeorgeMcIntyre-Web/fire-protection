# Row Level Security (RLS) Policies Documentation

Complete documentation of database security policies for the Fire Protection Tracker application.

## Table of Contents

- [Overview](#overview)
- [Role Hierarchy](#role-hierarchy)
- [Policy Structure](#policy-structure)
- [Table Policies](#table-policies)
- [Helper Functions](#helper-functions)
- [Testing RLS Policies](#testing-rls-policies)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting](#troubleshooting)

## Overview

Row Level Security (RLS) provides fine-grained access control at the database level. Every query is automatically filtered based on the user's role and the defined policies.

### Why RLS?

- **Defense in Depth**: Security at the database layer, independent of application code
- **Automatic Enforcement**: No way to bypass policies through API calls
- **Audit Trail**: All access is logged and traceable
- **Role-Based**: Policies adapt based on user roles

### Security Model

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│  (React + TypeScript + Validation)      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│          Supabase Client                │
│       (Authentication Layer)            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      Row Level Security (RLS)           │
│    (Database Security Layer)            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│          (Data Storage)                 │
└─────────────────────────────────────────┘
```

## Role Hierarchy

### Role Levels

```
Level 4: ADMIN
   │
   ├─> Full system access
   ├─> User management
   ├─> Settings configuration
   └─> All permissions
   
Level 3: MANAGER
   │
   ├─> Project management
   ├─> Client management  
   ├─> Team oversight
   └─> Reporting
   
Level 2: TECHNICIAN
   │
   ├─> View assigned work
   ├─> Log time
   ├─> Update tasks
   └─> Submit documentation
   
Level 1: READONLY
   │
   ├─> View all data
   └─> Generate reports
```

### Role Inheritance

Higher roles inherit capabilities from lower roles:
- **Admin** has all Manager, Technician, and Read-Only capabilities
- **Manager** has all Read-Only capabilities plus management features
- **Technician** can view relevant data and update assigned work
- **Read-Only** can only view data

## Policy Structure

### Policy Naming Convention

```
[Role]_can_[action]_[resource]_[condition]
```

Examples:
- `Admins can view all profiles`
- `Technicians can view assigned tasks`
- `Users can update own profile`

### Policy Types

1. **SELECT Policies**: Control what data users can read
2. **INSERT Policies**: Control what data users can create
3. **UPDATE Policies**: Control what data users can modify
4. **DELETE Policies**: Control what data users can remove

## Table Policies

### Profiles Table

#### View Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins and managers can view all profiles
CREATE POLICY "Admins and managers can view all profiles"
  ON profiles FOR SELECT
  USING (is_manager_or_higher(auth.uid()));
```

#### Update Policies

```sql
-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Only admins can change roles
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));
```

**Security Notes:**
- Users cannot change their own role
- Role changes require admin privileges
- Profile updates are audited

### Projects Table

#### View Policies

```sql
-- Admins and managers can view all projects
CREATE POLICY "Admins and managers can view all projects"
  ON projects FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can only view projects they're assigned to
CREATE POLICY "Technicians can view assigned projects"
  ON projects FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND is_assigned_to_project(auth.uid(), id)
  );

-- Read-only users can view all projects
CREATE POLICY "Readonly users can view all projects"
  ON projects FOR SELECT
  USING (get_user_role(auth.uid()) = 'readonly');
```

#### Modify Policies

```sql
-- Only admins and managers can insert projects
CREATE POLICY "Admins and managers can insert projects"
  ON projects FOR INSERT
  WITH CHECK (
    is_manager_or_higher(auth.uid())
    AND auth.uid() = created_by
  );

-- Only admins and managers can update projects
CREATE POLICY "Admins and managers can update projects"
  ON projects FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_admin(auth.uid()));
```

**Security Notes:**
- Technicians only see projects they're assigned to via tasks
- Project deletion requires admin privileges
- Created_by is automatically set and cannot be changed

### Tasks Table

#### View Policies

```sql
-- Admins and managers can view all tasks
CREATE POLICY "Admins and managers can view all tasks"
  ON tasks FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can view tasks assigned to them
CREATE POLICY "Technicians can view assigned tasks"
  ON tasks FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND assigned_to = auth.uid()
  );
```

#### Modify Policies

```sql
-- Admins and managers can update any task
CREATE POLICY "Admins and managers can update tasks"
  ON tasks FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can update tasks assigned to them
CREATE POLICY "Technicians can update assigned tasks"
  ON tasks FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND assigned_to = auth.uid()
  );
```

**Security Notes:**
- Technicians can only update status and progress of assigned tasks
- Task reassignment requires manager privileges
- Task deletion requires admin privileges

### Time Logs Table

#### View Policies

```sql
-- Admins and managers can view all time logs
CREATE POLICY "Admins and managers can view all time logs"
  ON time_logs FOR SELECT
  USING (is_manager_or_higher(auth.uid()));

-- Technicians can view their own time logs
CREATE POLICY "Technicians can view own time logs"
  ON time_logs FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'technician'
    AND user_id = auth.uid()
  );
```

#### Modify Policies

```sql
-- Users can insert their own time logs
CREATE POLICY "Users can insert own time logs"
  ON time_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own time logs
CREATE POLICY "Users can update own time logs"
  ON time_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins and managers can update any time log
CREATE POLICY "Admins and managers can update any time log"
  ON time_logs FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));
```

**Security Notes:**
- Users can only log time for themselves
- Managers can correct time entries
- Time log deletion requires admin privileges

### Clients Table

#### View Policies

```sql
-- All authenticated users can view clients
CREATE POLICY "All users can view clients"
  ON clients FOR SELECT
  USING (true);
```

#### Modify Policies

```sql
-- Only admins and managers can modify clients
CREATE POLICY "Admins and managers can insert clients"
  ON clients FOR INSERT
  WITH CHECK (is_manager_or_higher(auth.uid()));

CREATE POLICY "Admins and managers can update clients"
  ON clients FOR UPDATE
  USING (is_manager_or_higher(auth.uid()));

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (is_admin(auth.uid()));
```

**Security Notes:**
- All users can view clients for context
- Only managers can create/update clients
- Client deletion is admin-only

### Document Library

#### View Policies

```sql
-- Everyone can view documents
CREATE POLICY "All users can view documents"
  ON document_library FOR SELECT
  USING (true);
```

#### Modify Policies

```sql
-- Admins and managers can manage documents
CREATE POLICY "Admins and managers can insert documents"
  ON document_library FOR INSERT
  WITH CHECK (is_manager_or_higher(auth.uid()));

CREATE POLICY "Admins can delete documents"
  ON document_library FOR DELETE
  USING (is_admin(auth.uid()));
```

### Storage Policies

#### Work Photos Bucket

```sql
-- Upload: Authenticated users
CREATE POLICY "Authenticated users can upload work photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'work-photos'
    AND auth.role() = 'authenticated'
  );

-- View: Everyone
CREATE POLICY "Users can view work photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'work-photos');

-- Delete: Owner or admin
CREATE POLICY "Users can delete own work photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'work-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin(auth.uid())
    )
  );
```

#### Company Documents Bucket

```sql
-- Upload: Managers only
CREATE POLICY "Admins and managers can upload company documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-documents'
    AND is_manager_or_higher(auth.uid())
  );

-- Delete: Admins only
CREATE POLICY "Admins can delete company documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-documents'
    AND is_admin(auth.uid())
  );
```

## Helper Functions

### get_user_role(user_id UUID)

Returns the role of a given user.

```sql
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### is_admin(user_id UUID)

Checks if a user is an admin.

```sql
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### is_manager_or_higher(user_id UUID)

Checks if a user is a manager or admin.

```sql
CREATE OR REPLACE FUNCTION is_manager_or_higher(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### is_assigned_to_project(user_id UUID, project_id UUID)

Checks if a user is assigned to a project via tasks.

```sql
CREATE OR REPLACE FUNCTION is_assigned_to_project(user_id UUID, proj_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tasks 
    WHERE project_id = proj_id AND assigned_to = user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

## Testing RLS Policies

### Setting Up Test Users

```sql
-- Create test users for each role
INSERT INTO profiles (id, email, role) VALUES
  ('admin-uuid', 'admin@test.com', 'admin'),
  ('manager-uuid', 'manager@test.com', 'manager'),
  ('tech-uuid', 'tech@test.com', 'technician'),
  ('readonly-uuid', 'readonly@test.com', 'readonly');
```

### Testing as Different Users

```sql
-- Set current user context
SET LOCAL jwt.claims.sub = 'tech-uuid';

-- Test queries
SELECT * FROM projects; -- Should only see assigned projects
SELECT * FROM tasks;    -- Should only see assigned tasks
SELECT * FROM time_logs; -- Should only see own time logs
```

### Test Scenarios

#### Scenario 1: Technician Access

```sql
-- As technician
SET LOCAL jwt.claims.sub = 'tech-uuid';

-- Should succeed
INSERT INTO time_logs (user_id, start_time, description)
VALUES ('tech-uuid', NOW(), 'Working on task');

-- Should fail
DELETE FROM projects WHERE id = 'some-project-id';
```

#### Scenario 2: Manager Access

```sql
-- As manager
SET LOCAL jwt.claims.sub = 'manager-uuid';

-- Should succeed
INSERT INTO projects (name, created_by)
VALUES ('New Project', 'manager-uuid');

UPDATE tasks SET status = 'completed' WHERE id = 'task-id';

-- Should succeed (can view all)
SELECT * FROM time_logs;
```

#### Scenario 3: Admin Access

```sql
-- As admin
SET LOCAL jwt.claims.sub = 'admin-uuid';

-- All operations should succeed
DELETE FROM projects WHERE id = 'old-project-id';
UPDATE profiles SET role = 'manager' WHERE id = 'user-id';
```

## Common Scenarios

### Adding a New Team Member

```sql
-- 1. User registers (creates auth.users entry)
-- 2. Profile is created with default role
INSERT INTO profiles (id, email, role)
VALUES (auth.uid(), 'newuser@test.com', 'technician');

-- 3. Manager assigns tasks
INSERT INTO tasks (name, project_id, assigned_to, created_by)
VALUES ('Install System', 'proj-id', 'newuser-id', auth.uid());

-- 4. User can now:
--    - View assigned project
--    - View and update assigned tasks
--    - Log time on tasks
```

### Project Access Control

```sql
-- Manager creates project
INSERT INTO projects (name, created_by)
VALUES ('Client ABC - Install', auth.uid());

-- Manager assigns tasks to technician
INSERT INTO tasks (name, project_id, assigned_to)
VALUES ('Phase 1', 'proj-id', 'tech-id');

-- Now technician can:
SELECT * FROM projects WHERE id = 'proj-id'; -- ✅ Can view
SELECT * FROM tasks WHERE project_id = 'proj-id'; -- ✅ Can view assigned tasks

-- But cannot:
UPDATE projects SET status = 'completed'; -- ❌ No permission
DELETE FROM projects; -- ❌ No permission
```

### Time Entry Workflow

```sql
-- Technician logs time
INSERT INTO time_logs (user_id, task_id, start_time, end_time)
VALUES (auth.uid(), 'task-id', '2024-10-31 08:00', '2024-10-31 17:00');

-- Manager reviews all time logs
SELECT * FROM time_logs WHERE task_id = 'task-id';

-- Manager can correct if needed
UPDATE time_logs 
SET end_time = '2024-10-31 16:30'
WHERE id = 'log-id';
```

## Troubleshooting

### Policy Not Working

**Check:**
1. Is RLS enabled on the table?
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. Are policies created?
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

3. Is user authenticated?
   ```sql
   SELECT auth.uid(); -- Should return UUID
   ```

4. Is user role correct?
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```

### Common Errors

**"new row violates row-level security policy"**
- INSERT or UPDATE policy conditions not met
- Check WITH CHECK clause
- Verify user has required role

**"permission denied for table"**
- RLS is enabled but no SELECT policy allows access
- Add appropriate SELECT policy

**"could not find function"**
- Helper function not created
- Run enhanced RLS setup script

### Debugging Queries

```sql
-- Check current user
SELECT auth.uid(), auth.role();

-- Check user's role
SELECT role FROM profiles WHERE id = auth.uid();

-- Check policies for a table
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Test if user has admin role
SELECT is_admin(auth.uid());

-- Test if user is assigned to project
SELECT is_assigned_to_project(auth.uid(), 'project-uuid');
```

## Performance Considerations

### Indexing

Ensure indexes exist for policy conditions:

```sql
-- Index on assigned_to for task filtering
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Index on created_by for ownership checks
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- Index on user_id for time logs
CREATE INDEX idx_time_logs_user_id ON time_logs(user_id);
```

### Policy Optimization

- Use STABLE functions for role checks
- Avoid complex joins in policy conditions
- Use EXISTS instead of IN for subqueries
- Test with EXPLAIN ANALYZE

## Audit Logging

All sensitive operations are automatically logged:

```sql
-- View audit logs (admin only)
SELECT * FROM audit_log 
WHERE table_name = 'profiles'
ORDER BY created_at DESC;

-- View recent changes by user
SELECT * FROM audit_log
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

## Maintenance

### Regular Tasks

1. **Review Access Patterns**
   - Analyze slow queries
   - Check for policy violations
   - Review audit logs

2. **Update Policies**
   - Test changes in staging
   - Document policy changes
   - Update this documentation

3. **Security Audits**
   - Quarterly policy review
   - Test each role's access
   - Verify principle of least privilege

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Security Best Practices](./SECURITY.md)

---

**Last Updated**: 2024-10-31
**Version**: 1.0.0
