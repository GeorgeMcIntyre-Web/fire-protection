/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines roles, permissions, and access control utilities.
 * 
 * Roles:
 * - admin: Full access to all features
 * - manager: Project management, client management, view team data
 * - technician: Time logging, task updates, view assigned projects
 * - readonly: View-only access for reporting
 */

import { supabase } from './supabase';

// ============================================
// ROLE DEFINITIONS
// ============================================

export type UserRole = 'admin' | 'manager' | 'technician' | 'readonly';

export interface RoleDefinition {
  name: string;
  description: string;
  level: number; // Higher level = more permissions
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  admin: {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    level: 4,
  },
  manager: {
    name: 'Project Manager',
    description: 'Manage projects, clients, and team assignments',
    level: 3,
  },
  technician: {
    name: 'Field Technician',
    description: 'Log time, update tasks, view assigned projects',
    level: 2,
  },
  readonly: {
    name: 'Read-Only',
    description: 'View-only access for reporting and analytics',
    level: 1,
  },
};

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export const Permission = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Project Management
  VIEW_ALL_PROJECTS: 'view_all_projects',
  VIEW_ASSIGNED_PROJECTS: 'view_assigned_projects',
  CREATE_PROJECTS: 'create_projects',
  UPDATE_PROJECTS: 'update_projects',
  DELETE_PROJECTS: 'delete_projects',
  ARCHIVE_PROJECTS: 'archive_projects',
  
  // Task Management
  VIEW_ALL_TASKS: 'view_all_tasks',
  VIEW_ASSIGNED_TASKS: 'view_assigned_tasks',
  CREATE_TASKS: 'create_tasks',
  UPDATE_TASKS: 'update_tasks',
  DELETE_TASKS: 'delete_tasks',
  ASSIGN_TASKS: 'assign_tasks',
  
  // Client Management
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENTS: 'create_clients',
  UPDATE_CLIENTS: 'update_clients',
  DELETE_CLIENTS: 'delete_clients',
  
  // Time Tracking
  VIEW_ALL_TIME_LOGS: 'view_all_time_logs',
  VIEW_OWN_TIME_LOGS: 'view_own_time_logs',
  CREATE_TIME_LOGS: 'create_time_logs',
  UPDATE_TIME_LOGS: 'update_time_logs',
  DELETE_TIME_LOGS: 'delete_time_logs',
  APPROVE_TIME_LOGS: 'approve_time_logs',
  
  // Work Documentation
  VIEW_ALL_WORK_DOCS: 'view_all_work_docs',
  VIEW_OWN_WORK_DOCS: 'view_own_work_docs',
  CREATE_WORK_DOCS: 'create_work_docs',
  UPDATE_WORK_DOCS: 'update_work_docs',
  DELETE_WORK_DOCS: 'delete_work_docs',
  
  // Document Library
  VIEW_DOCUMENTS: 'view_documents',
  UPLOAD_DOCUMENTS: 'upload_documents',
  UPDATE_DOCUMENTS: 'update_documents',
  DELETE_DOCUMENTS: 'delete_documents',
  MANAGE_CATEGORIES: 'manage_categories',
  
  // Reports & Analytics
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  VIEW_ANALYTICS: 'view_analytics',
  
  // System Settings
  VIEW_SETTINGS: 'view_settings',
  UPDATE_SETTINGS: 'update_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

// ============================================
// ROLE-PERMISSION MAPPING
// ============================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    ...Object.values(Permission),
  ],
  
  manager: [
    // User Management (view only)
    Permission.VIEW_USERS,
    
    // Project Management (full)
    Permission.VIEW_ALL_PROJECTS,
    Permission.CREATE_PROJECTS,
    Permission.UPDATE_PROJECTS,
    Permission.DELETE_PROJECTS,
    Permission.ARCHIVE_PROJECTS,
    
    // Task Management (full)
    Permission.VIEW_ALL_TASKS,
    Permission.CREATE_TASKS,
    Permission.UPDATE_TASKS,
    Permission.DELETE_TASKS,
    Permission.ASSIGN_TASKS,
    
    // Client Management (full)
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.UPDATE_CLIENTS,
    Permission.DELETE_CLIENTS,
    
    // Time Tracking (view all, approve)
    Permission.VIEW_ALL_TIME_LOGS,
    Permission.VIEW_OWN_TIME_LOGS,
    Permission.CREATE_TIME_LOGS,
    Permission.UPDATE_TIME_LOGS,
    Permission.APPROVE_TIME_LOGS,
    
    // Work Documentation (view all)
    Permission.VIEW_ALL_WORK_DOCS,
    Permission.VIEW_OWN_WORK_DOCS,
    Permission.CREATE_WORK_DOCS,
    Permission.UPDATE_WORK_DOCS,
    
    // Document Library
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.UPDATE_DOCUMENTS,
    
    // Reports & Analytics
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_ANALYTICS,
    
    // Settings (view only)
    Permission.VIEW_SETTINGS,
  ],
  
  technician: [
    // User Management (none)
    
    // Project Management (view assigned only)
    Permission.VIEW_ASSIGNED_PROJECTS,
    
    // Task Management (view and update assigned)
    Permission.VIEW_ASSIGNED_TASKS,
    Permission.UPDATE_TASKS,
    
    // Client Management (view only)
    Permission.VIEW_CLIENTS,
    
    // Time Tracking (own only)
    Permission.VIEW_OWN_TIME_LOGS,
    Permission.CREATE_TIME_LOGS,
    Permission.UPDATE_TIME_LOGS,
    
    // Work Documentation (own only)
    Permission.VIEW_OWN_WORK_DOCS,
    Permission.CREATE_WORK_DOCS,
    Permission.UPDATE_WORK_DOCS,
    
    // Document Library (view only)
    Permission.VIEW_DOCUMENTS,
    
    // Reports (view own data)
    Permission.VIEW_REPORTS,
  ],
  
  readonly: [
    // View-only access
    Permission.VIEW_ALL_PROJECTS,
    Permission.VIEW_ALL_TASKS,
    Permission.VIEW_CLIENTS,
    Permission.VIEW_ALL_TIME_LOGS,
    Permission.VIEW_ALL_WORK_DOCS,
    Permission.VIEW_DOCUMENTS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_ANALYTICS,
  ],
};

