/**
 * Security Tests - Role-Based Access Control
 * 
 * Tests for RBAC system to ensure proper authorization.
 */

import {
  UserRole,
  ROLES,
  Permission,
  ROLE_PERMISSIONS,
  setUserContext,
  getUserContext,
  clearUserContext,
  roleHasPermission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isManagerOrHigher,
  isOwner,
  canAccessResource,
  canPerformAction,
} from '../../lib/rbac';

describe('Role Definitions', () => {
  test('all roles are properly defined', () => {
    expect(ROLES.admin).toBeDefined();
    expect(ROLES.manager).toBeDefined();
    expect(ROLES.technician).toBeDefined();
    expect(ROLES.readonly).toBeDefined();
  });

  test('role levels are hierarchical', () => {
    expect(ROLES.admin.level).toBeGreaterThan(ROLES.manager.level);
    expect(ROLES.manager.level).toBeGreaterThan(ROLES.technician.level);
    expect(ROLES.technician.level).toBeGreaterThan(ROLES.readonly.level);
  });
});

describe('Permission Assignments', () => {
  test('admin has all permissions', () => {
    const adminPermissions = ROLE_PERMISSIONS.admin;
    expect(adminPermissions.length).toBeGreaterThan(0);
    expect(adminPermissions).toContain(Permission.DELETE_USERS);
    expect(adminPermissions).toContain(Permission.MANAGE_ROLES);
  });

  test('manager has project and client management permissions', () => {
    const managerPermissions = ROLE_PERMISSIONS.manager;
    expect(managerPermissions).toContain(Permission.CREATE_PROJECTS);
    expect(managerPermissions).toContain(Permission.CREATE_CLIENTS);
    expect(managerPermissions).toContain(Permission.VIEW_ALL_TASKS);
  });

  test('technician has limited permissions', () => {
    const techPermissions = ROLE_PERMISSIONS.technician;
    expect(techPermissions).toContain(Permission.VIEW_ASSIGNED_TASKS);
    expect(techPermissions).toContain(Permission.CREATE_TIME_LOGS);
    expect(techPermissions).not.toContain(Permission.DELETE_PROJECTS);
    expect(techPermissions).not.toContain(Permission.MANAGE_ROLES);
  });

  test('readonly has only view permissions', () => {
    const readonlyPermissions = ROLE_PERMISSIONS.readonly;
    expect(readonlyPermissions).toContain(Permission.VIEW_ALL_PROJECTS);
    expect(readonlyPermissions).not.toContain(Permission.CREATE_PROJECTS);
    expect(readonlyPermissions).not.toContain(Permission.UPDATE_PROJECTS);
    expect(readonlyPermissions).not.toContain(Permission.DELETE_PROJECTS);
  });
});

describe('User Context Management', () => {
  beforeEach(() => {
    clearUserContext();
  });

  test('sets and gets user context', () => {
    const user = {
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin' as UserRole,
    };

    setUserContext(user);
    const context = getUserContext();
    
    expect(context).toEqual(user);
  });

  test('clears user context', () => {
    const user = {
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin' as UserRole,
    };

    setUserContext(user);
    clearUserContext();
    
    expect(getUserContext()).toBeNull();
  });
});

