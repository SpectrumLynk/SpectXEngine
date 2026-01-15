/**
 * Immutable audit logging
 * System.json: authentication_and_security.audit
 */

import { logger } from '../observability/logger';

export interface AuditEntry {
    id: string;
    timestamp: Date;
    userId?: string;
    action: string;
    resource: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
}

class AuditLogger {
    private logs: AuditEntry[] = [];

    log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
        const auditEntry: AuditEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            ...entry,
        };

        // Immutable - only append, never modify
        this.logs.push(auditEntry);

        logger.info('Audit log entry created', {
            auditId: auditEntry.id,
            action: auditEntry.action,
            resource: auditEntry.resource,
            userId: auditEntry.userId,
            success: auditEntry.success,
        });
    }

    // Query audit logs (read-only)
    query(filters: {
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
    }): AuditEntry[] {
        return this.logs.filter((entry) => {
            if (filters.userId && entry.userId !== filters.userId) return false;
            if (filters.action && entry.action !== filters.action) return false;
            if (filters.resource && entry.resource !== filters.resource) return false;
            if (filters.startDate && entry.timestamp < filters.startDate) return false;
            if (filters.endDate && entry.timestamp > filters.endDate) return false;
            return true;
        });
    }

    getById(id: string): AuditEntry | undefined {
        return this.logs.find((entry) => entry.id === id);
    }

    // No delete or update methods - immutable by design
}

export const auditLogger = new AuditLogger();