// ============================================
// USER CONTEXT
// ============================================

export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

let currentUserContext: UserContext | null = null;

/**
 * Sets the current user context
 */
export function setUserContext(user: UserContext): void {
  currentUserContext = user;
}

/**
 * Gets the current user context
 */
export function getUserContext(): UserContext | null {
  return currentUserContext;
}

/**
 * Clears the user context
 */
export function clearUserContext(): void {
  currentUserContext = null;
}

/**
 * Loads user context from Supabase
 */
export async function loadUserContext(): Promise<UserContext | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Get user profile with role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error || !profile) return null;
    
    const userContext: UserContext = {
      id: user.id,
      email: user.email!,
      role: profile.role as UserRole,
      fullName: profile.full_name || undefined,
    };
    
    setUserContext(userContext);
    return userContext;
  } catch (error) {
    console.error('Failed to load user context:', error);
    return null;
  }
}

// ============================================
// PERMISSION CHECKING
// ============================================

/**
 * Checks if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Checks if the current user has a specific permission
 */
export function hasPermission(permission: Permission): boolean {
  const user = getUserContext();
  if (!user) return false;
  
  return roleHasPermission(user.role, permission);
}

/**
 * Checks if the current user has any of the specified permissions
 */
export function hasAnyPermission(...permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(permission));
}

/**
 * Checks if the current user has all of the specified permissions
 */
export function hasAllPermissions(...permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(permission));
}

/**
 * Checks if user has permission or throws error
 */
