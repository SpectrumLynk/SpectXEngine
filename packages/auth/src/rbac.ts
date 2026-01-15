/**
 * RBAC (Role-Based Access Control) with deny-by-default
 * System.json: authorization.model = "rbac", deny_by_default = true
 */

import { logger } from '@web-kernel/core';

export interface Permission {
    resource: string;
    action: string;
}

export class RBACService {
    // Check if user has permission (deny by default)
    hasPermission(
        userRoles: string[],
        rolePermissions: Map<string, Permission[]>,
        resource: string,
        action: string
    ): boolean {
        // Deny by default
        if (!userRoles || userRoles.length === 0) {
            logger.warn('Access denied: no roles', { resource, action });
            return false;
        }

        // Check each role for the required permission
        for (const role of userRoles) {
            const permissions = rolePermissions.get(role);
            if (!permissions) continue;

            const hasAccess = permissions.some(
                (p) => p.resource === resource && p.action === action
            );

            if (hasAccess) {
                logger.info('Access granted', { role, resource, action });
                return true;
            }
        }

        logger.warn('Access denied: insufficient permissions', {
            userRoles,
            resource,
            action,
        });
        return false;
    }

    // Require specific permission (throw on deny)
    requirePermission(
        userRoles: string[],
        rolePermissions: Map<string, Permission[]>,
        resource: string,
        action: string
    ): void {
        if (!this.hasPermission(userRoles, rolePermissions, resource, action)) {
            throw new Error(`Access denied: ${action} on ${resource}`);
        }
    }
}

export const rbacService = new RBACService();

// Example role permissions setup
export function createDefaultRoles(): Map<string, Permission[]> {
    const rolePermissions = new Map<string, Permission[]>();

    rolePermissions.set('admin', [
        { resource: '*', action: '*' }, // Admin has all permissions
    ]);

    rolePermissions.set('user', [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
        { resource: 'settings', action: 'read' },
        { resource: 'settings', action: 'update' },
    ]);

    rolePermissions.set('guest', [
        { resource: 'public', action: 'read' },
    ]);

    return rolePermissions;
}
