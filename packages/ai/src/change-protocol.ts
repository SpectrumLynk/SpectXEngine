/**
 * Change protocol enforcer
 * System.json: ai_system.change_protocol
 * Enforces multi-file updates, test requirements, and rollback on violations
 */

import { logger } from '@web-kernel/core';

export interface FileChange {
    path: string;
    type: 'create' | 'modify' | 'delete';
    content?: string;
}

export interface ChangeRequest {
    changes: FileChange[];
    description: string;
    dependencyAnalysis: boolean;
    testsIncluded: boolean;
}

export class ChangeProtocol {
    validateChangeRequest(request: ChangeRequest): {
        valid: boolean;
        violations: string[];
    } {
        const violations: string[] = [];

        // Dependency analysis required
        if (!request.dependencyAnalysis) {
            violations.push('Dependency analysis is mandatory for all changes');
        }

        // Multi-file updates mandatory for dependencies
        if (request.changes.length === 1 && this.hasDependencies(request.changes[0])) {
            violations.push('Single-file change detected with dependencies. Multi-file update required.');
        }

        // Tests update required
        if (!request.testsIncluded) {
            violations.push('Test updates are mandatory for all code changes');
        }

        const valid = violations.length === 0;

        if (!valid) {
            logger.error('Change request validation failed', undefined, {
                violations,
                description: request.description,
            });
        } else {
            logger.info('Change request validated successfully', {
                filesChanged: request.changes.length,
            });
        }

        return { valid, violations };
    }

    private hasDependencies(change: FileChange): boolean {
        // Simplified dependency detection
        // In production, this would use AST analysis
        if (!change.content) return false;

        const importPattern = /^import .* from ['"].*['"];?$/gm;
        const requirePattern = /require\(['"].*['"]\)/g;

        return importPattern.test(change.content) || requirePattern.test(change.content);
    }

    async rollback(changes: FileChange[]): Promise<void> {
        logger.warn('Rolling back changes due to violation', {
            filesAffected: changes.length,
        });

        // In production, this would restore from backup
        for (const change of changes) {
            logger.info('Rollback file', { path: change.path, type: change.type });
        }
    }

    generateChangeReport(request: ChangeRequest): string {
        return `
# Change Report

## Description
${request.description}

## Files Changed (${request.changes.length})
${request.changes
                .map((c) => `- ${c.type.toUpperCase()}: ${c.path}`)
                .join('\n')}

## Dependency Analysis
${request.dependencyAnalysis ? '✓ Completed' : '✗ Not performed'}

## Tests Included
${request.testsIncluded ? '✓ Yes' : '✗ No'}
    `.trim();
    }
}

export const changeProtocol = new ChangeProtocol();