describe('Permission Checking', () => {
  beforeEach(() => {
    clearUserContext();
  });

  test('roleHasPermission checks correctly', () => {
    expect(roleHasPermission('admin', Permission.DELETE_USERS)).toBe(true);
    expect(roleHasPermission('technician', Permission.DELETE_USERS)).toBe(false);
  });

  test('hasPermission returns false when no user context', () => {
    expect(hasPermission(Permission.VIEW_PROJECTS)).toBe(false);
  });

  test('hasPermission works with user context', () => {
    setUserContext({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(hasPermission(Permission.DELETE_USERS)).toBe(true);
  });

  test('hasAnyPermission checks multiple permissions', () => {
    setUserContext({
      id: 'user-1',
      email: 'manager@test.com',
      role: 'manager',
    });

    expect(hasAnyPermission(
      Permission.DELETE_USERS,
      Permission.CREATE_PROJECTS
    )).toBe(true);
  });

  test('hasAllPermissions requires all permissions', () => {
    setUserContext({
      id: 'user-1',
      email: 'manager@test.com',
      role: 'manager',
    });

    expect(hasAllPermissions(
      Permission.VIEW_PROJECTS,
      Permission.CREATE_PROJECTS
    )).toBe(true);

    expect(hasAllPermissions(
      Permission.VIEW_PROJECTS,
      Permission.DELETE_USERS
    )).toBe(false);
  });
});

describe('Role Checking Utilities', () => {
  beforeEach(() => {
    clearUserContext();
  });

  test('isAdmin identifies admin users', () => {
    setUserContext({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(isAdmin()).toBe(true);
  });

  test('isAdmin returns false for non-admin', () => {
    setUserContext({
      id: 'user-1',
      email: 'tech@test.com',
      role: 'technician',
    });

    expect(isAdmin()).toBe(false);
  });

  test('isManagerOrHigher includes admin and manager', () => {
    setUserContext({
      id: 'user-1',
      email: 'manager@test.com',
      role: 'manager',
    });

    expect(isManagerOrHigher()).toBe(true);

    setUserContext({
      id: 'user-2',
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(isManagerOrHigher()).toBe(true);
  });

  test('isManagerOrHigher excludes technician and readonly', () => {
    setUserContext({
      id: 'user-1',
      email: 'tech@test.com',
      role: 'technician',
    });

    expect(isManagerOrHigher()).toBe(false);
  });
});

describe('Resource Ownership', () => {
  beforeEach(() => {
    clearUserContext();
  });

  test('isOwner checks resource ownership', () => {
    setUserContext({
      id: 'user-1',
      email: 'tech@test.com',
      role: 'technician',
    });

    expect(isOwner('user-1')).toBe(true);
    expect(isOwner('user-2')).toBe(false);
  });

  test('canAccessResource allows owner or manager', () => {
    setUserContext({
      id: 'user-1',
      email: 'tech@test.com',
      role: 'technician',
    });

    expect(canAccessResource('user-1')).toBe(true);
    expect(canAccessResource('user-2')).toBe(false);

    setUserContext({
      id: 'user-2',
      email: 'manager@test.com',
      role: 'manager',
    });

    expect(canAccessResource('user-1')).toBe(true);
  });
});

describe('Action Authorization', () => {
  beforeEach(() => {
    clearUserContext();
  });

  test('canPerformAction checks permission', () => {
    setUserContext({
      id: 'user-1',
      email: 'manager@test.com',
      role: 'manager',
    });

    expect(canPerformAction(Permission.CREATE_PROJECTS)).toBe(true);
    expect(canPerformAction(Permission.DELETE_USERS)).toBe(false);
  });

  test('canPerformAction checks ownership for own-only permissions', () => {
    setUserContext({
      id: 'user-1',
      email: 'tech@test.com',
      role: 'technician',
    });

    expect(canPerformAction(
      Permission.VIEW_OWN_TIME_LOGS,
      'user-1'
    )).toBe(true);

    expect(canPerformAction(
      Permission.VIEW_OWN_TIME_LOGS,
      'user-2'
    )).toBe(false);
  });

  test('managers can view all time logs regardless of ownership', () => {
    setUserContext({
      id: 'user-1',
      email: 'manager@test.com',
      role: 'manager',
    });

    expect(canPerformAction(
      Permission.VIEW_ALL_TIME_LOGS,
      'user-2'
    )).toBe(true);
  });
});

describe('Security Boundaries', () => {
  test('technician cannot delete projects', () => {
    setUserContext({
      id: 'user-1',
      email: 'tech@test.com',
      role: 'technician',
    });

    expect(hasPermission(Permission.DELETE_PROJECTS)).toBe(false);
  });

  test('readonly cannot create anything', () => {
    setUserContext({
      id: 'user-1',
      email: 'readonly@test.com',
      role: 'readonly',
    });

    expect(hasPermission(Permission.CREATE_PROJECTS)).toBe(false);
    expect(hasPermission(Permission.CREATE_TASKS)).toBe(false);
    expect(hasPermission(Permission.CREATE_CLIENTS)).toBe(false);
  });

  test('only admin can manage roles', () => {
    const roles: UserRole[] = ['admin', 'manager', 'technician', 'readonly'];
    
    roles.forEach(role => {
      setUserContext({
        id: 'user-1',
        email: `${role}@test.com`,
        role,
      });

      const canManageRoles = hasPermission(Permission.MANAGE_ROLES);
      expect(canManageRoles).toBe(role === 'admin');
    });
  });
});

describe('Permission Hierarchy', () => {
  test('higher roles inherit capabilities of lower roles', () => {
    const techPermissions = ROLE_PERMISSIONS.technician;
    const managerPermissions = ROLE_PERMISSIONS.manager;

    // Manager should have view capabilities that technician has
    expect(managerPermissions).toContain(Permission.VIEW_CLIENTS);
    expect(managerPermissions).toContain(Permission.VIEW_DOCUMENTS);
  });

  test('admin has superset of all permissions', () => {
    const allRoles: UserRole[] = ['manager', 'technician', 'readonly'];
    const adminPermissions = ROLE_PERMISSIONS.admin;

    allRoles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role];
      rolePermissions.forEach(permission => {
        expect(adminPermissions).toContain(permission);
      });
    });
  });
});