export function requirePermission(permission: Permission): void {
  if (!hasPermission(permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Checks if user has role at or above specified level
 */
export function hasRoleLevel(minimumLevel: number): boolean {
  const user = getUserContext();
  if (!user) return false;
  
  return ROLES[user.role].level >= minimumLevel;
}

/**
 * Checks if user is an admin
 */
export function isAdmin(): boolean {
  const user = getUserContext();
  return user?.role === 'admin';
}

/**
 * Checks if user is a manager or higher
 */
export function isManagerOrHigher(): boolean {
  const user = getUserContext();
  if (!user) return false;
  
  return ['admin', 'manager'].includes(user.role);
}

// ============================================
// RESOURCE OWNERSHIP
// ============================================

/**
 * Checks if user owns a resource
 */
export function isOwner(resourceUserId: string): boolean {
  const user = getUserContext();
  if (!user) return false;
  
  return user.id === resourceUserId;
}

/**
 * Checks if user can access a resource (owns it or has admin/manager role)
 */
export function canAccessResource(resourceUserId: string): boolean {
  return isOwner(resourceUserId) || isManagerOrHigher();
}

/**
 * Checks if user is assigned to a resource
 */
export function isAssignedTo(assignedUserId: string | null): boolean {
  const user = getUserContext();
  if (!user) return false;
  
  return user.id === assignedUserId;
}

// ============================================
// PERMISSION UTILITIES
// ============================================

/**
 * Gets all permissions for current user's role
 */
export function getUserPermissions(): Permission[] {
  const user = getUserContext();
  if (!user) return [];
  
  return ROLE_PERMISSIONS[user.role];
}

/**
 * Gets role definition for current user
 */
export function getUserRole(): RoleDefinition | null {
  const user = getUserContext();
  if (!user) return null;
  
  return ROLES[user.role];
}

/**
 * Checks if user can perform an action on a resource
 */
export function canPerformAction(
  action: string,
  resourceOwnerId?: string
): boolean {
  // Check if user has the permission
  if (!hasPermission(action as any)) {
    return false;
  }
  
  // If resource owner is specified, check ownership for "own" permissions
  if (resourceOwnerId) {
    const ownOnlyPermissions = [
      Permission.VIEW_OWN_TIME_LOGS,
      Permission.VIEW_OWN_WORK_DOCS,
    ];
    
    if (ownOnlyPermissions.includes(action as any) && !isOwner(resourceOwnerId)) {
      // User doesn't own the resource, check if they have "all" permission
      const allPermissionMap: Record<string, string> = {
        [Permission.VIEW_OWN_TIME_LOGS]: Permission.VIEW_ALL_TIME_LOGS,
        [Permission.VIEW_OWN_WORK_DOCS]: Permission.VIEW_ALL_WORK_DOCS,
      };
      
      const allPermission = allPermissionMap[action];
      return allPermission ? hasPermission(allPermission as any) : false;
    }
  }
  
  return true;
}

// ============================================
// AUTHORIZATION MIDDLEWARE
// ============================================

/**
 * Creates an authorization middleware function
 */
export function createAuthMiddleware(requiredPermission: Permission) {
  return async (): Promise<boolean> => {
    // Load user context if not already loaded
    if (!getUserContext()) {
      await loadUserContext();
    }
    
    return hasPermission(requiredPermission);
  };
}

/**
 * Authorization decorator for async functions
 */
export function requireAuth(
  ...permissions: Array<string>
): MethodDecorator {
  return function (
    _target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Check permissions
      const hasRequiredPermissions = permissions.every(permission =>
        hasPermission(permission as any)
      );
      
      if (!hasRequiredPermissions) {
        throw new Error(
          `Unauthorized: Missing required permissions for ${String(propertyKey)}`
        );
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// ============================================
// ROLE MANAGEMENT
// ============================================

/**
 * Updates user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if current user has permission
    if (!hasPermission(Permission.MANAGE_ROLES)) {
      return { success: false, error: 'Permission denied' };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Gets all users with their roles (admin/manager only)
 */
export async function getUsersWithRoles(): Promise<{
  success: boolean;
  users?: Array<{ id: string; email: string; role: UserRole; fullName?: string }>;
  error?: string;
}> {
  try {
    // Check permission
    if (!hasPermission(Permission.VIEW_USERS)) {
      return { success: false, error: 'Permission denied' };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .order('email');
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    const users = data.map(profile => ({
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      fullName: profile.full_name || undefined,
    }));
    
    return { success: true, users };
  } catch (error) {
    return { success: false, error: 'Failed to get users' };
  }
}

// ============================================
// PERMISSION SUMMARY
// ============================================

/**
 * Gets a human-readable summary of permissions for a role
 */
export function getPermissionSummary(role: UserRole): string[] {
  const permissions = ROLE_PERMISSIONS[role];
  const summary: string[] = [];
  
  // Group permissions by category
  const categories: Record<string, Permission[]> = {
    'User Management': [],
    'Project Management': [],
    'Task Management': [],
    'Client Management': [],
    'Time Tracking': [],
    'Work Documentation': [],
    'Document Library': [],
    'Reports & Analytics': [],
    'System Settings': [],
  };
  
  permissions.forEach(permission => {
    if (permission.includes('user')) {
      categories['User Management'].push(permission);
    } else if (permission.includes('project')) {
      categories['Project Management'].push(permission);
    } else if (permission.includes('task')) {
      categories['Task Management'].push(permission);
    } else if (permission.includes('client')) {
      categories['Client Management'].push(permission);
    } else if (permission.includes('time')) {
      categories['Time Tracking'].push(permission);
    } else if (permission.includes('work')) {
      categories['Work Documentation'].push(permission);
    } else if (permission.includes('document') || permission.includes('categories')) {
      categories['Document Library'].push(permission);
    } else if (permission.includes('report') || permission.includes('analytics') || permission.includes('export')) {
      categories['Reports & Analytics'].push(permission);
    } else if (permission.includes('settings') || permission.includes('audit')) {
      categories['System Settings'].push(permission);
    }
  });
  
  Object.entries(categories).forEach(([category, perms]) => {
    if (perms.length > 0) {
      summary.push(`${category}: ${perms.length} permissions`);
    }
  });
  
  return summary;
}

// ============================================
// EXPORT UTILITIES
// ============================================

export default {
  ROLES,
  ROLE_PERMISSIONS,
  Permission,
  setUserContext,
  getUserContext,
  clearUserContext,
  loadUserContext,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  isAdmin,
  isManagerOrHigher,
  isOwner,
  canAccessResource,
  canPerformAction,
  updateUserRole,
  getUsersWithRoles,
  getPermissionSummary,
};
