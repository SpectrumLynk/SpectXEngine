/**
 * JSON compliance validator
 * System.json: ai_system.governance.json_compliance_required
 * Validates changes against system.json rules
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '@web-kernel/core';

export interface SystemConfig {
    forbidden_practices: {
        list: string[];
    };
    ai_system: {
        capabilities: {
            read_files: boolean;
            modify_files: boolean;
            create_files: boolean;
            delete_files: boolean;
            execute_code: boolean;
        };
        governance: {
            json_compliance_required: boolean;
            architecture_mutation: string;
            library_addition: string;
        };
    };
}

export class JSONComplianceValidator {
    private systemConfig: SystemConfig | null = null;

    loadSystemConfig(configPath: string): void {
        try {
            const content = readFileSync(configPath, 'utf-8');
            this.systemConfig = JSON.parse(content) as SystemConfig;
            logger.info('System config loaded', { path: configPath });
        } catch (error) {
            logger.error('Failed to load system config', error as Error);
            throw error;
        }
    }

    canPerformOperation(operation: 'read' | 'modify' | 'create' | 'delete' | 'execute'): boolean {
        if (!this.systemConfig) {
            logger.warn('System config not loaded, denying operation');
            return false;
        }

        const capabilities = this.systemConfig.ai_system.capabilities;
        const fieldMap = {
            read: capabilities.read_files,
            modify: capabilities.modify_files,
            create: capabilities.create_files,
            delete: capabilities.delete_files,
            execute: capabilities.execute_code,
        };

        const allowed = fieldMap[operation];
        logger.info('Operation permission check', { operation, allowed });
        return allowed;
    }

    isArchitectureMutationAllowed(): boolean {
        if (!this.systemConfig) return false;

        const governance = this.systemConfig.ai_system.governance;
        const isAllowed = governance.architecture_mutation !== 'forbidden';

        logger.warn('Architecture mutation check', { allowed: isAllowed });
        return isAllowed;
    }

    requiresApprovalForLibrary(): boolean {
        if (!this.systemConfig) return true;

        const governance = this.systemConfig.ai_system.governance;
        return governance.library_addition === 'requires_json_approval';
    }

    validateAgainstForbiddenPractices(practice: string): boolean {
        if (!this.systemConfig) return false;

        const forbidden = this.systemConfig.forbidden_practices.list;
        const isForbidden = forbidden.includes(practice);

        if (isForbidden) {
            logger.error('Forbidden practice detected', undefined, { practice });
        }

        return !isForbidden;
    }

    getForbiddenPractices(): string[] {
        if (!this.systemConfig) return [];
        return this.systemConfig.forbidden_practices.list;
    }
}

export const complianceValidator = new JSONComplianceValidator();

// Load system.json on initialization
const systemJsonPath = join(process.cwd(), '../../system.json');
try {
    complianceValidator.loadSystemConfig(systemJsonPath);
} catch {
    logger.warn('Could not auto-load system.json from default path');
}
